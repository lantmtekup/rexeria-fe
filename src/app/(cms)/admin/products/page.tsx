import { Suspense } from 'react';

import { AdminProductsPage } from '@/components/modules/Admin/AdminProductsPage';

export default function Page() {
  return (
    <Suspense fallback={<div className='p-6 text-sm'>Loading…</div>}>
      <AdminProductsPage />
    </Suspense>
  );
}
