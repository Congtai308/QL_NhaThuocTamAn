// components/home/Categories.tsx
"use client";

import useSWR from "swr";
import Link from "next/link";

type Category = {
  id: number | string;
  name: string;
  total?: number;
  image?: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Categories() {
  const { data, error, isLoading } = useSWR(
    "http://localhost:9000/LongChatUTH/api/index.php?path=categories",
    fetcher,
    { revalidateOnFocus: false }
  );

  const items: Category[] = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
    ? data
    : [];

  return (
    <section className="bg-[#f4f7ff] py-10 rounded-3xl mt-10">
      <h3 className="text-center text-xl font-semibold text-[#0a56c5] mb-8">
        Danh mục nổi bật
      </h3>

      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-white animate-pulse"
            ></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-sm text-red-600">
          Không tải được danh mục.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {items.slice(0, 12).map((c) => (
            <Link
              key={c.id}
              href={`/search?category=${encodeURIComponent(c.name)}`}
              className="flex flex-col items-center bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-3 border border-blue-100 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  c.image ||
                  "/icons/category-default.png"
                }
                alt={c.name}
                className="w-10 h-10 mb-2 object-contain group-hover:scale-110 transition"
              />
              <div className="text-sm text-gray-700 text-center line-clamp-2">
                {c.name}
              </div>
              {typeof c.total === "number" && (
                <div className="text-xs text-gray-400 mt-1">
                  {c.total} sản phẩm
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
