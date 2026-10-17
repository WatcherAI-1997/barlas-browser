# Contributing to BARLAS Browser

Thanks for helping build an open, AI-native browser.

## Before you start

1. Search existing issues and pull requests.
2. Open an issue before large architectural or interface changes.
3. Keep each pull request focused on one problem.
4. Never include API keys, personal browser data, or generated build output.

## Development

```bash
npm install
npm test
npm start
```

Before opening a pull request, run:

```bash
npm test
npm audit
node --check src/main.cjs
node --check src/preload.cjs
node --check renderer/app.js
```

## Design and security rules

- Keep untrusted pages sandboxed.
- Do not enable Node.js integration for web content.
- Add renderer capabilities only through the narrow preload bridge.
- Treat new permissions, URL schemes, downloads, and external navigation as
  security-sensitive changes.
- Preserve the BARLAS visual system: dark surfaces, restrained red accents,
  and the three-circle mark.

By participating, you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).
