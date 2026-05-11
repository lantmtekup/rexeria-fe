import { Suspense } from 'react';

import { AdminOverviewPage } from '@/components/modules/Admin/AdminOverviewPage';

export default function AdminHomePage() {
  return (
    <Suspense fallback={<div className='p-6 text-sm'>Loading…</div>}>
      <AdminOverviewPage />
    </Suspense>
  );
}
