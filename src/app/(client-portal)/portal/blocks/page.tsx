'use client';

import { Suspense } from 'react';

import { BlocksPage } from '@/components/modules/Blocks/BlocksPage';

import { PortalShell } from '../_shell';

/**
 * Brand-portal mirror of /admin/blocks. Reuses the same library component
 * + same localStorage layer (`rexer:saved-blocks`) for Phase 1 — brand
 * users browse the shared block library here.
 *
 * Phase 2 will scope this per `brand_id` once BE saved-blocks endpoints
 * ship (see `docs/be-saved-blocks-spec.md`).
 */
export default function PortalBlocksPage() {
  return (
    <PortalShell>
      <Suspense
        fallback={
          <div className='text-content-muted p-6 text-sm'>Loading…</div>
        }
      >
        <BlocksPage />
      </Suspense>
    </PortalShell>
  );
}
