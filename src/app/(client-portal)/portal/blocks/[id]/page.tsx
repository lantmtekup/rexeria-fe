'use client';

/**
 * Brand-portal block-detail route. Keeps the URL under `/portal/...` so
 * brand users never bounce into admin namespaces. Wraps the reusable
 * `BlockDetailView` inside `PortalShell` for chrome consistency.
 */

import * as React from 'react';
import { useParams } from 'next/navigation';

import { BlockDetailView } from '@/components/modules/Admin/BlockDetailView';

import { PortalShell } from '../../_shell';

export default function PortalBlockDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  return (
    <PortalShell>
      <BlockDetailView blockId={id} backHref='/portal/blocks' />
    </PortalShell>
  );
}
