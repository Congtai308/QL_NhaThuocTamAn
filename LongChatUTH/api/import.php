<?php
// ======================================================
// import.php
// Nhập dữ liệu từ longchau_products.json vào MySQL
// Tương thích database: nhathuoc_taman
// Bảng chính: products
// Bảng phụ: units (liên kết product_id)
// ======================================================

require_once __DIR__ . '/db.php';

// -------------------------
// 1️⃣ Đọc file JSON
// -------------------------
$jsonFile = __DIR__ . '/longchau_products.json';
if (!file_exists($jsonFile)) {
    die("❌ Không tìm thấy file dữ liệu: $jsonFile\n");
}

$jsonRaw = file_get_contents($jsonFile);
$jsonClean = preg_replace('/\s*;\s*$/', '', trim($jsonRaw)); // loại dấu ;
$data = json_decode($jsonClean, true);

if (!$data) {
    die("❌ JSON decode lỗi: " . json_last_error_msg() . "\n");
}
if (!is_array($data)) {
    die("❌ JSON không phải là mảng.\n");
}

// -------------------------
// 2️⃣ Tạo bảng `products` nếu chưa có
// -------------------------
$createProductsTable = "
CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  url VARCHAR(500),
  name TEXT NOT NULL,
  price VARCHAR(255),
  category VARCHAR(150),
  brand VARCHAR(150),
  form VARCHAR(200),
  size_spec VARCHAR(200),
  manufacturer VARCHAR(200),
  origin VARCHAR(100),
  ingredient TEXT,
  image_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";
$conn->exec($createProductsTable);

// -------------------------
// 3️⃣ Tạo bảng `units` nếu chưa có
// -------------------------
$createUnitsTable = "
CREATE TABLE IF NOT EXISTS units (
  unit_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  price_value VARCHAR(100) NOT NULL,
  note VARCHAR(255) DEFAULT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";
$conn->exec($createUnitsTable);

// -------------------------
// 4️⃣ Chuẩn bị truy vấn INSERT
// -------------------------
$productSQL = "INSERT INTO products
  (url, name, price, category, brand, form, size_spec, manufacturer, origin, ingredient, image_path)
  VALUES
  (:url, :name, :price, :category, :brand, :form, :size_spec, :manufacturer, :origin, :ingredient, :image_path)";
$productStmt = $conn->prepare($productSQL);

$unitSQL = "INSERT INTO units (product_id, name, price_value)
            VALUES (:product_id, :name, :price_value)";
$unitStmt = $conn->prepare($unitSQL);

// -------------------------
// 5️⃣ Import dữ liệu
// -------------------------
$count = 0;
foreach ($data as $item) {
    if (empty($item['name']) || empty($item['price'])) continue;

    // --- Thêm sản phẩm ---
    $productStmt->execute([
        ':url'          => $item['url'] ?? '',
        ':name'         => $item['name'] ?? '',
        ':price'        => $item['price'] ?? '',
        ':category'     => $item['category'] ?? '',
        ':brand'        => $item['brand'] ?? '',
        ':form'         => $item['form'] ?? '',
        ':size_spec'    => $item['size_spec'] ?? ($item['size'] ?? ''),
        ':manufacturer' => $item['manufacturer'] ?? '',
        ':origin'       => $item['origin'] ?? '',
        ':ingredient'   => $item['ingredient'] ?? '',
        ':image_path'   => str_replace('\\', '/', $item['image_path'] ?? ''),
    ]);

    $productId = $conn->lastInsertId();
    $count++;

    // --- Thêm các đơn vị (nếu có) ---
    if (!empty($item['units']) && is_array($item['units'])) {
        foreach ($item['units'] as $u) {
            $u_name  = trim($u['unit'] ?? $u['name'] ?? '');
            $u_price = trim($u['price'] ?? $u['price_value'] ?? '');
            if (!$u_name || !$u_price) continue;

            $unitStmt->execute([
                ':product_id'  => $productId,
                ':name'        => $u_name,
                ':price_value' => $u_price,
            ]);
        }
    }
}

// -------------------------
// 6️⃣ Kết thúc
// -------------------------
echo "✅ Đã import thành công {$count} sản phẩm vào database `nhathuoctaman`.\n";
echo "💾 Bảng chính: products\n";
echo "💾 Bảng đơn vị: units\n";
?>
