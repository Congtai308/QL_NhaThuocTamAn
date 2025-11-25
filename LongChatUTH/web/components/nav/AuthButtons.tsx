"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import AuthCard, { AuthCardMode } from "@/components/auth/AuthCard";

export default function AuthButtons() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthCardMode>("login");

  // mở popup với mode tương ứng
  const openModal = (m: AuthCardMode) => {
    setMode(m);
    setOpen(true);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }
  };

  const closeModal = () => {
    setOpen(false);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
  };

  // cleanup khi unmount
  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
    };
  }, []);

  // loading session → skeleton
  if (status === "loading") {
    return (
      <div className="h-9 flex items-center">
        <div className="w-36 h-9 animate-pulse rounded-xl bg-slate-200" />
      </div>
    );
  }

  // Đã đăng nhập → chào + vai trò + nút đăng xuất
  if (session?.user) {
    const displayName = session.user.name || session.user.email || "Người dùng";
    const role = (session.user as any).role || "user";

    return (
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline text-sm text-blue-800">
          👋 Xin chào{" "}
          <span className="font-semibold text-blue-800">{displayName}</span>
        </span>

        {/* ROLE BADGE */}
        <span
          className={`text-[11px] px-2 py-1 rounded-full border bg-white/95 ${
            role === "admin"
              ? "text-red-600 border-red-200"
              : role === "employee"
              ? "text-amber-600 border-amber-200"
              : "text-emerald-600 border-emerald-200"
          }`}
        >
          {role.toUpperCase()}
        </span>

        {/* 🔥 NÚT ADMIN – CHỈ HIỆN CHO TÀI KHOẢN ADMIN */}
        {role === "admin" && (
          <a
            href="/admin/dashboard"
            className="rounded-full px-4 py-2 text-xs sm:text-sm font-semibold bg-red-600 text-white border border-red-600 hover:bg-red-700"
          >
            ADMIN
          </a>
        )}

        {/* Đăng xuất */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-colors border
                   bg-white text-[#0a56c5] border-[#0a56c5] hover:bg-blue-50
                   active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1"
        >
          Đăng xuất
        </button>
      </div>
    );
  }

  // Chưa đăng nhập → 2 nút Đăng ký / Đăng nhập (mở popup, không đổi route)
  const isLogin = pathname === "/login";
  const isRegister = pathname === "/register";

  const base =
    "rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-colors border active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-offset-1";
  const solid =
    "bg-[#0a56c5] text-white border-[#0a56c5] hover:bg-blue-700 focus:ring-blue-300";
  const outline =
    "bg-white text-[#0a56c5] border-[#0a56c5] hover:bg-blue-50 focus:ring-blue-300";

  const loginClass =
    !isLogin && !isRegister
      ? `${base} ${solid}`
      : `${base} ${isLogin ? solid : outline}`;
  const registerClass =
    !isLogin && !isRegister
      ? `${base} ${outline}`
      : `${base} ${isRegister ? solid : outline}`;

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => openModal("register")}
          className={registerClass}
        >
          Đăng ký
        </button>
        <button
          type="button"
          onClick={() => openModal("login")}
          className={loginClass}
        >
          Đăng nhập
        </button>
      </div>

      {/* 🔥 Popup đăng nhập/đăng ký – blur nền + zoom giống Long Châu */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="auth-backdrop"
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              key="auth-modal"
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 24 }}
              transition={{ duration: 0.22, ease: [0.22, 0.8, 0.25, 1] }}
              className="w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {/* nút đóng góc phải */}
                <button
                  onClick={closeModal}
                  className="absolute -top-3 -right-3 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md text-slate-500 hover:text-slate-700"
                >
                  ✕
                </button>
                <AuthCard
                  mode={mode}
                  onClose={closeModal}
                  onSwitchMode={(m) => setMode(m)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
