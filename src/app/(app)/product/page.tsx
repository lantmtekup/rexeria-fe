'use client';

import * as React from 'react';
import Link from 'next/link';
import { ImageIcon, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Spinner } from '@/components/atoms/spinner';
import { SectionHeader } from '@/components/molecules/SectionHeader';
import { ProductTemplateList } from '@/components/modules/Product/ProductTemplateList';
import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { Product } from '@/services/rexer/types';

type ProductTab = 'all' | 'templates';

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
}

const STATUS_TONE: Record<string, string> = {
  draft: 'bg-neutral-100 text-neutral-700',
  active: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-neutral-200 text-neutral-500',
};

function AddNewProductTile() {
  return (
    <Link
      href='/product/new/information'
      className='group border-border hover:border-primary relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed bg-[linear-gradient(135deg,#e7e6e0,#c3c4bd)] transition-colors'
    >
      <div className='rounded-pill text-neutral-0 flex items-center gap-2 bg-neutral-900 px-3 py-1.5 text-xs font-semibold shadow-sm transition-transform group-hover:scale-105'>
        <Plus className='size-3.5' />
        Add new
      </div>
    </Link>
  );
}

function ProductTile({
  product,
  onDelete,
  deleting,
}: {
  product: Product;
  onDelete: (p: Product) => void;
  deleting: boolean;
}) {
  const tone = STATUS_TONE[product.status ?? 'draft'] ?? STATUS_TONE.draft;
  const date = product.created_at
    ? new Date(product.created_at).toLocaleDateString()
    : '—';
  return (
    <Link
      href={`/product/${product.id}/information`}
      className='border-border bg-background hover:border-primary group relative flex flex-col overflow-hidden rounded-xl border transition-colors'
    >
      <button
        type='button'
        disabled={deleting}
        aria-label={`Xoá ${product.name}`}
        title='Xoá'
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(product);
        }}
        className='absolute top-2 right-2 z-10 flex size-7 cursor-pointer items-center justify-center rounded-md bg-white/90 text-neutral-500 shadow-sm backdrop-blur transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50'
      >
        <Trash2 className='size-3.5' />
      </button>

      <div className='bg-muted relative flex aspect-square items-center justify-center overflow-hidden'>
        {product.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.thumbnail_url}
            alt={product.name}
            className='size-full object-cover transition-transform duration-500 group-hover:scale-105'
            draggable={false}
          />
        ) : (
          <ImageIcon className='text-muted-foreground size-10' />
        )}
        <span
          className={cn(
            'text-3xs absolute top-2 left-2 rounded-full px-2 py-0.5 font-medium capitalize',
            tone
          )}
        >
          {product.status ?? 'draft'}
        </span>
      </div>

      <div className='flex flex-col gap-1 p-3'>
        <p className='text-foreground line-clamp-2 text-sm leading-tight font-semibold'>
          {product.name}
        </p>
        <div className='text-muted-foreground text-3xs flex items-center justify-between'>
          <span className='truncate'>
            {product.sku ?? product.slug ?? product.id.slice(0, 8)}
          </span>
          <span>{date}</span>
        </div>
        {(product.colors?.length || product.sizes?.length) && (
          <div className='text-muted-foreground text-3xs flex flex-wrap gap-2'>
            {product.colors?.length ? (
              <span>{product.colors.length} màu</span>
            ) : null}
            {product.sizes?.length ? (
              <span>{product.sizes.length} cỡ</span>
            ) : null}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function ProductListPage() {
  const [tab, setTab] = React.useState<ProductTab>('all');
  const [items, setItems] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const reload = React.useCallback(async () => {
    setLoading(true);
    try {
      // Filter out templates from the "Tất cả" view — they live in the
      // dedicated "Templates" tab so the user's product list stays focused.
      const r = await rexerApi.products.list({
        limit: 50,
        is_template: false,
      });
      setItems(r.items ?? []);
    } catch (err) {
      toast.error(`Không tải được sản phẩm: ${rxErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const handleDelete = async (p: Product) => {
    if (!window.confirm(`Xoá sản phẩm "${p.name}"? Không thể hoàn tác.`))
      return;
    setDeletingId(p.id);
    try {
      await rexerApi.products.remove(p.id);
      setItems(prev => prev.filter(x => x.id !== p.id));
      toast.success(`Đã xoá "${p.name}"`);
    } catch (err) {
      toast.error(`Xoá thất bại: ${rxErrorMessage(err)}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className='mx-auto w-full max-w-[1400px] px-6 py-6'>
      <SectionHeader
        title='Product'
        showAllHref={tab === 'all' ? '/product/new/information' : undefined}
        showAllLabel={tab === 'all' ? '+ Add new product' : undefined}
      />

      {/* Tab strip */}
      <div className='mb-4 flex items-center gap-1 border-b border-neutral-200'>
        {(
          [
            ['all', 'Tất cả sản phẩm'],
            ['templates', 'Templates'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type='button'
            onClick={() => setTab(value)}
            className={cn(
              '-mb-px cursor-pointer border-b-2 px-3 py-2 text-xs font-semibold tracking-wider uppercase transition-colors',
              tab === value
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'all' ? (
        loading ? (
          <div className='text-muted-foreground flex justify-center py-16'>
            <Spinner size={20} />
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
            <AddNewProductTile />
            {items.map(p => (
              <ProductTile
                key={p.id}
                product={p}
                onDelete={handleDelete}
                deleting={deletingId === p.id}
              />
            ))}
          </div>
        )
      ) : (
        <ProductTemplateList />
      )}
    </div>
  );
}
