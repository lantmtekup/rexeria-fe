'use client';

import { useParams } from 'next/navigation';

import { InsightReportView } from '@/components/modules/Insights/InsightReportView';

import { PortalShell } from '../../_shell';

/**
 * Chi tiết 1 báo cáo AI-Insights (blueprint hoặc trạng thái đang chạy) — brand portal.
 */
export default function PortalInsightDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? '');
  return (
    <PortalShell>
      <div className='mx-auto max-w-6xl'>
        <InsightReportView reportId={id} basePath='/portal/insights' />
      </div>
    </PortalShell>
  );
}
