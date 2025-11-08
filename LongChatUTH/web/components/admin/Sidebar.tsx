"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // CSS var cho main margin-left
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sb-w",
      collapsed ? "5rem" : "16rem"
    );
  }, [collapsed]);

  const menu = [
    { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/admin/products", label: "Sản phẩm", icon: "💊" },
    { href: "/admin/inventory", label: "Kho hàng", icon: "🏭" },
    { href: "/admin/orders", label: "Đơn hàng", icon: "📦" },
    { href: "/admin/suppliers", label: "Nhà cung cấp", icon: "🚚" },
    { href: "/admin/employees", label: "Nhân viên", icon: "👨‍💼" },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 shadow-sm flex flex-col transition-all duration-300 z-30 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header Sidebar */}
      <div className="p-5 flex items-center justify-between border-b">
        {!collapsed && (
          <div>
            <h1 className="text-blue-700 font-bold text-lg">💊 LongChau</h1>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-blue-600 text-lg transition"
          title={collapsed ? "Mở rộng" : "Thu gọn"}
        >
          {collapsed ? "⏩" : "⏪"}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto mt-4 space-y-1">
        {menu.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              <span>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <footer className="text-center text-xs text-gray-500 border-t p-3">
          © LongChâu Admin 2025
        </footer>
      )}
    </aside>
  );
}
