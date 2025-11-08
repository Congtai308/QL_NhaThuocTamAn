<?php
// api/suppliers.php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

cors_json(); // bật CORS và Content-Type

$method = $_SERVER['REQUEST_METHOD'];

try {
  if ($method === 'GET') {
    $sql  = "SELECT supplier_id, name, address, phone, email 
             FROM suppliers 
             ORDER BY supplier_id DESC";
    $stmt = $conn->query($sql);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    ok(['items' => $items]);
  }

  if ($method === 'POST') {
    // Thêm hoặc sửa theo ?id=
    $id      = isset($_GET['id']) ? max(0, intval($_GET['id'])) : 0;
    $name    = $_POST['name'] ?? '';
    $address = $_POST['address'] ?? '';
    $phone   = $_POST['phone'] ?? '';
    $email   = $_POST['email'] ?? '';

    if (!$name) bad("Thiếu tên nhà cung cấp (name)");

    if ($id > 0) {
      // UPDATE
      $sql  = "UPDATE suppliers 
               SET name=?, address=?, phone=?, email=? 
               WHERE supplier_id=?";
      $stmt = $conn->prepare($sql);
      $ok   = $stmt->execute([$name, $address, $phone, $email, $id]);
      ok(['success' => $ok]);
    } else {
      // INSERT
      $sql  = "INSERT INTO suppliers (name, address, phone, email) VALUES (?,?,?,?)";
      $stmt = $conn->prepare($sql);
      $ok   = $stmt->execute([$name, $address, $phone, $email]);
      ok(['success' => $ok, 'id' => $conn->lastInsertId()]);
    }
  }

  if ($method === 'DELETE') {
    // Xoá theo id
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($id <= 0) bad("Thiếu id");
    $stmt = $conn->prepare("DELETE FROM suppliers WHERE supplier_id=?");
    $ok   = $stmt->execute([$id]);
    ok(['success' => $ok]);
  }

  bad("Method không được hỗ trợ", 405);

} catch (Throwable $e) {
  bad($e->getMessage(), 500);
}
