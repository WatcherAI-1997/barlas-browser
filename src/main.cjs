'use strict';

const path = require('node:path');
const { app, BrowserWindow, WebContentsView, ipcMain, session, shell } = require('electron');
const { normalizeAddress } = require('./navigation.cjs');

const DEFAULT_LAYOUT = { x: 58, y: 102, right: 0, bottom: 0 };

let window;
let activeTabId;
let layout = { ...DEFAULT_LAYOUT };
let nextTabId = 1;
const tabs = new Map();

function activeTab() {
  return tabs.get(activeTabId);
}

function publicTab(tab) {
  return {
    id: tab.id,
    title: tab.title || 'Новая вкладка',
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
    activeTabId
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
  const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>
    :root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#08090b;color:#f4f5f7;font:16px system-ui,sans-serif}main{text-align:center;width:min(720px,88vw)}.mark{position:relative;margin:auto;width:88px;height:76px;filter:drop-shadow(0 18px 24px #ed1c2445)}.mark i{position:absolute;width:38px;height:38px;border-radius:50%;background:linear-gradient(145deg,#ff3037,#cf060d)}.mark i:nth-child(1){left:4px;top:0}.mark i:nth-child(2){right:4px;top:0}.mark i:nth-child(3){left:25px;bottom:0}h1{font-size:44px;letter-spacing:-2px;margin:24px 0 8px}p{color:#8e929a;margin:0}.hint{margin-top:34px;color:#60646c;font-size:13px}</style></head><body><main><div class="mark"><i></i><i></i><i></i></div><h1>BARLAS Browser</h1><p>Think ahead. Act beyond.</p><div class="hint">Введите адрес или запрос в строке сверху</div></main></body></html>`;
  tab.displayUrl = '';
  return tab.view.webContents.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
}

function navigateTab(tab, input) {
  const target = normalizeAddress(input);
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
    tab.title = title || 'Новая вкладка';
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
    broadcast();
  });
  contents.on('did-navigate', (_event, url) => {
    tab.displayUrl = url.startsWith('data:') ? '' : url;
    broadcast();
  });
  contents.on('did-navigate-in-page', (_event, url) => {
    tab.displayUrl = url;
    broadcast();
  });
  contents.on('render-process-gone', () => {
    tab.title = 'Вкладка завершила работу';
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
  const tab = { id, view, title: 'Новая вкладка', displayUrl: '', favicon: '', loading: false };
  tabs.set(id, tab);
  wireTab(tab);
  navigateTab(tab, url).catch(() => undefined);
  if (activate) selectTab(id);
  broadcast();
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
  return true;
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
  window.webContents.once('did-finish-load', () => createTab());
}

app.whenReady().then(() => {
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
