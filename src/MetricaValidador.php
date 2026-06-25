<?php
/**
 * Patrón STRATEGY
 * ------------------------------------------------------------
 * Define una interfaz común para "formas de validar un valor",
 * y una estrategia concreta que implementa esa validación como
 * rango numérico (mínimo/máximo). Hoy todas las métricas usan
 * la misma estrategia, pero el punto del patrón es que se
 * podrían agregar otras estrategias (por ejemplo, una que solo
 * acepte números enteros, o una que dependa de un registro
 * anterior) sin tener que tocar el código que ya las usa
 * (RegistroFactory), solo intercambiando qué estrategia se
 * conecta a cada métrica.
 */
interface ValidadorEstrategia
{
    public function esValido(float $valor): bool;
    public function mensajeError(): string;
}

class RangoNumericoValidador implements ValidadorEstrategia
{
    public function __construct(
        private float $min,
        private float $max
    ) {
    }

    public function esValido(float $valor): bool
    {
        return $valor >= $this->min && $valor <= $this->max;
    }

    public function mensajeError(): string
    {
        return "El valor debe estar entre {$this->min} y {$this->max}";
    }
}