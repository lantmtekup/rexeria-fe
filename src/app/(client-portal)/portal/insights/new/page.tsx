'use client';

import { InsightsWizard } from '@/components/modules/Insights/InsightsWizard';

import { PortalShell } from '../../_shell';

/**
 * Tạo phân tích AI-Insights mới (wizard intake) cho brand portal.
 * Brand khoá theo workspace đang active (brandLocked).
 */
export default function PortalInsightsNewPage() {
  return (
    <PortalShell>
      <div className='mx-auto max-w-6xl'>
        <InsightsWizard brandLocked />
      </div>
    </PortalShell>
  );
}
