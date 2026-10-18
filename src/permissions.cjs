'use strict';

const FULLSCREEN_PROTOCOLS = new Set(['http:', 'https:']);

function isSafeWebUrl(value) {
  try {
    return FULLSCREEN_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
}

function shouldGrantPermission(permission, requestingUrl) {
  // Video players need user-triggered HTML fullscreen. Automatic fullscreen
  // and unrelated sensitive browser permissions remain denied.
  return permission === 'fullscreen' && isSafeWebUrl(requestingUrl);
}

module.exports = { isSafeWebUrl, shouldGrantPermission };
