<?php

declare(strict_types=1);

function route_channel_for_file(string $relative): string
{
    $path = strtolower(str_replace('\\', '/', $relative));

    if (str_contains($path, '/api/') || str_ends_with($path, '/api.php') || str_starts_with($path, 'routes/api')) {
        return 'api';
    }

    if (str_contains($path, 'console')) {
        return 'console';
    }

    return 'web';
}

function route_file_manifest(string $root): array
{
    $config = app_config($root);
    $configured = $config['router']['routes'] ?? ['routes/web.php', 'routes/actions.php'];
    $configured = is_array($configured) ? $configured : [];
    $files = [];
    $seen = [];

    foreach ($configured as $routeFile) {
        $relative = trim(str_replace('\\', '/', (string) $routeFile), '/');
        if ($relative === '' || isset($seen[$relative])) {
            continue;
        }

        $seen[$relative] = true;
        $files[] = $relative;
    }

    foreach (glob($root . '/routes/*.php') ?: [] as $path) {
        $relative = 'routes/' . basename($path);
        if (!isset($seen[$relative])) {
            $seen[$relative] = true;
            $files[] = $relative;
        }
    }

    foreach (glob($root . '/routes/*', GLOB_ONLYDIR) ?: [] as $dir) {
        foreach (glob($dir . '/*.php') ?: [] as $path) {
            $relative = 'routes/' . basename($dir) . '/' . basename($path);
            if (!isset($seen[$relative])) {
                $seen[$relative] = true;
                $files[] = $relative;
            }
        }
    }

    return $files;
}

function discover_route_files(string $root): array
{
    $queue = route_file_manifest($root);
    $manifest = [];
    $seen = [];

    while ($queue !== []) {
        $relative = array_shift($queue);
        if ($relative === '' || isset($seen[$relative])) {
            continue;
        }

        $seen[$relative] = true;
        $manifest[] = $relative;

        $absolute = resolve_project_path($root, $relative);
        if (!is_file($absolute)) {
            continue;
        }

        foreach (route_file_references($root, $absolute) as $ref) {
            if (!isset($seen[$ref])) {
                $queue[] = $ref;
            }
        }
    }

    return $manifest;
}

/**
 * @return list<string>
 */
function route_file_references(string $root, string $absolute): array
{
    $content = (string) file_get_contents($absolute);
    if ($content === '') {
        return [];
    }

    $refs = [];
    $dir = dirname($absolute);

    if (preg_match_all('/route_files\s*\(\s*\[(.*?)\]\s*\)/s', $content, $blocks) !== false) {
        foreach ($blocks[1] as $block) {
            if (preg_match_all('/[\'"]([^\'"]+\.php)[\'"]/', (string) $block, $matches) === false) {
                continue;
            }

            foreach ($matches[1] as $file) {
                $refs[] = route_relative_path($root, $dir, (string) $file);
            }
        }
    }

    if (preg_match_all('/routes:\s*__DIR__\s*\.\s*[\'"]([^\'"]+)[\'"]/', $content, $matches) !== false) {
        foreach ($matches[1] as $file) {
            $refs[] = route_relative_path($root, $dir, (string) $file);
        }
    }

    return array_values(array_unique(array_filter($refs, static fn (string $ref): bool => $ref !== '')));
}

function route_relative_path(string $root, string $baseDir, string $file): string
{
    $file = trim(str_replace('\\', '/', $file), '/');
    $absolute = normalize_path($baseDir . '/' . $file);
    $rootPath = normalize_path($root);

    if (!str_starts_with($absolute, $rootPath)) {
        return '';
    }

    return ltrim(substr($absolute, strlen($rootPath)), '/');
}

function route_join_uri(string ...$parts): string
{
    $uri = '';

    foreach ($parts as $part) {
        $part = trim((string) $part);
        if ($part === '') {
            continue;
        }

        if (!str_starts_with($part, '/')) {
            $part = '/' . $part;
        }

        $uri = rtrim($uri, '/') . $part;
    }

    return $uri === '' ? '/' : $uri;
}

function routes_dedupe(array $routes): array
{
    $seen = [];
    $unique = [];

    foreach ($routes as $route) {
        $key = strtolower((string) ($route['method'] ?? 'GET'))
            . '|' . (string) ($route['uri'] ?? '')
            . '|' . (string) ($route['file'] ?? '')
            . '|' . (string) ($route['line'] ?? '');

        if (isset($seen[$key])) {
            continue;
        }

        $seen[$key] = true;
        $unique[] = $route;
    }

    return $unique;
}

function route_format_action(mixed $action): string
{
    if (is_string($action)) {
        return $action;
    }

    if (!is_array($action)) {
        return '';
    }

    if (isset($action[0], $action[1]) && is_string($action[0]) && is_string($action[1])) {
        $controller = str_replace('::class', '', $action[0]);

        return $controller . '@' . $action[1];
    }

    return '';
}

function route_is_pure_array_export(string $content): bool
{
    if (!preg_match('/return\s+\[/', $content)) {
        return false;
    }

    return preg_match('/\b(?:get|post|put|patch|delete|options|any|match|group|collect|route_files|routes)\s*\(/', $content) !== 1;
}

function route_try_array_file(string $path, string $relative): array
{
    if (!is_file($path)) {
        return [];
    }

    $content = (string) file_get_contents($path);
    if ($content === '' || !route_is_pure_array_export($content)) {
        return [];
    }

    $data = @include $path;
    if (!is_array($data) || $data === []) {
        return [];
    }

    $first = $data[array_key_first($data)] ?? null;
    if (!is_array($first) || !isset($first['uri'])) {
        return [];
    }

    $channel = route_channel_for_file($relative);
    $routes = [];

    foreach ($data as $item) {
        if (!is_array($item)) {
            continue;
        }

        $routes[] = [
            'method' => strtoupper((string) ($item['method'] ?? 'GET')),
            'uri' => (string) ($item['uri'] ?? '/'),
            'name' => (string) ($item['name'] ?? ''),
            'action' => route_format_action($item['action'] ?? ''),
            'action_ref' => '',
            'definition' => '',
            'file' => $relative,
            'line' => null,
            'channel' => $channel,
            'action_resolved' => null,
        ];
    }

    return $routes;
}

function route_file_looks_grouped(string $path): bool
{
    $content = (string) file_get_contents($path);

    return str_contains($content, '->routes(function')
        || str_contains($content, '->controller(')
        || str_contains($content, 'collect(');
}

function parse_grouped_route_file(string $path, string $relative): array
{
    $content = (string) file_get_contents($path);
    if ($content === '') {
        return [];
    }

    $uses = php_use_aliases($content);
    $routes = [];
    $apiPrefix = '';

    if (preg_match('/[\'"]prefix[\'"]\s*=>\s*[\'"]([^\'"]*)[\'"]/', $content, $match) === 1) {
        $apiPrefix = (string) $match[1];
    }

    if (preg_match('/[\'"]version[\'"]\s*=>\s*[\'"]([^\'"]*)[\'"]/', $content, $match) === 1) {
        $version = trim((string) $match[1], '/');
        if ($version !== '') {
            $apiPrefix = '/' . $version . ($apiPrefix !== '' ? '/' . trim($apiPrefix, '/') : '');
        }
    }

    $pattern = '/\b(get|post|put|patch|delete|options)\s*\(\s*([\'"])([^\'"]*)\2/';
    if (preg_match_all($pattern, $content, $matches, PREG_OFFSET_CAPTURE) === false) {
        return [];
    }

    $channel = route_channel_for_file($relative);

    foreach ($matches[1] as $index => $methodMatch) {
        $offset = (int) ($methodMatch[1] ?? 0);
        $uri = (string) ($matches[3][$index][0] ?? '');
        $line = substr_count(substr($content, 0, $offset), "\n") + 1;
        $before = substr($content, 0, $offset);
        $snippet = route_statement_snippet($content, $offset);

        $uriPrefix = '';
        if (preg_match_all('/group\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)/', $before, $groups) !== false) {
            foreach ($groups[1] as $group) {
                $uriPrefix .= '/' . trim((string) $group, '/');
            }
        }

        $namePrefix = '';
        if (preg_match_all('/->\s*as\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)/', $before, $names) !== false) {
            $namePrefix = implode('', $names[1]);
        }

        $routeName = '';
        if (preg_match('/->\s*name\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)/', $snippet, $nameMatch) === 1) {
            $routeName = $namePrefix . (string) $nameMatch[1];
        }

        $routes[] = [
            'method' => strtoupper((string) $methodMatch[0]),
            'uri' => route_join_uri($apiPrefix, $uriPrefix, $uri),
            'name' => $routeName,
            'action' => route_handler_from_group_snippet($snippet, $before, $uses),
            'action_ref' => '',
            'definition' => $snippet,
            'file' => $relative,
            'line' => $line,
            'channel' => $channel,
            'action_resolved' => null,
        ];
    }

    return $routes;
}

function route_handler_from_group_snippet(string $snippet, string $before, array $uses): string
{
    if (preg_match('/\[\s*([A-Za-z0-9_\\\\]+)::class\s*,\s*[\'"]([^\'"]+)[\'"]\s*\]/', $snippet, $match) === 1) {
        $controller = expand_class_name((string) $match[1], $uses);

        return $controller . '@' . (string) $match[2];
    }

    if (preg_match('/,\s*[\'"]([^\'"]+)[\'"]\s*\)/', $snippet, $match) === 1) {
        $method = (string) $match[1];
        if (preg_match_all('/->\s*controller\s*\(\s*([A-Za-z0-9_\\\\]+)::class\s*\)/', $before, $controllers) !== false && $controllers[1] !== []) {
            $controller = expand_class_name((string) end($controllers[1]), $uses);

            return $controller . '@' . $method;
        }
    }

    return route_action_from_snippet($snippet);
}

function parse_routes_from_file(string $root, string $relative): array
{
    $path = resolve_project_path($root, $relative);
    if (!is_file($path)) {
        return ['routes' => [], 'actions' => []];
    }

    if (route_file_looks_grouped($path)) {
        $routes = parse_grouped_route_file($path, $relative);
    } else {
        $routes = route_try_array_file($path, $relative);
        if ($routes === []) {
            $routes = parse_route_file($path, $relative);
        }
    }

    $actions = parse_route_actions_file($path, $relative);

    foreach ($routes as &$route) {
        if (!isset($route['channel'])) {
            $route['channel'] = route_channel_for_file($relative);
        }
    }
    unset($route);

    return [
        'routes' => routes_dedupe($routes),
        'actions' => $actions,
    ];
}
