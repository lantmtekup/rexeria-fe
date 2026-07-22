/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // Monorepo nhiều lockfile → ghim trace root về chính app này.
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
