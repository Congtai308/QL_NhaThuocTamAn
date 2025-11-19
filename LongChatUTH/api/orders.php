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
$db = new mysqli("127.0.0.1", "root", "", "nhathuoctaman", 4306);
if ($db->connect_error) {
  http_response_code(500);
  echo json_encode(["error" => "Kết nối DB thất bại"]);
  exit;
}
$db->set_charset("utf8mb4");

// ===================================================
// 1. TẠO ĐƠN HÀNG (CHECKOUT)
// ===================================================
if ($method === "POST" && !isset($_GET["id"])) {
  $body = json_decode(file_get_contents("php://input"), true);

  if (!$body || !isset($body["items"]) || !is_array($body["items"])) {
    http_response_code(400);
    echo json_encode(["error" => "Dữ liệu không hợp lệ"]);
    exit;
  }

  $shipName      = trim($body["shipping_name"] ?? "");
  $shipPhone     = trim($body["shipping_phone"] ?? "");
  $shipAddress   = trim($body["shipping_address"] ?? "");
  $billName      = trim($body["billing_name"] ?? $shipName);
  $billPhone     = trim($body["billing_phone"] ?? $shipPhone);
  $billAddress   = trim($body["billing_address"] ?? $shipAddress);
  $items         = $body["items"]; // [{ id, qty }...]
  $paymentMethod = $body["payment_method"] ?? "cod";  // cod | vnpay
  $bankCodeBody  = $body["bank_code"] ?? "";          // VNPAYQR | VNBANK | INTCARD | ...

  if ($shipName === "" || $shipPhone === "") {
    http_response_code(400);
    echo json_encode(["error" => "Vui lòng nhập tên và số điện thoại"]);
    exit;
  }

  $totalAmount = 0;
  $orderItems  = [];

  foreach ($items as $it) {
    $pid = intval($it["id"] ?? 0);
    $qty = intval($it["qty"] ?? 0);
    if ($pid <= 0 || $qty <= 0) continue;

    $stmt = $db->prepare("SELECT name, price FROM products WHERE id = ?");
    $stmt->bind_param("i", $pid);
    $stmt->execute();
    $res = $stmt->get_result();
    $p   = $res->fetch_assoc();
    $stmt->close();

    if (!$p) continue;

    // Chuẩn hoá giá: lấy toàn bộ chữ số trong price
    $rawPrice  = (string)$p["price"];
    $digits    = preg_replace('/\D/', '', $rawPrice);
    $unitPrice = $digits !== '' ? intval($digits) : 0;

    $lineTotal    = $unitPrice * $qty;
    $totalAmount += $lineTotal;

    $orderItems[] = [
      "product_id" => $pid,
      "unit_price" => $unitPrice,
      "quantity"   => $qty,
      "line_total" => $lineTotal,
    ];
  }

  if (empty($orderItems)) {
    http_response_code(400);
    echo json_encode(["error" => "Không có sản phẩm hợp lệ trong giỏ"]);
    exit;
  }

  // tạo mã đơn: ORD0001...
  $codeRes  = $db->query("SELECT COUNT(*) AS c FROM orders");
  $countRow = $codeRes->fetch_assoc();
  $next     = intval($countRow["c"]) + 1;
  $orderCode = "ORD" . str_pad($next, 4, "0", STR_PAD_LEFT);

  $db->begin_transaction();
  try {
    $stmt = $db->prepare(
      "INSERT INTO orders
      (cart_id, user_id, customer_id, order_code, order_date, status,
       total_amount, shipping_name, shipping_phone, shipping_address,
       billing_name, billing_phone, billing_address)
      VALUES (NULL, NULL, NULL, ?, NOW(), 'Pending',
              ?, ?, ?, ?, ?, ?, ?)"
    );
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

    $stmtItem = $db->prepare(
      "INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total)
       VALUES (?, ?, ?, ?, ?)"
    );

    foreach ($orderItems as $oi) {
      $stmtItem->bind_param(
        "iiiii",
        $orderId,
        $oi["product_id"],
        $oi["quantity"],
        $oi["unit_price"],
        $oi["line_total"]
      );
      $stmtItem->execute();
    }
    $stmtItem->close();

    $db->commit();

    // ---------- Response mặc định ----------
    $response = [
      "success"      => true,
      "order_id"     => $orderId,
      "order_code"   => $orderCode,
      "total_amount" => $totalAmount,
    ];

    // ---------- Nếu chọn thanh toán VNPAY thì tạo payment_url ----------
    if ($paymentMethod === "vnpay") {

      $vnp_TxnRef    = $orderCode;                          // mã đơn unique
      $vnp_OrderInfo = "Thanh toán đơn hàng " . $orderCode;
      $vnp_Amount    = $totalAmount * 100;                  // vnpay yêu cầu *100
      $vnp_IpAddr    = $_SERVER["REMOTE_ADDR"] ?? "127.0.0.1";

      $inputData = [
        "vnp_Version"    => "2.1.0",
        "vnp_TmnCode"    => VNP_TMN_CODE,
        "vnp_Amount"     => $vnp_Amount,
        "vnp_Command"    => "pay",
        "vnp_CreateDate" => date("YmdHis"),
        "vnp_CurrCode"   => "VND",
        "vnp_IpAddr"     => $vnp_IpAddr,
        "vnp_Locale"     => "vn",
        "vnp_OrderInfo"  => $vnp_OrderInfo,
        "vnp_OrderType"  => "other",
        "vnp_ReturnUrl"  => VNP_RETURNURL,
        "vnp_TxnRef"     => $vnp_TxnRef,
      ];

      // BankCode từ FE (ví dụ: VNPAYQR, VNBANK, INTCARD, v.v...)
      if (!empty($bankCodeBody)) {
        $inputData["vnp_BankCode"] = $bankCodeBody;
      }

      ksort($inputData);
      $query    = "";
      $hashData = "";
      foreach ($inputData as $key => $value) {
        $query    .= urlencode($key) . "=" . urlencode($value) . "&";
        $hashData .= $key . "=" . $value . "&";
      }
      $query    = rtrim($query, "&");
      $hashData = rtrim($hashData, "&");

      $vnp_Url       = VNP_URL . "?" . $query;
      $vnp_SecureHash = hash_hmac("sha512", $hashData, VNP_HASH_SECRET);
      $vnp_Url      .= "&vnp_SecureHash=" . $vnp_SecureHash;

      $response["payment_url"] = $vnp_Url;
    }

    echo json_encode($response);

  } catch (Exception $e) {
    $db->rollback();
    http_response_code(500);
    echo json_encode(["error" => "Lỗi lưu đơn hàng"]);
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
// 3. LẤY DANH SÁCH + CHI TIẾT
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
