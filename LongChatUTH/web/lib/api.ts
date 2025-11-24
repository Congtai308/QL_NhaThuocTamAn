// lib/api.ts
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "http://nhom37.itimit.id.vn/QL_NhaThuocTamAn/LongChatUTH/api/index.php";

export const IMAGE_BASE =
  process.env.NEXT_PUBLIC_IMAGE_BASE || "http://nhom37.itimit.id.vn/QL_NhaThuocTamAn/LongChatUTH/";

// lib/api.ts

export function imageUrl(src?: string | null) {
  if (!src) return "/no-image.png";

  // Nếu đã là proxy rồi thì trả luôn
  if (src.startsWith("/api/img")) return src;

  // Link http/https từ PHP -> đi qua proxy
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return `/api/img?url=${encodeURIComponent(src)}`;
  }

  // Trường hợp ảnh local trong FE ( /flashsale-banner.webp, /logo.png,... )
  return src;
}


export type ProductUnit = {
  unit_name: string;
  price_value: number | string;
};

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
  image?: string | null;
  image_path?: string;
  units?: ProductUnit[]; // 👈 thêm cho đồng bộ với product_detail.php
};

export async function fetchProducts(page = 1, limit = 20) {
  const r = await fetch(
    `${API_BASE}?path=products&page=${page}&limit=${limit}`,
    { cache: "no-store" }
  );
  if (!r.ok) throw new Error("Lỗi tải danh sách sản phẩm");
  return r.json() as Promise<{
    page: number;
    limit: number;
    total: number;
    items: Product[];
  }>;
}

export async function fetchProductById(
  id: string | number
): Promise<Product> {
  const r = await fetch(`${API_BASE}?path=product&id=${id}`, {
    cache: "no-store",
  });
  if (!r.ok) throw new Error("Không tìm thấy sản phẩm");
  const data = (await r.json()) as Product;
  return data;
}

// --- Categories + search: dùng luôn API_BASE cho đẹp ---

export async function fetchCategories() {
  const r = await fetch(`${API_BASE}?path=categories`, {
    cache: "no-store",
  });
  if (!r.ok) throw new Error("Lỗi tải danh mục");

  const data = await r.json();
  return Array.isArray((data as any)?.items)
    ? (data as any).items
    : Array.isArray(data)
    ? data
    : [];
}

export async function searchProducts(q: string) {
  const r = await fetch(
    `${API_BASE}?path=search&q=${encodeURIComponent(q)}`,
    { cache: "no-store" }
  );
  if (!r.ok) throw new Error("Lỗi tìm kiếm");

  const data = await r.json();
  return Array.isArray((data as any)?.items)
    ? (data as any).items
    : Array.isArray(data)
    ? data
    : [];
}
