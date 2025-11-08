import { fetchProductById, imageUrl } from "@/lib/api";
import Image from "next/image";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";

/** Gallery đơn giản: nếu sau này có mảng ảnh thì thay bằng list thumbnail click được */
function Gallery({ src, alt }: { src?: string; alt: string }) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border bg-white p-4">
        <div className="aspect-square relative bg-gray-50 rounded-xl overflow-hidden">
          {src ? (
            <Image src={src} alt={alt} fill className="object-contain p-6" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="w-16 h-16 rounded-xl border bg-white p-1">
            <div className="relative w-full h-full bg-gray-50 rounded-lg overflow-hidden">
              {src ? (
                <Image
                  src={src}
                  alt={`${alt} thumb ${i + 1}`}
                  fill
                  className="object-contain p-1"
                />
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <div className="text-[12px] text-gray-500">
        Mẫu mã sản phẩm có thể thay đổi theo lô hàng
      </div>
    </div>
  );
}

type Props = { params: { id: string } };

export default async function ProductDetailPage({ params }: Props) {
  const p = await fetchProductById(params.id);
  if (!p) return notFound();

  const img = p.image_path ? imageUrl(p.image_path) : "";

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Gallery */}
        <Gallery src={img} alt={p.name} />

        {/* Right: Info */}
        <div className="space-y-3">
          {/* Thương hiệu */}
          <div className="text-sm text-gray-600">
            Thương hiệu:{" "}
            <span className="text-blue-700">{p.brand || "-"}</span>
          </div>

          {/* Tên sản phẩm */}
          <h1 className="text-2xl font-bold leading-tight">{p.name}</h1>

          {/* Giá + Đơn vị + Chọn mua (client) */}
          <ProductDetailClient
            productId={Number(p.id)}
            productName={p.name}
            productImage={img}
            units={(p as any).units || []}
            basePriceText={p.price_text}
          />

          {/* Bảng thông số nhanh */}
          <div className="rounded-2xl border bg-white p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="text-gray-600">Danh mục</div>
              <div className="col-span-2">{p.category || "-"}</div>

              <div className="text-gray-600">Dạng bào chế</div>
              <div className="col-span-2">{p.form || "-"}</div>

              <div className="text-gray-600">Quy cách</div>
              <div className="col-span-2">{p.size_spec || "-"}</div>

              <div className="text-gray-600">Xuất xứ thương hiệu</div>
              <div className="col-span-2">{p.origin || "-"}</div>

              <div className="text-gray-600">Nhà sản xuất</div>
              <div className="col-span-2">{p.manufacturer || "-"}</div>
            </div>
          </div>

          {/* Thành phần */}
          {p.ingredient && (
            <div className="rounded-2xl border bg-white p-4">
              <div className="font-semibold mb-1">Thành phần</div>
              <div className="text-sm text-gray-700 whitespace-pre-line">
                {p.ingredient}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
