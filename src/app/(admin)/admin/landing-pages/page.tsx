import { Suspense } from 'react';

import { AdminCanvasTemplatesPage } from '@/components/modules/Admin/AdminCanvasTemplatesPage';

export default function Page() {
  return (
    <Suspense fallback={<div className='p-6 text-sm'>Loading…</div>}>
      <AdminCanvasTemplatesPage />
    </Suspense>
  );
}
