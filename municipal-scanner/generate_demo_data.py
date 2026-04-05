#!/usr/bin/env python3
"""
Generate realistic demo data for the Municipal Scanner frontend.
Outputs a daily_summary.json that the webapp can consume.
"""

import json
import os
import random
from datetime import datetime, timedelta

from config import OUTPUT_DIR

# Realistic Florida planning & zoning actions
DEMO_PROJECTS = [
    # South Florida
    {"municipality": "Miami", "county": "Miami-Dade", "region": "South Florida",
     "docs": [
         {"title": "Planning & Zoning Board Agenda - April 2026", "type": "Meeting Agenda",
          "actions": [
              {"type": "Rezoning", "description": "Rezoning request from T3-R to T6-8 for mixed-use development at 1450 NW 36th St"},
              {"type": "Site Plan", "description": "Site plan review for 280-unit residential tower at 200 SE 2nd Ave"},
              {"type": "Public Hearing", "description": "Public hearing on Edgewater neighborhood comprehensive plan amendment"},
          ],
          "details": {"case_numbers": ["PZ-2026-0412"], "addresses": ["1450 NW 36th St"], "units": [280], "acreage": [2.4]}},
         {"title": "Zoning Board Resolution 2026-089", "type": "Resolution",
          "actions": [
              {"type": "Approved", "description": "Approved conditional use permit for 450-unit transit-oriented development near Brickell Station"},
          ],
          "details": {"case_numbers": ["CU-2026-0038"], "units": [450], "acreage": [5.1]}},
     ]},
    {"municipality": "Fort Lauderdale", "county": "Broward", "region": "South Florida",
     "docs": [
         {"title": "DRC Staff Report - Las Olas Mixed Use", "type": "Staff Report",
          "actions": [
              {"type": "Recommended", "description": "Recommended approval of 12-story mixed-use building with 195 residential units on Las Olas Blvd"},
              {"type": "Variance", "description": "Variance from maximum building height of 150 ft to 168 ft for architectural feature"},
          ],
          "details": {"case_numbers": ["SP-2026-0155"], "addresses": ["801 E Las Olas Blvd"], "units": [195], "acreage": [1.8]}},
     ]},
    {"municipality": "West Palm Beach", "county": "Palm Beach", "region": "South Florida",
     "docs": [
         {"title": "Planning Board Minutes - March 28, 2026", "type": "Meeting Minutes",
          "actions": [
              {"type": "Approved", "description": "Approved site plan for 168-unit workforce housing development on Australian Ave"},
              {"type": "Deferred", "description": "Deferred rezoning request for Northwood Village mixed-use project pending traffic study"},
          ],
          "details": {"case_numbers": ["ZON-2026-003", "SP-2026-088"], "addresses": ["2200 Australian Ave"], "units": [168]}},
     ]},
    {"municipality": "Boca Raton", "county": "Palm Beach", "region": "South Florida",
     "docs": [
         {"title": "P&Z Board Agenda - Downtown Development", "type": "Meeting Agenda",
          "actions": [
              {"type": "Site Plan", "description": "Site plan for redevelopment of Mizner Park South parcel, 320 luxury condominiums"},
              {"type": "Public Hearing", "description": "Public hearing on Palmetto Park Road corridor overlay district amendment"},
          ],
          "details": {"case_numbers": ["DEV-2026-0022"], "units": [320], "acreage": [8.5]}},
     ]},
    {"municipality": "Coral Springs", "county": "Broward", "region": "South Florida",
     "docs": []},

    # Central Florida
    {"municipality": "Orlando", "county": "Orange", "region": "Central Florida",
     "docs": [
         {"title": "Municipal Planning Board Staff Report", "type": "Staff Report",
          "actions": [
              {"type": "Rezoning", "description": "Rezoning from R-1 to PD for 540-unit master planned community in Lake Nona area"},
              {"type": "Approved", "description": "Approved preliminary plat for Creative Village Phase 3 with 280 residential units"},
          ],
          "details": {"case_numbers": ["ZON-2026-00145", "SUB-2026-00034"], "units": [540, 280], "acreage": [186.3]}},
         {"title": "City Council Ordinance 2026-15 - Comp Plan Amendment", "type": "Ordinance",
          "actions": [
              {"type": "Approved", "description": "Approved future land use map amendment from Low Density Residential to Activity Center for International Drive corridor"},
          ],
          "details": {"case_numbers": ["CPA-2026-002"]}},
     ]},
    {"municipality": "Tampa", "county": "Hillsborough", "region": "Central Florida",
     "docs": [
         {"title": "Variance Review Board Agenda April 2026", "type": "Meeting Agenda",
          "actions": [
              {"type": "Variance", "description": "Variance request for reduced setbacks on Water Street mixed-use project, 410 units"},
              {"type": "Site Plan", "description": "Site plan approval request for West Tampa Innovation District, 250 live-work units"},
          ],
          "details": {"case_numbers": ["VRB-2026-044", "SP-2026-089"], "units": [410, 250], "acreage": [3.2, 12.0]}},
     ]},
    {"municipality": "St. Petersburg", "county": "Pinellas", "region": "Central Florida",
     "docs": [
         {"title": "Community Planning & Preservation Commission Minutes", "type": "Meeting Minutes",
          "actions": [
              {"type": "Approved", "description": "Approved rezoning from CCS-1 to CCS-2 for 22-story mixed-use tower at 400 Central Ave"},
              {"type": "Approved", "description": "Approved certificate of appropriateness for adaptive reuse of historic warehouse at 800 2nd Ave S"},
          ],
          "details": {"case_numbers": ["REZ-2026-008", "COA-2026-015"], "addresses": ["400 Central Ave", "800 2nd Ave S"], "units": [285]}},
     ]},
    {"municipality": "Lakeland", "county": "Polk", "region": "Central Florida",
     "docs": [
         {"title": "Planning & Zoning Board Meeting Minutes", "type": "Meeting Minutes",
          "actions": [
              {"type": "Recommended", "description": "Recommended approval of 180-lot subdivision on Lakeland Highlands Rd"},
          ],
          "details": {"case_numbers": ["SUB-2026-007"], "units": [180], "acreage": [95.0]}},
     ]},
    {"municipality": "Kissimmee", "county": "Osceola", "region": "Central Florida",
     "docs": []},

    # Northeast Florida
    {"municipality": "Jacksonville", "county": "Duval", "region": "Northeast Florida",
     "docs": [
         {"title": "Planning Commission Agenda - April 2026", "type": "Meeting Agenda",
          "actions": [
              {"type": "Rezoning", "description": "Rezoning application from PBF-1 to PUD for 1200-unit mixed-use development at former JEA site"},
              {"type": "Public Hearing", "description": "Public hearing on Downtown Investment Authority master plan update"},
              {"type": "Site Plan", "description": "Site plan modification for Brooklyn/Riverside mixed-use with 380 apartments"},
          ],
          "details": {"case_numbers": ["ORD-2026-225", "PUD-2026-0014"], "units": [1200, 380], "acreage": [45.0]}},
     ]},
    {"municipality": "St. Augustine", "county": "St. Johns", "region": "Northeast Florida",
     "docs": [
         {"title": "PZB Meeting Agenda - Historic District Review", "type": "Meeting Agenda",
          "actions": [
              {"type": "Variance", "description": "Variance for building height in Historic District for boutique hotel at 42 San Marco Ave"},
          ],
          "details": {"case_numbers": ["VAR-2026-004"], "addresses": ["42 San Marco Ave"]}},
     ]},
    {"municipality": "Daytona Beach", "county": "Volusia", "region": "Northeast Florida",
     "docs": [
         {"title": "Planning Board Staff Report - Beachside Redevelopment", "type": "Staff Report",
          "actions": [
              {"type": "Recommended", "description": "Recommended approval of beachside redevelopment overlay with increased density allowances"},
              {"type": "Site Plan", "description": "Site plan for 220-unit condominium project at 100 N Atlantic Ave"},
          ],
          "details": {"case_numbers": ["SP-2026-012"], "addresses": ["100 N Atlantic Ave"], "units": [220], "acreage": [4.3]}},
     ]},

    # Southwest Florida
    {"municipality": "Sarasota", "county": "Sarasota", "region": "Southwest Florida",
     "docs": [
         {"title": "Planning Board Resolution 2026-PB-04", "type": "Resolution",
          "actions": [
              {"type": "Approved", "description": "Approved conditional use for 175-unit senior living facility on Fruitville Rd"},
              {"type": "Approved", "description": "Approved site plan for Rosemary District infill project, 88 townhomes"},
          ],
          "details": {"case_numbers": ["CU-2026-003", "SP-2026-021"], "units": [175, 88], "acreage": [12.5, 3.2]}},
     ]},
    {"municipality": "Fort Myers", "county": "Lee", "region": "Southwest Florida",
     "docs": [
         {"title": "Hearing Examiner Report - Midtown Development", "type": "Staff Report",
          "actions": [
              {"type": "Recommended", "description": "Recommended approval of PUD amendment for Midtown mixed-use with 600 residential units and 120,000 sq ft retail"},
          ],
          "details": {"case_numbers": ["PUD-2026-AMN-002"], "units": [600], "acreage": [28.0]}},
     ]},
    {"municipality": "Naples", "county": "Collier", "region": "Southwest Florida",
     "docs": [
         {"title": "Design Review Board Minutes - March 2026", "type": "Meeting Minutes",
          "actions": [
              {"type": "Approved", "description": "Approved design for 5th Avenue South mixed-use redevelopment, 48 luxury residences"},
              {"type": "Deferred", "description": "Deferred review of Pine Ridge Rd corridor rezoning to commercial"},
          ],
          "details": {"case_numbers": ["DRB-2026-009", "ZON-2026-018"], "addresses": ["650 5th Ave S"], "units": [48]}},
     ]},

    # Northwest Florida
    {"municipality": "Tallahassee", "county": "Leon", "region": "Northwest Florida",
     "docs": [
         {"title": "Planning Commission Agenda - University Area", "type": "Meeting Agenda",
          "actions": [
              {"type": "Rezoning", "description": "Rezoning request for student housing development near FSU campus, 420 beds"},
              {"type": "Public Hearing", "description": "Public hearing on Southside comprehensive plan amendment for mixed-use corridor"},
          ],
          "details": {"case_numbers": ["REZ-2026-011"], "units": [420], "acreage": [6.8]}},
     ]},
    {"municipality": "Pensacola", "county": "Escambia", "region": "Northwest Florida",
     "docs": [
         {"title": "City Council Zoning Ordinance 2026-22", "type": "Ordinance",
          "actions": [
              {"type": "Approved", "description": "Approved rezoning of 15 acres on Navy Blvd from heavy commercial to mixed-use residential"},
          ],
          "details": {"case_numbers": ["ORD-2026-22"], "acreage": [15.0]}},
     ]},
    {"municipality": "Panama City", "county": "Bay", "region": "Northwest Florida",
     "docs": []},

    # Treasure Coast
    {"municipality": "Port St. Lucie", "county": "St. Lucie", "region": "Treasure Coast",
     "docs": [
         {"title": "P&Z Advisory Board Agenda - Southern Grove", "type": "Meeting Agenda",
          "actions": [
              {"type": "Site Plan", "description": "Site plan review for Southern Grove Phase 4, 340 single-family lots"},
              {"type": "Rezoning", "description": "Rezoning from Agricultural to Residential for 120-acre parcel on Becker Rd"},
          ],
          "details": {"case_numbers": ["SP-2026-045", "REZ-2026-008"], "units": [340], "acreage": [120.0]}},
     ]},
]


def generate_demo_data():
    """Generate and save demo data."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    today = datetime.now()
    scan_time = today.replace(hour=6, minute=0, second=0).isoformat()

    municipalities = []
    for proj in DEMO_PROJECTS:
        docs = []
        for doc in proj["docs"]:
            all_keywords = set()
            for action in doc.get("actions", []):
                desc_lower = action["description"].lower()
                for kw in ["rezoning", "site plan", "variance", "conditional use",
                           "plat approval", "subdivision", "comprehensive plan",
                           "public hearing", "development order", "pud",
                           "mixed-use", "building permit", "annexation"]:
                    if kw in desc_lower:
                        all_keywords.add(kw)

            docs.append({
                "title": doc["title"],
                "url": f"https://www.example.com/docs/{doc['title'].lower().replace(' ', '-')}.pdf",
                "type": doc["type"],
                "relevance_score": random.randint(60, 95),
                "actions": doc.get("actions", []),
                "details": doc.get("details", {}),
            })

        # Count actions
        action_counts = {}
        all_keywords = set()
        for doc in docs:
            for action in doc.get("actions", []):
                atype = action["type"]
                action_counts[atype] = action_counts.get(atype, 0) + 1

        summary_parts = [f"{proj['municipality']} ({proj['county']} County):"]
        if docs:
            summary_parts.append(f"Found {len(docs)} relevant document(s).")
            if action_counts:
                action_strs = [f"{c} {t}" for t, c in action_counts.items()]
                summary_parts.append("Actions: " + ", ".join(action_strs) + ".")
        else:
            summary_parts.append("No new planning/zoning documents found.")

        municipalities.append({
            "name": proj["municipality"],
            "county": proj["county"],
            "region": proj["region"],
            "status": "success",
            "documents_found": len(docs),
            "action_counts": action_counts,
            "top_keywords": sorted(list(all_keywords))[:10],
            "summary": " ".join(summary_parts),
            "documents": docs,
        })

    # Sort by documents found
    municipalities.sort(key=lambda m: m["documents_found"], reverse=True)

    # Aggregate by region
    regions_map = {}
    for muni in municipalities:
        r = muni["region"]
        if r not in regions_map:
            regions_map[r] = {"name": r, "municipalities": 0, "total_documents": 0, "action_counts": {}}
        regions_map[r]["municipalities"] += 1
        regions_map[r]["total_documents"] += muni["documents_found"]
        for atype, count in muni.get("action_counts", {}).items():
            regions_map[r]["action_counts"][atype] = regions_map[r]["action_counts"].get(atype, 0) + count

    summary = {
        "date": today.strftime("%Y-%m-%d"),
        "scan_time": scan_time,
        "total_municipalities": len(municipalities),
        "successful_scans": len(municipalities),
        "total_documents": sum(m["documents_found"] for m in municipalities),
        "municipalities": municipalities,
        "regions": list(regions_map.values()),
    }

    output_path = os.path.join(OUTPUT_DIR, "daily_summary.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print(f"Demo data generated: {output_path}")
    print(f"  Municipalities: {len(municipalities)}")
    print(f"  Total documents: {summary['total_documents']}")
    return summary


if __name__ == "__main__":
    generate_demo_data()
