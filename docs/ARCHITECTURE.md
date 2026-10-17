# Architecture

BARLAS Browser separates trusted application UI from untrusted web pages.

## Processes

### Main process

`src/main.cjs` owns application windows, Chromium `WebContentsView` instances,
tabs, navigation, downloads, permission policy, and the persistent browser
session.

Bookmarks and the restorable list of open HTTP(S) tabs are validated and
stored locally in the Electron user-data directory. Writes use a temporary
file and atomic rename so an interrupted write does not leave partial JSON.

At startup, the main process requests only a country code from `ipwho.is` and
maps all 251 ISO-backed countries and territories to 79 primary interface
languages. If country detection fails, the operating-system language is used.
The country and generated interface copy are cached locally for seven days.

Eight core languages are bundled with the application. For another locale,
only the browser's fixed English interface labels are sent to the free
MyMemory translation endpoint once and cached; URLs, page content, bookmarks,
searches, and browsing history are never sent to that service. If translation
is unavailable, the interface safely falls back to English.

### Preload bridge

`src/preload.cjs` exposes a small, explicit API to the trusted browser shell.
It does not expose Node.js, Electron internals, or generic IPC primitives.

### Browser shell

Files under `renderer/` implement the tab strip, navigation controls, and
bookmark sidebar. The shell uses a restrictive Content Security Policy.

### Web content

Every website is loaded in a sandboxed `WebContentsView` with context
isolation enabled, Node.js disabled, and insecure active content disabled.

## Navigation

`src/navigation.cjs` is the single normalization boundary for user input. It:

- accepts HTTP, HTTPS, and local file URLs;
- upgrades ordinary public hostnames to HTTPS;
- keeps localhost development URLs on HTTP;
- routes plain text to Google Search;
- prevents privileged or script URL schemes from executing through the address
  bar.

## Security work still required

- Per-site permission controls
- Navigation and download reputation checks
- Automatic Chromium update delivery
- Signed and reproducible releases
- External security review
- Tests for renderer crashes, recovery, and malicious pages
