'use strict';

// This extension connects to the installed HomeTape app; the app retains
// responsibility for permissions, entitlements, and every media operation.
const {spawn} = require('node:child_process');
const {existsSync} = require('node:fs');
const {join} = require('node:path');

const defaultCommand = process.platform === 'darwin'
  ? '/Applications/Hometape.app/Contents/MacOS/hometape-mcp'
  : join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WindowsApps', 'hometape-mcp.exe');
const command = process.env.HOMETAPE_MCP_PATH || defaultCommand;
if (!existsSync(command)) {
  process.stderr.write('Install HomeTape with its MCP helper, or set the HomeTape helper path in extension settings. See https://crowfoundry.com/hometape/ai\n');
  process.exit(1);
}
const child = spawn(command, [], {stdio: ['pipe', 'pipe', 'inherit'], shell: false});
process.stdin.pipe(child.stdin);
child.stdout.pipe(process.stdout);
child.stdin.on('error', error => {
  if (error.code !== 'EPIPE') process.stderr.write(`HomeTape transport: ${error.message}\n`);
});
child.on('error', error => {
  process.stderr.write(`Could not start HomeTape MCP helper: ${error.message}\n`);
  process.exitCode = 1;
});
child.on('exit', (code, signal) => {
  process.stdin.unpipe(child.stdin);
  process.stdin.pause();
  process.exitCode = signal ? 1 : (code || 0);
});
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
