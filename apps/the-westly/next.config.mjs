/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // Monorepo nhiều lockfile → ghim trace root về chính app này.
  outputFileTracingRoot: import.meta.dirname,
  // Real-device preview via ngrok / LAN — allow /_next/* (incl. image optimizer).
  allowedDevOrigins: ['*.ngrok-free.dev', '*.ngrok-free.app', '*.ngrok.io'],
};

export default nextConfig;
