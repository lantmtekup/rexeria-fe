/** @type {import('next').NextConfig} */
const nextConfig = {
  // The Vault dùng raw <img> (CDN mint.ca + Unsplash) có chủ đích, không
  // next/image. Scaffold --no-eslint nên bỏ qua lint pass lúc build.
  eslint: { ignoreDuringBuilds: true },
  // Monorepo nhiều lockfile → ghim trace root về chính app này để opennext
  // gom đúng file (tránh bundle nhầm root rexerai).
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
