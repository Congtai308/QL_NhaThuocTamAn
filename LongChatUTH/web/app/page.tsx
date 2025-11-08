// app/page.tsx
import { fetchProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

// các khối giao diện
import HeroCarousel from "@/components/home/HeroCarousel";
import QuickActions from "@/components/home/QuickActions";
import FlashSale from "@/components/home/FlashSale";
import BestSellers from "@/components/home/BestSellers";
import Categories from "@/components/home/Categories";
import Brands from "@/components/home/Brands";
import Footer from "@/components/Footer";

/** Wrapper thẻ section kiểu Long Châu: khung trắng, viền xanh, bo góc + bóng nhẹ */
function SectionCard({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`relative ${className}`}>
      {title && (
        <div className="text-center mb-3">
          <span className="inline-block rounded-full bg-[#0a56c5] text-white px-5 py-1.5 text-sm shadow">
            {title}
          </span>
        </div>
      )}
      <div className="rounded-3xl border-4 border-[#0a56c5] bg-white shadow-[0_8px_24px_rgba(10,86,197,0.06)] p-4 sm:p-5">
        {children}
      </div>
    </section>
  );
}

export default async function Home() {
  let items: any[] = [];
  try {
    const res = await fetchProducts(1, 20);
    items = Array.isArray(res?.items) ? res.items : [];
  } catch {
    items = [];
  }

  return (
    <main className="min-h-screen from-[#eef5ff] to-[#f8fbff]">
      {/* Ribbon mảnh trên cùng */}
      <div className="w-full bg-[#0a56c5] text-white text-[13px]">
        <div className="max-w-6xl mx-auto px-4 h-9 sm:h-10 flex items-center justify-between">
          <span className="truncate">
            Trung tâm tìm hiểu Long Châu • Luôn đồng hành sức khỏe
          </span>
          <div className="hidden md:flex items-center gap-6 opacity-90">
            <span>Tải ứng dụng</span>
            <span>Tư vấn ngay: 1800 6928</span>
          </div>
        </div>
      </div>

      {/* Nội dung chính */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-8 sm:space-y-10">
        {/* 1) Banner */}
        <HeroCarousel />

        {/* 2) Tác vụ nhanh */}
        <QuickActions />

        {/* 3) Flash Sale – bản của bạn tự lấy API bên trong */}
        <FlashSale />

        {/* 4) Best Sellers */}
        <BestSellers />

        {/* 5) Danh mục nổi bật */}
        <Categories />

        {/* 6) Thương hiệu yêu thích */}
        <Brands />

        {/* 7) Sản phẩm nổi bật (danh sách lưới) */}
        <SectionCard title="Sản phẩm nổi bật">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {items.length > 0
              ? items.map((p: any) => <ProductCard key={p.id} p={p} />)
              : Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-white border shadow-sm p-3 animate-pulse"
                  >
                    <div className="w-full h-40 bg-slate-100 rounded-lg mb-3" />
                    <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                    <div className="mt-3 h-8 bg-slate-100 rounded-xl" />
                  </div>
                ))}
          </div>
        </SectionCard>

        {/* Footer mềm xanh dương */}
        <Footer />
      </div>
    </main>
  );
}
