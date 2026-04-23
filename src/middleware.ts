import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

import { constants } from '@/settings/constants';

const protectedRoutes = ['/tai-khoan', '/cms'];

const authRoutes = ['/dang-nhap', '/quen-mat-khau', '/sign-in'];

const publicRoutes = ['/api', '/_next', '/favicon.ico', '/scan'];

const isAuthenticated = async (request: NextRequest): Promise<boolean> => {
  const accessToken = request.cookies.get(constants.ACCESS_TOKEN)?.value;

  if (!accessToken) return false;

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return false;
    const secret = new TextEncoder().encode(jwtSecret);
    await jwtVerify(accessToken, secret);
    return true;
  } catch {
    return false;
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

  const isAuth = await isAuthenticated(request);

  if (isAuthRoute(pathnameWithoutLocale)) {
    if (isAuth) {
      return NextResponse.redirect(
        new URL(
          pathnameWithoutLocale.startsWith('/cms/login') ? '/cms' : '/',
          request.url
        )
      );
    }
    return NextResponse.next();
  }

  if (isProtectedRoute(pathnameWithoutLocale) && !isAuth) {
    if (pathnameWithoutLocale.startsWith('/tai-khoan')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (pathnameWithoutLocale.startsWith('/cms')) {
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
