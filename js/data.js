// ========================================
// FL Water Permit Tracker - Permit Data
// ========================================

const DISTRICTS = {
    SFWMD: {
        code: 'SFWMD',
        fullName: 'South Florida Water Management District',
        shortName: 'South Florida',
        url: 'https://www.sfwmd.gov/doing-business-with-us/permits',
        searchUrl: 'https://www.sfwmd.gov/regpermitting'
    },
    SJRWMD: {
        code: 'SJRWMD',
        fullName: 'St. Johns River Water Management District',
        shortName: 'St. Johns River',
        url: 'https://www.sjrwmd.com/permitting/',
        searchUrl: 'https://permitting.sjrwmd.com/epermitting/jsp/Search.do?theAction=PermitNumSearch'
    },
    SWFWMD: {
        code: 'SWFWMD',
        fullName: 'Southwest Florida Water Management District',
        shortName: 'Southwest Florida',
        url: 'https://www.swfwmd.state.fl.us/business/epermitting',
        searchUrl: 'https://www18.swfwmd.state.fl.us/erp/erp/search/ERPSearch.aspx'
    },
    SRWMD: {
        code: 'SRWMD',
        fullName: 'Suwannee River Water Management District',
        shortName: 'Suwannee River',
        url: 'https://www.mysuwanneeriver.com/8/Permits-Rules',
        searchUrl: 'https://permitting.sjrwmd.com/srep/'
    },
    NWFWMD: {
        code: 'NWFWMD',
        fullName: 'Northwest Florida Water Management District',
        shortName: 'Northwest Florida',
        url: 'https://nwfwater.com/permits/',
        searchUrl: 'https://permitting.sjrwmd.com/nwep/'
    }
};

const STATUS_CONFIG = {
    'New Application': {
        cssClass: 'new-application',
        icon: '📋',
        isAlert: true
    },
    'Under Review': {
        cssClass: 'under-review',
        icon: '🕐',
        isAlert: false
    },
    'Approved': {
        cssClass: 'approved',
        icon: '✅',
        isAlert: true
    },
    'Denied': {
        cssClass: 'denied',
        icon: '❌',
        isAlert: false
    },
    'Expired': {
        cssClass: 'expired',
        icon: '⏰',
        isAlert: false
    }
};

function generateSamplePermits() {
    const now = new Date();
    const day = 24 * 60 * 60 * 1000;

    const rawData = [
        {
            id: 'APP-2026-00142', district: 'SFWMD', status: 'New Application',
            type: 'Environmental Resource Permit',
            applicant: 'Sunshine Development LLC', owner: 'Palm Beach Land Trust',
            project: 'Palm Beach Gardens Residential Phase 3',
            county: 'Palm Beach', location: '4200 Hood Rd, Palm Beach Gardens, FL 33418',
            units: 248, daysAgo: 0,
            permitURL: 'https://www.sfwmd.gov/regpermitting',
            lat: 26.8234, lon: -80.1389
        },
        {
            id: 'APP-2026-00139', district: 'SFWMD', status: 'Approved',
            type: 'Surface Water Management',
            applicant: 'Coral Springs Holdings Inc', owner: 'Broward County Housing Authority',
            project: 'Coral Springs Waterway Village',
            county: 'Broward', location: '11000 W Sample Rd, Coral Springs, FL 33071',
            units: 186, daysAgo: 2,
            permitURL: 'https://www.sfwmd.gov/regpermitting',
            lat: 26.2712, lon: -80.2706
        },
        {
            id: 'SJR-2026-03891', district: 'SJRWMD', status: 'New Application',
            type: 'Water Use Permit',
            applicant: 'Atlantic Coast Builders', owner: 'Volusia Development Group',
            project: 'Daytona Shores Residential Community',
            county: 'Volusia', location: '1500 Beville Rd, Daytona Beach, FL 32114',
            units: 312, daysAgo: 1,
            permitURL: 'https://permitting.sjrwmd.com/epermitting/jsp/Search.do?permitNumber=SJR-2026-03891&theAction=searchDetail',
            lat: 29.2108, lon: -81.0228
        },
        {
            id: 'SJR-2026-03887', district: 'SJRWMD', status: 'Approved',
            type: 'Environmental Resource Permit',
            applicant: 'Heritage Homes of Florida', owner: 'Flagler Estates LLC',
            project: 'Flagler Oaks Subdivision',
            county: 'Flagler', location: '200 Bulldog Dr, Palm Coast, FL 32137',
            units: 124, daysAgo: 3,
            permitURL: 'https://permitting.sjrwmd.com/epermitting/jsp/Search.do?permitNumber=SJR-2026-03887&theAction=searchDetail',
            lat: 29.5847, lon: -81.2079
        },
        {
            id: 'SWF-2026-12045', district: 'SWFWMD', status: 'New Application',
            type: 'Environmental Resource Permit',
            applicant: 'Bay Area Development Corp', owner: 'Hillsborough Investment Trust',
            project: 'Tampa Palms North Expansion',
            county: 'Hillsborough', location: '16100 Tampa Palms Blvd W, Tampa, FL 33647',
            units: 420, daysAgo: 0,
            permitURL: 'https://www18.swfwmd.state.fl.us/erp/erp/search/ERPSearch.aspx',
            lat: 28.0836, lon: -82.3940
        },
        {
            id: 'SWF-2026-12038', district: 'SWFWMD', status: 'Approved',
            type: 'Water Use Permit',
            applicant: 'Sarasota Bay Homes LLC', owner: 'Gulf Coast Properties',
            project: 'Sarasota Springs Community',
            county: 'Sarasota', location: '8350 Bee Ridge Rd, Sarasota, FL 34238',
            units: 156, daysAgo: 4,
            permitURL: 'https://www18.swfwmd.state.fl.us/search/search/searchwupsimple.aspx',
            lat: 27.2823, lon: -82.4572
        },
        {
            id: 'SRW-2026-00567', district: 'SRWMD', status: 'New Application',
            type: 'Well Construction',
            applicant: 'North Florida Living Inc', owner: 'Alachua County Land Corp',
            project: 'Gainesville Green Estates',
            county: 'Alachua', location: '7400 W Newberry Rd, Gainesville, FL 32606',
            units: 88, daysAgo: 1,
            permitURL: 'https://permitting.sjrwmd.com/srep/',
            lat: 29.6516, lon: -82.3248
        },
        {
            id: 'SRW-2026-00561', district: 'SRWMD', status: 'Approved',
            type: 'Surface Water Management',
            applicant: 'Columbia County Developers', owner: 'Lake City Properties LLC',
            project: 'Lake City Lakefront Villas',
            county: 'Columbia', location: '3500 S US Hwy 41, Lake City, FL 32025',
            units: 64, daysAgo: 5,
            permitURL: 'https://permitting.sjrwmd.com/srep/',
            lat: 30.1897, lon: -82.6393
        },
        {
            id: 'NWF-2026-00234', district: 'NWFWMD', status: 'New Application',
            type: 'Environmental Resource Permit',
            applicant: 'Emerald Coast Builders', owner: 'Okaloosa Holdings LLC',
            project: 'Destin Harbor Residences',
            county: 'Okaloosa', location: '650 Harbor Blvd, Destin, FL 32541',
            units: 196, daysAgo: 0,
            permitURL: 'https://permitting.sjrwmd.com/nwep/',
            lat: 30.3935, lon: -86.4958
        },
        {
            id: 'NWF-2026-00229', district: 'NWFWMD', status: 'Approved',
            type: 'Water Use Permit',
            applicant: 'Panhandle Property Group', owner: 'Bay County Development Authority',
            project: 'Panama City Beach Coastal Living',
            county: 'Bay', location: '15600 Panama City Beach Pkwy, Panama City Beach, FL 32413',
            units: 144, daysAgo: 2,
            permitURL: 'https://permitting.sjrwmd.com/nwep/',
            lat: 30.1766, lon: -85.8055
        },
        {
            id: 'APP-2026-00135', district: 'SFWMD', status: 'New Application',
            type: 'Water Use Permit',
            applicant: 'Everglades Edge Development', owner: 'Miami-Dade Residential Trust',
            project: 'Homestead Prairie Townhomes',
            county: 'Miami-Dade', location: '28000 SW 152nd Ave, Homestead, FL 33033',
            units: 172, daysAgo: 3,
            permitURL: 'https://www.sfwmd.gov/regpermitting',
            lat: 25.4687, lon: -80.4776
        },
        {
            id: 'SJR-2026-03879', district: 'SJRWMD', status: 'Approved',
            type: 'Surface Water Management',
            applicant: 'Clay County Construction Corp', owner: 'Fleming Island Associates',
            project: 'Fleming Island Waterfront Estates',
            county: 'Clay', location: '1845 Town Center Blvd, Fleming Island, FL 32003',
            units: 96, daysAgo: 6,
            permitURL: 'https://permitting.sjrwmd.com/epermitting/jsp/Search.do?permitNumber=SJR-2026-03879&theAction=searchDetail',
            lat: 30.0934, lon: -81.7189
        },
        {
            id: 'SWF-2026-12029', district: 'SWFWMD', status: 'New Application',
            type: 'Right of Way',
            applicant: 'Polk County Homes Inc', owner: 'Central FL Investment Group',
            project: 'Lakeland Heights Subdivision',
            county: 'Polk', location: '5800 N Florida Ave, Lakeland, FL 33809',
            units: 208, daysAgo: 1,
            permitURL: 'https://www18.swfwmd.state.fl.us/erp/erp/search/ERPSearch.aspx',
            lat: 28.0395, lon: -81.9498
        },
        {
            id: 'APP-2026-00128', district: 'SFWMD', status: 'Approved',
            type: 'Environmental Resource Permit',
            applicant: 'Treasure Coast Ventures', owner: 'St. Lucie County Housing LLC',
            project: 'Port St. Lucie Garden Homes',
            county: 'St. Lucie', location: '1950 SW Gatlin Blvd, Port St. Lucie, FL 34952',
            units: 340, daysAgo: 4,
            permitURL: 'https://www.sfwmd.gov/regpermitting',
            lat: 27.2730, lon: -80.3582
        },
        {
            id: 'NWF-2026-00221', district: 'NWFWMD', status: 'New Application',
            type: 'Surface Water Management',
            applicant: 'Gulf Breeze Properties LLC', owner: 'Santa Rosa Land Trust',
            project: 'Navarre Waterside Community',
            county: 'Santa Rosa', location: '8600 Navarre Pkwy, Navarre, FL 32566',
            units: 112, daysAgo: 2,
            permitURL: 'https://permitting.sjrwmd.com/nwep/',
            lat: 30.4018, lon: -86.8632
        },
        {
            id: 'SRW-2026-00554', district: 'SRWMD', status: 'Approved',
            type: 'Environmental Resource Permit',
            applicant: 'Marion Oaks Development', owner: 'Marion County Growth Partners',
            project: 'Ocala Forest Ridge Homes',
            county: 'Marion', location: '4600 SW 60th Ave, Ocala, FL 34482',
            units: 76, daysAgo: 7,
            permitURL: 'https://permitting.sjrwmd.com/srep/',
            lat: 29.1872, lon: -82.1401
        },
        {
            id: 'SJR-2026-03871', district: 'SJRWMD', status: 'New Application',
            type: 'Well Construction',
            applicant: 'Brevard Coastal Builders', owner: 'Space Coast Realty Trust',
            project: 'Melbourne Beach Dunes Residences',
            county: 'Brevard', location: '3100 N Harbor City Blvd, Melbourne, FL 32901',
            units: 148, daysAgo: 1,
            permitURL: 'https://permitting.sjrwmd.com/epermitting/jsp/Search.do?permitNumber=SJR-2026-03871&theAction=searchDetail',
            lat: 28.0836, lon: -80.6081
        },
        {
            id: 'SWF-2026-12021', district: 'SWFWMD', status: 'Approved',
            type: 'Water Use Permit',
            applicant: 'Citrus Hills Development Co', owner: 'Citrus County Land Trust',
            project: 'Crystal River Preserve Homes',
            county: 'Citrus', location: '1200 N Suncoast Blvd, Crystal River, FL 34429',
            units: 52, daysAgo: 8,
            permitURL: 'https://www18.swfwmd.state.fl.us/search/search/searchwupsimple.aspx',
            lat: 28.9024, lon: -82.5927
        },
        {
            id: 'APP-2026-00121', district: 'SFWMD', status: 'New Application',
            type: 'Surface Water Management',
            applicant: 'Keys Gateway Corp', owner: 'Monroe County Developers',
            project: 'Key Largo Ocean View Condominiums',
            county: 'Monroe', location: '103800 Overseas Hwy, Key Largo, FL 33037',
            units: 84, daysAgo: 0,
            permitURL: 'https://www.sfwmd.gov/regpermitting',
            lat: 25.0865, lon: -80.4473
        },
        {
            id: 'NWF-2026-00215', district: 'NWFWMD', status: 'Approved',
            type: 'Right of Way',
            applicant: 'Tallahassee Living LLC', owner: 'Leon County Properties Inc',
            project: 'Tallahassee Canopy Oaks Village',
            county: 'Leon', location: '6300 Thomasville Rd, Tallahassee, FL 32312',
            units: 168, daysAgo: 5,
            permitURL: 'https://permitting.sjrwmd.com/nwep/',
            lat: 30.4383, lon: -84.2807
        }
    ];

    return rawData.map(d => ({
        ...d,
        dateSubmitted: new Date(now.getTime() - (d.daysAgo + 5) * day),
        dateUpdated: new Date(now.getTime() - d.daysAgo * day)
    })).sort((a, b) => b.dateUpdated - a.dateUpdated);
}
