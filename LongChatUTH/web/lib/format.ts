export function parsePriceFromText(text?: string): number {
  if (!text) return 0;
  // ví dụ: "4.800.000đ / Hộp" -> 4800000
  const m = text.match(/[\d\.]+/g);
  if (!m) return 0;
  return Number(m.join("").replace(/\./g, ""));
}

export function parseUnitFromText(text?: string, fallback = "Hộp"): string {
  if (!text) return fallback;
  const parts = text.split("/");
  return parts[1]?.trim() || fallback;
}
