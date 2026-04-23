'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/atoms/button';
import { MediaCard } from '@/components/molecules/MediaCard';
import {
  MediaFilterBar,
  type MediaFilter,
} from '@/components/organisms/MediaFilterBar';
import { ProductWorkspaceLayout } from '@/components/templates/ProductWorkspaceLayout';

interface PageProps {
  params: Promise<{ productId: string }>;
}

const MOCK = [
  {
    id: 'm1',
    name: 'Samba OG Shoes (01)',
    createdAt: '02.06.2025',
    type: 'image' as const,
  },
  {
    id: 'm2',
    name: 'Samba OG Shoes (02)',
    createdAt: '02.06.2025',
    type: 'image' as const,
  },
  {
    id: 'm3',
    name: 'Samba OG Shoes (03)',
    createdAt: '02.06.2025',
    type: 'image' as const,
  },
  {
    id: 'm4',
    name: 'Samba OG Shoes (04)',
    createdAt: '02.06.2025',
    type: 'image' as const,
  },
  {
    id: 'm5',
    name: 'Samba OG Shoes (05)',
    createdAt: '02.06.2025',
    type: 'image' as const,
  },
  {
    id: 'm6',
    name: 'Samba OG Shoes (06)',
    createdAt: '02.06.2025',
    type: 'video' as const,
  },
];

export default function AiAgentsMediaPage({ params }: PageProps) {
  const { productId } = use(params);
  const basePath = `/ai-agents/${productId}`;
  const productName = 'Samba OG Shoes';

  const [filter, setFilter] = useState<MediaFilter>('all');
  const counts = useMemo(
    () => ({
      all: MOCK.length,
      image: MOCK.filter(m => m.type === 'image').length,
      video: MOCK.filter(m => m.type === 'video').length,
      '3d': 0,
    }),
    []
  );
  const visible = filter === 'all' ? MOCK : MOCK.filter(m => m.type === filter);

  return (
    <ProductWorkspaceLayout
      basePath={basePath}
      productName={productName}
      scope='ai-agents'
      section='media'
      actions={
        <Button asChild variant='primary' size='sm'>
          <Link href={basePath + '/marketing'}>Continue</Link>
        </Button>
      }
    >
      <div className='mx-auto w-full max-w-[1200px] px-6 pb-10'>
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
      </div>
    </ProductWorkspaceLayout>
  );
}
