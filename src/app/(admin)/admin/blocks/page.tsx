import { Suspense } from 'react';

import { AdminBlocksPage } from '@/components/modules/Admin/AdminBlocksPage';

export default function Page() {
  return (
    <Suspense fallback={<div className='p-6 text-sm'>Loading…</div>}>
      <AdminBlocksPage />
    </Suspense>
  );
}
