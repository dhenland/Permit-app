"""
Florida Municipal Planning & Zoning Scanner - Configuration

Defines target municipalities and their planning/zoning web pages
where meeting agendas, minutes, and approval documents are published.
"""

import os

# Output directory for scan results
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
PDF_CACHE_DIR = os.path.join(OUTPUT_DIR, "pdf_cache")

# Maximum PDF file size to download (10 MB)
MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024

# Request timeout in seconds
REQUEST_TIMEOUT = 30

# User agent for HTTP requests
USER_AGENT = (
    "Mozilla/5.0 (compatible; MunicipalPDFScanner/1.0; "
    "Florida Planning & Zoning Research)"
)

# Keywords that indicate planning & zoning relevance
ZONING_KEYWORDS = [
    # Zoning actions
    "rezoning", "rezone", "zoning change", "zoning amendment",
    "zoning variance", "variance request", "conditional use",
    "special exception", "special use permit",
    # Planning actions
    "site plan", "site plan approval", "site plan review",
    "comprehensive plan", "comp plan amendment", "future land use",
    "land use change", "land use amendment",
    # Development approvals
    "plat approval", "preliminary plat", "final plat",
    "subdivision", "subdivision approval",
    "development order", "development agreement",
    "planned unit development", "pud", "planned development",
    # Board/commission references
    "planning and zoning", "planning commission",
    "planning board", "zoning board", "board of adjustment",
    "development review", "development review committee",
    # Permit types
    "building permit", "development permit",
    "certificate of appropriateness", "historic preservation",
    # Annexation
    "annexation", "annexation request",
    # Impact / concurrency
    "concurrency", "traffic impact", "impact fee",
]

# Florida municipalities to scan, organized by region
MUNICIPALITIES = [
    # === South Florida ===
    {
        "name": "Miami",
        "county": "Miami-Dade",
        "region": "South Florida",
        "planning_urls": [
            "https://www.miami-dade.gov/planning/meetings.asp",
            "https://www.miamigov.com/Government/Departments-Organizations/Planning/Planning-Zoning",
        ],
        "search_patterns": ["agenda", "minutes", "resolution", "ordinance"],
    },
    {
        "name": "Fort Lauderdale",
        "county": "Broward",
        "region": "South Florida",
        "planning_urls": [
            "https://www.fortlauderdale.gov/government/departments-a-h/development-services/planning-and-zoning",
        ],
        "search_patterns": ["agenda", "minutes", "staff report"],
    },
    {
        "name": "West Palm Beach",
        "county": "Palm Beach",
        "region": "South Florida",
        "planning_urls": [
            "https://www.wpb.org/government/departments/development-services/planning-division",
        ],
        "search_patterns": ["agenda", "minutes", "approval"],
    },
    {
        "name": "Boca Raton",
        "county": "Palm Beach",
        "region": "South Florida",
        "planning_urls": [
            "https://www.myboca.us/296/Planning-Zoning",
        ],
        "search_patterns": ["agenda", "minutes", "approval", "development order"],
    },
    {
        "name": "Coral Springs",
        "county": "Broward",
        "region": "South Florida",
        "planning_urls": [
            "https://www.coralsprings.gov/government/departments/development-services/planning-and-zoning",
        ],
        "search_patterns": ["agenda", "minutes", "plat"],
    },
    # === Central Florida ===
    {
        "name": "Orlando",
        "county": "Orange",
        "region": "Central Florida",
        "planning_urls": [
            "https://www.orlando.gov/Building-Development/Planning-Development",
        ],
        "search_patterns": ["agenda", "minutes", "staff report", "master plan"],
    },
    {
        "name": "Tampa",
        "county": "Hillsborough",
        "region": "Central Florida",
        "planning_urls": [
            "https://www.tampa.gov/city-planning",
        ],
        "search_patterns": ["agenda", "minutes", "rezoning", "variance"],
    },
    {
        "name": "St. Petersburg",
        "county": "Pinellas",
        "region": "Central Florida",
        "planning_urls": [
            "https://www.stpete.org/planning_and_development/index.php",
        ],
        "search_patterns": ["agenda", "minutes", "approval"],
    },
    {
        "name": "Lakeland",
        "county": "Polk",
        "region": "Central Florida",
        "planning_urls": [
            "https://www.lakelandgov.net/departments/community-development/planning-and-zoning/",
        ],
        "search_patterns": ["agenda", "minutes", "rezoning", "site plan"],
    },
    {
        "name": "Kissimmee",
        "county": "Osceola",
        "region": "Central Florida",
        "planning_urls": [
            "https://www.kissimmee.gov/departments/development-services/planning-zoning",
        ],
        "search_patterns": ["agenda", "minutes", "development order"],
    },
    # === Northeast Florida ===
    {
        "name": "Jacksonville",
        "county": "Duval",
        "region": "Northeast Florida",
        "planning_urls": [
            "https://www.coj.net/departments/planning-and-development",
        ],
        "search_patterns": ["agenda", "minutes", "ordinance", "rezoning"],
    },
    {
        "name": "St. Augustine",
        "county": "St. Johns",
        "region": "Northeast Florida",
        "planning_urls": [
            "https://www.citystaug.com/691/Planning-and-Building",
        ],
        "search_patterns": ["agenda", "minutes", "certificate", "variance"],
    },
    {
        "name": "Daytona Beach",
        "county": "Volusia",
        "region": "Northeast Florida",
        "planning_urls": [
            "https://www.daytonabeach.com/289/Planning",
        ],
        "search_patterns": ["agenda", "minutes", "site plan", "rezoning"],
    },
    # === Southwest Florida ===
    {
        "name": "Sarasota",
        "county": "Sarasota",
        "region": "Southwest Florida",
        "planning_urls": [
            "https://www.sarasotafl.gov/government/planning",
        ],
        "search_patterns": ["agenda", "minutes", "site plan", "rezoning"],
    },
    {
        "name": "Fort Myers",
        "county": "Lee",
        "region": "Southwest Florida",
        "planning_urls": [
            "https://www.fortmyers.org/departments/community-development",
        ],
        "search_patterns": ["agenda", "minutes", "development order", "plat"],
    },
    {
        "name": "Naples",
        "county": "Collier",
        "region": "Southwest Florida",
        "planning_urls": [
            "https://www.naplesgov.com/planning",
        ],
        "search_patterns": ["agenda", "minutes", "conditional use", "variance"],
    },
    # === Northwest Florida / Panhandle ===
    {
        "name": "Tallahassee",
        "county": "Leon",
        "region": "Northwest Florida",
        "planning_urls": [
            "https://www.talgov.com/planning/planning.aspx",
        ],
        "search_patterns": ["agenda", "minutes", "comprehensive plan", "rezoning"],
    },
    {
        "name": "Pensacola",
        "county": "Escambia",
        "region": "Northwest Florida",
        "planning_urls": [
            "https://www.cityofpensacola.com/286/Planning-Services",
        ],
        "search_patterns": ["agenda", "minutes", "land use", "rezoning"],
    },
    {
        "name": "Panama City",
        "county": "Bay",
        "region": "Northwest Florida",
        "planning_urls": [
            "https://www.pcgov.org/304/Planning-Zoning",
        ],
        "search_patterns": ["agenda", "minutes", "development review"],
    },
    # === Space Coast / Treasure Coast ===
    {
        "name": "Port St. Lucie",
        "county": "St. Lucie",
        "region": "Treasure Coast",
        "planning_urls": [
            "https://www.cityofpsl.com/government/departments/planning-and-zoning",
        ],
        "search_patterns": ["agenda", "minutes", "site plan", "plat"],
    },
]
