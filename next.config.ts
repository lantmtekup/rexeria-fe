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

  // Anthropic SDK (dùng client-side qua dangerouslyAllowBrowser) ship ESM với
  // `node:*` scheme imports cho code path AWS/GCP credentials không chạy ở
  // browser. Webpack 5 không tự handle scheme → cần NormalModuleReplacementPlugin
  // để rewrite `node:foo` → false (rỗng) trong client bundle.
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /^node:/,
          (resource: { request: string }) => {
            resource.request = resource.request.replace(/^node:/, '');
          }
        )
      );
      // Sau khi rewrite scheme, nhiều module Node built-in vẫn không tồn tại
      // trong browser → fallback chúng về `false` để webpack skip.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        path: false,
        fs: false,
        os: false,
        crypto: false,
        stream: false,
        url: false,
        util: false,
        buffer: false,
        process: false,
        'fs/promises': false,
      };
    }
    return config;
  },

  async rewrites() {
    const be =
      process.env.NEXT_PUBLIC_REXER_API ??
      process.env.REXER_API ??
      'https://rexerai.tekupsoftware.com';
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
