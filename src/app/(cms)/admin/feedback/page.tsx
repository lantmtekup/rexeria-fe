import { Suspense } from 'react';

import { FeedbackTriagePage } from '@/components/modules/Feedback/admin/FeedbackTriagePage';

export default function AdminFeedbackPage() {
  return (
    <Suspense fallback={<div className='p-6 text-sm'>Loading…</div>}>
      <FeedbackTriagePage />
    </Suspense>
  );
}
