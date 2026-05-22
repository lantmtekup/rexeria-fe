import { Suspense } from 'react';

import { AdminTemplatesPage } from '@/components/modules/Admin/AdminTemplatesPage';

export default function Page() {
  return (
    <Suspense fallback={<div className='p-6 text-sm'>Loading…</div>}>
      <AdminTemplatesPage />
    </Suspense>
  );
}
