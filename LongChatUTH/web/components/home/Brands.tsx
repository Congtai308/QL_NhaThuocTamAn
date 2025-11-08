// components/home/Brands.tsx
"use client";

import useSWR from "swr";
import Link from "next/link";

type Brand = {
  brand: string; // tên thương hiệu (từ API brands.php)
  total?: number; // (nếu backend có trả số lượng sp)
  logo?: string; // (tuỳ bạn bổ sung sau)
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Brands() {
  const { data, error, isLoading } = useSWR(
    "http://localhost:9000/LongChatUTH/api/index.php?path=brands",
    fetcher,
    { revalidateOnFocus: false }
  );

  // API của bạn có thể trả { items: [...] } hoặc mảng trực tiếp
  const items: Brand[] = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
    ? data
    : [];

  return (
    <section className="mt-10 rounded-3xl border-4 border-[#0a56c5] bg-gradient-to-b from-[#f2f8ff] to-white shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-6">
      <h3 className="text-center text-xl font-semibold text-[#0a56c5] mb-6">
        Thương hiệu yêu thích
      </h3>

      {isLoading ? (
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="w-28 h-28 rounded-2xl border bg-white shadow-sm animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-sm text-red-600">
          Không tải được danh sách thương hiệu.
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {items.slice(0, 12).map((b) => (
            <Link
              key={b.brand}
              href={`/search?s=${encodeURIComponent(b.brand)}`}
              className="group w-28 h-28 flex items-center justify-center bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition text-center"
              title={b.brand}
            >
              {b.logo ? (
                // nếu sau này bạn có logo, hiển thị ảnh logo tại đây
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={b.logo}
                  alt={b.brand}
                  className="max-w-[70%] max-h-[70%] object-contain"
                />
              ) : (
                <div>
                  <div className="text-[#0a56c5] font-semibold">{b.brand}</div>
                  {typeof b.total === "number" && (
                    <div className="text-xs text-gray-400 mt-1">
                      {b.total} sản phẩm
                    </div>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
