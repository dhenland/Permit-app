// swift-tools-version: 5.9
// This Package.swift is provided for syntax validation.
// Build the app using WaterPermitTracker.xcodeproj in Xcode.

import PackageDescription

let package = Package(
    name: "WaterPermitTracker",
    platforms: [
        .iOS(.v17)
    ],
    targets: [
        .executableTarget(
            name: "WaterPermitTracker",
            path: "WaterPermitTracker"
        )
    ]
)
