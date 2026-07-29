/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
