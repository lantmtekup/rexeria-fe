'use client';

import { useSearchParams } from 'next/navigation';

import { InsightsWizard } from '@/components/modules/Insights/InsightsWizard';

import { PortalShell } from '../../_shell';

/**
 * Tạo phân tích AI-Insights mới (wizard intake) cho brand portal.
 * `?from=<reportId>` → mở ở chế độ "chỉnh sửa & chạy lại" (prefill từ report cũ).
 */
export default function PortalInsightsNewPage() {
  const fromId = useSearchParams().get('from') ?? undefined;
  return (
    <PortalShell>
      <div className='mx-auto max-w-6xl'>
        <InsightsWizard brandLocked fromReportId={fromId} />
      </div>
    </PortalShell>
  );
}
