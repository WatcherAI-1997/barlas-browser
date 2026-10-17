'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeAddress } = require('../src/navigation.cjs');

test('keeps secure URLs', () => {
  assert.equal(normalizeAddress('https://example.com/docs'), 'https://example.com/docs');
});

test('adds HTTPS to domain names', () => {
  assert.equal(normalizeAddress('example.com/path'), 'https://example.com/path');
});

test('uses HTTP for local development hosts', () => {
  assert.equal(normalizeAddress('localhost:17840'), 'http://localhost:17840/');
  assert.equal(normalizeAddress('127.0.0.1:17840'), 'http://127.0.0.1:17840/');
});

test('turns ordinary text into an encoded search', () => {
  assert.equal(normalizeAddress('barlas browser тест'), 'https://duckduckgo.com/?q=barlas%20browser%20%D1%82%D0%B5%D1%81%D1%82');
});

test('rejects privileged and script protocols as searches', () => {
  assert.match(normalizeAddress('javascript://alert(1)'), /^https:\/\/duckduckgo\.com\/\?q=/);
  assert.match(normalizeAddress('chrome://settings'), /^https:\/\/duckduckgo\.com\/\?q=/);
});

test('supports internal Barlas pages', () => {
  assert.equal(normalizeAddress('barlas://newtab'), 'barlas://newtab');
  assert.equal(normalizeAddress('BARLAS://OS'), 'barlas://os');
});
