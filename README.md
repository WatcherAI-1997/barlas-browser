# BARLAS Browser

AI-native desktop browser by **Barlas Bit**. The first prototype uses the
Chromium engine supplied by Electron and provides a custom Barlas interface,
tabs, navigation, downloads, a privacy-first permission policy, and a direct
entry point to a local BARLAS OS instance.

## Run from source

Requirements: Node.js 22 or newer.

```bash
npm install
npm start
```

BARLAS OS is expected at `http://127.0.0.1:17840` by default. Override it with
the `BARLAS_OS_URL` environment variable.

## Build the Windows installer

```bash
npm run dist:win
```

The installer is written to `release/`.

On a non-Windows build host, create the portable Windows directory with:

```bash
npx electron-builder --win dir
```

Then launch `BARLAS Browser.exe` from `release/win-unpacked/` on Windows.

## Security model

- Browser pages run with Node.js integration disabled, context isolation on,
  and Chromium sandboxing enabled.
- The browser shell communicates through a narrow preload API.
- Popups become tabs instead of receiving unrestricted child windows.
- Camera, microphone, location, notifications, MIDI, and other sensitive
  permissions are denied in this prototype. Per-site permission controls are
  planned before a public release.

This is an early prototype, not yet a replacement for a fully audited browser.
