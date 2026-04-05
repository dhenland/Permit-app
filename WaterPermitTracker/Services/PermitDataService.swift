import Foundation

// MARK: - Permit Data Service

/// Service responsible for fetching and managing permit data from Florida's
/// five water management districts. In production, this would connect to
/// actual district APIs/RSS feeds. Currently uses realistic sample data.
actor PermitDataService {
    static let shared = PermitDataService()

    private var cachedPermits: [Permit] = []
    private var lastFetchDate: Date?

    // MARK: - Public API

    /// Fetches the latest permits, using cache if available and fresh
    func fetchPermits(forceRefresh: Bool = false) async throws -> [Permit] {
        if !forceRefresh, let lastFetch = lastFetchDate,
           Date().timeIntervalSince(lastFetch) < 3600,
           !cachedPermits.isEmpty {
            return cachedPermits
        }

        let permits = try await loadPermitsFromDistricts()
        cachedPermits = permits
        lastFetchDate = Date()
        return permits
    }

    /// Fetches the next page of permits for infinite scroll
    func fetchPermitPage(page: Int, pageSize: Int = 20) async throws -> [Permit] {
        let allPermits = try await fetchPermits()
        let startIndex = page * pageSize
        guard startIndex < allPermits.count else { return [] }
        let endIndex = min(startIndex + pageSize, allPermits.count)
        return Array(allPermits[startIndex..<endIndex])
    }

    /// Returns only permits that trigger alerts (new applications + approvals)
    func fetchAlertPermits() async throws -> [Permit] {
        let permits = try await fetchPermits()
        return permits.filter { $0.status.isAlert }
    }

    // MARK: - District Data Loading

    /// In production, this would make network requests to each district's API.
    /// For now, returns sample data with simulated network delay.
    private func loadPermitsFromDistricts() async throws -> [Permit] {
        // Simulate network request
        try await Task.sleep(nanoseconds: 500_000_000)

        // In production, these would be parallel API calls:
        // async let sfwmdPermits = fetchSFWMDPermits()
        // async let sjrwmdPermits = fetchSJRWMDPermits()
        // async let swfwmdPermits = fetchSWFWMDPermits()
        // async let srwmdPermits = fetchSRWMDPermits()
        // async let nwfwmdPermits = fetchNWFWMDPermits()

        return Permit.samplePermits
    }

    // MARK: - District-Specific Fetchers (Production Stubs)

    /*
     Production implementation would include:

     - SFWMD: Uses ePermitting portal API
       https://my.sfwmd.gov/ePermitting/

     - SJRWMD: Uses public permit search API
       https://permitting.sjrwmd.com/epermitting/

     - SWFWMD: Uses ERP search system
       https://www18.swfwmd.state.fl.us/erp/

     - SRWMD: Public records portal
       https://www.mysuwanneeriver.com/

     - NWFWMD: Permit records system
       https://www.nwfwater.com/Permits
    */
}

// MARK: - Persistence

extension PermitDataService {
    private static var cacheURL: URL {
        FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("permits_cache.json")
    }

    func saveToDisk() async {
        let permitsToSave = cachedPermits
        guard !permitsToSave.isEmpty else { return }
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        if let data = try? encoder.encode(permitsToSave) {
            try? data.write(to: Self.cacheURL)
        }
    }

    nonisolated func loadFromDisk() -> [Permit]? {
        guard let data = try? Data(contentsOf: Self.cacheURL) else { return nil }
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try? decoder.decode([Permit].self, from: data)
    }
}
