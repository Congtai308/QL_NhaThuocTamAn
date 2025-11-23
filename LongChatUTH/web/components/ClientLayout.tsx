"use client";

import Header from "@/components/Header";
import { usePathname } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [fade, setFade] = useState(false);

  // Trang admin / employee không dùng layout này
  const isAdminPage =
    pathname?.startsWith("/admin") || pathname?.startsWith("/employee");

  if (isAdminPage) {
    return <>{children}</>;
  }

  // Trang user
  const isPlainPage =
    pathname?.startsWith("/products/") ||
    pathname?.startsWith("/cart") ||
    pathname?.startsWith("/checkout");

  // Hiệu ứng fade khi đổi trang
  useEffect(() => {
    setFade(true);
    const timer = setTimeout(() => setFade(false), 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      className={`min-h-screen text-gray-900 transition-colors duration-300 ease-in-out ${
        isPlainPage ? "bg-plain" : "bg-longchau"
      } ${fade ? "opacity-70" : "opacity-100"}`}
    >
      <Header />

      {/* 🔥 FIX: Bọc trong Suspense để Next không lỗi khi prerender */}
      <AnimatePresence mode="wait">
        <Suspense
          fallback={
            <main className="max-w-6xl mx-auto px-4 py-6 text-sm text-slate-500">
              Đang tải...
            </main>
          }
        >
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="max-w-6xl mx-auto px-4 py-6"
          >
            {children}
          </motion.main>
        </Suspense>
      </AnimatePresence>
    </div>
  );
}
