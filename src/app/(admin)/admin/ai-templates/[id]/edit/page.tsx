'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

import { Spinner } from '@/components/atoms/spinner';
import { AdminAITemplateForm } from '@/components/modules/Admin/AdminAITemplates/AdminAITemplateForm';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { AITemplate } from '@/services/rexer/types';

export default function Page() {
  const params = useParams<{ id: string }>();
  const [template, setTemplate] = React.useState<AITemplate | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    rexerApi.adminAiTemplates
      .get(params.id)
      .then(t => {
        if (!cancelled) setTemplate(t);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        toast.error(
          err instanceof RxApiError ? err.message || err.code : String(err)
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className='flex justify-center py-12'>
        <Spinner />
      </div>
    );
  }
  if (!template) {
    return <div className='p-6 text-sm'>Template không tồn tại.</div>;
  }
  return <AdminAITemplateForm initial={template} />;
}
