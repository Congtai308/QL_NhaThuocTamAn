/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**.nhathuoclongchau.com.vn" },
      { protocol: "https", hostname: "pharmacy-alb-235357366.ap-southeast-2.elb.amazonaws.com" },
    ],
  },
};
module.exports = nextConfig;
