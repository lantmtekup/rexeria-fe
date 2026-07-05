import { NextResponse, type NextRequest } from 'next/server';
import { SignJWT } from 'jose';

import { constants } from '@/settings/constants';

export const runtime = 'nodejs';

/**
 * After the sign-in form POSTs to the REXER backend (via `/api/rexer/auth/login`)
 * we ping this route so the Next.js middleware can gate app routes on the
 * presence of a signed `_access_token` cookie.
 *
 * Role + scope là claim để middleware + root `/` page route user home mà
 * không cần round-trip BE mỗi request. Chúng KHÔNG lấy từ body client
 * (forgeable) — route này tự verify với BE `/v1/auth/me` bằng chính session
 * cookie BE vừa set (same-origin qua rewrite `/api/rexer`), rồi mới ký claim.
 * `scope` = 'brand' nếu user gắn brand (→ /portal), 'platform' nếu không.
 * Xem roleHomePath (§C1).
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return NextResponse.json(
      { success: false, error: 'JWT_SECRET missing' },
      { status: 500 }
    );
  }

  const beBase = (
    process.env.NEXT_PUBLIC_REXER_API ??
    process.env.REXER_API ??
    ''
  ).replace(/\/+$/, '');
  if (!beBase) {
    return NextResponse.json(
      { success: false, error: 'REXER_API missing' },
      { status: 500 }
    );
  }

  let role = '';
  let scope = '';
  try {
    const meRes = await fetch(`${beBase}/v1/auth/me`, {
      headers: { cookie: req.headers.get('cookie') ?? '' },
      cache: 'no-store',
    });
    if (!meRes.ok) {
      // Không có session BE hợp lệ → không mint cookie gate.
      return NextResponse.json(
        { success: false, error: 'UNAUTHENTICATED' },
        { status: 401 }
      );
    }
    const me = (await meRes.json()) as {
      user?: { role?: string; principal_type?: string };
      brand?: { id?: string };
    };
    role = me.user?.role ?? me.user?.principal_type ?? '';
    scope = me.brand?.id ? 'brand' : 'platform';
  } catch {
    return NextResponse.json(
      { success: false, error: 'BE_UNREACHABLE' },
      { status: 502 }
    );
  }

  const token = await new SignJWT({ sub: 'rexer-session', role, scope })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(new TextEncoder().encode(secret));

  const res = NextResponse.json({ success: true });
  res.cookies.set(constants.ACCESS_TOKEN, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
  return res;
}
