<?php
// api/vnpay_return.php
require_once __DIR__ . "/vnpay_config.php";

header("Content-Type: text/html; charset=UTF-8");

// Lấy toàn bộ tham số vnp_*
$inputData = [];
foreach ($_GET as $key => $value) {
  if (substr($key, 0, 4) == "vnp_") {
    $inputData[$key] = $value;
  }
}

$vnp_SecureHash   = $_GET["vnp_SecureHash"] ?? "";
$vnp_TxnRef       = $_GET["vnp_TxnRef"] ?? "";
$vnp_ResponseCode = $_GET["vnp_ResponseCode"] ?? "";

// Tính lại hash để so
ksort($inputData);
$hashData = "";
foreach ($inputData as $key => $value) {
  if ($key == "vnp_SecureHash" || $key == "vnp_SecureHashType") continue;
  $hashData .= $key . "=" . $value . "&";
}
$hashData = rtrim($hashData, "&");
$secureHash = hash_hmac("sha512", $hashData, VNP_HASH_SECRET);

$success = false;

if ($secureHash === $vnp_SecureHash && $vnp_ResponseCode === "00") {
  // ✅ Thanh toán OK → cập nhật đơn
  $db = new mysqli("nhathuoc-db.c76w068ecjiw.ap-southeast-2.rds.amazonaws.com", "admin", "Nctai656", "nhathuoctaman", 3306);
  if (!$db->connect_error) {
    $db->set_charset("utf8mb4");
    $stmt = $db->prepare("UPDATE orders SET status = 'Paid' WHERE order_code = ?");
    $stmt->bind_param("s", $vnp_TxnRef);
    $stmt->execute();
    $stmt->close();
  }
  $success = true;
}

// URL frontend để redirect (sửa port / path nếu khác)
$redirectFrontend =
  "https://nhom37itimitidvn.vercel.app/cart?pay=" .
  ($success ? "success" : "failed") .
  "&code=" . urlencode($vnp_TxnRef);

?>
<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>Kết quả thanh toán</title>
  <meta http-equiv="refresh" content="0;url=<?= htmlspecialchars($redirectFrontend, ENT_QUOTES) ?>">
</head>
<body>
  <p>Đang chuyển hướng về website... Nếu không tự chuyển, hãy bấm
    <a href="<?= htmlspecialchars($redirectFrontend, ENT_QUOTES) ?>">vào đây</a>.
  </p>
</body>
</html>
