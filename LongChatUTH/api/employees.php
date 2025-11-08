<?php
// api/employees.php
require_once __DIR__ . '/db.php';        // tạo biến $conn (PDO)
require_once __DIR__ . '/helpers.php';   // cors_json(), ok(), bad()

cors_json(); // CORS + Content-Type JSON

$method = $_SERVER['REQUEST_METHOD'];

try {
  if ($method === 'GET') {
    // Danh sách
    $sql  = "SELECT employee_id, full_name, phone, email, title
             FROM employees
             ORDER BY employee_id DESC";
    $stmt = $conn->query($sql);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    ok(['items' => $items]);
  }

  if ($method === 'POST') {
    // Thêm mới (không có ?id=) hoặc Cập nhật (?id=...)
    $id        = isset($_GET['id']) ? max(0, intval($_GET['id'])) : 0;
    $full_name = trim($_POST['full_name'] ?? '');
    $phone     = trim($_POST['phone'] ?? '');
    $email     = trim($_POST['email'] ?? '');
    $title     = trim($_POST['title'] ?? '');

    if ($full_name === '' || $phone === '' || $email === '') {
      bad("Thiếu thông tin bắt buộc: full_name / phone / email");
    }

    if ($id > 0) {
      // UPDATE
      $sql  = "UPDATE employees
               SET full_name=?, phone=?, email=?, title=?
               WHERE employee_id=?";
      $stmt = $conn->prepare($sql);
      $ok   = $stmt->execute([$full_name, $phone, $email, $title, $id]);
      ok(['success' => $ok]);
    } else {
      // INSERT
      $sql  = "INSERT INTO employees (full_name, phone, email, title)
               VALUES (?,?,?,?)";
      $stmt = $conn->prepare($sql);
      $ok   = $stmt->execute([$full_name, $phone, $email, $title]);
      ok(['success' => $ok, 'id' => $conn->lastInsertId()]);
    }
  }

  if ($method === 'DELETE') {
    // Xoá
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($id <= 0) bad("Thiếu id");
    $stmt = $conn->prepare("DELETE FROM employees WHERE employee_id=?");
    $ok   = $stmt->execute([$id]);
    ok(['success' => $ok]);
  }

  bad("Method không được hỗ trợ", 405);

} catch (Throwable $e) {
  bad($e->getMessage(), 500);
}
