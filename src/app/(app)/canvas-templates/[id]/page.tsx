'use client';

import { use } from 'react';

import { CanvasEditor } from '@/components/modules/CanvasTemplate/CanvasEditor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CanvasTemplateEditorPage({ params }: PageProps) {
  const { id } = use(params);
  return (
    <div className='flex h-full flex-1 flex-col'>
      <CanvasEditor templateId={id} />
    </div>
  );
}
