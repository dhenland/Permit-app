// ========================================
// FL Municipal Zoning Scanner - Demo Data
// ========================================
// This file provides sample scan data for the frontend.
// In production, this would be loaded from the scanner's daily_summary.json output.

function generateScannerData() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    const municipalities = [
        // === South Florida ===
        {
            name: "Miami",
            county: "Miami-Dade",
            region: "South Florida",
            status: "success",
            documents_found: 2,
            action_counts: { "Rezoning": 1, "Site Plan": 1, "Public Hearing": 1, "Approved": 1 },
            top_keywords: ["rezoning", "site plan", "conditional use", "transit-oriented"],
            summary: "Miami (Miami-Dade County): Found 2 relevant document(s). Actions: 1 Rezoning, 1 Site Plan, 1 Public Hearing, 1 Approved.",
            documents: [
                {
                    title: "Planning & Zoning Board Agenda - April 2026",
                    url: "#",
                    type: "Meeting Agenda",
                    relevance_score: 88,
                    actions: [
                        { type: "Rezoning", description: "Rezoning request from T3-R to T6-8 for mixed-use development at 1450 NW 36th St" },
                        { type: "Site Plan", description: "Site plan review for 280-unit residential tower at 200 SE 2nd Ave" },
                        { type: "Public Hearing", description: "Public hearing on Edgewater neighborhood comprehensive plan amendment" }
                    ],
                    details: { case_numbers: ["PZ-2026-0412"], addresses: ["1450 NW 36th St"], units: [280], acreage: [2.4] }
                },
                {
                    title: "Zoning Board Resolution 2026-089",
                    url: "#",
                    type: "Resolution",
                    relevance_score: 92,
                    actions: [
                        { type: "Approved", description: "Approved conditional use permit for 450-unit transit-oriented development near Brickell Station" }
                    ],
                    details: { case_numbers: ["CU-2026-0038"], units: [450], acreage: [5.1] }
                }
            ]
        },
        {
            name: "Fort Lauderdale",
            county: "Broward",
            region: "South Florida",
            status: "success",
            documents_found: 1,
            action_counts: { "Recommended": 1, "Variance": 1 },
            top_keywords: ["site plan", "variance", "mixed-use"],
            summary: "Fort Lauderdale (Broward County): Found 1 relevant document(s). Actions: 1 Recommended, 1 Variance.",
            documents: [
                {
                    title: "DRC Staff Report - Las Olas Mixed Use",
                    url: "#",
                    type: "Staff Report",
                    relevance_score: 85,
                    actions: [
                        { type: "Recommended", description: "Recommended approval of 12-story mixed-use building with 195 residential units on Las Olas Blvd" },
                        { type: "Variance", description: "Variance from maximum building height of 150 ft to 168 ft for architectural feature" }
                    ],
                    details: { case_numbers: ["SP-2026-0155"], addresses: ["801 E Las Olas Blvd"], units: [195], acreage: [1.8] }
                }
            ]
        },
        {
            name: "West Palm Beach",
            county: "Palm Beach",
            region: "South Florida",
            status: "success",
            documents_found: 1,
            action_counts: { "Approved": 1, "Deferred": 1 },
            top_keywords: ["site plan", "rezoning", "workforce housing"],
            summary: "West Palm Beach (Palm Beach County): Found 1 relevant document(s). Actions: 1 Approved, 1 Deferred.",
            documents: [
                {
                    title: "Planning Board Minutes - March 28, 2026",
                    url: "#",
                    type: "Meeting Minutes",
                    relevance_score: 82,
                    actions: [
                        { type: "Approved", description: "Approved site plan for 168-unit workforce housing development on Australian Ave" },
                        { type: "Deferred", description: "Deferred rezoning request for Northwood Village mixed-use project pending traffic study" }
                    ],
                    details: { case_numbers: ["ZON-2026-003", "SP-2026-088"], addresses: ["2200 Australian Ave"], units: [168] }
                }
            ]
        },
        {
            name: "Boca Raton",
            county: "Palm Beach",
            region: "South Florida",
            status: "success",
            documents_found: 1,
            action_counts: { "Site Plan": 1, "Public Hearing": 1 },
            top_keywords: ["site plan", "overlay district", "redevelopment"],
            summary: "Boca Raton (Palm Beach County): Found 1 relevant document(s). Actions: 1 Site Plan, 1 Public Hearing.",
            documents: [
                {
                    title: "P&Z Board Agenda - Downtown Development",
                    url: "#",
                    type: "Meeting Agenda",
                    relevance_score: 78,
                    actions: [
                        { type: "Site Plan", description: "Site plan for redevelopment of Mizner Park South parcel, 320 luxury condominiums" },
                        { type: "Public Hearing", description: "Public hearing on Palmetto Park Road corridor overlay district amendment" }
                    ],
                    details: { case_numbers: ["DEV-2026-0022"], units: [320], acreage: [8.5] }
                }
            ]
        },
        {
            name: "Coral Springs",
            county: "Broward",
            region: "South Florida",
            status: "success",
            documents_found: 0,
            action_counts: {},
            top_keywords: [],
            summary: "Coral Springs (Broward County): No new planning/zoning documents found.",
            documents: []
        },

        // === Central Florida ===
        {
            name: "Orlando",
            county: "Orange",
            region: "Central Florida",
            status: "success",
            documents_found: 2,
            action_counts: { "Rezoning": 1, "Approved": 2 },
            top_keywords: ["rezoning", "plat approval", "comprehensive plan", "future land use"],
            summary: "Orlando (Orange County): Found 2 relevant document(s). Actions: 1 Rezoning, 2 Approved.",
            documents: [
                {
                    title: "Municipal Planning Board Staff Report",
                    url: "#",
                    type: "Staff Report",
                    relevance_score: 90,
                    actions: [
                        { type: "Rezoning", description: "Rezoning from R-1 to PD for 540-unit master planned community in Lake Nona area" },
                        { type: "Approved", description: "Approved preliminary plat for Creative Village Phase 3 with 280 residential units" }
                    ],
                    details: { case_numbers: ["ZON-2026-00145", "SUB-2026-00034"], units: [540, 280], acreage: [186.3] }
                },
                {
                    title: "City Council Ordinance 2026-15 - Comp Plan Amendment",
                    url: "#",
                    type: "Ordinance",
                    relevance_score: 87,
                    actions: [
                        { type: "Approved", description: "Approved future land use map amendment from Low Density Residential to Activity Center for International Drive corridor" }
                    ],
                    details: { case_numbers: ["CPA-2026-002"] }
                }
            ]
        },
        {
            name: "Tampa",
            county: "Hillsborough",
            region: "Central Florida",
            status: "success",
            documents_found: 1,
            action_counts: { "Variance": 1, "Site Plan": 1 },
            top_keywords: ["variance", "site plan", "mixed-use", "innovation district"],
            summary: "Tampa (Hillsborough County): Found 1 relevant document(s). Actions: 1 Variance, 1 Site Plan.",
            documents: [
                {
                    title: "Variance Review Board Agenda April 2026",
                    url: "#",
                    type: "Meeting Agenda",
                    relevance_score: 80,
                    actions: [
                        { type: "Variance", description: "Variance request for reduced setbacks on Water Street mixed-use project, 410 units" },
                        { type: "Site Plan", description: "Site plan approval request for West Tampa Innovation District, 250 live-work units" }
                    ],
                    details: { case_numbers: ["VRB-2026-044", "SP-2026-089"], units: [410, 250], acreage: [3.2, 12.0] }
                }
            ]
        },
        {
            name: "St. Petersburg",
            county: "Pinellas",
            region: "Central Florida",
            status: "success",
            documents_found: 1,
            action_counts: { "Approved": 2 },
            top_keywords: ["rezoning", "certificate of appropriateness", "adaptive reuse"],
            summary: "St. Petersburg (Pinellas County): Found 1 relevant document(s). Actions: 2 Approved.",
            documents: [
                {
                    title: "Community Planning & Preservation Commission Minutes",
                    url: "#",
                    type: "Meeting Minutes",
                    relevance_score: 86,
                    actions: [
                        { type: "Approved", description: "Approved rezoning from CCS-1 to CCS-2 for 22-story mixed-use tower at 400 Central Ave" },
                        { type: "Approved", description: "Approved certificate of appropriateness for adaptive reuse of historic warehouse at 800 2nd Ave S" }
                    ],
                    details: { case_numbers: ["REZ-2026-008", "COA-2026-015"], addresses: ["400 Central Ave", "800 2nd Ave S"], units: [285] }
                }
            ]
        },
        {
            name: "Lakeland",
            county: "Polk",
            region: "Central Florida",
            status: "success",
            documents_found: 1,
            action_counts: { "Recommended": 1 },
            top_keywords: ["subdivision", "plat"],
            summary: "Lakeland (Polk County): Found 1 relevant document(s). Actions: 1 Recommended.",
            documents: [
                {
                    title: "Planning & Zoning Board Meeting Minutes",
                    url: "#",
                    type: "Meeting Minutes",
                    relevance_score: 72,
                    actions: [
                        { type: "Recommended", description: "Recommended approval of 180-lot subdivision on Lakeland Highlands Rd" }
                    ],
                    details: { case_numbers: ["SUB-2026-007"], units: [180], acreage: [95.0] }
                }
            ]
        },
        {
            name: "Kissimmee",
            county: "Osceola",
            region: "Central Florida",
            status: "success",
            documents_found: 0,
            action_counts: {},
            top_keywords: [],
            summary: "Kissimmee (Osceola County): No new planning/zoning documents found.",
            documents: []
        },

        // === Northeast Florida ===
        {
            name: "Jacksonville",
            county: "Duval",
            region: "Northeast Florida",
            status: "success",
            documents_found: 1,
            action_counts: { "Rezoning": 1, "Public Hearing": 1, "Site Plan": 1 },
            top_keywords: ["rezoning", "pud", "master plan", "mixed-use"],
            summary: "Jacksonville (Duval County): Found 1 relevant document(s). Actions: 1 Rezoning, 1 Public Hearing, 1 Site Plan.",
            documents: [
                {
                    title: "Planning Commission Agenda - April 2026",
                    url: "#",
                    type: "Meeting Agenda",
                    relevance_score: 91,
                    actions: [
                        { type: "Rezoning", description: "Rezoning application from PBF-1 to PUD for 1200-unit mixed-use development at former JEA site" },
                        { type: "Public Hearing", description: "Public hearing on Downtown Investment Authority master plan update" },
                        { type: "Site Plan", description: "Site plan modification for Brooklyn/Riverside mixed-use with 380 apartments" }
                    ],
                    details: { case_numbers: ["ORD-2026-225", "PUD-2026-0014"], units: [1200, 380], acreage: [45.0] }
                }
            ]
        },
        {
            name: "St. Augustine",
            county: "St. Johns",
            region: "Northeast Florida",
            status: "success",
            documents_found: 1,
            action_counts: { "Variance": 1 },
            top_keywords: ["variance", "historic district"],
            summary: "St. Augustine (St. Johns County): Found 1 relevant document(s). Actions: 1 Variance.",
            documents: [
                {
                    title: "PZB Meeting Agenda - Historic District Review",
                    url: "#",
                    type: "Meeting Agenda",
                    relevance_score: 68,
                    actions: [
                        { type: "Variance", description: "Variance for building height in Historic District for boutique hotel at 42 San Marco Ave" }
                    ],
                    details: { case_numbers: ["VAR-2026-004"], addresses: ["42 San Marco Ave"] }
                }
            ]
        },
        {
            name: "Daytona Beach",
            county: "Volusia",
            region: "Northeast Florida",
            status: "success",
            documents_found: 1,
            action_counts: { "Recommended": 1, "Site Plan": 1 },
            top_keywords: ["redevelopment", "site plan", "overlay"],
            summary: "Daytona Beach (Volusia County): Found 1 relevant document(s). Actions: 1 Recommended, 1 Site Plan.",
            documents: [
                {
                    title: "Planning Board Staff Report - Beachside Redevelopment",
                    url: "#",
                    type: "Staff Report",
                    relevance_score: 83,
                    actions: [
                        { type: "Recommended", description: "Recommended approval of beachside redevelopment overlay with increased density allowances" },
                        { type: "Site Plan", description: "Site plan for 220-unit condominium project at 100 N Atlantic Ave" }
                    ],
                    details: { case_numbers: ["SP-2026-012"], addresses: ["100 N Atlantic Ave"], units: [220], acreage: [4.3] }
                }
            ]
        },

        // === Southwest Florida ===
        {
            name: "Sarasota",
            county: "Sarasota",
            region: "Southwest Florida",
            status: "success",
            documents_found: 1,
            action_counts: { "Approved": 2 },
            top_keywords: ["conditional use", "site plan", "senior living", "infill"],
            summary: "Sarasota (Sarasota County): Found 1 relevant document(s). Actions: 2 Approved.",
            documents: [
                {
                    title: "Planning Board Resolution 2026-PB-04",
                    url: "#",
                    type: "Resolution",
                    relevance_score: 89,
                    actions: [
                        { type: "Approved", description: "Approved conditional use for 175-unit senior living facility on Fruitville Rd" },
                        { type: "Approved", description: "Approved site plan for Rosemary District infill project, 88 townhomes" }
                    ],
                    details: { case_numbers: ["CU-2026-003", "SP-2026-021"], units: [175, 88], acreage: [12.5, 3.2] }
                }
            ]
        },
        {
            name: "Fort Myers",
            county: "Lee",
            region: "Southwest Florida",
            status: "success",
            documents_found: 1,
            action_counts: { "Recommended": 1 },
            top_keywords: ["pud", "mixed-use", "retail"],
            summary: "Fort Myers (Lee County): Found 1 relevant document(s). Actions: 1 Recommended.",
            documents: [
                {
                    title: "Hearing Examiner Report - Midtown Development",
                    url: "#",
                    type: "Staff Report",
                    relevance_score: 79,
                    actions: [
                        { type: "Recommended", description: "Recommended approval of PUD amendment for Midtown mixed-use with 600 residential units and 120,000 sq ft retail" }
                    ],
                    details: { case_numbers: ["PUD-2026-AMN-002"], units: [600], acreage: [28.0] }
                }
            ]
        },
        {
            name: "Naples",
            county: "Collier",
            region: "Southwest Florida",
            status: "success",
            documents_found: 1,
            action_counts: { "Approved": 1, "Deferred": 1 },
            top_keywords: ["design review", "redevelopment", "rezoning"],
            summary: "Naples (Collier County): Found 1 relevant document(s). Actions: 1 Approved, 1 Deferred.",
            documents: [
                {
                    title: "Design Review Board Minutes - March 2026",
                    url: "#",
                    type: "Meeting Minutes",
                    relevance_score: 76,
                    actions: [
                        { type: "Approved", description: "Approved design for 5th Avenue South mixed-use redevelopment, 48 luxury residences" },
                        { type: "Deferred", description: "Deferred review of Pine Ridge Rd corridor rezoning to commercial" }
                    ],
                    details: { case_numbers: ["DRB-2026-009", "ZON-2026-018"], addresses: ["650 5th Ave S"], units: [48] }
                }
            ]
        },

        // === Northwest Florida ===
        {
            name: "Tallahassee",
            county: "Leon",
            region: "Northwest Florida",
            status: "success",
            documents_found: 1,
            action_counts: { "Rezoning": 1, "Public Hearing": 1 },
            top_keywords: ["rezoning", "student housing", "comprehensive plan"],
            summary: "Tallahassee (Leon County): Found 1 relevant document(s). Actions: 1 Rezoning, 1 Public Hearing.",
            documents: [
                {
                    title: "Planning Commission Agenda - University Area",
                    url: "#",
                    type: "Meeting Agenda",
                    relevance_score: 81,
                    actions: [
                        { type: "Rezoning", description: "Rezoning request for student housing development near FSU campus, 420 beds" },
                        { type: "Public Hearing", description: "Public hearing on Southside comprehensive plan amendment for mixed-use corridor" }
                    ],
                    details: { case_numbers: ["REZ-2026-011"], units: [420], acreage: [6.8] }
                }
            ]
        },
        {
            name: "Pensacola",
            county: "Escambia",
            region: "Northwest Florida",
            status: "success",
            documents_found: 1,
            action_counts: { "Approved": 1 },
            top_keywords: ["rezoning", "mixed-use residential"],
            summary: "Pensacola (Escambia County): Found 1 relevant document(s). Actions: 1 Approved.",
            documents: [
                {
                    title: "City Council Zoning Ordinance 2026-22",
                    url: "#",
                    type: "Ordinance",
                    relevance_score: 85,
                    actions: [
                        { type: "Approved", description: "Approved rezoning of 15 acres on Navy Blvd from heavy commercial to mixed-use residential" }
                    ],
                    details: { case_numbers: ["ORD-2026-22"], acreage: [15.0] }
                }
            ]
        },
        {
            name: "Panama City",
            county: "Bay",
            region: "Northwest Florida",
            status: "success",
            documents_found: 0,
            action_counts: {},
            top_keywords: [],
            summary: "Panama City (Bay County): No new planning/zoning documents found.",
            documents: []
        },

        // === Treasure Coast ===
        {
            name: "Port St. Lucie",
            county: "St. Lucie",
            region: "Treasure Coast",
            status: "success",
            documents_found: 1,
            action_counts: { "Site Plan": 1, "Rezoning": 1 },
            top_keywords: ["site plan", "rezoning", "single-family"],
            summary: "Port St. Lucie (St. Lucie County): Found 1 relevant document(s). Actions: 1 Site Plan, 1 Rezoning.",
            documents: [
                {
                    title: "P&Z Advisory Board Agenda - Southern Grove",
                    url: "#",
                    type: "Meeting Agenda",
                    relevance_score: 77,
                    actions: [
                        { type: "Site Plan", description: "Site plan review for Southern Grove Phase 4, 340 single-family lots" },
                        { type: "Rezoning", description: "Rezoning from Agricultural to Residential for 120-acre parcel on Becker Rd" }
                    ],
                    details: { case_numbers: ["SP-2026-045", "REZ-2026-008"], units: [340], acreage: [120.0] }
                }
            ]
        }
    ];

    // Sort by documents found desc
    municipalities.sort((a, b) => b.documents_found - a.documents_found);

    // Build regions
    const regionsMap = {};
    municipalities.forEach(m => {
        if (!regionsMap[m.region]) {
            regionsMap[m.region] = { name: m.region, municipalities: 0, total_documents: 0, action_counts: {} };
        }
        regionsMap[m.region].municipalities++;
        regionsMap[m.region].total_documents += m.documents_found;
        Object.entries(m.action_counts || {}).forEach(([type, count]) => {
            regionsMap[m.region].action_counts[type] = (regionsMap[m.region].action_counts[type] || 0) + count;
        });
    });

    return {
        date: dateStr,
        scan_time: new Date().toISOString(),
        total_municipalities: municipalities.length,
        successful_scans: municipalities.length,
        total_documents: municipalities.reduce((sum, m) => sum + m.documents_found, 0),
        municipalities: municipalities,
        regions: Object.values(regionsMap)
    };
}
