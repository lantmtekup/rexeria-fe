import { BarChart3 } from 'lucide-react';

import { AdminComingSoon } from '@/components/modules/Admin/AdminComingSoon';

export default function AdminAnalyticsPage() {
  return (
    <AdminComingSoon
      icon={BarChart3}
      title='Landing page Analytics'
      subtitle='Track lượt xem, click, dwell time và funnel conversion theo từng landing page published. KPIs + block breakdown + action-level drilldown.'
      specFile='be-template-analytics-spec.md'
      estTime='~3 tuần BE'
      dependencies={[
        {
          status: 'new',
          text: 'Bảng analytics_events với event_type (template_view / block_view / block_click...)',
        },
        {
          status: 'new',
          text: 'POST /v1/analytics/events ingest (public, rate-limit 100/min/visitor)',
        },
        {
          status: 'new',
          text: 'GET /v1/admin/analytics/templates/summary: KPI per landing page',
        },
        {
          status: 'new',
          text: 'GET /v1/admin/analytics/templates/{id}/breakdown: block + action detail',
        },
        {
          status: 'new',
          text: 'Funnel cho BookingForm, slides cho Carousel, images cho Gallery',
        },
        {
          status: 'new',
          text: 'Retention 90 ngày + materialized view khi data > 50M rows',
        },
      ]}
      previewHref='/overview/analytics/templates'
      previewLabel='Xem demo /analytics/templates'
    />
  );
}
