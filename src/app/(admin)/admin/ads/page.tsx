import { Suspense } from 'react';

import { AdminAdMetricsPage } from '@/components/modules/Admin/AdminAdMetricsPage';

export default function Page() {
  return (
    <Suspense fallback={<div className='p-6 text-sm'>Loading…</div>}>
      <AdminAdMetricsPage />
    </Suspense>
  );
}
