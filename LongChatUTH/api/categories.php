<?php
require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

try {
  $sql = "SELECT DISTINCT category AS name FROM products WHERE category IS NOT NULL AND category <> '' ORDER BY name";
  $rows = $conn->query($sql)->fetchAll(PDO::FETCH_ASSOC);
  // Chuẩn hóa dạng {id, name} nếu bạn muốn id = name
  $cats = array_map(fn($r)=>['id'=>$r['name'], 'name'=>$r['name']], $rows);
  echo json_encode(['items'=>$cats], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error'=>$e->getMessage()], JSON_UNESCAPED_UNICODE);
}
