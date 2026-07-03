# Pinx Inspector

Development-only graphical inspector for Pinoox single-app projects.

Pinx Inspector gives developers a local dashboard for the current app: database
connections, tables, rows, visual queries, migrations, routes, logs, config,
environment values, views, language files, Pinker cache, and build/release
workflows.

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

## Database and DevDB

Inspector reads the active development connection instead of being limited to a
single storage backend.

- `DB_CONNECTION=mysql`, `pgsql`, or `sqlite` uses the configured PDO connection.
- `DB_CONNECTION=auto` follows the app fallback behavior.
- `DB_CONNECTION=devdb` is shown as **DevDB** in the UI.
- DevDB uses SQLite when `pdo_sqlite` is available and automatically falls back
  to zero-dependency JSON storage when it is not.
- DevDB JSON raw SQL execution is enabled when `pinoox/devdb` is installed,
  using the official DevDB SQL translator.

If a real connection is not reachable, the Connections page still opens and
shows the connection error instead of hiding the rest of the Inspector.

## Structure

- `resources/router.php` serves the local-only API and the Inspector HTML shell.
- `resources/views/` contains small PHP view partials. Twig is intentionally not required yet, so `pinx dev` does not need extra runtime dependencies.
- `resources/assets/inspector.js` contains the browser runtime for navigation, actions, copy buttons, and panels.
- `resources/assets/inspector.css` is built locally and must not use a CDN.

## Publishing

This package is intended to live in its own repository:

```text
https://github.com/pinoox/pinx-inspector
```

Use a normal Packagist install in apps:

```json
{
  "require-dev": {
    "pinoox/pinx-inspector": "^1.0"
  }
}
```
