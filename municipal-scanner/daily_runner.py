#!/usr/bin/env python3
"""
Daily runner for the Florida Municipal Planning & Zoning PDF Scanner.

Can be run as:
  1. A standalone cron job:  python3 daily_runner.py
  2. A continuous scheduler:  python3 daily_runner.py --daemon
  3. On-demand:              python3 daily_runner.py --now

Cron example (runs daily at 6 AM EST):
  0 6 * * * cd /path/to/municipal-scanner && python3 daily_runner.py >> /var/log/municipal-scanner.log 2>&1
"""

import argparse
import json
import logging
import os
import sys
from datetime import datetime

import schedule

from config import OUTPUT_DIR
from scanner import run_scan
from report_generator import generate_daily_report

logger = logging.getLogger(__name__)


def daily_job():
    """Run the daily scan and generate reports."""
    logger.info("=" * 60)
    logger.info("DAILY MUNICIPAL SCANNER RUN - %s", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    logger.info("=" * 60)

    try:
        # Run the scan
        results = run_scan()

        # Generate HTML report
        report_path = generate_daily_report(results)
        logger.info("HTML report generated: %s", report_path)

        # Generate summary for webapp consumption
        summary = generate_webapp_summary(results)
        summary_path = os.path.join(OUTPUT_DIR, "daily_summary.json")
        with open(summary_path, "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)

        logger.info("Daily summary saved: %s", summary_path)
        logger.info("Scan complete. %d documents found across %d municipalities.",
                     results["total_documents_found"], results["successful_scans"])

    except Exception as e:
        logger.error("Daily scan failed: %s", e, exc_info=True)
        raise


def generate_webapp_summary(scan_results):
    """Generate a simplified summary suitable for the webapp frontend."""
    today = datetime.now().strftime("%Y-%m-%d")

    municipalities_summary = []
    for muni in scan_results.get("municipalities", []):
        docs = muni.get("documents", [])
        all_actions = []
        for doc in docs:
            all_actions.extend(doc.get("actions_found", []))

        # Count by action type
        action_counts = {}
        for action in all_actions:
            atype = action["type"]
            action_counts[atype] = action_counts.get(atype, 0) + 1

        # Get top keywords across all docs
        all_keywords = set()
        for doc in docs:
            all_keywords.update(doc.get("matched_keywords", []))

        municipalities_summary.append({
            "name": muni["municipality"],
            "county": muni["county"],
            "region": muni["region"],
            "status": muni.get("status", "unknown"),
            "documents_found": len(docs),
            "action_counts": action_counts,
            "top_keywords": sorted(list(all_keywords))[:10],
            "summary": muni.get("summary", ""),
            "documents": [
                {
                    "title": doc["title"],
                    "url": doc["url"],
                    "type": doc["document_type"],
                    "relevance_score": doc["relevance_score"],
                    "actions": doc["actions_found"][:5],
                    "details": doc.get("extracted_details", {}),
                }
                for doc in docs[:10]
            ],
        })

    # Sort by documents found (most active first)
    municipalities_summary.sort(key=lambda m: m["documents_found"], reverse=True)

    return {
        "date": today,
        "scan_time": scan_results["scan_time"],
        "total_municipalities": scan_results["total_municipalities"],
        "successful_scans": scan_results["successful_scans"],
        "total_documents": scan_results["total_documents_found"],
        "municipalities": municipalities_summary,
        "regions": _aggregate_by_region(municipalities_summary),
    }


def _aggregate_by_region(municipalities):
    """Aggregate municipality data by region."""
    regions = {}
    for muni in municipalities:
        region = muni["region"]
        if region not in regions:
            regions[region] = {
                "name": region,
                "municipalities": 0,
                "total_documents": 0,
                "action_counts": {},
            }
        regions[region]["municipalities"] += 1
        regions[region]["total_documents"] += muni["documents_found"]
        for atype, count in muni.get("action_counts", {}).items():
            regions[region]["action_counts"][atype] = (
                regions[region]["action_counts"].get(atype, 0) + count
            )

    return list(regions.values())


def main():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    parser = argparse.ArgumentParser(description="Florida Municipal PDF Scanner - Daily Runner")
    parser.add_argument("--daemon", action="store_true",
                        help="Run as daemon with scheduled daily execution at 6 AM EST")
    parser.add_argument("--now", action="store_true",
                        help="Run scan immediately (default)")
    parser.add_argument("--time", default="06:00",
                        help="Time to run daily scan in HH:MM format (default: 06:00)")
    args = parser.parse_args()

    if args.daemon:
        logger.info("Starting Municipal Scanner daemon. Scheduled daily at %s EST.", args.time)
        schedule.every().day.at(args.time).do(daily_job)

        # Also run immediately on startup
        daily_job()

        while True:
            schedule.run_pending()
            import time
            time.sleep(60)
    else:
        daily_job()


if __name__ == "__main__":
    main()
