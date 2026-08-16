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
  // Ẩn nút "N" Next.js dev tools indicator (góc dưới trái) ở dev.
  devIndicators: false,

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Router Cache phía CLIENT (per-browser, không chia sẻ giữa user) — rời
    // trang rồi quay lại trong 30s dùng lại RSC payload đã fetch thay vì gọi
    // lại BE. KHÔNG dùng `fetch({next:{revalidate}})` cho các call có cookie ở
    // `rxCore`: đó là cache CHUNG trên server, và `resolvePortalScope`
    // (`services/portal-v2/scope.ts`) hiện không xác minh user thường có
    // thực sự thuộc `?brand=` họ tự truyền hay không — cache chung sẽ khuếch
    // đại lỗ hổng đó thành rò rỉ dữ liệu chéo brand.
    staleTimes: {
      dynamic: 30,
    },
    // Rewrite `/api/rexer/*` → BE đi qua proxy của Next, mà proxy này mặc định
    // ngắt sau 30 GIÂY. Handoff của AI-Insights viết lại từng block bằng LLM
    // (6 block ≈ 60–90s, có retry thì hơn) nên luôn vượt ngưỡng đó.
    //
    // Triệu chứng khi bị cắt rất dễ đọc nhầm thành lỗi model: proxy ngắt →
    // context của request bị huỷ → BE log `context canceled` cho MỌI block còn
    // lại cùng một giây, và trang sinh ra thiếu nội dung ở nửa sau. Đo được ở
    // local 05/08/2026: filled=2 skipped=4, cả 4 block chết đúng mốc t+30s.
    proxyTimeout: 300_000,
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
    // Fail loud khi thiếu env — không fallback prod URL để env sai không
    // âm thầm đọc/ghi prod (audit FE 2026-07-04 P4).
    const be = process.env.NEXT_PUBLIC_REXER_API ?? process.env.REXER_API;
    if (!be) {
      throw new Error(
        'NEXT_PUBLIC_REXER_API (hoặc REXER_API) chưa cấu hình — rewrite /api/rexer cần BE URL'
      );
    }
    // BE v2 (Portal V2) — chạy song song, KHÔNG thay thế `be` ở trên.
    // Optional (khác v1): thiếu env thì chỉ không đăng ký rewrite, app vẫn
    // boot; `rxV2()` mới throw khi thực sự được gọi. Fail-loud ở đây sẽ phá
    // mọi deployment/env hiện có ngay khi merge.
    // basePath vẫn `/v1` — BE không có route prefix `/v2`, "v2" là host khác.
    const beV2 =
      process.env.NEXT_PUBLIC_REXER_API_V2 ?? process.env.REXER_API_V2;

    return [
      {
        source: '/api/rexer/:path*',
        destination: `${be}/v1/:path*`,
      },
      ...(beV2
        ? [
            {
              source: '/api/rexer-v2/:path*',
              destination: `${beV2}/v1/:path*`,
            },
          ]
        : []),
      // `/p/:slug` rewrite REMOVED 2026-05-31 — FE app route
      // `src/app/p/[slug]/page.tsx` ngắt sliện rewrite (Next.js
      // routes precede rewrites). FE route discriminator:
      //   - Code template (src/templates/{code}/) → render React
      //     component (A2a Option C, full SSR cho animation)
      //   - Block template → server-fetch BE `/p/{slug}` HTML +
      //     inject (legacy fallback)
    ];
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(nextConfig);
