# Security policy

## Supported versions

BARLAS Browser is currently an alpha project. Security fixes are applied only
to the latest commit on the `main` branch.

## Reporting a vulnerability

Please do **not** disclose suspected vulnerabilities in public issues.

Use GitHub's private vulnerability reporting feature:

1. Open the repository's **Security** tab.
2. Choose **Report a vulnerability**.
3. Include affected files, reproduction steps, impact, and a suggested fix if
   available.

We aim to acknowledge a complete report within seven days. No guarantee is
made until a maintainer confirms the issue and its impact.

## Current alpha limitations

- The application is not yet code-signed.
- Sensitive website permissions are denied rather than managed per site.
- Automatic Chromium security updates are not yet implemented.
- The Windows portable build requires testing on a physical Windows machine.

Do not use this alpha build for banking, production administration, password
management, or other high-risk accounts.
