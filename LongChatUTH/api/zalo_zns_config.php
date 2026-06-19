<?php
// zalo_zns_config.php

// ✅ Thay các giá trị này bằng thông tin thật của bạn

// access_token lấy từ Zalo Cloud/ZCA
define("ZNS_ACCESS_TOKEN", "YOUR_ZALO_ZNS_ACCESS_TOKEN");

// ID của template OTP đã được Zalo duyệt (string)
define("ZNS_OTP_TEMPLATE_ID", "YOUR_TEMPLATE_ID");

// Có thể dùng prefix để tracking
define("ZNS_TRACKING_PREFIX", "otp_web_");

// Nếu bạn đang test ở chế độ development mode (chỉ gửi cho admin OA)
// thì để true và Zalo yêu cầu thêm field mode="development".
// Khi lên production, chuyển thành false.
define("ZNS_DEV_MODE", false);

// Chuỗi base URL ZNS
define("ZNS_ENDPOINT", "https://business.openapi.zalo.me/message/template");
