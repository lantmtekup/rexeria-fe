import { InsightsWizard } from '@/components/modules/Insights/InsightsWizard';

/**
 * Tạo phân tích AI-Insights mới (wizard intake) cho admin/staff.
 * Brand KHÔNG khoá (brandLocked=false) — màn setup cho chọn workspace tường minh.
 */
export default function AdminInsightsNewPage() {
  return (
    <div className='mx-auto max-w-6xl p-6'>
      <InsightsWizard brandLocked={false} />
    </div>
  );
}
