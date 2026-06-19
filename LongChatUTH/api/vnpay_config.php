<?php
// api/vnpay_config.php

// 3 dòng này bạn lấy trong dashboard VNPAY (sandbox/production)
define("VNP_TMN_CODE", " VCETEST1");
define("VNP_HASH_SECRET", "5KLRR9PAQ44SZI0VEDRW9MPX5JEKZWVM");

// URL sandbox của VNPAY
define("VNP_URL", "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");

// URL callback từ VNPAY về server của bạn
// nhớ đổi domain khi lên thật
define(
  "VNP_RETURNURL",
  "http://nhathuoctaman.freedev.app/QL_NhaThuocTamAn/LongChatUTH/api/vnpay_return.php"
);
