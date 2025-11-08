<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

// ✅ Kết nối DB
$servername = "127.0.0.1";
$username = "root";
$password = "";
$dbname = "nhathuoctaman";
$port = "3306";

$conn = new mysqli($servername, $username, $password, $dbname, $port);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Lỗi kết nối database"]);
    exit();
}

// ✅ Nhận dữ liệu từ client
$input = json_decode(file_get_contents("php://input"), true);
$fullname = trim($input["fullname"] ?? "");
$email = trim($input["email"] ?? "");
$password = trim($input["password"] ?? "");

// ✅ Kiểm tra đầu vào
if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Thiếu email hoặc mật khẩu"]);
    exit();
}

// ✅ Kiểm tra trùng email
$check = $conn->prepare("SELECT user_id FROM users WHERE email = ?");
$check->bind_param("s", $email);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Email đã tồn tại"]);
    exit();
}
$check->close();

// ✅ Mã hoá mật khẩu & lưu
$hashed = password_hash($password, PASSWORD_DEFAULT);
$stmt = $conn->prepare("INSERT INTO users (email, password_hash, full_name, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())");
$stmt->bind_param("sss", $email, $hashed, $fullname);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Đăng ký thành công"]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Lỗi khi ghi dữ liệu", "error" => $stmt->error]);
}

$stmt->close();
$conn->close();
?>
