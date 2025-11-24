<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Preflight CORS
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  http_response_code(200);
  exit;
}

// Cho mysqli ném exception để dễ bắt lỗi
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$method = $_SERVER["REQUEST_METHOD"];

try {
  $db = new mysqli(
    "127.0.0.1",
    "sql_nhom37_itimi",
    "22f35426abc4d8",
    "sql_nhom37_itimi",
    3306
  );
  $db->set_charset("utf8mb4");
} catch (mysqli_sql_exception $e) {
  http_response_code(500);
  echo json_encode([
    "success" => false,
    "error"   => "DB_CONNECT_FAILED",
    "message" => "Kết nối DB thất bại: " . $e->getMessage(),
  ]);
  exit;
}

try {
  switch ($method) {
    // 🔹 LẤY DỮ LIỆU
    case "GET":
      if (isset($_GET["id"])) {
        $id = (int) $_GET["id"];

        $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $res = $stmt->get_result();
        $row = $res->fetch_assoc();

        if ($row && isset($row["image"]) && !isset($row["thumbnail"])) {
          $row["thumbnail"] = $row["image"];
        }

        echo json_encode($row ?: null);
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
      $id           = isset($_GET["id"]) ? (int) $_GET["id"] : null;
      $name         = $_POST["name"] ?? "";
      $price        = isset($_POST["price"]) ? (float) $_POST["price"] : 0;
      $category     = $_POST["category"] ?? "";
      $manufacturer = $_POST["manufacturer"] ?? "";
      $image_url    = "";

      // --- Upload ảnh (nếu có) ---
      if (!empty($_FILES["image"]["name"]) && is_uploaded_file($_FILES["image"]["tmp_name"])) {
        $target_dir = "../uploads/";
        if (!is_dir($target_dir)) {
          mkdir($target_dir, 0777, true);
        }

        $filename    = time() . "_" . basename($_FILES["image"]["name"]);
        $target_file = $target_dir . $filename;

        if (!move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
          throw new RuntimeException("Không thể upload file ảnh");
        }

        // URL public để FE dùng trực tiếp
        $image_url = "http://nhom37.itimit.id.vn/QL_NhaThuocTamAn/LongChatUTH/uploads/" . $filename;
      } else {
        // Khi sửa mà không chọn ảnh mới -> FE gửi lại URL cũ trong field image
        $image_url = $_POST["image"] ?? "";
      }

      if ($id) {
        // UPDATE
        $stmt = $db->prepare(
          "UPDATE products 
             SET name = ?, price = ?, category = ?, manufacturer = ?, image = ?
           WHERE id = ?"
        );
        $stmt->bind_param("sdsssi", $name, $price, $category, $manufacturer, $image_url, $id);
        $stmt->execute();

        echo json_encode([
          "success" => true,
          "message" => "Đã cập nhật sản phẩm",
          "id"      => $id,
        ]);
      } else {
        // INSERT
        $stmt = $db->prepare(
          "INSERT INTO products (name, price, category, manufacturer, image)
           VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->bind_param("sdsss", $name, $price, $category, $manufacturer, $image_url);
        $stmt->execute();

        echo json_encode([
          "success" => true,
          "message" => "Đã thêm sản phẩm",
          "id"      => $db->insert_id,
        ]);
      }
      break;

    // 🔹 XÓA
    case "DELETE":
      $id = isset($_GET["id"]) ? (int) $_GET["id"] : 0;

      if ($id <= 0) {
        http_response_code(400);
        echo json_encode([
          "success" => false,
          "error"   => "INVALID_ID",
          "message" => "Thiếu ID để xoá sản phẩm",
        ]);
        break;
      }

      // Lấy đường dẫn ảnh trước (nhưng CHƯA xoá file vội)
      $stmt = $db->prepare("SELECT image FROM products WHERE id = ?");
      $stmt->bind_param("i", $id);
      $stmt->execute();
      $stmt->bind_result($img);
      $stmt->fetch();
      $stmt->close();

      try {
        // Thử xoá sản phẩm
        $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
        $stmt->bind_param("i", $id);
        $stmt->execute();

        if ($stmt->affected_rows <= 0) {
          echo json_encode([
            "success" => false,
            "error"   => "NOT_FOUND",
            "message" => "Không tìm thấy sản phẩm để xoá",
          ]);
          break;
        }

        // Xoá file ảnh sau khi xoá DB thành công
        if (!empty($img)) {
          $localPath = str_replace(
            "http://nhom37.itimit.id.vn/QL_NhaThuocTamAn/LongChatUTH/",
            "../",
            $img
          );
          if (is_file($localPath)) {
            @unlink($localPath);
          }
        }

        echo json_encode([
          "success"    => true,
          "deleted_id" => $id,
        ]);
      } catch (mysqli_sql_exception $e) {
        // Lỗi foreign key: sản phẩm đã có trong đơn hàng…
        if ($e->getCode() === 1451) {
          http_response_code(409);
          echo json_encode([
            "success" => false,
            "error"   => "FK_CONSTRAINT",
            "message" =>
              "Không thể xoá sản phẩm vì đã được sử dụng trong đơn hàng hoặc bảng liên quan. " .
              "Hãy xoá/huỷ các bản ghi liên quan trước.",
          ]);
        } else {
          throw $e; // cho catch ngoài xử lý
        }
      }
      break;

    default:
      http_response_code(405);
      echo json_encode([
        "success" => false,
        "error"   => "METHOD_NOT_ALLOWED",
        "message" => "Phương thức không được hỗ trợ",
      ]);
  }
} catch (mysqli_sql_exception $e) {
  http_response_code(500);
  echo json_encode([
    "success" => false,
    "error"   => "MYSQL_ERROR",
    "message" => $e->getMessage(),
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([
    "success" => false,
    "error"   => "SERVER_ERROR",
    "message" => $e->getMessage(),
  ]);
}
?>
