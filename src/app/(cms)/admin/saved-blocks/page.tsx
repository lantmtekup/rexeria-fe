import { Suspense } from 'react';

import { AdminSavedBlocksPage } from '@/components/modules/Admin/AdminSavedBlocksPage';

export default function Page() {
  return (
    <Suspense fallback={<div className='p-6 text-sm'>Loading…</div>}>
      <AdminSavedBlocksPage />
    </Suspense>
  );
}
