<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

cors_json();

$productId = int_param('id', 0, 1);
if ($productId <= 0) bad('Thiếu id sản phẩm', 400);

try {
  $sql = "SELECT name AS unit_name, price_value
          FROM units
          WHERE product_id = ?
          ORDER BY unit_id ASC";
  $stmt = $conn->prepare($sql);
  $stmt->execute([$productId]);
  $units = $stmt->fetchAll(PDO::FETCH_ASSOC);

  ok(['items' => $units]);
} catch (Throwable $e) {
  bad($e->getMessage(), 500);
}
