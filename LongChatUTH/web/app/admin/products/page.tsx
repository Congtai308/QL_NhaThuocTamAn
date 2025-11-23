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
  category: string; // lưu tên danh mục (đúng theo backend hiện tại)
  manufacturer: string;
  image: File | null; // chỉ có File khi chọn ảnh mới
};

type Category = { id: string | number; name: string };

const API =
  "/api/php?path=products";
const CAT_API =
  "/api/php?path=categories";

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
      setCategories(
        (data.items || []).map((c: any) => ({
          id: c.id ?? c.category_id ?? c.name,
          name: c.name ?? String(c),
        }))
      );
    } catch {
      toast.error("Không tải được danh mục!");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const manufacturers = useMemo(
    () =>
      Array.from(new Set(items.map((x) => x.manufacturer))).filter(
        Boolean
      ) as string[],
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
      const matchesManu =
        !manufacturerFilter || p.manufacturer === manufacturerFilter;
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
      image: null, // không gán string -> để backend giữ ảnh cũ nếu không upload mới
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
    fd.append("category", form.category || "");
    fd.append("manufacturer", form.manufacturer || "");

    if (form.image) {
      fd.append("image", form.image);
    } else if (editing?.image) {
      fd.append("image", editing.image);
    }

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

  const totalProducts = items.length;

  return (
    <div className="space-y-6 w-full">
      <Toaster position="top-right" />

      {/* Header VIP */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            {/* icon pill */}
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              💊
            </span>
            Quản lý sản phẩm
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi kho thuốc, dược mỹ phẩm và cập nhật giá bán.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 shadow-md text-sm"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 4V16M4 10H16"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          Thêm sản phẩm
        </button>
      </div>

      {/* Info / filter card */}
      <div className="admin-card p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 text-xs">
              {totalProducts.toLocaleString("vi-VN")}
            </span>
            <span>
              Tổng số sản phẩm{" "}
              <span className="font-medium text-gray-800">
                {totalProducts.toLocaleString("vi-VN")}
              </span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Dữ liệu realtime từ API PHP
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">
              🔍
            </span>
            <input
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tìm theo tên, danh mục, nhà sản xuất…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <select
            className="border p-2 rounded-lg text-sm min-w-[150px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="border p-2 rounded-lg text-sm min-w-[150px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={manufacturerFilter}
            onChange={(e) => setManufacturerFilter(e.target.value)}
          >
            <option value="">Tất cả nhà sản xuất</option>
            {manufacturers.map((m) => (
              <option key={m}>{m}</option>
            ))}
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
                      ? Number(p.price).toLocaleString("vi-VN") + "₫"
                      : "—"}
                  </td>
                  <td className="p-2 text-center">{p.category}</td>
                  <td className="p-2 text-center">{p.manufacturer}</td>
                  <td className="p-2 text-center space-x-2">
                    <button
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-medium"
                      onClick={() => openEditModal(p)}
                    >
                      🖊️ Sửa
                    </button>
                    <button
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium"
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

      {/* Modal Add/Edit – VIP */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all duration-200">
            {/* Header xanh Long Châu */}
            <div className="bg-gradient-to-r from-blue-600 to-sky-500 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                    <svg
                      className="w-4 h-4 text-white"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 4V16M4 10H16"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  {editing ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
                </h2>
                <p className="text-xs text-blue-100 mt-0.5">
                  Nhập đầy đủ thông tin để quản lý kho thuốc chính xác.
                </p>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  setEditing(null);
                  setForm(initialForm);
                  setPreview(null);
                }}
                className="text-blue-50 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <form onSubmit={onSave} className="grid grid-cols-2 gap-5 p-6">
              {/* Tên sản phẩm */}
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Tên sản phẩm *
                </label>
                <input
                  className="w-full mt-1 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="VD: Paracetamol 500mg"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              {/* Giá bán */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Giá bán (₫)
                </label>
                <input
                  type="number"
                  className="w-full mt-1 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="VD: 25000"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>

              {/* Danh mục */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Danh mục
                </label>
                <select
                  className="w-full mt-1 border rounded-lg p-3 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nhà sản xuất */}
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Nhà sản xuất
                </label>
                <input
                  className="w-full mt-1 border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="VD: Dược Hậu Giang"
                  value={form.manufacturer}
                  onChange={(e) =>
                    setForm({ ...form, manufacturer: e.target.value })
                  }
                />
              </div>

              {/* Upload ảnh */}
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700">
                  Hình ảnh sản phẩm
                </label>
                <div className="flex items-center gap-4 mt-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onPickImage}
                    className="border p-2 rounded-lg text-sm"
                  />
                  {preview && (
                    <img
                      src={preview}
                      className="w-20 h-20 rounded-lg border object-cover shadow"
                    />
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setEditing(null);
                    setForm(initialForm);
                    setPreview(null);
                  }}
                  className="px-5 py-2.5 border rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 text-sm"
                >
                  {editing ? "Cập nhật" : "Lưu sản phẩm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
