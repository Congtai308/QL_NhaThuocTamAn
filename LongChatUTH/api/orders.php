<?php
require_once __DIR__ . "/vnpay_config.php";

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  http_response_code(200);
  exit;
}

$method = $_SERVER["REQUEST_METHOD"];

// Bật exception để dễ debug SQL
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

// Kết nối DB
$db = new mysqli("127.0.0.1", "sql_nhom37_itimi", "22f35426abc4d8", "sql_nhom37_itimi", 3306);
if ($db->connect_errno) {
  echo json_encode(["error" => "Kết nối DB thất bại", "message" => $db->connect_error]);
  exit;
}
$db->set_charset("utf8mb4");


// ====================================================================
// ====================================================================
// 1. TẠO ĐƠN HÀNG
// ====================================================================
if ($method === "POST" && !isset($_GET["id"])) {

  // Lấy dữ liệu từ $_POST (proxy Next đã convert JSON -> form-urlencoded)
  $shipName    = trim($_POST["shipping_name"] ?? "");
  $shipPhone   = trim($_POST["shipping_phone"] ?? "");
  $shipAddress = trim($_POST["shipping_address"] ?? "");

  $billName    = trim($_POST["billing_name"] ?? $shipName);
  $billPhone   = trim($_POST["billing_phone"] ?? $shipPhone);
  $billAddress = trim($_POST["billing_address"] ?? $shipAddress);

  // items được gửi lên dưới dạng chuỗi JSON
  $itemsJson = $_POST["items"] ?? "";
  $items = [];
  if ($itemsJson !== "") {
    $decoded = json_decode($itemsJson, true);
    if (is_array($decoded)) {
      $items = $decoded;
    }
  }

  $paymentMethod = $_POST["payment_method"] ?? "cod";
  $bankCodeBody  = $_POST["bank_code"] ?? "";

  if ($shipName === "" || $shipPhone === "") {
    echo json_encode(["success" => false, "error" => "Vui lòng nhập tên & số điện thoại"]);
    exit;
  }

  if (empty($items)) {
    echo json_encode(["success" => false, "error" => "Giỏ hàng không hợp lệ"]);
    exit;
  }

  $totalAmount = 0;
  $orderItems  = [];

  // Tính tổng tiền
  foreach ($items as $it) {
    $pid = intval($it["id"] ?? 0);
    $qty = intval($it["qty"] ?? 0);
    if ($pid <= 0 || $qty <= 0) continue;

    $stmt = $db->prepare("SELECT price FROM products WHERE id = ?");
    $stmt->bind_param("i", $pid);
    $stmt->execute();
    $p = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$p) continue;

    // chuẩn hoá giá
    $digits = preg_replace("/\D/", "", $p["price"]);
    $unitPrice = intval($digits ?: 0);

    $lineTotal = $unitPrice * $qty;
    $totalAmount += $lineTotal;

    $orderItems[] = [
      "product_id" => $pid,
      "quantity"   => $qty,
      "unit_price" => $unitPrice
    ];
  }

  if (empty($orderItems)) {
    echo json_encode(["success" => false, "error" => "Giỏ hàng không hợp lệ"]);
    exit;
  }

  try {
    $db->begin_transaction();

    // Tạo mã đơn
    $r = $db->query("SELECT COUNT(*) AS c FROM orders");
    $next = ($r->fetch_assoc()["c"] ?? 0) + 1;
    $orderCode = "ORD" . str_pad($next, 4, "0", STR_PAD_LEFT);

    // Lưu orders
    $stmt = $db->prepare("
      INSERT INTO orders
      (cart_id, user_id, customer_id, order_code, order_date, status,
       total_amount, shipping_name, shipping_phone, shipping_address,
       billing_name, billing_phone, billing_address)
      VALUES(NULL, NULL, NULL, ?, NOW(), 'Pending',
             ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->bind_param(
      "sissssss",
      $orderCode,
      $totalAmount,
      $shipName,
      $shipPhone,
      $shipAddress,
      $billName,
      $billPhone,
      $billAddress
    );
    $stmt->execute();
    $orderId = $stmt->insert_id;
    $stmt->close();

    // Lưu order_items
    $stmtItem = $db->prepare("
      INSERT INTO order_items (order_id, product_id, quantity, unit_price)
      VALUES (?, ?, ?, ?)
    ");

    foreach ($orderItems as $oi) {
      $stmtItem->bind_param(
        "iiii",
        $orderId,
        $oi["product_id"],
        $oi["quantity"],
        $oi["unit_price"]
      );
      $stmtItem->execute();
    }
    $stmtItem->close();

    $db->commit();

    echo json_encode([
      "success"      => true,
      "order_id"     => $orderId,
      "order_code"   => $orderCode,
      "total_amount" => $totalAmount,
      // chỗ này nếu là VNPAY bạn build thêm payment_url
    ]);
  } catch (Throwable $e) {
    $db->rollback();
    http_response_code(500);
    echo json_encode([
      "success" => false,
      "error"   => "Lỗi lưu đơn hàng",
      "message" => $e->getMessage(),
    ]);
  }

  exit;
}


// ===================================================
// 2. CẬP NHẬT TRẠNG THÁI (ADMIN)
// ===================================================
if ($method === "POST" && isset($_GET["id"])) {
  $id     = intval($_GET["id"]);
  $status = trim($_POST["status"] ?? "");

  if ($id <= 0 || $status === "") {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Thiếu id hoặc status"]);
    exit;
  }

  $stmt = $db->prepare("UPDATE orders SET status = ? WHERE order_id = ?");
  $stmt->bind_param("si", $status, $id);
  $ok = $stmt->execute();
  $stmt->close();

  if ($ok) {
    echo json_encode(["success" => true]);
  } else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Không cập nhật được trạng thái"]);
  }
  exit;
}

// ===================================================
// 3. LẤY DANH SÁCH + CHI TIẾT ĐƠN
// ===================================================
if ($method === "GET") {
  // Chi tiết đơn
  if (isset($_GET["id"])) {
    $id = intval($_GET["id"]);
    if ($id <= 0) {
      http_response_code(400);
      echo json_encode(["error" => "ID không hợp lệ"]);
      exit;
    }

    $res   = $db->query("SELECT * FROM orders WHERE order_id = $id");
    $order = $res ? $res->fetch_assoc() : null;
    if (!$order) {
      http_response_code(404);
      echo json_encode(["error" => "Không tìm thấy đơn hàng"]);
      exit;
    }

    $sqlItems = "
      SELECT oi.*, p.name AS product_name
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = $id
      ORDER BY oi.order_item_id ASC
    ";
    $resItems = $db->query($sqlItems);
    $items = [];
    while ($row = $resItems->fetch_assoc()) {
      $items[] = $row;
    }

    echo json_encode([
      "order" => $order,
      "items" => $items,
    ]);
    exit;
  }

  // Danh sách đơn
  $where  = "1=1";
  $q      = $_GET["q"] ?? "";
  $status = $_GET["status"] ?? "";
  $from   = $_GET["from"] ?? "";
  $to     = $_GET["to"] ?? "";

  if ($q !== "") {
    $safe = $db->real_escape_string($q);
    $where .= " AND (order_code LIKE '%$safe%'
               OR shipping_name LIKE '%$safe%'
               OR shipping_phone LIKE '%$safe%')";
  }

  if ($status !== "") {
    $safeStatus = $db->real_escape_string($status);
    $where     .= " AND status = '$safeStatus'";
  }

  if ($from !== "") {
    $safeFrom = $db->real_escape_string($from);
    $where   .= " AND DATE(order_date) >= '$safeFrom'";
  }

  if ($to !== "") {
    $safeTo = $db->real_escape_string($to);
    $where .= " AND DATE(order_date) <= '$safeTo'";
  }

  $sql  = "SELECT * FROM orders WHERE $where ORDER BY order_date DESC";
  $res  = $db->query($sql);
  $rows = [];
  while ($row = $res->fetch_assoc()) {
    $rows[] = $row;
  }

  echo json_encode(["items" => $rows]);
  exit;
}

// ===================================================
// 4. XOÁ ĐƠN HÀNG
// ===================================================
if ($method === "DELETE") {
  parse_str($_SERVER["QUERY_STRING"] ?? "", $query);
  $id = intval($query["id"] ?? 0);

  if ($id <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Thiếu ID để xoá"]);
    exit;
  }

  // xoá chi tiết trước
  $db->query("DELETE FROM order_items WHERE order_id = $id");
  $stmt = $db->prepare("DELETE FROM orders WHERE order_id = ?");
  $stmt->bind_param("i", $id);
  $ok = $stmt->execute();
  $stmt->close();

  if ($ok) {
    echo json_encode(["success" => true]);
  } else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Không xoá được đơn hàng"]);
  }
  exit;
}

// ===================================================
// 5. METHOD KHÁC
// ===================================================
http_response_code(405);
echo json_encode(["error" => "Method không hỗ trợ"]);
