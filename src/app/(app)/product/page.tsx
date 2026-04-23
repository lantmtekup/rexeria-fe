'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

import { ProductCard } from '@/components/molecules/ProductCard';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { rexerApi } from '@/services/rexer/endpoints';
import { useRexer } from '@/services/rexer/use-rexer';
import { cn } from '@/lib/cn';

// Fallback if BE is unreachable / unauthenticated
const MOCK_PRODUCTS = [
  {
    id: 'p1',
    name: 'Superstar Shoes',
    price: '99.88 $',
    colors: [
      { hex: '#ffffff' },
      { hex: '#000000' },
      { hex: '#e53935' },
      { hex: '#1e4fff' },
    ],
    sizes: ['3.5 UK', '4 UK', '4.5 UK', '5 UK', '5.5 UK', '6 UK'],
    sku: '#88226256211',
    date: '16.06.2025',
  },
  {
    id: 'p2',
    name: 'Balenciaga Music | Britney Spears Series Oversized Zip-up Hoodie in Faded Black /blue',
    price: '1.493 $',
    colors: [{ hex: '#0f0f0f' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    sku: '#88226256211',
    date: '16.06.2025',
  },
];

function AddNewProductTile({ className }: { className?: string }) {
  return (
    <Link
      href='/product/start'
      className={cn(
        'group border-border hover:border-primary relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed bg-[linear-gradient(135deg,#e7e6e0,#c3c4bd)] transition-colors',
        className
      )}
    >
      <div className='rounded-pill text-neutral-0 flex items-center gap-2 bg-neutral-900 px-4 py-2 text-xs font-semibold shadow-sm transition-transform group-hover:scale-105'>
        <Plus className='size-4' />
        Add new product
      </div>
    </Link>
  );
}

export default function ProductListPage() {
  const projects = useRexer(() => rexerApi.projects.list(), []);

  const items = projects.data?.items?.length
    ? projects.data.items.map(p => ({
        id: p.id,
        name: p.name,
        price: p.status,
        colors: [],
        sizes: [],
        sku: p.slug,
        date: new Date(p.created_at).toLocaleDateString(),
      }))
    : MOCK_PRODUCTS;

  return (
    <div className='mx-auto w-full max-w-[1400px] px-8 py-6'>
      <SectionHeader
        title='Product'
        showAllHref='/product/start'
        showAllLabel='+ Add new product'
      />
      <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
        <AddNewProductTile className='aspect-[2/1] xl:aspect-auto xl:min-h-[240px]' />
        {projects.loading
          ? Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className='bg-muted h-48 animate-pulse rounded-xl' />
            ))
          : items.map(p => (
              <ProductCard
                key={p.id}
                name={p.name}
                price={p.price}
                colors={p.colors}
                sizes={p.sizes}
                sku={p.sku}
                date={p.date}
              />
            ))}
      </div>
    </div>
  );
}
