'use strict';

const path = require('node:path');
const fs = require('node:fs/promises');
const { app, BrowserWindow, WebContentsView, dialog, ipcMain, Menu, session, shell } = require('electron');
const { normalizeAddress } = require('./navigation.cjs');
const {
  BUNDLED_LANGUAGES,
  baseLanguage,
  countryCodeFromResponse,
  languageForCountry,
  supportedSystemLanguage
} = require('./localization.cjs');
const { safeLanguage, sanitizeBrowserData } = require('./browser-data.cjs');

const DEFAULT_LAYOUT = { x: 58, y: 102, right: 0, bottom: 0 };
const GEO_ENDPOINT = 'https://ipwho.is/?fields=success,country_code';
const GEO_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const TRANSLATE_ENDPOINT = 'https://api.mymemory.translated.net/get';

const EN_INTERFACE_COPY = Object.freeze({
  newTab: 'New tab',
  crashed: 'Tab stopped working',
  tagline: 'Think ahead. Act beyond.',
  newTabHint: 'Enter an address or search above',
  closeTab: 'Close tab',
  settingsSoon: 'Privacy settings are coming in the next version',
  privacySettings: 'Privacy settings (coming soon)',
  sidebar: 'Sidebar',
  navigation: 'Navigation',
  back: 'Back',
  forward: 'Forward',
  reload: 'Reload',
  stop: 'Stop',
  connection: 'Connection status',
  address: 'Address or search query',
  addressPlaceholder: 'Enter an address or search query',
  go: 'Go',
  menu: 'Menu',
  bookmarks: 'Bookmarks',
  addBookmark: 'Add bookmark',
  removeBookmark: 'Remove bookmark',
  emptyBookmarks: 'No saved pages yet',
  close: 'Close',
  settings: 'Settings',
  searchEngine: 'Search engine',
  startup: 'Startup',
  restoreTabs: 'Restore open tabs after restart',
  language: 'Interface language',
  automatic: 'Automatic (country and system)',
  downloads: 'Downloads',
  zoom: 'Zoom',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  zoomReset: 'Reset zoom',
  fullscreen: 'Fullscreen',
  about: 'About BARLAS Browser',
  saved: 'Saved'
});

const MAIN_UI_COPY = {
  az: { bookmarks: 'Əlfəcinlər', downloads: 'Yükləmələr', zoom: 'Miqyas', zoomIn: 'Böyüt', zoomOut: 'Kiçilt', zoomReset: 'Miqyası sıfırla', fullscreen: 'Tam ekran', settings: 'Parametrlər', about: 'BARLAS Browser haqqında' },
  kk: { bookmarks: 'Бетбелгілер', downloads: 'Жүктеулер', zoom: 'Масштаб', zoomIn: 'Үлкейту', zoomOut: 'Кішірейту', zoomReset: 'Масштабты қалпына келтіру', fullscreen: 'Толық экран', settings: 'Баптаулар', about: 'BARLAS Browser туралы' },
  ky: { bookmarks: 'Кыстармалар', downloads: 'Жүктөөлөр', zoom: 'Масштаб', zoomIn: 'Чоңойтуу', zoomOut: 'Кичирейтүү', zoomReset: 'Масштабды баштапкы абалга келтирүү', fullscreen: 'Толук экран', settings: 'Жөндөөлөр', about: 'BARLAS Browser жөнүндө' },
  mn: { bookmarks: 'Хавчуурга', downloads: 'Таталтууд', zoom: 'Томруулалт', zoomIn: 'Томруулах', zoomOut: 'Жижигрүүлэх', zoomReset: 'Томруулалтыг сэргээх', fullscreen: 'Дэлгэц дүүрэн', settings: 'Тохиргоо', about: 'BARLAS Browser-ийн тухай' },
  ru: {
    bookmarks: 'Закладки', downloads: 'Загрузки', zoom: 'Масштаб', zoomIn: 'Увеличить',
    zoomOut: 'Уменьшить', zoomReset: 'Сбросить масштаб', fullscreen: 'Полноэкранный режим',
    settings: 'Настройки', about: 'О BARLAS Browser'
  },
  tr: { bookmarks: 'Yer imleri', downloads: 'İndirilenler', zoom: 'Yakınlaştırma', zoomIn: 'Yakınlaştır', zoomOut: 'Uzaklaştır', zoomReset: 'Yakınlaştırmayı sıfırla', fullscreen: 'Tam ekran', settings: 'Ayarlar', about: 'BARLAS Browser hakkında' },
  uz: { bookmarks: 'Xatcho‘plar', downloads: 'Yuklamalar', zoom: 'Masshtab', zoomIn: 'Kattalashtirish', zoomOut: 'Kichraytirish', zoomReset: 'Masshtabni tiklash', fullscreen: 'To‘liq ekran', settings: 'Sozlamalar', about: 'BARLAS Browser haqida' }
};

const NEW_TAB_COPY = {
  az: ['İrəli düşün. Hüdudları aş.', 'Yuxarıdakı sətrə ünvan və ya sorğu daxil edin'],
  en: ['Think ahead. Act beyond.', 'Enter an address or search above'],
  kk: ['Алға ойла. Шектен ас.', 'Жоғарыдағы жолға мекенжай не сұрау енгізіңіз'],
  ky: ['Алдыга ойло. Чектен чык.', 'Жогору жакка дарек же издөө сурамын киргизиңиз'],
  mn: ['Урагшаа сэтгэ. Хязгаарыг дав.', 'Дээрх мөрөнд хаяг эсвэл хайлт оруулна уу'],
  ru: ['Думай вперёд. Выходи за рамки.', 'Введите адрес или запрос в строке сверху'],
  tr: ['İleriyi düşün. Sınırları aş.', 'Yukarıya bir adres veya arama yazın'],
  uz: ["Oldinga o‘yla. Chegaradan osh.", 'Yuqoridagi qatorga manzil yoki so‘rov kiriting']
};

const MAIN_COPY = {
  az: { newTab: 'Yeni tab', crashed: 'Tab dayandırıldı' },
  en: { newTab: 'New tab', crashed: 'Tab stopped working' },
  kk: { newTab: 'Жаңа бет', crashed: 'Бет жұмысын тоқтатты' },
  ky: { newTab: 'Жаңы өтмөк', crashed: 'Өтмөк иштебей калды' },
  mn: { newTab: 'Шинэ таб', crashed: 'Таб ажиллагааг зогсоолоо' },
  ru: { newTab: 'Новая вкладка', crashed: 'Вкладка завершила работу' },
  tr: { newTab: 'Yeni sekme', crashed: 'Sekme çalışmayı durdurdu' },
  uz: { newTab: 'Yangi varaq', crashed: 'Varaq ishlashni to‘xtatdi' }
};

function mainCopy(key) {
  if (localeState.messages?.[key]) return localeState.messages[key];
  return (MAIN_COPY[localeState.language] || MAIN_COPY.en)[key]
    || MAIN_UI_COPY[localeState.language]?.[key]
    || EN_INTERFACE_COPY[key]
    || key;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

let window;
let activeTabId;
let layout = { ...DEFAULT_LAYOUT };
let nextTabId = 1;
const tabs = new Map();
let localeState = { language: 'en', countryCode: '', source: 'system', messages: {} };
let browserData = sanitizeBrowserData();
let saveQueue = Promise.resolve();
let restoringSession = false;

function settingsPath() {
  return path.join(app.getPath('userData'), 'locale.json');
}

function browserDataPath() {
  return path.join(app.getPath('userData'), 'browser-data.json');
}

async function readBrowserData() {
  try {
    return sanitizeBrowserData(JSON.parse(await fs.readFile(browserDataPath(), 'utf8')));
  } catch {
    return sanitizeBrowserData();
  }
}

function sessionSnapshot() {
  const orderedTabs = [...tabs.values()];
  const urls = orderedTabs.map((tab) => tab.displayUrl).filter((url) => /^https?:\/\//.test(url));
  const activeUrl = activeTab()?.displayUrl;
  return { urls, activeIndex: Math.max(0, urls.indexOf(activeUrl)) };
}

function persistBrowserData() {
  if (restoringSession) return;
  browserData.session = sessionSnapshot();
  const snapshot = JSON.stringify(sanitizeBrowserData(browserData), null, 2);
  saveQueue = saveQueue.then(async () => {
    await fs.mkdir(app.getPath('userData'), { recursive: true });
    const temporaryPath = `${browserDataPath()}.tmp`;
    await fs.writeFile(temporaryPath, snapshot, 'utf8');
    await fs.rename(temporaryPath, browserDataPath());
  }).catch(() => undefined);
}

async function readCachedLocale(preferredLanguage = 'auto') {
  try {
    const cached = JSON.parse(await fs.readFile(settingsPath(), 'utf8'));
    const detectedAt = Number(cached.detectedAt);
    if (!Number.isFinite(detectedAt) || Date.now() - detectedAt > GEO_CACHE_MAX_AGE) return null;
    if (preferredLanguage !== 'auto') {
      if (cached.source !== 'manual' || cached.language !== preferredLanguage) return null;
      return {
        language: preferredLanguage,
        countryCode: '',
        source: 'manual',
        messages: sanitizeMessages(cached.messages)
      };
    }
    if (!/^[A-Z]{2}$/.test(String(cached.countryCode || ''))) return null;
    const language = languageForCountry(cached.countryCode);
    return {
      language,
      countryCode: cached.countryCode,
      source: 'ip',
      messages: cached.language === language ? sanitizeMessages(cached.messages) : {}
    };
  } catch {
    return null;
  }
}

function sanitizeMessages(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const messages = {};
  for (const key of Object.keys(EN_INTERFACE_COPY)) {
    if (typeof value[key] === 'string' && value[key].trim() && value[key].length <= 240) {
      messages[key] = value[key].trim();
    }
  }
  return messages;
}

async function translateInterface(locale) {
  const language = baseLanguage(locale);
  if (BUNDLED_LANGUAGES.has(language)) return {};

  const entries = Object.entries(EN_INTERFACE_COPY);
  const chunks = [];
  for (let index = 0; index < entries.length; index += 6) chunks.push(entries.slice(index, index + 6));

  try {
    const translatedChunks = await Promise.all(chunks.map(async (chunk) => {
      const separator = '\n§§\n';
      const url = new URL(TRANSLATE_ENDPOINT);
      url.searchParams.set('q', chunk.map(([, value]) => value).join(separator));
      url.searchParams.set('langpair', `en|${language}`);
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error('Translation request failed');
      const payload = await response.json();
      const values = String(payload?.responseData?.translatedText || '').split(/\s*§§\s*/);
      if (values.length !== chunk.length) throw new Error('Translation response was incomplete');
      return chunk.map(([key], index) => [key, values[index].trim()]);
    }));
    return sanitizeMessages(Object.fromEntries(translatedChunks.flat()));
  } catch {
    return {};
  }
}

async function withInterfaceTranslation(locale) {
  return { ...locale, messages: await translateInterface(locale.language) };
}

async function writeLocaleCache(locale) {
  try {
    await fs.mkdir(app.getPath('userData'), { recursive: true });
    await fs.writeFile(settingsPath(), JSON.stringify({
      countryCode: locale.countryCode,
      language: locale.language,
      source: locale.source,
      messages: locale.messages,
      detectedAt: Date.now()
    }), 'utf8');
  } catch {
    // A read-only profile can still use the locale for this session.
  }
}

async function detectLocale(preferredLanguage = 'auto') {
  const requestedLanguage = safeLanguage(preferredLanguage);
  const cached = await readCachedLocale(requestedLanguage);
  if (cached) {
    if (BUNDLED_LANGUAGES.has(baseLanguage(cached.language)) || Object.keys(cached.messages).length) return cached;
    const translated = { ...cached, messages: await translateInterface(cached.language) };
    await writeLocaleCache(translated);
    return translated;
  }

  if (requestedLanguage !== 'auto') {
    const manual = await withInterfaceTranslation({
      language: requestedLanguage,
      countryCode: '',
      source: 'manual'
    });
    await writeLocaleCache(manual);
    return manual;
  }

  const fallback = {
    language: supportedSystemLanguage(app.getLocale()),
    countryCode: '',
    source: 'system'
  };
  const translatedFallback = () => withInterfaceTranslation(fallback);

  try {
    const response = await fetch(GEO_ENDPOINT, { signal: AbortSignal.timeout(2500) });
    if (!response.ok) return translatedFallback();
    const countryCode = countryCodeFromResponse(await response.json());
    if (!countryCode) return translatedFallback();
    const detected = await withInterfaceTranslation({
      language: languageForCountry(countryCode),
      countryCode,
      source: 'ip'
    });
    await writeLocaleCache(detected);
    return detected;
  } catch {
    return translatedFallback();
  }
}

function activeTab() {
  return tabs.get(activeTabId);
}

function publicTab(tab) {
  return {
    id: tab.id,
    title: tab.title || mainCopy('newTab'),
    url: tab.displayUrl || '',
    loading: tab.loading,
    canGoBack: tab.view.webContents.canGoBack(),
    canGoForward: tab.view.webContents.canGoForward(),
    favicon: tab.favicon || ''
  };
}

function state() {
  return {
    tabs: [...tabs.values()].map(publicTab),
    activeTabId,
    locale: localeState,
    settings: browserData.settings,
    zoomPercent: Math.round((activeTab()?.view.webContents.getZoomFactor() || 1) * 100),
    bookmarks: browserData.bookmarks,
    activeBookmarked: browserData.bookmarks.some((bookmark) => bookmark.url === activeTab()?.displayUrl)
  };
}

function broadcast() {
  if (window && !window.isDestroyed()) window.webContents.send('browser:state', state());
}

function updateBounds() {
  const tab = activeTab();
  if (!window || !tab) return;
  const [width, height] = window.getContentSize();
  tab.view.setBounds({
    x: Math.max(0, Math.round(layout.x)),
    y: Math.max(0, Math.round(layout.y)),
    width: Math.max(320, width - Math.round(layout.x) - Math.round(layout.right)),
    height: Math.max(200, height - Math.round(layout.y) - Math.round(layout.bottom))
  });
}

function newTabPage(tab) {
  const language = localeState.language;
  const [bundledTagline, bundledHint] = NEW_TAB_COPY[language] || NEW_TAB_COPY.en;
  const tagline = localeState.messages?.tagline || bundledTagline;
  const hint = localeState.messages?.newTabHint || bundledHint;
  const safeTagline = escapeHtml(tagline);
  const safeHint = escapeHtml(hint);
  const html = `<!doctype html><html lang="${language}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>
    :root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#08090b;color:#f4f5f7;font:16px system-ui,sans-serif}main{text-align:center;width:min(720px,88vw)}.mark{position:relative;margin:auto;width:88px;height:76px;filter:drop-shadow(0 18px 24px #ed1c2445)}.mark i{position:absolute;width:38px;height:38px;border-radius:50%;background:linear-gradient(145deg,#ff3037,#cf060d)}.mark i:nth-child(1){left:4px;top:0}.mark i:nth-child(2){right:4px;top:0}.mark i:nth-child(3){left:25px;bottom:0}h1{font-size:44px;letter-spacing:-2px;margin:24px 0 8px}p{color:#8e929a;margin:0}.hint{margin-top:34px;color:#60646c;font-size:13px}</style></head><body><main><div class="mark"><i></i><i></i><i></i></div><h1>BARLAS Browser</h1><p>${safeTagline}</p><div class="hint">${safeHint}</div></main></body></html>`;
  tab.displayUrl = '';
  return tab.view.webContents.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
}

function navigateTab(tab, input) {
  const target = normalizeAddress(input, browserData.settings.searchEngine);
  if (target === 'barlas://newtab') return newTabPage(tab);
  return tab.view.webContents.loadURL(target);
}

function wireTab(tab) {
  const contents = tab.view.webContents;
  contents.on('before-input-event', (event, input) => handleShortcut(event, input));
  contents.setWindowOpenHandler(({ url }) => {
    createTab(url, true);
    return { action: 'deny' };
  });
  contents.on('will-navigate', (event, url) => {
    if (!['http:', 'https:', 'file:', 'data:'].includes(new URL(url).protocol)) {
      event.preventDefault();
      shell.openExternal(url).catch(() => undefined);
    }
  });
  contents.on('page-title-updated', (_event, title) => {
    tab.title = title || mainCopy('newTab');
    broadcast();
  });
  contents.on('page-favicon-updated', (_event, favicons) => {
    tab.favicon = favicons[0] || '';
    broadcast();
  });
  contents.on('did-start-loading', () => {
    tab.loading = true;
    broadcast();
  });
  contents.on('did-stop-loading', () => {
    tab.loading = false;
    const current = contents.getURL();
    tab.displayUrl = current.startsWith('data:') ? '' : current;
    persistBrowserData();
    broadcast();
  });
  contents.on('did-navigate', (_event, url) => {
    tab.displayUrl = url.startsWith('data:') ? '' : url;
    persistBrowserData();
    broadcast();
  });
  contents.on('did-navigate-in-page', (_event, url) => {
    tab.displayUrl = url;
    persistBrowserData();
    broadcast();
  });
  contents.on('render-process-gone', () => {
    tab.title = mainCopy('crashed');
    tab.loading = false;
    broadcast();
  });
}

function handleShortcut(event, input) {
  const command = input.control || input.meta;
  const key = input.key.toLowerCase();
  if (command && key === 'l') {
    event.preventDefault();
    window.webContents.focus();
    window.webContents.send('browser:find');
  } else if (command && key === 't') {
    event.preventDefault();
    createTab();
  } else if (command && key === 'w') {
    event.preventDefault();
    closeTab(activeTabId);
  } else if (command && key === 'r') {
    event.preventDefault();
    activeTab()?.view.webContents.reload();
  } else if (command && key === 'd') {
    event.preventDefault();
    toggleBookmark();
  } else if (input.alt && input.key === 'ArrowLeft') {
    event.preventDefault();
    if (activeTab()?.view.webContents.canGoBack()) activeTab().view.webContents.goBack();
  } else if (input.alt && input.key === 'ArrowRight') {
    event.preventDefault();
    if (activeTab()?.view.webContents.canGoForward()) activeTab().view.webContents.goForward();
  }
}

function createTab(url = 'barlas://newtab', activate = true) {
  const id = nextTabId++;
  const view = new WebContentsView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      partition: 'persist:barlas-browser'
    }
  });
  const tab = { id, view, title: mainCopy('newTab'), displayUrl: '', favicon: '', loading: false };
  tabs.set(id, tab);
  wireTab(tab);
  navigateTab(tab, url).catch(() => undefined);
  if (activate) selectTab(id);
  broadcast();
  persistBrowserData();
  return id;
}

function selectTab(id) {
  const tab = tabs.get(Number(id));
  if (!window || !tab) return false;
  const current = activeTab();
  if (current) window.contentView.removeChildView(current.view);
  activeTabId = tab.id;
  window.contentView.addChildView(tab.view);
  updateBounds();
  tab.view.webContents.focus();
  broadcast();
  persistBrowserData();
  return true;
}

function closeTab(id) {
  const numericId = Number(id);
  const tab = tabs.get(numericId);
  if (!tab) return false;
  const ordered = [...tabs.keys()];
  const index = ordered.indexOf(numericId);
  if (window) window.contentView.removeChildView(tab.view);
  tab.view.webContents.close({ waitForBeforeUnload: false });
  tabs.delete(numericId);
  if (tabs.size === 0) return createTab();
  if (activeTabId === numericId) selectTab(ordered[index + 1] ?? ordered[index - 1]);
  broadcast();
  persistBrowserData();
  return true;
}

function toggleBookmark() {
  const tab = activeTab();
  if (!tab || !/^https?:\/\//.test(tab.displayUrl)) return false;
  const index = browserData.bookmarks.findIndex((bookmark) => bookmark.url === tab.displayUrl);
  if (index >= 0) browserData.bookmarks.splice(index, 1);
  else browserData.bookmarks.unshift({ title: tab.title || tab.displayUrl, url: tab.displayUrl });
  persistBrowserData();
  broadcast();
  return index < 0;
}

function removeBookmark(url) {
  const before = browserData.bookmarks.length;
  browserData.bookmarks = browserData.bookmarks.filter((bookmark) => bookmark.url !== url);
  if (browserData.bookmarks.length === before) return false;
  persistBrowserData();
  broadcast();
  return true;
}

async function updateSetting(key, value) {
  if (key === 'searchEngine' && ['google', 'bing', 'duckduckgo'].includes(value)) {
    browserData.settings.searchEngine = value;
  } else if (key === 'restoreSession' && typeof value === 'boolean') {
    browserData.settings.restoreSession = value;
  } else if (key === 'language') {
    browserData.settings.language = safeLanguage(value);
    localeState = await detectLocale(browserData.settings.language);
  } else {
    return false;
  }
  persistBrowserData();
  broadcast();
  return true;
}

function changeZoom(delta) {
  const contents = activeTab()?.view.webContents;
  if (!contents) return;
  const factor = delta === 0 ? 1 : Math.min(2, Math.max(0.5, contents.getZoomFactor() + delta));
  contents.setZoomFactor(factor);
  broadcast();
}

function showBrowserMenu() {
  if (!window) return;
  const template = [
    { label: mainCopy('newTab'), accelerator: 'CmdOrCtrl+T', click: () => createTab() },
    { label: mainCopy('bookmarks'), click: () => window.webContents.send('browser:open-bookmarks') },
    { label: mainCopy('downloads'), click: () => shell.openPath(app.getPath('downloads')) },
    { type: 'separator' },
    {
      label: `${mainCopy('zoom')} (${state().zoomPercent}%)`,
      submenu: [
        { label: mainCopy('zoomIn'), accelerator: 'CmdOrCtrl+Plus', click: () => changeZoom(0.1) },
        { label: mainCopy('zoomOut'), accelerator: 'CmdOrCtrl+-', click: () => changeZoom(-0.1) },
        { label: mainCopy('zoomReset'), accelerator: 'CmdOrCtrl+0', click: () => changeZoom(0) }
      ]
    },
    { label: mainCopy('fullscreen'), type: 'checkbox', checked: window.isFullScreen(), click: () => window.setFullScreen(!window.isFullScreen()) },
    { label: mainCopy('settings'), click: () => window.webContents.send('browser:open-settings') },
    { type: 'separator' },
    { label: mainCopy('about'), click: () => dialog.showMessageBox(window, { type: 'info', title: 'BARLAS Browser', message: 'BARLAS Browser 0.2.2', detail: `Chromium ${process.versions.chrome}\nElectron ${process.versions.electron}` }) }
  ];
  Menu.buildFromTemplate(template).popup({ window });
}

function installIpc() {
  ipcMain.handle('browser:get-state', () => state());
  ipcMain.handle('browser:new-tab', (_event, url) => createTab(url));
  ipcMain.handle('browser:select-tab', (_event, id) => selectTab(id));
  ipcMain.handle('browser:close-tab', (_event, id) => closeTab(id));
  ipcMain.handle('browser:navigate', (_event, value) => {
    const tab = activeTab();
    return tab ? navigateTab(tab, value) : undefined;
  });
  ipcMain.handle('browser:back', () => activeTab()?.view.webContents.goBack());
  ipcMain.handle('browser:forward', () => activeTab()?.view.webContents.goForward());
  ipcMain.handle('browser:reload', () => activeTab()?.view.webContents.reload());
  ipcMain.handle('browser:stop', () => activeTab()?.view.webContents.stop());
  ipcMain.handle('browser:home', () => activeTab() && navigateTab(activeTab(), 'barlas://newtab'));
  ipcMain.handle('browser:toggle-bookmark', () => toggleBookmark());
  ipcMain.handle('browser:remove-bookmark', (_event, url) => removeBookmark(url));
  ipcMain.handle('browser:set-setting', (_event, key, value) => updateSetting(key, value));
  ipcMain.handle('browser:open-downloads', () => shell.openPath(app.getPath('downloads')));
  ipcMain.handle('browser:show-menu', () => showBrowserMenu());
  ipcMain.on('browser:layout', (_event, value) => {
    if (!value || typeof value !== 'object') return;
    layout = {
      x: Number.isFinite(value.x) ? value.x : DEFAULT_LAYOUT.x,
      y: Number.isFinite(value.y) ? value.y : DEFAULT_LAYOUT.y,
      right: Number.isFinite(value.right) ? value.right : 0,
      bottom: Number.isFinite(value.bottom) ? value.bottom : 0
    };
    updateBounds();
  });
}

function createWindow() {
  window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 900,
    minHeight: 620,
    backgroundColor: '#08090b',
    title: 'BARLAS Browser',
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#0b0c0f', symbolColor: '#d7d9de', height: 40 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });
  window.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  window.on('resize', updateBounds);
  window.on('maximize', updateBounds);
  window.on('unmaximize', updateBounds);
  window.webContents.on('before-input-event', (event, input) => handleShortcut(event, input));
  window.webContents.once('did-finish-load', () => {
    const saved = browserData.settings.restoreSession ? browserData.session.urls : [];
    if (!saved.length) return createTab();
    restoringSession = true;
    const ids = saved.map((url) => createTab(url, false));
    selectTab(ids[browserData.session.activeIndex] || ids[0]);
    restoringSession = false;
    persistBrowserData();
  });
}

app.whenReady().then(async () => {
  browserData = await readBrowserData();
  localeState = await detectLocale(browserData.settings.language);
  const browserSession = session.fromPartition('persist:barlas-browser');
  browserSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
  browserSession.setPermissionCheckHandler(() => false);
  browserSession.on('will-download', (_event, item) => {
    item.once('done', (_doneEvent, status) => {
      if (status === 'completed') shell.showItemInFolder(item.getSavePath());
    });
  });
  installIpc();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
