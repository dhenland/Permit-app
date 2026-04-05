import Foundation
import UserNotifications

/// Manages local notifications for permit alerts
final class NotificationService {
    static let shared = NotificationService()

    private init() {}

    // MARK: - Authorization

    func requestAuthorization() async -> Bool {
        do {
            let granted = try await UNUserNotificationCenter.current()
                .requestAuthorization(options: [.alert, .badge, .sound])
            return granted
        } catch {
            print("Notification authorization error: \(error)")
            return false
        }
    }

    // MARK: - Schedule Daily Update

    /// Schedules a daily notification trigger at 4:00 PM EST
    func scheduleDailyUpdateReminder() {
        let center = UNUserNotificationCenter.current()

        // Remove existing scheduled notifications
        center.removePendingNotificationRequests(withIdentifiers: ["daily-permit-update"])

        var dateComponents = DateComponents()
        dateComponents.hour = 16 // 4 PM
        dateComponents.minute = 0
        dateComponents.timeZone = TimeZone(identifier: "America/New_York")

        let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: true)

        let content = UNMutableNotificationContent()
        content.title = "Permit Update Available"
        content.body = "New Florida water management permit data is ready. Tap to view the latest alerts."
        content.sound = .default
        content.badge = 1

        let request = UNNotificationRequest(
            identifier: "daily-permit-update",
            content: content,
            trigger: trigger
        )

        center.add(request) { error in
            if let error = error {
                print("Failed to schedule daily notification: \(error)")
            }
        }
    }

    // MARK: - Permit Alert Notifications

    /// Sends an immediate notification for a new permit alert
    func sendPermitAlert(for permit: Permit) {
        let content = UNMutableNotificationContent()

        switch permit.status {
        case .newApplication:
            content.title = "📋 New Permit Application"
        case .approved:
            content.title = "✅ Permit Approved"
        default:
            content.title = "Permit Update"
        }

        content.body = "\(permit.numberOfUnits) units — \(permit.location)\nApplicant: \(permit.applicantName)"
        content.sound = .default
        content.userInfo = [
            "permitId": permit.id,
            "districtURL": permit.districtPermitURL
        ]

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)

        let request = UNNotificationRequest(
            identifier: "permit-\(permit.id)",
            content: content,
            trigger: trigger
        )

        UNUserNotificationCenter.current().add(request)
    }
}
