"use client";

import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

type Employee = {
  employee_id: number;
  full_name: string;
  phone: string;
  email: string;
  title: string;
};

const API = "/api/php?path=employees";

const initialForm = { full_name: "", phone: "", email: "", title: "" };

export default function EmployeesPage() {
  const [items, setItems] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState(initialForm);
  const [open, setOpen] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch(API);
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      toast.error("Không tải được danh sách nhân viên!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((e) =>
      [e.full_name, e.phone, e.email, e.title || ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [items, search]);

  const totalEmployees = items.length;

  const resetForm = () => {
    setEditing(null);
    setForm(initialForm);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { full_name, phone, email } = form;
    if (!full_name || !phone || !email) {
      toast.error("Vui lòng nhập đầy đủ Họ tên / SĐT / Email!");
      return;
    }

    const fd = new FormData();
    fd.append("full_name", form.full_name);
    fd.append("phone", form.phone);
    fd.append("email", form.email);
    fd.append("title", form.title);

    const url = editing ? `${API}?id=${editing.employee_id}` : API;

    try {
      const res = await fetch(url, { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        toast.success(editing ? "Đã cập nhật nhân viên" : "Đã thêm nhân viên");
        resetForm();
        setOpen(false);
        fetchEmployees();
      } else {
        toast.error(data.message || "Lỗi khi lưu!");
      }
    } catch {
      toast.error("Không thể gửi dữ liệu!");
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Xoá nhân viên này?")) return;
    try {
      const res = await fetch(`${API}?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã xoá nhân viên");
        setItems((prev) => prev.filter((x) => x.employee_id !== id));
      } else toast.error(data.message || "Xoá thất bại!");
    } catch {
      toast.error("Không thể xoá!");
    }
  };

  return (
    <div className="space-y-6 w-full">
      <Toaster position="top-right" />

      {/* Header + mô tả */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              👨‍⚕️
            </span>
            Quản lý nhân viên
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi danh sách nhân viên, chức vụ và thông tin liên hệ tại quầy
            thuốc.
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
          Thêm nhân viên
        </button>
      </div>

      {/* Filter + KPI card */}
      <div className="admin-card flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-sm text-slate-700">
            <div>
              <div className="text-xs text-slate-400">Tổng nhân viên</div>
              <div className="font-semibold">
                {totalEmployees.toLocaleString("vi-VN")} người
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
          <div className="relative flex-1 min-w-[240px]">
            <span className="pointer-events-none absolute left-3 top-2.5 text-slate-400">
              🔍
            </span>
            <input
              className="w-full rounded-lg border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              placeholder="Tìm theo tên, email, SĐT, chức vụ…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bảng nhân viên */}
      <div className="admin-card overflow-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-400 animate-pulse">
            Đang tải…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Chưa có nhân viên phù hợp.
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-2 text-left">Họ tên</th>
                <th className="p-2 text-left">Số điện thoại</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Chức vụ</th>
                <th className="p-2 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr
                  key={e.employee_id}
                  className="border-t hover:bg-slate-50/80"
                >
                  <td className="p-2 font-medium text-slate-800">
                    {e.full_name}
                  </td>
                  <td className="p-2">{e.phone}</td>
                  <td className="p-2">{e.email}</td>
                  <td className="p-2 text-slate-600">{e.title || "—"}</td>
                  <td className="p-2 text-center space-x-2">
                    <button
                      className="inline-flex items-center rounded-lg px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                      onClick={() => {
                        setEditing(e);
                        setForm({
                          full_name: e.full_name,
                          phone: e.phone,
                          email: e.email,
                          title: e.title,
                        });
                        setOpen(true);
                      }}
                    >
                      🖊️ Sửa
                    </button>
                    <button
                      className="inline-flex items-center rounded-lg px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      onClick={() => onDelete(e.employee_id)}
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

      {/* Modal thêm / sửa nhân viên VIP */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl">
            {/* Header gradient */}
            <div className="bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                      👨‍⚕️
                    </span>
                    {editing
                      ? "✏️ Sửa thông tin nhân viên"
                      : "➕ Thêm nhân viên mới"}
                  </h2>
                  <p className="mt-1 text-xs text-blue-50/90">
                    Điền đầy đủ thông tin để dễ dàng quản lý ca làm và phân
                    quyền.
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

            {/* Body form */}
            <form onSubmit={onSave} className="space-y-3 p-6">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Họ tên *
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    value={form.full_name}
                    onChange={(e) =>
                      setForm({ ...form, full_name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Số điện thoại *
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Chức vụ
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
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
                  Lưu nhân viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
