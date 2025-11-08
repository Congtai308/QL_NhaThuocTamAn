<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$q = trim($_GET['q'] ?? '');
if ($q === '') { echo json_encode(['items'=>[]], JSON_UNESCAPED_UNICODE); exit; }

$page  = max(1, intval($_GET['page'] ?? 1));
$limit = max(1, min(100, intval($_GET['limit'] ?? 12)));
$offset = ($page - 1) * $limit;

try {
  $like = '%'.$q.'%';

  $count = $conn->prepare("SELECT COUNT(*) FROM products
    WHERE name LIKE :kw OR ingredient LIKE :kw OR brand LIKE :kw OR category LIKE :kw");
  $count->execute([':kw'=>$like]);
  $total = (int)$count->fetchColumn();

  $sql = "SELECT id, url, name, price AS price_text, category, brand, form, size_spec, manufacturer, origin, ingredient, image_path
          FROM products
          WHERE name LIKE :kw OR ingredient LIKE :kw OR brand LIKE :kw OR category LIKE :kw
          ORDER BY id DESC
          LIMIT :limit OFFSET :offset";
  $stmt = $conn->prepare($sql);
  $stmt->bindValue(':kw', $like, PDO::PARAM_STR);
  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->execute();
  $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $uStmt = $conn->prepare("SELECT name AS unit_name, price_value FROM units WHERE product_id = ?");
  foreach ($items as &$p) {
    $uStmt->execute([$p['id']]);
    $p['units'] = $uStmt->fetchAll(PDO::FETCH_ASSOC);
  }

  echo json_encode([
    'items'=>$items,
    'pagination'=>['page'=>$page,'limit'=>$limit,'total'=>$total,'pages'=>(int)ceil($total/$limit)]
  ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error'=>$e->getMessage()], JSON_UNESCAPED_UNICODE);
}
