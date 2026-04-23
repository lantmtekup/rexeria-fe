import 'server-only';

import { jwtVerify, type JWTPayload } from 'jose';
import { NextRequest } from 'next/server';

import { constants } from '@/settings/constants';

export const getBearerOrCookieToken = (req: NextRequest): string | null => {
  const fromCookie = req.cookies.get(constants.ACCESS_TOKEN)?.value;
  if (fromCookie) return fromCookie;
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7).trim() || null;
  }
  return null;
};

export const verifyJwtFromRequest = async (
  req: NextRequest
): Promise<JWTPayload | null> => {
  const token = getBearerOrCookieToken(req);
  if (!token) return null;
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    return payload;
  } catch {
    return null;
  }
};
