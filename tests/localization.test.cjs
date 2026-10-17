'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const countryLocaleMap = require('country-locale-map');
const {
  baseLanguage,
  countryCodeFromResponse,
  languageForCountry,
  normalizeLocale,
  supportedSystemLanguage
} = require('../src/localization.cjs');

test('selects localized languages for supported countries', () => {
  assert.equal(languageForCountry('KZ'), 'kk');
  assert.equal(languageForCountry('kg'), 'ky');
  assert.equal(languageForCountry('UZ'), 'uz');
  assert.equal(languageForCountry('TR'), 'tr');
  assert.equal(languageForCountry('AZ'), 'az');
  assert.equal(languageForCountry('MN'), 'mn');
  assert.equal(languageForCountry('RU'), 'ru');
});

test('covers primary languages for countries worldwide', () => {
  assert.equal(languageForCountry('DE'), 'de');
  assert.equal(languageForCountry('JP'), 'ja');
  assert.equal(languageForCountry('BR'), 'pt');
  assert.equal(languageForCountry('CN'), 'zh');
  assert.equal(languageForCountry('IN'), 'hi');
  assert.equal(languageForCountry(''), 'en');
});

test('resolves every country and territory in the ISO locale database', () => {
  const countries = countryLocaleMap.getAllCountries();
  assert.ok(countries.length >= 249);
  for (const country of countries) {
    assert.match(languageForCountry(country.alpha2), /^[a-z]{2,3}(?:-[a-z0-9]+)*$/i);
  }
});

test('accepts any valid system language as fallback', () => {
  assert.equal(supportedSystemLanguage('ru-RU'), 'ru');
  assert.equal(supportedSystemLanguage('kk_KZ'), 'kk');
  assert.equal(supportedSystemLanguage('fr-FR'), 'fr');
  assert.equal(supportedSystemLanguage('ja-JP'), 'ja');
  assert.equal(supportedSystemLanguage('not a locale'), 'en');
});

test('normalizes BCP 47 and legacy locale tags', () => {
  assert.equal(normalizeLocale('pt_BR'), 'pt-BR');
  assert.equal(baseLanguage('zh-Hans-CN'), 'zh');
});

test('validates country codes returned by geolocation services', () => {
  assert.equal(countryCodeFromResponse({ success: true, country_code: 'kz' }), 'KZ');
  assert.equal(countryCodeFromResponse({ countryCode: 'TR' }), 'TR');
  assert.equal(countryCodeFromResponse({ success: false, country_code: 'RU' }), '');
  assert.equal(countryCodeFromResponse({ country_code: 'RUS' }), '');
  assert.equal(countryCodeFromResponse(null), '');
});
