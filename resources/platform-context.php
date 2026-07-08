<?php

declare(strict_types=1);

function inspector_is_platform(string $root): bool
{
    $root = normalize_path($root);

    return is_dir($root . '/apps') && !is_file($root . '/app.php');
}

function inspector_is_serve_locked(string $platformRoot): bool
{
    $platformRoot = normalize_path($platformRoot);

    if (!inspector_is_platform($platformRoot)) {
        return true;
    }

    $binding = inspector_env_value('PINOOX_SERVE_APP');

    if ($binding === '' || strtolower($binding) === 'platform') {
        return false;
    }

    return inspector_resolve_package_alias($platformRoot, $binding) !== null;
}

function inspector_locked_package(string $platformRoot): ?string
{
    $platformRoot = normalize_path($platformRoot);

    if (!inspector_is_platform($platformRoot)) {
        return inspector_app_package($platformRoot, $platformRoot);
    }

    if (!inspector_is_serve_locked($platformRoot)) {
        return null;
    }

    foreach ([
        inspector_env_value('PINOOX_SERVE_APP'),
        inspector_env_value('PINX_INSPECTOR_PACKAGE'),
        inspector_env_value('PINX_INSPECTOR_DEFAULT_PACKAGE'),
        inspector_env_value('PINOOX_DEV_APP'),
        inspector_env_value('PINX_PACKAGE'),
    ] as $candidate) {
        if ($candidate === '' || strtolower($candidate) === 'platform') {
            continue;
        }

        $resolved = inspector_resolve_package_alias($platformRoot, $candidate);

        if ($resolved !== null) {
            return $resolved;
        }
    }

    $fromPincore = inspector_pincore_dev_package($platformRoot);

    return $fromPincore !== null && inspector_validate_package($platformRoot, $fromPincore) !== null
        ? $fromPincore
        : null;
}

function inspector_app_list_item(string $platformRoot, string $package): ?array
{
    $platformRoot = normalize_path($platformRoot);

    foreach (inspector_list_apps($platformRoot) as $app) {
        if ((string) ($app['package'] ?? '') === $package) {
            return $app;
        }
    }

    $appRoot = inspector_app_root_for_package($platformRoot, $package);

    if (!is_file($appRoot . '/app.php')) {
        return null;
    }

    $config = app_config($appRoot);
    $router = inspector_app_router_map($platformRoot);

    return [
        'package' => $package,
        'name' => inspector_app_display_name($appRoot, $config, null, null, $platformRoot),
        'title' => inspector_app_title($appRoot, $config, null, null, $platformRoot),
        'theme' => (string) ($config['theme'] ?? 'default'),
        'enabled' => (bool) ($config['enable'] ?? true),
        'version_name' => (string) ($config['version-name'] ?? '1.0.0'),
        'mount' => inspector_app_mount($package, $router),
        'path' => str_starts_with($appRoot, $platformRoot . '/apps/')
            ? 'apps/' . $package
            : ltrim(substr($appRoot, strlen($platformRoot)), '/'),
    ];
}

function inspector_visible_apps(string $platformRoot): array
{
    $platformRoot = normalize_path($platformRoot);

    if (!inspector_is_platform($platformRoot)) {
        return [];
    }

    if (!inspector_is_serve_locked($platformRoot)) {
        return inspector_list_apps($platformRoot);
    }

    $lockedPackage = inspector_locked_package($platformRoot);

    if ($lockedPackage === null) {
        return [];
    }

    $item = inspector_app_list_item($platformRoot, $lockedPackage);

    return $item !== null ? [$item] : [];
}

function inspector_platform_root_from_scope(string $scopeRoot): string
{
    $scopeRoot = normalize_path($scopeRoot);

    if (basename(dirname($scopeRoot)) === 'apps') {
        return normalize_path(dirname(dirname($scopeRoot)));
    }

    return $scopeRoot;
}

function inspector_env_root(string $scopeRoot): string
{
    $scopeRoot = normalize_path($scopeRoot);

    if (is_file($scopeRoot . '/.env')) {
        return $scopeRoot;
    }

    $platformRoot = inspector_platform_root_from_scope($scopeRoot);

    if (is_file($platformRoot . '/.env')) {
        return $platformRoot;
    }

    return $scopeRoot;
}

function inspector_list_apps(string $platformRoot): array
{
    $platformRoot = normalize_path($platformRoot);
    $appsDir = $platformRoot . '/apps';

    if (!is_dir($appsDir)) {
        return [];
    }

    $router = inspector_app_router_map($platformRoot);
    $items = [];

    foreach (glob($appsDir . '/*', GLOB_ONLYDIR) ?: [] as $dir) {
        $package = basename($dir);
        $manifest = $dir . '/app.php';

        if (!is_file($manifest)) {
            continue;
        }

        $config = require $manifest;

        if (!is_array($config)) {
            continue;
        }

        $mount = inspector_app_mount($package, $router);
        $displayName = inspector_app_display_name($dir, $config, null, null, $platformRoot);
        $items[] = [
            'package' => $package,
            'name' => $displayName,
            'title' => inspector_app_title($dir, $config, null, null, $platformRoot),
            'theme' => (string) ($config['theme'] ?? 'default'),
            'enabled' => (bool) ($config['enable'] ?? true),
            'version_name' => (string) ($config['version-name'] ?? '1.0.0'),
            'mount' => $mount,
            'path' => 'apps/' . $package,
        ];
    }

    usort($items, static fn (array $a, array $b): int => strcmp((string) $a['package'], (string) $b['package']));

    return $items;
}

function inspector_app_router_map(string $platformRoot): array
{
    $candidates = [
        $platformRoot . '/platform/app-router.config.php',
        $platformRoot . '/pinker/platform/app-router.config.php',
        $platformRoot . '/config/app-router.config.php',
    ];

    foreach ($candidates as $file) {
        if (!is_file($file)) {
            continue;
        }

        $routes = require $file;

        if (!is_array($routes)) {
            continue;
        }

        $map = [];

        foreach ($routes as $path => $package) {
            if (!is_string($path) || !is_string($package) || $package === '') {
                continue;
            }

            $map[$package] = $path === '' ? '/' : $path;
        }

        return $map;
    }

    return [];
}

function inspector_app_mount(string $package, array $router): string
{
    if (isset($router[$package])) {
        $mount = (string) $router[$package];

        return $mount === '' ? '/' : $mount;
    }

    foreach ($router as $path => $mappedPackage) {
        if ($mappedPackage === $package) {
            return $path === '' ? '/' : (string) $path;
        }
    }

    return '/';
}

function inspector_env_value(string $key): string
{
    foreach ([$_SERVER[$key] ?? null, $_ENV[$key] ?? null, getenv($key)] as $value) {
        if (is_string($value) && trim($value) !== '') {
            return trim($value);
        }
    }

    return '';
}

function inspector_parse_package_binding(string $value): ?string
{
    $value = trim($value);

    if ($value === '') {
        return null;
    }

    if (str_contains($value, '@')) {
        [$package] = explode('@', $value, 2);
        $package = trim($package);

        if ($package !== '' && !str_contains($package, '/')) {
            return $package;
        }
    }

    if (preg_match('/^com_[a-z0-9_]+$/i', $value) === 1) {
        return $value;
    }

    return null;
}

function inspector_bootstrap_pincore(string $platformRoot): bool
{
    static $booted = [];

    $platformRoot = normalize_path($platformRoot);

    if (isset($booted[$platformRoot])) {
        return $booted[$platformRoot];
    }

    $autoload = $platformRoot . '/vendor/autoload.php';

    if (!is_file($autoload)) {
        return $booted[$platformRoot] = false;
    }

    require_once $autoload;

    return $booted[$platformRoot] = true;
}

function inspector_pincore_dev_package(string $platformRoot): ?string
{
    if (!inspector_bootstrap_pincore($platformRoot) || !class_exists(\Pinoox\Support\DevApp::class)) {
        return null;
    }

    $package = \Pinoox\Support\DevApp::package($platformRoot);

    return is_string($package) && $package !== '' ? $package : null;
}

function inspector_pincore_app_path(string $platformRoot, string $package): ?string
{
    if (!inspector_bootstrap_pincore($platformRoot)) {
        return null;
    }

    if (class_exists(\Pinoox\Portal\App\AppEngine::class)) {
        try {
            if (\Pinoox\Portal\App\AppEngine::exists($package)) {
                return normalize_path(\Pinoox\Portal\App\AppEngine::path($package));
            }
        } catch (Throwable) {
        }
    }

    $appRoot = normalize_path($platformRoot . '/apps/' . $package);

    return is_file($appRoot . '/app.php') ? $appRoot : null;
}

function inspector_request_package(string $platformRoot): ?string
{
    $package = trim((string) ($_GET['package'] ?? $_SERVER['HTTP_X_PINX_APP'] ?? ''));

    if ($package !== '') {
        return inspector_validate_package($platformRoot, $package);
    }

    return null;
}

function inspector_default_package(string $platformRoot): ?string
{
    foreach ([
        inspector_env_value('PINX_INSPECTOR_DEFAULT_PACKAGE'),
        inspector_env_value('PINX_INSPECTOR_PACKAGE'),
        inspector_env_value('PINOOX_SERVE_APP'),
        inspector_env_value('SERVER_APP'),
        inspector_env_value('PINOOX_DEV_APP'),
        inspector_env_value('PINX_PACKAGE'),
        inspector_env_value('PINOOX_CLI_PACKAGE'),
    ] as $candidate) {
        if ($candidate === '') {
            continue;
        }

        $resolved = inspector_resolve_package_alias($platformRoot, $candidate);

        if ($resolved !== null) {
            return $resolved;
        }
    }

    $fromPincore = inspector_pincore_dev_package($platformRoot);

    if ($fromPincore !== null && inspector_validate_package($platformRoot, $fromPincore) !== null) {
        return $fromPincore;
    }

    foreach (inspector_list_apps($platformRoot) as $app) {
        if (($app['enabled'] ?? true) === true) {
            return (string) $app['package'];
        }
    }

    $apps = inspector_list_apps($platformRoot);

    return isset($apps[0]['package']) ? (string) $apps[0]['package'] : null;
}

function inspector_resolve_package_alias(string $platformRoot, string $candidate): ?string
{
    $candidate = trim($candidate);

    if ($candidate === '') {
        return null;
    }

    $bindingPackage = inspector_parse_package_binding($candidate);

    if ($bindingPackage !== null && inspector_validate_package($platformRoot, $bindingPackage) !== null) {
        return $bindingPackage;
    }

    if (inspector_validate_package($platformRoot, $candidate) !== null) {
        return $candidate;
    }

    $router = inspector_app_router_map($platformRoot);
    $needle = strtolower(ltrim($candidate, '/'));

    foreach (inspector_list_apps($platformRoot) as $app) {
        $package = (string) $app['package'];
        $aliases = [
            strtolower($package),
            strtolower((string) ($app['name'] ?? '')),
            strtolower(ltrim((string) ($app['mount'] ?? '/'), '/')),
        ];

        if (in_array($needle, array_filter($aliases), true)) {
            return $package;
        }
    }

    foreach ($router as $path => $package) {
        if (strtolower(ltrim((string) $path, '/')) === $needle) {
            return inspector_validate_package($platformRoot, (string) $package);
        }
    }

    return null;
}

function inspector_validate_package(string $platformRoot, string $package): ?string
{
    $package = trim($package);

    if ($package === '' || str_contains($package, '..') || str_contains($package, '/')) {
        return null;
    }

    $platformRoot = normalize_path($platformRoot);
    $manifest = $platformRoot . '/apps/' . $package . '/app.php';

    if (is_file($manifest)) {
        return $package;
    }

    if (is_file($platformRoot . '/app.php')) {
        $config = app_config($platformRoot);

        if ((string) ($config['package'] ?? '') === $package) {
            return $package;
        }
    }

    $enginePath = inspector_pincore_app_path($platformRoot, $package);

    return $enginePath !== null ? $package : null;
}

function inspector_app_root_for_package(string $platformRoot, string $package): string
{
    $platformRoot = normalize_path($platformRoot);
    $appsRoot = $platformRoot . '/apps/' . $package;

    if (is_file($appsRoot . '/app.php')) {
        return normalize_path($appsRoot);
    }

    if (is_file($platformRoot . '/app.php')) {
        $config = app_config($platformRoot);

        if ((string) ($config['package'] ?? '') === $package) {
            return $platformRoot;
        }
    }

    $enginePath = inspector_pincore_app_path($platformRoot, $package);

    if ($enginePath !== null) {
        return $enginePath;
    }

    return normalize_path($appsRoot);
}

function inspector_app_package(string $scopeRoot, ?string $platformRoot = null): ?string
{
    $scopeRoot = normalize_path($scopeRoot);
    $platformRoot = normalize_path($platformRoot ?? inspector_platform_root_from_scope($scopeRoot));
    $config = app_config($scopeRoot);
    $package = trim((string) ($config['package'] ?? ''));

    if ($package !== '') {
        return $package;
    }

    if (basename(dirname($scopeRoot)) === 'apps') {
        return basename($scopeRoot);
    }

    if (inspector_is_platform($platformRoot)) {
        return inspector_active_package($platformRoot);
    }

    $folder = basename($scopeRoot);

    return $folder !== '' ? $folder : null;
}

function inspector_active_package(string $platformRoot): ?string
{
    if (inspector_is_serve_locked($platformRoot)) {
        return inspector_locked_package($platformRoot);
    }

    return inspector_request_package($platformRoot) ?? inspector_default_package($platformRoot);
}

function inspector_scope_root(string $platformRoot): string
{
    $platformRoot = normalize_path($platformRoot);

    if (basename(dirname($platformRoot)) === 'apps' && is_file($platformRoot . '/app.php')) {
        return $platformRoot;
    }

    if (!inspector_is_platform($platformRoot)) {
        return $platformRoot;
    }

    $package = inspector_active_package($platformRoot);

    if ($package === null) {
        return $platformRoot;
    }

    return inspector_app_root_for_package($platformRoot, $package);
}

/**
 * @return array{cli: list<string>, cwd: string, inject_package: bool}
 */
function inspector_resolve_cli(string $platformRoot, ?string $package = null): array
{
    $platformRoot = normalize_path($platformRoot);
    $scopeRoot = inspector_scope_root($platformRoot);
    $candidates = [
        ['script' => $platformRoot . '/pinoox', 'cwd' => $platformRoot, 'inject_package' => true],
        ['script' => $platformRoot . '/bin/pinx', 'cwd' => $platformRoot, 'inject_package' => false],
        ['script' => $scopeRoot . '/bin/pinx', 'cwd' => $scopeRoot, 'inject_package' => false],
        ['script' => $scopeRoot . '/pinoox', 'cwd' => $scopeRoot, 'inject_package' => true],
    ];

    foreach ($candidates as $candidate) {
        if (!is_file($candidate['script'])) {
            continue;
        }

        return [
            'cli' => [PHP_BINARY, $candidate['script']],
            'cwd' => $candidate['cwd'],
            'inject_package' => $candidate['inject_package'] && basename($candidate['script']) === 'pinoox',
        ];
    }

    throw new RuntimeException('Project CLI was not found (pinoox or bin/pinx).');
}

function inspector_logs_dir(string $scopeRoot): string
{
    $scopeRoot = normalize_path($scopeRoot);
    $platformRoot = inspector_platform_root_from_scope($scopeRoot);
    $candidates = [
        $platformRoot . '/storage/logs',
        $scopeRoot . '/storage/logs',
    ];

    foreach ($candidates as $dir) {
        if (is_dir($dir)) {
            return normalize_path($dir);
        }
    }

    return normalize_path($platformRoot . '/storage/logs');
}

function inspector_env_file_path(string $scopeRoot): string
{
    return normalize_path(inspector_env_root($scopeRoot) . '/.env');
}

function inspector_storage_dir(string $scopeRoot, string $relative = ''): string
{
    $scopeRoot = normalize_path($scopeRoot);
    $platformRoot = inspector_platform_root_from_scope($scopeRoot);
    $base = is_dir($platformRoot . '/storage') ? $platformRoot . '/storage' : $scopeRoot . '/storage';
    $base = normalize_path($base);

    if ($relative === '') {
        return $base;
    }

    return normalize_path($base . '/' . trim(str_replace('\\', '/', $relative), '/'));
}

function inspector_vendor_dir(string $scopeRoot): string
{
    $platformRoot = inspector_platform_root_from_scope($scopeRoot);

    if (is_dir($platformRoot . '/vendor')) {
        return normalize_path($platformRoot . '/vendor');
    }

    if (is_dir($scopeRoot . '/vendor')) {
        return normalize_path($scopeRoot . '/vendor');
    }

    return normalize_path($platformRoot . '/vendor');
}

function inspector_resolve_shared_path(string $scopeRoot, string $relative): string
{
    return resolve_project_path(inspector_platform_root_from_scope($scopeRoot), $relative);
}

function inspector_resolve_config_path(string $scopeRoot, string $relative): string
{
    $relative = trim(str_replace('\\', '/', $relative), '/');
    $platformRoot = inspector_platform_root_from_scope($scopeRoot);

    if ($relative !== '' && inspector_is_platform($platformRoot)) {
        if (str_starts_with($relative, 'platform/')) {
            return normalize_path($platformRoot . '/' . $relative);
        }

        if ($relative === 'composer.json' && is_file($platformRoot . '/composer.json')) {
            return normalize_path($platformRoot . '/composer.json');
        }
    }

    return normalize_path($scopeRoot . '/' . $relative);
}

function inspector_is_allowed_config_target(string $scopeRoot, string $target): bool
{
    $scopeRoot = normalize_path($scopeRoot);
    $platformRoot = inspector_platform_root_from_scope($scopeRoot);
    $target = normalize_path($target);

    if (str_starts_with($target, $scopeRoot . '/')) {
        return true;
    }

    return inspector_is_platform($platformRoot) && str_starts_with($target, $platformRoot . '/');
}

function inspector_scope_context(string $scopeRoot, ?string $platformRoot = null): array
{
    $platformRoot = normalize_path($platformRoot ?? inspector_platform_root_from_scope($scopeRoot));
    $config = app_config($scopeRoot);

    return [
        'app_root' => normalize_path($scopeRoot),
        'platform_root' => $platformRoot,
        'is_platform' => inspector_is_platform($platformRoot),
        'package' => (string) (inspector_app_package($scopeRoot, $platformRoot) ?? basename($scopeRoot)),
        'logs_dir' => inspector_logs_dir($scopeRoot),
        'env_file' => inspector_env_file_path($scopeRoot),
        'storage_dir' => inspector_storage_dir($scopeRoot),
        'vendor_dir' => inspector_vendor_dir($scopeRoot),
    ];
}

function apps_payload(string $platformRoot): array
{
    $platformRoot = normalize_path($platformRoot);
    $isPlatform = inspector_is_platform($platformRoot);
    $locked = inspector_is_serve_locked($platformRoot);
    $scopeRoot = inspector_scope_root($platformRoot);
    $active = $locked
        ? inspector_locked_package($platformRoot)
        : ($isPlatform ? inspector_active_package($platformRoot) : inspector_app_package($scopeRoot, $platformRoot));
    $items = inspector_visible_apps($platformRoot);
    $router = $isPlatform && !$locked ? inspector_app_router_map($platformRoot) : [];

    return [
        'platform' => $isPlatform,
        'locked' => $locked,
        'selectable' => $isPlatform && !$locked && count($items) > 1,
        'active' => $active,
        'default' => $active,
        'router' => $router,
        'items' => $items,
    ];
}
