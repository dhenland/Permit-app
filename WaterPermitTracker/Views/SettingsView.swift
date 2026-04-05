import SwiftUI

struct SettingsView: View {
    @AppStorage("notificationsEnabled") private var notificationsEnabled = true

    var body: some View {
        Form {
            Section("Notifications") {
                Toggle("Daily Update Alerts", isOn: $notificationsEnabled)
                    .onChange(of: notificationsEnabled) { _, newValue in
                        if newValue {
                            Task {
                                let granted = await NotificationService.shared.requestAuthorization()
                                if granted {
                                    NotificationService.shared.scheduleDailyUpdateReminder()
                                } else {
                                    notificationsEnabled = false
                                }
                            }
                        }
                    }

                if notificationsEnabled {
                    HStack {
                        Image(systemName: "clock")
                            .foregroundColor(.secondary)
                        Text("Updates daily at 4:00 PM EST")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                }
            }

            Section("Water Management Districts") {
                ForEach(WaterDistrict.allCases) { district in
                    NavigationLink {
                        DistrictInfoView(district: district)
                    } label: {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(district.rawValue)
                                .fontWeight(.medium)
                            Text(district.fullName)
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                }
            }

            Section("About") {
                HStack {
                    Text("Version")
                    Spacer()
                    Text("1.0.0")
                        .foregroundColor(.secondary)
                }

                HStack {
                    Text("Data Source")
                    Spacer()
                    Text("FL Water Management Districts")
                        .foregroundColor(.secondary)
                        .font(.caption)
                }

                Link(destination: URL(string: "https://floridadep.gov/water")!) {
                    HStack {
                        Text("Florida DEP Water")
                        Spacer()
                        Image(systemName: "arrow.up.right.square")
                    }
                }
            }
        }
        .navigationTitle("Settings")
    }
}

// MARK: - District Info View

struct DistrictInfoView: View {
    let district: WaterDistrict
    @Environment(\.openURL) private var openURL

    var body: some View {
        Form {
            Section("District Information") {
                VStack(alignment: .leading, spacing: 8) {
                    Text(district.fullName)
                        .font(.headline)
                    Text(district.rawValue)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding(.vertical, 4)
            }

            Section("Permits Portal") {
                Button {
                    openURL(district.websiteURL)
                } label: {
                    HStack {
                        Image(systemName: "globe")
                        Text("Open Permits Website")
                        Spacer()
                        Image(systemName: "arrow.up.right.square")
                    }
                }
            }
        }
        .navigationTitle(district.rawValue)
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    NavigationStack {
        SettingsView()
    }
}
