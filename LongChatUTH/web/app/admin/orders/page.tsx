"use client";

import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

type Order = {
  order_id: number;
  order_code: string;
  order_date?: string;
  total_amount?: number | string;
  status?: string;
  shipping_name?: string | null;
  phone?: string | null;
};

type OrderForm = {
  order_code: string;
  order_date: string;
  total_amount: string;
  status: string;
  shipping_name: string;
  phone: string;
};

const ORDER_API =
  "/api/php?path=orders";

const emptyForm: OrderForm = {
  order_code: "",
  order_date: "",
  total_amount: "",
  status: "Pending",
  shipping_name: "",
  phone: "",
};

const formatMoney = (n: number) =>
  n.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "₫";

export default function AdminOrders() {
  const [items, setItems] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // filter
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // modal
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form, setForm] = useState<OrderForm>(emptyForm);

  // fetch
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(ORDER_API);
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      toast.error("Không tải được danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((o) => {
      const matchesQ =
        !needle ||
        o.order_code?.toLowerCase().includes(needle) ||
        o.shipping_name?.toLowerCase().includes(needle) ||
        o.phone?.toLowerCase().includes(needle);
      const matchesStatus =
        !statusFilter ||
        (o.status || "").toLowerCase() === statusFilter.toLowerCase();
      return matchesQ && matchesStatus;
    });
  }, [items, q, statusFilter]);

  const totalOrders = items.length;
  const totalRevenue = items.reduce(
    (s, o) => s + Number(o.total_amount || 0),
    0
  );
  const pendingOrders = items.filter((o) =>
    (o.status || "").toLowerCase().includes("pending")
  ).length;
  const completedOrders = items.filter((o) =>
    (o.status || "").toLowerCase().includes("completed")
  ).length;

  // ===== handlers =====
  const openAddModal = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEditModal = (o: Order) => {
    setEditing(o);
    setForm({
      order_code: o.order_code || "",
      order_date: o.order_date
        ? new Date(o.order_date).toISOString().slice(0, 16) // datetime-local
        : "",
      total_amount: String(o.total_amount ?? ""),
      status: o.status || "Pending",
      shipping_name: o.shipping_name || "",
      phone: o.phone || "",
    });
    setOpen(true);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.order_code) return toast.error("Vui lòng nhập mã đơn!");

    const fd = new FormData();
    fd.append("order_code", form.order_code);
    fd.append("order_date", form.order_date || "");
    fd.append("total_amount", form.total_amount || "");
    fd.append("status", form.status || "");
    fd.append("shipping_name", form.shipping_name || "");
    fd.append("phone", form.phone || "");

    const url = editing ? `${ORDER_API}&id=${editing.order_id}` : ORDER_API;

    try {
      const res = await fetch(url, { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        toast.success(editing ? "Đã cập nhật đơn hàng" : "Đã tạo đơn hàng");
        setOpen(false);
        setEditing(null);
        setForm(emptyForm);
        fetchOrders();
      } else {
        toast.error(data.message || "Lỗi khi lưu đơn hàng!");
      }
    } catch {
      toast.error("Không thể gửi dữ liệu!");
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Xoá đơn hàng này?")) return;
    try {
      const res = await fetch(`${ORDER_API}&id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã xoá đơn hàng");
        setItems((prev) => prev.filter((x) => x.order_id !== id));
      } else toast.error(data.message || "Xoá thất bại!");
    } catch {
      toast.error("Không thể xoá!");
    }
  };

  return (
    <div className="space-y-6 w-full">
      <Toaster position="top-right" />

      {/* HEADER VIP */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              📦
            </span>
            Quản lý đơn hàng
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi trạng thái, khách hàng và tổng tiền đơn hàng theo thời gian
            thực.
          </p>
        </div>
        <div className="hidden md:flex flex-col items-end text-right text-xs text-gray-500">
          <span>Doanh thu tích lũy</span>
          <span className="font-semibold text-lg text-blue-700">
            {formatMoney(totalRevenue)}
          </span>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="admin-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Tổng đơn hàng
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {totalOrders.toLocaleString("vi-VN")}
            </p>
          </div>
          <span className="inline-flex h-9 px-3 items-center justify-center rounded-2xl bg-blue-50 text-xs text-blue-700">
            + {pendingOrders} đang chờ xử lý
          </span>
        </div>

        <div className="admin-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Đơn hoàn tất
            </p>
            <p className="mt-1 text-2xl font-semibold text-emerald-700">
              {completedOrders.toLocaleString("vi-VN")}
            </p>
          </div>
          <span className="inline-flex h-9 px-3 items-center justify-center rounded-2xl bg-emerald-50 text-xs text-emerald-700">
            Tỷ lệ{" "}
            {totalOrders
              ? Math.round((completedOrders / totalOrders) * 100)
              : 0}
            %
          </span>
        </div>

        <div className="admin-card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Doanh thu (₫)
            </p>
            <p className="mt-1 text-2xl font-semibold text-indigo-700">
              {formatMoney(totalRevenue)}
            </p>
          </div>
          <span className="inline-flex h-9 px-3 items-center justify-center rounded-2xl bg-indigo-50 text-xs text-indigo-700">
            Từ {totalOrders.toLocaleString("vi-VN")} đơn
          </span>
        </div>
      </div>

      {/* Info + filter */}
      <div className="admin-card p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-700">
            <div>
              <div className="text-xs text-gray-400">Đơn phù hợp bộ lọc</div>
              <div className="font-semibold">
                {filtered.length.toLocaleString("vi-VN")} đơn
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Doanh thu hiện tại</div>
              <div className="font-semibold text-emerald-600">
                {formatMoney(totalRevenue)}
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Dữ liệu realtime từ API PHP
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-1">
          <div className="relative flex-1 min-w-[220px]">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">
              🔍
            </span>
            <input
              className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tìm theo mã đơn, tên KH, SĐT…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <select
            className="border p-2 rounded-lg text-sm min-w-[150px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card overflow-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-400 animate-pulse">
            Đang tải…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Không có đơn hàng</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-2 text-left">Mã đơn</th>
                <th className="p-2 text-left">Khách hàng</th>
                <th className="p-2 text-left">SĐT</th>
                <th className="p-2 text-left">Ngày đặt</th>
                <th className="p-2 text-right">Tổng tiền</th>
                <th className="p-2 text-center">Trạng thái</th>
                <th className="p-2 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr
                  key={o.order_id}
                  className="border-t hover:bg-slate-50/80 transition-colors"
                >
                  <td className="p-2 font-medium text-slate-800">
                    {o.order_code}
                  </td>
                  <td className="p-2">{o.shipping_name || "Khách lẻ"}</td>
                  <td className="p-2 text-xs text-slate-600">
                    {o.phone || "—"}
                  </td>
                  <td className="p-2 text-xs text-slate-500">
                    {o.order_date
                      ? new Date(o.order_date).toLocaleString("vi-VN")
                      : "—"}
                  </td>
                  <td className="p-2 text-right font-semibold text-blue-700">
                    {formatMoney(Number(o.total_amount || 0))}
                  </td>
                  <td className="p-2 text-center">
                    <StatusBadge status={o.status || "Pending"} />
                  </td>
                  <td className="p-2 text-center space-x-2">
                    <button
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-medium"
                      onClick={() => openEditModal(o)}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium"
                      onClick={() => onDelete(o.order_id)}
                    >
                      🗑️ Xoá
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            {/* Header modal */}
            <div className="bg-gradient-to-r from-blue-600 to-sky-500 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                    📦
                  </span>
                  {editing ? "Sửa đơn hàng" : "Tạo đơn hàng mới"}
                </h2>
                <p className="text-xs text-blue-100 mt-0.5">
                  Cập nhật thông tin đơn hàng và trạng thái xử lý.
                </p>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  setEditing(null);
                  setForm(emptyForm);
                }}
                className="text-blue-50 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Body form */}
            <form onSubmit={onSave} className="grid grid-cols-2 gap-5 p-6">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Mã đơn *
                </label>
                <input
                  className="w-full mt-1 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={form.order_code}
                  onChange={(e) =>
                    setForm({ ...form, order_code: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Thời gian đặt
                </label>
                <input
                  type="datetime-local"
                  className="w-full mt-1 border rounded-lg p-3 text-sm"
                  value={form.order_date}
                  onChange={(e) =>
                    setForm({ ...form, order_date: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Tổng tiền (₫)
                </label>
                <input
                  type="number"
                  className="w-full mt-1 border rounded-lg p-3 text-sm"
                  value={form.total_amount}
                  onChange={(e) =>
                    setForm({ ...form, total_amount: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Trạng thái
                </label>
                <select
                  className="w-full mt-1 border rounded-lg p-3 text-sm bg-white"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Khách hàng
                </label>
                <input
                  className="w-full mt-1 border rounded-lg p-3 text-sm"
                  value={form.shipping_name}
                  onChange={(e) =>
                    setForm({ ...form, shipping_name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Số điện thoại
                </label>
                <input
                  className="w-full mt-1 border rounded-lg p-3 text-sm"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setEditing(null);
                    setForm(emptyForm);
                  }}
                  className="px-5 py-2.5 border rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 text-sm"
                >
                  {editing ? "Cập nhật" : "Lưu đơn hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Badge giống dashboard/products
function StatusBadge({ status }: { status: string }) {
  const normalized = (status || "").toLowerCase();
  let color = "bg-slate-100 text-slate-700 border-slate-200";

  if (normalized.includes("pending")) {
    color = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (normalized.includes("paid") || normalized.includes("processing")) {
    color = "bg-sky-50 text-sky-700 border-sky-200";
  } else if (normalized.includes("completed")) {
    color = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (normalized.includes("cancel")) {
    color = "bg-rose-50 text-rose-700 border-rose-200";
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full border text-[11px] font-medium ${color}`}
    >
      {status || "—"}
    </span>
  );
}
