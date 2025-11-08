import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import AdminBodyClass from "@/components/admin/AdminBodyClass";
import Sidebar from "@/components/admin/Sidebar"; // ✅ thêm
import AdminHeader from "@/components/admin/AdminHeader"; // ✅ thêm

export const metadata = {
  title: "Admin Dashboard - Nhà Thuốc Long Châu",
  description: "Trang quản trị hệ thống Long Châu",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "admin") redirect("/");

  return (
    <div className="admin-shell min-h-screen flex overflow-hidden text-gray-800 bg-gray-50">
      <AdminBodyClass />

      {/* ✅ Sidebar mới có collapse + active */}
      <Sidebar />

      {/* ✅ Main content */}
      <main
        className="flex-1 min-h-screen transition-all"
        style={{ marginLeft: "var(--sb-w,16rem)" }}
      >
        {/* ✅ Header mới có logout + toast */}
        <AdminHeader userName={session.user.name ?? "Admin"} />

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
