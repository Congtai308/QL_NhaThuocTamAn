"use client";
import { useMemo, useState } from "react";
import useSWR from "swr";
import ProductCard from "@/components/ProductCard";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function FlashSale() {
  const [page, setPage] = useState(1);
  const limit = 8;

  const url = useMemo(
    () =>
      `http://localhost:9000/LongChatUTH/api/index.php?path=products&page=${page}&limit=${limit}`,
    [page]
  );

  const { data, isLoading, error } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const items: any[] = Array.isArray(data?.items) ? data.items : [];
  const hasNext = items.length >= limit;

  return (
    <section className="relative mt-8">
      {/* Banner */}
      <div className="relative flex justify-center mb-6 -mt-10">
        <img
          src="/flashsale-banner.webp"
          alt="Flash Sale Giá Tốt"
          className="w-full max-w-[800px] sm:max-w-[1000px] object-contain drop-shadow-md select-none pointer-events-none"
        />
      </div>

      {/* Khung sản phẩm */}
      <div className="relative mx-auto rounded-3xl border-4 border-[#0a56c5] bg-gradient-to-b from-[#f2f8ff] to-white shadow-[0_4px_15px_rgba(0,0,0,0.05)] p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: limit }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white border p-3 animate-pulse h-full flex flex-col justify-between"
                >
                  <div className="w-full h-40 bg-slate-100 rounded-lg mb-3" />
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-slate-100 rounded w-1/2 mb-3" />
                  <div className="h-9 bg-slate-100 rounded-xl" />
                </div>
              ))
            : items.map((p: any) => (
                <div key={p.id} className="h-full flex">
                  <ProductCard p={{ ...p, is_flashsale: true }} />
                </div>
              ))}
        </div>

        {/* Nút trái/phải chỉ đổi page */}
        <button
          aria-label="Trang trước"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="absolute -left-3 top-1/2 -translate-y-1/2 rounded-full w-9 h-9 grid place-items-center bg-white border shadow hover:bg-slate-50 disabled:opacity-50"
        >
          ‹
        </button>
        <button
          aria-label="Trang sau"
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasNext && !isLoading}
          className="absolute -right-3 top-1/2 -translate-y-1/2 rounded-full w-9 h-9 grid place-items-center bg-white border shadow hover:bg-slate-50 disabled:opacity-50"
        >
          ›
        </button>

        {error && (
          <div className="text-center text-sm text-red-600 mt-3">
            Không tải được dữ liệu.
          </div>
        )}

        <div className="text-center mt-6 text-xs text-slate-500">
          Trang {page}
        </div>
      </div>
    </section>
  );
}
