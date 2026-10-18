'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const main = fs.readFileSync(path.join(root, 'src', 'main.cjs'), 'utf8');

test('publishes update metadata to the official GitHub repository', () => {
  assert.deepEqual(packageJson.build.publish, {
    provider: 'github',
    owner: 'WatcherAI-1997',
    repo: 'barlas-browser',
    releaseType: 'release'
  });
  assert.ok(packageJson.dependencies['electron-updater']);
});

test('uses the native updater download and install lifecycle', () => {
  assert.match(main, /autoUpdater\.autoDownload = false/);
  assert.match(main, /autoUpdater\.downloadUpdate\(\)/);
  assert.match(main, /autoUpdater\.quitAndInstall\(false, true\)/);
  assert.match(main, /'download-progress'/);
  assert.match(main, /'update-downloaded'/);
});
