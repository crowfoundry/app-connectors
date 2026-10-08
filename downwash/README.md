# DownWash native connector 1.1.0

This package connects to the installed macOS DownWash application. The app exposes its seven native tools and retains its normal free previews, verified Full Unlock, processing grants and purchase confirmation. It includes no offline processor binary and cannot process uploads independently of the app.

Install the released DownWash update containing native automation, introduced in 1.0.1 build 11. That signed update is submitted for store review; public availability follows approval. Enable Agent control in the app's Settings. Configure the default `/Applications/Downwash.app/Contents/MacOS/downwash-mcp`, or the same helper in your app's alternate installation folder.

Unpaid customers can use the app's free recording preview, sample and library summary. Full recorded telemetry, reports, artifact retrieval and video operations use the app's normal entitlement policy. The first processing request asks for session consent. Every purchase or entitlement action asks for fresh human approval and uses the normal app store or licensing flow.

Documentation: https://crowfoundry.com/downwash/ai
