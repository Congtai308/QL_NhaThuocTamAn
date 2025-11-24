// lib/img.ts
export const proxiedImg = (url?: string | null) => {
  if (!url) return "/no-image.png";
  return `/api/img?src=${encodeURIComponent(url)}`;
};
