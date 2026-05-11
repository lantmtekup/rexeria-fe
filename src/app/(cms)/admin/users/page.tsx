import { Suspense } from 'react';

import { AdminUsersPage } from '@/components/modules/Admin/AdminUsersPage';

export default function Page() {
  return (
    <Suspense fallback={<div className='p-6 text-sm'>Loading…</div>}>
      <AdminUsersPage />
    </Suspense>
  );
}
