export const IMAGE_BASE =
  process.env.NEXT_PUBLIC_IMAGE_BASE ||
  "https://nhathuoctaman.freedev.app/QL_NhaThuocTamAn/LongChatUTH/";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ||
  "https://nhathuoctaman.freedev.app/QL_NhaThuocTamAn/LongChatUTH/api/index.php";

export function imageUrl(src?: string | null) {
  if (!src) return "";

  // Đã là proxy rồi
  if (src.startsWith("/api/img")) return src;

  // URL tuyệt đối (http/https) → đi qua proxy
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return `/api/img?url=${encodeURIComponent(src)}`;
  }

  // Path tương đối như "images/ten_file.jpg" → ghép với IMAGE_BASE
  return `${IMAGE_BASE}${src}`;
}