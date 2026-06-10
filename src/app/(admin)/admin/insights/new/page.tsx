'use client';

import { useSearchParams } from 'next/navigation';

import { InsightsWizard } from '@/components/modules/Insights/InsightsWizard';

/**
 * Tạo phân tích AI-Insights mới (wizard intake) cho admin/staff.
 * `?from=<reportId>` → chế độ "chỉnh sửa & chạy lại" (prefill từ report cũ).
 */
export default function AdminInsightsNewPage() {
  const fromId = useSearchParams().get('from') ?? undefined;
  return (
    <div className='mx-auto max-w-6xl p-6'>
      <InsightsWizard brandLocked={false} fromReportId={fromId} />
    </div>
  );
}
