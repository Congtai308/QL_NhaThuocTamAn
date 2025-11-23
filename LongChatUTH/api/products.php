<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Preflight CORS
if ($_SERVER["REQUEST_METHOD"] == "OPTIONS") {
  http_response_code(200);
  exit;
}

$method = $_SERVER["REQUEST_METHOD"];
$db = new mysqli("localhost", "sql_nhom37_itimi", "22f35426abc4d8", "sql_nhom37_itimi", 4306);
if ($db->connect_error) {
  http_response_code(500);
  echo json_encode(["error" => "Kết nối DB thất bại"]);
  exit;
}

switch ($method) {
  // 🔹 LẤY DỮ LIỆU
  case "GET":
    if (isset($_GET["id"])) {
      $id = intval($_GET["id"]);
      $res = $db->query("SELECT * FROM products WHERE id=$id");
      $row = $res ? $res->fetch_assoc() : null;

      // bổ sung thumbnail từ image cho FE
      if ($row && isset($row["image"]) && !isset($row["thumbnail"])) {
        $row["thumbnail"] = $row["image"];
      }

      echo json_encode($row);
    } else {
      $res = $db->query("SELECT * FROM products ORDER BY id DESC");
      $rows = [];
      while ($r = $res->fetch_assoc()) {
        if (isset($r["image"]) && !isset($r["thumbnail"])) {
          $r["thumbnail"] = $r["image"];
        }
        $rows[] = $r;
      }
      echo json_encode(["items" => $rows]);
    }
    break;

  // 🔹 THÊM / SỬA
  case "POST":
    $id = $_GET["id"] ?? null;
    $name = $_POST["name"] ?? "";
    $price = floatval($_POST["price"] ?? 0);
    $category = $_POST["category"] ?? "";
    $manufacturer = $_POST["manufacturer"] ?? "";
    $image_url = "";

    // Upload ảnh
    if (!empty($_FILES["image"]["name"])) {
      $target_dir = "../uploads/";
      if (!is_dir($target_dir)) mkdir($target_dir, 0777, true);
      $filename = time() . "_" . basename($_FILES["image"]["name"]);
      $target_file = $target_dir . $filename;
      move_uploaded_file($_FILES["image"]["tmp_name"], $target_file);

      // URL ảnh public (đúng với Postman bạn test)
      $image_url = "http://nhom37.itimit.id.vn/QL_NhaThuocTamAn/LongChatUTH/uploads/" . $filename;
    } else {
      // giữ nguyên URL cũ nếu có
      $image_url = $_POST["image"] ?? "";
    }

    if ($id) {
      $stmt = $db->prepare("UPDATE products SET name=?, price=?, category=?, manufacturer=?, image=? WHERE id=?");
      $stmt->bind_param("sdsssi", $name, $price, $category, $manufacturer, $image_url, $id);
      $stmt->execute();
      echo json_encode(["success" => true, "message" => "Đã cập nhật"]);
    } else {
      $stmt = $db->prepare("INSERT INTO products (name, price, category, manufacturer, image) VALUES (?, ?, ?, ?, ?)");
      $stmt->bind_param("sdsss", $name, $price, $category, $manufacturer, $image_url);
      $stmt->execute();
      echo json_encode(["success" => true, "id" => $db->insert_id]);
    }
    break;

  // 🔹 XÓA
  case "DELETE":
    $id = $_GET["id"] ?? 0;
    $id = intval($id);
    if ($id > 0) {
      $res = $db->query("SELECT image FROM products WHERE id=$id");
      $img = $res ? ($res->fetch_assoc()["image"] ?? "") : "";
      if ($img) {
        $localPath = str_replace(
          "http://nhom37.itimit.id.vn/QL_NhaThuocTamAn/LongChatUTH/",
          "../",
          $img
        );
        if (file_exists($localPath)) unlink($localPath);
      }
      $stmt = $db->prepare("DELETE FROM products WHERE id=?");
      $stmt->bind_param("i", $id);
      $stmt->execute();
      echo json_encode(["success" => true, "deleted_id" => $id]);
    } else {
      http_response_code(400);
      echo json_encode(["error" => "Thiếu ID để xóa"]);
    }
    break;

  default:
    http_response_code(405);
    echo json_encode(["error" => "Phương thức không được hỗ trợ"]);
}
?>

