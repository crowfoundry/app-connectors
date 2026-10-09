'use strict';

// This extension connects to the installed Crowdoc app; the app retains
// responsibility for session consent, free documents, purchases, the library
// and every typesetting operation. It only relays MCP messages over stdio.
const {spawn} = require('node:child_process');
const {accessSync, constants} = require('node:fs');
const {basename, isAbsolute, join} = require('node:path');

const guide = 'https://crowfoundry.com/crowdoc/ai';
const defaults = {
  darwin: '/Applications/Crowdoc.app/Contents/MacOS/crowdoc-mcp',
  win32: join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WindowsApps', 'crowdoc-mcp.exe'),
};
const helperName = process.platform === 'win32' ? 'crowdoc-mcp.exe' : 'crowdoc-mcp';

function fail(message) {
  process.stderr.write(`Crowdoc: ${message} See ${guide}\n`);
  process.exit(1);
}

// An empty setting, or a client that leaves ${user_config.*} unexpanded,
// means the installed app's default location.
const configured = (process.env.CROWDOC_MCP_PATH || '').trim();
const command = configured && !configured.startsWith('${') ? configured : defaults[process.platform];
if (!command) fail('This extension supports Crowdoc for macOS and Windows.');
if (!isAbsolute(command) || basename(command).toLowerCase() !== helperName) {
  fail(`Set the helper path to the ${helperName} of the installed Crowdoc app; Crowdoc shows it in Settings → AI assistants.`);
}
try {
  accessSync(command, process.platform === 'win32' ? constants.F_OK : constants.X_OK);
} catch (_) {
  fail(`Crowdoc's MCP helper was not found at ${command}. Install Crowdoc, open it and turn on Settings → AI assistants, then restart this client. If Crowdoc is installed elsewhere, set the helper path in the extension settings.`);
}

const child = spawn(command, [], {stdio: ['pipe', 'pipe', 'inherit'], shell: false});
process.stdin.pipe(child.stdin);
child.stdout.pipe(process.stdout);
child.stdin.on('error', error => {
  if (error.code !== 'EPIPE') process.stderr.write(`Crowdoc transport: ${error.message}\n`);
});
child.on('error', error => {
  process.stderr.write(`Could not start the Crowdoc MCP helper: ${error.message}\n`);
  process.exitCode = 1;
});
child.on('exit', (code, signal) => {
  process.stdin.unpipe(child.stdin);
  process.stdin.pause();
  process.exitCode = signal ? 1 : (code || 0);
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
