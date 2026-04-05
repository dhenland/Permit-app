import SwiftUI

struct PermitListView: View {
    @StateObject private var viewModel = PermitListViewModel()
    @State private var showingFilters = false
    @State private var selectedPermit: Permit?
    @Environment(\.openURL) private var openURL

    var body: some View {
        NavigationStack {
            ZStack {
                if viewModel.isLoading && viewModel.permits.isEmpty {
                    loadingView
                } else if let error = viewModel.errorMessage, viewModel.permits.isEmpty {
                    errorView(error)
                } else {
                    permitList
                }
            }
            .navigationTitle("Permit Alerts")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    filterButton
                }
                ToolbarItem(placement: .topBarLeading) {
                    NavigationLink {
                        SettingsView()
                    } label: {
                        Image(systemName: "gearshape")
                    }
                }
            }
            .searchable(text: $viewModel.filterOptions.searchText, prompt: "Search permits...")
            .sheet(isPresented: $showingFilters) {
                FilterView(filterOptions: $viewModel.filterOptions)
            }
            .navigationDestination(item: $selectedPermit) { permit in
                PermitDetailView(permit: permit)
            }
        }
        .task {
            await viewModel.loadInitialData()
        }
    }

    // MARK: - Permit List with Infinite Scroll

    private var permitList: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                // Summary Header
                summaryHeader

                // Permit Cards
                ForEach(viewModel.filteredPermits) { permit in
                    Button {
                        selectedPermit = permit
                    } label: {
                        PermitAlertCard(permit: permit) {
                            if let url = permit.permitURL {
                                openURL(url)
                            }
                        }
                    }
                    .buttonStyle(.plain)
                    .onAppear {
                        Task {
                            await viewModel.loadMoreIfNeeded(currentItem: permit)
                        }
                    }
                }

                // Loading More Indicator
                if viewModel.isLoadingMore {
                    ProgressView()
                        .padding(.vertical, 20)
                }

                // End of List
                if !viewModel.hasMoreData && !viewModel.filteredPermits.isEmpty {
                    Text("All permits loaded")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .padding(.vertical, 20)
                }

                // Empty State
                if viewModel.filteredPermits.isEmpty && !viewModel.isLoading {
                    emptyFilterView
                }
            }
            .padding(.horizontal)
            .padding(.bottom, 20)
        }
        .refreshable {
            await viewModel.refresh()
        }
    }

    // MARK: - Summary Header

    private var summaryHeader: some View {
        VStack(spacing: 8) {
            HStack {
                Text(viewModel.statusSummary)
                    .font(.subheadline)
                    .foregroundColor(.secondary)

                Spacer()

                if let lastUpdated = viewModel.lastUpdated {
                    Text("Updated \(lastUpdated, style: .relative) ago")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }

            if viewModel.activeFilterCount > 0 {
                HStack {
                    Image(systemName: "line.3.horizontal.decrease.circle.fill")
                        .foregroundColor(.blue)
                    Text("\(viewModel.activeFilterCount) filter(s) active")
                        .font(.caption)
                        .foregroundColor(.blue)
                    Spacer()
                    Button("Clear") {
                        viewModel.resetFilters()
                    }
                    .font(.caption)
                }
            }
        }
        .padding(.vertical, 8)
    }

    // MARK: - Supporting Views

    private var filterButton: some View {
        Button {
            showingFilters = true
        } label: {
            ZStack(alignment: .topTrailing) {
                Image(systemName: "line.3.horizontal.decrease.circle")
                if viewModel.activeFilterCount > 0 {
                    Circle()
                        .fill(.red)
                        .frame(width: 8, height: 8)
                        .offset(x: 2, y: -2)
                }
            }
        }
    }

    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.2)
            Text("Loading permits...")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
    }

    private func errorView(_ message: String) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.largeTitle)
                .foregroundColor(.orange)
            Text(message)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            Button("Try Again") {
                Task { await viewModel.loadInitialData() }
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }

    private var emptyFilterView: some View {
        VStack(spacing: 16) {
            Image(systemName: "magnifyingglass")
                .font(.largeTitle)
                .foregroundColor(.secondary)
            Text("No permits match your filters")
                .font(.headline)
            Text("Try adjusting your filter criteria or search terms.")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            Button("Reset Filters") {
                viewModel.resetFilters()
            }
            .buttonStyle(.bordered)
        }
        .padding(.vertical, 40)
    }
}

// MARK: - Permit Hashable for Navigation

extension Permit: Hashable {
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}

#Preview {
    PermitListView()
}
