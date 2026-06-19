// app/api/php/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE =
  "http://nhathuoctaman.freedev.app/QL_NhaThuocTamAn/LongChatUTH/api";

export async function GET(req: NextRequest) {
  // Lấy query string ?path=products&page=1&limit=8
  const { search } = new URL(req.url);
  const backendUrl = `${BACKEND_BASE}/index.php${search}`;

  // Gọi sang PHP API (http) từ server Vercel
  const res = await fetch(backendUrl, { method: "GET" });
  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "application/json",
    },
  });
}
