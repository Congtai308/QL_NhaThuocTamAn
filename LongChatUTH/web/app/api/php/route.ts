// app/api/php/route.ts
import { NextRequest, NextResponse } from "next/server";

// Có thể dùng biến môi trường nếu muốn, còn không thì giữ cứng như dưới
const BACKEND_BASE =
  "http://nhathuoctaman.freedev.app/QL_NhaThuocTamAn/LongChatUTH/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handleProxy(req: NextRequest) {
  try {
    const incomingUrl = new URL(req.url);

    // Gọi đúng index.php của backend
    const backendUrl = new URL(`${BACKEND_BASE}/index.php`);
    backendUrl.search = incomingUrl.search; // giữ ?path=products&id=60 ...

    const init: RequestInit = {
      method: req.method,
      headers: {},
    };

    // copy header (trừ host & content-length)
    req.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (k === "host" || k === "content-length") return;
      (init.headers as any)[key] = value;
    });

    // Với Node 18 / undici: khi có body phải set duplex
    (init as any).duplex = "half";

    // Các method có body
    if (req.method !== "GET" && req.method !== "HEAD") {
      const contentType = req.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        // FE gửi JSON -> đổi sang x-www-form-urlencoded để PHP đọc qua $_POST
        const json = (await req.json()) as Record<string, any>;
        const form = new URLSearchParams();

        Object.entries(json).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          if (typeof v === "object") {
            // quan trọng: items / object / array phải stringify
            form.append(k, JSON.stringify(v));
          } else {
            form.append(k, String(v));
          }
        });

        init.body = form.toString();
        (init.headers as any)["content-type"] =
          "application/x-www-form-urlencoded";
      } else {
        // multipart/form-data hoặc x-www-form-urlencoded gốc -> giữ nguyên
        const body = await req.arrayBuffer();
        init.body = body as any;
        // content-type giữ nguyên từ header gốc
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
