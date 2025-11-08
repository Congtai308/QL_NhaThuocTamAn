/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**.nhathuoclongchau.com.vn" }
    ]
  }
};
module.exports = nextConfig;
