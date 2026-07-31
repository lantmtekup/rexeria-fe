import { Manrope, Space_Grotesk } from 'next/font/google';
import type { ReactNode } from 'react';

import { AuthHydrator } from '@/components/modules/Auth/AuthHydrator';
import { cn } from '@/lib/cn';
import '@/styles/portal-v2/tokens.css';

/**
 * Portal V2 chrome-less shell — for the canvas editor only.
 *
 * Same theme as `(portal-v2)/layout.tsx` (tokens, fonts, auth) but WITHOUT
 * `Shell`: the canvas needs the whole viewport, and a rail + topbar would eat
 * ~336px of width and 64px of height from it.
 *
 * `h-dvh` + `overflow-hidden` is load-bearing, not decoration. `Shell` used to
 * supply the definite height; without it every `h-full` / `flex-1` in the
 * editor chain resolves to `auto`, and the canvas grows the document instead of
 * clipping — zooming then scrolls the page rather than the canvas. Same trap
 * documented in `(admin)/layout.tsx`. Use `h-dvh` (not `min-h-screen`, not
 * `h-screen`) to match `Shell.tsx`.
 */

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

export default function PortalV2CanvasLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      /* tokens.css scopes every --pv2-* under this attribute. */
      data-portal-v2
      className={cn(
        spaceGrotesk.variable,
        manrope.variable,
        manrope.className,
        'h-dvh w-full overflow-hidden bg-white'
      )}
    >
      <AuthHydrator />
      {children}
    </div>
  );
}
