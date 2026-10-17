'use strict';

const SEARCH_ENDPOINTS = Object.freeze({
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q='
});

function normalizeAddress(input, searchEngine = 'google') {
  const value = String(input ?? '').trim();
  const searchEndpoint = SEARCH_ENDPOINTS[searchEngine] || SEARCH_ENDPOINTS.google;
  if (!value) return 'barlas://newtab';

  if (/^barlas:\/\/newtab$/i.test(value)) return value.toLowerCase();
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      if (['http:', 'https:', 'file:'].includes(parsed.protocol)) return parsed.href;
    } catch {
      return `${searchEndpoint}${encodeURIComponent(value)}`;
    }
    return `${searchEndpoint}${encodeURIComponent(value)}`;
  }

  const looksLikeHost = /^(localhost|\d{1,3}(?:\.\d{1,3}){3}|(?:[\p{L}\d-]+\.)+[\p{L}]{2,})(:\d+)?(?:\/.*)?$/iu.test(value);
  if (looksLikeHost && !/\s/.test(value)) {
    const local = /^(localhost|127(?:\.\d{1,3}){3})(:|\/|$)/i.test(value);
    return new URL(`${local ? 'http' : 'https'}://${value}`).href;
  }

  return `${searchEndpoint}${encodeURIComponent(value)}`;
}

module.exports = { normalizeAddress, SEARCH_ENDPOINTS };
