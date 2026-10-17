const $ = (selector) => document.querySelector(selector);
const tabsElement = $('#tabs');
const address = $('#address');
let browserState = { tabs: [], activeTabId: null };

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
    title.textContent = tab.title || 'Новая вкладка';
    button.append(title);

    const close = document.createElement('button');
    close.className = 'tab-close';
    close.textContent = '×';
    close.title = 'Закрыть вкладку';
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
  renderTabs();
  const tab = activeTab();
  if (document.activeElement !== address) address.value = tab?.url || '';
  $('#back').disabled = !tab?.canGoBack;
  $('#forward').disabled = !tab?.canGoForward;
  $('#reload').textContent = tab?.loading ? '×' : '↻';
  $('#reload').title = tab?.loading ? 'Остановить' : 'Обновить';
  $('#security-indicator').classList.toggle('insecure', Boolean(tab?.url && !tab.url.startsWith('https://')));
  requestLayout();
}

function requestLayout() {
  window.barlas.reportLayout({ x: 58, y: 102, right: 0, bottom: 0 });
}

$('#address-form').addEventListener('submit', (event) => {
  event.preventDefault();
  window.barlas.navigate(address.value);
  address.blur();
});
address.addEventListener('focus', () => address.select());
$('#new-tab').addEventListener('click', () => window.barlas.newTab());
$('#home').addEventListener('click', () => window.barlas.newTab());
$('#back').addEventListener('click', () => window.barlas.back());
$('#forward').addEventListener('click', () => window.barlas.forward());
$('#reload').addEventListener('click', () => activeTab()?.loading ? window.barlas.stop() : window.barlas.reload());
$('#settings').addEventListener('click', () => showToast('Настройки приватности появятся в следующей версии'));
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
