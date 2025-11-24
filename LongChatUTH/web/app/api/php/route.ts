// app/api/php/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE =
  "http://nhom37.itimit.id.vn/QL_NhaThuocTamAn/LongChatUTH/api";

// để Vercel không cache cứng route này
export const dynamic = "force-dynamic";

async function handleProxy(req: NextRequest) {
  try {
    // URL FE -> copy query (?path=..., &type=...)
    const incomingUrl = new URL(req.url);
    const backendUrl = new URL(`${BACKEND_BASE}/index.php`);
    backendUrl.search = incomingUrl.search;

    const init: RequestInit = {
      method: req.method,
      headers: {},
    };

    // copy headers trừ Host
    req.headers.forEach((value, key) => {
      if (key.toLowerCase() === "host") return;
      (init.headers as any)[key] = value;
    });

    // Các method có body
    if (req.method !== "GET" && req.method !== "HEAD") {
      const contentType = req.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        // FE gửi JSON -> convert sang x-www-form-urlencoded cho PHP (đọc $_POST)
        const json = (await req.json()) as Record<string, any>;
        const form = new URLSearchParams();

        Object.entries(json).forEach(([k, v]) => {
          if (v === undefined || v === null) return;

          // object / array (vd: items) -> stringify
          if (typeof v === "object") {
            form.append(k, JSON.stringify(v));
          } else {
            form.append(k, String(v));
          }
        });

        init.body = form.toString();
        (init.headers as any)["content-type"] =
          "application/x-www-form-urlencoded";
      } else {
        // form-data, x-www-form-urlencoded… -> forward nguyên
        const body = await req.arrayBuffer();
        init.body = body as any;
      }
    }

    // gọi sang PHP
    const res = await fetch(backendUrl.toString(), init);
    const text = await res.text();

    // trả về nguyên response text từ PHP (thường là JSON)
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "application/json",
      },
    });
  } catch (err: any) {
    console.error("Proxy /api/php error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Proxy error",
        message: String(err?.message || err),
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
