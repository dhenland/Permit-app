import SwiftUI
import UIKit
import UserNotifications

@main
struct WaterPermitTrackerApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup {
            PermitListView()
        }
    }
}

// MARK: - App Delegate for Background Tasks & Notifications

class AppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        // Register background refresh task
        BackgroundRefreshService.shared.registerBackgroundTask()
        BackgroundRefreshService.shared.scheduleAppRefresh()

        // Setup notifications
        UNUserNotificationCenter.current().delegate = self

        Task {
            let granted = await NotificationService.shared.requestAuthorization()
            if granted {
                NotificationService.shared.scheduleDailyUpdateReminder()
            }
        }

        return true
    }

    // Handle notification tap while app is in foreground
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.banner, .badge, .sound])
    }

    // Handle notification tap
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let userInfo = response.notification.request.content.userInfo

        if let urlString = userInfo["districtURL"] as? String,
           let url = URL(string: urlString) {
            UIApplication.shared.open(url)
        }

        completionHandler()
    }
}
