'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { Download, PaletteIcon, Upload } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { MediaCard } from '@/components/molecules/MediaCard';
import {
  MediaFilterBar,
  type MediaFilter,
} from '@/components/organisms/MediaFilterBar';
import { EmptyState } from '@/components/molecules/EmptyState';
import { ProductWorkspaceLayout } from '@/components/templates/ProductWorkspaceLayout';

interface PageProps {
  params: Promise<{ id: string }>;
}

type MediaItem = {
  id: string;
  name: string;
  createdAt: string;
  type: 'image' | 'video' | '3d';
};

const MOCK_MEDIA: MediaItem[] = [
  {
    id: 'm1',
    name: 'Samba OG Shoes (01)',
    createdAt: '02.06.2025',
    type: 'image',
  },
  {
    id: 'm2',
    name: 'Samba OG Shoes (02)',
    createdAt: '02.06.2025',
    type: 'image',
  },
  {
    id: 'm3',
    name: 'Samba OG Shoes (03)',
    createdAt: '02.06.2025',
    type: 'image',
  },
  {
    id: 'm4',
    name: 'Samba OG Shoes (04)',
    createdAt: '02.06.2025',
    type: 'image',
  },
  {
    id: 'm5',
    name: 'Samba OG Shoes (05)',
    createdAt: '02.06.2025',
    type: 'image',
  },
  {
    id: 'm6',
    name: 'Samba OG Shoes (06)',
    createdAt: '02.06.2025',
    type: 'video',
  },
];

export default function ProductMediaPage({ params }: PageProps) {
  const { id } = use(params);
  const basePath = `/product/${id}`;
  const isEmpty = id === 'new';
  const productName = isEmpty ? 'Product Name' : 'Samba OG Shoes';

  const [filter, setFilter] = useState<MediaFilter>('all');

  const counts = useMemo(() => {
    const c = { all: 0, image: 0, video: 0, '3d': 0 };
    if (!isEmpty) {
      for (const m of MOCK_MEDIA) {
        c.all++;
        c[m.type]++;
      }
    }
    return c;
  }, [isEmpty]);

  const visible = useMemo(() => {
    if (isEmpty) return [];
    return filter === 'all'
      ? MOCK_MEDIA
      : MOCK_MEDIA.filter(m => m.type === filter);
  }, [filter, isEmpty]);

  return (
    <ProductWorkspaceLayout
      basePath={basePath}
      productName={productName}
      scope='product'
      section='media'
      actions={
        <>
          <Button variant='pill-light' size='sm'>
            <Upload className='size-3.5' /> Upload
          </Button>
          <Button asChild variant='primary' size='sm'>
            <Link href={basePath + '/marketing'}>Save</Link>
          </Button>
        </>
      }
    >
      {/* Filename / Import / API row */}
      <div className='mx-auto mb-4 flex w-full max-w-[1200px] items-center gap-2 px-6'>
        <div className='bg-muted text-foreground flex flex-1 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium'>
          {productName}
        </div>
        <Button variant='pill-light' size='sm'>
          <Download className='size-3.5' /> Import
        </Button>
        <Button variant='pill-light' size='sm'>
          <PaletteIcon className='size-3.5' /> API
        </Button>
      </div>

      <div className='mx-auto w-full max-w-[1200px] px-6 pb-10'>
        {isEmpty ? (
          <EmptyState
            icon={
              <svg
                viewBox='0 0 64 64'
                className='size-16'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <path d='M8 16a4 4 0 0 1 4-4h14l4 6h22a4 4 0 0 1 4 4v26a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V16z' />
              </svg>
            }
            title={
              <>
                You don&apos;t have
                <br />
                any files yet
              </>
            }
            actions={
              <Button variant='pill' size='md'>
                <svg viewBox='0 0 16 16' className='size-4' fill='currentColor'>
                  <path d='M8 3a.8.8 0 0 1 .8.8V7.2h3.4a.8.8 0 0 1 0 1.6H8.8v3.4a.8.8 0 0 1-1.6 0V8.8H3.8a.8.8 0 0 1 0-1.6h3.4V3.8A.8.8 0 0 1 8 3z' />
                </svg>
                Create new folder
              </Button>
            }
          />
        ) : (
          <>
            <div className='pb-4'>
              <MediaFilterBar
                active={filter}
                counts={counts}
                onChange={setFilter}
                onNew={() => {}}
              />
            </div>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {visible.map(m => (
                <MediaCard key={m.id} name={m.name} createdAt={m.createdAt} />
              ))}
            </div>
          </>
        )}
      </div>
    </ProductWorkspaceLayout>
  );
}
