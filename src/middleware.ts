import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

import { constants } from '@/settings/constants';
import { roleHomePath } from '@/lib/auth/roleTarget';

const protectedRoutes = [
  '/tai-khoan',
  '/cms',
  '/home',
  '/template',
  '/product',
  '/ai-agents',
  '/notification',
  '/setting',
  '/support',
  '/admin',
  // Brand portal — chỉ cho user đã đăng nhập. BE đã 401 data khi thiếu
  // cookie, nhưng vẫn gate ở middleware để user logout không thấy khung
  // portal (defense-in-depth).
  '/portal',
  // Portal V2 shell — tách hoàn toàn khỏi /portal cũ.
  '/portal-v2',
  // Doc/demo nội bộ — không cố ý public (audit FE 2026-07-04 Q7).
  '/overview',
];

const authRoutes = ['/dang-nhap', '/quen-mat-khau', '/sign-in'];

const publicRoutes = ['/api', '/_next', '/favicon.ico', '/scan', '/p/'];

/**
 * Verify the local session cookie and return its `role` claim.
 * Returns `null` when there is no valid session (unauthenticated).
 */
const getSession = async (
  request: NextRequest
): Promise<{ role: string; scope: 'brand' | 'platform' | '' } | null> => {
  const accessToken = request.cookies.get(constants.ACCESS_TOKEN)?.value;

  if (!accessToken) return null;

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return null;
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(accessToken, secret);
    const role = typeof payload.role === 'string' ? payload.role : '';
    const scope =
      payload.scope === 'brand' || payload.scope === 'platform'
        ? payload.scope
        : '';
    return { role, scope };
  } catch {
    return null;
  }
};

const isProtectedRoute = (pathname: string): boolean =>
  protectedRoutes.some(route =>
    route === '/' ? pathname === '/' : pathname.startsWith(route)
  );

const isAuthRoute = (pathname: string): boolean =>
  authRoutes.some(route => pathname.startsWith(route));

const isPublicRoute = (pathname: string): boolean =>
  publicRoutes.some(route => pathname.startsWith(route));

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // ── Host-based entry (2026-06-10) ────────────────────────────────────────
  // - Domain chính (rexerstudio.com / *.vercel.app / localhost): `/` phục vụ
  //   LANDING (rewrite nội bộ sang /rexer — URL giữ nguyên `/`).
  // - Subdomain portal.* (portal.rexerstudio.com): `/` đưa thẳng vào app —
  //   đã đăng nhập → role home (/admin | /portal | /home), chưa → /sign-in.
  // - Subdomain {slug}.rexerstudio.com (2026-08-14, Deploy §11 "check link"):
  //   `/` phục vụ landing PUBLISHED của đúng slug đó — rewrite nội bộ sang
  //   `/p/{slug}`, cùng route trang share link `/p/[id]` đã dùng. Wildcard DNS
  //   `*.rexerstudio.com` phải trỏ vào Worker này (Cloudflare route riêng,
  //   ngoài repo) thì nhánh này mới thực sự có traffic tới.
  // Các route khác không đổi: /sign-in, /portal, /admin… hoạt động trên mọi
  // host; /rexer/* (landing) vẫn truy cập trực tiếp được.
  const host = request.headers.get('host') ?? '';
  const isPortalHost = host.startsWith('portal.');

  const ROOT_DOMAIN_SUFFIX = '.rexerstudio.com';
  const isExperienceHost =
    !isPortalHost &&
    host !== 'www.rexerstudio.com' &&
    host.endsWith(ROOT_DOMAIN_SUFFIX);

  if (pathname === '/') {
    if (isExperienceHost) {
      const slug = host.slice(0, -ROOT_DOMAIN_SUFFIX.length);
      return NextResponse.rewrite(new URL(`/p/${slug}`, request.url));
    }
    if (!isPortalHost) {
      return NextResponse.rewrite(new URL('/rexer', request.url));
    }
    const session = await getSession(request);
    const target = session
      ? roleHomePath(session.role, session.scope || undefined)
      : '/sign-in';
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Domain landing PUBLIC (rexerstudio.com): không mở trang auth tại chỗ —
  // ai cố vào /sign-in, /sign-up… sẽ được đưa qua subdomain portal (giữ
  // nguyên path). Chỉ áp cho host landing prod; portal.* / localhost /
  // *.workers.dev / *.vercel.app vẫn mở bình thường (dev + đăng nhập portal).
  const LANDING_HOSTS = ['rexerstudio.com', 'www.rexerstudio.com'];
  if (
    LANDING_HOSTS.includes(host) &&
    /^\/(sign-in|sign-up|dang-nhap|quen-mat-khau|forgot-password|reset-password)/.test(
      pathname
    )
  ) {
    return NextResponse.redirect(
      new URL(pathname, 'https://portal.rexerstudio.com')
    );
  }

  const pathnameWithoutLocale =
    pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';

  const session = await getSession(request);
  const isAuth = session !== null;

  if (isAuthRoute(pathnameWithoutLocale)) {
    if (isAuth) {
      // Already signed in: bounce off the auth page to the role's home
      // (admin → /admin, brand → /portal, còn lại → /home) — §C1.
      const target = pathnameWithoutLocale.startsWith('/cms/login')
        ? '/cms'
        : roleHomePath(session.role, session.scope || undefined);
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  if (isProtectedRoute(pathnameWithoutLocale) && !isAuth) {
    if (pathnameWithoutLocale.startsWith('/tai-khoan')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    const appRoots = [
      '/cms',
      '/home',
      '/template',
      '/product',
      '/ai-agents',
      '/notification',
      '/setting',
      '/support',
      '/admin',
      '/portal',
      '/portal-v2',
    ];
    if (appRoots.some(p => pathnameWithoutLocale.startsWith(p))) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    const signInUrl = new URL('/dang-nhap', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Role-gate /admin: chỉ platform admin. `role` claim đã được verify với BE
  // tại /api/auth/session-set nên tin được ở đây (defense-in-depth — data
  // vẫn 401 từ BE nếu lọt).
  if (
    isAuth &&
    pathnameWithoutLocale.startsWith('/admin') &&
    session.role !== 'admin'
  ) {
    return NextResponse.redirect(
      new URL(
        roleHomePath(session.role, session.scope || undefined),
        request.url
      )
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathnameWithoutLocale);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
