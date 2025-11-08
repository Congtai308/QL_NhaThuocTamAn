export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://localhost:8080/LongChatUTH/api/index.php";

export const IMAGE_BASE =
  process.env.NEXT_PUBLIC_IMAGE_BASE || "http://localhost:8080/LongChatUTH/";

export function imageUrl(p?: string) {
  if (!p) return "";
  return `${IMAGE_BASE}${p.replace(/^\/+/, "")}`;
}

export type Product = {
  id: number;
  url?: string;
  name: string;
  price_text?: string;
  category?: string;
  brand?: string;
  form?: string;
  size_spec?: string;
  manufacturer?: string;
  origin?: string;
  ingredient?: string;
  image_path?: string;
};

export type ProductUnit = { unit_name: string; price_value: string };

export async function fetchProducts(page = 1, limit = 20) {
  const res = await fetch(
    `${API_BASE}?path=products&page=${page}&limit=${limit}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Lỗi tải danh sách sản phẩm");
  return res.json() as Promise<{
    page: number;
    limit: number;
    total: number;
    items: Product[];
  }>;
}

export async function fetchProductById(id: string | number) {
  const r = await fetch(`${API_BASE}?path=product&id=${id}`, {
    cache: "no-store",
  });
  if (!r.ok) {
    if (r.status === 404) return null; // sản phẩm không tồn tại
    throw new Error(`API error ${r.status}`);
  }
  return r.json() as Promise<Product & { units: ProductUnit[] }>;
}

export async function searchProducts(q: string) {
  const res = await fetch(
    `${API_BASE}?path=search&q=${encodeURIComponent(q)}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Lỗi tìm kiếm");
  return res.json() as Promise<Product[]>;
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}?path=categories`, { cache: "no-store" });
  if (!res.ok) throw new Error("Lỗi tải danh mục");
  return res.json() as Promise<{ category: string; total: number }[]>;
}
