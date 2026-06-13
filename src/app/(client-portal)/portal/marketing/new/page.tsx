'use client';

/** Wizard tạo marketing — UI thật ở `../_editor` (dùng chung với detail). */

import { PortalShell } from '../../_shell';
import { MarketingEditor } from '../_editor';

export default function NewMarketingPage() {
  return (
    <PortalShell>
      <MarketingEditor mode='create' />
    </PortalShell>
  );
}
