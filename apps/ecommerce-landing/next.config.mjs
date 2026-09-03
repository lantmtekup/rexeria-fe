/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Icon/logo trong /public là SVG do mình tự viết → cho phép serve qua next/image.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
