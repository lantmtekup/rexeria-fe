import { Suspense } from 'react';

import { AdminAITemplateForm } from '@/components/modules/Admin/AdminAITemplates/AdminAITemplateForm';

export default function Page() {
  return (
    <Suspense fallback={<div className='p-6 text-sm'>Loading…</div>}>
      <AdminAITemplateForm />
    </Suspense>
  );
}
