'use strict';

// The installed application alone owns capabilities, file access, consent,
// previews and paid entitlements. This connector never processes recordings.
const {spawn} = require('node:child_process');
const {accessSync, constants} = require('node:fs');
const {isAbsolute, basename, dirname} = require('node:path');
const command = process.env.DOWNWASH_MCP_PATH || '/Applications/Downwash.app/Contents/MacOS/downwash-mcp';
function fail(message) {
  process.stderr.write(`${message} See https://crowfoundry.com/downwash/ai\n`);
  process.exit(1);
}
if (process.platform !== 'darwin') fail('This DownWash native connector currently supports macOS.');
if (!isAbsolute(command) || basename(command) !== 'downwash-mcp' || basename(dirname(command)) !== 'MacOS' || basename(dirname(dirname(command))) !== 'Contents' || !dirname(dirname(dirname(command))).endsWith('.app')) {
  fail('Choose the bundled downwash-mcp inside the installed DownWash.app.');
}
try { accessSync(command, constants.X_OK); }
catch (_) { fail('Install the released DownWash update with native automation (1.0.1 build 11 or later), or set its app helper path in extension settings.'); }
const child = spawn(command, [], {stdio: ['pipe', 'pipe', 'inherit'], shell: false});
process.stdin.pipe(child.stdin);
child.stdout.pipe(process.stdout);
child.stdin.on('error', error => {
  if (error.code !== 'EPIPE') process.stderr.write(`DownWash transport: ${error.message}\n`);
});
child.on('error', error => {
  process.stderr.write(`Could not start DownWash app MCP helper: ${error.message}\n`);
  process.exitCode = 1;
});
child.on('exit', (code, signal) => {
  process.stdin.unpipe(child.stdin);
  process.stdin.pause();
  process.exitCode = signal ? 1 : (code || 0);
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
