import Foundation

// MARK: - Water Management Districts

enum WaterDistrict: String, Codable, CaseIterable, Identifiable {
    case sfwmd = "SFWMD"
    case sjrwmd = "SJRWMD"
    case swfwmd = "SWFWMD"
    case srwmd = "SRWMD"
    case nwfwmd = "NWFWMD"

    var id: String { rawValue }

    var fullName: String {
        switch self {
        case .sfwmd: return "South Florida Water Management District"
        case .sjrwmd: return "St. Johns River Water Management District"
        case .swfwmd: return "Southwest Florida Water Management District"
        case .srwmd: return "Suwannee River Water Management District"
        case .nwfwmd: return "Northwest Florida Water Management District"
        }
    }

    var shortName: String {
        switch self {
        case .sfwmd: return "South Florida"
        case .sjrwmd: return "St. Johns River"
        case .swfwmd: return "Southwest Florida"
        case .srwmd: return "Suwannee River"
        case .nwfwmd: return "Northwest Florida"
        }
    }

    var websiteURL: URL {
        switch self {
        case .sfwmd: return URL(string: "https://www.sfwmd.gov/doing-business-with-us/permits")!
        case .sjrwmd: return URL(string: "https://permitting.sjrwmd.com/epermitting/jsp/public/publicSearch.jsp")!
        case .swfwmd: return URL(string: "https://www.swfwmd.state.fl.us/permits")!
        case .srwmd: return URL(string: "https://www.mysuwanneeriver.com/162/Permits")!
        case .nwfwmd: return URL(string: "https://www.nwfwater.com/Permits")!
        }
    }

    var color: String {
        switch self {
        case .sfwmd: return "DistrictBlue"
        case .sjrwmd: return "DistrictGreen"
        case .swfwmd: return "DistrictTeal"
        case .srwmd: return "DistrictOrange"
        case .nwfwmd: return "DistrictPurple"
        }
    }
}

// MARK: - Permit Status

enum PermitStatus: String, Codable, CaseIterable, Identifiable {
    case newApplication = "New Application"
    case underReview = "Under Review"
    case approved = "Approved"
    case denied = "Denied"
    case expired = "Expired"

    var id: String { rawValue }

    var iconName: String {
        switch self {
        case .newApplication: return "doc.badge.plus"
        case .underReview: return "clock.badge"
        case .approved: return "checkmark.seal.fill"
        case .denied: return "xmark.seal.fill"
        case .expired: return "clock.badge.exclamationmark"
        }
    }

    var isAlert: Bool {
        self == .newApplication || self == .approved
    }
}

// MARK: - Permit Type

enum PermitType: String, Codable, CaseIterable, Identifiable {
    case environmentalResourcePermit = "Environmental Resource Permit"
    case waterUsePermit = "Water Use Permit"
    case rightOfWay = "Right of Way"
    case wellConstruction = "Well Construction"
    case surfaceWater = "Surface Water Management"

    var id: String { rawValue }

    var shortName: String {
        switch self {
        case .environmentalResourcePermit: return "ERP"
        case .waterUsePermit: return "WUP"
        case .rightOfWay: return "ROW"
        case .wellConstruction: return "Well"
        case .surfaceWater: return "SWM"
        }
    }
}

// MARK: - Permit Model

struct Permit: Identifiable, Codable, Equatable {
    let id: String
    let applicationNumber: String
    let district: WaterDistrict
    let status: PermitStatus
    let permitType: PermitType
    let applicantName: String
    let ownerName: String
    let projectName: String
    let county: String
    let location: String
    let numberOfUnits: Int
    let dateSubmitted: Date
    let dateUpdated: Date
    let districtPermitURL: String
    let latitude: Double?
    let longitude: Double?

    var alertTitle: String {
        switch status {
        case .newApplication:
            return "New Application Filed"
        case .approved:
            return "Permit Approved"
        default:
            return "Permit Update"
        }
    }

    var alertSubtitle: String {
        "\(numberOfUnits) units · \(location)"
    }

    var permitURL: URL? {
        URL(string: districtPermitURL)
    }

    static func == (lhs: Permit, rhs: Permit) -> Bool {
        lhs.id == rhs.id
    }
}

// MARK: - Sample Data

extension Permit {
    static let samplePermits: [Permit] = {
        let calendar = Calendar.current
        let now = Date()
        var permits: [Permit] = []

        let sampleData: [(String, WaterDistrict, PermitStatus, PermitType, String, String, String, String, String, Int, Int, String, Double, Double)] = [
            ("APP-2026-00142", .sfwmd, .newApplication, .environmentalResourcePermit,
             "Sunshine Development LLC", "Palm Beach Land Trust",
             "Palm Beach Gardens Residential Phase 3",
             "Palm Beach", "Palm Beach Gardens, FL 33418",
             248, 0,
             "https://my.sfwmd.gov/ePermitting/PopupPermit.do?permit_number=APP-2026-00142",
             26.8234, -80.1389),

            ("APP-2026-00139", .sfwmd, .approved, .surfaceWater,
             "Coral Springs Holdings Inc", "Broward County Housing Authority",
             "Coral Springs Waterway Village",
             "Broward", "Coral Springs, FL 33071",
             186, 2,
             "https://my.sfwmd.gov/ePermitting/PopupPermit.do?permit_number=APP-2026-00139",
             26.2712, -80.2706),

            ("SJR-2026-03891", .sjrwmd, .newApplication, .waterUsePermit,
             "Atlantic Coast Builders", "Volusia Development Group",
             "Daytona Shores Residential Community",
             "Volusia", "Daytona Beach, FL 32114",
             312, 1,
             "https://permitting.sjrwmd.com/epermitting/jsp/public/publicPermit.jsp?permit=SJR-2026-03891",
             29.2108, -81.0228),

            ("SJR-2026-03887", .sjrwmd, .approved, .environmentalResourcePermit,
             "Heritage Homes of Florida", "Flagler Estates LLC",
             "Flagler Oaks Subdivision",
             "Flagler", "Palm Coast, FL 32137",
             124, 3,
             "https://permitting.sjrwmd.com/epermitting/jsp/public/publicPermit.jsp?permit=SJR-2026-03887",
             29.5847, -81.2079),

            ("SWF-2026-12045", .swfwmd, .newApplication, .environmentalResourcePermit,
             "Bay Area Development Corp", "Hillsborough Investment Trust",
             "Tampa Palms North Expansion",
             "Hillsborough", "Tampa, FL 33647",
             420, 0,
             "https://www18.swfwmd.state.fl.us/erp/erp/search/PermitSearchResults.aspx?permit=SWF-2026-12045",
             28.0836, -82.3940),

            ("SWF-2026-12038", .swfwmd, .approved, .waterUsePermit,
             "Sarasota Bay Homes LLC", "Gulf Coast Properties",
             "Sarasota Springs Community",
             "Sarasota", "Sarasota, FL 34238",
             156, 4,
             "https://www18.swfwmd.state.fl.us/erp/erp/search/PermitSearchResults.aspx?permit=SWF-2026-12038",
             27.2823, -82.4572),

            ("SRW-2026-00567", .srwmd, .newApplication, .wellConstruction,
             "North Florida Living Inc", "Alachua County Land Corp",
             "Gainesville Green Estates",
             "Alachua", "Gainesville, FL 32606",
             88, 1,
             "https://www.mysuwanneeriver.com/permits/SRW-2026-00567",
             29.6516, -82.3248),

            ("SRW-2026-00561", .srwmd, .approved, .surfaceWater,
             "Columbia County Developers", "Lake City Properties LLC",
             "Lake City Lakefront Villas",
             "Columbia", "Lake City, FL 32025",
             64, 5,
             "https://www.mysuwanneeriver.com/permits/SRW-2026-00561",
             30.1897, -82.6393),

            ("NWF-2026-00234", .nwfwmd, .newApplication, .environmentalResourcePermit,
             "Emerald Coast Builders", "Okaloosa Holdings LLC",
             "Destin Harbor Residences",
             "Okaloosa", "Destin, FL 32541",
             196, 0,
             "https://www.nwfwater.com/permits/NWF-2026-00234",
             30.3935, -86.4958),

            ("NWF-2026-00229", .nwfwmd, .approved, .waterUsePermit,
             "Panhandle Property Group", "Bay County Development Authority",
             "Panama City Beach Coastal Living",
             "Bay", "Panama City Beach, FL 32413",
             144, 2,
             "https://www.nwfwater.com/permits/NWF-2026-00229",
             30.1766, -85.8055),

            ("APP-2026-00135", .sfwmd, .newApplication, .waterUsePermit,
             "Everglades Edge Development", "Miami-Dade Residential Trust",
             "Homestead Prairie Townhomes",
             "Miami-Dade", "Homestead, FL 33033",
             172, 3,
             "https://my.sfwmd.gov/ePermitting/PopupPermit.do?permit_number=APP-2026-00135",
             25.4687, -80.4776),

            ("SJR-2026-03879", .sjrwmd, .approved, .surfaceWater,
             "Clay County Construction Corp", "Fleming Island Associates",
             "Fleming Island Waterfront Estates",
             "Clay", "Fleming Island, FL 32003",
             96, 6,
             "https://permitting.sjrwmd.com/epermitting/jsp/public/publicPermit.jsp?permit=SJR-2026-03879",
             30.0934, -81.7189),

            ("SWF-2026-12029", .swfwmd, .newApplication, .rightOfWay,
             "Polk County Homes Inc", "Central FL Investment Group",
             "Lakeland Heights Subdivision",
             "Polk", "Lakeland, FL 33809",
             208, 1,
             "https://www18.swfwmd.state.fl.us/erp/erp/search/PermitSearchResults.aspx?permit=SWF-2026-12029",
             28.0395, -81.9498),

            ("APP-2026-00128", .sfwmd, .approved, .environmentalResourcePermit,
             "Treasure Coast Ventures", "St. Lucie County Housing LLC",
             "Port St. Lucie Garden Homes",
             "St. Lucie", "Port St. Lucie, FL 34952",
             340, 4,
             "https://my.sfwmd.gov/ePermitting/PopupPermit.do?permit_number=APP-2026-00128",
             27.2730, -80.3582),

            ("NWF-2026-00221", .nwfwmd, .newApplication, .surfaceWater,
             "Gulf Breeze Properties LLC", "Santa Rosa Land Trust",
             "Navarre Waterside Community",
             "Santa Rosa", "Navarre, FL 32566",
             112, 2,
             "https://www.nwfwater.com/permits/NWF-2026-00221",
             30.4018, -86.8632),

            ("SRW-2026-00554", .srwmd, .approved, .environmentalResourcePermit,
             "Marion Oaks Development", "Marion County Growth Partners",
             "Ocala Forest Ridge Homes",
             "Marion", "Ocala, FL 34482",
             76, 7,
             "https://www.mysuwanneeriver.com/permits/SRW-2026-00554",
             29.1872, -82.1401),

            ("SJR-2026-03871", .sjrwmd, .newApplication, .wellConstruction,
             "Brevard Coastal Builders", "Space Coast Realty Trust",
             "Melbourne Beach Dunes Residences",
             "Brevard", "Melbourne, FL 32901",
             148, 1,
             "https://permitting.sjrwmd.com/epermitting/jsp/public/publicPermit.jsp?permit=SJR-2026-03871",
             28.0836, -80.6081),

            ("SWF-2026-12021", .swfwmd, .approved, .waterUsePermit,
             "Citrus Hills Development Co", "Citrus County Land Trust",
             "Crystal River Preserve Homes",
             "Citrus", "Crystal River, FL 34429",
             52, 8,
             "https://www18.swfwmd.state.fl.us/erp/erp/search/PermitSearchResults.aspx?permit=SWF-2026-12021",
             28.9024, -82.5927),

            ("APP-2026-00121", .sfwmd, .newApplication, .surfaceWater,
             "Keys Gateway Corp", "Monroe County Developers",
             "Key Largo Ocean View Condominiums",
             "Monroe", "Key Largo, FL 33037",
             84, 0,
             "https://my.sfwmd.gov/ePermitting/PopupPermit.do?permit_number=APP-2026-00121",
             25.0865, -80.4473),

            ("NWF-2026-00215", .nwfwmd, .approved, .rightOfWay,
             "Tallahassee Living LLC", "Leon County Properties Inc",
             "Tallahassee Canopy Oaks Village",
             "Leon", "Tallahassee, FL 32312",
             168, 5,
             "https://www.nwfwater.com/permits/NWF-2026-00215",
             30.4383, -84.2807),
        ]

        for (index, data) in sampleData.enumerated() {
            let daysAgo = data.10
            let dateSubmitted = calendar.date(byAdding: .day, value: -daysAgo - 5, to: now)!
            let dateUpdated = calendar.date(byAdding: .day, value: -daysAgo, to: now)!

            permits.append(Permit(
                id: data.0,
                applicationNumber: data.0,
                district: data.1,
                status: data.2,
                permitType: data.3,
                applicantName: data.4,
                ownerName: data.5,
                projectName: data.6,
                county: data.7,
                location: data.8,
                numberOfUnits: data.9,
                dateSubmitted: dateSubmitted,
                dateUpdated: dateUpdated,
                districtPermitURL: data.11,
                latitude: data.12,
                longitude: data.13
            ))
        }

        return permits.sorted { $0.dateUpdated > $1.dateUpdated }
    }()
}
