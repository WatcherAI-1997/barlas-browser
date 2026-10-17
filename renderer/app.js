const $ = (selector) => document.querySelector(selector);
const tabsElement = $('#tabs');
const address = $('#address');
let browserState = { tabs: [], activeTabId: null };
let language = 'en';
let translatedCopy = {};
let bookmarksOpen = false;
let historyOpen = false;
let settingsOpen = false;

const TURKIC_LANGUAGES = [
  ['tr', 'Türkçe'], ['az', 'Azərbaycanca'], ['kk', 'Қазақша'], ['ky', 'Кыргызча'],
  ['uz', 'O‘zbekcha'], ['tk', 'Türkmençe'], ['tt', 'Татарча'], ['ba', 'Башҡортса'],
  ['cv', 'Чӑвашла'], ['sah', 'Саха тыла'], ['ug', 'ئۇيغۇرچە'], ['gag', 'Gagauzça'],
  ['crh', 'Qırımtatarca'], ['kaa', 'Qaraqalpaqsha'], ['kum', 'Къумукъча'], ['nog', 'Ногайша'],
  ['krc', 'Къарачай-малкъар'], ['alt', 'Алтай тил'], ['kjh', 'Хакас тілі'], ['tyv', 'Тыва дыл'],
  ['cjs', 'Шор тили'], ['sty', 'Себер татар теле'], ['slr', 'Салар тили'], ['azb', 'تۆرکجه'],
  ['kmz', 'Xorasan türkcəsi'], ['qxq', 'Qaşqay dili'], ['ili', 'Ili Türk dili'], ['ybe', 'Sarı Uyğur dili'],
  ['klj', 'Xələc dili'], ['dlg', 'Дулҕан тыла'], ['kim', 'Тоъфа дыл'], ['clw', 'Ӧс тили'],
  ['uum', 'Урум тили'], ['ota', 'لسان عثمانى'], ['tuk-IQ', 'Ирак түркмәнчәси']
];

const WORLD_LANGUAGE_CODES = [
  'af','ak','am','ar','asa','az','be','bem','bg','bi','bn','bs','ca','cgg','cs','da','de','dv','dz','ebu','el','en','es','et','fa','fi','fo','fr','he','hi','hr','hu','hy','id','is','it','ja','ka','kea','kk','kl','km','ko','ky','lo','lt','lv','mk','mn','ms','my','nb','ne','nl','no','pl','ps','pt','ro','ru','si','sk','sl','sm','so','sq','sr','sv','tg','th','ti','tk','to','tr','uk','uz','vi','zh'
];

const EXTRA_COPY = {
  az: { settings: 'Parametrlər', searchEngine: 'Axtarış sistemi', startup: 'Başlanğıc', restoreTabs: 'Yenidən başladıqda açıq tabları bərpa et', language: 'İnterfeys dili', automatic: 'Avtomatik (ölkə və sistem)', languageNote: 'Avtomatik rejim ölkənizi və əməliyyat sisteminin dilini istifadə edir.', downloads: 'Yükləmələr qovluğunu aç', saved: 'Saxlanıldı', history: 'Tarixçə', searchHistory: 'Tarixçədə axtar', clearHistory: 'Tarixçəni təmizlə', emptyHistory: 'Tarixçə hələ boşdur', removeHistory: 'Tarixçədən sil' },
  en: { settings: 'Settings', searchEngine: 'Search engine', startup: 'Startup', restoreTabs: 'Restore open tabs after restart', language: 'Interface language', automatic: 'Automatic (country and system)', languageNote: 'Automatic mode uses your country and operating-system language.', downloads: 'Open downloads folder', saved: 'Saved', history: 'History', searchHistory: 'Search history', clearHistory: 'Clear browsing history', emptyHistory: 'No browsing history yet', removeHistory: 'Remove from history' },
  kk: { settings: 'Баптаулар', searchEngine: 'Іздеу жүйесі', startup: 'Іске қосу', restoreTabs: 'Қайта іске қосқанда ашық беттерді қалпына келтіру', language: 'Интерфейс тілі', automatic: 'Автоматты (ел және жүйе)', languageNote: 'Автоматты режим елді және операциялық жүйе тілін пайдаланады.', downloads: 'Жүктеулер қалтасын ашу', saved: 'Сақталды', history: 'Тарих', searchHistory: 'Тарихтан іздеу', clearHistory: 'Тарихты тазалау', emptyHistory: 'Тарих әзірге бос', removeHistory: 'Тарихтан жою' },
  ky: { settings: 'Жөндөөлөр', searchEngine: 'Издөө тутуму', startup: 'Иштетүү', restoreTabs: 'Кайра иштеткенде ачык өтмөктөрдү калыбына келтирүү', language: 'Интерфейс тили', automatic: 'Автоматтык (өлкө жана система)', languageNote: 'Автоматтык режим өлкөнү жана операциялык тутумдун тилин колдонот.', downloads: 'Жүктөөлөр папкасын ачуу', saved: 'Сакталды', history: 'Тарых', searchHistory: 'Тарыхтан издөө', clearHistory: 'Тарыхты тазалоо', emptyHistory: 'Тарых азырынча бош', removeHistory: 'Тарыхтан өчүрүү' },
  mn: { settings: 'Тохиргоо', searchEngine: 'Хайлтын систем', startup: 'Эхлүүлэх', restoreTabs: 'Дахин эхлүүлэхэд нээлттэй табуудыг сэргээх', language: 'Интерфейсийн хэл', automatic: 'Автомат (улс ба систем)', languageNote: 'Автомат горим улс болон үйлдлийн системийн хэлийг ашиглана.', downloads: 'Таталтын хавтсыг нээх', saved: 'Хадгаллаа', history: 'Түүх', searchHistory: 'Түүхээс хайх', clearHistory: 'Түүхийг арилгах', emptyHistory: 'Түүх хоосон байна', removeHistory: 'Түүхээс устгах' },
  ru: { settings: 'Настройки', searchEngine: 'Поисковая система', startup: 'Запуск', restoreTabs: 'Восстанавливать открытые вкладки после перезапуска', language: 'Язык интерфейса', automatic: 'Автоматически (страна и система)', languageNote: 'Автоматический режим использует страну и язык операционной системы.', downloads: 'Открыть папку загрузок', saved: 'Сохранено', history: 'История', searchHistory: 'Поиск в истории', clearHistory: 'Очистить историю', emptyHistory: 'История пока пуста', removeHistory: 'Удалить из истории' },
  tr: { settings: 'Ayarlar', searchEngine: 'Arama motoru', startup: 'Başlangıç', restoreTabs: 'Yeniden başlatınca açık sekmeleri geri yükle', language: 'Arayüz dili', automatic: 'Otomatik (ülke ve sistem)', languageNote: 'Otomatik mod ülkenizi ve işletim sistemi dilini kullanır.', downloads: 'İndirilenler klasörünü aç', saved: 'Kaydedildi', history: 'Geçmiş', searchHistory: 'Geçmişte ara', clearHistory: 'Geçmişi temizle', emptyHistory: 'Geçmiş henüz boş', removeHistory: 'Geçmişten kaldır' },
  uz: { settings: 'Sozlamalar', searchEngine: 'Qidiruv tizimi', startup: 'Ishga tushirish', restoreTabs: 'Qayta ishga tushganda ochiq varaqlarni tiklash', language: 'Interfeys tili', automatic: 'Avtomatik (mamlakat va tizim)', languageNote: 'Avtomatik rejim mamlakat va operatsion tizim tilidan foydalanadi.', downloads: 'Yuklamalar jildini ochish', saved: 'Saqlandi', history: 'Tarix', searchHistory: 'Tarixdan qidirish', clearHistory: 'Tarixni tozalash', emptyHistory: 'Tarix hozircha bo‘sh', removeHistory: 'Tarixdan o‘chirish' }
};

const BOOKMARK_COPY = {
  az: { bookmarks: 'Əlfəcinlər', addBookmark: 'Əlfəcinlərə əlavə et', removeBookmark: 'Əlfəcini sil', emptyBookmarks: 'Hələ saxlanmış səhifə yoxdur', close: 'Bağla' },
  en: { bookmarks: 'Bookmarks', addBookmark: 'Add bookmark', removeBookmark: 'Remove bookmark', emptyBookmarks: 'No saved pages yet', close: 'Close' },
  kk: { bookmarks: 'Бетбелгілер', addBookmark: 'Бетбелгіге қосу', removeBookmark: 'Бетбелгіні жою', emptyBookmarks: 'Сақталған беттер әзірге жоқ', close: 'Жабу' },
  ky: { bookmarks: 'Кыстармалар', addBookmark: 'Кыстармага кошуу', removeBookmark: 'Кыстарманы өчүрүү', emptyBookmarks: 'Сакталган барактар азырынча жок', close: 'Жабуу' },
  mn: { bookmarks: 'Хавчуурга', addBookmark: 'Хавчуургад нэмэх', removeBookmark: 'Хавчуургыг устгах', emptyBookmarks: 'Хадгалсан хуудас алга', close: 'Хаах' },
  ru: { bookmarks: 'Закладки', addBookmark: 'Добавить в закладки', removeBookmark: 'Удалить закладку', emptyBookmarks: 'Сохранённых страниц пока нет', close: 'Закрыть' },
  tr: { bookmarks: 'Yer imleri', addBookmark: 'Yer imlerine ekle', removeBookmark: 'Yer imini kaldır', emptyBookmarks: 'Henüz kaydedilmiş sayfa yok', close: 'Kapat' },
  uz: { bookmarks: 'Xatcho‘plar', addBookmark: 'Xatcho‘pga qo‘shish', removeBookmark: 'Xatcho‘pni o‘chirish', emptyBookmarks: 'Hali saqlangan sahifalar yo‘q', close: 'Yopish' }
};

const COPY = {
  az: { newTab: 'Yeni tab', closeTab: 'Tabı bağla', settingsSoon: 'Məxfilik parametrləri növbəti versiyada olacaq', privacySettings: 'Məxfilik parametrləri (hazırlanır)', sidebar: 'Yan panel', navigation: 'Naviqasiya', back: 'Geri', forward: 'İrəli', reload: 'Yenilə', stop: 'Dayandır', connection: 'Bağlantı vəziyyəti', address: 'Ünvan və ya axtarış sorğusu', addressPlaceholder: 'Ünvan və ya axtarış sorğusu daxil edin', go: 'Keç', menu: 'Menyu' },
  en: { newTab: 'New tab', closeTab: 'Close tab', settingsSoon: 'Privacy settings are coming in the next version', privacySettings: 'Privacy settings (coming soon)', sidebar: 'Sidebar', navigation: 'Navigation', back: 'Back', forward: 'Forward', reload: 'Reload', stop: 'Stop', connection: 'Connection status', address: 'Address or search query', addressPlaceholder: 'Enter an address or search query', go: 'Go', menu: 'Menu' },
  kk: { newTab: 'Жаңа бет', closeTab: 'Бетті жабу', settingsSoon: 'Құпиялық баптаулары келесі нұсқада шығады', privacySettings: 'Құпиялық баптаулары (әзірленуде)', sidebar: 'Бүйірлік панель', navigation: 'Навигация', back: 'Артқа', forward: 'Алға', reload: 'Жаңарту', stop: 'Тоқтату', connection: 'Қосылым күйі', address: 'Мекенжай немесе іздеу сұрауы', addressPlaceholder: 'Мекенжай немесе іздеу сұрауын енгізіңіз', go: 'Өту', menu: 'Мәзір' },
  ky: { newTab: 'Жаңы өтмөк', closeTab: 'Өтмөктү жабуу', settingsSoon: 'Купуялык жөндөөлөрү кийинки версияда чыгат', privacySettings: 'Купуялык жөндөөлөрү (иштелүүдө)', sidebar: 'Каптал тилке', navigation: 'Навигация', back: 'Артка', forward: 'Алга', reload: 'Жаңыртуу', stop: 'Токтотуу', connection: 'Туташуу абалы', address: 'Дарек же издөө сурамы', addressPlaceholder: 'Дарек же издөө сурамын киргизиңиз', go: 'Өтүү', menu: 'Меню' },
  mn: { newTab: 'Шинэ таб', closeTab: 'Табыг хаах', settingsSoon: 'Нууцлалын тохиргоо дараагийн хувилбарт нэмэгдэнэ', privacySettings: 'Нууцлалын тохиргоо (боловсруулж байна)', sidebar: 'Хажуугийн самбар', navigation: 'Чиглүүлэлт', back: 'Буцах', forward: 'Урагш', reload: 'Дахин ачаалах', stop: 'Зогсоох', connection: 'Холболтын төлөв', address: 'Хаяг эсвэл хайлтын үг', addressPlaceholder: 'Хаяг эсвэл хайлтын үг оруулна уу', go: 'Нээх', menu: 'Цэс' },
  ru: { newTab: 'Новая вкладка', closeTab: 'Закрыть вкладку', settingsSoon: 'Настройки приватности появятся в следующей версии', privacySettings: 'Настройки приватности (в разработке)', sidebar: 'Боковая панель', navigation: 'Навигация', back: 'Назад', forward: 'Вперёд', reload: 'Обновить', stop: 'Остановить', connection: 'Состояние соединения', address: 'Адрес или поисковый запрос', addressPlaceholder: 'Введите адрес или поисковый запрос', go: 'Перейти', menu: 'Меню' },
  tr: { newTab: 'Yeni sekme', closeTab: 'Sekmeyi kapat', settingsSoon: 'Gizlilik ayarları bir sonraki sürümde gelecek', privacySettings: 'Gizlilik ayarları (yakında)', sidebar: 'Kenar çubuğu', navigation: 'Gezinme', back: 'Geri', forward: 'İleri', reload: 'Yenile', stop: 'Durdur', connection: 'Bağlantı durumu', address: 'Adres veya arama sorgusu', addressPlaceholder: 'Adres veya arama sorgusu girin', go: 'Git', menu: 'Menü' },
  uz: { newTab: 'Yangi varaq', closeTab: 'Varaqni yopish', settingsSoon: 'Maxfiylik sozlamalari keyingi versiyada chiqadi', privacySettings: 'Maxfiylik sozlamalari (ishlab chiqilmoqda)', sidebar: 'Yon panel', navigation: 'Navigatsiya', back: 'Orqaga', forward: 'Oldinga', reload: 'Yangilash', stop: 'To‘xtatish', connection: 'Ulanish holati', address: 'Manzil yoki qidiruv so‘rovi', addressPlaceholder: 'Manzil yoki qidiruv so‘rovini kiriting', go: 'O‘tish', menu: 'Menyu' }
};

function t(key) {
  if (translatedCopy[key]) return translatedCopy[key];
  return EXTRA_COPY[language]?.[key] || COPY[language]?.[key] || EXTRA_COPY.en[key] || COPY.en[key] || key;
}

function bt(key) {
  if (translatedCopy[key]) return translatedCopy[key];
  return BOOKMARK_COPY[language]?.[key] || BOOKMARK_COPY.en[key] || key;
}

function populateLanguages() {
  const select = $('#interface-language');
  if (select.options.length) return;
  select.add(new Option(t('automatic'), 'auto'));
  let displayNames;
  try { displayNames = new Intl.DisplayNames([language], { type: 'language' }); } catch { displayNames = null; }
  const priority = new Map(TURKIC_LANGUAGES);
  priority.set('mn', 'Монгол хэл');
  const codes = [...new Set([...priority.keys(), ...WORLD_LANGUAGE_CODES])];
  for (const code of codes) {
    const label = priority.get(code) || displayNames?.of(code.split('-')[0]) || code;
    select.add(new Option(`${label} — ${code}`, code));
  }
}

function applyLocale(locale) {
  language = locale?.language || 'en';
  translatedCopy = locale?.messages || {};
  document.documentElement.lang = language;
  $('#new-tab').title = `${t('newTab')} (Ctrl+T)`;
  $('#new-tab').ariaLabel = t('newTab');
  $('.rail').ariaLabel = t('sidebar');
  $('#home').title = t('newTab');
  $('#home').ariaLabel = t('newTab');
  $('#bookmarks').title = bt('bookmarks');
  $('#bookmarks').ariaLabel = bt('bookmarks');
  $('#bookmarks-panel').ariaLabel = bt('bookmarks');
  $('#bookmarks-title').textContent = bt('bookmarks');
  $('#bookmarks-empty').textContent = bt('emptyBookmarks');
  $('#close-bookmarks').ariaLabel = bt('close');
  $('#history').title = t('history');
  $('#history').ariaLabel = t('history');
  $('#history-panel').ariaLabel = t('history');
  $('#history-title').textContent = t('history');
  $('#history-search').placeholder = t('searchHistory');
  $('#history-search').ariaLabel = t('searchHistory');
  $('#clear-history').textContent = t('clearHistory');
  $('#history-empty').textContent = t('emptyHistory');
  $('#close-history').ariaLabel = bt('close');
  $('#settings').title = t('settings');
  $('#settings').ariaLabel = t('settings');
  $('#settings-panel').ariaLabel = t('settings');
  $('#settings-title').textContent = t('settings');
  $('#close-settings').ariaLabel = bt('close');
  $('#search-engine-label').textContent = t('searchEngine');
  $('#language-label').textContent = t('language');
  $('#language-note').textContent = t('languageNote');
  $('#startup-label').textContent = t('startup');
  $('#restore-session-label').textContent = t('restoreTabs');
  $('#open-downloads').textContent = t('downloads');
  $('.toolbar').ariaLabel = t('navigation');
  for (const [id, key] of [['back', 'back'], ['forward', 'forward'], ['menu', 'menu']]) {
    $("#" + id).title = t(key);
    $("#" + id).ariaLabel = t(key);
  }
  $('#security-indicator').title = t('connection');
  address.ariaLabel = t('address');
  address.placeholder = t('addressPlaceholder');
  $('#go').ariaLabel = t('go');
  const automatic = $('#interface-language option[value="auto"]');
  if (automatic) automatic.textContent = t('automatic');
}

function renderHistory() {
  const list = $('#history-list');
  list.replaceChildren();
  const query = $('#history-search').value.trim().toLocaleLowerCase(language);
  const entries = (browserState.history || []).filter((entry) => {
    if (!query) return true;
    return `${entry.title || ''}\n${entry.url}`.toLocaleLowerCase(language).includes(query);
  });
  $('#history-empty').hidden = entries.length > 0;
  $('#history-empty').textContent = (browserState.history || []).length ? t('searchHistory') : t('emptyHistory');
  for (const entry of entries) {
    const item = document.createElement('div');
    item.className = 'history-item';
    const time = document.createElement('span');
    time.className = 'history-time';
    time.textContent = new Intl.DateTimeFormat(language, { hour: '2-digit', minute: '2-digit' }).format(entry.visitedAt);
    const link = document.createElement('button');
    link.className = 'history-link';
    const title = document.createElement('span');
    title.className = 'history-title';
    title.textContent = entry.title || entry.url;
    const url = document.createElement('span');
    url.className = 'history-url';
    url.textContent = entry.url;
    link.append(title, url);
    link.addEventListener('click', () => {
      window.barlas.navigate(entry.url);
      setHistoryOpen(false);
    });
    const remove = document.createElement('button');
    remove.className = 'bookmark-remove';
    remove.textContent = '×';
    remove.title = t('removeHistory');
    remove.ariaLabel = t('removeHistory');
    remove.addEventListener('click', () => window.barlas.removeHistoryEntry(entry.visitedAt));
    item.append(time, link, remove);
    list.append(item);
  }
}

function renderBookmarks() {
  const list = $('#bookmarks-list');
  list.replaceChildren();
  const bookmarks = browserState.bookmarks || [];
  $('#bookmarks-empty').hidden = bookmarks.length > 0;
  for (const bookmark of bookmarks) {
    const item = document.createElement('div');
    item.className = 'bookmark-item';
    const link = document.createElement('button');
    link.className = 'bookmark-link';
    const title = document.createElement('span');
    title.className = 'bookmark-title';
    title.textContent = bookmark.title || bookmark.url;
    const url = document.createElement('span');
    url.className = 'bookmark-url';
    url.textContent = bookmark.url;
    link.append(title, url);
    link.addEventListener('click', () => window.barlas.newTab(bookmark.url));
    const remove = document.createElement('button');
    remove.className = 'bookmark-remove';
    remove.textContent = '×';
    remove.title = bt('removeBookmark');
    remove.ariaLabel = bt('removeBookmark');
    remove.addEventListener('click', () => window.barlas.removeBookmark(bookmark.url));
    item.append(link, remove);
    list.append(item);
  }
}

function activeTab() {
  return browserState.tabs.find((tab) => tab.id === browserState.activeTabId);
}

function favicon(tab) {
  if (tab.favicon) {
    const image = document.createElement('img');
    image.className = 'favicon';
    image.src = tab.favicon;
    image.alt = '';
    return image;
  }
  const fallback = document.createElement('span');
  fallback.className = 'favicon-fallback';
  fallback.textContent = tab.loading ? '·' : (tab.title?.[0] || 'B').toUpperCase();
  return fallback;
}

function renderTabs() {
  tabsElement.replaceChildren();
  for (const tab of browserState.tabs) {
    const button = document.createElement('div');
    button.className = `tab${tab.id === browserState.activeTabId ? ' active' : ''}`;
    button.role = 'tab';
    button.tabIndex = 0;
    button.ariaSelected = String(tab.id === browserState.activeTabId);
    button.append(favicon(tab));

    const title = document.createElement('span');
    title.className = 'tab-title';
    title.textContent = tab.title || t('newTab');
    button.append(title);

    const close = document.createElement('button');
    close.className = 'tab-close';
    close.textContent = '×';
    close.title = t('closeTab');
    close.addEventListener('click', (event) => {
      event.stopPropagation();
      window.barlas.closeTab(tab.id);
    });
    button.append(close);
    button.addEventListener('click', () => window.barlas.selectTab(tab.id));
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') window.barlas.selectTab(tab.id);
    });
    tabsElement.append(button);
  }
}

function render(state) {
  browserState = state;
  applyLocale(state.locale);
  renderTabs();
  renderBookmarks();
  renderHistory();
  populateLanguages();
  $('#search-engine').value = state.settings?.searchEngine || 'google';
  $('#restore-session').checked = state.settings?.restoreSession !== false;
  $('#interface-language').value = state.settings?.language || 'auto';
  $('.settings-version').textContent = `BARLAS Browser ${state.appVersion || ''}`.trim();
  const tab = activeTab();
  if (document.activeElement !== address) address.value = tab?.url || '';
  $('#back').disabled = !tab?.canGoBack;
  $('#forward').disabled = !tab?.canGoForward;
  $('#reload').textContent = tab?.loading ? '×' : '↻';
  $('#reload').title = tab?.loading ? t('stop') : t('reload');
  $('#reload').ariaLabel = $('#reload').title;
  $('#security-indicator').classList.toggle('insecure', Boolean(tab?.url && !tab.url.startsWith('https://')));
  $('#bookmark-page').textContent = state.activeBookmarked ? '★' : '☆';
  $('#bookmark-page').classList.toggle('active', Boolean(state.activeBookmarked));
  $('#bookmark-page').title = state.activeBookmarked ? bt('removeBookmark') : bt('addBookmark');
  $('#bookmark-page').ariaLabel = $('#bookmark-page').title;
  requestLayout();
}

function requestLayout() {
  window.barlas.reportLayout({ x: settingsOpen ? 418 : (historyOpen ? 438 : (bookmarksOpen ? 358 : 58)), y: 102, right: 0, bottom: 0 });
}

function setBookmarksOpen(open) {
  bookmarksOpen = open;
  if (open) { settingsOpen = false; historyOpen = false; }
  $('#bookmarks-panel').hidden = !open;
  $('#settings-panel').hidden = true;
  $('#history-panel').hidden = true;
  $('#bookmarks').classList.toggle('active', open);
  $('#settings').classList.remove('active');
  $('#history').classList.remove('active');
  $('#home').classList.toggle('active', !open && !settingsOpen && !historyOpen);
  requestLayout();
}

function setHistoryOpen(open) {
  historyOpen = open;
  if (open) { bookmarksOpen = false; settingsOpen = false; }
  $('#history-panel').hidden = !open;
  $('#bookmarks-panel').hidden = true;
  $('#settings-panel').hidden = true;
  $('#history').classList.toggle('active', open);
  $('#bookmarks').classList.remove('active');
  $('#settings').classList.remove('active');
  $('#home').classList.toggle('active', !open && !settingsOpen && !bookmarksOpen);
  requestLayout();
  if (open) $('#history-search').focus();
}

function setSettingsOpen(open) {
  settingsOpen = open;
  if (open) { bookmarksOpen = false; historyOpen = false; }
  $('#settings-panel').hidden = !open;
  $('#bookmarks-panel').hidden = true;
  $('#history-panel').hidden = true;
  $('#settings').classList.toggle('active', open);
  $('#bookmarks').classList.remove('active');
  $('#history').classList.remove('active');
  $('#home').classList.toggle('active', !open && !bookmarksOpen && !historyOpen);
  requestLayout();
}

$('#address-form').addEventListener('submit', (event) => {
  event.preventDefault();
  window.barlas.navigate(address.value);
  address.blur();
});
address.addEventListener('focus', () => address.select());
$('#new-tab').addEventListener('click', () => window.barlas.newTab());
$('#home').addEventListener('click', () => window.barlas.newTab());
$('#bookmarks').addEventListener('click', () => setBookmarksOpen(!bookmarksOpen));
$('#history').addEventListener('click', () => setHistoryOpen(!historyOpen));
$('#close-bookmarks').addEventListener('click', () => setBookmarksOpen(false));
$('#close-history').addEventListener('click', () => setHistoryOpen(false));
$('#history-search').addEventListener('input', renderHistory);
$('#clear-history').addEventListener('click', () => window.barlas.clearHistory());
$('#close-settings').addEventListener('click', () => setSettingsOpen(false));
$('#bookmark-page').addEventListener('click', () => window.barlas.toggleBookmark());
$('#back').addEventListener('click', () => window.barlas.back());
$('#forward').addEventListener('click', () => window.barlas.forward());
$('#reload').addEventListener('click', () => activeTab()?.loading ? window.barlas.stop() : window.barlas.reload());
$('#settings').addEventListener('click', () => setSettingsOpen(!settingsOpen));
$('#menu').addEventListener('click', () => window.barlas.showMenu());
$('#search-engine').addEventListener('change', async (event) => {
  await window.barlas.setSetting('searchEngine', event.target.value);
  showToast(t('saved'));
});
$('#restore-session').addEventListener('change', async (event) => {
  await window.barlas.setSetting('restoreSession', event.target.checked);
  showToast(t('saved'));
});
$('#interface-language').addEventListener('change', async (event) => {
  await window.barlas.setSetting('language', event.target.value);
  showToast(t('saved'));
});
$('#open-downloads').addEventListener('click', () => window.barlas.openDownloads());
window.addEventListener('resize', requestLayout);

let toastTimer;
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2600);
}

window.barlas.onState(render);
window.barlas.onFind(() => {
  address.focus();
  address.select();
});
window.barlas.onOpenBookmarks(() => setBookmarksOpen(true));
window.barlas.onOpenHistory(() => setHistoryOpen(true));
window.barlas.onOpenSettings(() => setSettingsOpen(true));
window.barlas.getState().then(render);
