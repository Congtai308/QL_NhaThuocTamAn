<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$id = intval($_GET['id'] ?? 0);
if ($id <= 0) { http_response_code(400); echo json_encode(['error'=>'Thiếu ID']); exit; }

try {
  $sql = "SELECT id, url, name, price AS price_text, category, brand, form, size_spec, manufacturer, origin, ingredient, image_path
          FROM products WHERE id = ?";
  $stmt = $conn->prepare($sql);
  $stmt->execute([$id]);
  $product = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$product) { http_response_code(404); echo json_encode(['error'=>'Không tìm thấy']); exit; }

  $uStmt = $conn->prepare("SELECT name AS unit_name, price_value FROM units WHERE product_id = ?");
  $uStmt->execute([$id]);
  $product['units'] = $uStmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode($product, JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error'=>$e->getMessage()], JSON_UNESCAPED_UNICODE);
}
