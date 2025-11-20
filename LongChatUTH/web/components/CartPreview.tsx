"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart, money } from "@/lib/cart";

type CartItem = {
  id: number | string;
  name: string;
  price: number;
  qty: number;
  unit?: string;
  image?: string;
};

export default function CartPreview() {
  const items = useCart((s: any) => (s.items || []) as CartItem[]);

  const totalQty = items.reduce((sum, it) => sum + (it.qty || 0), 0);
  const totalPrice = items.reduce(
    (sum, it) => sum + (it.price || 0) * (it.qty || 0),
    0
  );

  return (
    <div className="relative group ml-2">
      {/* Nút giỏ hàng đẹp hơn */}
      <Link
        href="/cart"
        className="group relative inline-flex items-center justify-center rounded-full bg-[#0a56c5] text-white px-4 py-2 sm:px-5 sm:py-2.5 shadow-md hover:bg-[#0847a5] transition"
      >
        {/* Badge đỏ số lượng */}
        {totalQty > 0 && (
          <span className="absolute -top-1 -left-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#f04438] text-[10px] font-bold leading-none">
            {totalQty > 9 ? "9+" : totalQty}
          </span>
        )}

        {/* Icon */}
        <span className="mr-2 text-lg leading-none" role="img">
          🛒
        </span>

        {/* Chữ chia 2 dòng */}
        <span className="flex flex-col leading-tight text-[11px] sm:text-xs font-semibold">
          <span>Giỏ</span>
          <span>hàng</span>
        </span>
      </Link>

      {/* Popup mini cart khi hover */}
      <div className="pointer-events-none opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150">
        <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-xl border border-slate-100 z-50">
          <div className="px-4 py-3 border-b text-sm font-semibold text-slate-800">
            Giỏ hàng
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500">
              Chưa có sản phẩm nào trong giỏ.
            </div>
          ) : (
            <>
              <div className="max-h-72 overflow-y-auto divide-y">
                {items.map((item: any) => (
                  <div
                    key={String(item.id) + "-" + (item.unit || "")}
                    className="flex gap-3 px-4 py-3 text-sm"
                  >
                    <div className="w-12 h-12 rounded border bg-slate-50 overflow-hidden flex-shrink-0 relative">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-800 line-clamp-2">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        x{item.qty} {item.unit}
                      </div>
                    </div>

                    <div className="text-xs font-semibold text-slate-800">
                      {money(item.price * item.qty)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 py-3 border-t space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">
                    Tổng ({totalQty} sản phẩm)
                  </span>
                  <span className="font-semibold text-slate-900">
                    {money(totalPrice)}
                  </span>
                </div>
                <Link
                  href="/cart"
                  className="block text-center rounded-full bg-[#0a56c5] text-white py-2 font-semibold hover:bg-blue-700"
                >
                  Xem giỏ hàng
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
