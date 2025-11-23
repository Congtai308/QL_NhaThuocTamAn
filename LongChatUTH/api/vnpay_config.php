<?php
// api/vnpay_config.php

// 3 dòng này bạn lấy trong dashboard VNPAY (sandbox/production)
define("VNP_TMN_CODE", "COCOSIN");
define("VNP_HASH_SECRET", "COCOSINSECRET");

// URL sandbox của VNPAY
define("VNP_URL", "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");

// URL callback từ VNPAY về server của bạn
// nhớ đổi domain khi lên thật
define(
  "VNP_RETURNURL",
  "http://nhom37.itimit.id.vn/QL_NhaThuocTamAn/LongChatUTH/api/vnpay_return.php"
);
