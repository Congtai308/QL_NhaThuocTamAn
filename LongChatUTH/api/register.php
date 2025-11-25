<?php
// api/register.php
require_once __DIR__ . '/db.php';       // tạo $conn (PDO)
require_once __DIR__ . '/helpers.php';  // cors_json(), ok(), bad()

// Bật CORS + JSON header
cors_json();

// Chỉ cho POST + OPTIONS
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') {
  http_response_code(200);
  exit;
}

if ($method !== 'POST') {
  bad('Method not allowed', 405);
  exit;
}

try {
  // Đọc raw body
  $raw = file_get_contents('php://input');
  $data = [];

  // Thử parse JSON
  if ($raw !== false && strlen(trim($raw)) > 0) {
    $json = json_decode($raw, true);
    if (is_array($json)) {
      $data = $json;
    } else {
      // Nếu không phải JSON (ví dụ: a=b&c=d) thì parse dạng query string
      parse_str($raw, $parsed);
      if (is_array($parsed)) {
        $data = $parsed;
      }
    }
  }

  // Nếu vẫn rỗng thì fallback sang $_POST
  if (empty($data) && !empty($_POST)) {
    $data = $_POST;
  }

  $fullname = trim($data['fullname'] ?? '');
  $email    = trim($data['email'] ?? '');
  $password = trim($data['password'] ?? '');

  // Validate
  if ($email === '' || $password === '') {
    bad('Thiếu email hoặc mật khẩu', 400);
  }

  // Kiểm tra trùng email
  $stmt = $conn->prepare('SELECT user_id FROM users WHERE email = ? LIMIT 1');
  $stmt->execute([$email]);
  if ($stmt->fetchColumn()) {
    ok([
      'success' => false,
      'message' => 'Email đã tồn tại'
    ]);
    exit;
  }

  // Hash password & insert
  $hashed = password_hash($password, PASSWORD_DEFAULT);

  $insert = $conn->prepare(
    'INSERT INTO users (email, password_hash, full_name, created_at, updated_at)
     VALUES (?, ?, ?, NOW(), NOW())'
  );
  $insert->execute([$email, $hashed, $fullname]);

  ok([
    'success' => true,
    'message' => 'Đăng ký thành công',
    'user_id' => $conn->lastInsertId(),
  ]);
} catch (Throwable $e) {
  bad('Lỗi server: ' . $e->getMessage(), 500);
}
