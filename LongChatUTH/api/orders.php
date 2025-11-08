<?php
// api/orders.php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

cors_json();

$method = $_SERVER['REQUEST_METHOD'];

try {
  if ($method === 'GET') {
    // Chi tiết đơn nếu có ?id=...
    if (isset($_GET['id'])) {
      $id = intval($_GET['id']);
      if ($id <= 0) bad("Thiếu id");

      // Thông tin đơn
      $sql = "SELECT order_id, cart_id, user_id, customer_id, order_code, order_date, status,
                     total_amount, shipping_name, shipping_phone, shipping_address,
                     billing_name, billing_phone, billing_address
              FROM orders WHERE order_id = ?";
      $stmt = $conn->prepare($sql);
      $stmt->execute([$id]);
      $order = $stmt->fetch(PDO::FETCH_ASSOC);
      if (!$order) bad("Không tìm thấy đơn", 404);

      // Items (nếu có bảng order_items + products)
      $items = [];
      try {
        $sqlItems = "SELECT oi.order_item_id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price,
                            p.name AS product_name
                     FROM order_items oi
                     LEFT JOIN products p ON p.product_id = oi.product_id
                     WHERE oi.order_id = ?
                     ORDER BY oi.order_item_id ASC";
        $stItems = $conn->prepare($sqlItems);
        $stItems->execute([$id]);
        $items = $stItems->fetchAll(PDO::FETCH_ASSOC);
      } catch (Throwable $e) {
        // nếu không có bảng order_items vẫn trả order
        $items = [];
      }

      ok(['order' => $order, 'items' => $items]);
    }

    // Danh sách + lọc
    $q      = isset($_GET['q']) ? trim($_GET['q']) : '';
    $status = isset($_GET['status']) ? trim($_GET['status']) : '';
    $from   = isset($_GET['from']) ? trim($_GET['from']) : ''; // YYYY-MM-DD
    $to     = isset($_GET['to']) ? trim($_GET['to']) : '';     // YYYY-MM-DD

    $where = [];
    $args  = [];

    if ($q !== '') {
      $where[] = "(order_code LIKE ? OR shipping_phone LIKE ? OR shipping_name LIKE ? OR billing_phone LIKE ? OR billing_name LIKE ?)";
      $like = "%$q%";
      array_push($args, $like, $like, $like, $like, $like);
    }
    if ($status !== '') {
      $where[] = "status = ?";
      $args[]  = $status;
    }
    if ($from !== '') {
      $where[] = "DATE(order_date) >= ?";
      $args[]  = $from;
    }
    if ($to !== '') {
      $where[] = "DATE(order_date) <= ?";
      $args[]  = $to;
    }

    $sql = "SELECT order_id, order_code, order_date, status, total_amount,
                   shipping_name, shipping_phone, shipping_address,
                   billing_name, billing_phone, billing_address
            FROM orders";

    if (!empty($where)) $sql .= " WHERE " . implode(" AND ", $where);
    $sql .= " ORDER BY order_id DESC";

    $stmt = $conn->prepare($sql);
    $stmt->execute($args);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    ok(['items' => $items]);
  }

  if ($method === 'POST') {
    // Cập nhật thông tin đơn (thường chỉ cập nhật status)
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($id <= 0) bad("Thiếu id");

    // Chỉ update các trường cho phép
    $status          = $_POST['status'] ?? null;
    $shipping_name   = $_POST['shipping_name'] ?? null;
    $shipping_phone  = $_POST['shipping_phone'] ?? null;
    $shipping_address= $_POST['shipping_address'] ?? null;
    $billing_name    = $_POST['billing_name'] ?? null;
    $billing_phone   = $_POST['billing_phone'] ?? null;
    $billing_address = $_POST['billing_address'] ?? null;

    // Build động SET ...
    $sets = [];
    $args = [];
    foreach ([
      'status' => $status,
      'shipping_name' => $shipping_name,
      'shipping_phone' => $shipping_phone,
      'shipping_address' => $shipping_address,
      'billing_name' => $billing_name,
      'billing_phone' => $billing_phone,
      'billing_address' => $billing_address,
    ] as $col => $val) {
      if ($val !== null) {
        $sets[] = "$col = ?";
        $args[] = $val;
      }
    }
    if (empty($sets)) bad("Không có trường nào để cập nhật");

    $args[] = $id;
    $sql = "UPDATE orders SET " . implode(", ", $sets) . " WHERE order_id = ?";
    $stmt = $conn->prepare($sql);
    $ok   = $stmt->execute($args);
    ok(['success' => $ok]);
  }

  if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($id <= 0) bad("Thiếu id");

    // Nếu có ràng buộc khoá ngoại với order_items, cần xoá items trước
    try {
      $conn->prepare("DELETE FROM order_items WHERE order_id=?")->execute([$id]);
    } catch (Throwable $e) { /* bỏ qua nếu không có bảng */ }

    $stmt = $conn->prepare("DELETE FROM orders WHERE order_id=?");
    $ok   = $stmt->execute([$id]);
    ok(['success' => $ok]);
  }

  bad("Method không được hỗ trợ", 405);

} catch (Throwable $e) {
  bad($e->getMessage(), 500);
}
