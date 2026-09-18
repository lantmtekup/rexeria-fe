import { Manrope, Space_Grotesk } from 'next/font/google';
import type { ReactNode } from 'react';

import { AuthHydrator } from '@/components/modules/Auth/AuthHydrator';
import { Shell } from '@/components/templates/portal-v2/Shell';
import { hasServerSession } from '@/lib/auth/serverSession';
import { cn } from '@/lib/cn';
import '@/styles/portal-v2/tokens.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

export default async function PortalV2Layout({
  children,
}: {
  children: ReactNode;
}) {
  /*
   * Gần như mọi route trong nhóm này đều đòi đăng nhập; `/portal-v2/exchange`
   * là ngoại lệ cố ý (xem `publicPortalRoutes` trong middleware). Layout vì thế
   * phải dựng được cả hai khung.
   *
   * KHÔNG gắn `AuthHydrator` cho khách: nó gọi `/auth/me`, và với khách thì
   * lượt đó chắc chắn 401 — vô hại nhưng bẩn console và tốn một vòng mạng trên
   * mỗi lần mở trang.
   */
  const signedIn = await hasServerSession();

  return (
    <div
      data-portal-v2
      className={cn(spaceGrotesk.variable, manrope.variable, manrope.className)}
    >
      {signedIn ? <AuthHydrator /> : null}
      <Shell signedIn={signedIn}>{children}</Shell>
    </div>
  );
}
