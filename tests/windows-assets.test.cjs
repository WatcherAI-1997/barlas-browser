'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const assets = path.join(__dirname, '..', 'assets');

test('Windows icon contains a multi-resolution icon set', () => {
  const icon = fs.readFileSync(path.join(assets, 'icon.ico'));
  assert.equal(icon.readUInt16LE(0), 0);
  assert.equal(icon.readUInt16LE(2), 1);
  assert.equal(icon.readUInt16LE(4), 7);
});

test('NSIS artwork has the required bitmap dimensions', () => {
  for (const [name, width, height] of [
    ['installer-sidebar.bmp', 164, 314],
    ['installer-header.bmp', 150, 57]
  ]) {
    const bitmap = fs.readFileSync(path.join(assets, name));
    assert.equal(bitmap.subarray(0, 2).toString(), 'BM');
    assert.equal(bitmap.readInt32LE(18), width);
    assert.equal(Math.abs(bitmap.readInt32LE(22)), height);
  }
});
