<?php
/**
 * index.php — API Router chính
 * Dùng query ?path=... để gọi tới endpoint tương ứng.
 * Ví dụ:
 *   /api/index.php?path=products&page=1&limit=12
 *   /api/index.php?path=product&id=5
 *   /api/index.php?path=search&q=vitamin
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

// ---------------------------------------------------------
// ⚙️ Cấu hình CORS + JSON header
// ---------------------------------------------------------
cors_json(); // từ helpers.php: gửi header Content-Type + Access-Control-Allow-Origin

// Lấy route (?path=)
$path = param('path', 'health');

// ---------------------------------------------------------
// 🩺 Health Check
// ---------------------------------------------------------
if ($path === 'health') {
  ok([
    'message' => 'LongChau API ✅',
    'routes'  => [
      '/api/index.php?path=products&page=1&limit=20',
      '/api/index.php?path=product&id=1',
      '/api/index.php?path=search&q=vitamin',
      '/api/index.php?path=categories',
      '/api/index.php?path=products_by_category&category=Thuốc%20dạ%20dày&page=1&limit=12',
      '/api/index.php?path=related&id=1&limit=8',
      '/api/index.php?path=brands',
      '/api/index.php?path=units&id=1',
      '/api/index.php?path=register',
      '/api/index.php?path=login'
    ]
  ]);
  exit;
}

// ---------------------------------------------------------
// 🧭 Bản đồ route → file thực thi
// ---------------------------------------------------------
$routes = [
  'products'             => 'products.php',
  'product'              => 'product_detail.php',
  'search'               => 'search.php',
  'categories'           => 'categories.php',
  'products_by_category' => 'products_by_category.php',
  'units'                => 'units.php',     // lấy đơn vị tính
  'related'              => 'related.php',   // sản phẩm liên quan
  'brands'               => 'brands.php',
  'register'             => 'register.php',
  'login'                => 'login.php'
];

// ---------------------------------------------------------
// 🚦 Điều hướng và xử lý lỗi route
// ---------------------------------------------------------
if (!isset($routes[$path])) {
  bad("❌ Route '{$path}' không tồn tại.", 404);
  exit;
}

require __DIR__ . '/' . $routes[$path];
