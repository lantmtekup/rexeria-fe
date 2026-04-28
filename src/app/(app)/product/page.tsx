'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

import { ProductCard } from '@/components/molecules/ProductCard';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { rexerApi } from '@/services/rexer/endpoints';
import { useRexer } from '@/services/rexer/use-rexer';
import { cn } from '@/lib/cn';

function AddNewProductTile({ className }: { className?: string }) {
  return (
    <Link
      href='/product/new/information'
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
  const products = useRexer(() => rexerApi.products.list({ limit: 50 }), []);

  const items = (products.data?.items ?? []).map(p => ({
    id: p.id,
    name: p.name,
    price: p.status ?? 'draft',
    colors: p.colors ?? [],
    sizes: p.sizes ?? [],
    sku: p.sku ?? p.slug ?? p.id.slice(0, 8),
    date: p.created_at ? new Date(p.created_at).toLocaleDateString() : '—',
  }));

  return (
    <div className='mx-auto w-full max-w-[1400px] px-8 py-6'>
      <SectionHeader
        title='Product'
        showAllHref='/product/new/information'
        showAllLabel='+ Add new product'
      />
      <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
        <AddNewProductTile className='aspect-[2/1] xl:aspect-auto xl:min-h-[240px]' />
        {products.loading
          ? Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className='bg-muted h-48 animate-pulse rounded-xl' />
            ))
          : items.length === 0
            ? null
            : items.map(p => (
                <Link
                  key={p.id}
                  href={`/product/${p.id}/information`}
                  className='block'
                >
                  <ProductCard
                    name={p.name}
                    price={p.price}
                    colors={p.colors}
                    sizes={p.sizes}
                    sku={p.sku}
                    date={p.date}
                  />
                </Link>
              ))}
      </div>
    </div>
  );
}
