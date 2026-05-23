'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';

import { BlockAnalyticsGrid } from '@/components/modules/Analytics/BlockAnalyticsGrid';

import { PortalShell } from '../../../_shell';

export default function PortalLandingAnalyticsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  return (
    <PortalShell>
      <BlockAnalyticsGrid templateId={id} backHref='/portal/landing-pages' />
    </PortalShell>
  );
}
