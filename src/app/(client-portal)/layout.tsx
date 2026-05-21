import * as React from 'react';

/**
 * Route group layout: pass-through. Phase 1 portal pages use their own
 * `PortalShell` (with workspace switcher + logout + auth hydrator) — see
 * `src/app/(client-portal)/portal/_shell.tsx`.
 */
export default function PortalRouteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
