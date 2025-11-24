import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE =
  "http://nhom37.itimit.id.vn/QL_NhaThuocTamAn/LongChatUTH/api";

// Bắt buộc dùng NodeJS runtime để proxy được body multipart / FormData
export const runtime = "nodejs";

async function handleProxy(req: NextRequest) {
  try {
    const incomingUrl = new URL(req.url);
    const backendUrl = new URL(`${BACKEND_BASE}/index.php`);
    // copy query: ?path=products, ?path=orders...
    backendUrl.search = incomingUrl.search;

    const init: RequestInit = {
      method: req.method,
      headers: {},
    };

    // copy header (trừ host & content-length vì body có thể thay đổi)
    req.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (k === "host" || k === "content-length") return;
      (init.headers as any)[key] = value;
    });

    // Các method có body
    if (req.method !== "GET" && req.method !== "HEAD") {
      const contentType = req.headers.get("content-type") || "";

      if (contentType.includes("multipart/form-data")) {
        // ✅ Trường hợp ADMIN gửi FormData (upload ảnh, CRUD sản phẩm...)
        // → giữ nguyên body + header content-type (có boundary)
        init.body = req.body as any;
        // KHÔNG sửa content-type
      } else if (contentType.includes("application/json")) {
        // ✅ Trường hợp FE gửi JSON (đặt hàng, login...)
        // → convert JSON -> x-www-form-urlencoded cho PHP
        const json = (await req.json()) as Record<string, any>;
        const form = new URLSearchParams();

        Object.entries(json).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (typeof v === "object") {
            // quan trọng: items (array/object) phải stringify
            form.append(k, JSON.stringify(v));
          } else {
            form.append(k, String(v));
          }
        });

        init.body = form.toString();
        (init.headers as any)["content-type"] =
          "application/x-www-form-urlencoded";
      } else {
        // ✅ Các loại khác: form-urlencoded gốc, text/plain...
        const body = await req.arrayBuffer();
        init.body = body as any;
        // giữ nguyên content-type hiện có
      }
    }

    const res = await fetch(backendUrl.toString(), init);
    const text = await res.text();

    return new NextResponse(text, {
      status: res.status,
      headers: {
        "content-type":
          res.headers.get("content-type") ||
          "application/json; charset=utf-8",
      },
    });
  } catch (err: any) {
    console.error("Proxy /api/php error:", err);

    // Trả JSON để FE đọc được, không ném HTML error
    return NextResponse.json(
      {
        success: false,
        error: "Proxy error",
        message: err?.message ?? String(err),
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleProxy(req);
}
export async function POST(req: NextRequest) {
  return handleProxy(req);
}
export async function PUT(req: NextRequest) {
  return handleProxy(req);
}
export async function DELETE(req: NextRequest) {
  return handleProxy(req);
}
