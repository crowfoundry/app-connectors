# Corresponding source

The bundled DownWash processor is distributed under GNU GPL version 3.
Its complete corresponding source, licence, build scripts, and dependencies
are available at this immutable public commit:

https://github.com/askrejans/downwash/tree/224688d

Source archive:

https://github.com/askrejans/downwash/archive/224688d.tar.gz

Build the six platform binaries from that source with Go:

```sh
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags='-s -w -X main.version=1.0.0' -o downwash_linux_amd64 ./cmd/downwash
```

Repeat with `GOOS=darwin|linux|windows` and `GOARCH=amd64|arm64`. Windows
filenames use `.exe`. Place the binaries under `server/bin/` before packing
with `npx @anthropic-ai/mcpb@2.1.2 pack`. No Go toolchain is required to use
the published MCPB bundle. FFmpeg is a separate dependency for local video
conversion and is not included in the bundle.
