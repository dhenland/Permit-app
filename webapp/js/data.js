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
    'New Application': { cssClass: 'new-application', icon: '📋', isAlert: true },
    'Under Review':    { cssClass: 'under-review',    icon: '🕐', isAlert: false },
    'Approved':        { cssClass: 'approved',         icon: '✅', isAlert: true },
    'Denied':          { cssClass: 'denied',           icon: '❌', isAlert: false },
    'Expired':         { cssClass: 'expired',          icon: '⏰', isAlert: false }
};

function generateSamplePermits() {
    const now = new Date();
    const day = 24 * 60 * 60 * 1000;

    // Each district uses its own permit/application number format:
    //   SFWMD:  XX-NNNNNN-P (county code - sequence - P)
    //   SJRWMD: Individual ERP uses numeric IDs
    //   SWFWMD: ERP uses numeric permit IDs
    //   SRWMD:  Uses SJRWMD ePermit portal
    //   NWFWMD: Uses SJRWMD ePermit portal

    const rawData = [
        {
            permitNumber: '50-110245-P',
            applicationNumber: '50-110245-S',
            district: 'SFWMD', status: 'New Application',
            type: 'Environmental Resource Permit',
            applicant: 'GL Homes Ltd', owner: 'Avenir Holdings LLC',
            project: 'Avenir Phase 4 — Residential Village',
            county: 'Palm Beach',
            location: '12000 Avenir Dr, Palm Beach Gardens, FL 33418',
            units: 248, acreage: 84.77, daysAgo: 0,
            permitURL: 'https://www.sfwmd.gov/regpermitting',
            lat: 26.8465, lon: -80.1182
        },
        {
            permitNumber: '06-109812-P',
            applicationNumber: '06-109812-S',
            district: 'SFWMD', status: 'Approved',
            type: 'Environmental Resource Permit',
            applicant: 'Lennar Homes LLC', owner: 'Broward County Housing Authority',
            project: 'Coral Springs Waterway Village — SWM System',
            county: 'Broward',
            location: '11000 W Sample Rd, Coral Springs, FL 33071',
            units: 186, acreage: 42.3, daysAgo: 2,
            permitURL: 'https://www.sfwmd.gov/regpermitting',
            lat: 26.2712, lon: -80.2706
        },
        {
            permitNumber: '155420',
            applicationNumber: '155420-1',
            district: 'SJRWMD', status: 'New Application',
            type: 'Environmental Resource Permit',
            applicant: 'Minto Communities LLC', owner: 'Latitude Margaritaville Ventures',
            project: 'Latitude Margaritaville Daytona Beach — Phase 6',
            county: 'Volusia',
            location: '2400 LPGA Blvd, Daytona Beach, FL 32124',
            units: 312, acreage: 120.5, daysAgo: 1,
            permitURL: 'https://permitting.sjrwmd.com/epermitting/jsp/Search.do?theAction=PermitNumSearch',
            lat: 29.1608, lon: -81.0628
        },
        {
            permitNumber: '148791',
            applicationNumber: '148791-4',
            district: 'SJRWMD', status: 'Approved',
            type: 'Environmental Resource Permit',
            applicant: 'D.R. Horton Inc', owner: 'Flagler Land Holdings LLC',
            project: 'Grand Landings Phase 3 — Residential Subdivision',
            county: 'Flagler',
            location: '100 Grand Landings Pkwy, Palm Coast, FL 32164',
            units: 124, acreage: 58.2, daysAgo: 3,
            permitURL: 'https://permitting.sjrwmd.com/epermitting/jsp/Search.do?theAction=PermitNumSearch',
            lat: 29.5453, lon: -81.2401
        },
        {
            permitNumber: '43044694',
            applicationNumber: '732499',
            district: 'SWFWMD', status: 'New Application',
            type: 'Environmental Resource Permit',
            applicant: 'Metro Development Group', owner: 'Pasco County Land Trust',
            project: 'Epperson Ranch Phase 5 — Residential Community',
            county: 'Pasco',
            location: '24840 Epperson Trail Blvd, Wesley Chapel, FL 33545',
            units: 420, acreage: 210.4, daysAgo: 0,
            permitURL: 'https://www18.swfwmd.state.fl.us/erp/erp/search/ERPSearch.aspx',
            lat: 28.2436, lon: -82.3140
        },
        {
            permitNumber: '43041587',
            applicationNumber: '718003',
            district: 'SWFWMD', status: 'Approved',
            type: 'Environmental Resource Permit',
            applicant: 'Neal Communities', owner: 'Sarasota Bay Land Corp',
            project: 'Grand Park — Residential and SWM System',
            county: 'Sarasota',
            location: '8350 Fruitville Rd, Sarasota, FL 34240',
            units: 156, acreage: 73.6, daysAgo: 4,
            permitURL: 'https://www18.swfwmd.state.fl.us/erp/erp/search/ERPSearch.aspx',
            lat: 27.3323, lon: -82.4072
        },
        {
            permitNumber: 'ERP-033-233671',
            applicationNumber: 'ERP-033-233671-1',
            district: 'SRWMD', status: 'New Application',
            type: 'Environmental Resource Permit',
            applicant: 'Dream Finders Homes', owner: 'Alachua County Land Corp',
            project: 'Edgemore at Town of Tioga — Lots and SWM',
            county: 'Alachua',
            location: '7400 W Newberry Rd, Gainesville, FL 32606',
            units: 88, acreage: 34.1, daysAgo: 1,
            permitURL: 'https://permitting.sjrwmd.com/srep/',
            lat: 29.6516, lon: -82.3248
        },
        {
            permitNumber: 'ERP-023-228894',
            applicationNumber: 'ERP-023-228894-2',
            district: 'SRWMD', status: 'Approved',
            type: 'Environmental Resource Permit',
            applicant: 'Forestar Group Inc', owner: 'Lake City Properties LLC',
            project: 'Rose Creek — Residential Subdivision and SWM',
            county: 'Columbia',
            location: '3500 SW Sisters Welcome Rd, Lake City, FL 32025',
            units: 64, acreage: 22.8, daysAgo: 5,
            permitURL: 'https://permitting.sjrwmd.com/srep/',
            lat: 30.1697, lon: -82.6593
        },
        {
            permitNumber: 'ERP-046-243018',
            applicationNumber: 'ERP-046-243018-1',
            district: 'NWFWMD', status: 'New Application',
            type: 'Environmental Resource Permit',
            applicant: 'Kolter Homes LLC', owner: 'Destin West Holdings',
            project: 'Destin Harbor Residences — SWM and Wetlands',
            county: 'Okaloosa',
            location: '650 Harbor Blvd, Destin, FL 32541',
            units: 196, acreage: 45.3, daysAgo: 0,
            permitURL: 'https://permitting.sjrwmd.com/nwep/',
            lat: 30.3935, lon: -86.4958
        },
        {
            permitNumber: 'ERP-003-239456',
            applicationNumber: 'ERP-003-239456-3',
            district: 'NWFWMD', status: 'Approved',
            type: 'Environmental Resource Permit',
            applicant: 'Adams Homes LLC', owner: 'Bay County Development Authority',
            project: 'SummerView — Residential Lots and SWM',
            county: 'Bay',
            location: '15600 Panama City Beach Pkwy, Panama City Beach, FL 32413',
            units: 144, acreage: 52.7, daysAgo: 2,
            permitURL: 'https://permitting.sjrwmd.com/nwep/',
            lat: 30.1766, lon: -85.8055
        },
        {
            permitNumber: '13-110098-P',
            applicationNumber: '13-110098-S',
            district: 'SFWMD', status: 'New Application',
            type: 'Environmental Resource Permit',
            applicant: 'Lennar Homes LLC', owner: 'Miami-Dade Residential Trust',
            project: 'Centris — Single-Family Residential and SWM',
            county: 'Miami-Dade',
            location: '28000 SW 132nd Ave, Homestead, FL 33033',
            units: 172, acreage: 96.2, daysAgo: 3,
            permitURL: 'https://www.sfwmd.gov/regpermitting',
            lat: 25.4987, lon: -80.4476
        },
        {
            permitNumber: '142365',
            applicationNumber: '142365-6',
            district: 'SJRWMD', status: 'Approved',
            type: 'Environmental Resource Permit',
            applicant: 'ICI Homes', owner: 'Eagle Landing Associates LLC',
            project: 'Eagle Landing at Oakleaf — Phase 7 Expansion',
            county: 'Clay',
            location: '3975 Eagle Landing Pkwy, Orange Park, FL 32065',
            units: 96, acreage: 38.5, daysAgo: 6,
            permitURL: 'https://permitting.sjrwmd.com/epermitting/jsp/Search.do?theAction=PermitNumSearch',
            lat: 30.1034, lon: -81.7389
        },
        {
            permitNumber: '43043528',
            applicationNumber: '729841',
            district: 'SWFWMD', status: 'New Application',
            type: 'Environmental Resource Permit',
            applicant: 'Taylor Morrison', owner: 'Central FL Investment Group',
            project: 'Lakeland Highlands — SWM and Residential Lots',
            county: 'Polk',
            location: '5800 Lakeland Highlands Rd, Lakeland, FL 33813',
            units: 208, acreage: 115.3, daysAgo: 1,
            permitURL: 'https://www18.swfwmd.state.fl.us/erp/erp/search/ERPSearch.aspx',
            lat: 27.9595, lon: -81.9298
        },
        {
            permitNumber: '56-109654-P',
            applicationNumber: '56-109654-S',
            district: 'SFWMD', status: 'Approved',
            type: 'Environmental Resource Permit',
            applicant: 'Mattamy Homes', owner: 'Tradition Land Company LLC',
            project: 'Tradition Hilltop — Residential and SWM',
            county: 'St. Lucie',
            location: '10900 SW Village Pkwy, Port St. Lucie, FL 34987',
            units: 340, acreage: 142.8, daysAgo: 4,
            permitURL: 'https://www.sfwmd.gov/regpermitting',
            lat: 27.2330, lon: -80.3982
        },
        {
            permitNumber: 'ERP-057-241792',
            applicationNumber: 'ERP-057-241792-1',
            district: 'NWFWMD', status: 'New Application',
            type: 'Environmental Resource Permit',
            applicant: 'Holiday Builders Inc', owner: 'Santa Rosa Land Trust',
            project: 'Navarre Waterside — Residential Lots and SWM',
            county: 'Santa Rosa',
            location: '8600 Navarre Pkwy, Navarre, FL 32566',
            units: 112, acreage: 48.9, daysAgo: 2,
            permitURL: 'https://permitting.sjrwmd.com/nwep/',
            lat: 30.4018, lon: -86.8632
        },
        {
            permitNumber: 'ERP-042-227310',
            applicationNumber: 'ERP-042-227310-4',
            district: 'SRWMD', status: 'Approved',
            type: 'Environmental Resource Permit',
            applicant: 'On Top of the World Communities', owner: 'Marion County Growth Partners',
            project: 'Del Webb Stone Creek — Phase 12 Expansion',
            county: 'Marion',
            location: '8045 SW 62nd Ave Rd, Ocala, FL 34476',
            units: 76, acreage: 31.4, daysAgo: 7,
            permitURL: 'https://permitting.sjrwmd.com/srep/',
            lat: 29.1272, lon: -82.1801
        },
        {
            permitNumber: '151887',
            applicationNumber: '151887-2',
            district: 'SJRWMD', status: 'New Application',
            type: 'Environmental Resource Permit',
            applicant: 'Meritage Homes Corp', owner: 'Viera Company LLC',
            project: 'Addison Village at Viera — Phase 3 SWM',
            county: 'Brevard',
            location: '6000 Stadium Pkwy, Viera, FL 32940',
            units: 148, acreage: 67.2, daysAgo: 1,
            permitURL: 'https://permitting.sjrwmd.com/epermitting/jsp/Search.do?theAction=PermitNumSearch',
            lat: 28.2536, lon: -80.7281
        },
        {
            permitNumber: '43039872',
            applicationNumber: '705194',
            district: 'SWFWMD', status: 'Approved',
            type: 'Environmental Resource Permit',
            applicant: 'Homes by WestBay', owner: 'Citrus County Land Trust',
            project: 'Citrus Hills — Brentwood Phase 2',
            county: 'Citrus',
            location: '2400 N Terra Vista Blvd, Citrus Hills, FL 34442',
            units: 52, acreage: 19.6, daysAgo: 8,
            permitURL: 'https://www18.swfwmd.state.fl.us/erp/erp/search/ERPSearch.aspx',
            lat: 28.9224, lon: -82.4527
        },
        {
            permitNumber: '44-110301-P',
            applicationNumber: '44-110301-S',
            district: 'SFWMD', status: 'New Application',
            type: 'Environmental Resource Permit',
            applicant: 'Pritam Singh Development', owner: 'Ocean Reef Community Assoc',
            project: 'Ocean Reef Residences — SWM and Utilities',
            county: 'Monroe',
            location: '35 Ocean Reef Dr, Key Largo, FL 33037',
            units: 84, acreage: 12.4, daysAgo: 0,
            permitURL: 'https://www.sfwmd.gov/regpermitting',
            lat: 25.2865, lon: -80.2673
        },
        {
            permitNumber: 'ERP-037-240105',
            applicationNumber: 'ERP-037-240105-2',
            district: 'NWFWMD', status: 'Approved',
            type: 'Environmental Resource Permit',
            applicant: 'Ox Bottom Crest LLC', owner: 'Leon County Properties Inc',
            project: 'Canopy at Welaunee — Phase 5 SWM System',
            county: 'Leon',
            location: '6300 Welaunee Blvd, Tallahassee, FL 32317',
            units: 168, acreage: 78.4, daysAgo: 5,
            permitURL: 'https://permitting.sjrwmd.com/nwep/',
            lat: 30.4983, lon: -84.1607
        }
    ];

    return rawData.map(d => ({
        ...d,
        id: d.permitNumber,
        dateSubmitted: new Date(now.getTime() - (d.daysAgo + 5) * day),
        dateUpdated: new Date(now.getTime() - d.daysAgo * day)
    })).sort((a, b) => b.dateUpdated - a.dateUpdated);
}
