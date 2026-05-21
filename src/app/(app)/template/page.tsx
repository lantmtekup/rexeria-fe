'use client';

import * as React from 'react';
import { Layers, Sparkles } from 'lucide-react';

import { CanvasTemplateList } from '@/components/modules/CanvasTemplate/CanvasTemplateList';
import { AITemplateList } from '@/components/modules/CanvasTemplate/ai/AITemplateList';
import { SubTabBar } from '@/components/organisms/SubTabBar';

type TabKey = 'canvas' | 'ai';

export default function TemplateListPage() {
  const [active, setActive] = React.useState<TabKey>('canvas');

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
          {
            key: 'ai',
            label: (
              <span className='inline-flex items-center gap-2'>
                <Sparkles className='size-3.5' /> AI Template
              </span>
            ),
          },
        ]}
        activeKey={active}
        onChange={k => setActive(k as TabKey)}
      />

      <div className='flex-1 overflow-y-auto'>
        {active === 'canvas' ? <CanvasTemplateList /> : <AITemplateList />}
      </div>
    </div>
  );
}
