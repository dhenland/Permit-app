"""
Florida Municipal Planning & Zoning PDF Scanner

Crawls municipal websites, discovers PDF documents related to planning
and zoning, downloads them, extracts text, and identifies relevant
approvals and actions.
"""

import hashlib
import json
import logging
import os
import re
import time
from datetime import datetime, timezone
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

from config import (
    MAX_PDF_SIZE_BYTES,
    MUNICIPALITIES,
    OUTPUT_DIR,
    PDF_CACHE_DIR,
    REQUEST_TIMEOUT,
    USER_AGENT,
    ZONING_KEYWORDS,
)

logger = logging.getLogger(__name__)


class MunicipalPDFScanner:
    """Scans Florida municipal websites for planning & zoning PDFs."""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/pdf",
        })
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        os.makedirs(PDF_CACHE_DIR, exist_ok=True)

    def scan_all_municipalities(self):
        """Scan all configured municipalities and return results."""
        scan_time = datetime.now(timezone.utc)
        results = []

        for municipality in MUNICIPALITIES:
            logger.info("Scanning %s (%s County)...", municipality["name"], municipality["county"])
            try:
                result = self._scan_municipality(municipality)
                results.append(result)
            except Exception as e:
                logger.error("Error scanning %s: %s", municipality["name"], e)
                results.append({
                    "municipality": municipality["name"],
                    "county": municipality["county"],
                    "region": municipality["region"],
                    "scan_time": scan_time.isoformat(),
                    "status": "error",
                    "error": str(e),
                    "documents": [],
                    "summary": f"Scan failed: {e}",
                })

            # Be polite to servers
            time.sleep(2)

        return {
            "scan_time": scan_time.isoformat(),
            "scan_date": scan_time.strftime("%Y-%m-%d"),
            "total_municipalities": len(MUNICIPALITIES),
            "successful_scans": sum(1 for r in results if r.get("status") != "error"),
            "total_documents_found": sum(len(r.get("documents", [])) for r in results),
            "municipalities": results,
        }

    def _scan_municipality(self, municipality):
        """Scan a single municipality's planning pages for PDFs."""
        scan_time = datetime.now(timezone.utc)
        all_pdf_links = []

        for url in municipality["planning_urls"]:
            try:
                pdf_links = self._discover_pdfs(url, municipality["search_patterns"])
                all_pdf_links.extend(pdf_links)
            except requests.RequestException as e:
                logger.warning("Failed to fetch %s: %s", url, e)

        # Deduplicate by URL
        seen_urls = set()
        unique_pdfs = []
        for pdf in all_pdf_links:
            if pdf["url"] not in seen_urls:
                seen_urls.add(pdf["url"])
                unique_pdfs.append(pdf)

        # Download and analyze each PDF
        documents = []
        for pdf_info in unique_pdfs[:15]:  # Limit to 15 PDFs per municipality
            try:
                doc = self._process_pdf(pdf_info, municipality)
                if doc and doc.get("is_relevant"):
                    documents.append(doc)
            except Exception as e:
                logger.warning("Failed to process PDF %s: %s", pdf_info["url"], e)

        # Generate summary
        summary = self._generate_municipality_summary(municipality, documents)

        return {
            "municipality": municipality["name"],
            "county": municipality["county"],
            "region": municipality["region"],
            "scan_time": scan_time.isoformat(),
            "status": "success",
            "pages_scanned": len(municipality["planning_urls"]),
            "pdfs_discovered": len(unique_pdfs),
            "relevant_documents": len(documents),
            "documents": documents,
            "summary": summary,
        }

    def _discover_pdfs(self, page_url, search_patterns):
        """Find PDF links on a web page."""
        try:
            response = self.session.get(page_url, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
        except requests.RequestException as e:
            logger.warning("Could not fetch %s: %s", page_url, e)
            return []

        soup = BeautifulSoup(response.text, "lxml")
        pdf_links = []

        for link in soup.find_all("a", href=True):
            href = link["href"].strip()
            link_text = link.get_text(strip=True).lower()
            full_url = urljoin(page_url, href)

            # Check if link points to a PDF
            is_pdf = (
                href.lower().endswith(".pdf")
                or "pdf" in href.lower()
                or link_text.endswith("(pdf)")
            )

            if not is_pdf:
                continue

            # Check if link text or URL matches any search patterns
            matches_pattern = any(
                pattern.lower() in link_text or pattern.lower() in href.lower()
                for pattern in search_patterns
            )

            # Also check for zoning keywords in link text
            matches_zoning = any(
                kw in link_text for kw in ZONING_KEYWORDS
            )

            if matches_pattern or matches_zoning:
                pdf_links.append({
                    "url": full_url,
                    "link_text": link.get_text(strip=True),
                    "source_page": page_url,
                    "matched_pattern": matches_pattern,
                    "matched_zoning_keyword": matches_zoning,
                })

        return pdf_links

    def _process_pdf(self, pdf_info, municipality):
        """Download a PDF, extract text, and analyze for zoning content."""
        url = pdf_info["url"]
        url_hash = hashlib.sha256(url.encode()).hexdigest()[:16]
        cache_path = os.path.join(PDF_CACHE_DIR, f"{url_hash}.pdf")
        text_cache_path = os.path.join(PDF_CACHE_DIR, f"{url_hash}.txt")

        # Download PDF if not cached
        if not os.path.exists(cache_path):
            try:
                response = self.session.get(url, timeout=REQUEST_TIMEOUT, stream=True)
                response.raise_for_status()

                content_length = int(response.headers.get("content-length", 0))
                if content_length > MAX_PDF_SIZE_BYTES:
                    logger.info("Skipping oversized PDF: %s (%d bytes)", url, content_length)
                    return None

                # Download with size limit
                content = b""
                for chunk in response.iter_content(chunk_size=8192):
                    content += chunk
                    if len(content) > MAX_PDF_SIZE_BYTES:
                        logger.info("PDF exceeds size limit, stopping: %s", url)
                        return None

                with open(cache_path, "wb") as f:
                    f.write(content)

            except requests.RequestException as e:
                logger.warning("Failed to download %s: %s", url, e)
                return None

        # Extract text from PDF
        text = self._extract_pdf_text(cache_path, text_cache_path)
        if not text:
            return None

        # Analyze content for planning/zoning relevance
        analysis = self._analyze_content(text, pdf_info)

        return {
            "title": pdf_info["link_text"] or os.path.basename(urlparse(url).path),
            "url": url,
            "source_page": pdf_info["source_page"],
            "municipality": municipality["name"],
            "county": municipality["county"],
            "is_relevant": analysis["is_relevant"],
            "relevance_score": analysis["relevance_score"],
            "matched_keywords": analysis["matched_keywords"],
            "document_type": analysis["document_type"],
            "actions_found": analysis["actions_found"],
            "extracted_details": analysis["details"],
        }

    def _extract_pdf_text(self, pdf_path, text_cache_path):
        """Extract text content from a PDF file."""
        # Check text cache first
        if os.path.exists(text_cache_path):
            with open(text_cache_path, "r", encoding="utf-8") as f:
                return f.read()

        text = ""

        # Try pdfplumber first (better for tables/structured data)
        try:
            import pdfplumber
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages[:50]:  # Limit to first 50 pages
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception:
            pass

        # Fallback to PyPDF2
        if not text:
            try:
                from PyPDF2 import PdfReader
                reader = PdfReader(pdf_path)
                for page in reader.pages[:50]:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            except Exception as e:
                logger.warning("Failed to extract text from %s: %s", pdf_path, e)
                return None

        # Cache extracted text
        if text:
            with open(text_cache_path, "w", encoding="utf-8") as f:
                f.write(text)

        return text

    def _analyze_content(self, text, pdf_info):
        """Analyze PDF text content for planning & zoning relevance."""
        text_lower = text.lower()

        # Find matching keywords
        matched_keywords = []
        for keyword in ZONING_KEYWORDS:
            if keyword in text_lower:
                matched_keywords.append(keyword)

        # Calculate relevance score (0-100)
        relevance_score = min(len(matched_keywords) * 10, 100)

        # Boost score for certain high-value terms
        high_value = ["rezoning", "site plan approval", "development order",
                      "plat approval", "conditional use", "variance"]
        for term in high_value:
            if term in text_lower:
                relevance_score = min(relevance_score + 15, 100)

        is_relevant = relevance_score >= 20

        # Determine document type
        document_type = self._classify_document(text_lower, pdf_info)

        # Extract specific actions/approvals
        actions_found = self._extract_actions(text)

        # Extract project details
        details = self._extract_details(text)

        return {
            "is_relevant": is_relevant,
            "relevance_score": relevance_score,
            "matched_keywords": matched_keywords[:20],
            "document_type": document_type,
            "actions_found": actions_found,
            "details": details,
        }

    def _classify_document(self, text_lower, pdf_info):
        """Classify the type of planning/zoning document."""
        link_text = pdf_info.get("link_text", "").lower()
        combined = text_lower[:2000] + " " + link_text

        if "agenda" in combined:
            return "Meeting Agenda"
        elif "minute" in combined:
            return "Meeting Minutes"
        elif "staff report" in combined:
            return "Staff Report"
        elif "resolution" in combined:
            return "Resolution"
        elif "ordinance" in combined:
            return "Ordinance"
        elif "site plan" in combined:
            return "Site Plan Review"
        elif "plat" in combined:
            return "Plat Document"
        elif "variance" in combined or "appeal" in combined:
            return "Variance/Appeal"
        elif "comprehensive plan" in combined or "comp plan" in combined:
            return "Comprehensive Plan"
        else:
            return "Planning Document"

    def _extract_actions(self, text):
        """Extract specific planning/zoning actions from document text."""
        actions = []

        # Patterns for common approval actions
        action_patterns = [
            (r"(?:approved|approval of)\s+(?:the\s+)?(.{10,120}?)(?:\.|;|\n)",
             "Approved"),
            (r"(?:denied|denial of)\s+(?:the\s+)?(.{10,120}?)(?:\.|;|\n)",
             "Denied"),
            (r"(?:tabled|deferred|continued)\s+(?:the\s+)?(.{10,120}?)(?:\.|;|\n)",
             "Deferred"),
            (r"(?:recommend(?:ed|s)?(?:\s+approval)?)\s+(?:of\s+)?(?:the\s+)?(.{10,120}?)(?:\.|;|\n)",
             "Recommended"),
            (r"(?:public hearing)\s+(?:on|for|regarding)\s+(.{10,120}?)(?:\.|;|\n)",
             "Public Hearing"),
            (r"(?:rezoning)\s+(?:of|from|request)\s+(.{10,120}?)(?:\.|;|\n)",
             "Rezoning"),
            (r"(?:site plan)\s+(?:for|approval|review)\s+(.{10,120}?)(?:\.|;|\n)",
             "Site Plan"),
            (r"(?:variance)\s+(?:for|to|from)\s+(.{10,120}?)(?:\.|;|\n)",
             "Variance"),
        ]

        for pattern, action_type in action_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches[:5]:  # Limit matches per pattern
                clean = re.sub(r"\s+", " ", match).strip()
                if len(clean) > 10:
                    actions.append({
                        "type": action_type,
                        "description": clean[:200],
                    })

        # Deduplicate
        seen = set()
        unique_actions = []
        for action in actions:
            key = (action["type"], action["description"][:50])
            if key not in seen:
                seen.add(key)
                unique_actions.append(action)

        return unique_actions[:20]

    def _extract_details(self, text):
        """Extract project details like addresses, case numbers, applicants."""
        details = {}

        # Case/application numbers
        case_patterns = [
            r"(?:case|application|file)\s*(?:no|number|#|num)?\.?\s*[:.]?\s*([A-Z0-9][\w\-/.]{3,20})",
            r"(?:PZ|ZON|SUB|SP|CU|VAR|DEV)[\-\s]?\d{2,}[\-\w]*",
        ]
        cases = []
        for pattern in case_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            cases.extend(matches[:5])
        if cases:
            details["case_numbers"] = list(set(cases))[:10]

        # Addresses
        address_pattern = r"\d{1,6}\s+(?:[NSEW]\.?\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:St|Street|Ave|Avenue|Blvd|Boulevard|Dr|Drive|Rd|Road|Ln|Lane|Way|Ct|Court|Pl|Place|Pkwy|Parkway)\.?"
        addresses = re.findall(address_pattern, text)
        if addresses:
            details["addresses"] = list(set(addresses))[:5]

        # Acreage
        acreage_pattern = r"(\d+\.?\d*)\s*(?:acres?|ac\.?)"
        acreages = re.findall(acreage_pattern, text, re.IGNORECASE)
        if acreages:
            details["acreage"] = [float(a) for a in acreages[:5]]

        # Unit counts
        unit_pattern = r"(\d+)\s*(?:units?|lots?|dwelling)"
        units = re.findall(unit_pattern, text, re.IGNORECASE)
        if units:
            details["units"] = [int(u) for u in units[:5]]

        return details

    def _generate_municipality_summary(self, municipality, documents):
        """Generate a human-readable summary for a municipality's scan."""
        if not documents:
            return f"No new planning/zoning documents found for {municipality['name']}."

        doc_types = {}
        all_actions = []
        for doc in documents:
            doc_type = doc.get("document_type", "Unknown")
            doc_types[doc_type] = doc_types.get(doc_type, 0) + 1
            all_actions.extend(doc.get("actions_found", []))

        parts = [
            f"{municipality['name']} ({municipality['county']} County): "
            f"Found {len(documents)} relevant document(s)."
        ]

        if doc_types:
            type_strs = [f"{count} {dtype}" for dtype, count in doc_types.items()]
            parts.append("Types: " + ", ".join(type_strs) + ".")

        # Summarize key actions
        action_types = {}
        for action in all_actions:
            atype = action["type"]
            action_types[atype] = action_types.get(atype, 0) + 1

        if action_types:
            action_strs = [f"{count} {atype}" for atype, count in action_types.items()]
            parts.append("Actions: " + ", ".join(action_strs) + ".")

        return " ".join(parts)


def run_scan():
    """Execute a full scan and save results."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    scanner = MunicipalPDFScanner()
    logger.info("Starting Florida Municipal Planning & Zoning scan...")

    results = scanner.scan_all_municipalities()

    # Save JSON results
    date_str = datetime.now().strftime("%Y-%m-%d")
    output_file = os.path.join(OUTPUT_DIR, f"scan_{date_str}.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    logger.info(
        "Scan complete. %d/%d municipalities scanned, %d documents found. Results: %s",
        results["successful_scans"],
        results["total_municipalities"],
        results["total_documents_found"],
        output_file,
    )

    # Also generate the latest.json symlink/copy for the frontend
    latest_file = os.path.join(OUTPUT_DIR, "latest.json")
    with open(latest_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    return results


if __name__ == "__main__":
    run_scan()
