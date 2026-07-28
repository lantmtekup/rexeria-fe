import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { constants } from '@/settings/constants';

/**
 * /dev/* là preview tooling nội bộ (block preview, template thử nghiệm).
 * - Dev/local: mở cho mọi người.
 * - Production: CHỈ platform admin (role === 'admin') — gate bằng session
 *   cookie đã verify với BE lúc login (audit FE 2026-07-04 Q7). Ai khác →
 *   notFound() để không lộ tooling ra ngoài.
 */
async function isProdAdmin(): Promise<boolean> {
  const token = (await cookies()).get(constants.ACCESS_TOKEN)?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return false;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

export default async function DevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NODE_ENV === 'production' && !(await isProdAdmin())) {
    notFound();
  }
  return children;
}
