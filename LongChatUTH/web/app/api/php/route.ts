import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE =
  "http://nhom37.itimit.id.vn/QL_NhaThuocTamAn/LongChatUTH/api";

async function handleProxy(req: NextRequest) {
  const { search } = new URL(req.url); 
  const backendUrl = `${BACKEND_BASE}/index.php${search}`;

  const init: RequestInit = { method: req.method, headers: {} };

  // Nếu là POST && JSON thì convert sang form-data cho PHP
  if (req.method === "POST") {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const json = await req.json();
      const form = new URLSearchParams();
      for (const k in json) {
        form.append(k, json[k]);
      }
      init.body = form.toString();
      (init.headers as any)["Content-Type"] =
        "application/x-www-form-urlencoded";
    } else {
      const body = await req.arrayBuffer();
      init.body = body as any;
      if (contentType) (init.headers as any)["Content-Type"] = contentType;
    }
  }

  const res = await fetch(backendUrl, init);
  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
  });
}

export async function GET(req: NextRequest) { return handleProxy(req); }
export async function POST(req: NextRequest) { return handleProxy(req); }
export async function PUT(req: NextRequest) { return handleProxy(req); }
export async function DELETE(req: NextRequest) { return handleProxy(req); }
