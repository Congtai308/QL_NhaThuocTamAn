LongChau UI (Next.js) – drop-in for C:\xampp\htdocs\LongChatUTH\web

1) Giải nén thư mục vào: C:\xampp\htdocs\LongChatUTH\web
2) Copy .env.local.sample -> .env.local và chỉnh nếu cần
3) Chạy:
   cd C:\xampp\htdocs\LongChatUTH\web
   npm install
   npm run dev
4) Mở http://localhost:3000

Yêu cầu API PHP chạy tại: http://localhost:8080/LongChatUTH/api/index.php
Ảnh truy cập qua Apache từ thư mục LongChatUTH/images (IMAGE_BASE env).
