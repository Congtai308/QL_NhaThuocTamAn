"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart, money } from "@/lib/cart";

/* Inline icons (không phụ thuộc lib) */
const Trash = (p: any) => (
  <svg width="18" height="18" viewBox="0 0 24 24" {...p}>
    <path
      fill="currentColor"
      d="M9 3h6a1 1 0 0 1 1 1v1h5v2H3V5h5V4a1 1 0 0 1 1-1Zm1 5h2v10h-2V8Zm4 0h2v10h-2V8ZM7 8h2v10H7V8Z"
    />
  </svg>
);
const ChevronDown = (p: any) => (
  <svg width="16" height="16" viewBox="0 0 24 24" {...p}>
    <path fill="currentColor" d="m7 10 5 5 5-5z" />
  </svg>
);

/** Hạt điều khiển số lượng kiểu pill */
function QtyPill({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border overflow-hidden">
      <button
        className="px-3 py-1 text-lg hover:bg-slate-50"
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label="Giảm"
      >
        –
      </button>
      <span className="w-9 text-center">{value}</span>
      <button
        className="px-3 py-1 text-lg hover:bg-slate-50"
        onClick={() => onChange(value + 1)}
        aria-label="Tăng"
      >
        +
      </button>
    </div>
  );
}

export default function CartPage() {
  const { items, setQty, inc, remove, clear, subtotal } = useCart();

  // Trạng thái chọn dòng (mặc định chọn tất cả)
  const [selected, setSelected] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(items.map((i) => [i.id, true]))
  );
  const allChecked = useMemo(
    () => items.length > 0 && items.every((i) => selected[i.id]),
    [items, selected]
  );

  const toggleAll = () => {
    const val = !allChecked;
    setSelected(Object.fromEntries(items.map((i) => [i.id, val])));
  };

  const selectedItems = items.filter((i) => selected[i.id]);
  const selectedTotal = selectedItems.reduce((s, i) => s + i.qty * i.price, 0);

  if (items.length === 0) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-4">Giỏ hàng</h1>
        <div className="rounded-2xl border p-10 text-center bg-white">
          Giỏ hàng trống.{" "}
          <Link href="/" className="text-blue-700 underline">
            Tiếp tục mua sắm
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Giỏ hàng</h1>

      <div className="rounded-2xl border overflow-hidden bg-white">
        {/* Header hàng */}
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 text-sm">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              className="accent-blue-700 w-4 h-4"
              checked={allChecked}
              onChange={toggleAll}
            />
            <span>Chọn tất cả ({items.length})</span>
          </label>
          <div className="ml-auto grid grid-cols-[120px_140px_120px_40px] gap-4 text-slate-500">
            <span className="text-right">Giá thành</span>
            <span className="text-center">Số lượng</span>
            <span className="text-center">Đơn vị</span>
            <span />
          </div>
        </div>

        {/* Các dòng sản phẩm */}
        {items.map((it) => (
          <div
            key={it.id}
            className="flex items-stretch gap-3 px-4 py-4 border-t"
          >
            {/* checkbox */}
            <div className="pt-2">
              <input
                type="checkbox"
                className="accent-blue-700 w-4 h-4"
                checked={!!selected[it.id]}
                onChange={() =>
                  setSelected((s) => ({ ...s, [it.id]: !s[it.id] }))
                }
              />
            </div>

            {/* ảnh + tên + tag */}
            <div className="flex-1 flex gap-3">
              <div className="w-16 h-16 rounded-lg border bg-white overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.image || "/placeholder.png"}
                  alt={it.name}
                  className="w-full h-full object-contain p-1"
                />
              </div>

              <div className="flex-1">
                {/* tag flash sale (demo) */}
                {Math.random() < 0.4 && (
                  <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full mb-1">
                    <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full" />
                    Flash sale giá sốc
                  </span>
                )}
                <div className="leading-snug">
                  <div className="font-medium text-sm md:text-base">
                    {it.name}
                  </div>
                </div>
              </div>
            </div>

            {/* cột giá / số lượng / đơn vị / xóa */}
            <div className="ml-auto grid grid-cols-[120px_140px_120px_40px] gap-4 items-center">
              {/* Giá */}
              <div className="text-right text-blue-700 font-semibold">
                {money(it.price)}
              </div>

              {/* Số lượng */}
              <div className="flex items-center justify-center">
                <QtyPill value={it.qty} onChange={(n) => setQty(it.id, n)} />
              </div>

              {/* Đơn vị (dropdown đẹp) */}
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm bg-white hover:bg-slate-50 cursor-pointer">
                  {it.unit || "HỘP"}
                  <ChevronDown className="text-slate-500" />
                </div>
              </div>

              {/* Xóa */}
              <div className="flex items-center justify-end">
                <button
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                  onClick={() => remove(it.id)}
                  aria-label="Xóa"
                  title="Xóa"
                >
                  <Trash />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Banner khuyến mãi */}
        <div className="px-4 py-3 bg-slate-50">
          <div className="flex items-center gap-2 text-sm">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-100 text-rose-600">
              %
            </span>
            <div className="flex-1">
              <div className="font-medium">
                Giảm ngay 5% khi mua Online 8h – 22h
              </div>
              <div className="text-slate-500">Áp dụng đến 20/10</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tổng kết và CTA */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center gap-4">
        <button className="text-slate-500 underline" onClick={clear}>
          Xóa toàn bộ
        </button>

        <div className="md:ml-auto rounded-2xl border bg-white px-5 py-4 flex items-center gap-6">
          <div>
            <div className="text-sm text-slate-500">
              Tạm tính ({selectedItems.length} sản phẩm)
            </div>
            <div className="text-2xl font-semibold text-blue-700">
              {money(selectedTotal)}
            </div>
          </div>
          <button className="rounded-xl bg-blue-700 text-white px-6 py-2.5 hover:bg-blue-800">
            Thanh toán
          </button>
        </div>
      </div>
    </main>
  );
}
