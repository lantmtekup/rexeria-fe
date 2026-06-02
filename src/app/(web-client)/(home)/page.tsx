import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { roleHomePath } from '@/lib/auth/roleTarget';
import { constants } from '@/settings/constants';

export default async function Homepage() {
  // Signed-in visitors land on their role home (admin → /admin, brand →
  // /portal); guests fall through to the public /home landing. The role is
  // read from the local session cookie set at login (see /api/auth/session-set).
  let target = '/home';
  const token = (await cookies()).get(constants.ACCESS_TOKEN)?.value;
  const secret = process.env.JWT_SECRET;
  if (token && secret) {
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(secret)
      );
      const role = typeof payload.role === 'string' ? payload.role : '';
      target = roleHomePath(role);
    } catch {
      // Invalid / expired cookie — treat as guest.
      target = '/home';
    }
  }

  redirect(target);
}
