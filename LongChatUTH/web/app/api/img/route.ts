// app/api/img/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Chỉ cho phép proxy ảnh trong thư mục uploads của em
const UPLOAD_BASE_HTTP =
  "http://nhom37.itimit.id.vn/QL_NhaThuocTamAn/LongChatUTH/uploads/";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  let src = url.searchParams.get("src");

  if (!src) {
    return new NextResponse("Missing src", { status: 400 });
  }

  // decode + normalize
  src = decodeURIComponent(src);

  // Nếu lỡ lưu https thì đổi về http để tránh lỗi SSL
  if (src.startsWith("https://nhom37.itimit.id.vn/")) {
    src = "http://" + src.slice("https://".length);
  }

  // Không cho proxy lung tung → tránh biến site thành open-proxy
  if (!src.startsWith(UPLOAD_BASE_HTTP)) {
    return new NextResponse("Invalid image source", { status: 400 });
  }

  try {
    const upstream = await fetch(src);

    if (!upstream.ok) {
      return new NextResponse("Upstream error", { status: upstream.status });
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";

    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Proxy image error:", err);
    return new NextResponse("Proxy error", { status: 502 });
  }
}
