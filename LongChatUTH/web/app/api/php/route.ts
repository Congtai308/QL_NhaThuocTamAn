import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE =
  "http://nhom37.itimit.id.vn/QL_NhaThuocTamAn/LongChatUTH/api";

// Hàm dùng chung cho mọi method
async function handleProxy(req: NextRequest) {
  const { search } = new URL(req.url); // ?path=...&page=...
  const backendUrl = `${BACKEND_BASE}/index.php${search}`;

  // Chuẩn bị options để forward
  const init: RequestInit = {
    method: req.method,
    headers: {},
  };

  // Copy Content-Type nếu có
  const contentType = req.headers.get("content-type") || undefined;
  if (contentType) {
    (init.headers as any)["content-type"] = contentType;
  }

  // Với GET/HEAD không có body
  if (req.method !== "GET" && req.method !== "HEAD") {
    const body = await req.arrayBuffer();
    init.body = body as any;
  }

  const res = await fetch(backendUrl, init);

  const text = await res.text();
  const resContentType = res.headers.get("content-type") || "application/json";

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "content-type": resContentType,
    },
  });
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
