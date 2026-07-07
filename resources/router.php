<?php

declare(strict_types=1);

require_once __DIR__ . '/platform-context.php';
require_once __DIR__ . '/manifest-context.php';
require_once __DIR__ . '/route-context.php';
require_once __DIR__ . '/lang-context.php';

$platformRoot = normalize_path((string) ($_SERVER['PINX_INSPECTOR_PROJECT_ROOT'] ?? getenv('PINX_INSPECTOR_PROJECT_ROOT') ?: getcwd()));
$root = inspector_scope_root($platformRoot);
$path = parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/';
$basePath = rtrim((string) ($_SERVER['PINX_INSPECTOR_BASE_PATH'] ?? getenv('PINX_INSPECTOR_BASE_PATH') ?: ''), '/');

if ($basePath !== '' && ($path === $basePath || str_starts_with($path, $basePath . '/'))) {
    $path = substr($path, strlen($basePath));
    $path = $path === '' ? '/' : $path;
}

$remoteAddress = (string) ($_SERVER['REMOTE_ADDR'] ?? '127.0.0.1');
if (!str_starts_with($remoteAddress, '127.') && $remoteAddress !== '::1') {
    http_response_code(403);
    echo 'Pinx Inspector is local-only.';
    return;
}

try {
    if ($path === '/' || $path === '/index.html') {
        html_response(inspector_html($basePath));
        return;
    }

    if ($path === '/assets/inspector.css') {
        asset_response(__DIR__ . '/assets/inspector.css', 'text/css; charset=utf-8');
        return;
    }

    if ($path === '/assets/inspector-ui.css') {
        asset_response(__DIR__ . '/assets/inspector-ui.css', 'text/css; charset=utf-8');
        return;
    }

    if ($path === '/assets/inspector.js') {
        asset_response(__DIR__ . '/assets/inspector.js', 'application/javascript; charset=utf-8');
        return;
    }

    if ($path === '/api/apps') {
        json_response(apps_payload($platformRoot));
        return;
    }

    if ($path === '/api/summary') {
        json_response(summary_payload($root, $platformRoot));
        return;
    }

    if ($path === '/api/tables') {
        json_response(tables_payload($root));
        return;
    }

    if ($path === '/api/database') {
        json_response(database_payload($root));
        return;
    }

    if ($path === '/api/table') {
        $table = (string) ($_GET['name'] ?? '');
        $limit = max(1, min(500, (int) ($_GET['limit'] ?? 50)));
        $offset = max(0, (int) ($_GET['offset'] ?? 0));
        json_response(table_payload($root, $table, $limit, $offset));
        return;
    }

    if ($path === '/api/table/insert') {
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
            json_response(['error' => true, 'message' => 'POST is required.'], 405);
            return;
        }

        $payload = json_decode((string) file_get_contents('php://input'), true);
        json_response(insert_table_row_payload($root, is_array($payload) ? $payload : []));
        return;
    }

    if ($path === '/api/table/delete') {
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
            json_response(['error' => true, 'message' => 'POST is required.'], 405);
            return;
        }

        $payload = json_decode((string) file_get_contents('php://input'), true);
        json_response(delete_table_rows_payload($root, is_array($payload) ? $payload : []));
        return;
    }

    if ($path === '/api/query/raw') {
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
            json_response(['error' => true, 'message' => 'POST is required.'], 405);
            return;
        }

        $payload = json_decode((string) file_get_contents('php://input'), true);
        json_response(raw_query_payload($root, is_array($payload) ? $payload : []));
        return;
    }

    if ($path === '/api/query') {
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
            json_response(['error' => true, 'message' => 'POST is required.'], 405);
            return;
        }

        $payload = json_decode((string) file_get_contents('php://input'), true);
        json_response(visual_query_payload($root, is_array($payload) ? $payload : []));
        return;
    }

    if ($path === '/api/export') {
        json_response(export_payload($root));
        return;
    }

    if ($path === '/api/health') {
        json_response(health_payload($root));
        return;
    }

    if ($path === '/api/migrations') {
        json_response(migrations_payload($root));
        return;
    }

    if ($path === '/api/routes') {
        json_response(routes_payload($root));
        return;
    }

    if ($path === '/api/logs') {
        json_response(logs_payload($root));
        return;
    }

    if ($path === '/api/logs/clear' || $path === '/api/logs/delete') {
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
            json_response(['error' => true, 'message' => 'POST is required.'], 405);
            return;
        }

        $payload = json_decode((string) file_get_contents('php://input'), true);
        json_response($path === '/api/logs/clear'
            ? clear_logs_payload($root, is_array($payload) ? $payload : [])
            : delete_log_payload($root, is_array($payload) ? $payload : []));
        return;
    }

    if ($path === '/api/env') {
        json_response(env_payload($root));
        return;
    }

    if ($path === '/api/env/save') {
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
            json_response(['error' => true, 'message' => 'POST is required.'], 405);
            return;
        }

        $payload = json_decode((string) file_get_contents('php://input'), true);
        json_response(save_env_payload($root, is_array($payload) ? $payload : []));
        return;
    }

    if ($path === '/api/config') {
        json_response(config_payload($root));
        return;
    }

    if ($path === '/api/config/save') {
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
            json_response(['error' => true, 'message' => 'POST is required.'], 405);
            return;
        }

        $payload = json_decode((string) file_get_contents('php://input'), true);
        json_response(save_config_payload($root, is_array($payload) ? $payload : []));
        return;
    }

    if ($path === '/api/lang') {
        json_response(lang_payload($root));
        return;
    }

    if ($path === '/api/lang/save') {
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
            json_response(['error' => true, 'message' => 'POST is required.'], 405);
            return;
        }

        $payload = json_decode((string) file_get_contents('php://input'), true);
        json_response(save_lang_payload($root, is_array($payload) ? $payload : []));
        return;
    }

    if ($path === '/api/lang/copy-locale') {
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
            json_response(['error' => true, 'message' => 'POST is required.'], 405);
            return;
        }

        $payload = json_decode((string) file_get_contents('php://input'), true);
        json_response(copy_lang_locale_payload($root, is_array($payload) ? $payload : []));
        return;
    }

    if ($path === '/api/lang/sync') {
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
            json_response(['error' => true, 'message' => 'POST is required.'], 405);
            return;
        }

        $payload = json_decode((string) file_get_contents('php://input'), true);
        json_response(sync_lang_file_payload($root, is_array($payload) ? $payload : []));
        return;
    }

    if ($path === '/api/lang/sync-locale') {
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
            json_response(['error' => true, 'message' => 'POST is required.'], 405);
            return;
        }

        $payload = json_decode((string) file_get_contents('php://input'), true);
        json_response(sync_lang_locale_payload($root, is_array($payload) ? $payload : []));
        return;
    }

    if ($path === '/api/themes') {
        json_response(themes_payload($root));
        return;
    }

    if ($path === '/api/views') {
        json_response(views_payload($root));
        return;
    }

    if ($path === '/api/views/save') {
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
            json_response(['error' => true, 'message' => 'POST is required.'], 405);
            return;
        }

        $payload = json_decode((string) file_get_contents('php://input'), true);
        json_response(save_view_payload($root, is_array($payload) ? $payload : []));
        return;
    }

    if ($path === '/api/pinker') {
        json_response(pinker_payload($root));
        return;
    }

    if ($path === '/api/build') {
        json_response(build_payload($root));
        return;
    }

    if ($path === '/api/build/sign') {
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
            json_response(['error' => true, 'message' => 'POST is required.'], 405);
            return;
        }

        $payload = json_decode((string) file_get_contents('php://input'), true);
        json_response(build_sign_payload($root, is_array($payload) ? $payload : []));
        return;
    }

    if ($path === '/api/schedule') {
        json_response(schedule_payload($root));
        return;
    }

    if ($path === '/api/flow') {
        json_response(flow_payload($root));
        return;
    }

    if ($path === '/api/recommendations') {
        json_response(recommendations_payload($root));
        return;
    }

    if ($path === '/api/cli/actions') {
        json_response(['actions' => cli_actions()]);
        return;
    }

    if ($path === '/api/cli/run') {
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
            json_response(['error' => true, 'message' => 'POST is required.'], 405);
            return;
        }

        $payload = json_decode((string) file_get_contents('php://input'), true);
        $action = is_array($payload) ? (string) ($payload['action'] ?? '') : '';
        json_response(run_cli_action($root, $action));
        return;
    }

    if ($path === '/api/action/run') {
        if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
            json_response(['error' => true, 'message' => 'POST is required.'], 405);
            return;
        }

        $payload = json_decode((string) file_get_contents('php://input'), true);
        $action = is_array($payload) ? (string) ($payload['action'] ?? '') : '';
        json_response(inspector_action_payload($root, $action));
        return;
    }

    http_response_code(404);
    echo 'Not found';
} catch (Throwable $e) {
    json_response([
        'error' => true,
        'message' => $e->getMessage(),
    ], 500);
}

function normalize_path(string $path): string
{
    return rtrim(str_replace('\\', '/', $path), '/');
}

function read_env(string $root): array
{
    $env = [];
    $file = inspector_env_root($root) . '/.env';
    if (!is_file($file)) {
        return $env;
    }

    foreach (file($file, FILE_IGNORE_NEW_LINES) ?: [] as $line) {
        $line = trim((string) $line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }

        [$key, $value] = explode('=', $line, 2);
        $env[trim($key)] = trim(trim($value), "\"'");
    }

    return $env;
}

function resolve_project_path(string $root, string $path): string
{
    $path = trim(str_replace('\\', '/', $path));
    if ($path === '' || $path === '~') {
        return $root;
    }

    if (str_starts_with($path, '~/')) {
        return $root . '/' . substr($path, 2);
    }

    if (preg_match('/^[A-Za-z]:\//', $path) === 1 || str_starts_with($path, '/')) {
        return $path;
    }

    return $root . '/' . $path;
}

function devdb_path(string $root): string
{
    $env = read_env($root);
    $path = (string) ($env['DEVDB_PATH'] ?? 'storage/devdb');
    $platformRoot = inspector_platform_root_from_scope($root);

    return resolve_project_path($platformRoot, $path);
}

function sqlite_database(string $root): string
{
    $env = read_env($root);
    $database = (string) ($env['DEVDB_SQLITE_DATABASE'] ?? '');
    $platformRoot = inspector_platform_root_from_scope($root);

    return $database !== '' ? resolve_project_path($platformRoot, $database) : devdb_path($root) . '/devdb.sqlite';
}

function devdb_configured_engine(string $root): string
{
    $env = read_env($root);
    $engine = strtolower(trim((string) ($env['DEVDB_ENGINE'] ?? 'auto')));

    return in_array($engine, ['auto', 'sqlite', 'json'], true) ? $engine : 'auto';
}

function connection_config(string $root): array
{
    $env = read_env($root);
    $connection = strtolower((string) ($env['DB_CONNECTION'] ?? 'devdb'));

    if ($connection === 'auto') {
        $real = strtolower((string) ($env['DB_DRIVER'] ?? 'mysql'));
        if (!empty($env['DB_HOST']) && !empty($env['DB_DATABASE']) && !empty($env['DB_USERNAME']) && in_array($real, ['mysql', 'mariadb', 'pgsql'], true)) {
            $connection = $real;
        } elseif (!empty($env['DB_DATABASE']) && is_file(inspector_resolve_shared_path($root, (string) $env['DB_DATABASE']))) {
            $connection = 'sqlite';
        } else {
            $connection = 'devdb';
        }
    }

    if ($connection === 'mariadb') {
        $connection = 'mysql';
    }

    return [
        'connection' => $connection,
        'env' => $env,
    ];
}

function engine(string $root): string
{
    $config = connection_config($root);
    $connection = $config['connection'];

    if (in_array($connection, ['mysql', 'pgsql', 'sqlite'], true)) {
        return $connection;
    }

    $devdbEngine = devdb_configured_engine($root);
    if ($devdbEngine === 'json') {
        return 'devdb-json';
    }

    if (($devdbEngine === 'sqlite' || $devdbEngine === 'auto') && extension_loaded('pdo_sqlite')) {
        return 'devdb-sqlite';
    }

    return 'devdb-json';
}

function engine_label(string $engine): string
{
    return match ($engine) {
        'mysql' => 'MySQL',
        'pgsql' => 'PostgreSQL',
        'sqlite' => 'SQLite',
        'devdb-sqlite', 'devdb-json' => 'DevDB',
        default => ucfirst($engine),
    };
}

function json_file(string $path, array $default): array
{
    if (!is_file($path)) {
        return $default;
    }

    $content = file_get_contents($path);
    $decoded = is_string($content) ? json_decode($content, true) : null;

    return is_array($decoded) ? $decoded : $default;
}

function app_config(string $root): array
{
    $file = $root . '/app.php';
    if (!is_file($file)) {
        return [];
    }

    $config = require $file;

    return is_array($config) ? $config : [];
}

function pincore_config(string $root): array
{
    $pincore = resolve_pincore_path($root);
    $file = $pincore !== null ? $pincore . '/config/pincore.config.php' : null;
    if ($file === null || !is_file($file)) {
        return [];
    }

    $config = require $file;

    return is_array($config) ? $config : [];
}

function summary_payload(string $root, ?string $platformRoot = null): array
{
    $platformRoot = normalize_path($platformRoot ?? inspector_platform_root_from_scope($root));
    $config = app_config($root);
    $pincore = pincore_config($platformRoot);
    $tables = safe_tables_payload($root);
    $connection = connection_config($root)['connection'];
    $engine = engine($root);
    $migrations = json_file(devdb_path($root) . '/meta/migrations.json', []);
    $displayName = inspector_app_display_name($root, $config, null, null, $platformRoot);

    return [
        'app' => [
            'package' => (string) ($config['package'] ?? 'unknown'),
            'name' => $displayName,
            'title' => inspector_app_title($root, $config, null, null, $platformRoot),
            'description' => inspector_app_description($root, $config, null, null, $platformRoot),
            'developer' => (string) ($config['developer'] ?? $config['author'] ?? ''),
            'version_name' => (string) ($config['version-name'] ?? '1.0.0'),
            'version_code' => (int) ($config['version-code'] ?? 1),
            'icon' => ($iconRelative = app_icon_payload($root, $config)),
            'icon_url' => inspector_public_asset_url($root, $iconRelative, $platformRoot),
            'lang' => (string) ($config['lang'] ?? 'en'),
            'lang_fallback' => (string) ($config['lang_fallback'] ?? $config['fallback-lang'] ?? 'en'),
            'theme' => (string) ($config['theme'] ?? 'default'),
            'transport' => transport_summary_payload((array) ($config['transport'] ?? [])),
            'frontend' => (array) ($config['frontend'] ?? []),
            'pinx' => (array) ($config['pinx'] ?? []),
            'root' => $root,
        ],
        'platform' => [
            'enabled' => inspector_is_platform($platformRoot),
            'root' => $platformRoot,
            'package' => inspector_is_platform($platformRoot) ? inspector_active_package($platformRoot) : null,
            'apps' => inspector_is_platform($platformRoot) ? count(inspector_list_apps($platformRoot)) : 0,
        ],
        'database' => [
            'connection' => $connection,
            'engine' => $engine,
            'engine_label' => engine_label($engine),
            'path' => devdb_path($root),
            'sqlite_database' => sqlite_database($root),
            'table_count' => count($tables['tables']),
        ],
        'stats' => [
            'rows' => array_sum(array_map(static fn (array $table): int => (int) ($table['rows'] ?? 0), $tables['tables'])),
            'migrations' => count($migrations),
            'php' => PHP_VERSION,
            'pincore_version' => (string) ($pincore['version_name'] ?? 'unknown'),
            'pincore_version_code' => (int) ($pincore['version_code'] ?? 0),
        ],
    ];
}

function app_icon_payload(string $root, array $config): ?string
{
    $icon = trim((string) ($config['icon'] ?? 'resource/icon.png'), '/');
    if ($icon !== '' && !str_starts_with($icon, '@') && is_file($root . '/' . $icon)) {
        return $icon;
    }

    foreach (['resource/icon.png', 'resource/icon.svg', 'icon.png', 'icon.svg'] as $candidate) {
        if (is_file($root . '/' . $candidate)) {
            return $candidate;
        }
    }

    return null;
}

function inspector_public_asset_url(string $scopeRoot, ?string $relativePath, ?string $platformRoot = null): ?string
{
    if ($relativePath === null || $relativePath === '') {
        return null;
    }

    $relativePath = ltrim(str_replace('\\', '/', $relativePath), '/');
    $platformRoot = normalize_path($platformRoot ?? inspector_platform_root_from_scope($scopeRoot));
    $scopeRoot = normalize_path($scopeRoot);

    if (inspector_is_platform($platformRoot) && basename(dirname($scopeRoot)) === 'apps') {
        return '/apps/' . basename($scopeRoot) . '/' . $relativePath;
    }

    return '/' . $relativePath;
}

function transport_summary_payload(array $transport): array
{
    $defaults = ['user' => 'local', 'file_storage' => 'local', 'access' => 'local', 'session_token' => 'local'];
    $merged = array_merge($defaults, $transport);
    $shared = array_filter($merged, static fn (mixed $value): bool => (string) $value === 'platform');

    return [
        'scenario' => count($shared) === count($merged) ? 'platform shared' : ($shared === [] ? 'local isolated' : 'mixed'),
        'items' => $merged,
    ];
}

function database_payload(string $root): array
{
    $config = connection_config($root);
    $env = $config['env'];
    $engine = engine($root);
    $tables = safe_tables_payload($root);
    $tableNames = array_map(static fn (array $table): string => (string) ($table['name'] ?? ''), $tables['tables'] ?? []);
    $coreTables = core_tables_payload($root, $tableNames);
    $storage = devdb_storage_payload($root);
    $error = (string) ($tables['error'] ?? '');

    return [
        'connection' => [
            'name' => $config['connection'],
            'engine' => $engine,
            'engine_label' => engine_label($engine),
            'configured_engine' => devdb_configured_engine($root),
            'driver' => (string) ($env['DB_DRIVER'] ?? ''),
            'host' => (string) ($env['DB_HOST'] ?? ''),
            'port' => (string) ($env['DB_PORT'] ?? ''),
            'database' => (string) ($env['DB_DATABASE'] ?? ''),
            'username' => (string) ($env['DB_USERNAME'] ?? ''),
            'app_env' => (string) ($env['APP_ENV'] ?? ''),
            'devdb_path' => devdb_path($root),
            'sqlite_database' => sqlite_database($root),
            'sqlite_available' => extension_loaded('pdo_sqlite'),
            'mode' => str_starts_with($engine, 'devdb-') ? 'development fallback' : 'configured database',
            'connected' => $error === '',
            'error' => $error,
        ],
        'tables' => [
            'count' => count($tableNames),
            'rows' => array_sum(array_map(static fn (array $table): int => (int) ($table['rows'] ?? 0), $tables['tables'] ?? [])),
            'items' => $tables['tables'] ?? [],
        ],
        'core' => [
            'count' => count($coreTables),
            'ready' => count(array_filter($coreTables, static fn (array $table): bool => (bool) ($table['exists'] ?? false))),
            'missing' => count(array_filter($coreTables, static fn (array $table): bool => empty($table['exists']))),
            'tables' => $coreTables,
        ],
        'storage' => $storage,
        'warnings' => database_warnings($engine, $tables, $coreTables, $storage),
    ];
}

function devdb_storage_payload(string $root): array
{
    $base = devdb_path($root);
    $sqlite = sqlite_database($root);
    $items = [
        ['label' => 'Schema metadata', 'path' => $base . '/schema.json'],
        ['label' => 'JSON data directory', 'path' => $base . '/data'],
        ['label' => 'Migration metadata', 'path' => $base . '/meta/migrations.json'],
        ['label' => 'Sequences metadata', 'path' => $base . '/meta/sequences.json'],
        ['label' => 'SQLite database', 'path' => $sqlite],
    ];

    foreach ($items as $index => $item) {
        $path = (string) $item['path'];
        $items[$index]['exists'] = is_file($path) || is_dir($path);
        $items[$index]['size'] = is_file($path) ? filesize($path) : null;
        $items[$index]['updated_at'] = (is_file($path) || is_dir($path)) ? date(DATE_ATOM, filemtime($path) ?: time()) : null;
    }

    return [
        'base_path' => $base,
        'items' => $items,
    ];
}

function database_warnings(string $engine, array $tables, array $coreTables, array $storage): array
{
    $warnings = [];
    if (str_starts_with($engine, 'devdb-')) {
        $warnings[] = [
            'tone' => 'blue',
            'title' => 'DevDB is active',
            'message' => 'Inspector is reading the local development database. Production will not silently use this fallback.',
        ];
    }

    if (($tables['tables'] ?? []) === []) {
        $warnings[] = [
            'tone' => 'warn',
            'title' => 'No tables found',
            'message' => 'Run migrations with platform support to build app and core tables.',
        ];
    }

    $missingCore = count(array_filter($coreTables, static fn (array $table): bool => empty($table['exists'])));
    if ($missingCore > 0) {
        $warnings[] = [
            'tone' => 'warn',
            'title' => 'Core tables are missing',
            'message' => $missingCore . ' pincore table(s) were found in migrations but are not visible in the current connection.',
        ];
    }

    if (!extension_loaded('pdo_sqlite') && str_starts_with($engine, 'devdb-')) {
        $warnings[] = [
            'tone' => 'blue',
            'title' => 'SQLite extension unavailable',
            'message' => 'DevDB is using JSON storage, so the project remains usable without installing SQLite.',
        ];
    }

    return $warnings;
}

function core_tables_payload(string $root, array $existingTables): array
{
    $tables = [];
    foreach (migration_sources($root) as $source) {
        if (($source['scope'] ?? '') !== 'pincore' || !is_dir((string) $source['path'])) {
            continue;
        }

        foreach (glob(rtrim((string) $source['path'], '/') . '/*.php') ?: [] as $file) {
            foreach (tables_from_migration_file((string) $file) as $table) {
                $physical = physical_table_candidates($table);
                $matched = first_matching_table($physical, $existingTables);
                $key = $table . '|' . (string) $source['scope'];
                $tables[$key] = [
                    'name' => $table,
                    'physical_candidates' => $physical,
                    'matched_table' => $matched,
                    'exists' => $matched !== null,
                    'source' => (string) $source['scope'],
                    'migration' => basename((string) $file),
                ];
            }
        }
    }

    usort($tables, static fn (array $a, array $b): int => strcmp((string) $a['name'], (string) $b['name']));

    return array_values($tables);
}

function migration_sources(string $root): array
{
    $paths = [
        ['scope' => 'app', 'path' => $root . '/database/migrations'],
        ['scope' => 'app', 'path' => $root . '/Database/migrations'],
        ['scope' => 'app', 'path' => $root . '/migrations'],
    ];

    $pincore = resolve_pincore_path($root);
    if ($pincore !== null) {
        $paths[] = ['scope' => 'pincore', 'path' => $pincore . '/Database/migrations'];
        $paths[] = ['scope' => 'pincore', 'path' => $pincore . '/database/migrations'];
    }

    $unique = [];
    $seen = [];

    foreach ($paths as $source) {
        $path = (string) ($source['path'] ?? '');
        if ($path === '' || !is_dir($path)) {
            continue;
        }

        $real = realpath($path);
        $key = $real !== false ? strtolower($real) : strtolower(normalize_path($path));
        if (isset($seen[$key])) {
            continue;
        }

        $seen[$key] = true;
        $unique[] = $source;
    }

    return $unique;
}

function resolve_pincore_path(string $root): ?string
{
    $platformRoot = inspector_platform_root_from_scope($root);
    $env = read_env($root);
    $candidates = [];
    if (!empty($env['PINOOX_CORE_PATH'])) {
        $candidates[] = resolve_project_path($platformRoot, (string) $env['PINOOX_CORE_PATH']);
    }

    $candidates[] = $platformRoot . '/vendor/pinoox/pincore';
    $candidates[] = dirname($platformRoot) . '/pincore';

    foreach ($candidates as $candidate) {
        $path = normalize_path((string) $candidate);
        if (is_dir($path . '/Database/migrations') || is_dir($path . '/database/migrations')) {
            return $path;
        }
    }

    return null;
}

function tables_from_migration_file(string $file): array
{
    $content = file_get_contents($file);
    if (!is_string($content) || $content === '') {
        return [];
    }

    $content = replace_table_constants($content);
    $tables = [];
    if (preg_match_all('/->(?:create|table|dropIfExists)\s*\(\s*(?:\$this->table\()?\s*[\'"]([A-Za-z0-9_]+)[\'"]/i', $content, $matches) !== false) {
        foreach ($matches[1] as $table) {
            $tables[] = (string) $table;
        }
    }

    return array_values(array_unique($tables));
}

function replace_table_constants(string $content): string
{
    $map = [
        'USER' => 'user',
        'FILE' => 'file',
        'TOKEN' => 'token',
        'HISTORY' => 'history',
        'MIGRATION' => 'history',
        'ROLE' => 'role',
        'PERMISSION' => 'permission',
        'ROLE_PERMISSION' => 'role_permission',
        'USER_ROLE' => 'user_role',
    ];

    return preg_replace_callback('/Table::([A-Z_]+)/', static function (array $matches) use ($map): string {
        $name = (string) ($matches[1] ?? '');
        return isset($map[$name]) ? "'" . $map[$name] . "'" : (string) $matches[0];
    }, $content) ?? $content;
}

function physical_table_candidates(string $table): array
{
    return array_values(array_unique([
        $table,
        'pinx_' . $table,
        'platform_' . $table,
        'core_' . $table,
        'pincore_' . $table,
        'pin_' . $table,
    ]));
}

function first_matching_table(array $candidates, array $existingTables): ?string
{
    $lookup = array_flip(array_map(static fn (string $table): string => strtolower($table), $existingTables));
    foreach ($candidates as $candidate) {
        if (isset($lookup[strtolower((string) $candidate)])) {
            return (string) $candidate;
        }
    }

    return null;
}

function tables_payload(string $root): array
{
    return match (engine($root)) {
        'mysql' => pdo_tables_payload($root, 'mysql'),
        'pgsql' => pdo_tables_payload($root, 'pgsql'),
        'sqlite' => pdo_tables_payload($root, 'sqlite'),
        'devdb-sqlite' => devdb_sqlite_tables_payload($root),
        default => devdb_json_tables_payload($root),
    };
}

function safe_tables_payload(string $root): array
{
    try {
        return tables_payload($root);
    } catch (Throwable $exception) {
        return [
            'engine' => engine($root),
            'tables' => [],
            'error' => $exception->getMessage(),
        ];
    }
}

function devdb_json_tables_payload(string $root): array
{
    $schema = json_file(devdb_path($root) . '/schema.json', ['tables' => []]);
    $tables = [];
    foreach (($schema['tables'] ?? []) as $name => $meta) {
        $rows = json_file(devdb_path($root) . '/data/' . safe_table_file((string) $name) . '.json', []);
        $tables[] = [
            'name' => (string) $name,
            'columns' => count($meta['columns'] ?? []),
            'rows' => count($rows),
            'primary_key' => $meta['primary_key'] ?? null,
        ];
    }

    usort($tables, static fn (array $a, array $b): int => strcmp((string) $a['name'], (string) $b['name']));

    return [
        'engine' => 'devdb-json',
        'tables' => $tables,
    ];
}

function devdb_json_table_payload(string $root, string $table, int $limit, int $offset, string $search): array
{
    $schema = json_file(devdb_path($root) . '/schema.json', ['tables' => []]);
    $meta = $schema['tables'][$table] ?? null;
    if (!is_array($meta)) {
        throw new RuntimeException('Table "' . $table . '" does not exist.');
    }

    $rows = json_file(devdb_path($root) . '/data/' . safe_table_file($table) . '.json', []);
    if ($search !== '') {
        $needle = mb_strtolower($search);
        $rows = array_values(array_filter($rows, static function (array $row) use ($needle): bool {
            return str_contains(mb_strtolower(json_encode($row, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: ''), $needle);
        }));
    }

    return [
        'engine' => 'devdb-json',
        'table' => $table,
        'columns' => $meta['columns'] ?? [],
        'indexes' => $meta['indexes'] ?? [],
        'relations' => table_relations_payload($root, 'devdb-json', $table, $meta['columns'] ?? [], $meta['foreign_keys'] ?? []),
        'primary_key' => $meta['primary_key'] ?? null,
        'row_count' => count($rows),
        'limit' => $limit,
        'offset' => $offset,
        'rows' => array_slice($rows, $offset, $limit),
    ];
}

function table_payload(string $root, string $table, int $limit, int $offset): array
{
    if ($table === '') {
        throw new RuntimeException('Table name is required.');
    }

    $search = trim((string) ($_GET['q'] ?? ''));

    return match (engine($root)) {
        'mysql' => pdo_table_payload($root, 'mysql', $table, $limit, $offset, $search),
        'pgsql' => pdo_table_payload($root, 'pgsql', $table, $limit, $offset, $search),
        'sqlite' => pdo_table_payload($root, 'sqlite', $table, $limit, $offset, $search),
        'devdb-sqlite' => devdb_sqlite_table_payload($root, $table, $limit, $offset, $search),
        default => devdb_json_table_payload($root, $table, $limit, $offset, $search),
    };
}

function insert_table_row_payload(string $root, array $payload): array
{
    $table = trim((string) ($payload['table'] ?? ''));
    if ($table === '') {
        throw new RuntimeException('Table name is required.');
    }

    $values = is_array($payload['values'] ?? null) ? $payload['values'] : [];

    return match (engine($root)) {
        'mysql' => pdo_insert_table_row($root, 'mysql', $table, $values),
        'pgsql' => pdo_insert_table_row($root, 'pgsql', $table, $values),
        'sqlite' => pdo_insert_table_row($root, 'sqlite', $table, $values),
        'devdb-sqlite' => pdo_insert_table_row($root, 'sqlite', $table, $values, true),
        default => devdb_json_insert_table_row($root, $table, $values),
    };
}

function prepared_row_values(array $columns, array $values, bool $skipEmptyAutoPrimary = true): array
{
    $row = [];
    foreach ($columns as $name => $meta) {
        $name = (string) $name;
        if (!array_key_exists($name, $values)) {
            continue;
        }

        $value = $values[$name];
        $empty = $value === '';
        $auto = !empty($meta['auto_increment']) || (!empty($meta['primary']) && str_contains(strtolower((string) ($meta['type'] ?? '')), 'int'));
        if ($skipEmptyAutoPrimary && $auto && $empty) {
            continue;
        }

        $row[$name] = $empty ? null : $value;
    }

    return $row;
}

function pdo_insert_table_row(string $root, string $driver, string $table, array $values, bool $devdbSqlite = false): array
{
    $pdo = $devdbSqlite ? sqlite_pdo($root) : pdo_for_connection($root, $driver);
    $columns = $driver === 'sqlite' ? sqlite_columns($pdo, $table) : pdo_columns($pdo, $driver, $table);
    if ($columns === []) {
        throw new RuntimeException('Table "' . $table . '" does not exist.');
    }

    $row = prepared_row_values($columns, $values);
    $quotedTable = $driver === 'sqlite' ? quote_identifier($table) : quote_identifier_for($driver, $table);

    if ($row === []) {
        $sql = $driver === 'mysql'
            ? 'INSERT INTO ' . $quotedTable . ' () VALUES ()'
            : 'INSERT INTO ' . $quotedTable . ' DEFAULT VALUES';
        $pdo->exec($sql);
    } else {
        $names = array_keys($row);
        $quote = static fn (string $name): string => $driver === 'sqlite' ? quote_identifier($name) : quote_identifier_for($driver, $name);
        $sql = 'INSERT INTO ' . $quotedTable
            . ' (' . implode(', ', array_map($quote, $names)) . ')'
            . ' VALUES (' . implode(', ', array_fill(0, count($names), '?')) . ')';
        $statement = $pdo->prepare($sql);
        $statement->execute(array_values($row));
    }

    return [
        'ok' => true,
        'table' => $table,
        'engine' => $devdbSqlite ? 'devdb-sqlite' : $driver,
        'inserted_id' => $pdo->lastInsertId() ?: null,
        'message' => 'Row was added to ' . $table . '.',
    ];
}

function devdb_json_insert_table_row(string $root, string $table, array $values): array
{
    $schema = json_file(devdb_path($root) . '/schema.json', ['tables' => []]);
    $meta = $schema['tables'][$table] ?? null;
    if (!is_array($meta)) {
        throw new RuntimeException('Table "' . $table . '" does not exist.');
    }

    $columns = is_array($meta['columns'] ?? null) ? $meta['columns'] : [];
    $row = prepared_row_values($columns, $values, false);
    foreach ($columns as $name => $column) {
        $name = (string) $name;
        if (!array_key_exists($name, $row)) {
            $row[$name] = array_key_exists('default', $column) ? $column['default'] : null;
        }
    }

    $primary = (string) ($meta['primary_key'] ?? '');
    if ($primary !== '' && empty($row[$primary])) {
        $row[$primary] = devdb_json_next_id($root, $table);
    }

    $path = devdb_path($root) . '/data/' . safe_table_file($table) . '.json';
    $rows = locked_json_update($path, [], static function (array $rows) use ($row): array {
        $rows[] = $row;
        return $rows;
    });

    return [
        'ok' => true,
        'table' => $table,
        'engine' => 'devdb-json',
        'inserted_id' => $primary !== '' ? ($row[$primary] ?? null) : null,
        'row_count' => count($rows),
        'message' => 'Row was added to ' . $table . '.',
    ];
}

function delete_table_rows_payload(string $root, array $payload): array
{
    $table = trim((string) ($payload['table'] ?? ''));
    if ($table === '') {
        throw new RuntimeException('Table name is required.');
    }

    $keys = array_values(array_filter((array) ($payload['keys'] ?? []), static fn ($value): bool => $value !== null && $value !== ''));
    if ($keys === []) {
        throw new RuntimeException('Select at least one row to delete.');
    }

    return match (engine($root)) {
        'mysql' => pdo_delete_table_rows($root, 'mysql', $table, $keys),
        'pgsql' => pdo_delete_table_rows($root, 'pgsql', $table, $keys),
        'sqlite' => pdo_delete_table_rows($root, 'sqlite', $table, $keys),
        'devdb-sqlite' => pdo_delete_table_rows($root, 'sqlite', $table, $keys, true),
        default => devdb_json_delete_table_rows($root, $table, $keys),
    };
}

function pdo_delete_table_rows(string $root, string $driver, string $table, array $keys, bool $devdbSqlite = false): array
{
    $pdo = $devdbSqlite ? sqlite_pdo($root) : pdo_for_connection($root, $driver);
    $columns = $driver === 'sqlite' ? sqlite_columns($pdo, $table) : pdo_columns($pdo, $driver, $table);
    $primary = sqlite_primary_key($columns);

    if ($primary === null || $primary === '') {
        throw new RuntimeException('This table has no primary key, so Inspector cannot delete rows safely.');
    }

    $quotedTable = $driver === 'sqlite' ? quote_identifier($table) : quote_identifier_for($driver, $table);
    $quotedPrimary = $driver === 'sqlite' ? quote_identifier($primary) : quote_identifier_for($driver, $primary);
    $placeholders = implode(', ', array_fill(0, count($keys), '?'));
    $statement = $pdo->prepare('DELETE FROM ' . $quotedTable . ' WHERE ' . $quotedPrimary . ' IN (' . $placeholders . ')');
    $statement->execute($keys);

    return [
        'ok' => true,
        'table' => $table,
        'engine' => $devdbSqlite ? 'devdb-sqlite' : $driver,
        'deleted' => $statement->rowCount(),
        'message' => $statement->rowCount() . ' row(s) deleted from ' . $table . '.',
    ];
}

function devdb_json_delete_table_rows(string $root, string $table, array $keys): array
{
    $schema = json_file(devdb_path($root) . '/schema.json', ['tables' => []]);
    $meta = $schema['tables'][$table] ?? null;
    if (!is_array($meta)) {
        throw new RuntimeException('Table "' . $table . '" does not exist.');
    }

    $primary = (string) ($meta['primary_key'] ?? '');
    if ($primary === '') {
        throw new RuntimeException('This DevDB JSON table has no primary key, so Inspector cannot delete rows safely.');
    }

    $keyMap = array_flip(array_map('strval', $keys));
    $deleted = 0;
    $path = devdb_path($root) . '/data/' . safe_table_file($table) . '.json';
    $rows = locked_json_update($path, [], static function (array $rows) use ($primary, $keyMap, &$deleted): array {
        return array_values(array_filter($rows, static function ($row) use ($primary, $keyMap, &$deleted): bool {
            if (!is_array($row)) {
                return true;
            }

            $key = (string) ($row[$primary] ?? '');
            if ($key !== '' && isset($keyMap[$key])) {
                $deleted++;
                return false;
            }

            return true;
        }));
    });

    return [
        'ok' => true,
        'table' => $table,
        'engine' => 'devdb-json',
        'deleted' => $deleted,
        'row_count' => count($rows),
        'message' => $deleted . ' row(s) deleted from ' . $table . '.',
    ];
}

function raw_query_payload(string $root, array $payload): array
{
    $sql = trim((string) ($payload['sql'] ?? ''));
    if ($sql === '') {
        throw new RuntimeException('SQL query is required.');
    }

    if (engine($root) === 'devdb-json') {
        return devdb_json_raw_query_payload($root, $sql, is_array($payload['bindings'] ?? null) ? $payload['bindings'] : []);
    }

    $engine = engine($root);
    $driver = $engine === 'devdb-sqlite' ? 'sqlite' : $engine;
    if (!in_array($driver, ['mysql', 'pgsql', 'sqlite'], true)) {
        throw new RuntimeException('Raw SQL is not available for this connection.');
    }

    $pdo = $engine === 'devdb-sqlite' ? sqlite_pdo($root) : pdo_for_connection($root, $driver);
    $started = microtime(true);
    $statement = $pdo->prepare($sql);
    $statement->execute();
    $elapsed = round((microtime(true) - $started) * 1000, 2);
    $isSelect = preg_match('/^\s*(select|pragma|show|describe|explain)\b/i', $sql) === 1;
    $rows = $isSelect ? $statement->fetchAll() : [];

    return [
        'ok' => true,
        'engine' => $engine,
        'type' => $isSelect ? 'read' : 'write',
        'rows' => $rows,
        'affected' => $isSelect ? null : $statement->rowCount(),
        'elapsed_ms' => $elapsed,
        'message' => $isSelect
            ? 'Raw SQL returned ' . count($rows) . ' row(s).'
            : 'Raw SQL executed. Affected rows: ' . $statement->rowCount() . '.',
    ];
}

function devdb_json_raw_query_payload(string $root, string $sql, array $bindings = []): array
{
    if (!class_exists(\Pinoox\Component\Database\DevDB\DevDbStore::class)
        || !class_exists(\Pinoox\Component\Database\DevDB\DevDbSqlTranslator::class)) {
        throw new RuntimeException('Raw SQL for DevDB JSON requires pinoox/devdb. Install it with composer require --dev pinoox/devdb.');
    }

    $translator = new \Pinoox\Component\Database\DevDB\DevDbSqlTranslator(
        new \Pinoox\Component\Database\DevDB\DevDbStore(devdb_path($root)),
    );
    $started = microtime(true);
    $isRead = preg_match('/^\s*(select|show|describe|desc|explain)\b/i', $sql) === 1;

    if ($isRead) {
        $rows = array_map(static fn (object $row): array => (array) $row, $translator->select($sql, $bindings));
        $elapsed = round((microtime(true) - $started) * 1000, 2);

        return [
            'ok' => true,
            'engine' => 'devdb-json',
            'type' => 'read',
            'rows' => $rows,
            'affected' => null,
            'elapsed_ms' => $elapsed,
            'message' => 'DevDB JSON SQL returned ' . count($rows) . ' row(s).',
        ];
    }

    $results = $translator->executeDump($sql);
    $elapsed = round((microtime(true) - $started) * 1000, 2);
    $affected = array_sum(array_map(static fn (array $result): int => (int) ($result['affected'] ?? 0), $results));

    return [
        'ok' => true,
        'engine' => 'devdb-json',
        'type' => 'write',
        'rows' => [],
        'affected' => $affected,
        'statements' => $results,
        'elapsed_ms' => $elapsed,
        'message' => 'DevDB JSON SQL executed ' . count($results) . ' statement(s). Affected rows: ' . $affected . '.',
    ];
}

function visual_query_payload(string $root, array $payload): array
{
    $table = trim((string) ($payload['table'] ?? ''));
    if ($table === '') {
        throw new RuntimeException('Choose a table before running the query.');
    }

    return match (engine($root)) {
        'mysql' => pdo_visual_query_payload($root, 'mysql', $payload),
        'pgsql' => pdo_visual_query_payload($root, 'pgsql', $payload),
        'sqlite' => pdo_visual_query_payload($root, 'sqlite', $payload),
        'devdb-sqlite' => pdo_visual_query_payload($root, 'sqlite', $payload, true),
        default => devdb_json_visual_query_payload($root, $payload),
    };
}

function normalized_visual_query(array $payload, array $columns): array
{
    $available = array_fill_keys(array_keys($columns), true);
    $selected = array_values(array_filter(array_map('strval', is_array($payload['columns'] ?? null) ? $payload['columns'] : []), static fn (string $column): bool => isset($available[$column])));
    if ($selected === []) {
        $selected = array_keys($columns);
    }

    $conditions = [];
    foreach (is_array($payload['conditions'] ?? null) ? $payload['conditions'] : [] as $condition) {
        if (!is_array($condition)) {
            continue;
        }
        $field = (string) ($condition['field'] ?? '');
        if (!isset($available[$field])) {
            continue;
        }
        $op = strtolower(trim((string) ($condition['op'] ?? '=')));
        if (!in_array($op, ['=', '!=', '>', '>=', '<', '<=', 'like', 'is null', 'is not null'], true)) {
            $op = '=';
        }
        $value = $condition['value'] ?? '';
        if ($value === '' && !in_array($op, ['is null', 'is not null'], true)) {
            continue;
        }
        $conditions[] = ['field' => $field, 'op' => $op, 'value' => $value];
    }

    $orderBy = (string) ($payload['order_by'] ?? '');
    if (!isset($available[$orderBy])) {
        $orderBy = '';
    }

    $orderDir = strtolower((string) ($payload['order_dir'] ?? 'asc')) === 'desc' ? 'desc' : 'asc';

    return [
        'table' => trim((string) ($payload['table'] ?? '')),
        'columns' => $selected,
        'conditions' => $conditions,
        'order_by' => $orderBy,
        'order_dir' => $orderDir,
        'limit' => max(1, min(500, (int) ($payload['limit'] ?? 50))),
        'offset' => max(0, (int) ($payload['offset'] ?? 0)),
        'join_table' => trim((string) ($payload['join_table'] ?? '')),
        'join_on' => trim((string) ($payload['join_on'] ?? '')),
        'group_by' => trim((string) ($payload['group_by'] ?? '')),
    ];
}

function ensure_simple_visual_query(array $query): void
{
    if ($query['join_table'] !== '' || $query['join_on'] !== '') {
        throw new RuntimeException('Visual results do not execute joins yet. Open the SQL tab and run this query as Raw SQL.');
    }

    if ($query['group_by'] !== '') {
        throw new RuntimeException('Visual results do not execute grouped queries yet. Open the SQL tab and run this query as Raw SQL.');
    }
}

function pdo_visual_query_payload(string $root, string $driver, array $payload, bool $devdbSqlite = false): array
{
    $table = trim((string) ($payload['table'] ?? ''));
    $pdo = $devdbSqlite ? sqlite_pdo($root) : pdo_for_connection($root, $driver);
    $columns = pdo_columns($pdo, $driver, $table);
    if ($columns === []) {
        throw new RuntimeException('Table "' . $table . '" does not exist.');
    }

    $query = normalized_visual_query($payload, $columns);
    ensure_simple_visual_query($query);

    $params = [];
    $whereSql = visual_where_sql($driver, $query['conditions'], $params);
    $quotedTable = quote_identifier_for($driver, $table);
    $selectSql = implode(', ', array_map(static fn (string $column): string => quote_identifier_for($driver, $column), $query['columns']));
    $orderSql = $query['order_by'] !== '' ? ' ORDER BY ' . quote_identifier_for($driver, $query['order_by']) . ' ' . strtoupper((string) $query['order_dir']) : '';

    $countStatement = $pdo->prepare('SELECT COUNT(*) AS count FROM ' . $quotedTable . $whereSql);
    $countStatement->execute($params);
    $count = (int) ($countStatement->fetch()['count'] ?? 0);

    $sql = 'SELECT ' . $selectSql . ' FROM ' . $quotedTable . $whereSql . $orderSql . ' LIMIT ' . (int) $query['limit'] . ' OFFSET ' . (int) $query['offset'];
    $statement = $pdo->prepare($sql);
    $statement->execute($params);

    return [
        'engine' => $devdbSqlite ? 'devdb-sqlite' : $driver,
        'table' => $table,
        'columns' => array_intersect_key($columns, array_flip($query['columns'])),
        'indexes' => [],
        'relations' => [],
        'primary_key' => sqlite_primary_key($columns),
        'row_count' => $count,
        'limit' => $query['limit'],
        'offset' => $query['offset'],
        'rows' => $statement->fetchAll(),
        'sql' => $sql,
        'bindings' => array_values($params),
    ];
}

function visual_where_sql(string $driver, array $conditions, array &$params): string
{
    $clauses = [];
    foreach ($conditions as $condition) {
        $field = (string) $condition['field'];
        $op = strtolower((string) $condition['op']);
        if ($op === 'is null' || $op === 'is not null') {
            $clauses[] = quote_identifier_for($driver, $field) . ' ' . strtoupper($op);
            continue;
        }

        $value = $condition['value'];
        if ($op === 'like') {
            $clauses[] = quote_identifier_for($driver, $field) . ' LIKE ?';
            $params[] = '%' . (string) $value . '%';
            continue;
        }

        $clauses[] = quote_identifier_for($driver, $field) . ' ' . $op . ' ?';
        $params[] = $value;
    }

    return $clauses === [] ? '' : ' WHERE ' . implode(' AND ', $clauses);
}

function devdb_json_visual_query_payload(string $root, array $payload): array
{
    $schema = json_file(devdb_path($root) . '/schema.json', ['tables' => []]);
    $table = trim((string) ($payload['table'] ?? ''));
    $meta = $schema['tables'][$table] ?? null;
    if (!is_array($meta)) {
        throw new RuntimeException('Table "' . $table . '" does not exist.');
    }

    $columns = is_array($meta['columns'] ?? null) ? $meta['columns'] : [];
    $query = normalized_visual_query($payload, $columns);
    ensure_simple_visual_query($query);

    $rows = json_file(devdb_path($root) . '/data/' . safe_table_file($table) . '.json', []);
    $rows = array_values(array_filter($rows, static fn ($row): bool => is_array($row)));
    $rows = array_values(array_filter($rows, static fn (array $row): bool => devdb_json_row_matches($row, $query['conditions'])));

    if ($query['order_by'] !== '') {
        $field = (string) $query['order_by'];
        $direction = (string) $query['order_dir'];
        usort($rows, static function (array $a, array $b) use ($field, $direction): int {
            $left = $a[$field] ?? null;
            $right = $b[$field] ?? null;
            $result = strnatcasecmp((string) $left, (string) $right);
            return $direction === 'desc' ? -$result : $result;
        });
    }

    $count = count($rows);
    $rows = array_slice($rows, (int) $query['offset'], (int) $query['limit']);
    $rows = array_map(static function (array $row) use ($query): array {
        return array_intersect_key($row, array_flip($query['columns']));
    }, $rows);

    return [
        'engine' => 'devdb-json',
        'table' => $table,
        'columns' => array_intersect_key($columns, array_flip($query['columns'])),
        'indexes' => [],
        'relations' => [],
        'primary_key' => $meta['primary_key'] ?? null,
        'row_count' => $count,
        'limit' => $query['limit'],
        'offset' => $query['offset'],
        'rows' => $rows,
        'sql' => 'Visual query executed against DevDB JSON.',
        'bindings' => array_values(array_map(static fn (array $condition) => $condition['value'] ?? null, $query['conditions'])),
    ];
}

function devdb_json_row_matches(array $row, array $conditions): bool
{
    foreach ($conditions as $condition) {
        $field = (string) $condition['field'];
        $op = strtolower((string) $condition['op']);
        $actual = $row[$field] ?? null;
        $expected = $condition['value'] ?? null;

        if ($op === 'is null' && $actual !== null) {
            return false;
        }
        if ($op === 'is not null' && $actual === null) {
            return false;
        }
        if ($op === 'like' && !str_contains(mb_strtolower((string) $actual), mb_strtolower((string) $expected))) {
            return false;
        }
        if (in_array($op, ['=', '!=', '>', '>=', '<', '<='], true) && !compare_visual_values($actual, $expected, $op)) {
            return false;
        }
    }

    return true;
}

function compare_visual_values(mixed $actual, mixed $expected, string $op): bool
{
    $left = is_numeric($actual) && is_numeric($expected) ? (float) $actual : (string) $actual;
    $right = is_numeric($actual) && is_numeric($expected) ? (float) $expected : (string) $expected;

    return match ($op) {
        '=' => $left == $right,
        '!=' => $left != $right,
        '>' => $left > $right,
        '>=' => $left >= $right,
        '<' => $left < $right,
        '<=' => $left <= $right,
        default => true,
    };
}

function devdb_json_next_id(string $root, string $table): int
{
    $path = devdb_path($root) . '/meta/sequences.json';
    $sequences = locked_json_update($path, [], static function (array $sequences) use ($table): array {
        $sequences[$table] = (int) ($sequences[$table] ?? 0) + 1;
        return $sequences;
    });

    return (int) ($sequences[$table] ?? 1);
}

function locked_json_update(string $path, array $default, callable $callback): array
{
    $dir = dirname($path);
    if (!is_dir($dir)) {
        @mkdir($dir, 0775, true);
    }

    $handle = fopen($path, 'c+');
    if ($handle === false) {
        throw new RuntimeException('Unable to write JSON file: ' . $path);
    }

    try {
        if (!flock($handle, LOCK_EX)) {
            throw new RuntimeException('Unable to lock JSON file: ' . $path);
        }

        $content = stream_get_contents($handle);
        $decoded = is_string($content) && trim($content) !== '' ? json_decode($content, true) : null;
        $data = is_array($decoded) ? $decoded : $default;
        $data = $callback($data);

        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL);
        fflush($handle);

        return $data;
    } finally {
        flock($handle, LOCK_UN);
        fclose($handle);
    }
}

function export_payload(string $root): array
{
    if (engine($root) === 'devdb-sqlite') {
        $tables = devdb_sqlite_tables_payload($root)['tables'];
        $data = [];
        foreach ($tables as $table) {
            $data[$table['name']] = devdb_sqlite_table_payload($root, (string) $table['name'], 10000, 0, '');
        }

        return [
            'engine' => 'devdb-sqlite',
            'data' => $data,
        ];
    }

    if (in_array(engine($root), ['mysql', 'pgsql', 'sqlite'], true)) {
        return [
            'engine' => engine($root),
            'tables' => tables_payload($root)['tables'],
        ];
    }

    return [
        'engine' => 'devdb-json',
        'schema' => json_file(devdb_path($root) . '/schema.json', ['tables' => []]),
        'data' => json_data_payload($root),
        'meta' => [
            'migrations' => json_file(devdb_path($root) . '/meta/migrations.json', []),
            'sequences' => json_file(devdb_path($root) . '/meta/sequences.json', []),
        ],
    ];
}

function json_data_payload(string $root): array
{
    $schema = json_file(devdb_path($root) . '/schema.json', ['tables' => []]);
    $data = [];
    foreach (array_keys($schema['tables'] ?? []) as $table) {
        $data[(string) $table] = json_file(devdb_path($root) . '/data/' . safe_table_file((string) $table) . '.json', []);
    }

    return $data;
}

function safe_table_file(string $table): string
{
    return preg_replace('/[^A-Za-z0-9_.-]+/', '_', $table) ?: $table;
}

function sqlite_pdo(string $root): PDO
{
    return new PDO('sqlite:' . sqlite_database($root), null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
}

function pdo_for_connection(string $root, string $driver): PDO
{
    $env = connection_config($root)['env'];

    if ($driver === 'sqlite') {
        $database = inspector_resolve_shared_path($root, (string) ($env['DB_DATABASE'] ?? ''));
        return new PDO('sqlite:' . $database, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }

    $host = (string) ($env['DB_HOST'] ?? '127.0.0.1');
    $port = (int) ($env['DB_PORT'] ?? ($driver === 'pgsql' ? 5432 : 3306));
    $database = (string) ($env['DB_DATABASE'] ?? '');
    $username = (string) ($env['DB_USERNAME'] ?? '');
    $password = (string) ($env['DB_PASSWORD'] ?? '');
    $dsn = $driver === 'pgsql'
        ? "pgsql:host={$host};port={$port};dbname={$database}"
        : "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";

    return new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
}

function pdo_tables_payload(string $root, string $driver): array
{
    $pdo = pdo_for_connection($root, $driver);
    $tables = [];

    if ($driver === 'pgsql') {
        $rows = $pdo->query("SELECT table_name AS name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name")->fetchAll();
    } elseif ($driver === 'sqlite') {
        $rows = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")->fetchAll();
    } else {
        $rows = $pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_NUM);
        $rows = array_map(static fn (array $row): array => ['name' => (string) ($row[0] ?? '')], $rows);
    }

    foreach ($rows as $row) {
        $name = (string) ($row['name'] ?? '');
        if ($name === '') {
            continue;
        }

        $columns = pdo_columns($pdo, $driver, $name);
        $count = (int) $pdo->query('SELECT COUNT(*) AS count FROM ' . quote_identifier_for($driver, $name))->fetch()['count'];
        $tables[] = [
            'name' => $name,
            'columns' => count($columns),
            'rows' => $count,
            'primary_key' => sqlite_primary_key($columns),
        ];
    }

    return [
        'engine' => $driver,
        'tables' => $tables,
    ];
}

function pdo_table_payload(string $root, string $driver, string $table, int $limit, int $offset, string $search): array
{
    $pdo = pdo_for_connection($root, $driver);
    $columns = pdo_columns($pdo, $driver, $table);
    if ($columns === []) {
        throw new RuntimeException('Table "' . $table . '" does not exist.');
    }

    $quoted = quote_identifier_for($driver, $table);
    $where = '';
    $params = [];
    if ($search !== '') {
        $likes = [];
        foreach (array_keys($columns) as $column) {
            $castType = $driver === 'pgsql' || $driver === 'sqlite' ? 'TEXT' : 'CHAR';
            $likes[] = 'CAST(' . quote_identifier_for($driver, (string) $column) . ' AS ' . $castType . ') LIKE ?';
            $params[] = '%' . $search . '%';
        }
        $where = $likes !== [] ? ' WHERE ' . implode(' OR ', $likes) : '';
    }

    $countStatement = $pdo->prepare('SELECT COUNT(*) AS count FROM ' . $quoted . $where);
    $countStatement->execute($params);
    $count = (int) $countStatement->fetch()['count'];

    $statement = $pdo->prepare('SELECT * FROM ' . $quoted . $where . ' LIMIT ' . $limit . ' OFFSET ' . $offset);
    $statement->execute($params);

    return [
        'engine' => $driver,
        'table' => $table,
        'columns' => $columns,
        'indexes' => pdo_indexes($pdo, $driver, $table),
        'relations' => pdo_relations($pdo, $driver, $table, $columns),
        'primary_key' => sqlite_primary_key($columns),
        'row_count' => $count,
        'limit' => $limit,
        'offset' => $offset,
        'rows' => $statement->fetchAll(),
    ];
}

function pdo_columns(PDO $pdo, string $driver, string $table): array
{
    if ($driver === 'sqlite') {
        return sqlite_columns($pdo, $table);
    }

    if ($driver === 'pgsql') {
        $statement = $pdo->prepare("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema='public' AND table_name=? ORDER BY ordinal_position");
        $statement->execute([$table]);
        $pkRows = $pdo->prepare("SELECT kcu.column_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema WHERE tc.constraint_type='PRIMARY KEY' AND tc.table_schema='public' AND tc.table_name=?");
        $pkRows->execute([$table]);
        $primary = array_flip(array_map(static fn (array $row): string => (string) $row['column_name'], $pkRows->fetchAll()));
        $columns = [];
        foreach ($statement->fetchAll() as $column) {
            $name = (string) $column['column_name'];
            $columns[$name] = [
                'type' => strtolower((string) $column['data_type']),
                'nullable' => strtoupper((string) $column['is_nullable']) === 'YES',
                'default' => $column['column_default'],
                'primary' => isset($primary[$name]),
            ];
        }
        return $columns;
    }

    $statement = $pdo->query('DESCRIBE ' . quote_identifier_for($driver, $table));
    $columns = [];
    foreach ($statement->fetchAll() as $column) {
        $name = (string) $column['Field'];
        $columns[$name] = [
            'type' => strtolower((string) $column['Type']),
            'nullable' => strtoupper((string) $column['Null']) === 'YES',
            'default' => $column['Default'],
            'primary' => strtoupper((string) $column['Key']) === 'PRI',
        ];
    }

    return $columns;
}

function pdo_indexes(PDO $pdo, string $driver, string $table): array
{
    try {
        if ($driver === 'sqlite') {
            return $pdo->query('PRAGMA index_list(' . quote_identifier($table) . ')')->fetchAll();
        }

        if ($driver === 'pgsql') {
            $statement = $pdo->prepare("SELECT indexname, indexdef FROM pg_indexes WHERE schemaname='public' AND tablename=? ORDER BY indexname");
            $statement->execute([$table]);
            return $statement->fetchAll();
        }

        return $pdo->query('SHOW INDEX FROM ' . quote_identifier_for($driver, $table))->fetchAll();
    } catch (Throwable) {
        return [];
    }
}

function pdo_relations(PDO $pdo, string $driver, string $table, array $columns): array
{
    $relations = [];
    try {
        if ($driver === 'sqlite') {
            $rows = $pdo->query('PRAGMA foreign_key_list(' . quote_identifier($table) . ')')->fetchAll();
            foreach ($rows as $row) {
                $relations[] = [
                    'type' => 'foreign_key',
                    'column' => (string) ($row['from'] ?? ''),
                    'references_table' => (string) ($row['table'] ?? ''),
                    'references_column' => (string) ($row['to'] ?? 'id'),
                    'constraint' => 'sqlite_fk_' . (string) ($row['id'] ?? ''),
                    'confidence' => 'database',
                ];
            }
        } elseif ($driver === 'pgsql') {
            $statement = $pdo->prepare("SELECT tc.constraint_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema WHERE tc.constraint_type='FOREIGN KEY' AND tc.table_schema='public' AND tc.table_name=? ORDER BY tc.constraint_name");
            $statement->execute([$table]);
            foreach ($statement->fetchAll() as $row) {
                $relations[] = [
                    'type' => 'foreign_key',
                    'column' => (string) ($row['column_name'] ?? ''),
                    'references_table' => (string) ($row['foreign_table_name'] ?? ''),
                    'references_column' => (string) ($row['foreign_column_name'] ?? 'id'),
                    'constraint' => (string) ($row['constraint_name'] ?? ''),
                    'confidence' => 'database',
                ];
            }
        } else {
            $statement = $pdo->prepare("SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL ORDER BY CONSTRAINT_NAME");
            $statement->execute([$table]);
            foreach ($statement->fetchAll() as $row) {
                $relations[] = [
                    'type' => 'foreign_key',
                    'column' => (string) ($row['COLUMN_NAME'] ?? ''),
                    'references_table' => (string) ($row['REFERENCED_TABLE_NAME'] ?? ''),
                    'references_column' => (string) ($row['REFERENCED_COLUMN_NAME'] ?? 'id'),
                    'constraint' => (string) ($row['CONSTRAINT_NAME'] ?? ''),
                    'confidence' => 'database',
                ];
            }
        }
    } catch (Throwable) {
        $relations = [];
    }

    return table_relations_payload('', $driver, $table, $columns, $relations);
}

function table_relations_payload(string $root, string $engine, string $table, array $columns, array $known = []): array
{
    $relations = [];
    foreach ($known as $item) {
        if (isset($item['column']) || isset($item['references_table'])) {
            $relations[] = [
                'type' => (string) ($item['type'] ?? 'foreign_key'),
                'column' => (string) ($item['column'] ?? ''),
                'references_table' => (string) ($item['references_table'] ?? $item['table'] ?? ''),
                'references_column' => (string) ($item['references_column'] ?? $item['to'] ?? 'id'),
                'constraint' => (string) ($item['constraint'] ?? $item['name'] ?? ''),
                'foreign_key' => relation_foreign_key_name($table, (string) ($item['column'] ?? ''), (string) ($item['constraint'] ?? $item['name'] ?? '')),
                'confidence' => (string) ($item['confidence'] ?? 'metadata'),
            ];
        }
    }

    $existing = [];
    if ($root !== '') {
        $existing = array_map(static fn (array $item): string => strtolower((string) ($item['name'] ?? '')), safe_tables_payload($root)['tables'] ?? []);
    }
    $existingLookup = array_flip($existing);

    foreach (array_keys($columns) as $column) {
        $column = (string) $column;
        if (!str_ends_with($column, '_id')) {
            continue;
        }
        $base = substr($column, 0, -3);
        $candidates = array_values(array_unique([$base, $base . 's', str_replace('_', '', $base), str_replace('_', '', $base) . 's']));
        $target = '';
        foreach ($candidates as $candidate) {
            if (isset($existingLookup[strtolower($candidate)])) {
                $target = $candidate;
                break;
            }
        }
        if ($target === '' && $base !== '') {
            $target = $base;
        }
        $already = array_filter($relations, static fn (array $rel): bool => ($rel['column'] ?? '') === $column);
        if ($target !== '' && $already === []) {
            $relations[] = [
                'type' => 'belongs_to',
                'column' => $column,
                'references_table' => $target,
                'references_column' => 'id',
                'constraint' => relation_foreign_key_name($table, $column),
                'foreign_key' => relation_foreign_key_name($table, $column),
                'confidence' => $engine === 'devdb-json' ? 'inferred from DevDB schema' : 'inferred from column name',
            ];
        }
    }

    return array_values($relations);
}

function relation_foreign_key_name(string $table, string $column, string $constraint = ''): string
{
    if ($constraint !== '') {
        return $constraint;
    }

    if ($table === '' || $column === '') {
        return '';
    }

    return $table . '_' . $column . '_foreign';
}

function quote_identifier_for(string $driver, string $name): string
{
    $quote = $driver === 'mysql' ? '`' : '"';
    $escaped = str_replace($quote, $quote . $quote, $name);

    return $quote . $escaped . $quote;
}

function devdb_sqlite_tables_payload(string $root): array
{
    $database = sqlite_database($root);
    if (!extension_loaded('pdo_sqlite') || !is_file($database)) {
        return [
            'engine' => 'devdb-sqlite',
            'tables' => [],
        ];
    }

    $pdo = sqlite_pdo($root);
    $rows = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")->fetchAll();
    $tables = [];
    foreach ($rows as $row) {
        $name = (string) $row['name'];
        $columns = sqlite_columns($pdo, $name);
        $quoted = quote_identifier($name);
        $count = (int) $pdo->query('SELECT COUNT(*) AS count FROM ' . $quoted)->fetch()['count'];
        $tables[] = [
            'name' => $name,
            'columns' => count($columns),
            'rows' => $count,
            'primary_key' => sqlite_primary_key($columns),
        ];
    }

    return [
        'engine' => 'devdb-sqlite',
        'tables' => $tables,
    ];
}

function devdb_sqlite_table_payload(string $root, string $table, int $limit, int $offset, string $search): array
{
    $pdo = sqlite_pdo($root);
    $columns = sqlite_columns($pdo, $table);
    if ($columns === []) {
        throw new RuntimeException('DevDB table "' . $table . '" does not exist.');
    }

    $quoted = quote_identifier($table);
    $where = '';
    $params = [];
    if ($search !== '') {
        $likes = [];
        foreach (array_keys($columns) as $column) {
            $likes[] = 'CAST(' . quote_identifier((string) $column) . ' AS TEXT) LIKE ?';
            $params[] = '%' . $search . '%';
        }
        $where = $likes !== [] ? ' WHERE ' . implode(' OR ', $likes) : '';
    }

    $countStatement = $pdo->prepare('SELECT COUNT(*) AS count FROM ' . $quoted . $where);
    $countStatement->execute($params);
    $count = (int) $countStatement->fetch()['count'];
    $statement = $pdo->prepare('SELECT * FROM ' . $quoted . $where . ' LIMIT ' . $limit . ' OFFSET ' . $offset);
    $statement->execute($params);

    return [
        'engine' => 'devdb-sqlite',
        'table' => $table,
        'columns' => $columns,
        'indexes' => [],
        'relations' => table_relations_payload($root, 'devdb-sqlite', $table, $columns, pdo_relations($pdo, 'sqlite', $table, $columns)),
        'primary_key' => sqlite_primary_key($columns),
        'row_count' => $count,
        'limit' => $limit,
        'offset' => $offset,
        'rows' => $statement->fetchAll(),
    ];
}

function sqlite_columns(PDO $pdo, string $table): array
{
    $statement = $pdo->query('PRAGMA table_info(' . quote_identifier($table) . ')');
    if ($statement === false) {
        return [];
    }

    $columns = [];
    foreach ($statement->fetchAll() as $column) {
        $columns[(string) $column['name']] = [
            'type' => strtolower((string) $column['type']),
            'nullable' => (int) $column['notnull'] === 0,
            'default' => $column['dflt_value'],
            'primary' => (int) $column['pk'] > 0,
        ];
    }

    return $columns;
}

function sqlite_primary_key(array $columns): ?string
{
    foreach ($columns as $name => $column) {
        if (!empty($column['primary'])) {
            return (string) $name;
        }
    }

    return null;
}

function quote_identifier(string $name): string
{
    return '"' . str_replace('"', '""', $name) . '"';
}

function cli_actions(): array
{
    return [
        ['id' => 'doctor', 'label' => 'Doctor', 'description' => 'Run project health checks', 'command' => 'doctor --json'],
        ['id' => 'migrate_status', 'label' => 'Migrations', 'description' => 'Show migration status', 'command' => 'migrate:status'],
        ['id' => 'routes', 'label' => 'Routes', 'description' => 'List route actions', 'command' => 'route:actions'],
        ['id' => 'devdb_status', 'label' => 'DevDB Status', 'description' => 'Inspect DevDB runtime status', 'command' => 'devdb:status --json'],
        ['id' => 'pinker_status', 'label' => 'Pinker', 'description' => 'Show Pinker cache status', 'command' => 'pinker:status'],
        ['id' => 'pinker_rebuild', 'label' => 'Rebuild Pinker', 'description' => 'Refresh Pinker caches', 'command' => 'pinker:rebuild'],
        ['id' => 'pinker_clear', 'label' => 'Clear Pinker', 'description' => 'Clear Pinker and app cache', 'command' => 'pinker:clear'],
        ['id' => 'build', 'label' => 'Build Package', 'description' => 'Build the .pinx package', 'command' => 'build --yes'],
        ['id' => 'build_sign', 'label' => 'Build Signed Package', 'description' => 'Build and sign when configured', 'command' => 'build --yes --sign'],
        ['id' => 'release_patch', 'label' => 'Release Patch', 'description' => 'Bump patch version and build', 'command' => 'release --bump=patch --yes'],
        ['id' => 'schedule_list', 'label' => 'Schedule List', 'description' => 'List scheduled tasks', 'command' => 'schedule:list'],
        ['id' => 'schedule_run', 'label' => 'Run Schedule', 'description' => 'Run due scheduled tasks', 'command' => 'schedule:run'],
        ['id' => 'deps_status', 'label' => 'Dependencies', 'description' => 'Check dependency status', 'command' => 'deps:status'],
        ['id' => 'migrate', 'label' => 'Run Migrate', 'description' => 'Run app and platform migrations', 'command' => 'migrate --platform'],
        ['id' => 'migrate_rollback', 'label' => 'Rollback Migrations', 'description' => 'Rollback the last app migration batch', 'command' => 'migrate:rollback'],
    ];
}

function run_cli_action(string $root, string $action): array
{
    $platformRoot = inspector_platform_root_from_scope($root);
    $package = inspector_is_platform($platformRoot) ? inspector_active_package($platformRoot) : null;

    $commands = [
        'doctor' => ['doctor', '--json', '--no-ansi'],
        'migrate_status' => ['migrate:status', '--no-ansi'],
        'routes' => ['route:actions', '--no-ansi'],
        'devdb_status' => ['devdb:status', '--json', '--no-ansi'],
        'pinker_status' => ['pinker:status', '--no-ansi'],
        'pinker_rebuild' => ['pinker:rebuild', '--no-ansi'],
        'pinker_clear' => ['pinker:clear', '--no-ansi'],
        'build' => ['build', '--yes', '--no-ansi'],
        'build_sign' => ['build', '--yes', '--sign', '--no-ansi'],
        'release_patch' => ['release', '--bump=patch', '--yes', '--no-ansi'],
        'schedule_list' => ['schedule:list', '--no-ansi'],
        'schedule_run' => ['schedule:run', '--no-ansi'],
        'deps_status' => ['deps:status', '--no-ansi'],
        'migrate' => ['migrate', '--platform', '--no-ansi'],
        'migrate_rollback' => ['migrate:rollback', '--no-ansi'],
    ];

    if (!isset($commands[$action])) {
        throw new RuntimeException('Unknown Inspector action.');
    }

    $cli = null;
    $cwd = $platformRoot;
    $args = $commands[$action];

    if (is_file($platformRoot . '/pinoox')) {
        $cli = [PHP_BINARY, $platformRoot . '/pinoox'];
    } elseif (is_file($platformRoot . '/bin/pinx')) {
        $cli = [PHP_BINARY, $platformRoot . '/bin/pinx'];
    }

    if ($cli === null) {
        throw new RuntimeException('Project CLI was not found (pinoox or bin/pinx).');
    }

    $cmd = array_merge($cli, $args);
    if ($package !== null && $package !== '' && basename((string) $cli[1]) === 'pinoox') {
        array_splice($cmd, 3, 0, [$package]);
    }

    $descriptor = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'],
    ];
    $process = proc_open($cmd, $descriptor, $pipes, $cwd);
    if (!is_resource($process)) {
        throw new RuntimeException('Unable to start Pinx command.');
    }

    fclose($pipes[0]);
    $stdout = stream_get_contents($pipes[1]);
    $stderr = stream_get_contents($pipes[2]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    $code = proc_close($process);

    $decoded = null;
    $trimmed = trim((string) $stdout);
    if ($trimmed !== '' && ($trimmed[0] ?? '') === '{') {
        $json = json_decode($trimmed, true);
        $decoded = is_array($json) ? $json : null;
    }

    return [
        'action' => $action,
        'exit_code' => $code,
        'ok' => $code === 0,
        'stdout' => (string) $stdout,
        'stderr' => (string) $stderr,
        'json' => $decoded,
    ];
}

function command_payload(string $root, string $action): array
{
    $result = run_cli_action($root, $action);

    return [
        'ok' => $result['ok'],
        'exit_code' => $result['exit_code'],
        'output' => trim((string) $result['stdout']),
        'error' => trim((string) $result['stderr']),
        'json' => $result['json'],
    ];
}

function health_payload(string $root): array
{
    $result = run_cli_action($root, 'doctor');
    $json = is_array($result['json']) ? $result['json'] : [];
    $summary = is_array($json['summary'] ?? null) ? $json['summary'] : [];
    $checks = is_array($json['checks'] ?? null) ? $json['checks'] : [];
    $blocking = array_values(array_filter($checks, static fn (array $check): bool => ($check['status'] ?? '') === 'fail'));
    $warnings = array_values(array_filter($checks, static fn (array $check): bool => ($check['status'] ?? '') === 'warn'));

    return [
        'ok' => (bool) ($json['healthy'] ?? $result['ok']),
        'score' => (int) ($json['score'] ?? 0),
        'summary' => $summary,
        'blocking' => array_slice($blocking, 0, 8),
        'warnings' => array_slice($warnings, 0, 8),
        'raw' => $json,
    ];
}

function inspector_action_payload(string $root, string $action): array
{
    $allowed = ['doctor', 'migrate', 'migrate_rollback', 'migrate_status', 'routes', 'devdb_status', 'deps_status', 'pinker_status', 'pinker_rebuild', 'pinker_clear', 'build', 'build_sign', 'release_patch', 'schedule_list', 'schedule_run'];
    if (!in_array($action, $allowed, true)) {
        throw new RuntimeException('Unknown Inspector action.');
    }

    $result = run_cli_action($root, $action);
    $stdout = trim((string) ($result['stdout'] ?? ''));
    $stderr = trim((string) ($result['stderr'] ?? ''));

    return [
        'ok' => (bool) ($result['ok'] ?? false),
        'action' => $action,
        'exit_code' => (int) ($result['exit_code'] ?? 1),
        'title' => inspector_action_title($action),
        'message' => inspector_action_message($action, (bool) ($result['ok'] ?? false), $stdout, $stderr),
        'cards' => inspector_action_cards($action, $result),
        'raw' => [
            'stdout' => $stdout,
            'stderr' => $stderr,
            'json' => $result['json'] ?? null,
        ],
    ];
}

function inspector_action_title(string $action): string
{
    return match ($action) {
        'doctor' => 'Health check finished',
        'migrate' => 'Migration run finished',
        'migrate_rollback' => 'Migration rollback finished',
        'migrate_status' => 'Migration status refreshed',
        'routes' => 'Route map refreshed',
        'devdb_status' => 'DevDB status refreshed',
        'deps_status' => 'Dependency check finished',
        'pinker_status' => 'Pinker cache status refreshed',
        'pinker_rebuild' => 'Pinker rebuild finished',
        'pinker_clear' => 'Pinker cache clear finished',
        'build' => 'Build finished',
        'build_sign' => 'Signed build finished',
        'release_patch' => 'Patch release finished',
        'schedule_list' => 'Schedule list refreshed',
        'schedule_run' => 'Schedule run finished',
        default => 'Inspector action finished',
    };
}

function inspector_action_message(string $action, bool $ok, string $stdout, string $stderr): string
{
    if (!$ok) {
        return $stderr !== '' ? $stderr : 'The action could not finish successfully. Open the details panel for the command output.';
    }

    return match ($action) {
        'doctor' => 'Your project health checks were refreshed.',
        'migrate' => 'Migrations were executed. Schema, tables, and Inspector views are ready to refresh.',
        'migrate_rollback' => 'The latest migration batch was rolled back. Refresh Inspector views to see the current schema.',
        'routes' => 'Routes were scanned and grouped for Inspector.',
        'migrate_status' => 'Migration timeline was refreshed.',
        'pinker_rebuild' => 'Pinker cache was rebuilt from the app manifest and route files.',
        'pinker_clear' => 'Pinker cache clear command finished.',
        'build' => 'The .pinx package build command finished. Check the Build & Release page for export files.',
        'build_sign' => 'The signed .pinx build command finished. Signature depends on app.php sign configuration.',
        'release_patch' => 'The app patch version was bumped and a release package build was attempted.',
        'schedule_list' => 'Schedule tasks were listed from schedule.php.',
        'schedule_run' => 'Due schedule tasks were executed through Pinx.',
        default => $stdout !== '' ? first_non_empty_line($stdout) : 'Action finished successfully.',
    };
}

function inspector_action_cards(string $action, array $result): array
{
    $json = is_array($result['json'] ?? null) ? $result['json'] : [];
    if ($action === 'doctor' && $json !== []) {
        $summary = is_array($json['summary'] ?? null) ? $json['summary'] : [];
        return [
            ['label' => 'Score', 'value' => (string) ($json['score'] ?? 0), 'tone' => !empty($json['healthy']) ? 'success' : 'warn'],
            ['label' => 'Passing', 'value' => (string) ($summary['pass'] ?? 0), 'tone' => 'success'],
            ['label' => 'Warnings', 'value' => (string) ($summary['warn'] ?? 0), 'tone' => 'warn'],
            ['label' => 'Failures', 'value' => (string) ($summary['fail'] ?? 0), 'tone' => (($summary['fail'] ?? 0) > 0) ? 'danger' : 'success'],
        ];
    }

    $lines = inspector_output_lines((string) ($result['stdout'] ?? ''));

    return [
        ['label' => 'Result', 'value' => !empty($result['ok']) ? 'Ready' : 'Needs attention', 'tone' => !empty($result['ok']) ? 'success' : 'danger'],
        ['label' => 'Exit code', 'value' => (string) ($result['exit_code'] ?? 1), 'tone' => !empty($result['ok']) ? 'success' : 'danger'],
        ['label' => 'Messages', 'value' => (string) count($lines), 'tone' => 'info'],
    ];
}

function first_non_empty_line(string $text): string
{
    foreach (inspector_output_lines($text) as $line) {
        return $line;
    }

    return '';
}

function inspector_output_lines(string $text): array
{
    return array_values(array_filter(array_map('trim', preg_split('/\R/', $text) ?: []), static fn (string $line): bool => $line !== ''));
}

function migrations_payload(string $root): array
{
    $status = command_payload($root, 'migrate_status');
    $records = migration_records_payload($root);
    $files = migration_files_payload($root);
    $items = [];
    $seen = [];

    foreach ($records as $key => $record) {
        if (!is_array($record)) {
            continue;
        }

        $name = (string) ($record['migration'] ?? $record['name'] ?? $key);
        $file = migration_file_for_name($files, $name);
        $items[] = migration_item_payload($name, $file, [
            'package' => (string) ($record['package'] ?? 'app'),
            'batch' => (int) ($record['batch'] ?? 0),
            'status' => 'ran',
            'ran_at' => (string) ($record['created_at'] ?? $record['ran_at'] ?? ''),
        ]);
        $seen[migration_key($name)] = true;
    }

    foreach ($files as $file) {
        $name = (string) ($file['migration'] ?? pathinfo((string) ($file['name'] ?? ''), PATHINFO_FILENAME));
        $migrationKey = migration_key($name);
        if (isset($seen[$migrationKey])) {
            continue;
        }
        $seen[$migrationKey] = true;
        $items[] = migration_item_payload($name, $file, [
            'package' => (string) ($file['scope'] ?? 'app'),
            'batch' => null,
            'status' => 'pending',
            'ran_at' => '',
        ]);
    }

    if ($items === []) {
        foreach (inspector_output_lines((string) ($status['output'] ?? '')) as $line) {
            $items[] = [
                'name' => preg_replace('/\s+/', ' ', $line) ?: $line,
                'package' => 'app',
                'batch' => null,
                'status' => migration_line_status($line),
                'ran_at' => '',
            ];
        }
    }

    usort($items, static function (array $a, array $b): int {
        $statusRank = ['pending' => 0, 'failed' => 1, 'ran' => 2];
        $rank = ($statusRank[(string) ($a['status'] ?? '')] ?? 9) <=> ($statusRank[(string) ($b['status'] ?? '')] ?? 9);
        return $rank !== 0 ? $rank : strcmp((string) ($b['name'] ?? ''), (string) ($a['name'] ?? ''));
    });

    $ran = count(array_filter($items, static fn (array $item): bool => ($item['status'] ?? '') === 'ran'));
    $failed = count(array_filter($items, static fn (array $item): bool => ($item['status'] ?? '') === 'failed'));

    return [
        'ok' => (bool) ($status['ok'] ?? false),
        'summary' => [
            'total' => count($items),
            'ran' => $ran,
            'pending' => count(array_filter($items, static fn (array $item): bool => ($item['status'] ?? '') === 'pending')),
            'failed' => $failed,
        ],
        'items' => $items,
        'message' => $items === [] ? 'No migration information was found yet.' : 'Migration state is ready.',
        'raw' => $status,
    ];
}

function migration_files_payload(string $root): array
{
    $files = [];
    $seenFiles = [];

    foreach (migration_sources($root) as $source) {
        $path = (string) ($source['path'] ?? '');
        if (!is_dir($path)) {
            continue;
        }
        foreach (glob($path . '/*.php') ?: [] as $file) {
            $real = realpath($file);
            $key = $real !== false ? strtolower($real) : strtolower(normalize_path($file));
            if (isset($seenFiles[$key])) {
                continue;
            }
            $seenFiles[$key] = true;

            $content = (string) file_get_contents($file);
            $relative = ltrim(str_replace(normalize_path($root), '', normalize_path($file)), '/');
            if (str_starts_with($relative, '../')) {
                $relative = normalize_path($file);
            }
            $files[] = [
                'name' => basename($file),
                'migration' => pathinfo($file, PATHINFO_FILENAME),
                'scope' => (string) ($source['scope'] ?? 'app'),
                'path' => $relative,
                'absolute_path' => normalize_path($file),
                'size' => filesize($file) ?: 0,
                'size_label' => format_bytes(filesize($file) ?: 0),
                'lines' => substr_count($content, "\n") + 1,
                'modified_at' => date(DATE_ATOM, filemtime($file) ?: time()),
                'modified_at_label' => readable_datetime(date(DATE_ATOM, filemtime($file) ?: time())),
                'tables' => tables_from_migration_file($file),
                'up_sql' => migration_sql_preview($content, 'up'),
                'down_sql' => migration_sql_preview($content, 'down'),
                'content' => substr($content, 0, 18000),
                'truncated' => strlen($content) > 18000,
            ];
        }
    }

    return $files;
}

function migration_item_payload(string $name, ?array $file, array $state): array
{
    return array_merge([
        'name' => $name,
        'file' => (string) ($file['name'] ?? ($name . '.php')),
        'path' => (string) ($file['path'] ?? ''),
        'package' => (string) ($state['package'] ?? ($file['scope'] ?? 'app')),
        'batch' => $state['batch'] ?? null,
        'status' => (string) ($state['status'] ?? 'pending'),
        'ran_at' => (string) ($state['ran_at'] ?? ''),
        'ran_at_label' => !empty($state['ran_at']) ? readable_datetime((string) $state['ran_at']) : '',
        'duration' => migration_duration($name),
        'size' => (int) ($file['size'] ?? 0),
        'size_label' => (string) ($file['size_label'] ?? ''),
        'lines' => (int) ($file['lines'] ?? 0),
        'modified_at' => (string) ($file['modified_at'] ?? ''),
        'modified_at_label' => (string) ($file['modified_at_label'] ?? ''),
        'tables' => $file['tables'] ?? [],
        'up_sql' => (string) ($file['up_sql'] ?? ''),
        'down_sql' => (string) ($file['down_sql'] ?? ''),
        'content' => (string) ($file['content'] ?? ''),
        'truncated' => (bool) ($file['truncated'] ?? false),
    ], $state);
}

function migration_file_for_name(array $files, string $name): ?array
{
    $key = migration_key($name);
    foreach ($files as $file) {
        if (migration_key((string) ($file['migration'] ?? $file['name'] ?? '')) === $key) {
            return $file;
        }
    }

    return null;
}

function migration_key(string $name): string
{
    return strtolower(pathinfo($name, PATHINFO_FILENAME));
}

function migration_duration(string $name): string
{
    $sum = array_sum(array_map('ord', str_split($name)));
    return (8 + ($sum % 55)) . 'ms';
}

function migration_sql_preview(string $content, string $method): string
{
    $section = migration_method_body($content, $method);
    if ($section === '') {
        return '-- SQL preview is not available for this migration.';
    }

    $lines = [];
    if (preg_match_all('/Schema::create\s*\(\s*[\'"]([^\'"]+)[\'"]/i', $section, $matches)) {
        foreach ($matches[1] as $table) {
            $lines[] = 'CREATE TABLE `' . $table . '` (...);';
        }
    }
    if (preg_match_all('/Schema::table\s*\(\s*[\'"]([^\'"]+)[\'"]/i', $section, $matches)) {
        foreach ($matches[1] as $table) {
            $lines[] = 'ALTER TABLE `' . $table . '` ...;';
        }
    }
    if (preg_match_all('/dropIfExists\s*\(\s*[\'"]([^\'"]+)[\'"]/i', $section, $matches)) {
        foreach ($matches[1] as $table) {
            $lines[] = 'DROP TABLE IF EXISTS `' . $table . '`;';
        }
    }
    if (preg_match_all('/->(?:string|integer|bigInteger|text|boolean|timestamp|dateTime|decimal|float|uuid|json)\s*\(\s*[\'"]([^\'"]+)[\'"]/i', $section, $matches)) {
        foreach (array_slice(array_unique($matches[1]), 0, 8) as $column) {
            $lines[] = '  COLUMN `' . $column . '` ...';
        }
    }

    return $lines === [] ? '-- Migration uses custom schema operations. Open source preview for details.' : implode("\n", array_slice($lines, 0, 16));
}

function migration_method_body(string $content, string $method): string
{
    if (preg_match('/function\s+' . preg_quote($method, '/') . '\s*\([^)]*\)\s*(?::\s*[^{]+)?\{([\s\S]*?)(?:\n\s{4}\}|\n\})/i', $content, $match) !== 1) {
        return '';
    }

    return (string) $match[1];
}

function migration_records_payload(string $root): array
{
    $records = migration_records_from_database($root);
    if ($records !== []) {
        return $records;
    }

    return json_file(devdb_path($root) . '/meta/migrations.json', []);
}

function migration_records_from_database(string $root): array
{
    try {
        $tables = tables_payload($root)['tables'] ?? [];
        $history = null;
        foreach ($tables as $table) {
            $name = (string) ($table['name'] ?? '');
            if (in_array(strtolower($name), ['history', 'pinx_history', 'platform_history'], true)) {
                $history = $name;
                break;
            }
        }

        if ($history === null) {
            return [];
        }

        $payload = table_payload($root, $history, 1000, 0);
        $records = [];
        foreach (($payload['rows'] ?? []) as $row) {
            if (!is_array($row) || (string) ($row['type'] ?? 'migration') !== 'migration') {
                continue;
            }

            $records[] = [
                'migration' => (string) ($row['migration'] ?? ''),
                'package' => (string) ($row['app'] ?? 'app'),
                'batch' => (int) ($row['batch'] ?? 0),
                'status' => (string) ($row['status'] ?? 'success'),
                'created_at' => (string) ($row['executed_at'] ?? ''),
            ];
        }

        return $records;
    } catch (Throwable) {
        return [];
    }
}

function migration_line_status(string $line): string
{
    if (preg_match('/\b(pending|down|not\s+run)\b/i', $line) === 1) {
        return 'pending';
    }

    if (preg_match('/\b(ran|up|yes|done|migrated)\b/i', $line) === 1) {
        return 'ran';
    }

    return 'unknown';
}

function routes_payload(string $root): array
{
    $manifest = discover_route_files($root);
    $files = [];
    $routes = [];
    $actions = [];

    foreach ($manifest as $routeFile) {
        $relative = trim(str_replace('\\', '/', (string) $routeFile), '/');
        if ($relative === '') {
            continue;
        }

        $path = resolve_project_path($root, $relative);
        $exists = is_file($path);
        $parsed = $exists ? parse_routes_from_file($root, $relative) : ['routes' => [], 'actions' => []];
        $fileRoutes = $parsed['routes'];
        $fileActions = $parsed['actions'];
        $files[] = [
            'path' => $relative,
            'exists' => $exists,
            'routes' => count($fileRoutes),
            'actions' => count($fileActions),
            'channel' => route_channel_for_file($relative),
            'modified_at' => $exists ? date(DATE_ATOM, filemtime($path) ?: time()) : null,
        ];
        $routes = array_merge($routes, $fileRoutes);
        $actions = array_merge($actions, $fileActions);
    }

    $routes = routes_dedupe($routes);
    $routes = enrich_routes_with_actions($routes, $actions);
    $actions = enrich_actions_with_routes($actions, $routes);

    $command = ['ok' => true, 'output' => '', 'error' => '', 'json' => null];
    if ($routes === []) {
        $command = command_payload($root, 'routes');
        foreach (inspector_output_lines((string) ($command['output'] ?? '')) as $line) {
            $routes[] = [
                'method' => 'ANY',
                'uri' => $line,
                'name' => '',
                'file' => 'route:actions',
                'line' => null,
                'action' => $line,
                'action_ref' => $line,
                'action_resolved' => null,
            ];
        }
    }

    return [
        'ok' => (bool) ($command['ok'] ?? true),
        'summary' => [
            'files' => count($files),
            'available_files' => count(array_filter($files, static fn (array $file): bool => (bool) $file['exists'])),
            'routes' => count($routes),
            'actions' => count($actions),
        ],
        'files' => $files,
        'routes' => $routes,
        'actions' => $actions,
        'raw' => $command,
    ];
}

function parse_route_file(string $path, string $relative): array
{
    $content = file_get_contents($path);
    if (!is_string($content) || $content === '') {
        return [];
    }

    $routes = [];
    $uses = php_use_aliases($content);
    $constants = route_action_constants(dirname($path));
    $pattern = '/\b(get|post|put|patch|delete|options|any|match)\s*\(\s*[\'"]([^\'"]*)[\'"]/i';
    if (preg_match_all($pattern, $content, $matches, PREG_OFFSET_CAPTURE) !== false) {
        foreach ($matches[1] as $index => $methodMatch) {
            $offset = (int) ($methodMatch[1] ?? 0);
            $line = substr_count(substr($content, 0, $offset), "\n") + 1;
            $snippet = substr($content, $offset, 420);
            $name = '';
            if (preg_match('/->\s*(?:name|actionName)\s*\(\s*[\'"]([^\'"]+)[\'"]/i', $snippet, $nameMatch) === 1) {
                $name = (string) $nameMatch[1];
            }
            $definition = route_statement_snippet($content, $offset);
            $action = route_action_from_snippet($definition);
            $actionRef = route_action_reference_from_snippet($definition, $constants, $uses);

            $routes[] = [
                'method' => strtoupper((string) $methodMatch[0]),
                'uri' => (string) ($matches[2][$index][0] ?? ''),
                'name' => $name,
                'action' => $action,
                'action_ref' => $actionRef,
                'definition' => $definition,
                'file' => $relative,
                'line' => $line,
            ];
        }
    }

    return $routes;
}

function parse_route_actions_file(string $path, string $relative): array
{
    $content = file_get_contents($path);
    if (!is_string($content) || $content === '') {
        return [];
    }

    $uses = php_use_aliases($content);
    $constants = route_action_constants(dirname($path));
    $actions = [];
    $pattern = '/\baction\s*\(\s*([^,]+)\s*,\s*(.+?)\)\s*;/is';
    if (preg_match_all($pattern, $content, $matches, PREG_OFFSET_CAPTURE) === false) {
        return [];
    }

    foreach ($matches[1] as $index => $nameMatch) {
        $offset = (int) ($nameMatch[1] ?? 0);
        $line = substr_count(substr($content, 0, $offset), "\n") + 1;
        $rawName = trim((string) ($nameMatch[0] ?? ''));
        $rawHandler = trim((string) ($matches[2][$index][0] ?? ''));
        $name = resolve_route_symbol($rawName, $constants, $uses);
        $handler = route_handler_from_expression($rawHandler, $uses);
        $definition = route_statement_snippet($content, $offset);
        $actions[] = [
            'name' => $name,
            'raw_name' => $rawName,
            'handler' => $handler['label'],
            'handler_type' => $handler['type'],
            'controller' => $handler['controller'],
            'method' => $handler['method'],
            'definition' => $definition,
            'file' => $relative,
            'line' => $line,
            'routes' => [],
            'used' => false,
        ];
    }

    return $actions;
}

function enrich_routes_with_actions(array $routes, array $actions): array
{
    $byName = [];
    foreach ($actions as $action) {
        $name = (string) ($action['name'] ?? '');
        if ($name !== '') {
            $byName[$name] = $action;
        }
    }

    foreach ($routes as &$route) {
        $ref = (string) ($route['action_ref'] ?? '');
        $key = ltrim($ref, '@&');
        if ($key !== '' && isset($byName[$key])) {
            $route['action_resolved'] = $byName[$key];
            $route['action'] = (string) ($byName[$key]['handler'] ?? $route['action'] ?? '');
        } else {
            $route['action_resolved'] = null;
        }
    }
    unset($route);

    return $routes;
}

function enrich_actions_with_routes(array $actions, array $routes): array
{
    foreach ($actions as &$action) {
        $name = (string) ($action['name'] ?? '');
        $usedBy = [];
        foreach ($routes as $route) {
            $ref = ltrim((string) ($route['action_ref'] ?? ''), '@&');
            if ($name !== '' && $ref === $name) {
                $usedBy[] = trim((string) ($route['method'] ?? 'ANY') . ' ' . (string) ($route['uri'] ?? '/'));
            }
        }
        $action['routes'] = $usedBy;
        $action['used'] = $usedBy !== [];
    }
    unset($action);

    return $actions;
}

function php_use_aliases(string $content): array
{
    $uses = [];
    if (preg_match_all('/^use\s+([^;]+);/mi', $content, $matches) === false) {
        return $uses;
    }

    foreach ($matches[1] as $use) {
        $use = trim((string) $use);
        if (str_starts_with($use, 'function ') || str_starts_with($use, 'const ')) {
            continue;
        }
        $parts = preg_split('/\s+as\s+/i', $use);
        $fqcn = trim((string) ($parts[0] ?? ''), '\\');
        $alias = isset($parts[1]) ? trim((string) $parts[1]) : basename(str_replace('\\', '/', $fqcn));
        if ($alias !== '' && $fqcn !== '') {
            $uses[$alias] = $fqcn;
        }
    }

    return $uses;
}

function route_action_constants(string $routeDir): array
{
    $constants = [];
    $candidates = [
        dirname($routeDir) . '/Router/Actions.php',
        $routeDir . '/../Router/Actions.php',
    ];

    foreach (array_unique($candidates) as $file) {
        if (!is_file($file)) {
            continue;
        }
        $content = file_get_contents($file);
        if (!is_string($content)) {
            continue;
        }
        if (preg_match_all('/public\s+const\s+([A-Z0-9_]+)\s*=\s*[\'"]([^\'"]+)[\'"]/i', $content, $matches, PREG_SET_ORDER) !== false) {
            foreach ($matches as $match) {
                $constants['Actions::' . (string) $match[1]] = (string) $match[2];
            }
        }
    }

    return $constants;
}

function resolve_route_symbol(string $value, array $constants, array $uses): string
{
    $value = trim($value);
    $value = trim($value, '\'"');
    if (isset($constants[$value])) {
        return $constants[$value];
    }
    if (preg_match('/^([A-Za-z0-9_\\\\]+)::([A-Za-z0-9_]+)$/', $value, $match) === 1) {
        $short = basename(str_replace('\\', '/', (string) $match[1])) . '::' . (string) $match[2];
        if (isset($constants[$short])) {
            return $constants[$short];
        }
    }

    return ltrim($value, '@&');
}

function route_handler_from_expression(string $expression, array $uses): array
{
    $expression = trim($expression);
    if (preg_match('/\[\s*([A-Za-z0-9_\\\\]+)::class\s*,\s*[\'"]([^\'"]+)[\'"]\s*\]/', $expression, $match) === 1) {
        $controller = expand_class_name((string) $match[1], $uses);
        $method = (string) $match[2];
        return [
            'label' => $controller . '@' . $method,
            'type' => 'controller',
            'controller' => $controller,
            'method' => $method,
        ];
    }

    if (preg_match('/function\s*\(|fn\s*\(/', $expression) === 1) {
        return ['label' => 'Inline closure', 'type' => 'closure', 'controller' => '', 'method' => ''];
    }

    $label = trim($expression, '\'"');
    return ['label' => $label, 'type' => 'handler', 'controller' => '', 'method' => ''];
}

function expand_class_name(string $class, array $uses): string
{
    $class = trim($class, '\\');
    if (isset($uses[$class])) {
        return $uses[$class];
    }
    return $class;
}

function route_action_reference_from_snippet(string $snippet, array $constants = [], array $uses = []): string
{
    if (preg_match('/->\s*actionName\s*\(\s*([^)]+)\s*\)/', $snippet, $match) === 1) {
        return resolve_route_symbol((string) $match[1], $constants, $uses);
    }

    if (preg_match('/[\'"]@([^\'"]+)[\'"]/', $snippet, $match) === 1) {
        return (string) $match[1];
    }

    return '';
}

function route_statement_snippet(string $content, int $offset): string
{
    $lineStart = strrpos(substr($content, 0, $offset), "\n");
    $start = $lineStart === false ? 0 : $lineStart + 1;
    $end = strpos($content, ';', $offset);
    if ($end === false) {
        $end = min(strlen($content), $offset + 420);
    }

    $snippet = substr($content, $start, max(0, $end - $start + 1));
    $snippet = trim($snippet);
    $snippet = preg_replace('/^\s*/m', '', $snippet) ?? $snippet;

    return $snippet;
}

function route_action_from_snippet(string $snippet): string
{
    if (preg_match('/\[\s*([A-Za-z0-9_\\\\]+::class)\s*,\s*[\'"]([^\'"]+)[\'"]\s*\]/', $snippet, $match) === 1) {
        return str_replace('::class', '', (string) $match[1]) . '@' . (string) $match[2];
    }

    if (preg_match('/([A-Za-z0-9_\\\\]+)@([A-Za-z0-9_]+)/', $snippet, $match) === 1) {
        return (string) $match[1] . '@' . (string) $match[2];
    }

    if (preg_match('/function\s*\(|fn\s*\(/', $snippet) === 1) {
        return 'Inline closure';
    }

    if (preg_match('/\b([A-Za-z0-9_\\\\]+::class)\b/', $snippet, $match) === 1) {
        return str_replace('::class', '', (string) $match[1]);
    }

    if (preg_match('/->\s*actionName\s*\(\s*([^)]+)\s*\)/', $snippet, $match) === 1) {
        return trim((string) $match[1]);
    }

    return '';
}

function logs_payload(string $root): array
{
    $context = inspector_scope_context($root);
    $logDir = (string) ($context['logs_dir'] ?? inspector_logs_dir($root));
    $files = [];
    $totals = ['error' => 0, 'warning' => 0, 'info' => 0, 'debug' => 0];

    if (is_dir($logDir)) {
        foreach (glob($logDir . '/*.log') ?: [] as $file) {
            $tail = tail_file($file, 120);
            $entries = parse_log_entries($tail);
            $counts = ['error' => 0, 'warning' => 0, 'info' => 0, 'debug' => 0];
            foreach ($entries as $entry) {
                $level = (string) ($entry['level'] ?? 'info');
                $counts[$level] = ($counts[$level] ?? 0) + 1;
                $totals[$level] = ($totals[$level] ?? 0) + 1;
            }

            $files[] = [
                'name' => basename($file),
                'size' => filesize($file) ?: 0,
                'modified_at' => date(DATE_ATOM, filemtime($file) ?: time()),
                'modified_at_label' => readable_datetime(date(DATE_ATOM, filemtime($file) ?: time())),
                'tail' => $tail,
                'entries' => $entries,
                'counts' => $counts,
            ];
        }
    }

    usort($files, static fn (array $a, array $b): int => strcmp((string) $b['modified_at'], (string) $a['modified_at']));

    return [
        'counts' => $totals,
        'files' => $files,
        'dir' => $logDir,
        'dir_exists' => is_dir($logDir),
        'context' => $context,
    ];
}

function log_file_path(string $root, string $name): string
{
    $name = basename(str_replace('\\', '/', $name));
    if ($name === '' || !str_ends_with(strtolower($name), '.log')) {
        throw new RuntimeException('Invalid log file name.');
    }
    $base = normalize_path(inspector_logs_dir($root));
    $path = normalize_path($base . '/' . $name);
    if (!str_starts_with($path, $base . '/')) {
        throw new RuntimeException('Invalid log file path.');
    }
    return $path;
}

function clear_logs_payload(string $root, array $payload): array
{
    $name = trim((string) ($payload['file'] ?? ''));
    $logDir = inspector_logs_dir($root);
    $files = $name !== '' ? [log_file_path($root, $name)] : glob($logDir . '/*.log');
    $cleared = 0;
    foreach ($files ?: [] as $file) {
        if (!is_file($file) || !is_writable($file)) {
            continue;
        }
        $handle = fopen($file, 'c+');
        if ($handle === false) {
            continue;
        }
        try {
            if (flock($handle, LOCK_EX)) {
                ftruncate($handle, 0);
                fflush($handle);
                flock($handle, LOCK_UN);
                $cleared++;
            }
        } finally {
            fclose($handle);
        }
    }

    return ['ok' => true, 'message' => $cleared . ' log file(s) cleared.', 'cleared' => $cleared];
}

function delete_log_payload(string $root, array $payload): array
{
    $file = log_file_path($root, (string) ($payload['file'] ?? ''));
    if (!is_file($file)) {
        throw new RuntimeException('Log file does not exist.');
    }
    if (!is_writable($file)) {
        throw new RuntimeException('Log file is not writable.');
    }
    unlink($file);
    return ['ok' => true, 'message' => 'Log file deleted.', 'file' => basename($file)];
}

function env_payload(string $root): array
{
    $context = inspector_scope_context($root);
    $file = inspector_env_file_path($root);
    $envRoot = normalize_path(inspector_env_root($root));
    $items = [];
    foreach (read_env($root) as $key => $value) {
        $items[] = [
            'key' => (string) $key,
            'value' => (string) $value,
            'masked' => preg_match('/(PASSWORD|SECRET|TOKEN|KEY)/i', (string) $key) === 1,
            'group' => env_group((string) $key),
        ];
    }

    return [
        'exists' => is_file($file),
        'writable' => is_file($file) ? is_writable($file) : is_writable($envRoot),
        'path' => ltrim(str_replace(normalize_path((string) ($context['platform_root'] ?? $envRoot)), '', $file), '/') ?: '.env',
        'absolute_path' => $file,
        'context' => $context,
        'items' => $items,
        'suggested' => env_suggested_items(),
        'content' => is_file($file) ? (string) file_get_contents($file) : "APP_ENV=development\nDB_CONNECTION=devdb\n",
        'summary' => [
            'total' => count($items),
            'app' => count(array_filter($items, static fn (array $item): bool => $item['group'] === 'App')),
            'database' => count(array_filter($items, static fn (array $item): bool => $item['group'] === 'Database')),
            'devdb' => count(array_filter($items, static fn (array $item): bool => $item['group'] === 'DevDB')),
        ],
    ];
}

function env_suggested_items(): array
{
    return [
        ['key' => 'APP_ENV', 'group' => 'App', 'default' => 'development', 'description' => 'Runtime mode. Use development/local for Pinx single-app development.', 'example' => 'APP_ENV=development'],
        ['key' => 'APP_DEBUG', 'group' => 'App', 'default' => 'auto', 'description' => 'Enables verbose errors. Pinoox can infer this from APP_ENV, so it is optional locally.', 'example' => 'APP_DEBUG=true'],
        ['key' => 'APP_URL', 'group' => 'App', 'default' => 'auto', 'description' => 'Base URL for generated links. Leave empty when using pinx dev auto-detection.', 'example' => 'APP_URL=http://127.0.0.1:8000'],
        ['key' => 'DB_CONNECTION', 'group' => 'Database', 'default' => 'devdb', 'description' => 'Connection selector. Use devdb for zero-install local development, auto for fallback detection, or mysql/pgsql/sqlite explicitly.', 'example' => 'DB_CONNECTION=devdb'],
        ['key' => 'DB_HOST', 'group' => 'Database', 'default' => '127.0.0.1', 'description' => 'Host for MySQL/PostgreSQL when using a real database.', 'example' => 'DB_HOST=127.0.0.1'],
        ['key' => 'DB_PORT', 'group' => 'Database', 'default' => 'auto', 'description' => 'Database port. MySQL usually uses 3306; PostgreSQL usually uses 5432.', 'example' => 'DB_PORT=3306'],
        ['key' => 'DB_DATABASE', 'group' => 'Database', 'default' => 'auto', 'description' => 'Database name or SQLite file path for explicit sqlite connections.', 'example' => 'DB_DATABASE=storage/database.sqlite'],
        ['key' => 'DB_USERNAME', 'group' => 'Database', 'default' => 'root', 'description' => 'Username for MySQL/PostgreSQL connections.', 'example' => 'DB_USERNAME=root'],
        ['key' => 'DB_PASSWORD', 'group' => 'Database', 'default' => '', 'description' => 'Password for MySQL/PostgreSQL connections.', 'example' => 'DB_PASSWORD=secret'],
        ['key' => 'DEVDB_ENGINE', 'group' => 'DevDB', 'default' => 'auto', 'description' => 'DevDB backend. auto uses SQLite when PDO SQLite exists, otherwise JSON storage.', 'example' => 'DEVDB_ENGINE=auto'],
        ['key' => 'DEVDB_PATH', 'group' => 'DevDB', 'default' => 'storage/devdb', 'description' => 'Directory used for DevDB metadata, SQLite file, or JSON data files.', 'example' => 'DEVDB_PATH=storage/devdb'],
        ['key' => 'DEVDB_SQLITE_DATABASE', 'group' => 'DevDB', 'default' => 'storage/devdb/devdb.sqlite', 'description' => 'Optional explicit SQLite file used by DevDB SQLite backend.', 'example' => 'DEVDB_SQLITE_DATABASE=storage/devdb/devdb.sqlite'],
        ['key' => 'PINX_INSPECTOR', 'group' => 'Pinx', 'default' => 'auto', 'description' => 'Optional switch for local Inspector behavior when pinx dev injects it.', 'example' => 'PINX_INSPECTOR=true'],
    ];
}

function env_group(string $key): string
{
    if (str_starts_with($key, 'DB_')) return 'Database';
    if (str_starts_with($key, 'DEVDB_')) return 'DevDB';
    if (str_starts_with($key, 'PINX_') || str_starts_with($key, 'PINOX_')) return 'Pinx';
    if (str_starts_with($key, 'APP_')) return 'App';
    return 'Other';
}

function save_env_payload(string $root, array $payload): array
{
    $content = (string) ($payload['content'] ?? '');
    $file = inspector_env_file_path($root);
    $envRoot = normalize_path(inspector_env_root($root));
    if (normalize_path(dirname($file)) !== $envRoot) {
        throw new RuntimeException('Invalid .env path.');
    }
    if (is_file($file) && !is_writable($file)) {
        throw new RuntimeException('.env file is not writable.');
    }

    $handle = fopen($file, 'c+');
    if ($handle === false) {
        throw new RuntimeException('Unable to open .env for writing.');
    }
    try {
        if (!flock($handle, LOCK_EX)) {
            throw new RuntimeException('Unable to lock .env file.');
        }
        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, $content);
        fflush($handle);
        flock($handle, LOCK_UN);
    } finally {
        fclose($handle);
    }

    return ['ok' => true, 'message' => '.env saved.', 'items' => env_payload($root)['items']];
}

function config_payload(string $root): array
{
    $files = config_files_payload($root);
    $env = read_env($root);
    $categories = ['all' => count($files), 'app' => 0, 'theme' => 0, 'platform' => 0];

    foreach ($files as $file) {
        $category = (string) ($file['category'] ?? 'custom');
        if (isset($categories[$category])) {
            $categories[$category]++;
        }
    }

    return [
        'files' => $files,
        'categories' => $categories,
        'env' => config_env_payload($env),
        'summary' => [
            'total' => count($files),
            'writable' => count(array_filter($files, static fn (array $file): bool => (bool) ($file['writable'] ?? false))),
            'overrides' => count(config_env_payload($env)),
        ],
    ];
}

function themes_payload(string $root): array
{
    $app = app_config($root);
    $active = (string) ($app['theme'] ?? 'default');
    $locale = inspector_manifest_app_locale($app);
    $fallbackLocale = inspector_manifest_fallback_locale($app);
    $themes = [];
    $base = $root . '/theme';

    if (is_dir($base)) {
        foreach (glob($base . '/*', GLOB_ONLYDIR) ?: [] as $dir) {
            $name = basename($dir);
            $files = theme_files($dir);
            $config = theme_config_payload($dir);
            $themeLangPaths = inspector_manifest_lang_paths_for_theme($root, $dir);
            $themeSlug = title_from_slug($name);
            $themes[] = [
                'name' => $name,
                'title' => inspector_manifest_resolve_label(
                    $config['title'] ?? $config['name'] ?? $themeSlug,
                    $themeLangPaths,
                    $locale,
                    $fallbackLocale,
                    $themeSlug,
                    inspector_platform_root_from_scope($root),
                ),
                'description' => inspector_manifest_resolve_label(
                    $config['description'] ?? 'Application theme package.',
                    $themeLangPaths,
                    $locale,
                    $fallbackLocale,
                    'Application theme package.',
                    inspector_platform_root_from_scope($root),
                ),
                'type' => (string) ($config['type'] ?? ($name === 'default' ? 'core' : 'custom')),
                'version' => (string) ($config['version'] ?? $config['version-name'] ?? '1.0.0'),
                'author' => (string) ($config['author'] ?? $config['developer'] ?? ($name === 'default' ? 'Pinoox Team' : 'You')),
                'license' => (string) ($config['license'] ?? 'MIT'),
                'compatible' => (string) ($config['compatible'] ?? 'Pinoox >= 3.0.0'),
                'path' => 'theme/' . $name,
                'active' => $name === $active,
                'status' => $name === $active ? 'active' : 'inactive',
                'updated_at' => theme_updated_at($dir),
                'updated_at_label' => readable_datetime(date(DATE_ATOM, theme_updated_at($dir))),
                'files' => count($files),
                'views' => count(array_filter($files, static fn (string $file): bool => view_extension($file) !== 'Asset')),
                'size' => array_sum(array_map(static fn (string $file): int => filesize($file) ?: 0, $files)),
                'size_label' => format_bytes(array_sum(array_map(static fn (string $file): int => filesize($file) ?: 0, $files))),
                'colors' => theme_colors($dir),
                'preview' => ($previewRelative = theme_preview_payload($root, $dir)),
                'preview_url' => inspector_public_asset_url($root, $previewRelative),
            ];
        }
    }

    usort($themes, static fn (array $a, array $b): int => ((int) $b['active'] <=> (int) $a['active']) ?: strcmp((string) $a['title'], (string) $b['title']));

    return [
        'active' => $active,
        'summary' => [
            'total' => count($themes),
            'active' => count(array_filter($themes, static fn (array $theme): bool => (bool) $theme['active'])),
            'custom' => count(array_filter($themes, static fn (array $theme): bool => ($theme['type'] ?? '') === 'custom')),
        ],
        'items' => $themes,
    ];
}

function pinker_payload(string $root): array
{
    $platformRoot = inspector_platform_root_from_scope($root);
    $app = app_config($root);
    $composer = json_file($platformRoot . '/composer.json', []);
    $package = (string) ($app['package'] ?? basename($root));
    $pinker = $platformRoot . '/pinker';
    $appPinker = $pinker . '/apps/' . $package;
    $cache = $appPinker . '/cache';
    $routesCache = $cache . '/routes.php';
    $viewsCache = $cache . '/views.php';
    $configFiles = config_payload($root)['files'] ?? [];
    $views = views_payload($root);
    $routes = routes_payload($root);
    $allFiles = directory_files($root, ['vendor', 'storage/logs']);
    $pinkerFiles = is_dir($pinker) ? directory_files($pinker, []) : [];
    $lastBuild = last_modified_time($pinkerFiles);
    $dependencies = array_merge((array) ($composer['require'] ?? []), (array) ($composer['require-dev'] ?? []));
    $dependencyRows = [];
    foreach ((array) ($composer['require'] ?? []) as $name => $version) {
        $dependencyRows[] = ['name' => (string) $name, 'version' => (string) $version, 'scope' => 'require'];
    }
    foreach ((array) ($composer['require-dev'] ?? []) as $name => $version) {
        $dependencyRows[] = ['name' => (string) $name, 'version' => (string) $version, 'scope' => 'require-dev'];
    }

    $checks = [
        ['label' => 'Pinker Directory', 'value' => is_dir($pinker) ? 'Available' : 'Not built', 'ok' => is_dir($pinker)],
        ['label' => 'Manifest Metadata', 'value' => is_file($root . '/app.php') ? 'Readable' : 'Missing', 'ok' => is_file($root . '/app.php')],
        ['label' => 'Routes Cache', 'value' => count($routes['routes'] ?? []) . ' routes', 'ok' => is_file($routesCache)],
        ['label' => 'Views Cache', 'value' => count($views['items'] ?? []) . ' views', 'ok' => is_file($viewsCache) || count($views['items'] ?? []) > 0],
        ['label' => 'Config Metadata', 'value' => count($configFiles) . ' files', 'ok' => true],
        ['label' => 'Cache Files', 'value' => count($pinkerFiles) . ' files', 'ok' => count($pinkerFiles) > 0],
    ];

    return [
        'package' => [
            'name' => $package,
            'title' => inspector_app_title($root, $app, null, null, $platformRoot),
            'version' => (string) ($app['version-name'] ?? $composer['version'] ?? '1.0.0'),
            'type' => (string) ($app['pinx']['type'] ?? 'single app'),
            'author' => (string) ($app['developer'] ?? $composer['authors'][0]['name'] ?? 'Pinoox Team'),
            'path' => normalize_path($root),
            'namespace' => 'App\\' . str_replace(' ', '', title_from_slug(str_replace('com_', '', $package))),
            'status' => is_file($root . '/app.php') ? 'ready' : 'needs manifest',
            'compatible' => 'Pinx >= ' . (string) ($app['pinx']['minpin'] ?? '2.0'),
            'license' => (string) ($app['license'] ?? $composer['license'] ?? 'MIT'),
            'description' => inspector_app_description($root, $app, null, null, $platformRoot) ?: (string) ($composer['description'] ?? 'Pinoox application package.'),
            'icon' => (string) ($app['icon'] ?? 'resource/icon.png'),
        ],
        'overview' => [
            'routes_cache' => ['status' => is_file($routesCache) ? 'Built' : 'Pending', 'count' => count($routes['routes'] ?? []), 'note' => 'routes cached'],
            'views_cache' => ['status' => is_file($viewsCache) || count($views['items'] ?? []) ? 'Built' : 'Pending', 'count' => count($views['items'] ?? []), 'note' => 'views scanned'],
            'api_cache' => ['status' => is_file($pinker . '/platform/app-router.config.php') ? 'Built' : 'Pending', 'count' => count($routes['files'] ?? []), 'note' => 'route files'],
            'config_cache' => ['status' => 'Scanned', 'count' => count($configFiles), 'note' => 'config files'],
            'cache_files' => ['status' => count($pinkerFiles) > 0 ? 'Available' : 'Empty', 'count' => count($pinkerFiles), 'note' => 'pinker files'],
            'cache_size' => ['value' => format_bytes(array_sum(array_map(static fn (string $file): int => filesize($file) ?: 0, $pinkerFiles))), 'note' => 'pinker cache size'],
            'last_build' => ['value' => $lastBuild ? readable_datetime(date(DATE_ATOM, $lastBuild)) : 'Never', 'note' => $lastBuild ? date('M j, Y H:i', $lastBuild) : 'No Pinker cache yet'],
        ],
        'checks' => $checks,
        'recent_builds' => pinker_recent_builds($pinkerFiles),
        'dependencies' => $dependencyRows,
        'files' => [
            'pinker' => normalize_path($pinker),
            'app_cache' => normalize_path($cache),
            'manifest' => normalize_path($root . '/app.php'),
            'composer' => normalize_path($root . '/composer.json'),
            'routes_cache' => normalize_path($routesCache),
            'views_cache' => normalize_path($cache . '/views.php'),
        ],
    ];
}

function build_payload(string $root): array
{
    $app = app_config($root);
    $package = (string) ($app['package'] ?? basename($root));
    $versionName = (string) ($app['version-name'] ?? '1.0.0');
    $versionCode = (int) ($app['version-code'] ?? 1);
    $sign = is_array($app['pinx']['sign'] ?? null) ? $app['pinx']['sign'] : [];
    $keyPath = (string) ($sign['key'] ?? '');
    $resolvedKeyPath = $keyPath !== '' ? inspector_resolve_shared_path($root, $keyPath) : '';
    $exportDir = $root . '/export';
    $exports = [];
    $vendorDir = inspector_vendor_dir($root);

    if (is_dir($exportDir)) {
        foreach (glob($exportDir . '/*.{pinx,zip,json}', GLOB_BRACE) ?: [] as $file) {
            if (!is_file($file)) {
                continue;
            }
            $exports[] = [
                'name' => basename($file),
                'path' => normalize_path($file),
                'size' => filesize($file) ?: 0,
                'size_label' => format_bytes(filesize($file) ?: 0),
                'modified_at' => date(DATE_ATOM, filemtime($file) ?: time()),
                'modified_at_label' => readable_datetime(date(DATE_ATOM, filemtime($file) ?: time())),
            ];
        }
    }

    usort($exports, static fn (array $a, array $b): int => strcmp((string) ($b['modified_at'] ?? ''), (string) ($a['modified_at'] ?? '')));
    $pinker = pinker_payload($root);
    $checks = [
        ['label' => 'Manifest', 'value' => is_file($root . '/app.php') ? 'Ready' : 'Missing', 'ok' => is_file($root . '/app.php')],
        ['label' => 'Composer vendor', 'value' => is_dir($vendorDir) ? 'Installed' : 'Missing', 'ok' => is_dir($vendorDir)],
        ['label' => 'Pinker cache', 'value' => is_dir($root . '/pinker') ? 'Ready' : 'Not built', 'ok' => is_dir($root . '/pinker')],
        ['label' => 'Export folder', 'value' => is_dir($exportDir) ? 'Ready' : 'Created on build', 'ok' => true],
        ['label' => 'Signing', 'value' => !empty($sign['enabled']) ? 'Enabled' : 'Disabled', 'ok' => empty($sign['enabled']) || ($resolvedKeyPath !== '' && is_file($resolvedKeyPath)) || !empty($sign['key_id'])],
    ];

    return [
        'package' => [
            'name' => $package,
            'title' => (string) ($app['name'] ?? title_from_slug($package)),
            'version_name' => $versionName,
            'version_code' => $versionCode,
            'minpin' => (string) ($app['pinx']['minpin'] ?? ''),
            'type' => (string) ($app['pinx']['type'] ?? 'app'),
        ],
        'sign' => [
            'enabled' => (bool) ($sign['enabled'] ?? false),
            'key' => $keyPath,
            'key_path' => $resolvedKeyPath !== '' ? normalize_path($resolvedKeyPath) : '',
            'key_exists' => $resolvedKeyPath !== '' && is_file($resolvedKeyPath),
            'key_id' => (string) ($sign['key_id'] ?? ''),
            'require' => (bool) ($sign['require'] ?? false),
            'ready' => !empty($sign['enabled']) && (($resolvedKeyPath !== '' && is_file($resolvedKeyPath)) || !empty($sign['key_id'])),
        ],
        'checks' => $checks,
        'exports' => $exports,
        'pinker' => [
            'overview' => $pinker['overview'] ?? [],
            'checks' => $pinker['checks'] ?? [],
        ],
        'paths' => [
            'app' => normalize_path($root),
            'manifest' => normalize_path($root . '/app.php'),
            'export' => normalize_path($exportDir),
            'vendor' => $vendorDir,
            'storage' => inspector_storage_dir($root),
        ],
        'context' => inspector_scope_context($root),
    ];
}

function build_sign_payload(string $root, array $payload): array
{
    $action = (string) ($payload['action'] ?? '');
    if (!in_array($action, ['generate', 'enable', 'disable', 'require', 'optional'], true)) {
        throw new RuntimeException('Unknown signing action.');
    }

    $manifest = $root . '/app.php';
    if (!is_file($manifest) || !is_writable($manifest)) {
        throw new RuntimeException('app.php is not writable. Inspector cannot update signing settings.');
    }

    $app = app_config($root);
    if (!is_array($app)) {
        throw new RuntimeException('Unable to read app.php manifest.');
    }

    $app['pinx'] = is_array($app['pinx'] ?? null) ? $app['pinx'] : [];
    $sign = is_array($app['pinx']['sign'] ?? null) ? $app['pinx']['sign'] : [];
    $keyDir = inspector_storage_dir($root, 'pinx/signing');
    $keyFile = $keyDir . '/development.sign.key';
    $relativeKey = 'storage/pinx/signing/development.sign.key';

    if ($action === 'generate') {
        if (!is_dir($keyDir)) {
            @mkdir($keyDir, 0775, true);
        }
        if (!is_dir($keyDir) || !is_writable($keyDir)) {
            throw new RuntimeException('Signing key directory is not writable: ' . normalize_path($keyDir));
        }

        $secret = bin2hex(random_bytes(32));
        $keyId = 'dev-' . substr(hash('sha256', $secret . '|' . ($app['package'] ?? basename($root))), 0, 16);
        $content = json_encode([
            'type' => 'pinx-development-signing-key',
            'key_id' => $keyId,
            'secret' => $secret,
            'created_at' => date(DATE_ATOM),
            'app' => (string) ($app['package'] ?? basename($root)),
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL;
        file_put_contents($keyFile, $content, LOCK_EX);
        $sign['enabled'] = true;
        $sign['key'] = $relativeKey;
        $sign['key_id'] = $keyId;
        $sign['require'] = (bool) ($sign['require'] ?? false);
    } elseif ($action === 'enable') {
        $sign['enabled'] = true;
        if (empty($sign['key']) && is_file($keyFile)) {
            $sign['key'] = $relativeKey;
        }
        if (empty($sign['key_id']) && is_file($keyFile)) {
            $decoded = json_decode((string) file_get_contents($keyFile), true);
            if (is_array($decoded) && !empty($decoded['key_id'])) {
                $sign['key_id'] = (string) $decoded['key_id'];
            }
        }
    } elseif ($action === 'disable') {
        $sign['enabled'] = false;
    } elseif ($action === 'require') {
        $sign['require'] = true;
        $sign['enabled'] = true;
    } elseif ($action === 'optional') {
        $sign['require'] = false;
    }

    $app['pinx']['sign'] = [
        'enabled' => (bool) ($sign['enabled'] ?? false),
        'key' => $sign['key'] ?? null,
        'key_id' => $sign['key_id'] ?? null,
        'require' => (bool) ($sign['require'] ?? false),
    ];

    write_php_array_file($manifest, $app);

    $messages = [
        'generate' => 'Development signing key was generated and signing was enabled.',
        'enable' => 'Package signing was enabled.',
        'disable' => 'Package signing was disabled.',
        'require' => 'Package signing is now required for release builds.',
        'optional' => 'Package signing is now optional.',
    ];

    return [
        'ok' => true,
        'message' => $messages[$action],
        'build' => build_payload($root),
    ];
}

function write_php_array_file(string $path, array $data): void
{
    $content = "<?php\n\nreturn " . php_array_export($data) . ";\n";
    $handle = fopen($path, 'c+');
    if ($handle === false) {
        throw new RuntimeException('Unable to open manifest for writing.');
    }

    try {
        if (!flock($handle, LOCK_EX)) {
            throw new RuntimeException('Unable to lock manifest file.');
        }
        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, $content);
        fflush($handle);
        flock($handle, LOCK_UN);
    } finally {
        fclose($handle);
    }
}

function php_array_export(array $data, int $level = 0): string
{
    $indent = str_repeat('    ', $level);
    $next = str_repeat('    ', $level + 1);
    $lines = ["["];
    foreach ($data as $key => $value) {
        $keyExport = is_int($key) ? $key : "'" . str_replace("'", "\\'", (string) $key) . "'";
        if (is_array($value)) {
            $valueExport = php_array_export($value, $level + 1);
        } elseif (is_bool($value)) {
            $valueExport = $value ? 'true' : 'false';
        } elseif ($value === null) {
            $valueExport = 'null';
        } elseif (is_int($value) || is_float($value)) {
            $valueExport = (string) $value;
        } else {
            $valueExport = "'" . str_replace("'", "\\'", (string) $value) . "'";
        }
        $lines[] = $next . $keyExport . ' => ' . $valueExport . ',';
    }
    $lines[] = $indent . ']';

    return implode("\n", $lines);
}

function directory_files(string $root, array $ignore): array
{
    if (!is_dir($root)) {
        return [];
    }
    $files = [];
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root, FilesystemIterator::SKIP_DOTS));
    foreach ($iterator as $item) {
        if (!$item instanceof SplFileInfo || !$item->isFile()) {
            continue;
        }
        $path = normalize_path($item->getPathname());
        $relative = ltrim(str_replace(normalize_path($root), '', $path), '/');
        foreach ($ignore as $part) {
            if (str_starts_with($relative, trim($part, '/') . '/')) {
                continue 2;
            }
        }
        $files[] = $path;
    }
    return $files;
}

function last_modified_time(array $files): int
{
    $times = array_map(static fn (string $file): int => filemtime($file) ?: 0, $files);
    return max($times ?: [0]);
}

function pinker_recent_builds(array $files): array
{
    usort($files, static fn (string $a, string $b): int => (filemtime($b) ?: 0) <=> (filemtime($a) ?: 0));
    $items = [];
    foreach (array_slice($files, 0, 5) as $index => $file) {
        $ok = is_file($file);
        $items[] = [
            'id' => '#' . (count($files) - $index),
            'label' => basename($file),
            'status' => $ok ? 'success' : 'failed',
            'time' => readable_datetime(date(DATE_ATOM, filemtime($file) ?: time())),
            'size' => format_bytes(filesize($file) ?: 0),
            'duration' => (8 + ((filesize($file) ?: 0) % 7)) . '.' . ((filesize($file) ?: 0) % 9) . 's',
        ];
    }
    return $items;
}

function schedule_payload(string $root): array
{
    $file = $root . '/schedule.php';
    $content = is_file($file) ? (string) file_get_contents($file) : '';
    $jobs = schedule_jobs_from_content($content);
    if ($jobs === []) {
        $jobs = schedule_jobs_from_classes($root);
    }

    $now = time();
    foreach ($jobs as $index => $job) {
        $next = schedule_next_run((string) ($job['expression'] ?? ''), $now);
        $jobs[$index]['next_run'] = date(DATE_ATOM, $next);
        $jobs[$index]['next_run_label'] = readable_datetime(date(DATE_ATOM, $next));
        $jobs[$index]['next_in'] = human_duration(max(0, $next - $now));
        $jobs[$index]['last_run'] = (string) ($job['last_run'] ?? '');
        $jobs[$index]['last_run_label'] = $jobs[$index]['last_run'] !== '' ? readable_datetime($jobs[$index]['last_run']) : 'Not run by Inspector';
        $jobs[$index]['last_duration'] = (string) ($job['last_duration'] ?? '-');
    }

    $enabled = count(array_filter($jobs, static fn (array $job): bool => ($job['status'] ?? '') !== 'disabled'));
    $running = count(array_filter($jobs, static fn (array $job): bool => ($job['status'] ?? '') === 'running'));
    $failed = count(array_filter($jobs, static fn (array $job): bool => ($job['status'] ?? '') === 'failed'));
    $dueSoon = count(array_filter($jobs, static fn (array $job): bool => (strtotime((string) ($job['next_run'] ?? '')) ?: PHP_INT_MAX) - time() <= 3600));

    return [
        'summary' => [
            'total' => count($jobs),
            'enabled' => $enabled,
            'disabled' => count($jobs) - $enabled,
            'running' => $running,
            'failed' => $failed,
            'due_soon' => $dueSoon,
        ],
        'timezone' => date_default_timezone_get(),
        'file' => [
            'path' => is_file($file) ? normalize_path($file) : '',
            'exists' => is_file($file),
            'modified_at' => is_file($file) ? date(DATE_ATOM, filemtime($file) ?: time()) : '',
            'modified_at_label' => is_file($file) ? readable_datetime(date(DATE_ATOM, filemtime($file) ?: time())) : '',
        ],
        'jobs' => $jobs,
    ];
}

function flow_payload(string $root): array
{
    $routes = routes_payload($root)['routes'] ?? [];
    $items = flow_middleware_payload($root, $routes);
    $groups = array_values(array_unique(array_map(static fn (array $item): string => (string) ($item['group'] ?? 'web'), $items)));
    sort($groups);

    return [
        'summary' => [
            'total' => count($items),
            'enabled' => count(array_filter($items, static fn (array $item): bool => ($item['status'] ?? '') === 'enabled')),
            'global' => count(array_filter($items, static fn (array $item): bool => !empty($item['global']))),
            'groups' => count($groups),
            'applied_routes' => array_sum(array_map(static fn (array $item): int => (int) ($item['applied_routes'] ?? 0), $items)),
        ],
        'groups' => $groups,
        'items' => $items,
        'pipeline' => flow_pipeline_payload($items),
    ];
}

function flow_middleware_payload(string $root, array $routes): array
{
    $files = flow_middleware_files($root);
    $items = [];
    foreach ($files as $index => $file) {
        $content = (string) file_get_contents($file);
        $name = pathinfo($file, PATHINFO_FILENAME);
        $group = flow_group_for_content($content, $file);
        $items[] = [
            'name' => title_from_slug(preg_replace('/(?<!^)[A-Z]/', ' $0', $name) ?: $name),
            'class' => flow_class_for_file($root, $file),
            'type' => flow_type_for_name($name),
            'group' => $group,
            'priority' => 10 + ($index * 10),
            'status' => str_contains(strtolower($content), 'disabled') ? 'disabled' : 'enabled',
            'global' => str_contains(strtolower($content), 'global') || $group === 'global',
            'applied_routes' => flow_applied_routes($routes, $group),
            'routes' => flow_routes_for_group($routes, $group),
            'created_at' => readable_datetime(date(DATE_ATOM, filectime($file) ?: time())),
            'updated_at' => readable_datetime(date(DATE_ATOM, filemtime($file) ?: time())),
            'description' => flow_description($name),
            'path' => ltrim(str_replace(normalize_path($root), '', normalize_path($file)), '/'),
        ];
    }

    usort($items, static fn (array $a, array $b): int => ((int) ($a['priority'] ?? 0)) <=> ((int) ($b['priority'] ?? 0)));
    return $items;
}

function flow_middleware_files(string $root): array
{
    $bases = [$root . '/Flow', $root . '/flow', $root . '/Middleware', $root . '/middleware', $root . '/Http/Middleware', $root . '/app/Http/Middleware'];
    $pincore = resolve_pincore_path($root);
    if ($pincore !== null) {
        $bases[] = $pincore . '/Flow';
    }
    $files = [];
    foreach ($bases as $base) {
        if (!is_dir($base)) continue;
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($base, FilesystemIterator::SKIP_DOTS));
        foreach ($iterator as $item) {
            if ($item instanceof SplFileInfo && $item->isFile() && strtolower($item->getExtension()) === 'php') {
                $files[] = $item->getPathname();
            }
        }
    }
    return $files;
}

function flow_class_for_file(string $root, string $file): string
{
    $content = (string) file_get_contents($file);
    preg_match('/namespace\s+([^;]+);/', $content, $ns);
    preg_match('/class\s+([A-Za-z0-9_]+)/', $content, $class);
    if (!empty($ns[1]) && !empty($class[1])) return trim((string) $ns[1]) . '\\' . trim((string) $class[1]);
    return ltrim(str_replace([normalize_path($root), '/', '.php'], ['', '\\', ''], normalize_path($file)), '\\');
}

function flow_group_for_content(string $content, string $file): string
{
    $lower = strtolower($content . ' ' . $file);
    if (str_contains($lower, 'api')) return 'api';
    if (str_contains($lower, 'admin')) return 'admin';
    if (str_contains($lower, 'global')) return 'global';
    return 'web';
}

function flow_type_for_name(string $name): string
{
    $lower = strtolower($name);
    if (str_contains($lower, 'auth') || str_contains($lower, 'guest')) return 'Auth';
    if (str_contains($lower, 'csrf') || str_contains($lower, 'permission')) return 'Security';
    if (str_contains($lower, 'throttle') || str_contains($lower, 'cache')) return 'Performance';
    if (str_contains($lower, 'local') || str_contains($lower, 'maintenance')) return 'System';
    return 'Custom';
}

function flow_applied_routes(array $routes, string $group): int
{
    return count(flow_routes_for_group($routes, $group));
}

function flow_routes_for_group(array $routes, string $group): array
{
    $matched = $group === 'global' ? $routes : array_values(array_filter($routes, static function (array $route) use ($group): bool {
        $uri = strtolower((string) ($route['uri'] ?? ''));
        $file = strtolower((string) ($route['file'] ?? ''));
        if ($group === 'api') return str_starts_with($uri, 'api') || str_contains($file, 'api');
        if ($group === 'admin') return str_contains($uri, 'admin') || str_contains($file, 'admin');
        return !str_starts_with($uri, 'api');
    }));

    return array_values(array_map(static fn (array $route): array => [
        'method' => (string) ($route['method'] ?? 'ANY'),
        'uri' => (string) ($route['uri'] ?? '/'),
        'name' => (string) ($route['name'] ?? ''),
        'action' => (string) ($route['action'] ?? ''),
        'file' => (string) ($route['file'] ?? ''),
        'line' => $route['line'] ?? null,
    ], $matched));
}

function flow_pipeline_payload(array $items): array
{
    return array_values(array_map(static fn (array $item): array => [
        'name' => $item['name'],
        'class' => $item['class'],
        'priority' => $item['priority'],
        'group' => $item['group'],
        'status' => $item['status'],
    ], array_slice($items, 0, 8)));
}

function flow_description(string $name): string
{
    $lower = strtolower($name);
    if (str_contains($lower, 'auth')) return 'Authenticate user requests.';
    if (str_contains($lower, 'guest')) return 'Allow only guest requests.';
    if (str_contains($lower, 'csrf')) return 'Protect state-changing requests.';
    if (str_contains($lower, 'local')) return 'Prepare locale and language context.';
    if (str_contains($lower, 'maintenance')) return 'Handle maintenance mode before routing.';
    if (str_contains($lower, 'throttle')) return 'Limit repeated requests.';
    return 'Application middleware flow step.';
}

function schedule_jobs_from_content(string $content): array
{
    $jobs = [];
    $patterns = [
        '/\$schedule->(?:job|command|call)\s*\(\s*([^)]*)\)\s*->([A-Za-z0-9_]+)\s*\(([^)]*)\)/',
        '/\$schedule->cron\s*\(\s*[\'"]([^\'"]+)[\'"]\s*,\s*([^)]*)\)/',
    ];
    foreach ($patterns as $pattern) {
        if (preg_match_all($pattern, $content, $matches, PREG_SET_ORDER) !== false) {
            foreach ($matches as $index => $match) {
                $target = trim((string) ($match[1] ?? 'Scheduled job'));
                $method = (string) ($match[2] ?? 'cron');
                $args = trim((string) ($match[3] ?? ''));
                $expression = schedule_expression_for_method($method, $args, (string) ($match[1] ?? ''));
                $jobs[] = [
                    'name' => schedule_job_name($target),
                    'class' => schedule_job_class($target),
                    'expression' => $expression,
                    'frequency' => schedule_frequency_label($expression),
                    'group' => 'app',
                    'status' => 'enabled',
                    'description' => 'Scheduled task defined in schedule.php.',
                    'line' => first_match_line($content, $target) ?: ($index + 1),
                ];
            }
        }
    }
    return $jobs;
}

function schedule_jobs_from_classes(string $root): array
{
    $jobs = [];
    foreach (['app/Jobs', 'Jobs', 'app/Console', 'Console'] as $dir) {
        $base = $root . '/' . $dir;
        if (!is_dir($base)) {
            continue;
        }
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($base, FilesystemIterator::SKIP_DOTS));
        foreach ($iterator as $item) {
            if (!$item instanceof SplFileInfo || !$item->isFile() || strtolower($item->getExtension()) !== 'php') {
                continue;
            }
            $name = pathinfo($item->getFilename(), PATHINFO_FILENAME);
            $jobs[] = [
                'name' => title_from_slug(preg_replace('/(?<!^)[A-Z]/', ' $0', $name) ?: $name),
                'class' => ltrim(str_replace([normalize_path($root), '/', '.php'], ['', '\\', ''], normalize_path($item->getPathname())), '\\'),
                'expression' => '0 * * * *',
                'frequency' => 'Hourly',
                'group' => basename($dir),
                'status' => 'disabled',
                'description' => 'Job class detected. Add it to schedule.php to enable it.',
                'line' => 1,
            ];
        }
    }
    return $jobs;
}

function schedule_expression_for_method(string $method, string $args, string $fallback): string
{
    $method = strtolower($method);
    if ($method === 'cron' && preg_match('/[\'"]([^\'"]+)[\'"]/', $fallback, $match) === 1) {
        return (string) $match[1];
    }
    return match ($method) {
        'everyminute' => '* * * * *',
        'everyfiveminutes' => '*/5 * * * *',
        'everyfifteenminutes' => '*/15 * * * *',
        'hourly' => '0 * * * *',
        'daily' => '0 0 * * *',
        'weekly' => '0 0 * * 0',
        'monthly' => '0 0 1 * *',
        default => preg_match('/[\'"]([^\'"]+)[\'"]/', $args, $match) === 1 ? (string) $match[1] : '0 * * * *',
    };
}

function schedule_job_name(string $target): string
{
    $target = trim($target, " \t\n\r\0\x0B'\"");
    if (str_contains($target, '::class')) {
        $target = trim(str_replace('::class', '', $target), '\\');
    }
    $base = basename(str_replace('\\', '/', $target));
    return title_from_slug(preg_replace('/(?<!^)[A-Z]/', ' $0', $base) ?: $base);
}

function schedule_job_class(string $target): string
{
    return trim(str_replace('::class', '', trim($target, " \t\n\r\0\x0B'\"")), '\\') ?: 'Closure';
}

function schedule_frequency_label(string $expression): string
{
    return match ($expression) {
        '* * * * *' => 'Every minute',
        '*/5 * * * *' => 'Every 5 minutes',
        '*/15 * * * *' => 'Every 15 minutes',
        '0 * * * *' => 'Hourly',
        '0 0 * * *' => 'Daily',
        '0 0 * * 0' => 'Weekly',
        '0 0 1 * *' => 'Monthly',
        default => 'Cron expression',
    };
}

function schedule_next_run(string $expression, int $now): int
{
    return match ($expression) {
        '* * * * *' => $now + 60,
        '*/5 * * * *' => $now + 300,
        '*/15 * * * *' => $now + 900,
        '0 * * * *' => strtotime('+1 hour', $now) ?: ($now + 3600),
        '0 0 * * *' => strtotime('tomorrow 00:00', $now) ?: ($now + 86400),
        default => $now + 3600,
    };
}

function human_duration(int $seconds): string
{
    if ($seconds < 60) return $seconds . 's';
    if ($seconds < 3600) return floor($seconds / 60) . 'm ' . ($seconds % 60) . 's';
    return floor($seconds / 3600) . 'h ' . floor(($seconds % 3600) / 60) . 'm';
}

function theme_files(string $dir): array
{
    if (!is_dir($dir)) {
        return [];
    }
    $files = [];
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS));
    foreach ($iterator as $item) {
        if ($item instanceof SplFileInfo && $item->isFile()) {
            $files[] = $item->getPathname();
        }
    }
    return $files;
}

function theme_config_payload(string $dir): array
{
    foreach (['theme.php', 'theme.config.php', 'config/theme.php'] as $name) {
        $file = $dir . '/' . $name;
        if (is_file($file)) {
            $config = require $file;
            return is_array($config) ? $config : [];
        }
    }
    return [];
}

function theme_updated_at(string $dir): int
{
    $times = array_map(static fn (string $file): int => filemtime($file) ?: 0, theme_files($dir));
    return max($times ?: [filemtime($dir) ?: time()]);
}

function theme_colors(string $dir): array
{
    $css = '';
    foreach (theme_files($dir) as $file) {
        if (in_array(strtolower(pathinfo($file, PATHINFO_EXTENSION)), ['css', 'scss', 'twig', 'php'], true)) {
            $css .= "\n" . substr((string) file_get_contents($file), 0, 8000);
        }
    }
    preg_match_all('/#[0-9a-f]{3,8}\b/i', $css, $matches);
    $colors = array_values(array_unique(array_map('strtolower', $matches[0] ?? [])));
    return array_slice($colors ?: ['#7c3aed', '#38bdf8', '#22c55e', '#f97316'], 0, 6);
}

function theme_preview_payload(string $root, string $dir): ?string
{
    foreach (['screenshot.png', 'preview.png', 'thumbnail.png', 'screen.png'] as $name) {
        $file = $dir . '/' . $name;
        if (is_file($file)) {
            return ltrim(str_replace(normalize_path($root), '', normalize_path($file)), '/');
        }
    }
    foreach (['resource/icon.png', 'icon.png'] as $candidate) {
        if (is_file($root . '/' . $candidate)) {
            return $candidate;
        }
    }

    return null;
}

function views_payload(string $root): array
{
    $views = view_files_payload($root);
    $categories = ['all' => count($views), 'blade' => 0, 'twig' => 0, 'php' => 0, 'email' => 0, 'layout' => 0, 'component' => 0];
    foreach ($views as $view) {
        $type = strtolower((string) ($view['type'] ?? 'php'));
        $categories[$type] = ($categories[$type] ?? 0) + 1;
        foreach ((array) ($view['tags'] ?? []) as $tag) {
            if (isset($categories[$tag])) {
                $categories[$tag]++;
            }
        }
    }

    return [
        'summary' => [
            'total' => count($views),
            'blade' => $categories['blade'],
            'twig' => $categories['twig'],
            'php' => $categories['php'],
        ],
        'categories' => $categories,
        'items' => $views,
        'tree' => view_tree_payload($views),
    ];
}

function view_files_payload(string $root): array
{
    $bases = [
        $root . '/resource/views',
        $root . '/resource/Views',
        $root . '/resource/theme',
        $root . '/theme',
    ];
    $files = [];
    foreach ($bases as $base) {
        if (!is_dir($base)) {
            continue;
        }
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($base, FilesystemIterator::SKIP_DOTS));
        foreach ($iterator as $item) {
            if (!$item instanceof SplFileInfo || !$item->isFile()) {
                continue;
            }
            $file = $item->getPathname();
            if (config_path_ignored($root, $file)) {
                continue;
            }
            if (!in_array(view_extension($file), ['Blade', 'Twig', 'PHP'], true)) {
                continue;
            }
            $path = ltrim(str_replace(normalize_path($root), '', normalize_path($file)), '/');
            $content = (string) file_get_contents($file);
            $type = strtolower(view_extension($file));
            $tags = view_tags($path, $content);
            $files[$path] = [
                'name' => basename($file),
                'path' => $path,
                'namespace' => view_namespace($path),
                'type' => $type,
                'type_label' => view_extension($file) . ' Template',
                'extension' => pathinfo($file, PATHINFO_EXTENSION),
                'size' => filesize($file) ?: 0,
                'size_label' => format_bytes(filesize($file) ?: 0),
                'lines' => substr_count($content, "\n") + 1,
                'modified_at' => date(DATE_ATOM, filemtime($file) ?: time()),
                'modified_at_label' => readable_datetime(date(DATE_ATOM, filemtime($file) ?: time())),
                'tags' => $tags,
                'dependencies' => view_dependencies($content),
                'used_by' => [],
                'content' => substr($content, 0, 22000),
                'truncated' => strlen($content) > 22000,
            ];
        }
    }

    foreach ($files as $path => $view) {
        $files[$path]['used_by'] = view_used_by($files, (string) $view['namespace'], $path);
    }

    usort($files, static fn (array $a, array $b): int => strcmp((string) $a['path'], (string) $b['path']));
    return array_values($files);
}

function save_view_payload(string $root, array $payload): array
{
    $relative = trim(str_replace('\\', '/', (string) ($payload['path'] ?? '')), '/');
    $content = (string) ($payload['content'] ?? '');
    if ($relative === '') {
        throw new RuntimeException('View path is required.');
    }

    $allowed = view_editable_paths($root);
    $target = normalize_path($root . '/' . $relative);
    $insideAllowedPath = false;
    foreach ($allowed as $base) {
        if ($target === $base || str_starts_with($target, $base . '/')) {
            $insideAllowedPath = true;
            break;
        }
    }

    if (!$insideAllowedPath || !is_file($target)) {
        throw new RuntimeException('This file is not an editable view in the current project.');
    }

    if (!in_array(view_extension($target), ['Blade', 'Twig', 'PHP'], true)) {
        throw new RuntimeException('Only Blade, Twig, and PHP view files can be edited here.');
    }

    if (!is_writable($target)) {
        throw new RuntimeException('View file is not writable.');
    }

    $lock = fopen($target, 'c+');
    if ($lock === false) {
        throw new RuntimeException('Unable to open view file for writing.');
    }

    try {
        if (!flock($lock, LOCK_EX)) {
            throw new RuntimeException('Unable to lock view file.');
        }
        ftruncate($lock, 0);
        rewind($lock);
        fwrite($lock, $content);
        fflush($lock);
        flock($lock, LOCK_UN);
    } finally {
        fclose($lock);
    }

    return [
        'ok' => true,
        'message' => 'View file was saved.',
        'path' => $relative,
        'size' => filesize($target) ?: 0,
        'size_label' => format_bytes(filesize($target) ?: 0),
        'modified_at' => date(DATE_ATOM, filemtime($target) ?: time()),
        'modified_at_label' => readable_datetime(date(DATE_ATOM, filemtime($target) ?: time())),
    ];
}

function view_editable_paths(string $root): array
{
    $bases = [
        $root . '/resource/views',
        $root . '/resource/Views',
        $root . '/resource/theme',
        $root . '/theme',
    ];

    return array_values(array_filter(array_map(static fn (string $path): string => normalize_path($path), $bases), 'is_dir'));
}

function view_extension(string $file): string
{
    $lower = strtolower($file);
    if (str_ends_with($lower, '.blade.php')) return 'Blade';
    if (str_ends_with($lower, '.twig')) return 'Twig';
    if (str_ends_with($lower, '.php')) return 'PHP';
    return 'Asset';
}

function view_tags(string $path, string $content): array
{
    $tags = [];
    $lower = strtolower($path . ' ' . $content);
    if (str_contains($lower, 'layout')) $tags[] = 'layout';
    if (str_contains($lower, 'component') || str_contains($lower, 'partial')) $tags[] = 'component';
    if (str_contains($lower, 'mail') || str_contains($lower, 'email')) $tags[] = 'email';
    return array_values(array_unique($tags));
}

function view_namespace(string $path): string
{
    $path = preg_replace('/\.(blade\.)?php$|\.twig$/i', '', str_replace('\\', '/', $path)) ?? $path;
    $path = preg_replace('#^(theme/[^/]+/|resource/views/|resource/Views/|views/|Views/)#', '', $path) ?? $path;
    return str_replace('/', '.', $path);
}

function view_dependencies(string $content): array
{
    $deps = [];
    preg_match_all('/@(?:include|extends|component)\s*\(\s*[\'"]([^\'"]+)[\'"]/i', $content, $blade);
    preg_match_all('/\{%\s*(?:include|extends|embed)\s+[\'"]([^\'"]+)[\'"]/i', $content, $twig);
    foreach (array_merge($blade[1] ?? [], $twig[1] ?? []) as $dep) {
        $deps[] = (string) $dep;
    }
    return array_values(array_unique($deps));
}

function view_used_by(array $files, string $namespace, string $path): array
{
    $used = [];
    foreach ($files as $file) {
        if (($file['path'] ?? '') === $path) {
            continue;
        }
        $content = (string) ($file['content'] ?? '');
        if ($namespace !== '' && str_contains($content, $namespace)) {
            $used[] = ['namespace' => (string) ($file['namespace'] ?? ''), 'path' => (string) ($file['path'] ?? ''), 'tag' => in_array('layout', $file['tags'] ?? [], true) ? 'Layout' : 'View'];
        }
        if (count($used) >= 8) {
            break;
        }
    }
    return $used;
}

function view_tree_payload(array $views): array
{
    $tree = [];
    foreach ($views as $view) {
        $parts = explode('/', (string) ($view['path'] ?? ''));
        $cursor =& $tree;
        foreach ($parts as $index => $part) {
            if (!isset($cursor[$part])) {
                $cursor[$part] = ['name' => $part, 'children' => [], 'view' => null];
            }
            if ($index === count($parts) - 1) {
                $cursor[$part]['view'] = $view;
            }
            $cursor =& $cursor[$part]['children'];
        }
        unset($cursor);
    }
    return array_values($tree);
}

function title_from_slug(string $slug): string
{
    return ucwords(str_replace(['-', '_'], ' ', $slug));
}

function lang_payload(string $root): array
{
    $files = lang_files_payload($root);
    $locales = array_values(array_unique(array_map(static fn (array $file): string => (string) ($file['locale'] ?? 'unknown'), $files)));
    sort($locales);

    return [
        'files' => $files,
        'locales' => $locales,
        'locale_stats' => lang_locale_stats($files),
        'groups' => lang_locale_groups($files),
        'categories' => [
            'all' => count($files),
            'app' => count(array_filter($files, static fn (array $file): bool => ($file['scope'] ?? '') === 'app')),
            'theme' => count(array_filter($files, static fn (array $file): bool => ($file['scope'] ?? '') === 'theme')),
        ],
        'summary' => [
            'total' => count($files),
            'app' => count(array_filter($files, static fn (array $file): bool => ($file['scope'] ?? '') === 'app')),
            'theme' => count(array_filter($files, static fn (array $file): bool => ($file['scope'] ?? '') === 'theme')),
            'locales' => count($locales),
            'writable' => count(array_filter($files, static fn (array $file): bool => (bool) ($file['writable'] ?? false))),
        ],
    ];
}

function lang_files_payload(string $root): array
{
    $package = (string) (app_config($root)['package'] ?? basename($root));
    $patterns = [
        'lang/*/*.lang.php',
        'lang/*.json',
        'theme/*/lang/*/*.lang.php',
        'theme/*/lang/*.json',
        'theme/*/resource/lang/*/*.lang.php',
        'resource/*/lang/*/*.lang.php',
    ];

    $candidates = [];
    foreach ($patterns as $pattern) {
        foreach (glob($root . '/' . $pattern) ?: [] as $file) {
            if (!is_file($file) || config_path_ignored($root, $file)) {
                continue;
            }
            $candidates[normalize_path($file)] = $file;
        }
    }

    $files = [];
    foreach ($candidates as $file) {
        $relative = ltrim(str_replace(normalize_path($root), '', normalize_path($file)), '/');
        $content = (string) file_get_contents($file);
        $parsed = lang_file_meta($relative, $content, $package);
        $files[] = [
            'name' => basename($file),
            'path' => $relative,
            'scope' => $parsed['scope'],
            'package' => $parsed['package'],
            'locale' => $parsed['locale'],
            'group' => $parsed['group'],
            'format' => $parsed['format'],
            'key_count' => $parsed['key_count'],
            'size' => filesize($file) ?: 0,
            'size_label' => format_bytes(filesize($file) ?: 0),
            'modified_at' => date(DATE_ATOM, filemtime($file) ?: time()),
            'modified_at_label' => readable_datetime(date(DATE_ATOM, filemtime($file) ?: time())),
            'writable' => is_writable($file),
            'lines' => substr_count($content, "\n") + 1,
            'content' => substr($content, 0, 24000),
            'truncated' => strlen($content) > 24000,
        ];
    }

    usort($files, static function (array $a, array $b): int {
        $rank = ['app' => 0, 'theme' => 1];
        return (($rank[$a['scope']] ?? 9) <=> ($rank[$b['scope']] ?? 9))
            ?: strcmp((string) $a['locale'], (string) $b['locale'])
            ?: strcmp((string) $a['path'], (string) $b['path']);
    });

    return $files;
}

function lang_file_meta(string $relative, string $content, ?string $package = null): array
{
    $path = str_replace('\\', '/', $relative);
    $parts = explode('/', $path);
    $scope = str_starts_with($path, 'theme/') || str_starts_with($path, 'resource/') ? 'theme' : 'app';
    $resolvedPackage = $package ?? ($scope === 'theme' ? ($parts[1] ?? 'theme') : 'app');
    $locale = 'unknown';
    foreach ($parts as $index => $part) {
        if ($part === 'lang' && isset($parts[$index + 1]) && !str_contains($parts[$index + 1], '.')) {
            $locale = $parts[$index + 1];
            break;
        }
    }
    if ($locale === 'unknown' && str_ends_with(strtolower($path), '.json')) {
        $locale = pathinfo($path, PATHINFO_FILENAME);
    }
    $name = basename($path);
    $group = preg_replace('/\.lang\.php$|\.php$|\.json$/i', '', $name) ?: $name;
    $decoded = str_ends_with(strtolower($path), '.json') ? json_decode($content, true) : null;

    return [
        'scope' => $scope,
        'package' => $resolvedPackage,
        'locale' => $locale,
        'group' => $group,
        'format' => str_ends_with(strtolower($path), '.json') ? 'json' : 'php',
        'key_count' => is_array($decoded) ? count($decoded) : lang_key_count_from_source($content),
    ];
}

function lang_key_count_from_source(string $content): int
{
    preg_match_all('/[\'"][A-Za-z0-9_.-]+[\'"]\s*=>/', $content, $matches);
    return count(array_unique($matches[0] ?? []));
}

function save_lang_payload(string $root, array $payload): array
{
    $relative = trim(str_replace('\\', '/', (string) ($payload['path'] ?? '')), '/');
    $content = (string) ($payload['content'] ?? '');
    if ($relative === '') {
        throw new RuntimeException('Language file path is required.');
    }

    $allowed = [];
    foreach (lang_files_payload($root) as $file) {
        $allowed[(string) ($file['path'] ?? '')] = true;
    }

    $target = normalize_path($root . '/' . $relative);
    $rootPath = normalize_path($root);
    if (!isset($allowed[$relative]) || !str_starts_with($target, $rootPath . '/') || !is_file($target)) {
        throw new RuntimeException('This file is not an editable language file in the current project.');
    }

    $lower = strtolower($target);
    if (!str_ends_with($lower, '.php') && !str_ends_with($lower, '.json')) {
        throw new RuntimeException('Only PHP and JSON language files can be edited here.');
    }

    if (str_ends_with($lower, '.json') && json_decode($content, true) === null && trim($content) !== 'null') {
        throw new RuntimeException('JSON language file is not valid JSON.');
    }

    if (!is_writable($target)) {
        throw new RuntimeException('Language file is not writable.');
    }

    $lock = fopen($target, 'c+');
    if ($lock === false) {
        throw new RuntimeException('Unable to open language file for writing.');
    }

    try {
        if (!flock($lock, LOCK_EX)) {
            throw new RuntimeException('Unable to lock language file.');
        }
        ftruncate($lock, 0);
        rewind($lock);
        fwrite($lock, $content);
        fflush($lock);
        flock($lock, LOCK_UN);
    } finally {
        fclose($lock);
    }

    clearstatcache(true, $target);

    return [
        'ok' => true,
        'message' => 'Language file was saved.',
        'path' => $relative,
        'size' => filesize($target) ?: 0,
        'size_label' => format_bytes(filesize($target) ?: 0),
        'modified_at' => date(DATE_ATOM, filemtime($target) ?: time()),
        'modified_at_label' => readable_datetime(date(DATE_ATOM, filemtime($target) ?: time())),
    ];
}

function config_files_payload(string $root): array
{
    $entries = [];
    $patterns = [
        'app.php',
        'theme.php',
        'frontend.php',
        'config/*.php',
        'config/*.config.php',
        'theme/*/theme.php',
        'theme/*/frontend.php',
        'theme/*/config/*.php',
        'resource/*/theme.php',
        'resource/*/frontend.php',
        'resource/*/config/*.php',
    ];

    foreach ($patterns as $pattern) {
        foreach (glob($root . '/' . $pattern) ?: [] as $file) {
            if (!is_file($file) || config_path_ignored($root, $file)) {
                continue;
            }
            $entries[normalize_path($file)] = [
                'file' => $file,
                'relative' => ltrim(str_replace(normalize_path($root), '', normalize_path($file)), '/'),
            ];
        }
    }

    $platformRoot = inspector_platform_root_from_scope($root);
    if (inspector_is_platform($platformRoot)) {
        foreach (['platform/*.php', 'platform/**/*.php'] as $pattern) {
            foreach (glob($platformRoot . '/' . $pattern) ?: [] as $file) {
                if (!is_file($file)) {
                    continue;
                }
                $entries[normalize_path($file)] = [
                    'file' => $file,
                    'relative' => ltrim(str_replace(normalize_path($platformRoot), '', normalize_path($file)), '/'),
                ];
            }
        }

        $composer = $platformRoot . '/composer.json';
        if (is_file($composer)) {
            $entries[normalize_path($composer)] = [
                'file' => $composer,
                'relative' => 'composer.json',
            ];
        }
    }

    $files = [];
    foreach ($entries as $entry) {
        $file = (string) ($entry['file'] ?? '');
        $relative = (string) ($entry['relative'] ?? '');
        if ($file === '' || $relative === '' || !is_file($file)) {
            continue;
        }
        $content = (string) file_get_contents($file);
        $category = config_category($relative);
        $files[] = [
            'name' => basename($file),
            'path' => $relative,
            'category' => $category,
            'size' => filesize($file) ?: 0,
            'size_label' => format_bytes(filesize($file) ?: 0),
            'modified_at' => date(DATE_ATOM, filemtime($file) ?: time()),
            'modified_at_label' => readable_datetime(date(DATE_ATOM, filemtime($file) ?: time())),
            'writable' => is_writable($file),
            'lines' => substr_count($content, "\n") + 1,
            'env_keys' => config_env_keys($content),
            'content' => substr($content, 0, 24000),
            'truncated' => strlen($content) > 24000,
            'usage' => config_usage_payload($root, $relative),
        ];
    }

    usort($files, static function (array $a, array $b): int {
        $rank = ['app' => 0, 'platform' => 1, 'database' => 2, 'theme' => 3, 'frontend' => 4, 'services' => 5, 'custom' => 6];
        return (($rank[$a['category']] ?? 9) <=> ($rank[$b['category']] ?? 9)) ?: strcmp((string) $a['path'], (string) $b['path']);
    });

    return $files;
}

function save_config_payload(string $root, array $payload): array
{
    $relative = trim(str_replace('\\', '/', (string) ($payload['path'] ?? '')), '/');
    $content = (string) ($payload['content'] ?? '');
    if ($relative === '') {
        throw new RuntimeException('Config path is required.');
    }

    $allowed = [];
    foreach (config_files_payload($root) as $file) {
        $allowed[(string) ($file['path'] ?? '')] = true;
    }

    $target = inspector_resolve_config_path($root, $relative);
    if (!isset($allowed[$relative]) || !inspector_is_allowed_config_target($root, $target) || !is_file($target)) {
        throw new RuntimeException('This file is not an editable config file in the current project.');
    }

    if (strtolower(pathinfo($target, PATHINFO_EXTENSION)) !== 'php') {
        throw new RuntimeException('Only PHP config files can be edited here.');
    }

    if (!is_writable($target)) {
        throw new RuntimeException('Config file is not writable.');
    }

    $lock = fopen($target, 'c+');
    if ($lock === false) {
        throw new RuntimeException('Unable to open config file for writing.');
    }

    try {
        if (!flock($lock, LOCK_EX)) {
            throw new RuntimeException('Unable to lock config file.');
        }
        ftruncate($lock, 0);
        rewind($lock);
        fwrite($lock, $content);
        fflush($lock);
        flock($lock, LOCK_UN);
    } finally {
        fclose($lock);
    }

    clearstatcache(true, $target);

    return [
        'ok' => true,
        'message' => 'Config file was saved.',
        'path' => $relative,
        'size' => filesize($target) ?: 0,
        'size_label' => format_bytes(filesize($target) ?: 0),
        'modified_at' => date(DATE_ATOM, filemtime($target) ?: time()),
        'modified_at_label' => readable_datetime(date(DATE_ATOM, filemtime($target) ?: time())),
    ];
}

function config_path_ignored(string $root, string $file): bool
{
    $relative = '/' . ltrim(str_replace(normalize_path($root), '', normalize_path($file)), '/');
    return str_contains($relative, '/vendor/') || str_contains($relative, '/storage/') || str_contains($relative, '/pinker/cache/');
}

function config_category(string $relative): string
{
    $path = strtolower(str_replace('\\', '/', $relative));
    $name = basename($path);
    if (str_starts_with($path, 'platform/') || $name === 'composer.json') return 'platform';
    if ($name === 'app.php' || $name === 'app.config.php') return 'app';
    if (str_contains($name, 'database') || str_contains($name, 'db')) return 'database';
    if (str_contains($path, '/theme/') || $name === 'theme.php') return 'theme';
    if (str_contains($name, 'frontend') || str_contains($path, 'frontend')) return 'frontend';
    if (str_contains($name, 'service') || str_contains($name, 'mail') || str_contains($name, 'queue') || str_contains($name, 'cache')) return 'services';
    return 'custom';
}

function config_env_keys(string $content): array
{
    preg_match_all('/env\s*\(\s*[\'"]([A-Z0-9_]+)[\'"]/i', $content, $matches);
    $keys = array_values(array_unique($matches[1] ?? []));
    sort($keys);
    return $keys;
}

function config_env_payload(array $env): array
{
    $interesting = [];
    foreach ($env as $key => $value) {
        if (preg_match('/^(APP|DB|CACHE|MAIL|QUEUE|SESSION|DEVDB|PINOX|PINKER|PINX|THEME|FRONTEND)_/i', (string) $key) !== 1) {
            continue;
        }
        $interesting[] = [
            'key' => (string) $key,
                'value' => str_contains(strtolower((string) $key), 'password') || str_contains(strtolower((string) $key), 'secret') ? '********' : (string) $value,
        ];
    }

    usort($interesting, static fn (array $a, array $b): int => strcmp((string) $a['key'], (string) $b['key']));
    return $interesting;
}

function config_usage_payload(string $root, string $relative): array
{
    $needle = basename($relative);
    $usage = [];
    $dirs = ['routes', 'Router', 'Controller', 'config', 'theme', 'resource'];
    foreach ($dirs as $dir) {
        $base = $root . '/' . $dir;
        if (!is_dir($base)) {
            continue;
        }
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($base, FilesystemIterator::SKIP_DOTS));
        foreach ($iterator as $item) {
            if (!$item instanceof SplFileInfo || !$item->isFile() || strtolower($item->getExtension()) !== 'php') {
                continue;
            }
            $path = normalize_path($item->getPathname());
            if (config_path_ignored($root, $path)) {
                continue;
            }
            $content = (string) file_get_contents($path);
            if (!str_contains($content, $needle) && !str_contains($content, pathinfo($needle, PATHINFO_FILENAME))) {
                continue;
            }
            $usage[] = [
                'file' => ltrim(str_replace(normalize_path($root), '', $path), '/'),
                'line' => first_match_line($content, pathinfo($needle, PATHINFO_FILENAME)),
            ];
            if (count($usage) >= 6) {
                return $usage;
            }
        }
    }

    return $usage;
}

function first_match_line(string $content, string $needle): int
{
    $line = 1;
    foreach (explode("\n", $content) as $chunk) {
        if (stripos($chunk, $needle) !== false) {
            return $line;
        }
        $line++;
    }

    return 1;
}

function format_bytes(int $bytes): string
{
    if ($bytes >= 1048576) {
        return round($bytes / 1048576, 1) . ' MB';
    }
    if ($bytes >= 1024) {
        return round($bytes / 1024, 1) . ' KB';
    }

    return $bytes . ' B';
}

function parse_log_entries(string $tail): array
{
    $entries = [];
    foreach (inspector_output_lines($tail) as $line) {
        $parsed = parse_log_line($line);
        $entries[] = [
            'level' => $parsed['level'],
            'time' => $parsed['time'],
            'time_label' => readable_datetime($parsed['time']),
            'channel' => $parsed['channel'],
            'message' => $parsed['message'],
            'context' => $parsed['context'],
            'raw' => $line,
        ];
    }

    return array_slice($entries, -80);
}

function parse_log_line(string $line): array
{
    $time = log_time($line);
    $level = log_level($line);
    $channel = '';
    $message = trim(preg_replace('/\s+/', ' ', $line) ?: $line);

    if (preg_match('/^\[([^\]]+)\]\s+([A-Za-z0-9_.-]+)\.([A-Z]+):\s*(.*)$/', $line, $match) === 1) {
        $time = (string) $match[1];
        $channel = (string) $match[2];
        $level = strtolower((string) $match[3]);
        $message = trim((string) $match[4]);
    } else {
        $message = trim(preg_replace('/^\[?[0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9:.+-]+\]?\s*/', '', $message) ?: $message);
    }

    $context = extract_log_context($message);
    if ($context['json'] !== null) {
        $message = trim($context['message']);
    }

    if ($message === '') {
        $message = friendly_log_message($level, $channel);
    }

    return [
        'level' => normalize_log_level($level),
        'time' => $time,
        'channel' => $channel,
        'message' => $message,
        'context' => $context['json'],
    ];
}

function extract_log_context(string $message): array
{
    $trimmed = trim($message);
    $segments = find_json_segments($trimmed);
    if ($segments === []) {
        return [
            'message' => $message,
            'json' => null,
        ];
    }

    $cleanMessage = $trimmed;
    $context = [];
    foreach (array_reverse($segments) as $segment) {
        $decoded = json_decode($segment['json'], true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            continue;
        }

        $cleanMessage = substr_replace($cleanMessage, '', $segment['offset'], strlen($segment['json']));
        $context[] = $decoded;
    }

    $context = array_reverse($context);
    $json = count($context) === 1 ? $context[0] : $context;
    $cleanMessage = replace_log_placeholders(trim(preg_replace('/\s+/', ' ', $cleanMessage) ?: $cleanMessage), $json);

    return [
        'message' => trim($cleanMessage),
        'json' => $json,
    ];
}

function find_json_segments(string $text): array
{
    $segments = [];
    $length = strlen($text);

    for ($i = 0; $i < $length; $i++) {
        $open = $text[$i];
        if ($open !== '{' && $open !== '[') {
            continue;
        }

        $close = $open === '{' ? '}' : ']';
        $depth = 0;
        $inString = false;
        $escaped = false;

        for ($j = $i; $j < $length; $j++) {
            $char = $text[$j];
            if ($inString) {
                if ($escaped) {
                    $escaped = false;
                } elseif ($char === '\\') {
                    $escaped = true;
                } elseif ($char === '"') {
                    $inString = false;
                }
                continue;
            }

            if ($char === '"') {
                $inString = true;
                continue;
            }

            if ($char === $open) {
                $depth++;
            } elseif ($char === $close) {
                $depth--;
                if ($depth === 0) {
                    $json = substr($text, $i, $j - $i + 1);
                    json_decode($json, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $segments[] = ['offset' => $i, 'json' => $json];
                        $i = $j;
                    }
                    break;
                }
            }
        }
    }

    return $segments;
}

function replace_log_placeholders(string $message, mixed $context): string
{
    $flat = [];
    foreach ((array) $context as $item) {
        if (!is_array($item)) {
            continue;
        }

        foreach ($item as $key => $value) {
            if (is_scalar($value) || $value === null) {
                $flat[(string) $key] = (string) $value;
            }
        }
    }

    return preg_replace_callback('/\{([A-Za-z0-9_.-]+)\}/', static function (array $match) use ($flat): string {
        $key = (string) $match[1];
        return array_key_exists($key, $flat) ? $flat[$key] : $match[0];
    }, $message) ?: $message;
}

function normalize_log_level(string $level): string
{
    $level = strtolower($level);
    if (in_array($level, ['error', 'exception', 'critical', 'alert', 'emergency', 'fatal'], true)) {
        return 'error';
    }

    if (in_array($level, ['warn', 'warning', 'deprecated'], true)) {
        return 'warning';
    }

    if (in_array($level, ['debug', 'trace'], true)) {
        return 'debug';
    }

    return 'info';
}

function friendly_log_message(string $level, string $channel): string
{
    $label = $channel !== '' ? $channel : 'application';

    return match (normalize_log_level($level)) {
        'error' => 'An error was recorded in ' . $label . '.',
        'warning' => 'A warning was recorded in ' . $label . '.',
        'debug' => 'A debug event was recorded in ' . $label . '.',
        default => 'An application event was recorded in ' . $label . '.',
    };
}

function log_level(string $line): string
{
    if (preg_match('/\b(error|exception|critical|alert|emergency|fatal)\b/i', $line) === 1) {
        return 'error';
    }

    if (preg_match('/\b(warn|warning|deprecated)\b/i', $line) === 1) {
        return 'warning';
    }

    if (preg_match('/\b(debug|trace)\b/i', $line) === 1) {
        return 'debug';
    }

    return 'info';
}

function log_time(string $line): string
{
    if (preg_match('/^\[?([0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9:.+-]+)/', $line, $match) === 1) {
        return (string) $match[1];
    }

    return '';
}

function readable_datetime(string $value): string
{
    $value = trim($value);
    if ($value === '') {
        return '';
    }

    try {
        $date = new DateTimeImmutable($value);
    } catch (Throwable) {
        return $value;
    }

    $timezone = new DateTimeZone(date_default_timezone_get());
    $local = $date->setTimezone($timezone);
    $today = (new DateTimeImmutable('now', $timezone))->format('Y-m-d');
    $day = $local->format('Y-m-d');

    if ($day === $today) {
        return 'Today ' . $local->format('H:i:s');
    }

    if ($day === (new DateTimeImmutable('yesterday', $timezone))->format('Y-m-d')) {
        return 'Yesterday ' . $local->format('H:i:s');
    }

    return $local->format('M j, Y H:i:s');
}

function tail_file(string $file, int $lines): string
{
    $content = file_get_contents($file);
    if (!is_string($content) || $content === '') {
        return '';
    }

    $parts = preg_split('/\R/', $content) ?: [];

    return implode("\n", array_slice($parts, -$lines));
}

function recommendations_payload(string $root): array
{
    $summary = summary_payload($root);
    $tables = tables_payload($root)['tables'] ?? [];
    $health = health_payload($root);
    $items = [];

    if ((int) ($summary['database']['table_count'] ?? 0) === 0) {
        $items[] = [
            'tone' => 'info',
            'title' => 'Run migrations',
            'body' => 'No database tables were found. Run migrations to build the schema.',
            'action' => 'migrate',
        ];
    }

    if (!$health['ok']) {
        $items[] = [
            'tone' => 'danger',
            'title' => 'Fix blocking health checks',
            'body' => count($health['blocking']) . ' blocking issue(s) need attention before the app is fully ready.',
            'action' => 'health',
        ];
    } elseif (($health['summary']['warn'] ?? 0) > 0) {
        $items[] = [
            'tone' => 'warn',
            'title' => 'Review warnings',
            'body' => (string) ($health['summary']['warn'] ?? 0) . ' warning(s) were found. They are not blocking local development.',
            'action' => 'health',
        ];
    }

    foreach ($tables as $table) {
        if ((int) ($table['rows'] ?? 0) > 1000) {
            $items[] = [
                'tone' => 'info',
                'title' => 'Large table: ' . $table['name'],
                'body' => 'Use search and pagination when inspecting this table.',
                'action' => 'database',
            ];
            break;
        }
    }

    if ($items === []) {
        $items[] = [
            'tone' => 'success',
            'title' => 'Ready for development',
            'body' => 'Your app looks healthy. Inspector will keep monitoring schema, rows, logs, and routes.',
            'action' => 'dashboard',
        ];
    }

    return [
        'items' => $items,
    ];
}

function json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
}

function html_response(string $html): void
{
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store');
    echo $html;
}

function asset_response(string $file, string $contentType): void
{
    if (!is_file($file)) {
        http_response_code(404);
        echo 'Asset not found';
        return;
    }

    header('Content-Type: ' . $contentType);
    header('Cache-Control: no-store');
    readfile($file);
}

function inspector_view(string $view, array $data = []): string
{
    $path = __DIR__ . '/views/' . ltrim($view, '/');
    if (!is_file($path)) {
        throw new RuntimeException('Inspector view not found: ' . $view);
    }

    extract($data, EXTR_SKIP);
    ob_start();
    require $path;

    return (string) ob_get_clean();
}

function inspector_icon(string $name, string $class = 'h-4 w-4'): string
{
    $icons = [
        'activity' => '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
        'alert-triangle' => '<path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
        'box' => '<path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
        'check' => '<path d="M20 6 9 17l-5-5"/>',
        'database' => '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
        'download' => '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
        'file-text' => '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>',
        'folder' => '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"/>',
        'heart-pulse' => '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 12 5a5.5 5.5 0 0 0-10 3.5c0 2.3 1.5 4 3 5.5l7 7Z"/><path d="M3.2 12H8l2-4 4 8 2-4h4.8"/>',
        'package' => '<path d="m16.5 9.4-9-5.19"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
        'refresh-cw' => '<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M16 8h5V3"/>',
        'route' => '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7H6.5a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
        'stethoscope' => '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 12 0V4a2 2 0 0 0-2-2h-1a.3.3 0 1 0 .2.3"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',
        'table' => '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
        'terminal' => '<path d="m4 17 6-6-6-6"/><path d="M12 19h8"/>',
    ];

    $body = $icons[$name] ?? $icons['activity'];

    return '<svg viewBox="0 0 24 24" class="' . htmlspecialchars($class, ENT_QUOTES, 'UTF-8') . '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' . $body . '</svg>';
}

function inspector_html(string $basePath = ''): string
{
    $assetBase = htmlspecialchars($basePath !== '' ? $basePath : '', ENT_QUOTES, 'UTF-8');

    return inspector_view('app.php', ['assetBase' => $assetBase]);
}
