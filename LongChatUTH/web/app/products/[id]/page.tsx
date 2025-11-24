// app/products/[id]/page.tsx
import { fetchProductById, imageUrl } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";

type Unit = { unit_name: string; price_value: number };

type Product = {
  id: number | string;
  name: string;
  image?: string | null;      // 👈 thêm
  image_path?: string;
  price_text?: string;
  category?: string;
  brand?: string;
  form?: string;
  size_spec?: string;
  manufacturer?: string;
  origin?: string;
  ingredient?: string;
  units?: Unit[];
};

function Gallery({ src, alt }: { src?: string; alt: string }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-4">
        <div className="relative w-full h-[260px] sm:h-[320px] bg-slate-50 rounded-xl overflow-hidden">
          {src ? (
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain p-4 sm:p-6"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
              Không có hình
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-16 h-16 rounded-xl border border-slate-100 bg-white shadow-sm p-1 flex-shrink-0"
          >
            <div className="relative w-full h-full bg-slate-50 rounded-lg overflow-hidden">
              {src ? (
                <Image
                  src={src}
                  alt={`${alt} thumb ${i + 1}`}
                  fill
                  className="object-contain p-1 sm:p-2"
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="text-[11px] text-slate-500">
        * Mẫu mã sản phẩm có thể thay đổi theo lô hàng
      </div>
    </div>
  );
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const raw = (await fetchProductById(params.id)) as Product | null;
  if (!raw) return notFound();

  const p: Product = {
    ...raw,
    units: (raw as any).units || [],
  };

  // 🔥 Lấy ảnh ưu tiên từ cột `image`, fallback sang `image_path`
  // và luôn đi qua helper imageUrl (→ /api/img?url=...)
  const img = imageUrl(
    (p as any).image || p.image_path || ""
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb + nút quay lại */}
      <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
        <div className="flex items-center gap-2 overflow-hidden">
          <Link href="/" className="text-blue-700 hover:underline">
            Trang chủ
          </Link>
          <span>/</span>
          {p.category && (
            <>
              <span className="truncate max-w-[160px] sm:max-w-[260px]">
                {p.category}
              </span>
              <span>/</span>
            </>
          )}
          <span className="font-medium text-slate-700 truncate max-w-[220px] sm:max-w-[420px]">
            {p.name}
          </span>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
        >
          ← Quay lại trang chủ
        </Link>
      </div>

      {/* Card chi tiết giống bố cục Long Châu */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-[0_10px_35px_rgba(15,23,42,0.08)] p-4 sm:p-6 lg:p-7">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1.3fr]">
          {/* Cột trái: hình ảnh */}
          <Gallery src={img} alt={p.name} />

          {/* Cột phải: thông tin */}
          <div className="space-y-4">
            <div className="text-[11px] sm:text-xs uppercase tracking-wide text-slate-500">
              Thương hiệu:{" "}
              <span className="text-blue-700 font-semibold">
                {p.brand || p.manufacturer || "Đang cập nhật"}
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl font-semibold leading-snug text-slate-900">
              {p.name}
            </h1>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
              {p.form && (
                <span>
                  Dạng bào chế:{" "}
                  <span className="font-medium text-slate-800">{p.form}</span>
                </span>
              )}
              {p.size_spec && (
                <span>
                  Quy cách:{" "}
                  <span className="font-medium text-slate-800">
                    {p.size_spec}
                  </span>
                </span>
              )}
            </div>

            {/* Client: giá, đơn vị, chọn mua, v.v. */}
            <ProductDetailClient
              productId={Number(p.id)}
              productName={p.name}
              productImage={img}          // 👈 truyền ảnh đã chuẩn hoá
              units={p.units || []}
              basePriceText={p.price_text}
              category={p.category}
              manufacturer={p.manufacturer}
              origin={p.origin}
              sizeSpec={p.size_spec}
            />
          </div>
        </div>
      </section>

      {/* Block Thành phần & Thông tin sản phẩm phía dưới */}
      <section className="rounded-3xl border border-slate-100 bg-white shadow-sm p-4 sm:p-6 lg:p-7 space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Thành phần & Thông tin sản phẩm
        </h2>

        <div className="border rounded-2xl overflow-hidden">
          <div className="bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
            Thành phần
          </div>
          <div className="px-4 py-3 text-sm text-slate-700 whitespace-pre-line">
            {p.ingredient || "Đang cập nhật thông tin thành phần."}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Thực phẩm bảo vệ sức khỏe, không phải là thuốc và không có tác dụng
          thay thế thuốc chữa bệnh. Vui lòng đọc kỹ hướng dẫn sử dụng trước
          khi dùng.
        </p>
      </section>
    </div>
  );
}
