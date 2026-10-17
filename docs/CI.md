# Continuous integration

Every pull request should run on Node.js 22 with the following checks:

```bash
npm ci
npm test
npm audit --audit-level=high
node --check src/main.cjs
node --check src/preload.cjs
node --check renderer/app.js
```

The GitHub Actions credential currently used to publish the repository does
not include GitHub's separate `workflow` OAuth scope. Add the workflow only
after that scope is explicitly granted; do not bypass the platform protection
or place broader credentials in the repository.
