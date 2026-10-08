'use strict';
const {spawn} = require('node:child_process');
const {join} = require('node:path');

const platforms = {darwin: 'darwin', linux: 'linux', win32: 'windows'};
const architectures = {arm64: 'arm64', x64: 'amd64'};
const platform = platforms[process.platform];
const architecture = architectures[process.arch];
if (!platform || !architecture) {
  process.stderr.write('DownWash supports macOS, Linux, and Windows on x64 and ARM64.\n');
  process.exit(1);
}
const suffix = process.platform === 'win32' ? '.exe' : '';
const executable = join(__dirname, 'bin', `downwash_${platform}_${architecture}${suffix}`);
const child = spawn(executable, ['mcp'], {stdio: ['pipe', 'pipe', 'inherit'], shell: false});
process.stdin.pipe(child.stdin);
child.stdout.pipe(process.stdout);
child.stdin.on('error', error => {
  if (error.code !== 'EPIPE') process.stderr.write(`DownWash transport: ${error.message}\n`);
});
child.on('error', error => {
  process.stderr.write(`Could not start the bundled DownWash processor: ${error.message}\n`);
  process.exitCode = 1;
});
child.on('exit', (code, signal) => {
  process.stdin.unpipe(child.stdin);
  process.stdin.pause();
  process.exitCode = signal ? 1 : (code || 0);
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
