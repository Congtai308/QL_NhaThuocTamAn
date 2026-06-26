<?php
// Thông tin kết nối MySQL
$host = "nhathuoc-db.c76w068ecjiw.ap-southeast-2.rds.amazonaws.com";      // tên server (thường là localhost)
$db_name = "nhathuoctaman"; // tên database bạn đã tạo
$username = "admin";        // user MySQL (mặc định thường là root)
$password = "hahaha113";            // mật khẩu MySQL (nếu có thì điền vào)
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
