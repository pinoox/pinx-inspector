<?php

declare(strict_types=1);

function inspector_is_platform(string $root): bool
{
    $root = normalize_path($root);

    return is_dir($root . '/apps') && !is_file($root . '/app.php');
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
        $items[] = [
            'package' => $package,
            'name' => (string) ($config['name'] ?? $config['title'] ?? $package),
            'title' => (string) ($config['title'] ?? $config['name'] ?? $package),
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
        (string) (getenv('PINX_INSPECTOR_DEFAULT_PACKAGE') ?: ''),
        (string) (getenv('PINX_INSPECTOR_PACKAGE') ?: ''),
        (string) (getenv('PINOOX_SERVE_APP') ?: ''),
        (string) (getenv('SERVER_APP') ?: ''),
        (string) (getenv('PINOOX_DEV_APP') ?: ''),
        (string) (getenv('PINX_PACKAGE') ?: ''),
    ] as $candidate) {
        $candidate = trim($candidate);

        if ($candidate === '') {
            continue;
        }

        $resolved = inspector_resolve_package_alias($platformRoot, $candidate);

        if ($resolved !== null) {
            return $resolved;
        }
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

    $manifest = normalize_path($platformRoot) . '/apps/' . $package . '/app.php';

    return is_file($manifest) ? $package : null;
}

function inspector_active_package(string $platformRoot): ?string
{
    return inspector_request_package($platformRoot) ?? inspector_default_package($platformRoot);
}

function inspector_scope_root(string $platformRoot): string
{
    $platformRoot = normalize_path($platformRoot);

    if (!inspector_is_platform($platformRoot)) {
        return $platformRoot;
    }

    $package = inspector_active_package($platformRoot);

    if ($package === null) {
        return $platformRoot;
    }

    return $platformRoot . '/apps/' . $package;
}

function apps_payload(string $platformRoot): array
{
    $platformRoot = normalize_path($platformRoot);
    $isPlatform = inspector_is_platform($platformRoot);
    $active = $isPlatform ? inspector_active_package($platformRoot) : null;
    $router = $isPlatform ? inspector_app_router_map($platformRoot) : [];

    return [
        'platform' => $isPlatform,
        'active' => $active,
        'default' => $isPlatform ? inspector_default_package($platformRoot) : null,
        'router' => $router,
        'items' => $isPlatform ? inspector_list_apps($platformRoot) : [],
    ];
}
