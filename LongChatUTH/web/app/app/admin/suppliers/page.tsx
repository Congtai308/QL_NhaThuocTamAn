"use client";
import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

type Supplier = {
  supplier_id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
};

const API = "http://localhost:9000/LongChatUTH/api/suppliers.php";
const initialForm = { name: "", address: "", phone: "", email: "" };

export default function SuppliersPage() {
  const [items, setItems] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(initialForm);
  const [open, setOpen] = useState(false);

  const fetchAll = async () => {
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

  useEffect(() => { fetchAll(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.address || "").toLowerCase().includes(q) ||
        (s.email || "").toLowerCase().includes(q) ||
        (s.phone || "").includes(q)
    );
  }, [items, search]);

  const resetForm = () => { setEditing(null); setForm(initialForm); };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) {
      toast.error("Vui lòng nhập Tên nhà cung cấp!");
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
        toast.success(editing ? "Đã cập nhật nhà cung cấp" : "Đã thêm nhà cung cấp");
        resetForm();
        setOpen(false);
        fetchAll();
      } else toast.error(data.message || "Lỗi khi lưu!");
    } catch {
      toast.error("Không thể gửi dữ liệu!");
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Xóa nhà cung cấp này?")) return;
    try {
      const res = await fetch(`${API}?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã xóa!");
        setItems((prev) => prev.filter((x) => x.supplier_id !== id));
      } else toast.error(data.message || "Xoá thất bại!");
    } catch {
      toast.error("Không thể xoá!");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-700">🚚 Nhà cung cấp</h1>
        <button
          onClick={() => { resetForm(); setOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          ➕ Thêm NCC
        </button>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <input
          className="w-full border p-2 rounded"
          placeholder="🔍 Tìm theo tên, địa chỉ, email, SĐT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white border rounded-lg overflow-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-400">Đang tải…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Chưa có nhà cung cấp</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-2 text-left">Tên nhà cung cấp</th>
                <th className="p-2 text-left">Địa chỉ</th>
                <th className="p-2 text-left">SĐT</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.supplier_id} className="border-t hover:bg-gray-50">
                  <td className="p-2 font-medium">{s.name}</td>
                  <td className="p-2">{s.address || "—"}</td>
                  <td className="p-2">{s.phone || "—"}</td>
                  <td className="p-2">{s.email || "—"}</td>
                  <td className="p-2 text-center space-x-2">
                    <button
                      onClick={() => {
                        setEditing(s);
                        setForm({
                          name: s.name || "",
                          address: s.address || "",
                          phone: s.phone || "",
                          email: s.email || "",
                        });
                        setOpen(true);
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Sửa
                    </button>
                    <button onClick={() => onDelete(s.supplier_id)} className="text-red-600 hover:underline">
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              {editing ? "✏️ Sửa nhà cung cấp" : "➕ Thêm nhà cung cấp"}
            </h2>
            <form onSubmit={onSave} className="space-y-3">
              <input
                className="w-full border p-2 rounded"
                placeholder="Tên nhà cung cấp"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="w-full border p-2 rounded"
                placeholder="Địa chỉ"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="border p-2 rounded"
                  placeholder="Số điện thoại"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <input
                  className="border p-2 rounded"
                  placeholder="Email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
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
