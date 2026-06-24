// app/api/php/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE =
  process.env.BACKEND_BASE ||
  "https://nhathuoctaman.freedev.app/QL_NhaThuocTamAn/LongChatUTH/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handleProxy(req: NextRequest) {
  try {
    const incomingUrl = new URL(req.url);
    const backendUrl = new URL(`${BACKEND_BASE}/index.php`);
    backendUrl.search = incomingUrl.search;

    const init: RequestInit = {
      method: req.method,
      // Thêm headers giả lập browser để hosting không chặn
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "vi-VN,vi;q=0.9",
        "Referer": "https://nhathuoctaman.freedev.app/",
        "Origin": "https://nhathuoctaman.freedev.app",
      },
    };

    (init as any).duplex = "half";

    if (req.method !== "GET" && req.method !== "HEAD") {
      const contentType = req.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const json = (await req.json()) as Record<string, any>;
        const form = new URLSearchParams();
        Object.entries(json).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          form.append(k, typeof v === "object" ? JSON.stringify(v) : String(v));
        });
        init.body = form.toString();
        (init.headers as any)["content-type"] = "application/x-www-form-urlencoded";
      } else {
        init.body = await req.arrayBuffer() as any;
        (init.headers as any)["content-type"] = contentType;
      }
    }

    const res = await fetch(backendUrl.toString(), init);
    const text = await res.text();

    // Log để debug nếu hosting vẫn trả HTML
    if (text.trim().startsWith("<")) {
      console.error("Hosting blocked:", text.slice(0, 300));
      return NextResponse.json(
        { success: false, error: "Hosting blocked request" },
        { status: 502 }
      );
    }

    return new NextResponse(text, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "application/json; charset=utf-8",
      },
    });
  } catch (err: any) {
    console.error("Proxy /api/php error:", err);
    return NextResponse.json(
      { success: false, error: "Proxy error", message: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) { return handleProxy(req); }
export async function POST(req: NextRequest) { return handleProxy(req); }
export async function PUT(req: NextRequest) { return handleProxy(req); }
export async function DELETE(req: NextRequest) { return handleProxy(req); }