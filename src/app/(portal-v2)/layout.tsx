import { Manrope, Space_Grotesk } from 'next/font/google';
import type { ReactNode } from 'react';

import { AuthHydrator } from '@/components/modules/Auth/AuthHydrator';
import { Shell } from '@/components/templates/portal-v2/Shell';
import { cn } from '@/lib/cn';
import { MiningDataProvider } from '@/lib/portal-v2/mining/MiningDataProvider';
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

export default function PortalV2Layout({ children }: { children: ReactNode }) {
  return (
    <div
      data-portal-v2
      className={cn(spaceGrotesk.variable, manrope.variable, manrope.className)}
    >
      <AuthHydrator />
      <MiningDataProvider>
        <Shell>{children}</Shell>
      </MiningDataProvider>
    </div>
  );
}
