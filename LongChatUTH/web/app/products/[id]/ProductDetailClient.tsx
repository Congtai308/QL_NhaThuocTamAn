// components/ui/ProductDetailClient.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart, money } from "@/lib/cart";

type Unit = { unit_name: string; price_value: number };

type Props = {
  productId: number;
  productName: string;
  productImage?: string;
  units: Unit[];
  basePriceText?: string;

  // thêm props để hiển thị info thuốc
  category?: string;
  manufacturer?: string;
  origin?: string;
  sizeSpec?: string;
};

export default function ProductDetailClient({
  productId,
  productName,
  productImage,
  units,
  basePriceText,
  category,
  manufacturer,
  origin,
  sizeSpec,
}: Props) {
  const router = useRouter();
  const add = useCart((s) => s.add);

  const [qty, setQty] = useState(1);
  const [idx, setIdx] = useState(0);

  const hasUnits = units && units.length > 0;

  const selected = useMemo(() => {
    if (hasUnits) {
      return units[Math.max(0, Math.min(idx, units.length - 1))];
    }

    // fallback: dùng basePriceText (vd "105.000đ / Hộp")
    const match = basePriceText?.match(/([\d\.]+)/);
    const priceNum = match ? Number(match[1].replace(/\./g, "")) : 0;
    const unitMatch = basePriceText?.split("/")?.[1]?.trim();

    return { unit_name: unitMatch || "Đơn vị", price_value: priceNum };
  }, [idx, units, hasUnits, basePriceText]);

  const rawPrice = selected?.price_value ?? 0;
  const unitLabel = selected?.unit_name || "Đơn vị";

  // Xử lý giá hiển thị + giá dùng để add vào giỏ
  let effectivePrice = 0;
  let displayPrice = "";
  let hasNumericPrice = false;

  if (rawPrice > 0) {
    // Nếu giá < 1000 thì coi như là "nghìn" (2.5 => 2.500đ)
    effectivePrice = rawPrice >= 1000 ? rawPrice : rawPrice * 1000;
    displayPrice = money(effectivePrice);
    hasNumericPrice = true;
  } else if (basePriceText) {
    const match = basePriceText.match(/([\d\.]+)/);
    if (match) {
      let parsed = Number(match[1].replace(/\./g, ""));
      if (parsed > 0 && parsed < 1000) parsed *= 1000;
      effectivePrice = parsed;
      displayPrice = money(effectivePrice);
      hasNumericPrice = effectivePrice > 0;
    } else {
      displayPrice = basePriceText;
    }
  } else {
    displayPrice = "Liên hệ";
  }

  function addToCart() {
    add(
      {
        id: productId,
        name: productName,
        price: effectivePrice,
        unit: unitLabel,
        image: productImage,
      },
      qty
    );

    // Sau khi thêm giỏ => chuyển sang trang giỏ
    router.push("/cart");
  }

  return (
    <div className="bg-white/95 rounded-2xl border border-blue-100 p-4 sm:p-5 space-y-4">
      {/* Giá */}
      <div className="space-y-1">
        <div className="text-3xl sm:text-4xl font-bold text-[#0a56c5]">
          {hasNumericPrice ? (
            <>
              {displayPrice}{" "}
              <span className="text-sm sm:text-base text-slate-500 font-normal">
                / {unitLabel}
              </span>
            </>
          ) : (
            <span className="text-2xl font-semibold text-slate-700">
              {displayPrice}
            </span>
          )}
        </div>
        <div className="text-xs text-emerald-600 font-medium">
          Đang còn hàng • Giao nhanh trong 1–2h nội thành
        </div>
      </div>

      {/* Chọn đơn vị */}
      {hasUnits && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-700">
            Chọn đơn vị tính
          </div>
          <div className="flex flex-wrap gap-2">
            {units.map((u, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`px-3 py-2 rounded-xl border text-sm transition ${
                  i === idx
                    ? "bg-[#e7f0ff] border-[#0a56c5] text-[#0a56c5] font-semibold"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {u.unit_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 🔹 THÔNG TIN THUỐC – nằm TRÊN phần chọn số lượng + nút mua (giống Long Châu) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
        {category && (
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <div className="text-slate-500">Danh mục</div>
            <div className="font-medium text-slate-800">{category}</div>
          </div>
        )}
        {manufacturer && (
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <div className="text-slate-500">Nhà sản xuất</div>
            <div className="font-medium text-slate-800">{manufacturer}</div>
          </div>
        )}
        {origin && (
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <div className="text-slate-500">Xuất xứ thương hiệu</div>
            <div className="font-medium text-slate-800">{origin}</div>
          </div>
        )}
        {sizeSpec && (
          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <div className="text-slate-500">Quy cách đóng gói</div>
            <div className="font-medium text-slate-800">{sizeSpec}</div>
          </div>
        )}
      </div>

      {/* Chọn số lượng */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-700">Chọn số lượng</span>
        <div className="inline-flex items-center rounded-full border border-slate-300 overflow-hidden bg-slate-50">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 py-1.5 text-lg hover:bg-slate-100"
            aria-label="Giảm số lượng"
          >
            –
          </button>
          <span className="w-10 text-center text-sm font-medium">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="px-3 py-1.5 text-lg hover:bg-slate-100"
            aria-label="Tăng số lượng"
          >
            +
          </button>
        </div>
      </div>

      {/* Nút hành động */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={addToCart}
          className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0a56c5] text-white px-5 py-3 text-sm font-semibold hover:bg-blue-800 active:scale-[.99]"
        >
          🛒 Chọn mua
        </button>
        <button className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-700 hover:bg-slate-100">
          📍 Tìm nhà thuốc
        </button>
      </div>

      {/* Cam kết */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
          <div className="font-semibold">Đổi trả trong 30 ngày</div>
          <div className="text-[11px] text-slate-500">
            Áp dụng theo chính sách bán hàng.
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
          <div className="font-semibold">Tư vấn bởi Dược sĩ</div>
          <div className="text-[11px] text-slate-500">
            Gọi 1800 6928 (miễn phí).
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
          <div className="font-semibold">Miễn phí vận chuyển</div>
          <div className="text-[11px] text-slate-500">
            Cho đơn từ 300.000đ nội thành.
          </div>
        </div>
      </div>
    </div>
  );
}
