"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Order = {
  order_id: number;
  order_code: string;
  order_date: string;
  status: string;
  total_amount: number;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_address: string | null;
};

type OrderItem = {
  order_item_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
};

const API = "/api/php?path=orders";
export default function MyOrdersPage() {
  const searchParams = useSearchParams();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [detail, setDetail] = useState<{
    order: Order;
    items: OrderItem[];
  } | null>(null);

  // Lấy phone / code từ query (khi redirect sau đặt hàng)
  useEffect(() => {
    const p = searchParams.get("phone") || "";
    const c = searchParams.get("code") || "";
    if (p) setPhone(p);
    if (c) setCode(c);

    // nếu có phone -> tự tìm luôn
    if (p) {
      handleSearch(p, c);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async (phoneArg?: string, codeArg?: string) => {
    const searchPhone = (phoneArg ?? phone).trim();
    const searchCode = (codeArg ?? code).trim();

    // Không nhập gì thì báo lỗi
    if (!searchPhone && !searchCode) {
      setError("Vui lòng nhập ít nhất Số điện thoại hoặc Mã đơn hàng");
      setOrders([]);
      return;
    }

    // Ưu tiên tìm theo mã đơn, nếu có; nếu không thì dùng số điện thoại
    const query = searchCode || searchPhone;

    setError(null);
    setLoading(true);
    setOrders([]);

    try {
      const res = await fetch(`${API}?q=${encodeURIComponent(query)}`);
      const data = await res.json();

      const items: Order[] = Array.isArray(data.items) ? data.items : [];
      setOrders(items);

      if (items.length === 0) {
        setError("Không tìm thấy đơn hàng phù hợp.");
      }
    } catch (err) {
      console.error(err);
      setError("Có lỗi khi tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const fetchDetail = async (id: number) => {
    try {
      const res = await fetch(`${API}?id=${id}`);
      const data = await res.json();
      if (data.order) {
        setDetail(data);
      } else {
        alert("Không lấy được chi tiết đơn hàng");
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi khi tải chi tiết đơn hàng");
    }
  };

  const formatDate = (d?: string | null) => {
    if (!d) return "—";
    const dd = new Date(d);
    if (Number.isNaN(dd.getTime())) return d;
    return dd.toLocaleString("vi-VN");
  };

  const formatMoney = (n?: number | null) =>
    Number(n || 0).toLocaleString("vi-VN") + "₫";

  const statusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Paid":
      case "Processing":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "Shipped":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <main className="min-h-[60vh] bg-[#f2f5fb] py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Link href="/" className="text-blue-700 hover:underline">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">Đơn hàng của tôi</span>
        </div>

        {/* Form tra cứu */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm space-y-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Tra cứu đơn hàng
            </h1>
            <p className="text-sm text-slate-500">
              Nhập số điện thoại đã dùng khi đặt hàng, có thể thêm mã đơn để lọc
              nhanh hơn.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-3 md:grid-cols-[1.4fr_1fr_auto]"
          >
            <input
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-50 outline-none"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-50 outline-none"
              placeholder="Mã đơn hàng (không bắt buộc)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-xl bg-[#0a56c5] text-white px-6 py-2.5 text-sm font-medium hover:bg-blue-800 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? "Đang tìm..." : "Xem đơn hàng"}
            </button>
          </form>

          {error && (
            <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </section>

        {/* Danh sách đơn */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Danh sách đơn hàng
          </h2>

          {loading && orders.length === 0 ? (
            <div className="py-6 text-center text-slate-400">
              Đang tải danh sách đơn hàng…
            </div>
          ) : orders.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-sm">
              Chưa có đơn hàng nào được tìm thấy.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-2 text-left">Mã đơn</th>
                    <th className="p-2 text-left">Ngày đặt</th>
                    <th className="p-2 text-right">Tổng tiền</th>
                    <th className="p-2 text-left">Trạng thái</th>
                    <th className="p-2 text-center">Xem</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.order_id} className="border-t hover:bg-slate-50">
                      <td className="p-2 font-medium text-slate-800">
                        {o.order_code}
                      </td>
                      <td className="p-2 text-slate-600">
                        {formatDate(o.order_date)}
                      </td>
                      <td className="p-2 text-right font-semibold text-blue-700">
                        {formatMoney(o.total_amount)}
                      </td>
                      <td className="p-2">
                        <span
                          className={
                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs border " +
                            statusColor(o.status)
                          }
                        >
                          {o.status || "—"}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <button
                          className="text-blue-700 hover:underline text-sm"
                          onClick={() => fetchDetail(o.order_id)}
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-3 text-xs text-slate-500">
            Nếu bạn không nhớ mã đơn, chỉ cần nhập số điện thoại để xem tất cả
            đơn đã đặt bằng số đó.
          </p>
        </section>
      </div>

      {/* Modal chi tiết */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-xl">
            <div className="flex justify-between items-start gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Đơn hàng {detail.order.order_code}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Ngày đặt: {formatDate(detail.order.order_date)}
                </p>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm">
              <div className="border rounded-xl p-3 bg-slate-50/60">
                <div className="font-medium mb-2 text-slate-800">
                  Thông tin giao hàng
                </div>
                <div>Tên: {detail.order.shipping_name || "—"}</div>
                <div>Điện thoại: {detail.order.shipping_phone || "—"}</div>
                <div>Địa chỉ: {detail.order.shipping_address || "—"}</div>
              </div>
              <div className="border rounded-xl p-3 bg-slate-50/60">
                <div className="font-medium mb-2 text-slate-800">
                  Thông tin thanh toán
                </div>
                <div>Tên: {detail.order.shipping_name || "—"}</div>
                <div>Điện thoại: {detail.order.shipping_phone || "—"}</div>
                <div>Hình thức: Thanh toán khi nhận hàng</div>
              </div>
            </div>

            <div className="mt-4 border rounded-xl overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-2 text-left">Sản phẩm</th>
                    <th className="p-2 text-right">Đơn giá</th>
                    <th className="p-2 text-right">SL</th>
                    <th className="p-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.length === 0 ? (
                    <tr>
                      <td
                        className="p-3 text-center text-slate-500"
                        colSpan={4}
                      >
                        Không có dòng hàng
                      </td>
                    </tr>
                  ) : (
                    detail.items.map((it) => (
                      <tr key={it.order_item_id} className="border-t">
                        <td className="p-2">
                          {it.product_name || `#${it.product_id}`}
                        </td>
                        <td className="p-2 text-right">
                          {formatMoney(it.unit_price)}
                        </td>
                        <td className="p-2 text-right">{it.quantity}</td>
                        <td className="p-2 text-right">
                          {formatMoney(
                            Number(it.unit_price || 0) *
                              Number(it.quantity || 0)
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Trạng thái:{" "}
                <span
                  className={
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs border " +
                    statusColor(detail.order.status)
                  }
                >
                  {detail.order.status || "—"}
                </span>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Tổng tiền</div>
                <div className="text-xl font-bold text-blue-700">
                  {formatMoney(detail.order.total_amount)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
