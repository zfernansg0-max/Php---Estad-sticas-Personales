<?php
/**
 * Este archivo ahora delega en la clase Database (patrón
 * Singleton, ver src/Database.php). Sigue exponiendo la
 * variable $pdo para no romper los archivos de api/ que ya
 * la usan.
 */
require_once __DIR__ . '/../src/Database.php';

$pdo = Database::getInstance()->getConexion();