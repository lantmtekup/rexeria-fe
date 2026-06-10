import { InsightsWizard } from '@/components/modules/Insights/InsightsWizard';

/**
 * Trang AI-Insights cho admin/staff.
 * Brand KHÔNG bị khoá (brandLocked=false) — màn setup phải cho chọn brand tường minh,
 * vì admin không có một workspace active duy nhất như brand portal.
 */
export default function AdminInsightsPage() {
  return (
    <div className='mx-auto max-w-6xl p-6'>
      <InsightsWizard brandLocked={false} />
    </div>
  );
}
