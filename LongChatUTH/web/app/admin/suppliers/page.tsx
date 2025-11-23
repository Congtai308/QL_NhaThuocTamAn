"use client";

import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

type Supplier = {
  supplier_id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
};

const API =
  "/api/php?path=suppliers";

const initialForm: Omit<Supplier, "supplier_id"> = {
  name: "",
  address: "",
  phone: "",
  email: "",
};

export default function SuppliersPage() {
  const [items, setItems] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(initialForm);
  const [open, setOpen] = useState(false);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch(API);
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      toast.error("Không tải được danh sách nhà cung cấp!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((s) =>
      [s.name, s.address, s.phone, s.email].join(" ").toLowerCase().includes(q)
    );
  }, [items, search]);

  const totalSuppliers = items.length;

  const resetForm = () => {
    setEditing(null);
    setForm(initialForm);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast.error("Vui lòng nhập tên nhà cung cấp!");
      return;
    }

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("address", form.address);
    fd.append("phone", form.phone);
    fd.append("email", form.email);

    const url = editing ? `${API}?id=${editing.supplier_id}` : API;

    try {
      const res = await fetch(url, { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        toast.success(
          editing ? "Đã cập nhật nhà cung cấp" : "Đã thêm nhà cung cấp"
        );
        resetForm();
        setOpen(false);
        fetchSuppliers();
      } else {
        toast.error(data.message || "Lỗi khi lưu!");
      }
    } catch {
      toast.error("Không thể gửi dữ liệu!");
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Xoá nhà cung cấp này?")) return;
    try {
      const res = await fetch(`${API}?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã xoá nhà cung cấp");
        setItems((prev) => prev.filter((x) => x.supplier_id !== id));
      } else toast.error(data.message || "Xoá thất bại!");
    } catch {
      toast.error("Không thể xoá!");
    }
  };

  return (
    <div className="space-y-6 w-full">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              🏭
            </span>
            Quản lý nhà cung cấp
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi đơn vị cung ứng thuốc, thiết bị và thông tin liên hệ.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:bg-blue-700"
        >
          <span className="text-lg">➕</span>
          Thêm nhà cung cấp
        </button>
      </div>

      {/* Filter + KPI */}
      <div className="admin-card flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-sm text-slate-700">
            <div>
              <div className="text-xs text-slate-400">Tổng nhà cung cấp</div>
              <div className="font-semibold">
                {totalSuppliers.toLocaleString("vi-VN")} đơn vị
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Đang hiển thị</div>
              <div className="font-semibold text-blue-600">
                {filtered.length.toLocaleString("vi-VN")} kết quả
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px] relative">
            <span className="pointer-events-none absolute left-3 top-2.5 text-slate-400">
              🔍
            </span>
            <input
              className="w-full rounded-lg border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              placeholder="Tìm theo tên, địa chỉ, SĐT, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bảng nhà cung cấp */}
      <div className="admin-card overflow-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-400 animate-pulse">
            Đang tải…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Chưa có nhà cung cấp phù hợp.
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-2 text-left">Tên NCC</th>
                <th className="p-2 text-left">Địa chỉ</th>
                <th className="p-2 text-left">Số điện thoại</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.supplier_id}
                  className="border-t hover:bg-slate-50/80"
                >
                  <td className="p-2 font-medium text-slate-800">{s.name}</td>
                  <td className="p-2 text-slate-600">{s.address}</td>
                  <td className="p-2">{s.phone}</td>
                  <td className="p-2">{s.email}</td>
                  <td className="p-2 text-center space-x-2">
                    <button
                      className="inline-flex items-center rounded-lg px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                      onClick={() => {
                        setEditing(s);
                        setForm({
                          name: s.name,
                          address: s.address,
                          phone: s.phone,
                          email: s.email,
                        });
                        setOpen(true);
                      }}
                    >
                      🖊️ Sửa
                    </button>
                    <button
                      className="inline-flex items-center rounded-lg px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      onClick={() => onDelete(s.supplier_id)}
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

      {/* Modal VIP thêm / sửa NCC */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                      🏭
                    </span>
                    {editing
                      ? "✏️ Sửa nhà cung cấp"
                      : "➕ Thêm nhà cung cấp mới"}
                  </h2>
                  <p className="mt-1 text-xs text-blue-50/90">
                    Cập nhật chính xác thông tin để xử lý đơn nhập hàng nhanh
                    chóng.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  className="rounded-full bg-white/15 px-2 py-1 text-xs hover:bg-white/25"
                >
                  Đóng
                </button>
              </div>
            </div>

            <form onSubmit={onSave} className="space-y-3 p-6">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Tên nhà cung cấp *
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Địa chỉ
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Số điện thoại
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
                >
                  Lưu nhà cung cấp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
