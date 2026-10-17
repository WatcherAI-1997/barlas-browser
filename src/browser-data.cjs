'use strict';

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);
const SEARCH_ENGINES = new Set(['google', 'bing', 'duckduckgo']);

function safeLanguage(value) {
  const language = String(value || 'auto').trim();
  return language === 'auto' || /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8}){0,2}$/.test(language) ? language : 'auto';
}

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
  const settings = input.settings && typeof input.settings === 'object' ? input.settings : {};
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
    },
    settings: {
      searchEngine: SEARCH_ENGINES.has(settings.searchEngine) ? settings.searchEngine : 'google',
      restoreSession: settings.restoreSession !== false,
      language: safeLanguage(settings.language)
    }
  };
}

module.exports = { safeLanguage, safeWebUrl, sanitizeBrowserData };
