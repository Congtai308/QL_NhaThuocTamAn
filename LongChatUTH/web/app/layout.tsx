import "./globals.css";
import type { Metadata } from "next";
import SessionWrapper from "@/components/providers/SessionWrapper";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "Nhà Thuốc Tâm An",
  description: "Website Nhà Tâm An",
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
          {/* 🔥 Toàn bộ UI user đều đi qua ClientLayout (client component) */}
          <ClientLayout>{children}</ClientLayout>
        </SessionWrapper>
      </body>
    </html>
  );
}
