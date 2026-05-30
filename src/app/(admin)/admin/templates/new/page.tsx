import { Suspense } from 'react';

import { AdminTemplateNewPage } from '@/components/modules/Admin/AdminTemplateNewPage';

export default function Page() {
  return (
    <Suspense fallback={<div className='p-6 text-sm'>Loading…</div>}>
      <AdminTemplateNewPage />
    </Suspense>
  );
}
