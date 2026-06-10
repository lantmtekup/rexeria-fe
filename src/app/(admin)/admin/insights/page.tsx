import { InsightsList } from '@/components/modules/Insights/InsightsList';

/**
 * Trang AI-Insights cho admin/staff: danh sách báo cáo.
 * Tạo mới → /admin/insights/new · chi tiết → /admin/insights/[id].
 */
export default function AdminInsightsPage() {
  return (
    <div className='mx-auto max-w-6xl p-6'>
      <InsightsList basePath='/admin/insights' />
    </div>
  );
}
