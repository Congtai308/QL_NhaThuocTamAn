"use client";
import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

type Order = {
  order_id: number;
  order_code: string;
  order_date: string;
  status: string;
  total_amount: number;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_address: string | null;
  billing_name: string | null;
  billing_phone: string | null;
  billing_address: string | null;
};

type OrderItem = {
  order_item_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
};

const API = "http://localhost:9000/QL_NhaThuocTamAn/LongChatUTH/api/orders.php";
const STATUSES = ["Pending", "Paid", "Processing", "Shipped", "Completed", "Cancelled"];

export default function OrdersPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // detail modal
  const [detail, setDetail] = useState<{ order: Order; items: OrderItem[] } | null>(null);
  const [upStatus, setUpStatus] = useState("");

  const fetchList = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.append("q", q);
      if (status) params.append("status", status);
      if (from) params.append("from", from);
      if (to) params.append("to", to);

      const res = await fetch(`${API}?${params.toString()}`);
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      toast.error("Không tải được danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id: number) => {
    try {
      const res = await fetch(`${API}?id=${id}`);
      const data = await res.json();
      if (data.order) {
        setDetail(data);
        setUpStatus(data.order.status || "");
      } else {
        toast.error("Không lấy được chi tiết đơn");
      }
    } catch {
      toast.error("Lỗi khi tải chi tiết đơn");
    }
  };

  useEffect(() => { fetchList(); }, []); // lần đầu

  const onApplyFilter = () => fetchList();

  const onUpdateStatus = async () => {
    if (!detail) return;
    try {
      const fd = new FormData();
      fd.append("status", upStatus);
      const res = await fetch(`${API}?id=${detail.order.order_id}`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã cập nhật trạng thái");
        setDetail((d) => (d ? { ...d, order: { ...d.order, status: upStatus } } : d));
        fetchList();
      } else toast.error(data.message || "Cập nhật thất bại");
    } catch {
      toast.error("Không thể cập nhật");
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Xoá đơn hàng này?")) return;
    try {
      const res = await fetch(`${API}?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã xoá");
        setItems((prev) => prev.filter((x) => x.order_id !== id));
        if (detail?.order.order_id === id) setDetail(null);
      } else toast.error(data.message || "Xoá thất bại");
    } catch {
      toast.error("Không thể xoá");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold text-blue-700">📦 Đơn hàng</h1>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4 grid md:grid-cols-5 gap-3">
        <input
          className="border p-2 rounded"
          placeholder="🔍 Mã đơn / tên / điện thoại..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="border p-2 rounded" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">-- Trạng thái --</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input className="border p-2 rounded" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input className="border p-2 rounded" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button onClick={onApplyFilter} className="bg-blue-600 text-white rounded px-4">Lọc</button>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-400">Đang tải…</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Không có đơn hàng</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-2 text-left">Mã đơn</th>
                <th className="p-2 text-left">Ngày đặt</th>
                <th className="p-2 text-right">Tổng tiền</th>
                <th className="p-2 text-left">Khách (nhận)</th>
                <th className="p-2 text-left">SĐT</th>
                <th className="p-2 text-left">Trạng thái</th>
                <th className="p-2 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o.order_id} className="border-t hover:bg-gray-50">
                  <td className="p-2 font-medium">{o.order_code}</td>
                  <td className="p-2">{o.order_date ? new Date(o.order_date).toLocaleString() : "—"}</td>
                  <td className="p-2 text-right font-semibold text-blue-700">
                    {Number(o.total_amount || 0).toLocaleString()}₫
                  </td>
                  <td className="p-2">{o.shipping_name || "—"}</td>
                  <td className="p-2">{o.shipping_phone || "—"}</td>
                  <td className="p-2">
                    <span className="px-2 py-1 rounded text-xs bg-gray-100">{o.status || "—"}</span>
                  </td>
                  <td className="p-2 text-center space-x-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => fetchDetail(o.order_id)}
                    >
                      Chi tiết
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => onDelete(o.order_id)}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl w-full max-w-3xl p-6 shadow-xl">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-semibold">Chi tiết đơn: {detail.order.order_code}</h2>
              <button onClick={() => setDetail(null)} className="text-gray-500 hover:text-black">✖</button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm">
              <div className="border rounded p-3">
                <div className="font-medium mb-2">Thông tin nhận hàng</div>
                <div>Tên: {detail.order.shipping_name || "—"}</div>
                <div>Điện thoại: {detail.order.shipping_phone || "—"}</div>
                <div>Địa chỉ: {detail.order.shipping_address || "—"}</div>
              </div>
              <div className="border rounded p-3">
                <div className="font-medium mb-2">Thông tin thanh toán</div>
                <div>Tên: {detail.order.billing_name || "—"}</div>
                <div>Điện thoại: {detail.order.billing_phone || "—"}</div>
                <div>Địa chỉ: {detail.order.billing_address || "—"}</div>
              </div>
            </div>

            <div className="mt-4 border rounded overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left">Sản phẩm</th>
                    <th className="p-2 text-right">Đơn giá</th>
                    <th className="p-2 text-right">SL</th>
                    <th className="p-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.length === 0 ? (
                    <tr><td className="p-3 text-center text-gray-500" colSpan={4}>Không có dòng hàng</td></tr>
                  ) : (
                    detail.items.map((it) => (
                      <tr key={it.order_item_id} className="border-t">
                        <td className="p-2">{it.product_name || `#${it.product_id}`}</td>
                        <td className="p-2 text-right">{Number(it.unit_price||0).toLocaleString()}₫</td>
                        <td className="p-2 text-right">{it.quantity}</td>
                        <td className="p-2 text-right">
                          {(Number(it.unit_price||0) * Number(it.quantity||0)).toLocaleString()}₫
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Ngày đặt: {detail.order.order_date ? new Date(detail.order.order_date).toLocaleString() : "—"}
              </div>
              <div className="text-right">
                <div className="text-sm">Tổng tiền</div>
                <div className="text-xl font-bold text-blue-700">
                  {Number(detail.order.total_amount || 0).toLocaleString()}₫
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <select className="border p-2 rounded" value={upStatus} onChange={(e) => setUpStatus(e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={onUpdateStatus} className="bg-blue-600 text-white px-4 py-2 rounded">Cập nhật trạng thái</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
