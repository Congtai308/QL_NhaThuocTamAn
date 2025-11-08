"use client";

import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

type Product = {
  id: number;
  name: string;
  price: number | string;
  category: string;
  manufacturer: string;
  image?: string | null;
};

type FormState = {
  name: string;
  price: string | number;
  category: string;          // lưu tên danh mục (đúng theo backend hiện tại)
  manufacturer: string;
  image: File | null;        // chỉ có File khi chọn ảnh mới
};

type Category = { id: string | number; name: string };

const API = "http://localhost:9000/LongChatUTH/api/products.php";
const CAT_API = "http://localhost:9000/LongChatUTH/api/categories.php";

const initialForm: FormState = {
  name: "",
  price: "",
  category: "",
  manufacturer: "",
  image: null,
};

export default function AdminProducts() {
  // Data
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [q, setQ] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [manufacturerFilter, setManufacturerFilter] = useState("");

  // Categories (dropdown)
  const [categories, setCategories] = useState<Category[]>([]);

  // Modal / form
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [preview, setPreview] = useState<string | null>(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(API);
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      toast.error("Không tải được danh sách sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(CAT_API);
      const data = await res.json();
      setCategories((data.items || []).map((c: any) => ({
        id: c.id ?? c.category_id ?? c.name,
        name: c.name ?? String(c),
      })));
    } catch {
      toast.error("Không tải được danh mục!");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const manufacturers = useMemo(
    () => Array.from(new Set(items.map((x) => x.manufacturer))).filter(Boolean) as string[],
    [items]
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((p) => {
      const matchesQ =
        !needle ||
        p.name?.toLowerCase().includes(needle) ||
        p.category?.toLowerCase().includes(needle) ||
        p.manufacturer?.toLowerCase().includes(needle);
      const matchesCat = !categoryFilter || p.category === categoryFilter;
      const matchesManu = !manufacturerFilter || p.manufacturer === manufacturerFilter;
      return matchesQ && matchesCat && matchesManu;
    });
  }, [items, q, categoryFilter, manufacturerFilter]);

  // Handlers
  const openAddModal = () => {
    setEditing(null);
    setForm(initialForm);
    setPreview(null);
    setOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name || "",
      price: String(p.price ?? ""),
      category: p.category || "",
      manufacturer: p.manufacturer || "",
      image: null,                // không gán string -> để backend giữ ảnh cũ nếu không upload mới
    });
    setPreview(p.image || null);
    setOpen(true);
  };

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setForm((s) => ({ ...s, image: f }));
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return toast.error("Vui lòng nhập tên sản phẩm!");

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("price", String(form.price ?? ""));
    fd.append("category", form.category || "");        // gửi TÊN danh mục (khớp backend hiện tại)
    fd.append("manufacturer", form.manufacturer || "");
    if (form.image) fd.append("image", form.image);    // chỉ gửi nếu có file mới

    const url = editing ? `${API}?id=${editing.id}` : API;

    try {
      const res = await fetch(url, { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        toast.success(editing ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm");
        setOpen(false);
        setEditing(null);
        setForm(initialForm);
        setPreview(null);
        fetchProducts();
      } else {
        toast.error(data.message || "Lỗi khi lưu sản phẩm!");
      }
    } catch {
      toast.error("Không thể gửi dữ liệu!");
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Xoá sản phẩm này?")) return;
    try {
      const res = await fetch(`${API}?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Đã xoá sản phẩm");
        setItems((prev) => prev.filter((x) => x.id !== id));
      } else toast.error(data.message || "Xoá thất bại!");
    } catch {
      toast.error("Không thể xoá!");
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-700">💊 Quản lý sản phẩm</h1>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow"
        >
          ➕ Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-wrap gap-3">
        <input
          className="flex-1 p-2 border rounded-lg min-w-[220px]"
          placeholder="🔍 Tìm theo tên / danh mục / NSX…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border p-2 rounded-lg"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">-- Danh mục --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>
        <select
          className="border p-2 rounded-lg"
          value={manufacturerFilter}
          onChange={(e) => setManufacturerFilter(e.target.value)}
        >
          <option value="">-- Nhà sản xuất --</option>
          {manufacturers.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-400 animate-pulse">Đang tải…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Không có sản phẩm</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-2 text-center">Ảnh</th>
                <th className="p-2 text-left">Tên</th>
                <th className="p-2 text-center">Giá</th>
                <th className="p-2 text-center">Danh mục</th>
                <th className="p-2 text-center">Nhà SX</th>
                <th className="p-2 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 text-center">
                    <img
                      src={p.image || "/no-image.png"}
                      className="w-14 h-14 rounded-lg object-cover border"
                    />
                  </td>
                  <td className="p-2">{p.name}</td>
                  <td className="p-2 text-center text-blue-700 font-semibold">
                    {p.price && !isNaN(Number(p.price))
                      ? Number(p.price).toLocaleString() + "₫"
                      : "—"}
                  </td>
                  <td className="p-2 text-center">{p.category}</td>
                  <td className="p-2 text-center">{p.manufacturer}</td>
                  <td className="p-2 text-center space-x-2">
                    <button
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                      onClick={() => openEditModal(p)}
                    >
                      🖊️ Sửa
                    </button>
                    <button
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg"
                      onClick={() => onDelete(p.id)}
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

      {/* Modal Add/Edit */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">
              {editing ? "✏️ Sửa sản phẩm" : "➕ Thêm sản phẩm"}
            </h2>
            <form onSubmit={onSave} className="space-y-3">
              <input
                className="w-full border p-2 rounded-lg"
                placeholder="Tên sản phẩm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="w-full border p-2 rounded-lg"
                placeholder="Giá"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />

              {/* Dropdown danh mục */}
              <select
                className="w-full border p-2 rounded-lg"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>

              <input
                className="w-full border p-2 rounded-lg"
                placeholder="Nhà sản xuất"
                value={form.manufacturer}
                onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
              />

              <div className="flex items-center gap-3">
                <input type="file" accept="image/*" onChange={onPickImage} />
                {preview && (
                  <img src={preview} className="w-16 h-16 rounded-lg border object-cover" />
                )}
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setEditing(null);
                    setForm(initialForm);
                    setPreview(null);
                  }}
                  className="border px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
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
