'use strict';

const SEARCH_ENDPOINT = 'https://duckduckgo.com/?q=';

function normalizeAddress(input) {
  const value = String(input ?? '').trim();
  if (!value) return 'barlas://newtab';

  if (/^barlas:\/\/(newtab|os)$/i.test(value)) return value.toLowerCase();
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      if (['http:', 'https:', 'file:'].includes(parsed.protocol)) return parsed.href;
    } catch {
      return `${SEARCH_ENDPOINT}${encodeURIComponent(value)}`;
    }
    return `${SEARCH_ENDPOINT}${encodeURIComponent(value)}`;
  }

  const looksLikeHost = /^(localhost|\d{1,3}(?:\.\d{1,3}){3}|(?:[\p{L}\d-]+\.)+[\p{L}]{2,})(:\d+)?(?:\/.*)?$/iu.test(value);
  if (looksLikeHost && !/\s/.test(value)) {
    const local = /^(localhost|127(?:\.\d{1,3}){3})(:|\/|$)/i.test(value);
    return new URL(`${local ? 'http' : 'https'}://${value}`).href;
  }

  return `${SEARCH_ENDPOINT}${encodeURIComponent(value)}`;
}

module.exports = { normalizeAddress, SEARCH_ENDPOINT };
