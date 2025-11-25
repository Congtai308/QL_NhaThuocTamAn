"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

type Employee = {
  employee_id: number;
  full_name: string;
  phone: string;
  email: string;
  title: string;
};

type FormState = {
  full_name: string;
  phone: string;
  email: string;
  title: string;
};

const API = "http://nhom37.itimit.id.vn/QL_NhaThuocTamAn/LongChatUTH/api/employees.php";

const initialForm: FormState = {
  full_name: "",
  phone: "",
  email: "",
  title: "",
};

export default function EmployeesPage() {
  const [items, setItems] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);

  // -------- API --------
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch(API);
      const data = await res.json();
      const list: Employee[] = data.items || data || [];
      setItems(list);
    } catch (e) {
      console.error(e);
      toast.error("Không tải được danh sách nhân viên");
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
      [e.full_name, e.phone, e.email, e.title]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [items, search]);

  // -------- CRUD --------
  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setOpen(true);
  };

  const openEdit = (e: Employee) => {
    setEditing(e);
    setForm({
      full_name: e.full_name,
      phone: e.phone,
      email: e.email,
      title: e.title || "",
    });
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    setForm(initialForm);
  };

  const onChange = (key: keyof FormState, value: string) => {
    setForm((s) => ({ ...s, [key]: value }));
  };

  const saveEmployee = async (ev: React.FormEvent) => {
    ev.preventDefault();

    if (!form.full_name.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.error("Vui lòng nhập Họ tên, SĐT và Email");
      return;
    }

    const body = new URLSearchParams();
    body.append("full_name", form.full_name);
    body.append("phone", form.phone);
    body.append("email", form.email);
    body.append("title", form.title);

    const url = editing ? `${API}&id=${editing.employee_id}` : API;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        toast.error(data.message || "Lỗi khi lưu nhân viên!");
        return;
      }

      toast.success(editing ? "Đã cập nhật nhân viên" : "Đã thêm nhân viên");
      closeModal();
      fetchEmployees();
    } catch (e) {
      console.error(e);
      toast.error("Không thể gửi dữ liệu!");
    }
  };

  const deleteEmployee = async (id: number) => {
    if (!confirm("Xoá nhân viên này?")) return;
    try {
      const res = await fetch(`${API}&id=${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || data.success === false) {
        toast.error(data.message || "Xoá thất bại!");
        return;
      }

      toast.success("Đã xoá nhân viên");
      setItems((prev) => prev.filter((x) => x.employee_id !== id));
    } catch (e) {
      console.error(e);
      toast.error("Không thể xoá!");
    }
  };

  const total = items.length;

  // -------- UI --------
  return (
    <div className="space-y-6 w-full">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              👥
            </span>
            Quản lý nhân viên
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi danh sách nhân viên và phân quyền.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 shadow-md text-sm"
        >
          <span className="text-lg leading-none">＋</span>
          Thêm nhân viên
        </button>
      </div>

      {/* Card filter */}
      <div className="admin-card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 text-xs">
              {total}
            </span>
            <span>
              Tổng số nhân viên{" "}
              <span className="font-medium text-gray-800">{total}</span>
            </span>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">
              🔍
            </span>
            <input
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tìm theo tên, SĐT, email, chức vụ…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="admin-card overflow-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-400 animate-pulse">
            Đang tải…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Không có nhân viên
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
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
                <tr key={e.employee_id} className="border-t hover:bg-gray-50">
                  <td className="p-2 font-medium text-slate-800">
                    {e.full_name}
                  </td>
                  <td className="p-2">{e.phone}</td>
                  <td className="p-2">{e.email}</td>
                  <td className="p-2">{e.title}</td>
                  <td className="p-2 text-center space-x-2">
                    <button
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-medium"
                      onClick={() => openEdit(e)}
                    >
                      🖊️ Sửa
                    </button>
                    <button
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium"
                      onClick={() => deleteEmployee(e.employee_id)}
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

      {/* Modal add/edit */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-sky-500 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                    👤
                  </span>
                  {editing ? "Sửa nhân viên" : "Thêm nhân viên mới"}
                </h2>
                <p className="text-xs text-blue-100 mt-0.5">
                  Điền đầy đủ thông tin để dễ dàng quản lý ca làm và phân quyền.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-blue-50 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveEmployee} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Họ tên *
                  </label>
                  <input
                    className="w-full mt-1 border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={form.full_name}
                    onChange={(e) => onChange("full_name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Số điện thoại *
                  </label>
                  <input
                    className="w-full mt-1 border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={form.phone}
                    onChange={(e) => onChange("phone", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    className="w-full mt-1 border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={form.email}
                    onChange={(e) => onChange("email", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Chức vụ
                  </label>
                  <input
                    className="w-full mt-1 border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={form.title}
                    onChange={(e) => onChange("title", e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 border rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 text-sm"
                >
                  {editing ? "Cập nhật" : "Lưu nhân viên"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
