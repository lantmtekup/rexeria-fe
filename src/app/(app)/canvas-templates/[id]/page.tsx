'use client';

import { use } from 'react';
import { useSearchParams } from 'next/navigation';

import { BlockEditor } from '@/components/modules/CanvasTemplate/BlockEditor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CanvasTemplateEditorPage({ params }: PageProps) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  // `?apply_product=<productId>` — set by campaign detail page link so the
  // editor auto-runs apply-product flow on open.
  const autoApplyProductId = searchParams.get('apply_product') ?? undefined;
  return (
    <div className='flex h-full flex-1 flex-col'>
      <BlockEditor templateId={id} autoApplyProductId={autoApplyProductId} />
    </div>
  );
}
