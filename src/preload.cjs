'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('barlas', {
  getState: () => ipcRenderer.invoke('browser:get-state'),
  newTab: (url) => ipcRenderer.invoke('browser:new-tab', url),
  selectTab: (id) => ipcRenderer.invoke('browser:select-tab', id),
  closeTab: (id) => ipcRenderer.invoke('browser:close-tab', id),
  navigate: (value) => ipcRenderer.invoke('browser:navigate', value),
  back: () => ipcRenderer.invoke('browser:back'),
  forward: () => ipcRenderer.invoke('browser:forward'),
  reload: () => ipcRenderer.invoke('browser:reload'),
  stop: () => ipcRenderer.invoke('browser:stop'),
  home: () => ipcRenderer.invoke('browser:home'),
  toggleBookmark: () => ipcRenderer.invoke('browser:toggle-bookmark'),
  removeBookmark: (url) => ipcRenderer.invoke('browser:remove-bookmark', url),
  removeHistoryEntry: (visitedAt) => ipcRenderer.invoke('browser:remove-history-entry', visitedAt),
  clearHistory: () => ipcRenderer.invoke('browser:clear-history'),
  setSetting: (key, value) => ipcRenderer.invoke('browser:set-setting', key, value),
  openDownloads: () => ipcRenderer.invoke('browser:open-downloads'),
  showDownload: (id) => ipcRenderer.invoke('browser:show-download', id),
  openDownload: (id) => ipcRenderer.invoke('browser:open-download', id),
  checkUpdates: () => ipcRenderer.invoke('browser:check-updates'),
  downloadUpdate: () => ipcRenderer.invoke('browser:download-update'),
  reopenClosedTab: () => ipcRenderer.invoke('browser:reopen-closed-tab'),
  showMenu: () => ipcRenderer.invoke('browser:show-menu'),
  reportLayout: (layout) => ipcRenderer.send('browser:layout', layout),
  onState: (callback) => {
    const handler = (_event, state) => callback(state);
    ipcRenderer.on('browser:state', handler);
    return () => ipcRenderer.removeListener('browser:state', handler);
  },
  onFind: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('browser:find', handler);
    return () => ipcRenderer.removeListener('browser:find', handler);
  },
  onOpenBookmarks: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('browser:open-bookmarks', handler);
    return () => ipcRenderer.removeListener('browser:open-bookmarks', handler);
  },
  onOpenHistory: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('browser:open-history', handler);
    return () => ipcRenderer.removeListener('browser:open-history', handler);
  },
  onOpenDownloads: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('browser:open-downloads-panel', handler);
    return () => ipcRenderer.removeListener('browser:open-downloads-panel', handler);
  },
  onOpenSettings: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('browser:open-settings', handler);
    return () => ipcRenderer.removeListener('browser:open-settings', handler);
  }
});
