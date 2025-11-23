// components/ProductCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/api";
import { imageUrl } from "@/lib/api";
import { useCart, money } from "@/lib/cart";
import { useCartUi } from "@/lib/cart-ui";
import { useCallback, useMemo } from "react";

// tách giá/đơn vị nếu cần cho nút chọn mua
function parsePrice(input?: string | number | null) {
  if (input == null) return 0;
  if (typeof input === "number") return input;

  const digits = (input.match(/\d+/g) || []).join("");
  return Number(digits) || 0;
}

function parseUnit(text?: string, fallback = "Hộp") {
  if (!text) return fallback;
  const parts = text.split("/");
  return parts[1]?.trim() || fallback;
}

export default function ProductCard({ p }: { p: Product }) {
  const add = useCart((s) => s.add);
  const showPeek = useCartUi((s) => s.showPeek);

  const href = useMemo(
    () => `/products/${encodeURIComponent(String(p.id))}`,
    [p.id]
  );

  // 👉 Ưu tiên dùng cột price (number) trong DB, nếu không có thì dùng price_text cũ
  const rawPrice = (p as any).price ?? p.price_text;
  const priceNumber = parsePrice(rawPrice);

  const unit = parseUnit(p.price_text, "Hộp");

  // Giá hiển thị: nếu có price_text thì giữ nguyên, không thì format từ number
  const displayPrice =
    (p as any).price_text && (p as any).price_text.trim().length > 0
      ? (p as any).price_text
      : priceNumber > 0
      ? money(priceNumber)
      : "Liên hệ";

  const imageSrc = useMemo(
    () => imageUrl(p.image_path || (p as any).image || ""),
    [p.image_path, (p as any).image]
  );

  const handleAdd = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
  
      const item = {
        id: Number(p.id),
        name: p.name,
        price: priceNumber,
        unit,
        image: imageSrc || undefined,
        qty: 1,
      };
  
      add(item, 1);
  
      // truyền item vào showPeek để đúng kiểu TypeScript
      showPeek(item as any);
    },
    [add, showPeek, p.id, p.name, imageSrc, priceNumber, unit]
  );
  return (
    <div className="rounded-2xl border bg-white p-3 flex flex-col justify-between h-full">
      {/* Block ảnh */}
      <div className="aspect-square bg-gray-100 relative">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={p.name}
            fill
            className="object-contain p-3"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            No Image
          </div>
        )}
        <Link href={href} className="absolute inset-0" aria-label={p.name} />
      </div>

      <div className="p-3 flex-1 flex flex-col">
        <Link
          href={href}
          className="text-sm font-medium line-clamp-2 group-hover:text-blue-800"
          title={p.name}
        >
          {p.name}
        </Link>

        <div className="mt-1 text-xs text-gray-500">
          {p.brand}
          {p.brand && p.category ? " • " : ""}
          {p.category}
        </div>

        {/* Giá */}
        <div className="mt-2 font-semibold text-blue-800">{displayPrice}</div>

        {/* Hành động */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            href={href}
            className="rounded-xl border px-3 py-2 text-center text-sm hover:bg-slate-50"
          >
            Xem chi tiết
          </Link>
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-xl bg-[#0a56c5] text-white py-2 hover:bg-blue-800 text-sm"
          >
            Chọn mua
          </button>
        </div>
      </div>
    </div>
  );
}
