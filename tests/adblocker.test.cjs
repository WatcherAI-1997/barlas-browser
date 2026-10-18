'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ElectronBlocker, Request } = require('@ghostery/adblocker-electron');

const root = path.join(__dirname, '..');
const main = fs.readFileSync(path.join(root, 'src', 'main.cjs'), 'utf8');

test('bundles a substantial offline ad and tracker filter engine', () => {
  const stats = fs.statSync(path.join(root, 'assets', 'adblock-engine.bin'));
  assert.ok(stats.size > 1_000_000);
});

test('enables network and cosmetic filtering in the persistent browser session', () => {
  assert.match(main, /ElectronBlocker\.deserialize/);
  assert.match(main, /enableBlockingInSession\(browserSession\)/);
  assert.match(main, /fromPrebuiltAdsAndTracking\(fetch\)/);
  assert.match(main, /ADBLOCK_CACHE_MAX_AGE/);
});

test('blocks a known advertising request while allowing ordinary content', () => {
  const blocker = ElectronBlocker.deserialize(fs.readFileSync(path.join(root, 'assets', 'adblock-engine.bin')));
  const request = (url) => Request.fromRawDetails({ url, sourceUrl: 'https://example.com/', type: 'script' });
  assert.equal(blocker.match(request('https://googleads.g.doubleclick.net/pagead/id')).match, true);
  assert.equal(blocker.match(request('https://example.com/content.js')).match, false);
});
