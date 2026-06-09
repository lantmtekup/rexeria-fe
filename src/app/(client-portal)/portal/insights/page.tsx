'use client';

import { InsightsWizard } from '@/components/modules/Insights/InsightsWizard';

import { PortalShell } from '../_shell';

/**
 * Trang AI-Insights cho brand portal.
 * Brand bị khoá theo workspace đang active (brandLocked) — không cho chọn brand khác.
 */
export default function PortalInsightsPage() {
  return (
    <PortalShell>
      <div className='mx-auto max-w-3xl'>
        <InsightsWizard brandLocked />
      </div>
    </PortalShell>
  );
}
