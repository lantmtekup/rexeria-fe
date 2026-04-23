'use client';

import { use } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { CreateMarketingDialog } from '@/components/dialogs/CreateMarketingDialog';
import { EmptyState } from '@/components/molecules/EmptyState';
import { MarketingCard } from '@/components/molecules/MarketingCard';
import { ProductWorkspaceLayout } from '@/components/templates/ProductWorkspaceLayout';

interface PageProps {
  params: Promise<{ id: string }>;
}

const MEMBERS = [
  { name: 'Zayden Jarvis' },
  { name: 'Kailee Rogers' },
  { name: 'Ember Mooney' },
  { name: 'Lila Tran' },
];

const MOCK_MARKETINGS = [
  {
    id: 'm1',
    title: 'Marketing 01',
    createdAt: '13.07.2025',
    members: MEMBERS,
    campaigns: '08',
    status: { tone: 'success' as const, label: 'Active' },
  },
  {
    id: 'm2',
    title: 'Marketing 02',
    createdAt: '13.07.2025',
    members: MEMBERS,
    campaigns: '04',
    status: { tone: 'success' as const, label: 'Active' },
  },
  {
    id: 'm3',
    title: 'Marketing 03',
    createdAt: '13.07.2025',
    members: MEMBERS,
    campaigns: '02',
    status: { tone: 'danger' as const, label: 'Stop' },
  },
  {
    id: 'm4',
    title: 'Marketing 04',
    createdAt: '13.07.2025',
    members: MEMBERS,
    campaigns: '12',
    status: { tone: 'danger' as const, label: 'Stop' },
  },
];

export default function ProductMarketingListPage({ params }: PageProps) {
  const { id } = use(params);
  const basePath = `/product/${id}`;
  const isEmpty = id === 'new';
  const productName = isEmpty ? 'Product Name' : 'Samba OG Shoes';

  return (
    <ProductWorkspaceLayout
      basePath={basePath}
      productName={productName}
      scope='product'
      section='marketing'
      actions={
        <>
          {!isEmpty && (
            <CreateMarketingDialog
              trigger={
                <Button variant='pill-light' size='sm'>
                  <Plus className='size-3.5' /> Add more Marketing
                </Button>
              }
            />
          )}
          <Button variant='primary' size='sm'>
            Save
          </Button>
        </>
      }
    >
      <div className='mx-auto w-full max-w-[1200px] px-6 pb-10'>
        {isEmpty ? (
          <EmptyState
            className='py-24'
            icon={
              <svg
                viewBox='0 0 64 64'
                className='size-16'
                fill='currentColor'
                opacity='0.4'
              >
                <rect x='24' y='8' width='16' height='14' rx='3' />
                <rect x='6' y='38' width='16' height='14' rx='3' />
                <rect x='42' y='38' width='16' height='14' rx='3' />
                <path
                  d='M32 22v6M14 38v-4h36v4'
                  stroke='currentColor'
                  strokeWidth='2'
                  fill='none'
                />
              </svg>
            }
            title='Marketing is empty'
            description='Create your first marketing'
            actions={
              <CreateMarketingDialog
                trigger={
                  <Button variant='pill' size='md'>
                    <Plus className='size-4' /> Create Marketing
                  </Button>
                }
              />
            }
          />
        ) : (
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            {MOCK_MARKETINGS.map(m => (
              <Link key={m.id} href={`${basePath}/marketing/${m.id}/discovery`}>
                <MarketingCard
                  title={m.title}
                  createdAt={m.createdAt}
                  members={m.members}
                  campaigns={m.campaigns}
                  status={m.status}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </ProductWorkspaceLayout>
  );
}
