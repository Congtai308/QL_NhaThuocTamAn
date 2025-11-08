<?php
// Thông tin kết nối MySQL
$host = "127.0.0.1";      // tên server (thường là localhost)
$db_name = "nhathuoctaman"; // tên database bạn đã tạo
$username = "root";        // user MySQL (mặc định thường là root)
$password = "";            // mật khẩu MySQL (nếu có thì điền vào)
$port = "3306";
// Kết nối CSDL bằng PDO
try {
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$db_name;charset=utf8", $username, $password);

    // Thiết lập chế độ báo lỗi
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // echo "Kết nối thành công"; // test thử
} catch(PDOException $e) {
    die("Kết nối thất bại: " . $e->getMessage());
}
?>
