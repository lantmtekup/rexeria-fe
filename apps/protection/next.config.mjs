/** @type {import('next').NextConfig} */
const nextConfig = {
  // Clone protection.gr — raw <img>/<canvas> có chủ đích (frame-sequence),
  // không next/image. Bỏ lint pass lúc build (scaffold không có eslint config).
  eslint: { ignoreDuringBuilds: true },
  // Monorepo nhiều lockfile → ghim trace root về chính app này.
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
