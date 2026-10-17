'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { safeWebUrl, sanitizeBrowserData } = require('../src/browser-data.cjs');

test('accepts only ordinary web URLs for persistent browser data', () => {
  assert.equal(safeWebUrl('https://example.com/a'), 'https://example.com/a');
  assert.equal(safeWebUrl('javascript:alert(1)'), '');
  assert.equal(safeWebUrl('file:///etc/passwd'), '');
});

test('sanitizes bookmarks, removes duplicates and clamps session index', () => {
  const data = sanitizeBrowserData({
    bookmarks: [
      { title: ' Example ', url: 'https://example.com' },
      { title: 'Duplicate', url: 'https://example.com/' },
      { title: 'Unsafe', url: 'data:text/html,test' }
    ],
    history: [
      { title: ' Later ', url: 'https://later.example', visitedAt: 200 },
      { title: 'Unsafe', url: 'file:///etc/passwd', visitedAt: 300 },
      { title: 'Earlier', url: 'https://earlier.example', visitedAt: 100 },
      { title: 'Missing timestamp', url: 'https://invalid.example' }
    ],
    session: { urls: ['https://one.example', 'chrome://settings', 'https://two.example'], activeIndex: 99 }
  });
  assert.deepEqual(data.bookmarks, [{ title: 'Example', url: 'https://example.com/' }]);
  assert.deepEqual(data.history, [
    { title: 'Later', url: 'https://later.example/', visitedAt: 200 },
    { title: 'Earlier', url: 'https://earlier.example/', visitedAt: 100 }
  ]);
  assert.deepEqual(data.session.urls, ['https://one.example/', 'https://two.example/']);
  assert.equal(data.session.activeIndex, 1);
  assert.deepEqual(data.settings, { searchEngine: 'google', restoreSession: true, language: 'auto' });
});

test('sanitizes persistent browser settings', () => {
  assert.deepEqual(sanitizeBrowserData({ settings: {
    searchEngine: 'duckduckgo', restoreSession: false, language: 'sah'
  }}).settings, { searchEngine: 'duckduckgo', restoreSession: false, language: 'sah' });
  assert.deepEqual(sanitizeBrowserData({ settings: {
    searchEngine: 'evil', restoreSession: 'no', language: '../../bad'
  }}).settings, { searchEngine: 'google', restoreSession: true, language: 'auto' });
});

test('keeps the newest 5000 safe history entries', () => {
  const history = Array.from({ length: 5002 }, (_, index) => ({
    title: `Page ${index}`,
    url: `https://example.com/${index}`,
    visitedAt: index + 1
  }));
  const data = sanitizeBrowserData({ history });
  assert.equal(data.history.length, 5000);
  assert.equal(data.history[0].visitedAt, 5002);
  assert.equal(data.history.at(-1).visitedAt, 3);
});
