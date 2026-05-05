import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const parseImageHostname = (): string | undefined => {
  const raw = process.env.NEXT_PUBLIC_DOMAIN_IMAGE?.trim();
  if (!raw) return undefined;
  try {
    const withProto = raw.includes('://') ? raw : `https://${raw}`;
    return new URL(withProto).hostname;
  } catch {
    return undefined;
  }
};

const imageHostname = parseImageHostname();

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      ...(imageHostname
        ? [
            {
              protocol: 'https' as const,
              hostname: imageHostname,
              port: '',
              pathname: '/**',
            },
          ]
        : []),
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nnl-api.tekup.vn',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'nnlexpress.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
    ],
  },

  transpilePackages: ['react-markdown', 'remark-gfm'],

  async rewrites() {
    const be =
      process.env.NEXT_PUBLIC_REXER_API ??
      process.env.REXER_API ??
      'http://75.119.128.96:9090';
    return [
      {
        source: '/api/rexer/:path*',
        destination: `${be}/v1/:path*`,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(nextConfig);
