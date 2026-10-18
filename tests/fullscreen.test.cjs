'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { shouldGrantPermission } = require('../src/permissions.cjs');

const root = path.join(__dirname, '..');
const main = fs.readFileSync(path.join(root, 'src', 'main.cjs'), 'utf8');

test('allows user-triggered fullscreen only for web pages', () => {
  assert.equal(shouldGrantPermission('fullscreen', 'https://video.example/watch'), true);
  assert.equal(shouldGrantPermission('fullscreen', 'http://video.example/watch'), true);
  assert.equal(shouldGrantPermission('automatic-fullscreen', 'https://video.example/watch'), false);
  assert.equal(shouldGrantPermission('media', 'https://video.example/watch'), false);
  assert.equal(shouldGrantPermission('fullscreen', 'javascript:alert(1)'), false);
  assert.equal(shouldGrantPermission('fullscreen', 'not a url'), false);
});

test('expands the active WebContentsView for HTML5 player fullscreen', () => {
  assert.match(main, /contents\.on\('enter-html-full-screen'/);
  assert.match(main, /contents\.on\('leave-html-full-screen'/);
  assert.match(main, /htmlFullscreenTabId === tab\.id/);
  assert.match(main, /tab\.view\.setBounds\(\{ x: 0, y: 0/);
  assert.match(main, /disableHtmlFullscreenWindowResize: true/);
  assert.match(main, /window\.setFullScreen\(true\)/);
  assert.match(main, /windowWasFullscreenBeforeHtml/);
});

test('supports browser fullscreen and zoom keyboard shortcuts', () => {
  assert.match(main, /input\.key === 'F11'/);
  assert.match(main, /changeZoom\(0\.1\)/);
  assert.match(main, /changeZoom\(-0\.1\)/);
  assert.match(main, /changeZoom\(0\)/);
});
