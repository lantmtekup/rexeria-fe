import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

import { constants } from '@/settings/constants';

export const runtime = 'nodejs';

/**
 * After the sign-in form POSTs to the REXER backend (via `/api/rexer/auth/login`)
 * we ping this route so the Next.js middleware can gate app routes on the
 * presence of a signed `_access_token` cookie. The payload is not used for
 * authorization — only the cookie's *existence* and signature validity, plus a
 * non-authoritative `role` claim used purely to pick the post-login landing
 * page (`/admin` vs `/portal`).
 */
export async function POST(req: Request): Promise<NextResponse> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return NextResponse.json(
      { success: false, error: 'JWT_SECRET missing' },
      { status: 500 }
    );
  }
  // Role + scope là claim để middleware + root `/` page route user home mà
  // không cần round-trip BE. `scope` = 'brand' nếu user gắn brand (→ /portal),
  // 'platform' nếu không (platform admin/staff). Xem roleHomePath (§C1).
  let role = '';
  let scope = '';
  try {
    const body = await req.json();
    if (typeof body?.role === 'string') role = body.role;
    if (typeof body?.scope === 'string') scope = body.scope;
  } catch {
    // No / invalid JSON body — keep the defaults.
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
