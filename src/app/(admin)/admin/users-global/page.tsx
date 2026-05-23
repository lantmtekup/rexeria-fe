import { Suspense } from 'react';

import { AdminGlobalUsersPage } from '@/components/modules/Admin/AdminGlobalUsersPage';

export default function Page() {
  return (
    <Suspense fallback={<div className='p-6 text-sm'>Loading…</div>}>
      <AdminGlobalUsersPage />
    </Suspense>
  );
}
