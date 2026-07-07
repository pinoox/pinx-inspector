<?php

declare(strict_types=1);

function inspector_manifest_is_ref(mixed $value): bool
{
    return is_string($value) && str_starts_with($value, '@') && strlen($value) > 1;
}

/**
 * @return array{package: ?string, key: string}
 */
function inspector_manifest_parse_ref(string $ref): array
{
    $ref = ltrim($ref, '@');

    if ($ref === '') {
        return ['package' => null, 'key' => ''];
    }

    if (str_contains($ref, ':')) {
        [$package, $key] = explode(':', $ref, 2);

        return [
            'package' => trim($package) !== '' ? trim($package) : null,
            'key' => trim($key),
        ];
    }

    return ['package' => null, 'key' => $ref];
}

function inspector_manifest_is_locale_map(mixed $value): bool
{
    if (!is_array($value) || $value === [] || array_is_list($value)) {
        return false;
    }

    foreach ($value as $key => $item) {
        if (!is_string($key) || !is_string($item)) {
            return false;
        }
    }

    return true;
}

function inspector_manifest_app_locale(array $config): string
{
    return (string) ($config['lang'] ?? 'en');
}

function inspector_manifest_fallback_locale(array $config): string
{
    foreach (['lang', 'lang_fallback', 'fallback-lang'] as $key) {
        $value = $config[$key] ?? null;

        if (is_string($value) && $value !== '') {
            return $value;
        }
    }

    return 'en';
}

/**
 * @return list<string>
 */
function inspector_manifest_lang_paths_for_app(string $appRoot): array
{
    $path = rtrim(normalize_path($appRoot), '/') . '/lang';

    return is_dir($path) ? [$path] : [];
}

/**
 * @return list<string>
 */
function inspector_manifest_lang_paths_for_package(string $platformRoot, string $package): array
{
    $package = trim($package);

    if ($package === '' || str_contains($package, '..') || str_contains($package, '/')) {
        return [];
    }

    $path = normalize_path($platformRoot) . '/apps/' . $package . '/lang';

    return is_dir($path) ? [$path] : [];
}

/**
 * @return list<string>
 */
function inspector_manifest_lang_paths_for_theme(string $appRoot, string $themeDir): array
{
    $paths = [];
    $themeLang = rtrim(normalize_path($themeDir), '/') . '/lang';

    if (is_dir($themeLang)) {
        $paths[] = $themeLang;
    }

    foreach (inspector_manifest_lang_paths_for_app($appRoot) as $appLang) {
        if (!in_array($appLang, $paths, true)) {
            $paths[] = $appLang;
        }
    }

    return $paths;
}

function inspector_manifest_lang_get(array $langPaths, string $key, ?string $locale = null, ?string $fallbackLocale = 'en'): string
{
    if ($key === '') {
        return '';
    }

    [$group, $item] = inspector_manifest_parse_lang_key($key);
    $locales = inspector_manifest_locale_candidates($locale, $fallbackLocale);

    foreach ($langPaths as $path) {
        $path = rtrim(str_replace('\\', '/', $path), '/');

        if ($path === '' || !is_dir($path)) {
            continue;
        }

        foreach ($locales as $candidate) {
            $line = inspector_manifest_read_lang_line($path, $candidate, $group, $item);

            if ($line !== '') {
                return $line;
            }
        }
    }

    return '';
}

/**
 * @return array{0: string, 1: string}
 */
function inspector_manifest_parse_lang_key(string $key): array
{
    $key = trim($key);

    if ($key === '') {
        return ['', ''];
    }

    if (!str_contains($key, '.')) {
        return ['manifest', $key];
    }

    [$group, $item] = explode('.', $key, 2);

    return [trim($group), trim($item)];
}

/**
 * @return list<string>
 */
function inspector_manifest_locale_candidates(?string $locale, ?string $fallbackLocale): array
{
    $candidates = [];

    foreach ([$locale, $fallbackLocale, 'en'] as $candidate) {
        if (!is_string($candidate) || $candidate === '') {
            continue;
        }

        if (!in_array($candidate, $candidates, true)) {
            $candidates[] = $candidate;
        }
    }

    return $candidates;
}

function inspector_manifest_read_lang_line(string $langRoot, string $locale, string $group, string $item): string
{
    if ($group === '' || $item === '') {
        return '';
    }

    $file = $langRoot . '/' . $locale . '/' . $group . '.lang.php';

    if (!is_file($file)) {
        return '';
    }

    $data = require $file;

    if (!is_array($data) || !isset($data[$item]) || !is_string($data[$item])) {
        return '';
    }

    return $data[$item];
}

function inspector_manifest_from_locale_map(array $map, ?string $locale = null): string
{
    $locale ??= 'en';

    if ($locale !== '' && isset($map[$locale]) && is_string($map[$locale])) {
        return $map[$locale];
    }

    $first = reset($map);

    return is_string($first) ? $first : '';
}

function inspector_manifest_resolve_label(
    mixed $value,
    array $langPaths,
    ?string $locale = null,
    ?string $fallbackLocale = 'en',
    ?string $fallback = null,
    ?string $platformRoot = null,
): string {
    if (inspector_manifest_is_ref($value)) {
        $parsed = inspector_manifest_parse_ref($value);
        $paths = $parsed['package'] !== null && is_string($platformRoot) && $platformRoot !== ''
            ? inspector_manifest_lang_paths_for_package($platformRoot, $parsed['package'])
            : $langPaths;

        $resolved = inspector_manifest_lang_get($paths, $parsed['key'], $locale, $fallbackLocale);

        if ($resolved !== '') {
            return $resolved;
        }

        return is_string($fallback) ? $fallback : '';
    }

    if (inspector_manifest_is_locale_map($value)) {
        /** @var array<string, string> $value */
        return inspector_manifest_from_locale_map($value, $locale);
    }

    if (is_string($value)) {
        return $value;
    }

    return is_string($fallback) ? $fallback : '';
}

function inspector_app_display_name(
    string $appRoot,
    array $config,
    ?string $locale = null,
    ?string $fallbackLocale = null,
    ?string $platformRoot = null,
): string {
    $locale ??= inspector_manifest_app_locale($config);
    $fallbackLocale ??= inspector_manifest_fallback_locale($config);
    $langPaths = inspector_manifest_lang_paths_for_app($appRoot);
    $package = (string) ($config['package'] ?? basename($appRoot));

    foreach (['title', 'name'] as $field) {
        if (!array_key_exists($field, $config)) {
            continue;
        }

        $resolved = inspector_manifest_resolve_label(
            $config[$field],
            $langPaths,
            $locale,
            $fallbackLocale,
            null,
            $platformRoot,
        );

        if ($resolved !== '') {
            return $resolved;
        }
    }

    return $package !== '' ? $package : 'Pinoox App';
}

function inspector_app_title(
    string $appRoot,
    array $config,
    ?string $locale = null,
    ?string $fallbackLocale = null,
    ?string $platformRoot = null,
): string {
    $locale ??= inspector_manifest_app_locale($config);
    $fallbackLocale ??= inspector_manifest_fallback_locale($config);
    $langPaths = inspector_manifest_lang_paths_for_app($appRoot);
    $fallback = inspector_app_display_name($appRoot, $config, $locale, $fallbackLocale, $platformRoot);

    if (!array_key_exists('title', $config)) {
        return $fallback;
    }

    $resolved = inspector_manifest_resolve_label(
        $config['title'],
        $langPaths,
        $locale,
        $fallbackLocale,
        $fallback,
        $platformRoot,
    );

    return $resolved !== '' ? $resolved : $fallback;
}

function inspector_app_description(
    string $appRoot,
    array $config,
    ?string $locale = null,
    ?string $fallbackLocale = null,
    ?string $platformRoot = null,
): string {
    $locale ??= inspector_manifest_app_locale($config);
    $fallbackLocale ??= inspector_manifest_fallback_locale($config);
    $langPaths = inspector_manifest_lang_paths_for_app($appRoot);

    if (!array_key_exists('description', $config)) {
        return '';
    }

    return inspector_manifest_resolve_label(
        $config['description'],
        $langPaths,
        $locale,
        $fallbackLocale,
        '',
        $platformRoot,
    );
}
