export const metadata = {
  title: "Đăng nhập - Nhà thuốc Tâm An",
  description: "Đăng nhập tài khoản thành viên",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // chỉ trả về children để dùng chung Header / background
  return <>{children}</>;
}
