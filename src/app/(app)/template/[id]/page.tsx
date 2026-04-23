'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import {
  Bookmark,
  Heart,
  MessageCircle,
  Monitor,
  Share2,
  Smartphone,
  Sparkles,
} from 'lucide-react';

import { Avatar } from '@/components/atoms/avatar';
import { Button } from '@/components/atoms/button';
import { IconButton } from '@/components/atoms/icon-button';
import { WorkspaceTopBar } from '@/components/organisms/WorkspaceTopBar';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TemplatePreviewPage({ params }: PageProps) {
  const { id } = use(params);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  const name = id.charAt(0).toUpperCase() + id.slice(1);

  return (
    <div className='flex h-full flex-1 flex-col'>
      <WorkspaceTopBar
        title={<span className='text-2xl font-bold uppercase'>{name}</span>}
        actions={
          <>
            <div className='mr-4 flex items-center gap-3 text-sm'>
              <Avatar src='' name='Ryan Puckett' size='sm' />
              <div>
                <p className='text-content-muted text-xs'>16 Templates</p>
                <p className='font-semibold'>By Ryan Puckett</p>
              </div>
            </div>
            <Button asChild variant='outline' size='sm'>
              <Link href={`/template/${id}/edit`}>Edit</Link>
            </Button>
            <Button variant='ai' size='sm'>
              <Sparkles className='size-3.5' /> AI-Assistant
            </Button>
          </>
        }
      />

      {/* Toolbar — social actions + device switch */}
      <div className='border-border bg-background flex items-center justify-between border-b px-4 py-3'>
        <div className='flex items-center gap-2'>
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
                ? 'bg-background text-foreground shadow-sm'
                : 'text-content-muted hover:text-foreground'
            }`}
          >
            <Monitor className='size-3.5' />
            Desktop
          </button>
          <button
            type='button'
            onClick={() => setDevice('mobile')}
            className={`rounded-pill inline-flex h-7 cursor-pointer items-center gap-1.5 px-3 text-xs font-semibold ${
              device === 'mobile'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-content-muted hover:text-foreground'
            }`}
          >
            <Smartphone className='size-3.5' />
            Mobile
          </button>
        </div>

        <div className='w-[200px]' />
      </div>

      {/* Preview stage */}
      <div className='flex flex-1 items-center justify-center overflow-auto bg-neutral-100 p-10'>
        {device === 'desktop' ? (
          <div className='bg-background flex aspect-[16/10] w-full max-w-4xl items-center justify-center rounded-2xl shadow-xl'>
            <span className='text-foreground text-3xl font-black tracking-[-0.04em] uppercase'>
              {name}
            </span>
          </div>
        ) : (
          <div className='bg-background ring-border flex h-[640px] w-[320px] flex-col overflow-hidden rounded-[32px] shadow-xl ring-1'>
            <div className='flex items-center justify-between bg-neutral-100 px-6 py-2 text-[10px] font-semibold'>
              <span>9:41</span>
              <span className='h-5 w-16 rounded-full bg-black' />
              <span>100%</span>
            </div>
            <div className='flex flex-1 items-center justify-center'>
              <span className='text-xl font-bold'>{name}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
