import Foundation

struct FilterOptions: Equatable {
    var selectedDistricts: Set<WaterDistrict> = Set(WaterDistrict.allCases)
    var selectedStatuses: Set<PermitStatus> = Set([.newApplication, .approved])
    var searchText: String = ""
    var sortOrder: SortOrder = .newest

    enum SortOrder: String, CaseIterable, Identifiable {
        case newest = "Newest First"
        case oldest = "Oldest First"
        case unitsHigh = "Most Units"
        case unitsLow = "Fewest Units"

        var id: String { rawValue }
    }

    var isDefault: Bool {
        selectedDistricts == Set(WaterDistrict.allCases) &&
        selectedStatuses == Set([.newApplication, .approved]) &&
        searchText.isEmpty &&
        sortOrder == .newest
    }

    func matches(_ permit: Permit) -> Bool {
        guard selectedDistricts.contains(permit.district) else { return false }
        guard selectedStatuses.contains(permit.status) else { return false }

        if !searchText.isEmpty {
            let query = searchText.lowercased()
            let searchableFields = [
                permit.applicantName,
                permit.ownerName,
                permit.projectName,
                permit.county,
                permit.location,
                permit.applicationNumber
            ]
            guard searchableFields.contains(where: { $0.lowercased().contains(query) }) else {
                return false
            }
        }

        return true
    }

    func sorted(_ permits: [Permit]) -> [Permit] {
        switch sortOrder {
        case .newest:
            return permits.sorted { $0.dateUpdated > $1.dateUpdated }
        case .oldest:
            return permits.sorted { $0.dateUpdated < $1.dateUpdated }
        case .unitsHigh:
            return permits.sorted { $0.numberOfUnits > $1.numberOfUnits }
        case .unitsLow:
            return permits.sorted { $0.numberOfUnits < $1.numberOfUnits }
        }
    }
}
