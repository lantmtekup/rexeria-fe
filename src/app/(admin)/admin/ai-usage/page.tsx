import { Suspense } from 'react';

import { AdminAiUsagePage } from '@/components/modules/Admin/AdminAiUsagePage';

export default function Page() {
  return (
    <Suspense fallback={<div className='p-6 text-sm'>Loading…</div>}>
      <AdminAiUsagePage />
    </Suspense>
  );
}
