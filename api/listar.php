<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/db.php';

$metricasValidas = require __DIR__ . '/../config/metricas.php';

$metrica = $_GET['metrica'] ?? '';
$desde   = $_GET['desde'] ?? '';
$hasta   = $_GET['hasta'] ?? '';

if (!array_key_exists($metrica, $metricasValidas)) {
    http_response_code(400);
    echo json_encode(['error' => 'Métrica inválida']);
    exit;
}

$sql = "SELECT id, fecha, metrica, valor FROM registros WHERE metrica = :metrica";
$params = ['metrica' => $metrica];

if ($desde !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $desde)) {
    $sql .= " AND fecha >= :desde";
    $params['desde'] = $desde;
}
if ($hasta !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $hasta)) {
    $sql .= " AND fecha <= :hasta";
    $params['hasta'] = $hasta;
}
$sql .= " ORDER BY fecha ASC, id ASC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$registros = $stmt->fetchAll();

foreach ($registros as &$r) {
    $r['valor'] = (float) $r['valor'];
    $r['id'] = (int) $r['id'];
}

echo json_encode($registros);