import Foundation
import SwiftUI

@MainActor
final class PermitListViewModel: ObservableObject {
    // MARK: - Published State

    @Published var permits: [Permit] = []
    @Published var isLoading = false
    @Published var isLoadingMore = false
    @Published var hasMoreData = true
    @Published var errorMessage: String?
    @Published var filterOptions = FilterOptions()
    @Published var lastUpdated: Date?

    // MARK: - Pagination

    private var currentPage = 0
    private let pageSize = 10
    private var allPermits: [Permit] = []

    // MARK: - Computed Properties

    var filteredPermits: [Permit] {
        let filtered = permits.filter { filterOptions.matches($0) }
        return filterOptions.sorted(filtered)
    }

    var activeFilterCount: Int {
        var count = 0
        if filterOptions.selectedDistricts.count < WaterDistrict.allCases.count { count += 1 }
        if filterOptions.selectedStatuses != Set([.newApplication, .approved]) { count += 1 }
        if filterOptions.sortOrder != .newest { count += 1 }
        return count
    }

    // MARK: - Data Loading

    func loadInitialData() async {
        guard !isLoading else { return }
        isLoading = true
        errorMessage = nil
        currentPage = 0
        hasMoreData = true

        do {
            let fetchedPermits = try await PermitDataService.shared.fetchPermits()
            allPermits = fetchedPermits
            permits = Array(fetchedPermits.prefix(pageSize))
            currentPage = 1
            hasMoreData = fetchedPermits.count > pageSize
            lastUpdated = Date()
        } catch {
            errorMessage = "Failed to load permits: \(error.localizedDescription)"
        }

        isLoading = false
    }

    func loadMoreIfNeeded(currentItem: Permit) async {
        guard let lastItem = filteredPermits.last,
              currentItem.id == lastItem.id,
              !isLoadingMore,
              hasMoreData else { return }

        isLoadingMore = true

        // Simulate loading delay for smooth UX
        try? await Task.sleep(nanoseconds: 300_000_000)

        let startIndex = currentPage * pageSize
        let endIndex = min(startIndex + pageSize, allPermits.count)

        if startIndex < allPermits.count {
            let newPermits = Array(allPermits[startIndex..<endIndex])
            permits.append(contentsOf: newPermits)
            currentPage += 1
            hasMoreData = endIndex < allPermits.count
        } else {
            hasMoreData = false
        }

        isLoadingMore = false
    }

    func refresh() async {
        currentPage = 0
        hasMoreData = true

        do {
            let fetchedPermits = try await PermitDataService.shared.fetchPermits(forceRefresh: true)
            allPermits = fetchedPermits
            permits = Array(fetchedPermits.prefix(pageSize))
            currentPage = 1
            hasMoreData = fetchedPermits.count > pageSize
            lastUpdated = Date()
            errorMessage = nil
        } catch {
            errorMessage = "Refresh failed: \(error.localizedDescription)"
        }
    }

    // MARK: - Helpers

    func resetFilters() {
        filterOptions = FilterOptions()
    }

    var statusSummary: String {
        let newApps = filteredPermits.filter { $0.status == .newApplication }.count
        let approved = filteredPermits.filter { $0.status == .approved }.count
        return "\(newApps) new · \(approved) approved"
    }
}
