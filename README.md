# CrowFoundry app connectors

Public connection metadata and desktop extension packaging for G86 Racing,
Neptivum, Recolor the Past, HomeTape, and DownWash. Product application source
and credentials are not part of this distribution.

The authoritative catalog is the [official MCP Registry](https://registry.modelcontextprotocol.io).
The `registry/` directory contains publisher-validated `server.json` metadata.
Account-based remote servers authenticate each user and enforce the same ownership, free
allowances, and paid entitlements as the product API. Desktop extensions
connect to the installed app; they do not upload local media or grant themselves
permission to process it.

## HomeTape

Install HomeTape with the bundled MCP helper, then install `hometape-1.0.0.mcpb`
in a client that supports MCP bundles. The initial extension supports macOS.
For a manually configured client:

```json
{
  "mcpServers": {
    "hometape": {
      "command": "/Applications/Hometape.app/Contents/MacOS/hometape-mcp"
    }
  }
}
```

See [HomeTape's automation guide](https://crowfoundry.com/hometape/ai) for tool
schemas, supported native mobile handoffs, local permissions, and licensing.
Media processing uses the same editor and renderer. Purchases and payment
authorization remain in the app or hosted checkout.

## Hosted servers

Use the remote URL from each product's registry record. Complete OAuth in a
browser or create a scoped revocable key using the product's connection page.
Never put account passwords or payment-card information into tool calls.
Streamable HTTP supports clients on phones, desktops, and the web when the
client supports remote MCP. Device-only features still require the installed
app and operating-system permissions.

ChatGPT and Claude public directory submissions are separate processes from
the official MCP Registry. Registry publication does not imply vendor approval,
automatic installation, or a published listing in their own directories.

## Build and verify

```sh
npx @anthropic-ai/mcpb@2.1.2 validate hometape/manifest.json
npx @anthropic-ai/mcpb@2.1.2 pack hometape hometape-1.0.0.mcpb
mcp-publisher validate registry/hometape.server.json
```

`publish-discovery.py` belongs to the private infrastructure checkout and is
not part of the public extension archive. It validates nginx and records
rollback evidence before publishing scoped website discovery metadata.

## Connection URLs

| Product | Transport | Connection |
| --- | --- | --- |
| G86 Racing | Authenticated Streamable HTTP | https://api.g86racing.com/mcp |
| Recolor the Past | Authenticated Streamable HTTP | https://api.recolorthepast.com/mcp |
| Neptivum | Authenticated Streamable HTTP | https://api.neptivum.com/mcp |
| DownWash | Local macOS app stdio extension | Install DownWash 1.0.1 build 11 or later and its `downwash-1.1.0.mcpb` bundle |
| HomeTape | Local macOS stdio extension | Install the macOS HomeTape app and its `.mcpb` bundle |

## DownWash

The `downwash-1.1.0.mcpb` extension connects to the MCP helper bundled with the installed DownWash macOS app. The app enforces its existing free previews, limited telemetry, and verified Full Unlock licence for full processing. Analysis, exports, batch processing, video conversion, telemetry, and purchases use the app's own services. Processing requires app approval; purchases require fresh approval and the platform's payment confirmation. Source files stay on the device. The helper requires DownWash 1.0.1 build 11 or later; that app update has been submitted for store review.

```json
{
  "mcpServers": {
    "downwash": {
      "command": "/Applications/Downwash.app/Contents/MacOS/downwash-mcp"
    }
  }
}
```

See [DownWash's AI/MCP documentation](https://crowfoundry.com/downwash/ai) for tools, native mobile handoffs, permissions, and licensing. The former unauthenticated upload endpoint and processor bundle have been retired from this product connector. The separate [GPL engine source](https://github.com/askrejans/downwash) remains a developer library; it does not connect to the paid app or verify its purchases.

## Product guides and authentication

- [G86 Racing AI/MCP guide](https://g86racing.com/ai) — cloud sessions, telemetry, tracks, vehicles, drivers, teams and Pit Wall operations.
- [Neptivum AI/MCP guide](https://neptivum.com/ai) — synced boating records and account workflows.
- [Recolor the Past AI/MCP guide](https://recolorthepast.com/en/ai) — photo restoration, library management and existing checkout workflows.
- [HomeTape AI/MCP guide](https://crowfoundry.com/hometape/ai) — installed app and local media operations.
- [DownWash AI/MCP guide](https://crowfoundry.com/downwash/ai) — installed app, free previews, verified paid processing, and native purchases.

The three account servers require OAuth browser authorization or a scoped API key. In a tester with an **Auth Header** field, use `Bearer <your token or scoped API key>`; a connection without credentials reports an authentication error. DownWash and HomeTape run locally through their installed apps. The retired DownWash HTTP URL returns `410 Gone` with the native installation guide.

All five entries are active in the official registry under `com.crowfoundry`. The [company discovery index](https://crowfoundry.com/.well-known/mcp.json) links the individual records, transports, and guides. Each product publishes readable AI documentation and machine descriptors; live tool schemas remain authoritative for capabilities. Native mobile bridge changes require a new installed app release.
