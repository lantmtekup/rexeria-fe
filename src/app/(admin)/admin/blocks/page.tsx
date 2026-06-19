import { Suspense } from 'react';

import { BlocksPage } from '@/components/modules/Blocks/BlocksPage';

export default function Page() {
  return (
    <Suspense fallback={<div className='p-6 text-sm'>Loading…</div>}>
      <BlocksPage />
    </Suspense>
  );
}
