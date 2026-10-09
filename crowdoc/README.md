# Crowdoc app connector 1.0.0

This package connects an MCPB client to the MCP helper bundled with the installed Crowdoc app on macOS or Windows. The app exposes its eleven tools, three prompts and its authoring guide, and keeps its normal session consent, free documents, library and unlock. The package contains no typesetting engine and no hosted service.

Install Crowdoc from the App Store (Mac) or the Microsoft Store (Windows), open it and turn on Settings → AI assistants. Leave the helper path empty for the default location: `/Applications/Crowdoc.app/Contents/MacOS/crowdoc-mcp` on macOS, or the app execution alias `%LOCALAPPDATA%\Microsoft\WindowsApps\crowdoc-mcp.exe` on Windows. For another installation folder, copy the exact path shown in Crowdoc's Settings → AI assistants. When Crowdoc is not running, the helper tries to start it; otherwise open Crowdoc and retry.

The first request of a session asks for approval in the app. Each new PDF uses one of the app's free documents until Crowdoc is unlocked; converting the same document again is free. `crowdoc_request_purchase` only shows the unlock offer in Crowdoc. The user decides and pays in the app's own store or licence checkout; the assistant never pays and never sees payment data. Documents stay on the device.

On iPhone, iPad and Android, Crowdoc works with on-device assistants through Shortcuts and its Android automation action instead of this extension.

Documentation: https://crowfoundry.com/crowdoc/ai
