<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/db.php';

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$id = $body['id'] ?? null;

if (!is_numeric($id)) {
    http_response_code(400);
    echo json_encode(['error' => 'ID inválido']);
    exit;
}

$stmt = $pdo->prepare("DELETE FROM registros WHERE id = :id");
$stmt->execute(['id' => (int) $id]);

echo json_encode(['ok' => true]);