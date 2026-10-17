'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  countryCodeFromResponse,
  languageForCountry,
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

test('uses English for countries without a translation', () => {
  assert.equal(languageForCountry('DE'), 'en');
  assert.equal(languageForCountry(''), 'en');
});

test('uses a supported system language as fallback', () => {
  assert.equal(supportedSystemLanguage('ru-RU'), 'ru');
  assert.equal(supportedSystemLanguage('kk_KZ'), 'kk');
  assert.equal(supportedSystemLanguage('fr-FR'), 'en');
});

test('validates country codes returned by geolocation services', () => {
  assert.equal(countryCodeFromResponse({ success: true, country_code: 'kz' }), 'KZ');
  assert.equal(countryCodeFromResponse({ countryCode: 'TR' }), 'TR');
  assert.equal(countryCodeFromResponse({ success: false, country_code: 'RU' }), '');
  assert.equal(countryCodeFromResponse({ country_code: 'RUS' }), '');
  assert.equal(countryCodeFromResponse(null), '');
});
