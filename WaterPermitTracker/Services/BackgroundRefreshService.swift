import Foundation
import BackgroundTasks
import UIKit

/// Manages background app refresh to fetch permit data at 4 PM EST daily
final class BackgroundRefreshService {
    static let shared = BackgroundRefreshService()
    static let taskIdentifier = "com.waterpermittracker.daily-refresh"

    private init() {}

    // MARK: - Registration

    func registerBackgroundTask() {
        BGTaskScheduler.shared.register(
            forTaskWithIdentifier: Self.taskIdentifier,
            using: nil
        ) { task in
            guard let task = task as? BGAppRefreshTask else { return }
            self.handleAppRefresh(task: task)
        }
    }

    // MARK: - Scheduling

    func scheduleAppRefresh() {
        let request = BGAppRefreshTaskRequest(identifier: Self.taskIdentifier)

        // Schedule for next 4 PM EST
        if let nextRefreshDate = nextFourPMEST() {
            request.earliestBeginDate = nextRefreshDate
        } else {
            // Fallback: refresh in 24 hours
            request.earliestBeginDate = Date(timeIntervalSinceNow: 24 * 60 * 60)
        }

        do {
            try BGTaskScheduler.shared.submit(request)
            print("Background refresh scheduled for \(request.earliestBeginDate?.description ?? "unknown")")
        } catch {
            print("Failed to schedule background refresh: \(error)")
        }
    }

    // MARK: - Task Handling

    private func handleAppRefresh(task: BGAppRefreshTask) {
        // Schedule next refresh
        scheduleAppRefresh()

        let fetchTask = Task {
            do {
                let permits = try await PermitDataService.shared.fetchPermits(forceRefresh: true)
                let alertPermits = permits.filter { $0.status.isAlert }

                // Send notifications for new alerts
                for permit in alertPermits.prefix(5) {
                    NotificationService.shared.sendPermitAlert(for: permit)
                }

                await PermitDataService.shared.saveToDisk()
                task.setTaskCompleted(success: true)
            } catch {
                task.setTaskCompleted(success: false)
            }
        }

        task.expirationHandler = {
            fetchTask.cancel()
        }
    }

    // MARK: - Date Helpers

    private func nextFourPMEST() -> Date? {
        let calendar = Calendar.current
        guard let estTimeZone = TimeZone(identifier: "America/New_York") else { return nil }

        var components = calendar.dateComponents(in: estTimeZone, from: Date())
        components.hour = 16
        components.minute = 0
        components.second = 0

        guard let todayAtFour = calendar.date(from: components) else { return nil }

        if todayAtFour > Date() {
            return todayAtFour
        } else {
            return calendar.date(byAdding: .day, value: 1, to: todayAtFour)
        }
    }
}
