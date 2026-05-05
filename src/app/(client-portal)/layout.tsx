import * as React from 'react';

import { ClientPortalLayout } from '@/components/templates/ClientPortalLayout';

export default function PortalRouteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientPortalLayout>{children}</ClientPortalLayout>;
}
