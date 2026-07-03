# Pinx Inspector

Development-only graphical inspector for Pinoox single-app projects.

Install it in applications as a dev dependency:

```bash
composer require --dev pinoox/pinx-inspector
```

Then run:

```bash
pinx dev
```

Open the inspector at:

```text
http://127.0.0.1:8000/~inspector
```

`pinx-cli` mounts this package during local development. It is not required in production and should stay in `require-dev`.

## Structure

- `resources/router.php` serves the local-only API and the Inspector HTML shell.
- `resources/views/` contains small PHP view partials. Twig is intentionally not required yet, so `pinx dev` does not need extra runtime dependencies.
- `resources/assets/inspector.js` contains the browser runtime for navigation, actions, copy buttons, and panels.
- `resources/assets/inspector.css` is built locally and must not use a CDN.
