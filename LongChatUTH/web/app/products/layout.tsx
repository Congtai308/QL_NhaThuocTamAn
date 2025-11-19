// app/product/layout.tsx

export const metadata = {
  title: "Sản phẩm",
  description: "Trang danh sách / chi tiết sản phẩm",
};

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // KHÔNG html / body, chỉ là wrapper nếu cần style riêng
  return <>{children}</>;
}
