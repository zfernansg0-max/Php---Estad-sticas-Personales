<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../src/RegistroFactory.php';

$body = json_decode(file_get_contents('php://input'), true) ?? [];

try {
    // Patrón Factory: toda la validación (métrica válida, fecha
    // válida, valor dentro de rango según su Strategy) ocurre
    // dentro de RegistroFactory::crear().
    $datos = RegistroFactory::crear(
        $body['metrica'] ?? '',
        $body['fecha'] ?? '',
        $body['valor'] ?? null
    );
} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}

$stmt = $pdo->prepare(
    "INSERT INTO registros (fecha, metrica, valor) VALUES (:fecha, :metrica, :valor)"
);
$stmt->execute($datos);

echo json_encode([
    'id'      => (int) $pdo->lastInsertId(),
    'fecha'   => $datos['fecha'],
    'metrica' => $datos['metrica'],
    'valor'   => $datos['valor'],
]);