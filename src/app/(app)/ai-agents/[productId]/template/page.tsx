'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Heart,
  MessageCircle,
  Monitor,
  RefreshCw,
  Share2,
  Smartphone,
} from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { IconButton } from '@/components/atoms/icon-button';
import { ProductWorkspaceLayout } from '@/components/templates/ProductWorkspaceLayout';

interface PageProps {
  params: Promise<{ productId: string }>;
}

const TEMPLATES = [
  { id: 'delvaux', name: 'Delvaux', imageBg: '#f5f3ee' },
  { id: 'kristin', name: 'Kristin Ozment', imageBg: '#cbb7a9' },
  {
    id: 'matrix',
    name: 'The Matrix',
    imageBg: 'linear-gradient(135deg,#121218,#2a2a3a)',
  },
  { id: 'model', name: 'Model', imageBg: '#d7c7ba' },
];

export default function AiTemplatePickerPage({ params }: PageProps) {
  const { productId } = use(params);
  const [selected, setSelected] = useState(TEMPLATES[0].id);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <ProductWorkspaceLayout
      basePath={`/ai-agents/${productId}`}
      productName='Samba OG Shoes'
      scope='ai-agents'
      section='template'
      actions={
        <Button asChild variant='primary' size='sm'>
          <Link href={`/ai-agents/${productId}/campaign`}>Continue</Link>
        </Button>
      }
    >
      <div className='mx-auto grid h-full w-full max-w-[1200px] grid-cols-[280px_1fr] gap-4 px-6 pb-6'>
        {/* Left — template list */}
        <div className='flex h-full flex-col gap-3 overflow-y-auto'>
          <div className='flex flex-col gap-3'>
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                type='button'
                onClick={() => setSelected(t.id)}
                className={`overflow-hidden rounded-xl border-2 p-3 text-left transition-colors ${
                  selected === t.id
                    ? 'border-primary'
                    : 'border-border hover:border-neutral-300'
                }`}
              >
                <div
                  className='mb-2 flex aspect-[4/3] items-center justify-center rounded-lg bg-neutral-100'
                  style={{ background: t.imageBg }}
                >
                  <span className='text-sm font-black uppercase'>{t.name}</span>
                </div>
                <p className='text-sm font-semibold'>{t.name}</p>
              </button>
            ))}
          </div>
          <button
            type='button'
            className='rounded-pill border-primary text-primary hover:bg-primary/5 mt-2 inline-flex h-9 cursor-pointer items-center justify-center gap-2 border text-xs font-semibold'
          >
            <RefreshCw className='size-3.5' />
            Refresh new suggestion
          </button>
        </div>

        {/* Right — preview + toolbar */}
        <div className='border-border flex h-full flex-col rounded-xl border bg-neutral-100'>
          <div className='flex flex-1 items-center justify-center p-8'>
            <div
              className={`bg-background flex items-center justify-center rounded-xl shadow-xl ${
                device === 'desktop'
                  ? 'aspect-[16/10] w-full max-w-3xl'
                  : 'h-[520px] w-[280px]'
              }`}
            >
              <span className='text-2xl font-black uppercase'>
                {TEMPLATES.find(t => t.id === selected)?.name ?? ''}
              </span>
            </div>
          </div>
          <div className='border-border bg-background flex items-center justify-between border-t px-4 py-3'>
            <div className='flex items-center gap-1'>
              <IconButton aria-label='Like' variant='ghost' size='sm'>
                <Heart />
              </IconButton>
              <IconButton aria-label='Comment' variant='ghost' size='sm'>
                <MessageCircle />
              </IconButton>
              <IconButton aria-label='Share' variant='ghost' size='sm'>
                <Share2 />
              </IconButton>
              <IconButton aria-label='Bookmark' variant='ghost' size='sm'>
                <Bookmark />
              </IconButton>
            </div>
            <div className='rounded-pill inline-flex items-center gap-1 bg-neutral-100 p-1'>
              <button
                type='button'
                onClick={() => setDevice('desktop')}
                className={`rounded-pill inline-flex h-7 cursor-pointer items-center gap-1.5 px-3 text-xs font-semibold ${
                  device === 'desktop'
                    ? 'bg-background shadow-sm'
                    : 'text-content-muted'
                }`}
              >
                <Monitor className='size-3.5' /> Desktop
              </button>
              <button
                type='button'
                onClick={() => setDevice('mobile')}
                className={`rounded-pill inline-flex h-7 cursor-pointer items-center gap-1.5 px-3 text-xs font-semibold ${
                  device === 'mobile'
                    ? 'bg-background shadow-sm'
                    : 'text-content-muted'
                }`}
              >
                <Smartphone className='size-3.5' /> Mobile
              </button>
            </div>
            <Button variant='primary' size='sm'>
              Edit
            </Button>
          </div>
        </div>
      </div>
    </ProductWorkspaceLayout>
  );
}
