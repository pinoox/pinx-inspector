<?php

declare(strict_types=1);

function lang_locale_stats(array $files): array
{
    $stats = [];
    foreach ($files as $file) {
        $locale = (string) ($file['locale'] ?? 'unknown');
        $stats[$locale] = ($stats[$locale] ?? 0) + 1;
    }
    ksort($stats);

    return $stats;
}

function lang_locale_groups(array $files): array
{
    $groups = [];
    foreach ($files as $file) {
        $locale = (string) ($file['locale'] ?? 'unknown');
        if (!isset($groups[$locale])) {
            $groups[$locale] = [];
        }
        $groups[$locale][] = $file;
    }
    ksort($groups);

    return $groups;
}

function lang_validate_locale(string $locale): string
{
    $locale = strtolower(trim($locale));

    if ($locale === '' || !preg_match('/^[a-z]{2,8}([-_][a-z0-9]{2,8})?$/', $locale)) {
        throw new RuntimeException('Invalid locale code.');
    }

    return $locale;
}

function lang_path_for_locale(string $path, string $locale): string
{
    $parts = explode('/', str_replace('\\', '/', trim($path, '/')));
    $locale = lang_validate_locale($locale);

    foreach ($parts as $index => $part) {
        if ($part === 'lang' && isset($parts[$index + 1]) && !str_contains($parts[$index + 1], '.')) {
            $parts[$index + 1] = $locale;

            return implode('/', $parts);
        }
    }

    return '';
}

function lang_read_file_data(string $path): array
{
    if (!is_file($path)) {
        return [];
    }

    $lower = strtolower($path);

    if (str_ends_with($lower, '.json')) {
        $content = file_get_contents($path);
        $data = is_string($content) ? json_decode($content, true) : null;

        return is_array($data) ? $data : [];
    }

    $data = include $path;

    return is_array($data) ? $data : [];
}

function lang_export_value(mixed $value, int $depth = 0): string
{
    if (is_string($value)) {
        return "'" . str_replace(['\\', "'"], ['\\\\', "\\'"], $value) . "'";
    }

    if (is_int($value) || is_float($value)) {
        return (string) $value;
    }

    if (is_bool($value)) {
        return $value ? 'true' : 'false';
    }

    if ($value === null) {
        return 'null';
    }

    if (!is_array($value)) {
        return "''";
    }

    if ($value === []) {
        return '[]';
    }

    $pad = str_repeat('    ', $depth + 1);
    $lines = ['['];

    foreach ($value as $key => $item) {
        $exportedKey = is_int($key) ? $key : "'" . str_replace(['\\', "'"], ['\\\\', "\\'"], (string) $key) . "'";
        $lines[] = $pad . $exportedKey . ' => ' . lang_export_value($item, $depth + 1) . ',';
    }

    $lines[] = str_repeat('    ', $depth) . ']';

    return implode("\n", $lines);
}

function lang_export_php(array $data): string
{
    $lines = ["<?php", '', 'return ['];

    foreach ($data as $key => $value) {
        $exportedKey = "'" . str_replace(['\\', "'"], ['\\\\', "\\'"], (string) $key) . "'";
        $lines[] = '    ' . $exportedKey . ' => ' . lang_export_value($value, 0) . ',';
    }

    $lines[] = '];';

    return implode("\n", $lines) . "\n";
}

function lang_export_content(array $data, string $path): string
{
    if (str_ends_with(strtolower($path), '.json')) {
        return json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n";
    }

    return lang_export_php($data);
}

/**
 * @return array<string, mixed>
 */
function lang_merge_missing_keys(array $reference, array $target): array
{
    foreach ($reference as $key => $value) {
        if (!array_key_exists($key, $target)) {
            $target[$key] = $value;
            continue;
        }

        if (is_array($value) && is_array($target[$key])) {
            $target[$key] = lang_merge_missing_keys($value, $target[$key]);
        }
    }

    return $target;
}

function lang_count_missing_keys(array $reference, array $target): int
{
    $missing = 0;

    foreach ($reference as $key => $value) {
        if (!array_key_exists($key, $target)) {
            $missing++;
            continue;
        }

        if (is_array($value) && is_array($target[$key])) {
            $missing += lang_count_missing_keys($value, $target[$key]);
        }
    }

    return $missing;
}

function lang_allowed_file_map(string $root): array
{
    $allowed = [];

    foreach (lang_files_payload($root) as $file) {
        $path = (string) ($file['path'] ?? '');
        if ($path !== '') {
            $allowed[$path] = $file;
        }
    }

    return $allowed;
}

function lang_assert_writable_target(string $root, string $relative): string
{
    $relative = trim(str_replace('\\', '/', $relative), '/');
    if ($relative === '' || str_contains($relative, '..')) {
        throw new RuntimeException('Language file path is invalid.');
    }

    $target = normalize_path($root . '/' . $relative);
    $rootPath = normalize_path($root);

    if (!str_starts_with($target, $rootPath . '/')) {
        throw new RuntimeException('Language file path is outside the app scope.');
    }

    $dir = dirname($target);
    if (!is_dir($dir) && !mkdir($dir, 0775, true) && !is_dir($dir)) {
        throw new RuntimeException('Unable to create language directory.');
    }

    if (is_file($target) && !is_writable($target)) {
        throw new RuntimeException('Language file is not writable.');
    }

    if (!is_file($target) && !is_writable($dir)) {
        throw new RuntimeException('Language directory is not writable.');
    }

    return $target;
}

function lang_write_file(string $target, string $content): void
{
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
}

function lang_locale_stats(array $files): array
{
    $stats = [];

    foreach ($files as $file) {
        $locale = (string) ($file['locale'] ?? 'unknown');
        $stats[$locale] = ($stats[$locale] ?? 0) + 1;
    }

    ksort($stats);

    return $stats;
}

function copy_lang_locale_payload(string $root, array $payload): array
{
    $source = lang_validate_locale((string) ($payload['source_locale'] ?? ''));
    $target = lang_validate_locale((string) ($payload['target_locale'] ?? ''));
    $scope = (string) ($payload['scope'] ?? 'all');
    $overwrite = (bool) ($payload['overwrite'] ?? false);

    if ($source === $target) {
        throw new RuntimeException('Source and target locale must be different.');
    }

    $files = lang_files_payload($root);
    $created = 0;
    $skipped = 0;
    $errors = [];

    foreach ($files as $file) {
        if ((string) ($file['locale'] ?? '') !== $source) {
            continue;
        }

        if ($scope !== 'all' && (string) ($file['scope'] ?? '') !== $scope) {
            continue;
        }

        $sourcePath = (string) ($file['path'] ?? '');
        $targetRelative = lang_path_for_locale($sourcePath, $target);
        if ($targetRelative === '') {
            continue;
        }

        $targetAbsolute = normalize_path($root . '/' . $targetRelative);
        if (is_file($targetAbsolute) && !$overwrite) {
            $skipped++;
            continue;
        }

        try {
            $absolute = lang_assert_writable_target($root, $targetRelative);
            lang_write_file($absolute, (string) file_get_contents(resolve_project_path($root, $sourcePath)));
            $created++;
        } catch (Throwable $e) {
            $errors[] = $targetRelative . ': ' . $e->getMessage();
        }
    }

    return [
        'ok' => $errors === [],
        'message' => $created > 0
            ? "Copied {$created} language file(s) from {$source} to {$target}."
            : 'No language files were copied.',
        'source_locale' => $source,
        'target_locale' => $target,
        'created' => $created,
        'skipped' => $skipped,
        'errors' => $errors,
    ];
}

function sync_lang_file_payload(string $root, array $payload): array
{
    $targetRelative = trim(str_replace('\\', '/', (string) ($payload['path'] ?? '')), '/');
    $referenceRelative = trim(str_replace('\\', '/', (string) ($payload['reference_path'] ?? '')), '/');
    $referenceLocale = trim((string) ($payload['reference_locale'] ?? ''));

    if ($targetRelative === '') {
        throw new RuntimeException('Target language file path is required.');
    }

    $allowed = lang_allowed_file_map($root);
    $targetAbsolute = resolve_project_path($root, $targetRelative);

    if (!isset($allowed[$targetRelative])) {
        if ($referenceRelative === '' && $referenceLocale !== '') {
            $referenceRelative = lang_path_for_locale($targetRelative, lang_validate_locale($referenceLocale));
        }

        if ($referenceRelative === '' || !is_file(resolve_project_path($root, $referenceRelative))) {
            throw new RuntimeException('Target file is not an editable language file in the current app.');
        }

        $referenceData = lang_read_file_data(resolve_project_path($root, $referenceRelative));
        $absolute = lang_assert_writable_target($root, $targetRelative);
        lang_write_file($absolute, lang_export_content($referenceData, $absolute));

        return [
            'ok' => true,
            'message' => 'Language file was created from the reference locale.',
            'path' => $targetRelative,
            'reference_path' => $referenceRelative,
            'added' => lang_count_missing_keys($referenceData, []),
        ];
    }

    if ($referenceRelative === '' && $referenceLocale !== '') {
        $referenceRelative = lang_path_for_locale($targetRelative, lang_validate_locale($referenceLocale));
    }

    if ($referenceRelative === '' || !is_file(resolve_project_path($root, $referenceRelative))) {
        throw new RuntimeException('Reference language file was not found for sync.');
    }

    $referenceData = lang_read_file_data(resolve_project_path($root, $referenceRelative));
    $targetData = lang_read_file_data($targetAbsolute);
    $missingBefore = lang_count_missing_keys($referenceData, $targetData);
    $merged = lang_merge_missing_keys($referenceData, $targetData);
    $missingAfter = lang_count_missing_keys($referenceData, $merged);

    if ($missingBefore === 0) {
        return [
            'ok' => true,
            'message' => 'No missing keys found. File is already in sync.',
            'path' => $targetRelative,
            'reference_path' => $referenceRelative,
            'added' => 0,
        ];
    }

    $absolute = lang_assert_writable_target($root, $targetRelative);
    lang_write_file($absolute, lang_export_content($merged, $absolute));

    return [
        'ok' => true,
        'message' => 'Missing translation keys were added.',
        'path' => $targetRelative,
        'reference_path' => $referenceRelative,
        'added' => max(0, $missingBefore - $missingAfter),
    ];
}

function sync_lang_locale_payload(string $root, array $payload): array
{
    $targetLocale = lang_validate_locale((string) ($payload['target_locale'] ?? ''));
    $referenceLocale = lang_validate_locale((string) ($payload['reference_locale'] ?? ''));
    $scope = (string) ($payload['scope'] ?? 'all');

    if ($targetLocale === $referenceLocale) {
        throw new RuntimeException('Reference and target locale must be different.');
    }

    $files = lang_files_payload($root);
    $synced = 0;
    $added = 0;
    $skipped = 0;
    $errors = [];

    foreach ($files as $file) {
        if ((string) ($file['locale'] ?? '') !== $referenceLocale) {
            continue;
        }

        if ($scope !== 'all' && (string) ($file['scope'] ?? '') !== $scope) {
            continue;
        }

        $referenceRelative = (string) ($file['path'] ?? '');
        $targetRelative = lang_path_for_locale($referenceRelative, $targetLocale);
        if ($targetRelative === '') {
            $skipped++;
            continue;
        }

        try {
            $result = sync_lang_file_payload($root, [
                'path' => $targetRelative,
                'reference_path' => $referenceRelative,
            ]);
            $synced++;
            $added += (int) ($result['added'] ?? 0);
        } catch (Throwable $e) {
            $errors[] = $targetRelative . ': ' . $e->getMessage();
        }
    }

    return [
        'ok' => $errors === [],
        'message' => $synced > 0
            ? "Synced {$synced} file(s) and added {$added} missing key(s) from {$referenceLocale} to {$targetLocale}."
            : 'No language files were synced.',
        'target_locale' => $targetLocale,
        'reference_locale' => $referenceLocale,
        'synced' => $synced,
        'added' => $added,
        'skipped' => $skipped,
        'errors' => $errors,
    ];
}
