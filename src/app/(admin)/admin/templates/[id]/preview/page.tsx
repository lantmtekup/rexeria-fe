'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';

import { AdminTemplatePreviewPage } from '@/components/modules/Admin/AdminTemplatePreviewPage';

export default function Page() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  return (
    <Suspense fallback={<div className='p-6 text-sm'>Loading…</div>}>
      <AdminTemplatePreviewPage templateId={id} />
    </Suspense>
  );
}
