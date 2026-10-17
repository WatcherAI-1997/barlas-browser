'use strict';

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

const SUPPORTED_LANGUAGES = new Set(['az', 'en', 'kk', 'ky', 'mn', 'ru', 'tr', 'uz']);

function languageForCountry(countryCode) {
  return COUNTRY_LANGUAGE[String(countryCode || '').trim().toUpperCase()] || 'en';
}

function supportedSystemLanguage(locale) {
  const language = String(locale || '').trim().toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LANGUAGES.has(language) ? language : 'en';
}

function countryCodeFromResponse(payload) {
  if (!payload || payload.success === false) return '';
  const code = payload.country_code || payload.countryCode;
  return /^[a-z]{2}$/i.test(String(code || '')) ? String(code).toUpperCase() : '';
}

module.exports = {
  COUNTRY_LANGUAGE,
  SUPPORTED_LANGUAGES,
  languageForCountry,
  supportedSystemLanguage,
  countryCodeFromResponse
};
