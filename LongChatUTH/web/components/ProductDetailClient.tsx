"use client";
import { useState, useMemo } from "react";
import { useCart, money } from "@/lib/cart";

type Unit = { unit_name: string; price_value: number };
type Props = {
  productId: number;
  productName: string;
  productImage?: string;
  units: Unit[];
  basePriceText?: string;
};

export default function ProductDetailClient({
  productId,
  productName,
  productImage,
  units,
  basePriceText,
}: Props) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [idx, setIdx] = useState(0);

  const hasUnits = units && units.length > 0;

  const selected = useMemo(() => {
    if (hasUnits) {
      return units[Math.max(0, Math.min(idx, units.length - 1))];
    }

    // fallback: lấy giá từ basePriceText (vd: "45.000đ / Hộp")
    const match = basePriceText?.match(/([\d\.]+)/);
    const price = match ? Number(match[1].replace(/\./g, "")) : 0;
    const unitMatch = basePriceText?.split("/")?.[1]?.trim();

    return { unit_name: unitMatch || "ĐVT", price_value: price };
  }, [idx, units, hasUnits, basePriceText]);

  const price = selected?.price_value || 0;
  const hasNumericPrice = price > 0;
  const unitLabel = selected?.unit_name || "ĐVT";
  const fallbackPriceLabel = basePriceText || "Liên hệ";
  function addToCart() {
    add(
      {
        id: productId,
        name: productName,
        price,
        unit: unitLabel,
        image: productImage,
      },
      qty
    );
  }

  return (
    <div className="bg-white/95">
      {/* Giá */}
      <div className="text-3xl font-bold text-blue-700">
      {hasNumericPrice ? (
          <>
            {money(price)}{" "}
            <span className="text-sm text-slate-500 font-normal">
              / {unitLabel}
            </span>
          </>
        ) : (
          <span className="text-2xl font-semibold text-slate-700">
            {fallbackPriceLabel}
          </span>
        )}
      </div>

      {/* Chọn số lượng */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm">Chọn số lượng</span>
        <div className="inline-flex items-center rounded-lg border">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-3 py-1 text-lg"
            aria-label="decrease"
          >
            –
          </button>
          <span className="w-10 text-center">{qty}</span>
          <button
            onClick={() => setQty((q) => q + 1)}
            className="px-3 py-1 text-lg"
            aria-label="increase"
          >
            +
          </button>
        </div>
      </div>

      {/* Chọn đơn vị */}
      {hasUnits && (
        <div className="flex flex-wrap gap-2">
          {units.map((u, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`px-3 py-2 rounded-lg border text-sm ${
                i === idx
                  ? "bg-blue-50 border-blue-600 text-blue-700"
                  : "hover:bg-slate-50"
              }`}
            >
              {u.unit_name}
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={addToCart}
          className="rounded-xl bg-blue-700 text-white px-5 py-2.5 hover:bg-blue-800"
        >
          Chọn mua
        </button>
        <button className="rounded-xl bg-slate-100 text-slate-700 px-5 py-2.5 hover:bg-slate-200">
          Tìm nhà thuốc
        </button>
      </div>

      {/* Cam kết */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white border p-3 text-sm">
          Đổi trả trong 30 ngày
        </div>
        <div className="rounded-xl bg-white border p-3 text-sm">
          Miễn phí 100% tư vấn dược sĩ
        </div>
        <div className="rounded-xl bg-white border p-3 text-sm">
          Miễn phí vận chuyển
        </div>
      </div>
    </div>
  );
}
