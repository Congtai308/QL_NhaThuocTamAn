"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function AuthButtons() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Tránh nháy nội dung khi session đang load
  if (status === "loading") {
    return (
      <div className="h-9 flex items-center">
        <div className="w-36 h-9 animate-pulse rounded-xl bg-slate-200" />
      </div>
    );
  }

  // Đã đăng nhập -> chào + hiển thị vai trò + nút Đăng xuất
  if (session?.user) {
    const displayName = session.user.name || session.user.email || "Người dùng";
    const role = (session.user as any).role || "user";

    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-700">
          👋 Xin chào {displayName}
        </span>
        <span
          className={`text-xs px-2 py-1 rounded-full border ${
            role === "admin"
              ? "bg-red-100 text-red-700 border-red-300"
              : role === "employee"
              ? "bg-amber-100 text-amber-700 border-amber-300"
              : "bg-emerald-100 text-emerald-700 border-emerald-300"
          }`}
          title="Vai trò"
        >
          {role.toUpperCase()}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-xl px-4 py-2 text-sm font-semibold transition-colors border
                     bg-white text-[#0a56c5] border-[#0a56c5] hover:bg-blue-50
                     active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1"
        >
          Đăng xuất
        </button>
      </div>
    );
  }

  // Chưa đăng nhập -> hiện 2 nút (logic tô xanh nút đang ở trang tương ứng)
  const isLogin = pathname === "/login";
  const isRegister = pathname === "/register";

  const base =
    "rounded-xl px-4 py-2 text-sm font-semibold transition-colors border active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-offset-1";
  const solid =
    "bg-[#0a56c5] text-white border-[#0a56c5] hover:bg-blue-700 focus:ring-blue-300";
  const outline =
    "bg-white text-[#0a56c5] border-[#0a56c5] hover:bg-blue-50 focus:ring-blue-300";

  const loginClass =
    !isLogin && !isRegister ? `${base} ${solid}` : `${base} ${isLogin ? solid : outline}`;
  const registerClass =
    !isLogin && !isRegister ? `${base} ${solid}` : `${base} ${isRegister ? solid : outline}`;

  return (
    <div className="flex items-center gap-3">
      <Link href="/register" className={registerClass} aria-current={isRegister ? "page" : undefined}>
        Đăng ký
      </Link>
      <Link href="/login" className={loginClass} aria-current={isLogin ? "page" : undefined}>
        Đăng nhập
      </Link>
    </div>
  );
}
