'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'renderer', 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'renderer', 'styles.css'), 'utf8');
const app = fs.readFileSync(path.join(root, 'renderer', 'app.js'), 'utf8');

test('uses a Chrome-style top layout without a permanent left rail', () => {
  assert.doesNotMatch(html, /class="rail"/);
  assert.match(css, /\.toolbar \{ position: fixed; left: 0;/);
});

test('keeps the update control truly hidden until an update exists', () => {
  assert.match(css, /\[hidden\] \{ display: none !important; \}/);
  assert.match(app, /hidden = !\(available \|\| downloading \|\| downloaded\)/);
});
