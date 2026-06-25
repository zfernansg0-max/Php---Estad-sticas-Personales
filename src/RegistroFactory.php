<?php
require_once __DIR__ . '/MetricaValidador.php';

/**
 * Patrón FACTORY
 * ------------------------------------------------------------
 * Centraliza la creación de "registros" listos para guardar.
 * En vez de que cada endpoint (agregar.php, listar.php, etc.)
 * repita su propia lógica de "¿la métrica existe? ¿la fecha es
 * válida? ¿el valor está en rango?", esta fábrica hace todo eso
 * en un solo lugar: decide qué ValidadorEstrategia usar según
 * la métrica, valida los datos de entrada, y devuelve un
 * arreglo limpio. Si algo no es válido, lanza una excepción con
 * el mensaje correcto.
 */
class RegistroFactory
{
    private static array $metricasValidas = [
        'sueno'     => ['min' => 0, 'max' => 24],
        'agua'      => ['min' => 0, 'max' => 30],
        'ejercicio' => ['min' => 0, 'max' => 600],
        'animo'     => ['min' => 1, 'max' => 10],
        'calorias'  => ['min' => 0, 'max' => 10000],
    ];

    public static function metricasValidas(): array
    {
        return self::$metricasValidas;
    }

    public static function crear(string $metrica, string $fecha, mixed $valorCrudo): array
    {
        if (!array_key_exists($metrica, self::$metricasValidas)) {
            throw new InvalidArgumentException('Métrica inválida');
        }

        if ($fecha === '' || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
            throw new InvalidArgumentException('Fecha inválida');
        }

        if (!is_numeric($valorCrudo)) {
            throw new InvalidArgumentException('El valor debe ser un número');
        }

        $valor = (float) $valorCrudo;
        $rango = self::$metricasValidas[$metrica];

        // Aquí se elige la estrategia de validación para esta métrica.
        // Hoy todas usan RangoNumericoValidador, pero podría variar.
        $validador = new RangoNumericoValidador($rango['min'], $rango['max']);

        if (!$validador->esValido($valor)) {
            throw new InvalidArgumentException($validador->mensajeError());
        }

        return [
            'metrica' => $metrica,
            'fecha'   => $fecha,
            'valor'   => $valor,
        ];
    }
}