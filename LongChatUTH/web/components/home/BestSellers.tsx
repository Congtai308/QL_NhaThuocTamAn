"use client";
import useSWR from "swr";
import ProductCard from "@/components/ProductCard";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function BestSellers() {
  const { data, isLoading, error } = useSWR(
    "http://localhost:9000/LongChatUTH/api/index.php?path=products&page=1&limit=8",
    fetcher,
    { revalidateOnFocus: false }
  );
  console.log("✅ BestSeller API data:", data);

  const items: any[] = Array.isArray(data?.items) ? data.items : [];

  return (
    <section className="relative">
      <div className="mx-auto rounded-3xl border-4 border-[#0a56c5] to-white shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-6">
        <div className="-mt-9 mb-2 text-center">
          <span className="inline-block rounded-full bg-[#e20a2a] text-white px-6 py-1.5 text-sm shadow">
            SẢN PHẨM BÁN CHẠY NHẤT
          </span>
        </div>

        {/* Dùng cùng grid như FlashSale */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 items-stretch">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white border p-3 animate-pulse h-full"
                >
                  <div className="w-full h-40 bg-slate-100 rounded-lg mb-3" />
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-slate-100 rounded w-1/2 mb-3" />
                  <div className="h-9 bg-slate-100 rounded-xl" />
                </div>
              ))
            : items.map((p: any) => <ProductCard key={p.id} p={p} />)}
        </div>

        {error && (
          <div className="text-center text-sm text-red-600 mt-3">
            Không tải được dữ liệu.
          </div>
        )}

        <div className="text-center mt-4">
          <button className="text-sm text-[#0a56c5] underline">
            Xem tất cả
          </button>
        </div>
      </div>
    </section>
  );
}
