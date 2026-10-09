# CrowFoundry app connectors

Public connection metadata and desktop extension packaging for G86 Racing,
Neptivum, Recolor the Past, HomeTape, DownWash, and Crowdoc. Product application source
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

node --test crowdoc/test/connector.test.js
npx @anthropic-ai/mcpb@2.1.2 validate crowdoc/manifest.json
npx @anthropic-ai/mcpb@2.1.2 pack crowdoc crowdoc-1.0.0.mcpb
mcp-publisher validate registry/crowdoc.server.json
```

The Crowdoc tests run on macOS or Linux. Set `CROWDOC_MCP_HELPER` to a
`crowdoc-mcp` binary to also check the manifest's tool list against the real
helper; the test starts it with `--no-launch`, so Crowdoc itself is not opened.

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
| Crowdoc | Local macOS and Windows app stdio extension | Install Crowdoc and its `crowdoc-1.0.0.mcpb` bundle |

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

## Crowdoc

The `crowdoc-1.0.0.mcpb` extension connects to the MCP helper bundled with the installed Crowdoc app on macOS or Windows. Crowdoc typesets Markdown, Word, OpenDocument, RTF, HTML, EPUB, notebooks, spreadsheets, text and PDF files into PDFs in the user's library. Turn on Settings → AI assistants in the app; the first request of each session asks for approval there. The app applies its free documents exactly as in its own interface. `crowdoc_request_purchase` only shows the unlock offer in Crowdoc, where the user decides and pays through the app's store or licence checkout; the assistant never sees payment data. Documents stay on the device and no hosted service is involved.

The extension lists the app's eleven tools: `crowdoc_capabilities`, `crowdoc_inspect`, `crowdoc_convert`, `crowdoc_batch`, `crowdoc_preview`, `crowdoc_scan`, `crowdoc_list_documents`, `crowdoc_get_document`, `crowdoc_request_purchase`, `crowdoc_render_typst` and `crowdoc_format_references`. The helper also serves the app's prompts and authoring guide. If the helper is missing, the extension stops with instructions to install Crowdoc and turn on its AI assistants setting. For a manually configured client on macOS:

```json
{
  "mcpServers": {
    "crowdoc": {
      "command": "/Applications/Crowdoc.app/Contents/MacOS/crowdoc-mcp"
    }
  }
}
```

On Windows, the Microsoft Store app provides the execution alias `%LOCALAPPDATA%\Microsoft\WindowsApps\crowdoc-mcp.exe`. Crowdoc shows its exact helper path in Settings → AI assistants. On iPhone, iPad and Android, on-device assistants use Crowdoc's Shortcuts and Android automation action instead. See [Crowdoc's AI/MCP guide](https://crowfoundry.com/crowdoc/ai) for tools, permissions, free documents and the unlock.

## Product guides and authentication

- [G86 Racing AI/MCP guide](https://g86racing.com/ai) — cloud sessions, telemetry, tracks, vehicles, drivers, teams and Pit Wall operations.
- [Neptivum AI/MCP guide](https://neptivum.com/ai) — synced boating records and account workflows.
- [Recolor the Past AI/MCP guide](https://recolorthepast.com/en/ai) — photo restoration, library management and existing checkout workflows.
- [HomeTape AI/MCP guide](https://crowfoundry.com/hometape/ai) — installed app and local media operations.
- [DownWash AI/MCP guide](https://crowfoundry.com/downwash/ai) — installed app, free previews, verified paid processing, and native purchases.
- [Crowdoc AI/MCP guide](https://crowfoundry.com/crowdoc/ai) — installed app, document typesetting, free documents, and the in-app unlock.

The three account servers require OAuth browser authorization or a scoped API key. In a tester with an **Auth Header** field, use `Bearer <your token or scoped API key>`; a connection without credentials reports an authentication error. Crowdoc, DownWash and HomeTape run locally through their installed apps. The retired DownWash HTTP URL returns `410 Gone` with the native installation guide.

All six entries are active in the official registry under `com.crowfoundry`. The [company discovery index](https://crowfoundry.com/.well-known/mcp.json) links the individual records, transports, and guides. Each product publishes readable AI documentation and machine descriptors; live tool schemas remain authoritative for capabilities. Native mobile bridge changes require a new installed app release.
