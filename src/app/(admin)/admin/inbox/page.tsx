import { Suspense } from 'react';

import { AdminInboxPage } from '@/components/modules/Admin/AdminInboxPage';

export default function Page() {
  return (
    <Suspense fallback={<div className='p-6 text-sm'>Loading…</div>}>
      <AdminInboxPage />
    </Suspense>
  );
}
