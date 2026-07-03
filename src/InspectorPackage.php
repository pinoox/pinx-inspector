<?php

declare(strict_types=1);

namespace Pinoox\PinxInspector;

final class InspectorPackage
{
    public static function router(): string
    {
        return dirname(__DIR__) . '/resources/router.php';
    }

    public static function isAvailable(): bool
    {
        return is_file(self::router());
    }
}
