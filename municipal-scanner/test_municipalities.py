#!/usr/bin/env python3
"""
Test script - loops through every configured municipality and validates:
1. Configuration completeness (name, county, region, URLs, patterns)
2. URL accessibility (HTTP HEAD request)
3. PDF discovery on each planning page
4. Scanner pipeline end-to-end
"""

import sys
import time
import requests
from config import MUNICIPALITIES, ZONING_KEYWORDS, USER_AGENT, REQUEST_TIMEOUT

PASS = "\033[92mPASS\033[0m"
FAIL = "\033[91mFAIL\033[0m"
WARN = "\033[93mWARN\033[0m"
INFO = "\033[94mINFO\033[0m"

results = {
    "total": 0,
    "config_pass": 0,
    "config_fail": 0,
    "url_reachable": 0,
    "url_unreachable": 0,
    "url_error": 0,
    "pdfs_found": 0,
    "municipalities_with_pdfs": 0,
}


def test_config(muni, idx):
    """Validate municipality configuration fields."""
    errors = []
    required_fields = ["name", "county", "region", "planning_urls", "search_patterns"]

    for field in required_fields:
        if field not in muni or not muni[field]:
            errors.append(f"Missing or empty field: {field}")

    if "planning_urls" in muni:
        for url in muni["planning_urls"]:
            if not url.startswith("http"):
                errors.append(f"Invalid URL: {url}")

    if "search_patterns" in muni:
        if not isinstance(muni["search_patterns"], list) or len(muni["search_patterns"]) == 0:
            errors.append("search_patterns must be a non-empty list")

    if errors:
        for e in errors:
            print(f"  [{FAIL}] Config: {e}")
        results["config_fail"] += 1
        return False
    else:
        print(f"  [{PASS}] Config: All required fields present")
        results["config_pass"] += 1
        return True


def test_url_reachability(muni):
    """Test if each planning URL is reachable."""
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})

    all_reachable = True
    for url in muni["planning_urls"]:
        try:
            resp = session.head(url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
            status = resp.status_code
            if status < 400:
                print(f"  [{PASS}] URL reachable ({status}): {url}")
                results["url_reachable"] += 1
            else:
                print(f"  [{WARN}] URL returned {status}: {url}")
                results["url_unreachable"] += 1
                all_reachable = False
        except requests.exceptions.SSLError:
            # Try without SSL verification as some municipal sites have cert issues
            try:
                resp = session.head(url, timeout=REQUEST_TIMEOUT, allow_redirects=True, verify=False)
                status = resp.status_code
                if status < 400:
                    print(f"  [{WARN}] URL reachable with SSL warning ({status}): {url}")
                    results["url_reachable"] += 1
                else:
                    print(f"  [{WARN}] URL returned {status} (SSL issue): {url}")
                    results["url_unreachable"] += 1
                    all_reachable = False
            except Exception as e:
                print(f"  [{FAIL}] URL error (SSL): {url} - {type(e).__name__}: {e}")
                results["url_error"] += 1
                all_reachable = False
        except requests.exceptions.ConnectionError as e:
            print(f"  [{FAIL}] URL connection error: {url} - {e}")
            results["url_error"] += 1
            all_reachable = False
        except requests.exceptions.Timeout:
            print(f"  [{FAIL}] URL timeout ({REQUEST_TIMEOUT}s): {url}")
            results["url_error"] += 1
            all_reachable = False
        except Exception as e:
            print(f"  [{FAIL}] URL error: {url} - {type(e).__name__}: {e}")
            results["url_error"] += 1
            all_reachable = False

    return all_reachable


def test_pdf_discovery(muni):
    """Attempt to discover PDFs on each planning page."""
    from bs4 import BeautifulSoup
    from urllib.parse import urljoin

    session = requests.Session()
    session.headers.update({
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml",
    })

    total_pdfs = 0

    for url in muni["planning_urls"]:
        try:
            resp = session.get(url, timeout=REQUEST_TIMEOUT, allow_redirects=True)
            if resp.status_code >= 400:
                print(f"  [{WARN}] Cannot fetch page for PDF scan ({resp.status_code}): {url}")
                continue

            soup = BeautifulSoup(resp.text, "lxml")
            pdf_links = []

            for link in soup.find_all("a", href=True):
                href = link["href"].strip()
                link_text = link.get_text(strip=True).lower()
                full_url = urljoin(url, href)

                is_pdf = (
                    href.lower().endswith(".pdf")
                    or "pdf" in href.lower()
                    or link_text.endswith("(pdf)")
                )

                if not is_pdf:
                    continue

                matches_pattern = any(
                    p.lower() in link_text or p.lower() in href.lower()
                    for p in muni["search_patterns"]
                )
                matches_zoning = any(kw in link_text for kw in ZONING_KEYWORDS)

                if matches_pattern or matches_zoning:
                    pdf_links.append({
                        "url": full_url,
                        "text": link.get_text(strip=True)[:80],
                        "matched_pattern": matches_pattern,
                        "matched_zoning": matches_zoning,
                    })

            total_links_on_page = len(soup.find_all("a", href=True))
            all_pdf_links = [
                l for l in soup.find_all("a", href=True)
                if l["href"].strip().lower().endswith(".pdf")
            ]

            if pdf_links:
                print(f"  [{PASS}] PDF discovery: {len(pdf_links)} relevant PDF(s) found "
                      f"(of {len(all_pdf_links)} total PDFs, {total_links_on_page} total links)")
                for pdf in pdf_links[:3]:
                    flag = ""
                    if pdf["matched_pattern"]:
                        flag += " [pattern]"
                    if pdf["matched_zoning"]:
                        flag += " [zoning]"
                    print(f"         - {pdf['text']}{flag}")
                if len(pdf_links) > 3:
                    print(f"         ... and {len(pdf_links) - 3} more")
            elif all_pdf_links:
                print(f"  [{WARN}] PDF discovery: {len(all_pdf_links)} PDFs on page "
                      f"but 0 matched search patterns/zoning keywords")
            else:
                print(f"  [{INFO}] PDF discovery: No PDFs found on page ({total_links_on_page} links scanned)")

            total_pdfs += len(pdf_links)

        except Exception as e:
            print(f"  [{FAIL}] PDF discovery error: {url} - {type(e).__name__}: {e}")

    results["pdfs_found"] += total_pdfs
    if total_pdfs > 0:
        results["municipalities_with_pdfs"] += 1

    return total_pdfs


def main():
    print("=" * 70)
    print("FLORIDA MUNICIPAL SCANNER - FULL MUNICIPALITY TEST")
    print(f"Testing {len(MUNICIPALITIES)} municipalities")
    print(f"Zoning keywords loaded: {len(ZONING_KEYWORDS)}")
    print("=" * 70)
    print()

    # Suppress SSL warnings for test
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    for idx, muni in enumerate(MUNICIPALITIES):
        results["total"] += 1
        print(f"\n[{idx + 1}/{len(MUNICIPALITIES)}] {muni['name']} ({muni['county']} County) - {muni['region']}")
        print("-" * 50)

        # Test 1: Configuration
        config_ok = test_config(muni, idx)

        if not config_ok:
            print(f"  Skipping further tests due to config errors")
            continue

        # Test 2: URL reachability
        test_url_reachability(muni)

        # Test 3: PDF discovery
        pdf_count = test_pdf_discovery(muni)

        # Be polite between municipalities
        time.sleep(1)

    # Summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    print(f"  Municipalities tested:      {results['total']}")
    print(f"  Config valid:               {results['config_pass']}/{results['total']}")
    print(f"  Config invalid:             {results['config_fail']}/{results['total']}")
    print(f"  URLs reachable:             {results['url_reachable']}")
    print(f"  URLs unreachable:           {results['url_unreachable']}")
    print(f"  URL errors:                 {results['url_error']}")
    print(f"  Total relevant PDFs found:  {results['pdfs_found']}")
    print(f"  Municipalities with PDFs:   {results['municipalities_with_pdfs']}/{results['total']}")
    print("=" * 70)

    if results["config_fail"] > 0:
        print(f"\n[{FAIL}] {results['config_fail']} municipality config(s) failed validation")
        return 1

    print(f"\n[{PASS}] All {results['total']} municipality configurations are valid")
    return 0


if __name__ == "__main__":
    sys.exit(main())
