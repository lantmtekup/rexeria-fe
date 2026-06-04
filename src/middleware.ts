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
    ];
    if (appRoots.some(p => pathnameWithoutLocale.startsWith(p))) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    const signInUrl = new URL('/dang-nhap', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
