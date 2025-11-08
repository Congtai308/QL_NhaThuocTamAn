<?php
// ===== Header & CORS =====
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Ngắt sớm nếu request là OPTIONS (CORS preflight)
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

// ===== Cấu hình kết nối MySQL =====
$servername = "127.0.0.1";
$username = "root";
$password = "";
$dbname = "nhathuoctaman";
$port = "3306";

// Ẩn toàn bộ warning PHP (tránh phá JSON)
error_reporting(0);

// ===== Kết nối =====
$conn = new mysqli($servername, $username, $password, $dbname, $port);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Không thể kết nối MySQL"]);
    exit();
}

// ===== Đọc input JSON =====
$input = json_decode(file_get_contents("php://input"), true);
$email = trim($input["email"] ?? "");
$password = trim($input["password"] ?? "");

// ===== Kiểm tra đầu vào =====
if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Thiếu email hoặc mật khẩu"]);
    exit();
}

// ===== Truy vấn user =====
// ⚙️ THÊM role để phân quyền
$stmt = $conn->prepare("SELECT user_id, email, password_hash, full_name, COALESCE(role, 'user') AS role FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Tài khoản không tồn tại"]);
    exit();
}

$user = $result->fetch_assoc();

// ===== Kiểm tra mật khẩu =====
if (!password_verify($password, $user["password_hash"])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Sai email hoặc mật khẩu"]);
    exit();
}

// ===== Tạo token (fake JWT đơn giản) =====
$token = bin2hex(random_bytes(16));

// ===== Phản hồi JSON (đúng chuẩn NextAuth cần) =====
http_response_code(200);
echo json_encode([
    "success" => true,
    "user" => [
        "id" => $user["user_id"],
        "name" => $user["full_name"],
        "email" => $user["email"],
        "role" => $user["role"] // ✅ thêm role
    ],
    "token" => $token
]);

// Dọn dẹp
$stmt->close();
$conn->close();
exit();
?>
