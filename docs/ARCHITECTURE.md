# Architecture

BARLAS Browser separates trusted application UI from untrusted web pages.

## Processes

### Main process

`src/main.cjs` owns application windows, Chromium `WebContentsView` instances,
tabs, navigation, downloads, permission policy, and the persistent browser
session.

### Preload bridge

`src/preload.cjs` exposes a small, explicit API to the trusted browser shell.
It does not expose Node.js, Electron internals, or generic IPC primitives.

### Browser shell

Files under `renderer/` implement the tab strip, navigation controls, sidebar,
and BARLAS panel. The shell uses a restrictive Content Security Policy.

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

## Local BARLAS OS integration

The browser opens BARLAS OS at `http://127.0.0.1:17840` by default. The URL can
be replaced using `BARLAS_OS_URL`. Page-aware assistance will use a dedicated,
permissioned API in a future milestone rather than exposing page contents by
default.

## Security work still required

- Per-site permission controls
- Navigation and download reputation checks
- Automatic Chromium update delivery
- Signed and reproducible releases
- External security review
- Tests for renderer crashes, recovery, and malicious pages
