const $ = (selector) => document.querySelector(selector);
const tabsElement = $('#tabs');
const address = $('#address');
let browserState = { tabs: [], activeTabId: null };
let language = 'en';
let bookmarksOpen = false;

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
  return (COPY[language] || COPY.en)[key];
}

function bt(key) {
  return (BOOKMARK_COPY[language] || BOOKMARK_COPY.en)[key];
}

function applyLocale(locale) {
  language = COPY[locale?.language] ? locale.language : 'en';
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
  $('#settings').title = t('privacySettings');
  $('#settings').ariaLabel = t('privacySettings');
  $('.toolbar').ariaLabel = t('navigation');
  for (const [id, key] of [['back', 'back'], ['forward', 'forward'], ['menu', 'menu']]) {
    $("#" + id).title = t(key);
    $("#" + id).ariaLabel = t(key);
  }
  $('#security-indicator').title = t('connection');
  address.ariaLabel = t('address');
  address.placeholder = t('addressPlaceholder');
  $('#go').ariaLabel = t('go');
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
  window.barlas.reportLayout({ x: bookmarksOpen ? 358 : 58, y: 102, right: 0, bottom: 0 });
}

function setBookmarksOpen(open) {
  bookmarksOpen = open;
  $('#bookmarks-panel').hidden = !open;
  $('#bookmarks').classList.toggle('active', open);
  $('#home').classList.toggle('active', !open);
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
$('#close-bookmarks').addEventListener('click', () => setBookmarksOpen(false));
$('#bookmark-page').addEventListener('click', () => window.barlas.toggleBookmark());
$('#back').addEventListener('click', () => window.barlas.back());
$('#forward').addEventListener('click', () => window.barlas.forward());
$('#reload').addEventListener('click', () => activeTab()?.loading ? window.barlas.stop() : window.barlas.reload());
$('#settings').addEventListener('click', () => showToast(t('settingsSoon')));
$('#menu').addEventListener('click', () => showToast('BARLAS Browser 0.1 · Chromium'));
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
window.barlas.getState().then(render);
