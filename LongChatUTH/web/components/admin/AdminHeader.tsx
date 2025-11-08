// components/admin/AdminHeader.tsx
"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export default function AdminHeader({ userName }: { userName: string }) {
  const [toast, setToast] = useState<string | null>(null);

  async function handleLogout() {
    setToast("Đang đăng xuất…");
    // Cho user thấy toast 400–600ms rồi chuyển
    setTimeout(() => {
      signOut({ callbackUrl: "/login" });
    }, 500);
  }

  return (
    <>
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-gray-600 hover:text-blue-700 text-xl"
            onClick={() => document.body.classList.toggle("sidebar-open")}
            title="Mở/đóng sidebar"
          >
            ☰
          </button>
          <h2 className="text-lg font-semibold text-blue-700">
            Trang quản trị
          </h2>
        </div>

        <div className="flex items-center gap-5">
          <button
            className="relative text-gray-500 hover:text-blue-700"
            title="Thông báo"
          >
            🔔
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1">
              3
            </span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase">
              {userName?.[0] || "A"}
            </div>
            <div className="hidden sm:block text-sm">
              <p className="font-medium">{userName}</p>
              <p className="text-gray-500 text-xs">Admin</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Toast nhỏ gọn */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-40 bg-gray-900 text-white text-sm px-4 py-2 rounded shadow">
          {toast}
        </div>
      )}
    </>
  );
}
