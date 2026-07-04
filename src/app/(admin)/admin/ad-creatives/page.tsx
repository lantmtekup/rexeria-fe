import { Suspense } from 'react';

import { AdminAdCreativesPage } from '@/components/modules/Admin/AdminAdCreativesPage';

export default function Page() {
  return (
    <Suspense fallback={<div className='p-6 text-sm'>Loading…</div>}>
      <AdminAdCreativesPage />
    </Suspense>
  );
}
