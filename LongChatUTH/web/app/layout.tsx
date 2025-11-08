import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";
import SessionWrapper from "@/components/providers/SessionWrapper";

export const metadata: Metadata = {
  title: "Nhà Thuốc Long Châu Clone",
  description: "Giao diện demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="longchau-bg min-h-screen bg-gray-50 text-gray-900">
        <SessionWrapper>
          <Header className="site-header" />
          {/* Giữ nguyên max-w để user-site đẹp, chỉ thêm site-main để override khi vào admin */}
          <main className="site-main max-w-6xl mx-auto px-4 py-6">
            {children}
          </main>
        </SessionWrapper>
      </body>
    </html>
  );
}
