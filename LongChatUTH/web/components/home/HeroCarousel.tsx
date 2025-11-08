// components/home/HeroCarousel.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const slides = [
  // desktop/mobile khác nhau nếu có (art direction)
  {
    id: 1,
    desktop:
      "https://cdn.tiemchunglongchau.com.vn/unsafe/2560x0/filters:quality(90)/BANNER_WEB_MB_739d8d2527.png", // ≥1920px
    mobile: "/banners/hero-1-800.jpg", // ~800–1000px
    title: "Đẹp hiện đại – Phụ nữ giỏi tự tin",
  },
  {
    id: 2,
    desktop:
      "https://cdn.nhathuoclongchau.com.vn/unsafe/https://cms-prod.s3-sgn09.fptcloud.com/Artboard_6_3_b3becbb567.jpg",
    mobile: "/banners/hero-2-800.jpg",
    title: "Hiểu về ung thư từ A-Z",
  },
  {
    id: 3,
    desktop:
      "https://lh3.googleusercontent.com/-mmFj6ymnaIQ/ZNs76RX4lmI/AAAAAAAAbPE/cfctATMtNSUvIPlMqZCXPcCfOan_sRLCwCNcBGAsYHQ/s0/slider_1.webp",
    mobile: "/banners/hero-3-800.jpg",
    title: "Cập nhật địa chỉ tiêm chủng",
  },
];

export default function HeroCarousel() {
  const [i, setI] = useState(0);
  const t = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    t.current && clearInterval(t.current);
    t.current = setInterval(() => setI((p) => (p + 1) % slides.length), 4500);
    return () => t.current && clearInterval(t.current);
  }, []);

  const s = slides[i];

  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-sm border">
      <div className="relative aspect-[24/9]">
        {/* Art direction: ảnh khác cho mobile/desktop */}
        <picture>
          <source media="(max-width: 768px)" srcSet={s.mobile} />
          <Image
            src={s.desktop}
            alt=""
            fill
            // giữ ảnh sắc nét, tránh “vỡ” khi retina
            sizes="(max-width: 768px) 100vw, 1200px"
            priority={i === 0} // slide đầu tiên preload
            quality={95} // tăng chất lượng nén
            className="object-cover" // không kéo giãn sai tỉ lệ
          />
        </picture>

        {/* Nội dung tùy ý */}
        <div className="absolute inset-0 flex items-center px-6 md:px-10">
          <button className="mt-auto mb-6 md:mb-10 inline-flex items-center rounded-full bg-[#ff5a3c] text-white px-5 py-2.5 hover:opacity-95">
            Xem ngay
          </button>
        </div>

        {/* arrows */}
        <button
          onClick={() => setI((i - 1 + slides.length) % slides.length)}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow rounded-full w-9 h-9 grid place-items-center"
        >
          ‹
        </button>
        <button
          onClick={() => setI((i + 1) % slides.length)}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow rounded-full w-9 h-9 grid place-items-center"
        >
          ›
        </button>
      </div>
    </div>
  );
}
