import { Suspense } from 'react';

import { AdminBlockTypesPage } from '@/components/modules/Admin/AdminBlockTypesPage';

export default function Page() {
  return (
    <Suspense fallback={<div className='p-6 text-sm'>Loading…</div>}>
      <AdminBlockTypesPage />
    </Suspense>
  );
}
