'use strict';

const RELEASES_API = 'https://api.github.com/repos/WatcherAI-1997/barlas-browser/releases/latest';

function versionParts(value) {
  const match = String(value || '').trim().replace(/^v/i, '').match(/^(\d+)\.(\d+)\.(\d+)/);
  return match ? match.slice(1).map(Number) : null;
}

function compareVersions(left, right) {
  const a = versionParts(left);
  const b = versionParts(right);
  if (!a || !b) return 0;
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] > b[index] ? 1 : -1;
  }
  return 0;
}

function releaseUpdate(payload, currentVersion) {
  if (!payload || payload.draft || payload.prerelease || compareVersions(payload.tag_name, currentVersion) <= 0) return null;
  const assets = Array.isArray(payload.assets) ? payload.assets : [];
  const installer = assets.find((asset) => /BARLAS-Browser-Setup-.*-Windows-x64\.exe$/i.test(String(asset?.name || '')));
  const pageUrl = /^https:\/\/github\.com\/WatcherAI-1997\/barlas-browser\/releases\//.test(String(payload.html_url || ''))
    ? payload.html_url : '';
  const downloadUrl = /^https:\/\/github\.com\/WatcherAI-1997\/barlas-browser\/releases\/download\//.test(String(installer?.browser_download_url || ''))
    ? installer.browser_download_url : '';
  if (!pageUrl) return null;
  return {
    version: String(payload.tag_name).replace(/^v/i, ''),
    pageUrl,
    downloadUrl,
    publishedAt: String(payload.published_at || '')
  };
}

async function checkForUpdate(currentVersion, fetchImpl = fetch) {
  const response = await fetchImpl(RELEASES_API, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': `BARLAS-Browser/${currentVersion}` },
    signal: AbortSignal.timeout(8000)
  });
  if (!response.ok) throw new Error(`Update service returned ${response.status}`);
  return releaseUpdate(await response.json(), currentVersion);
}

module.exports = { RELEASES_API, checkForUpdate, compareVersions, releaseUpdate };
