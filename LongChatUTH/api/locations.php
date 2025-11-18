<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  http_response_code(200);
  exit;
}

$type = $_GET["type"] ?? "province";

$base = "https://api.vnappmob.com/api/v2/province";

switch ($type) {
  case "province":
    $url = $base;
    break;

  case "district":
    $pid = $_GET["province_id"] ?? "";
    if ($pid === "") {
      http_response_code(400);
      echo json_encode(["error" => "Thiếu province_id"]);
      exit;
    }
    $url = $base . "/district/" . urlencode($pid);
    break;

  case "ward":
    $did = $_GET["district_id"] ?? "";
    if ($did === "") {
      http_response_code(400);
      echo json_encode(["error" => "Thiếu district_id"]);
      exit;
    }
    $url = $base . "/ward/" . urlencode($did);
    break;

  default:
    http_response_code(400);
    echo json_encode(["error" => "type không hợp lệ"]);
    exit;
}

// Gọi API ngoài bằng file_get_contents (tắt verify SSL cho đỡ lỗi trên local)
$context = stream_context_create([
  "http" => [
    "method"  => "GET",
    "timeout" => 10,
  ],
  "ssl" => [
    "verify_peer"      => false,
    "verify_peer_name" => false,
  ],
]);

$response = @file_get_contents($url, false, $context);

if ($response === false) {
  $err = error_get_last();
  http_response_code(502);
  echo json_encode([
    "error"  => "Không lấy được dữ liệu từ VNAppMob",
    "detail" => $err["message"] ?? "unknown",
  ]);
  exit;
}

// Trả nguyên JSON nhận được từ VNAppMob về cho FE
echo $response;
