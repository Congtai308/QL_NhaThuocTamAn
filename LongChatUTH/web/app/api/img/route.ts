// app/api/img/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const urlParam = req.nextUrl.searchParams.get("url");
    if (!urlParam) {
      return NextResponse.json(
        { success: false, error: "MISSING_URL" },
        { status: 400 }
      );
    }

    // Giải mã & chuẩn hoá URL
    let raw = decodeURIComponent(urlParam);

    // Nếu còn localhost thì map sang domain thật
    // ví dụ: http://localhost:9000/QL_NhaThuocTamAn/LongChatUTH/...
    if (raw.includes("localhost:9000")) {
      raw = raw.replace("http://localhost:9000", "http://nhom37.itimit.id.vn");
    }

    const u = new URL(raw);

    // Chỉ cho phép http / https
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return NextResponse.json(
        { success: false, error: "INVALID_PROTOCOL" },
        { status: 400 }
      );
    }

    // Nếu là domain của bạn mà đang https lỗi, ép về http để bypass SSL
    if (u.hostname === "nhom37.itimit.id.vn" && u.protocol === "https:") {
      u.protocol = "http:";
    }

    // Gọi về server nguồn lấy ảnh
    const upstream = await fetch(u.toString());

    if (!upstream.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "UPSTREAM_ERROR",
          status: upstream.status,
        },
        { status: 502 }
      );
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        // cho cache 1 ngày
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (err: any) {
    console.error("Proxy /api/img error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}
