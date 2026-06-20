<?php
file_put_contents(__DIR__.'/debug.txt', date('Y-m-d H:i:s')."\n", FILE_APPEND);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
  http_response_code(200);
  exit;
}

// Cho mysqli ném exception để dễ bắt lỗi
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

// ====== CẤU HÌNH ĐƯỜNG DẪN CỐ ĐỊNH ======
define("APP_BASE_URL", "https://nhathuoctaman.freedev.app/QL_NhaThuocTamAn/LongChatUTH"); // dùng https
define("UPLOAD_DIR", __DIR__ . "/../uploads/");     // thư mục thật để lưu file
define("UPLOAD_URL", APP_BASE_URL . "/uploads/");   // URL public để FE load ảnh

$method = $_SERVER["REQUEST_METHOD"];

try {
  $db = new mysqli(
    "sql204.infinityfree.com",
    "if0_42200791",
    "Nctai656",
    "if0_42200791_nhathuoctaman",
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
    // ================= GET =================
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

    // ================= POST (THÊM / SỬA) =================
    case "POST":
      $id           = isset($_GET["id"]) ? (int) $_GET["id"] : null;
      $name         = $_POST["name"] ?? "";
      $price        = isset($_POST["price"]) ? (float) $_POST["price"] : 0;
      $category     = $_POST["category"] ?? "";
      $manufacturer = $_POST["manufacturer"] ?? "";
      $image_url    = "";

      // ---- Upload ảnh nếu có ----
      if (!empty($_FILES["image"]["name"]) && is_uploaded_file($_FILES["image"]["tmp_name"])) {
        if (!is_dir(UPLOAD_DIR)) {
          mkdir(UPLOAD_DIR, 0777, true);
        }

        $origName  = basename($_FILES["image"]["name"]);
        $ext       = pathinfo($origName, PATHINFO_EXTENSION);
        $baseName  = pathinfo($origName, PATHINFO_FILENAME);
        $safeBase  = preg_replace('/[^a-zA-Z0-9_-]/', '_', $baseName);
        $filename  = time() . "_" . $safeBase . ($ext ? "." . $ext : "");
        $target    = UPLOAD_DIR . $filename;

        if (!move_uploaded_file($_FILES["image"]["tmp_name"], $target)) {
          throw new RuntimeException("Không thể upload file ảnh");
        }

        // URL public dùng HTTPS
        $image_url = UPLOAD_URL . $filename;
      } else {
        // Khi sửa, không chọn ảnh mới → giữ URL cũ
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

    // ================= DELETE =================
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

      // Lấy URL ảnh hiện tại
      $stmt = $db->prepare("SELECT image FROM products WHERE id = ?");
      $stmt->bind_param("i", $id);
      $stmt->execute();
      $stmt->bind_result($img);
      $stmt->fetch();
      $stmt->close();

      try {
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

        // Xoá file ảnh nếu có
        if (!empty($img)) {
          $localPath = str_replace(APP_BASE_URL . "/", __DIR__ . "/../", $img);
          if (is_file($localPath)) {
            @unlink($localPath);
          }
        }

        echo json_encode([
          "success"    => true,
          "deleted_id" => $id,
        ]);
      } catch (mysqli_sql_exception $e) {
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
          throw $e;
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
