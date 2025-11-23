import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE =
  "http://nhom37.itimit.id.vn/QL_NhaThuocTamAn/LongChatUTH/api";

// Hàm proxy dùng chung cho mọi method
async function handleProxy(req: NextRequest) {
  // Copy query ?path=...&page=...
  const incomingUrl = new URL(req.url);
  const backendUrl = new URL(`${BACKEND_BASE}/index.php`);
  backendUrl.search = incomingUrl.search;

  const init: RequestInit = {
    method: req.method,
    headers: {},
  };

  // Copy các header (trừ host)
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() === "host") return;
    (init.headers as any)[key] = value;
  });

  // Các method có body (POST/PUT/DELETE...)
  if (req.method !== "GET" && req.method !== "HEAD") {
    const contentType = req.headers.get("content-type") || "";

    // Nếu FE gửi JSON -> convert sang form-urlencoded để PHP đọc được $_POST
    if (contentType.includes("application/json")) {
      const json = (await req.json()) as Record<string, any>;
      const form = new URLSearchParams();
      Object.entries(json).forEach(([k, v]) => {
        form.append(k, String(v ?? ""));
      });

      init.body = form.toString();
      (init.headers as any)["content-type"] =
        "application/x-www-form-urlencoded";
    } else {
      // Các loại body khác: form-data, x-www-form-urlencoded... -> forward nguyên xi
      const body = await req.arrayBuffer();
      init.body = body as any;
    }
  }

  // Gọi sang PHP
  const res = await fetch(backendUrl.toString(), init);
  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "application/json",
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
