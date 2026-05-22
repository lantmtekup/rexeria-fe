import * as React from 'react';

import { PortalDataProvider } from './_PortalDataProvider';

/**
 * Route group layout for `/portal/*`. Wraps every portal page with
 * `PortalDataProvider` so descendant components (including `PortalShell`
 * + page-level `useActiveWorkspace()`) see the same live workspace list.
 */
export default function PortalRouteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalDataProvider>{children}</PortalDataProvider>;
}
