import SwiftUI

struct PermitAlertCard: View {
    let permit: Permit
    let onTapDistrict: () -> Void

    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header: Status badge + District tag
            HStack {
                statusBadge
                Spacer()
                districtTag
            }

            // Project Name
            Text(permit.projectName)
                .font(.headline)
                .foregroundColor(.primary)
                .lineLimit(2)

            // Key Info Grid
            VStack(alignment: .leading, spacing: 8) {
                infoRow(icon: "building.2", label: "Units", value: "\(permit.numberOfUnits) residential units")
                infoRow(icon: "mappin.circle", label: "Location", value: permit.location)
                infoRow(icon: "person.fill", label: "Applicant", value: permit.applicantName)
                infoRow(icon: "person.2.fill", label: "Owner", value: permit.ownerName)
            }

            Divider()

            // Footer: Date + Link
            HStack {
                Label {
                    Text(permit.dateUpdated, style: .relative)
                        .font(.caption)
                        .foregroundColor(.secondary)
                } icon: {
                    Image(systemName: "clock")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Spacer()

                Button(action: onTapDistrict) {
                    Label("View on District Site", systemImage: "arrow.up.right.square")
                        .font(.caption)
                        .fontWeight(.medium)
                }
            }
        }
        .padding(16)
        .background(cardBackground)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .shadow(color: .black.opacity(colorScheme == .dark ? 0.3 : 0.08), radius: 8, y: 2)
    }

    // MARK: - Subviews

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

    private var districtTag: some View {
        Text(permit.district.rawValue)
            .font(.caption2)
            .fontWeight(.bold)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(Color.blue.opacity(0.1))
            .foregroundColor(.blue)
            .clipShape(Capsule())
    }

    private func infoRow(icon: String, label: String, value: String) -> some View {
        HStack(alignment: .top, spacing: 8) {
            Image(systemName: icon)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .frame(width: 20)
            VStack(alignment: .leading, spacing: 1) {
                Text(label)
                    .font(.caption2)
                    .foregroundColor(.secondary)
                    .textCase(.uppercase)
                Text(value)
                    .font(.subheadline)
                    .foregroundColor(.primary)
            }
        }
    }

    private var cardBackground: some View {
        RoundedRectangle(cornerRadius: 12)
            .fill(colorScheme == .dark ? Color(.systemGray6) : .white)
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
    ScrollView {
        PermitAlertCard(
            permit: Permit.samplePermits[0],
            onTapDistrict: {}
        )
        .padding()
    }
}
