<?php
// helpers.php
function cors_json() {
  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, Authorization');
  if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
  header('Content-Type: application/json; charset=utf-8');
}

function ok($data, $status=200){
  http_response_code($status);
  echo json_encode($data, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
  exit;
}

function bad($msg, $code=400){
  http_response_code($code);
  echo json_encode(['error'=>$msg], JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
  exit;
}

/** Lấy query param dạng string */
function param($k, $def=null){ return isset($_GET[$k]) ? trim((string)$_GET[$k]) : $def; }

/** Lấy param dạng int (có min/max) */
function int_param($k, $def=0, $min=null, $max=null){
  $v = isset($_GET[$k]) ? intval($_GET[$k]) : $def;
  if ($min!==null && $v < $min) $v = $min;
  if ($max!==null && $v > $max) $v = $max;
  return $v;
}

/** Đọc body JSON cho POST (nếu cần sau này) */
function get_json() {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}
