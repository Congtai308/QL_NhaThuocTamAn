// components/Footer.tsx
"use client";

export default function Footer() {
  return (
    <footer className="mt-16 py-10 bg-[#0a56c5] text-white text-sm">
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 px-4">
        {/* Cột 1 */}
        <div>
          <h4 className="font-semibold mb-2">Về Nhà thuốc LongChatUTH</h4>
          <ul className="space-y-1 opacity-80">
            <li><a href="#">Giới thiệu</a></li>
            <li><a href="#">Tuyển dụng</a></li>
            <li><a href="#">Chính sách bảo mật</a></li>
          </ul>
        </div>

        {/* Cột 2 */}
        <div>
          <h4 className="font-semibold mb-2">Hỗ trợ khách hàng</h4>
          <ul className="space-y-1 opacity-80">
            <li><a href="#">Liên hệ</a></li>
            <li><a href="#">Đặt hàng</a></li>
            <li><a href="#">Đổi trả hàng</a></li>
          </ul>
        </div>

        {/* Cột 3 */}
        <div>
          <h4 className="font-semibold mb-2">Thông tin liên hệ</h4>
          <ul className="space-y-1 opacity-80">
            <li>Hotline: <strong>1800 9999</strong></li>
            <li>Email: support@longchatuth.vn</li>
            <li>Địa chỉ: 01 Võ Văn Ngân, TP. Thủ Đức</li>
          </ul>
        </div>

        {/* Cột 4 - Mạng xã hội */}
        <div>
          <h4 className="font-semibold mb-2">Kết nối với chúng tôi</h4>
          <div className="flex gap-3 mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/facebook.svg" className="w-6 h-6" alt="Facebook" />
            <img src="/icons/youtube.svg" className="w-6 h-6" alt="YouTube" />
            <img src="/icons/zalo.svg" className="w-6 h-6" alt="Zalo" />
          </div>
        </div>
      </div>

      <div className="text-center mt-10 text-xs opacity-70">
        © 2025 Nhà thuốc LongChatUTH. Bản quyền thuộc về nhóm phát triển UTH.
      </div>
    </footer>
  );
}
