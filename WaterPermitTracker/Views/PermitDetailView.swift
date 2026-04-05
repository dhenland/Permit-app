import SwiftUI
import MapKit

struct PermitDetailView: View {
    let permit: Permit
    @Environment(\.openURL) private var openURL

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Status Header
                headerSection

                // Map Section
                if let lat = permit.latitude, let lon = permit.longitude {
                    mapSection(latitude: lat, longitude: lon)
                }

                // Details Sections
                projectDetailsSection
                applicantSection
                permitInfoSection

                // District Link Button
                districtLinkButton

                Spacer(minLength: 20)
            }
            .padding()
        }
        .navigationTitle("Permit Details")
        .navigationBarTitleDisplayMode(.inline)
    }

    // MARK: - Sections

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                statusBadge
                Spacer()
                Text(permit.district.fullName)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Text(permit.projectName)
                .font(.title2)
                .fontWeight(.bold)

            Text(permit.applicationNumber)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .textSelection(.enabled)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private func mapSection(latitude: Double, longitude: Double) -> some View {
        let region = MKCoordinateRegion(
            center: CLLocationCoordinate2D(latitude: latitude, longitude: longitude),
            span: MKCoordinateSpan(latitudeDelta: 0.05, longitudeDelta: 0.05)
        )

        return Map(initialPosition: .region(region)) {
            Marker(permit.projectName, coordinate: CLLocationCoordinate2D(latitude: latitude, longitude: longitude))
        }
        .frame(height: 200)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var projectDetailsSection: some View {
        detailSection(title: "Project Details") {
            detailRow(label: "Project", value: permit.projectName)
            detailRow(label: "County", value: permit.county)
            detailRow(label: "Location", value: permit.location)
            detailRow(label: "Residential Units", value: "\(permit.numberOfUnits)")
        }
    }

    private var applicantSection: some View {
        detailSection(title: "Applicant & Owner") {
            detailRow(label: "Applicant", value: permit.applicantName)
            detailRow(label: "Owner", value: permit.ownerName)
        }
    }

    private var permitInfoSection: some View {
        detailSection(title: "Permit Information") {
            detailRow(label: "Application #", value: permit.applicationNumber)
            detailRow(label: "Type", value: permit.permitType.rawValue)
            detailRow(label: "District", value: permit.district.fullName)
            detailRow(label: "Date Submitted", value: permit.dateSubmitted.formatted(date: .abbreviated, time: .omitted))
            detailRow(label: "Last Updated", value: permit.dateUpdated.formatted(date: .abbreviated, time: .omitted))
        }
    }

    private var districtLinkButton: some View {
        Button {
            if let url = permit.permitURL {
                openURL(url)
            }
        } label: {
            HStack {
                Image(systemName: "globe")
                Text("View on \(permit.district.shortName) District Website")
                Spacer()
                Image(systemName: "arrow.up.right.square")
            }
            .font(.body)
            .fontWeight(.medium)
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color.blue)
            .foregroundColor(.white)
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }

    // MARK: - Helper Views

    private var statusBadge: some View {
        HStack(spacing: 4) {
            Image(systemName: permit.status.iconName)
                .font(.caption)
            Text(permit.status.rawValue)
                .font(.caption)
                .fontWeight(.semibold)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .background(statusColor.opacity(0.15))
        .foregroundColor(statusColor)
        .clipShape(Capsule())
    }

    private func detailSection(title: String, @ViewBuilder content: () -> some View) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
                .padding(.bottom, 2)
            content()
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private func detailRow(label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(.caption)
                .foregroundColor(.secondary)
                .textCase(.uppercase)
            Text(value)
                .font(.body)
                .textSelection(.enabled)
        }
    }

    private var statusColor: Color {
        switch permit.status {
        case .newApplication: return .orange
        case .approved: return .green
        case .underReview: return .blue
        case .denied: return .red
        case .expired: return .gray
        }
    }
}

#Preview {
    NavigationStack {
        PermitDetailView(permit: Permit.samplePermits[0])
    }
}
