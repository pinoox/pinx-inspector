<?php

declare(strict_types=1);

function inspector_health_check(
    string $group,
    string $id,
    string $label,
    string $status,
    string $detail = '',
    ?string $hint = null,
    bool $scored = true,
): array {
    return [
        'group' => $group,
        'id' => $id,
        'label' => $label,
        'status' => $status,
        'detail' => $detail,
        'hint' => $hint,
        'scored' => $scored,
    ];
}

function inspector_health_report_from_checks(array $checks, array $appMeta = []): array
{
    $pass = 0;
    $warn = 0;
    $fail = 0;
    $total = 0.0;
    $earned = 0.0;
    $fixes = [];

    foreach ($checks as $check) {
        $status = (string) ($check['status'] ?? 'fail');
        if ($status === 'pass') {
            $pass++;
        } elseif ($status === 'warn') {
            $warn++;
        } else {
            $fail++;
        }

        if (($check['scored'] ?? true) === true) {
            $total += 1.0;
            $earned += match ($status) {
                'pass' => 1.0,
                'warn' => 0.5,
                default => 0.0,
            };
        }

        $hint = (string) ($check['hint'] ?? '');
        if ($hint !== '' && ($status === 'fail' || $status === 'warn')) {
            $fixes[] = $hint;
        }
    }

    $score = $total > 0.0 ? (int) round(($earned / $total) * 100) : 0;

    return [
        'healthy' => $fail === 0,
        'score' => $score,
        'summary' => [
            'pass' => $pass,
            'warn' => $warn,
            'fail' => $fail,
        ],
        'app' => $appMeta,
        'checks' => array_map(static function (array $check): array {
            unset($check['scored']);

            return $check;
        }, $checks),
        'fixes' => array_values(array_unique($fixes)),
    ];
}

function inspector_native_doctor_report(string $scopeRoot, ?string $platformRoot = null): array
{
    $scopeRoot = normalize_path($scopeRoot);
    $platformRoot = normalize_path($platformRoot ?? inspector_platform_root_from_scope($scopeRoot));
    $isPlatform = inspector_is_platform($platformRoot);
    $context = inspector_scope_context($scopeRoot, $platformRoot);
    $config = app_config($scopeRoot);
    $package = (string) ($config['package'] ?? basename($scopeRoot));
    $checks = [];

    $checks[] = inspector_health_check(
        'Project',
        'project_context',
        $isPlatform ? 'Platform project' : 'Application project',
        $isPlatform || is_file($scopeRoot . '/app.php') ? 'pass' : 'fail',
        $isPlatform ? $platformRoot : $scopeRoot,
        $isPlatform ? null : 'app.php was not found in the project root',
    );

    if ($isPlatform) {
        $checks[] = inspector_health_check(
            'Platform',
            'apps_directory',
            'Apps directory',
            is_dir($platformRoot . '/apps') ? 'pass' : 'fail',
            'apps/',
            'Create apps/ and install at least one HMVC app',
        );
        $checks[] = inspector_health_check(
            'Platform',
            'platform_config',
            'Platform config',
            is_dir($platformRoot . '/platform') ? 'pass' : 'warn',
            'platform/',
            'Add platform/*.config.php for routing and domain setup',
        );
    }

    $manifest = $scopeRoot . '/app.php';
    $checks[] = inspector_health_check(
        'App',
        'manifest',
        'App manifest',
        is_file($manifest) ? 'pass' : 'fail',
        is_file($manifest) ? 'app.php' : 'Missing app.php',
        'Create or restore apps/' . $package . '/app.php',
    );

    if (is_file($manifest)) {
        $folderPackage = basename($scopeRoot);
        $checks[] = inspector_health_check(
            'App',
            'package_identity',
            'Package identity',
            $package === $folderPackage ? 'pass' : 'warn',
            $package . ' / ' . $folderPackage,
            'Keep app.php package key aligned with the apps/{package} folder name',
        );
        $checks[] = inspector_health_check(
            'App',
            'app_enabled',
            'App enabled',
            ($config['enable'] ?? true) ? 'pass' : 'warn',
            ($config['enable'] ?? true) ? 'enabled' : 'disabled in app.php',
            'Set enable => true when this app should be served',
        );

        $theme = (string) ($config['theme'] ?? 'default');
        $themeDir = $scopeRoot . '/theme/' . $theme;
        $checks[] = inspector_health_check(
            'App',
            'theme',
            'Active theme',
            is_dir($themeDir) ? 'pass' : 'warn',
            'theme/' . $theme,
            'Create theme/' . $theme . ' or update the theme key in app.php',
        );
    }

    $checks[] = inspector_health_check(
        'PHP',
        'php_version',
        'PHP version',
        version_compare(PHP_VERSION, '8.2.0', '>=') ? 'pass' : 'fail',
        PHP_VERSION . ' (required 8.2.0+)',
        'Upgrade PHP to 8.2 or newer',
    );

    foreach ([
        'mbstring' => 'Unicode string handling',
        'json' => 'API and config parsing',
        'pdo' => 'Database access',
        'zip' => 'Package build/extract',
    ] as $ext => $why) {
        $checks[] = inspector_health_check(
            'PHP',
            'ext_' . $ext,
            'ext-' . $ext,
            extension_loaded($ext) ? 'pass' : 'fail',
            $why,
            'Enable the ' . $ext . ' PHP extension',
        );
    }

    $envFile = inspector_env_file_path($scopeRoot);
    $checks[] = inspector_health_check(
        'Environment',
        'env_file',
        '.env file',
        is_file($envFile) ? 'pass' : 'warn',
        is_file($envFile) ? basename(dirname($envFile)) . '/.env' : 'Not found (defaults may still work)',
        'Create a short .env in the platform root for local overrides',
    );

    $connection = connection_config($scopeRoot);
    $checks[] = inspector_health_check(
        'Environment',
        'db_connection',
        'DB connection',
        'pass',
        (string) ($connection['connection'] ?? 'devdb'),
        null,
        false,
    );

    $vendorDir = inspector_vendor_dir($scopeRoot);
    $checks[] = inspector_health_check(
        'Dependencies',
        'vendor',
        'Composer vendor',
        is_dir($vendorDir) ? 'pass' : 'fail',
        $vendorDir,
        'Run composer install in the platform root',
    );
    $checks[] = inspector_health_check(
        'Dependencies',
        'composer',
        'composer.json',
        is_file($platformRoot . '/composer.json') ? 'pass' : 'warn',
        'composer.json',
        'Restore composer.json in the platform root',
    );

    $storageDir = inspector_storage_dir($scopeRoot);
    $checks[] = inspector_health_check(
        'Storage',
        'storage_writable',
        'Storage writable',
        is_dir($storageDir) && is_writable($storageDir) ? 'pass' : (is_dir($storageDir) ? 'fail' : 'warn'),
        $storageDir,
        'Ensure storage/ exists and is writable by the web/CLI user',
    );

    try {
        $dbEngine = engine($scopeRoot);
        $tableCount = count(tables_payload($scopeRoot)['tables'] ?? []);
        $checks[] = inspector_health_check(
            'Database',
            'db_connect',
            'Database connectivity',
            'pass',
            engine_label($dbEngine) . ' / ' . $tableCount . ' table(s)',
        );
    } catch (Throwable $e) {
        $checks[] = inspector_health_check(
            'Database',
            'db_connect',
            'Database connectivity',
            'fail',
            $e->getMessage(),
            'Review DB_* and DEVDB_* values in .env',
        );
    }

    $migrationFiles = migration_files_payload($scopeRoot);
    $migrationRecords = migration_records_payload($scopeRoot);
    $ran = [];
    foreach ($migrationRecords as $record) {
        if (!is_array($record)) {
            continue;
        }
        $ran[migration_key((string) ($record['migration'] ?? ''))] = true;
    }
    $pending = 0;
    foreach ($migrationFiles as $file) {
        $key = migration_key((string) ($file['migration'] ?? $file['name'] ?? ''));
        if ($key !== '' && !isset($ran[$key])) {
            $pending++;
        }
    }
    $checks[] = inspector_health_check(
        'Database',
        'migrations',
        'Migrations',
        $pending === 0 ? 'pass' : 'warn',
        count($migrationFiles) . ' file(s), ' . $pending . ' pending',
        $pending > 0 ? 'Run migrate from Inspector or php pinoox migrate --platform ' . $package : null,
    );

    $routes = routes_payload($scopeRoot);
    $routeCount = count($routes['routes'] ?? []);
    $checks[] = inspector_health_check(
        'App',
        'routes',
        'Routes',
        $routeCount > 0 ? 'pass' : 'warn',
        (string) $routeCount . ' route(s)',
        'Register routes in router/ or routes/ for this app',
    );

    $langFiles = lang_files_payload($scopeRoot);
    $checks[] = inspector_health_check(
        'App',
        'lang',
        'Language files',
        count($langFiles) > 0 ? 'pass' : 'warn',
        count($langFiles) . ' file(s)',
        'Add lang/{locale}/*.lang.php for this app or theme',
    );

    $pinkerApp = $platformRoot . '/pinker/apps/' . $package;
    $checks[] = inspector_health_check(
        'Pinker',
        'cache',
        'Pinker cache',
        is_dir($pinkerApp) ? 'pass' : 'warn',
        is_dir($pinkerApp) ? 'pinker/apps/' . $package : 'Not built yet',
        'Run pinker:rebuild for this app when routes or config changed',
    );

    $appMeta = [
        'package' => $package,
        'name' => (string) ($config['name'] ?? $package),
        'root' => $scopeRoot,
        'platform' => $isPlatform,
        'platform_root' => $platformRoot,
        'theme' => (string) ($config['theme'] ?? 'default'),
        'version' => (string) ($config['version-name'] ?? '1.0.0'),
    ];

    return inspector_health_report_from_checks($checks, $appMeta);
}

function inspector_doctor_result(string $scopeRoot): array
{
    $platformRoot = inspector_platform_root_from_scope($scopeRoot);
    $report = inspector_native_doctor_report($scopeRoot, $platformRoot);
    $json = json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    return [
        'action' => 'doctor',
        'exit_code' => !empty($report['healthy']) ? 0 : 1,
        'ok' => !empty($report['healthy']),
        'stdout' => is_string($json) ? $json : '',
        'stderr' => '',
        'json' => $report,
    ];
}
