'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { ElectronBlocker } = require('@ghostery/adblocker-electron');

async function main() {
  const blocker = await ElectronBlocker.fromPrebuiltAdsAndTracking(fetch);
  const output = path.join(__dirname, '..', 'assets', 'adblock-engine.bin');
  await fs.writeFile(output, blocker.serialize());
  const stats = await fs.stat(output);
  console.log(`Wrote ${output} (${stats.size} bytes)`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
