import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  // ✅ Cho phép cả admin và employee
  const allowedRoles = ["admin", "employee"];
  const role = (session.user as any)?.role || "user";

  if (!allowedRoles.includes(role)) redirect("/");

  return <div className="p-6 bg-gray-50 min-h-screen">{children}</div>;
}
