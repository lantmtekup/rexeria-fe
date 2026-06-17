import { Sparkles } from 'lucide-react';

import { AdminComingSoon } from '@/components/modules/Admin/AdminComingSoon';

// A4 (be-response-to-fe-qa §A4): API đọc AI usage defer Phase 2. Bảng `ai_usage`
// vẫn được ghi (AIUsageRecorder), nhưng endpoint đọc brand-scoped cần build mới.
// Giữ trang ở "coming soon" tới khi BE ship; khi đó khôi phục AdminAiUsagePage.
export default function Page() {
  return (
    <AdminComingSoon
      icon={Sparkles}
      title='AI Usage analytics'
      subtitle='Theo dõi số request AI, token, chi phí theo ngày + drilldown theo brand/user. Bảng ai_usage đã ghi log mỗi call; chờ BE build API đọc brand-scoped.'
      specFile='be-ai-usage-spec.md'
      estTime='Phase 2 BE'
      dependencies={[
        {
          status: 'in_progress',
          text: 'Bảng ai_usage vẫn sống (AIUsageRecorder ghi mỗi call AI)',
        },
        {
          status: 'new',
          text: 'GET /v1/admin/ai-usage: aggregate (group_by=day, from/to)',
        },
        {
          status: 'new',
          text: 'GET /v1/admin/ai-usage/list: list paginate brand-scoped',
        },
      ]}
    />
  );
}
