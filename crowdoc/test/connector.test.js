'use strict';

// node --test crowdoc/test/connector.test.js   (macOS or Linux; the fixtures are shell scripts)
//
// Optional: CROWDOC_MCP_HELPER=/path/to/crowdoc-mcp also runs the real helper
// through the extension (with --no-launch, so Crowdoc is never started) and
// checks that the manifest lists exactly the tools it serves.
const test = require('node:test');
const assert = require('node:assert/strict');
const {spawn} = require('node:child_process');
const {existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} = require('node:fs');
const {tmpdir} = require('node:os');
const {join} = require('node:path');

const root = join(__dirname, '..');
const launcher = join(root, 'server', 'index.js');
const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
const record = JSON.parse(readFileSync(join(root, '..', 'registry', 'crowdoc.server.json'), 'utf8'));
const skip = process.platform === 'win32' && 'fixtures are POSIX shell scripts';

function scratch(t) {
  const dir = mkdtempSync(join(tmpdir(), 'crowdoc-connector-'));
  t.after(() => rmSync(dir, {recursive: true, force: true}));
  return dir;
}

// A stand-in helper: answers every JSON-RPC request with its method and
// exits with FIXTURE_EXIT when stdin closes.
function fakeHelper(dir) {
  const script = join(dir, 'fake-helper.js');
  writeFileSync(script, `
    let buf = '';
    process.stdin.on('data', d => {
      buf += d;
      for (let i; (i = buf.indexOf('\\n')) >= 0; buf = buf.slice(i + 1)) {
        const msg = JSON.parse(buf.slice(0, i));
        process.stdout.write(JSON.stringify({jsonrpc: '2.0', id: msg.id, result: {method: msg.method}}) + '\\n');
      }
    });
    process.stdin.on('end', () => process.exit(Number(process.env.FIXTURE_EXIT || 0)));
  `);
  return wrapper(dir, `exec "${process.execPath}" "${script}"`);
}

function wrapper(dir, line) {
  const helper = join(dir, 'Crowdoc.app', 'Contents', 'MacOS', 'crowdoc-mcp');
  mkdirSync(join(helper, '..'), {recursive: true});
  writeFileSync(helper, `#!/bin/sh\n${line}\n`, {mode: 0o700});
  return helper;
}

// Starts the extension; request() resolves with the reply of the same id.
function connect(t, env) {
  const proc = spawn(process.execPath, [launcher], {env: {...process.env, ...env}});
  t.after(() => { if (proc.exitCode === null) proc.kill(); });
  const waiting = new Map();
  let out = '';
  let err = '';
  proc.stderr.on('data', d => { err += d; });
  proc.stdout.on('data', d => {
    out += d;
    for (let i; (i = out.indexOf('\n')) >= 0; out = out.slice(i + 1)) {
      const msg = JSON.parse(out.slice(0, i));
      waiting.get(msg.id)?.(msg);
    }
  });
  const exited = new Promise(resolve => proc.on('exit', code => resolve({code, stderr: err})));
  return {
    exited,
    send: msg => proc.stdin.write(JSON.stringify({jsonrpc: '2.0', ...msg}) + '\n'),
    request(id, method, params = {}) {
      const reply = new Promise(resolve => waiting.set(id, resolve));
      this.send({id, method, params});
      return reply;
    },
    close: () => proc.stdin.end(),
  };
}

test('relays requests to the app helper and its exit code back', {skip}, async t => {
  const helper = fakeHelper(scratch(t));
  const session = connect(t, {CROWDOC_MCP_PATH: helper, FIXTURE_EXIT: '7'});
  assert.deepEqual((await session.request(1, 'initialize')).result, {method: 'initialize'});
  assert.deepEqual((await session.request(2, 'tools/list')).result, {method: 'tools/list'});
  session.close();
  assert.equal((await session.exited).code, 7);
});

test('explains how to install Crowdoc when the helper is missing', async t => {
  const missing = join(scratch(t), 'Crowdoc.app', 'Contents', 'MacOS', 'crowdoc-mcp');
  const session = connect(t, {CROWDOC_MCP_PATH: missing});
  session.close();
  const {code, stderr} = await session.exited;
  assert.equal(code, 1);
  assert.match(stderr, /Install Crowdoc, open it and turn on Settings → AI assistants/);
  assert.match(stderr, /https:\/\/crowfoundry\.com\/crowdoc\/ai/);
});

test('rejects relative paths and other executables', async t => {
  for (const path of ['crowdoc-mcp', '/bin/sh']) {
    const session = connect(t, {CROWDOC_MCP_PATH: path});
    session.close();
    const {code, stderr} = await session.exited;
    assert.equal(code, 1);
    assert.match(stderr, /Set the helper path/);
  }
});

test('an empty or unexpanded setting means the installed app', {skip: process.platform !== 'darwin' && 'macOS default'}, async t => {
  const fallback = '/Applications/Crowdoc.app/Contents/MacOS/crowdoc-mcp';
  if (existsSync(fallback)) return t.skip('Crowdoc is installed; not starting it');
  for (const value of ['', '${user_config.helper_path}']) {
    const session = connect(t, {CROWDOC_MCP_PATH: value});
    session.close();
    const {code, stderr} = await session.exited;
    assert.equal(code, 1);
    assert.ok(stderr.includes(`not found at ${fallback}`), stderr);
  }
});

test('manifest and registry record describe the same release', () => {
  const names = manifest.tools.map(tool => tool.name);
  assert.equal(new Set(names).size, names.length);
  assert.ok(names.every(name => /^crowdoc_[a-z_]+$/.test(name)));
  assert.equal(record.name, 'com.crowfoundry/crowdoc');
  assert.equal(record.version, manifest.version);
  assert.equal(record.websiteUrl, manifest.documentation);
  assert.match(record.packages[0].identifier, new RegExp(`/crowdoc-${manifest.version.replace(/\./g, '\\.')}\\.mcpb$`));
  assert.deepEqual(manifest.compatibility.platforms, ['darwin', 'win32']);
});

test('manifest lists exactly the tools of the real helper', {skip: (!process.env.CROWDOC_MCP_HELPER && 'set CROWDOC_MCP_HELPER') || skip}, async t => {
  const dir = scratch(t);
  const helper = wrapper(dir, `exec "${process.env.CROWDOC_MCP_HELPER}" --no-launch --discovery "${join(dir, 'none.json')}"`);
  const session = connect(t, {CROWDOC_MCP_PATH: helper});
  const init = await session.request(1, 'initialize', {protocolVersion: '2025-06-18', capabilities: {}, clientInfo: {name: 'connector-test', version: '1'}});
  assert.equal(init.result.serverInfo.name, 'crowdoc');
  session.send({method: 'notifications/initialized'});
  const {result} = await session.request(2, 'tools/list');
  assert.deepEqual(result.tools.map(tool => tool.name).sort(), manifest.tools.map(tool => tool.name).sort());
  session.close();
  assert.equal((await session.exited).code, 0);
});
