'use client';

import { Layers } from 'lucide-react';

import { CanvasTemplateList } from '@/components/modules/CanvasTemplate/CanvasTemplateList';
import { SubTabBar } from '@/components/organisms/SubTabBar';

export default function TemplateListPage() {
  return (
    <div className='flex h-full flex-1 flex-col'>
      <SubTabBar
        tabs={[
          {
            key: 'canvas',
            label: (
              <span className='inline-flex items-center gap-2'>
                <Layers className='size-3.5' /> Template
              </span>
            ),
          },
        ]}
        activeKey='canvas'
        onChange={() => {}}
      />

      <div className='flex-1 overflow-y-auto'>
        <CanvasTemplateList />
      </div>
    </div>
  );
}
