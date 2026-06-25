<?php
/**
 * Este archivo ahora delega en RegistroFactory (patrón Factory,
 * ver src/RegistroFactory.php) para no tener la lista de
 * métricas duplicada en dos lugares distintos.
 */
require_once __DIR__ . '/../src/RegistroFactory.php';

return RegistroFactory::metricasValidas();