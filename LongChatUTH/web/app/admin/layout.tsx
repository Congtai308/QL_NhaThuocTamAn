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
    <div className="admin-shell min-h-screen flex text-gray-800 bg-[#f3f4f6]">
      <AdminBodyClass />

      {/* Sidebar */}
      <Sidebar />

          {/* ✅ Main content full width */}
      <main className="admin-main flex-1 flex flex-col transition-all">
        {/* Header cố định trên cùng */}
        <AdminHeader userName={session.user.name ?? "Admin"} />

        {/* Vùng nội dung chính */}
        <div className="flex-1 px-6 pb-8 pt-4">
          {/* KHÔNG giới hạn max-w nữa → ăn full chiều ngang */}
          <div className="space-y-6 h-full">{children}</div>
        </div>
      </main>
    </div>
  );
}

