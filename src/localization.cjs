'use strict';

const countryLocaleMap = require('country-locale-map');

// Product-specific choices take precedence over a country's library default.
// All other ISO 3166-1 countries are resolved by country-locale-map.
const COUNTRY_LANGUAGE = Object.freeze({
  AZ: 'az',
  BY: 'ru',
  KZ: 'kk',
  KG: 'ky',
  MN: 'mn',
  RU: 'ru',
  TR: 'tr',
  UZ: 'uz'
});

const BUNDLED_LANGUAGES = new Set(['az', 'en', 'kk', 'ky', 'mn', 'ru', 'tr', 'uz']);

function normalizeLocale(locale) {
  const candidate = String(locale || '').trim().replaceAll('_', '-');
  if (!candidate) return 'en';
  try {
    return new Intl.Locale(candidate).toString();
  } catch {
    return 'en';
  }
}

function baseLanguage(locale) {
  return normalizeLocale(locale).split('-')[0].toLowerCase();
}

function languageForCountry(countryCode) {
  const code = String(countryCode || '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return 'en';
  if (COUNTRY_LANGUAGE[code]) return COUNTRY_LANGUAGE[code];
  return baseLanguage(countryLocaleMap.getLocaleByAlpha2(code) || 'en');
}

function supportedSystemLanguage(locale) {
  return baseLanguage(locale);
}

function countryCodeFromResponse(payload) {
  if (!payload || payload.success === false) return '';
  const code = payload.country_code || payload.countryCode;
  return /^[a-z]{2}$/i.test(String(code || '')) ? String(code).toUpperCase() : '';
}

module.exports = {
  BUNDLED_LANGUAGES,
  COUNTRY_LANGUAGE,
  baseLanguage,
  countryCodeFromResponse,
  languageForCountry,
  normalizeLocale,
  supportedSystemLanguage
};
