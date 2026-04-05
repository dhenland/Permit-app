"""
HTML Report Generator for Municipal Planning & Zoning Scanner.

Generates a standalone HTML report from scan results that can be
viewed in any browser.
"""

import os
from datetime import datetime

from config import OUTPUT_DIR


def generate_daily_report(scan_results):
    """Generate an HTML daily report from scan results."""
    date_str = datetime.now().strftime("%Y-%m-%d")
    report_path = os.path.join(OUTPUT_DIR, f"report_{date_str}.html")

    municipalities = scan_results.get("municipalities", [])

    # Group by region
    regions = {}
    for muni in municipalities:
        region = muni.get("region", "Unknown")
        if region not in regions:
            regions[region] = []
        regions[region].append(muni)

    html = _build_report_html(scan_results, regions, date_str)

    with open(report_path, "w", encoding="utf-8") as f:
        f.write(html)

    # Also write as latest report
    latest_path = os.path.join(OUTPUT_DIR, "report_latest.html")
    with open(latest_path, "w", encoding="utf-8") as f:
        f.write(html)

    return report_path


def _build_report_html(scan_results, regions, date_str):
    """Build the full HTML report string."""
    total_docs = scan_results.get("total_documents_found", 0)
    successful = scan_results.get("successful_scans", 0)
    total_munis = scan_results.get("total_municipalities", 0)

    region_sections = ""
    for region_name, munis in sorted(regions.items()):
        region_docs = sum(len(m.get("documents", [])) for m in munis)
        muni_cards = ""
        for muni in munis:
            muni_cards += _build_municipality_card(muni)

        region_sections += f"""
        <div class="region-section">
            <div class="region-header">
                <h2>{_esc(region_name)}</h2>
                <span class="region-stats">{len(munis)} municipalities | {region_docs} documents</span>
            </div>
            <div class="municipality-grid">
                {muni_cards}
            </div>
        </div>
        """

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FL Municipal Planning &amp; Zoning Report - {date_str}</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f0f2f5; color: #1a1a2e; line-height: 1.5;
        }}
        .container {{ max-width: 1200px; margin: 0 auto; padding: 20px; }}
        .report-header {{
            background: linear-gradient(135deg, #0066cc, #004999);
            color: white; padding: 32px; border-radius: 16px; margin-bottom: 24px;
        }}
        .report-header h1 {{ font-size: 24px; margin-bottom: 8px; }}
        .report-header .subtitle {{ opacity: 0.9; font-size: 14px; }}
        .stats-bar {{
            display: flex; gap: 16px; margin-top: 20px; flex-wrap: wrap;
        }}
        .stat-card {{
            background: rgba(255,255,255,0.15); border-radius: 10px;
            padding: 12px 20px; flex: 1; min-width: 140px;
        }}
        .stat-card .stat-value {{ font-size: 28px; font-weight: 700; }}
        .stat-card .stat-label {{ font-size: 12px; opacity: 0.85; }}
        .region-section {{ margin-bottom: 32px; }}
        .region-header {{
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #0066cc;
        }}
        .region-header h2 {{ font-size: 20px; color: #0066cc; }}
        .region-stats {{ font-size: 13px; color: #666; }}
        .municipality-grid {{
            display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
            gap: 16px;
        }}
        .muni-card {{
            background: white; border-radius: 12px; padding: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: box-shadow 0.2s;
        }}
        .muni-card:hover {{ box-shadow: 0 4px 12px rgba(0,0,0,0.15); }}
        .muni-card-header {{
            display: flex; justify-content: space-between; align-items: flex-start;
            margin-bottom: 12px;
        }}
        .muni-name {{ font-size: 18px; font-weight: 600; }}
        .muni-county {{ font-size: 13px; color: #666; }}
        .doc-count {{
            background: #e8f0fe; color: #0066cc; padding: 4px 12px;
            border-radius: 20px; font-size: 13px; font-weight: 600;
        }}
        .doc-count.zero {{ background: #f5f5f5; color: #999; }}
        .muni-summary {{ font-size: 14px; color: #444; margin-bottom: 12px; }}
        .doc-list {{ list-style: none; }}
        .doc-item {{
            padding: 8px 0; border-top: 1px solid #f0f0f0; font-size: 13px;
        }}
        .doc-item:first-child {{ border-top: none; }}
        .doc-title {{ font-weight: 500; color: #1a1a2e; }}
        .doc-title a {{ color: #0066cc; text-decoration: none; }}
        .doc-title a:hover {{ text-decoration: underline; }}
        .doc-type {{
            display: inline-block; background: #f0f0f0; padding: 2px 8px;
            border-radius: 4px; font-size: 11px; color: #666; margin-left: 8px;
        }}
        .doc-actions {{ margin-top: 4px; color: #666; font-size: 12px; }}
        .action-badge {{
            display: inline-block; padding: 1px 6px; border-radius: 3px;
            font-size: 11px; margin-right: 4px;
        }}
        .action-badge.approved {{ background: #d4edda; color: #155724; }}
        .action-badge.denied {{ background: #f8d7da; color: #721c24; }}
        .action-badge.deferred {{ background: #fff3cd; color: #856404; }}
        .action-badge.hearing {{ background: #d1ecf1; color: #0c5460; }}
        .action-badge.rezoning {{ background: #e2d9f3; color: #4a235a; }}
        .error-card {{ border-left: 4px solid #dc3545; }}
        .error-msg {{ color: #dc3545; font-size: 13px; }}
        .footer {{
            text-align: center; padding: 24px; color: #999; font-size: 13px;
        }}
        @media (max-width: 600px) {{
            .municipality-grid {{ grid-template-columns: 1fr; }}
            .stats-bar {{ flex-direction: column; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="report-header">
            <h1>FL Municipal Planning &amp; Zoning Scanner</h1>
            <div class="subtitle">Daily Report - {date_str}</div>
            <div class="stats-bar">
                <div class="stat-card">
                    <div class="stat-value">{successful}/{total_munis}</div>
                    <div class="stat-label">Municipalities Scanned</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">{total_docs}</div>
                    <div class="stat-label">Documents Found</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">{len(regions)}</div>
                    <div class="stat-label">Regions Covered</div>
                </div>
            </div>
        </div>

        {region_sections}

        <div class="footer">
            Generated by FL Municipal Planning &amp; Zoning Scanner | {datetime.now().strftime("%Y-%m-%d %H:%M:%S")} EST
        </div>
    </div>
</body>
</html>"""


def _build_municipality_card(muni):
    """Build HTML for a single municipality card."""
    docs = muni.get("documents", [])
    status = muni.get("status", "unknown")
    doc_count_class = "zero" if len(docs) == 0 else ""
    error_class = "error-card" if status == "error" else ""

    doc_items = ""
    for doc in docs[:5]:
        action_badges = ""
        for action in doc.get("actions_found", [])[:3]:
            badge_class = _action_badge_class(action["type"])
            action_badges += (
                f'<span class="action-badge {badge_class}">'
                f'{_esc(action["type"])}</span>'
            )

        doc_items += f"""
        <li class="doc-item">
            <div class="doc-title">
                <a href="{_esc(doc.get('url', '#'))}" target="_blank" rel="noopener">
                    {_esc(doc.get('title', 'Untitled'))}
                </a>
                <span class="doc-type">{_esc(doc.get('document_type', 'Document'))}</span>
            </div>
            <div class="doc-actions">{action_badges}</div>
        </li>
        """

    if len(docs) > 5:
        doc_items += f'<li class="doc-item" style="color:#666;">... and {len(docs) - 5} more</li>'

    error_html = ""
    if status == "error":
        error_html = f'<div class="error-msg">{_esc(muni.get("error", "Unknown error"))}</div>'

    return f"""
    <div class="muni-card {error_class}">
        <div class="muni-card-header">
            <div>
                <div class="muni-name">{_esc(muni['municipality'])}</div>
                <div class="muni-county">{_esc(muni['county'])} County</div>
            </div>
            <span class="doc-count {doc_count_class}">{len(docs)} docs</span>
        </div>
        <div class="muni-summary">{_esc(muni.get('summary', ''))}</div>
        {error_html}
        <ul class="doc-list">{doc_items}</ul>
    </div>
    """


def _action_badge_class(action_type):
    """Map action type to CSS class."""
    mapping = {
        "Approved": "approved",
        "Denied": "denied",
        "Deferred": "deferred",
        "Public Hearing": "hearing",
        "Rezoning": "rezoning",
        "Recommended": "approved",
    }
    return mapping.get(action_type, "")


def _esc(text):
    """Escape HTML special characters."""
    if not text:
        return ""
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )
