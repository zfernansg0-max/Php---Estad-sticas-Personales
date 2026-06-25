<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/db.php';

$stmt = $pdo->query("SELECT id, fecha, metrica, valor FROM registros ORDER BY fecha DESC, id DESC");
$registros = $stmt->fetchAll();

foreach ($registros as &$r) {
    $r['valor'] = (float) $r['valor'];
    $r['id'] = (int) $r['id'];
}

echo json_encode($registros);