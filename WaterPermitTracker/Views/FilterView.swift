import SwiftUI

struct FilterView: View {
    @Binding var filterOptions: FilterOptions
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                // District Filter
                Section("Water Management Districts") {
                    ForEach(WaterDistrict.allCases) { district in
                        Toggle(isOn: binding(for: district)) {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(district.rawValue)
                                    .font(.body)
                                    .fontWeight(.medium)
                                Text(district.fullName)
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                }

                // Status Filter
                Section("Permit Status") {
                    ForEach(PermitStatus.allCases) { status in
                        Toggle(isOn: binding(for: status)) {
                            Label(status.rawValue, systemImage: status.iconName)
                        }
                    }
                }

                // Sort Order
                Section("Sort Order") {
                    Picker("Sort By", selection: $filterOptions.sortOrder) {
                        ForEach(FilterOptions.SortOrder.allCases) { order in
                            Text(order.rawValue).tag(order)
                        }
                    }
                    .pickerStyle(.inline)
                    .labelsHidden()
                }

                // Reset
                Section {
                    Button("Reset All Filters", role: .destructive) {
                        filterOptions = FilterOptions()
                    }
                    .disabled(filterOptions.isDefault)
                }
            }
            .navigationTitle("Filters")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }

    // MARK: - Bindings

    private func binding(for district: WaterDistrict) -> Binding<Bool> {
        Binding(
            get: { filterOptions.selectedDistricts.contains(district) },
            set: { isSelected in
                if isSelected {
                    filterOptions.selectedDistricts.insert(district)
                } else {
                    filterOptions.selectedDistricts.remove(district)
                }
            }
        )
    }

    private func binding(for status: PermitStatus) -> Binding<Bool> {
        Binding(
            get: { filterOptions.selectedStatuses.contains(status) },
            set: { isSelected in
                if isSelected {
                    filterOptions.selectedStatuses.insert(status)
                } else {
                    filterOptions.selectedStatuses.remove(status)
                }
            }
        )
    }
}

#Preview {
    FilterView(filterOptions: .constant(FilterOptions()))
}
