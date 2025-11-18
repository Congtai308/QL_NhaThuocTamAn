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

const API = "http://localhost:9000/QL_NhaThuocTamAn/LongChatUTH/api/employees.php";

const initialForm = { full_name: "", phone: "", email: "", title: "" };

export default function EmployeesPage() {
  const [items, setItems] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState(initialForm);
  const [open, setOpen] = useState(false); // điều khiển modal

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

  useEffect(() => { fetchEmployees(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((e) =>
      e.full_name.toLowerCase().includes(q) ||
      e.phone.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      (e.title || "").toLowerCase().includes(q)
    );
  }, [items, search]);

  const resetForm = () => { setEditing(null); setForm(initialForm); };

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
        toast.success("Đã xoá");
        setItems((prev) => prev.filter((x) => x.employee_id !== id));
      } else toast.error(data.message || "Xoá thất bại!");
    } catch {
      toast.error("Không thể xoá!");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">👨‍⚕️ Quản lý nhân viên</h1>
        <button
          onClick={() => { resetForm(); setOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow"
        >
          ➕ Thêm nhân viên
        </button>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <input
          className="w-full border p-2 rounded"
          placeholder="🔍 Tìm theo tên, email, SĐT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white border rounded-lg overflow-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-400">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Chưa có nhân viên</div>
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
                  <td className="p-2">{e.full_name}</td>
                  <td className="p-2">{e.phone}</td>
                  <td className="p-2">{e.email}</td>
                  <td className="p-2">{e.title}</td>
                  <td className="p-2 text-center space-x-3">
                    <button
                      className="text-blue-600 hover:underline"
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
                      Sửa
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => onDelete(e.employee_id)}
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

      {/* Modal thêm/sửa */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              {editing ? "✏️ Sửa nhân viên" : "➕ Thêm nhân viên"}
            </h2>
            <form onSubmit={onSave} className="space-y-3">
              <input
                className="w-full border p-2 rounded"
                placeholder="Họ tên"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Số điện thoại"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Chức vụ"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setOpen(false)} className="border px-4 py-2 rounded">
                  Hủy
                </button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
