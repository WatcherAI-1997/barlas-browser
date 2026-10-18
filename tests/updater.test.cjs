'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { compareVersions, releaseUpdate } = require('../src/updater.cjs');

test('compares semantic release versions', () => {
  assert.equal(compareVersions('v0.3.0', '0.2.5'), 1);
  assert.equal(compareVersions('0.2.5', '0.2.5'), 0);
  assert.equal(compareVersions('0.2.4', '0.2.5'), -1);
});

test('selects the Windows x64 installer from a newer stable release', () => {
  const update = releaseUpdate({
    tag_name: 'v0.3.0',
    html_url: 'https://github.com/WatcherAI-1997/barlas-browser/releases/tag/v0.3.0',
    published_at: '2026-10-18T00:00:00Z',
    assets: [{
      name: 'BARLAS-Browser-Setup-0.3.0-Windows-x64.exe',
      browser_download_url: 'https://github.com/WatcherAI-1997/barlas-browser/releases/download/v0.3.0/BARLAS-Browser-Setup-0.3.0-Windows-x64.exe'
    }]
  }, '0.2.5');
  assert.equal(update.version, '0.3.0');
  assert.match(update.downloadUrl, /Windows-x64\.exe$/);
});

test('ignores current, draft and untrusted releases', () => {
  assert.equal(releaseUpdate({ tag_name: 'v0.2.5', html_url: 'https://github.com/WatcherAI-1997/barlas-browser/releases/tag/v0.2.5' }, '0.2.5'), null);
  assert.equal(releaseUpdate({ tag_name: 'v9.0.0', draft: true, html_url: 'https://github.com/WatcherAI-1997/barlas-browser/releases/tag/v9.0.0' }, '0.2.5'), null);
  assert.equal(releaseUpdate({ tag_name: 'v9.0.0', html_url: 'https://example.com/fake' }, '0.2.5'), null);
});
