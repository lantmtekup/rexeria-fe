'use client';

import { useParams } from 'next/navigation';

import { InsightReportView } from '@/components/modules/Insights/InsightReportView';

/**
 * Chi tiết 1 báo cáo AI-Insights — admin/staff.
 */
export default function AdminInsightDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? '');
  return (
    <div className='mx-auto max-w-6xl p-6'>
      <InsightReportView reportId={id} basePath='/admin/insights' />
    </div>
  );
}
