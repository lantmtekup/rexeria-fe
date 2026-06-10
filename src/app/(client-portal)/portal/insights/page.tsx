'use client';

import { InsightsList } from '@/components/modules/Insights/InsightsList';

import { PortalShell } from '../_shell';

/**
 * Trang AI-Insights cho brand portal: danh sách báo cáo đã tạo.
 * Tạo mới → /portal/insights/new · xem chi tiết → /portal/insights/[id].
 */
export default function PortalInsightsPage() {
  return (
    <PortalShell>
      <div className='mx-auto max-w-6xl'>
        <InsightsList basePath='/portal/insights' />
      </div>
    </PortalShell>
  );
}
