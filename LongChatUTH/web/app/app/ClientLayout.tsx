"use client";

import Header from "@/components/Header";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [fade, setFade] = useState(false);

  const isPlainPage =
    pathname?.startsWith("/products/") ||
    pathname?.startsWith("/cart") ||
    pathname?.startsWith("/checkout");

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

      {/* ✅ Hiệu ứng slide-up khi chuyển trang */}
      <AnimatePresence mode="wait">
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
      </AnimatePresence>
    </div>
  );
}
