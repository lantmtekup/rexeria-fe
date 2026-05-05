import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';

import { constants } from '@/settings/constants';

export const runtime = 'nodejs';

/**
 * After the sign-in form POSTs to the REXER backend (via `/api/rexer/auth/login`)
 * we ping this route so the Next.js middleware can gate app routes on the
 * presence of a signed `_access_token` cookie. The payload is not used for
 * authorization — only the cookie's *existence* and signature validity.
 */
export async function POST(): Promise<NextResponse> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return NextResponse.json(
      { success: false, error: 'JWT_SECRET missing' },
      { status: 500 }
    );
  }
  const token = await new SignJWT({ sub: 'rexer-session' })
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
