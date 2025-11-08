<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

cors_json();

$id    = int_param('id', 0, 1);
$limit = int_param('limit', 8, 1, 24);
if ($id <= 0) bad('Thiếu id sản phẩm', 400);

try {
  // Lấy category/brand của sản phẩm gốc
  $p = $conn->prepare("SELECT category, brand FROM products WHERE id = ?");
  $p->execute([$id]);
  $base = $p->fetch(PDO::FETCH_ASSOC);
  if (!$base) bad('Không tìm thấy sản phẩm gốc', 404);

  // Ưu tiên cùng category, fallback cùng brand
  $sql = "SELECT id, url, name, price AS price_text, category, brand, form, size_spec, manufacturer, origin, ingredient, image_path
          FROM products
          WHERE id <> :id
            AND (category = :cat OR brand = :brand)
          ORDER BY category = :cat DESC, id DESC
          LIMIT :limit";
  $stmt = $conn->prepare($sql);
  $stmt->bindValue(':id', $id, PDO::PARAM_INT);
  $stmt->bindValue(':cat', $base['category'] ?? '', PDO::PARAM_STR);
  $stmt->bindValue(':brand', $base['brand'] ?? '', PDO::PARAM_STR);
  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
  $stmt->execute();

  $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // nạp units
  $uStmt = $conn->prepare("SELECT name AS unit_name, price_value FROM units WHERE product_id = ?");
  foreach ($items as &$it) {
    $uStmt->execute([$it['id']]);
    $it['units'] = $uStmt->fetchAll(PDO::FETCH_ASSOC);
  }

  ok(['items' => $items]);
} catch (Throwable $e) {
  bad($e->getMessage(), 500);
}
