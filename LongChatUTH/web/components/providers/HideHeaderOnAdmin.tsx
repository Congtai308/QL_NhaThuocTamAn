"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";

export default function HideHeaderOnAdmin() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  // ✅ Nếu không phải admin -> hiện Header
  if (!isAdmin) return <Header />;
  return null;
}
