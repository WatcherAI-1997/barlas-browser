'use strict';

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

function safeWebUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return ALLOWED_PROTOCOLS.has(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function sanitizeBrowserData(value) {
  const input = value && typeof value === 'object' ? value : {};
  const bookmarks = Array.isArray(input.bookmarks) ? input.bookmarks : [];
  const session = input.session && typeof input.session === 'object' ? input.session : {};
  const urls = Array.isArray(session.urls) ? session.urls.map(safeWebUrl).filter(Boolean).slice(0, 50) : [];

  return {
    bookmarks: bookmarks
      .map((bookmark) => ({
        title: String(bookmark?.title || '').trim().slice(0, 200),
        url: safeWebUrl(bookmark?.url)
      }))
      .filter((bookmark) => bookmark.url)
      .filter((bookmark, index, all) => all.findIndex((item) => item.url === bookmark.url) === index)
      .slice(0, 500),
    session: {
      urls,
      activeIndex: urls.length ? Math.min(Math.max(Number.parseInt(session.activeIndex, 10) || 0, 0), urls.length - 1) : 0
    }
  };
}

module.exports = { safeWebUrl, sanitizeBrowserData };
