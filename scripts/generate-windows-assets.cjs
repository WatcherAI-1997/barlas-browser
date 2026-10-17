'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const pngToIco = require('png-to-ico').default;
const bmp = require('bmp-js');

const root = path.join(__dirname, '..');
const assets = path.join(root, 'assets');

function markSvg(size, compact = false) {
  const glow = compact ? '' : '<filter id="g" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="12" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
    <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1c1f25"/><stop offset="1" stop-color="#050608"/></linearGradient><linearGradient id="r" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ff3840"/><stop offset="1" stop-color="#cb0008"/></linearGradient>${glow}</defs>
    <rect x="12" y="12" width="488" height="488" rx="118" fill="url(#bg)" stroke="#343840" stroke-width="8"/>
    <g fill="url(#r)" ${compact ? '' : 'filter="url(#g)"'}><circle cx="176" cy="186" r="74"/><circle cx="336" cy="186" r="74"/><circle cx="256" cy="326" r="74"/></g>
  </svg>`;
}

function sidebarSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="164" height="314" viewBox="0 0 164 314">
    <defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#15171c"/><stop offset="1" stop-color="#050608"/></linearGradient><radialGradient id="a"><stop stop-color="#ed1c2455"/><stop offset="1" stop-color="#ed1c2400"/></radialGradient></defs>
    <rect width="164" height="314" fill="url(#b)"/><circle cx="82" cy="88" r="75" fill="url(#a)"/>
    <g fill="#ed1c24"><circle cx="59" cy="73" r="21"/><circle cx="105" cy="73" r="21"/><circle cx="82" cy="113" r="21"/></g>
    <text x="82" y="171" text-anchor="middle" fill="#ffffff" font-family="Segoe UI,Arial" font-size="22" font-weight="700" letter-spacing="2">BARLAS</text>
    <text x="82" y="194" text-anchor="middle" fill="#8e929a" font-family="Segoe UI,Arial" font-size="10">BROWSER</text>
    <rect x="30" y="218" width="104" height="1" fill="#34373e"/>
    <text x="82" y="244" text-anchor="middle" fill="#c6c9cf" font-family="Segoe UI,Arial" font-size="9">THINK AHEAD.</text>
    <text x="82" y="259" text-anchor="middle" fill="#c6c9cf" font-family="Segoe UI,Arial" font-size="9">ACT BEYOND.</text>
    <text x="82" y="294" text-anchor="middle" fill="#5f646d" font-family="Segoe UI,Arial" font-size="8">BARLAS BIT</text>
  </svg>`;
}

function headerSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="57" viewBox="0 0 150 57">
    <rect width="150" height="57" fill="#0b0c0f"/><g fill="#ed1c24"><circle cx="22" cy="22" r="8"/><circle cx="40" cy="22" r="8"/><circle cx="31" cy="38" r="8"/></g>
    <text x="57" y="28" fill="#ffffff" font-family="Segoe UI,Arial" font-size="15" font-weight="700" letter-spacing="1">BARLAS</text><text x="57" y="42" fill="#8e929a" font-family="Segoe UI,Arial" font-size="8">BROWSER</text>
  </svg>`;
}

async function svgToBmp(svg, width, height, output) {
  const { data } = await sharp(Buffer.from(svg)).resize(width, height).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const abgr = Buffer.alloc(data.length);
  for (let index = 0; index < data.length; index += 4) {
    abgr[index] = data[index + 3];
    abgr[index + 1] = data[index + 2];
    abgr[index + 2] = data[index + 1];
    abgr[index + 3] = data[index];
  }
  await fs.writeFile(output, bmp.encode({ data: abgr, width, height }).data);
}

async function main() {
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const pngs = await Promise.all(sizes.map((size) => sharp(Buffer.from(markSvg(size, size <= 32))).png().toBuffer()));
  await fs.writeFile(path.join(assets, 'icon.ico'), await pngToIco(pngs));
  await fs.writeFile(path.join(assets, 'icon.png'), await sharp(Buffer.from(markSvg(512))).png().toBuffer());
  await svgToBmp(sidebarSvg(), 164, 314, path.join(assets, 'installer-sidebar.bmp'));
  await svgToBmp(headerSvg(), 150, 57, path.join(assets, 'installer-header.bmp'));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
