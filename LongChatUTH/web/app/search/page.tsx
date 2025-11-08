import { searchProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

export default async function SearchPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = (searchParams?.q || "").toString();
  const items = q ? await searchProducts(q) : [];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Kết quả cho: “{q}”</h1>
      {items.length === 0 ? (
        <div className="text-sm text-gray-600">Không tìm thấy sản phẩm phù hợp.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(p => <ProductCard key={p.id} p={p as any} />)}
        </div>
      )}
    </div>
  );
}
