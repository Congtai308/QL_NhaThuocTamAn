"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function ProductModal({
  editing,
  onClose,
  onSaved,
}: {
  editing: any | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    manufacturer: "",
    image: null as File | null,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm(editing);
      setPreview(editing.image || null);
    }
  }, [editing]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("manufacturer", form.manufacturer);
      if (form.image instanceof File) formData.append("image", form.image);

      const url = editing
        ? `http://localhost:9000/LongChatUTH/api/products.php?id=${editing.id}`
        : "http://localhost:9000/LongChatUTH/api/products.php";

      await fetch(url, { method: "POST", body: formData });
      toast.success(
        editing ? "Đã cập nhật sản phẩm!" : "Đã thêm sản phẩm mới!"
      );
      onSaved();
      onClose();
    } catch (err) {
      toast.error("Lỗi khi lưu sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4">
          {editing ? "✏️ Sửa sản phẩm" : "➕ Thêm sản phẩm"}
        </h2>

        <form onSubmit={handleSave} className="space-y-3">
          <input
            placeholder="Tên sản phẩm"
            className="w-full border p-2 rounded-lg"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            placeholder="Giá"
            className="w-full border p-2 rounded-lg"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <input
            placeholder="Danh mục"
            className="w-full border p-2 rounded-lg"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <input
            placeholder="Nhà sản xuất"
            className="w-full border p-2 rounded-lg"
            value={form.manufacturer}
            onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
          />

          <div className="flex items-center gap-3">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {preview && (
              <img
                src={preview}
                alt="preview"
                className="w-16 h-16 rounded-lg object-cover border"
              />
            )}
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="border px-4 py-2 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
