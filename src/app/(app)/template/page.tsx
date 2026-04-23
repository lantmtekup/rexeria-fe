'use client';

import { useState } from 'react';
import Link from 'next/link';

import { TemplateCard } from '@/components/molecules/TemplateCard';
import { TemplateCategoryTabs } from '@/components/organisms/TemplateCategoryTabs';
import { rexerApi } from '@/services/rexer/endpoints';
import { useRexer } from '@/services/rexer/use-rexer';

const CATEGORIES = [
  { key: 'my', label: 'My Template', count: 8 },
  { key: 'fashion', label: 'Fashion', count: 250 },
  { key: 'fnb', label: 'F&B', count: 250 },
  { key: 'course', label: 'Course', count: 250 },
  { key: 'tech', label: 'Technology', count: 250 },
  { key: 'health', label: 'Health', count: 250 },
  { key: 'book', label: 'Book', count: 250 },
  { key: 'interior', label: 'Interior', count: 250 },
  { key: 'other', label: 'Other', count: 250 },
];

const MOCK_TEMPLATES = [
  {
    id: 'delvaux',
    name: 'Delvaux',
    author: 'Devon J. Love',
    imageBg: '#f5f3ee',
  },
  {
    id: 'lider',
    name: 'Lider',
    author: 'Anton French',
    imageBg: 'linear-gradient(135deg,#3a3a3a,#1a1a1a,#2b2b2b)',
  },
  {
    id: 'beuter',
    name: 'Beuter',
    author: 'Nickolas Barlow',
    imageBg: '#d7d7d7',
  },
  { id: 'levent', name: 'Levent', author: 'Maria Randall', imageBg: '#e0b8a0' },
  { id: 'gucci', name: 'Gucci', author: 'Sofia Costa', imageBg: '#2e3a2d' },
  {
    id: 'matrix',
    name: 'The Matrix',
    author: 'Grace Kim',
    imageBg: 'linear-gradient(135deg,#121218,#2a2a3a)',
  },
];

const BG_PALETTE = [
  '#f5f3ee',
  'linear-gradient(135deg,#3a3a3a,#1a1a1a,#2b2b2b)',
  '#d7d7d7',
  '#e0b8a0',
  '#2e3a2d',
  'linear-gradient(135deg,#121218,#2a2a3a)',
];

export default function TemplateListPage() {
  const [active, setActive] = useState('fashion');
  const templates = useRexer(() => rexerApi.templates.list(), []);

  const items = templates.data?.items?.length
    ? templates.data.items.map((t, i) => ({
        id: t.id,
        name: t.name,
        author: t.description || t.code,
        imageBg: BG_PALETTE[i % BG_PALETTE.length],
      }))
    : MOCK_TEMPLATES;

  return (
    <div className='flex h-full flex-1 flex-col'>
      <div className='border-border border-b px-6 py-3'>
        <TemplateCategoryTabs
          categories={CATEGORIES}
          activeKey={active}
          onChange={setActive}
        />
      </div>
      <div className='flex-1 overflow-y-auto px-6 pb-10'>
        <div className='mx-auto grid max-w-[1400px] grid-cols-1 gap-6 py-6 md:grid-cols-2 xl:grid-cols-2'>
          {templates.loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className='bg-muted aspect-[16/10] animate-pulse rounded-xl'
                />
              ))
            : items.map(t => (
                <Link key={t.id} href={`/template/${t.id}`}>
                  <TemplateCard
                    name={t.name}
                    author={t.author}
                    imageBg={t.imageBg}
                    imageAspect='16 / 10'
                  />
                </Link>
              ))}
        </div>
      </div>
    </div>
  );
}
