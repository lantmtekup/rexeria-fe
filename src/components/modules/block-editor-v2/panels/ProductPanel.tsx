'use client';

import * as React from 'react';
import { Loader2, Package, Search } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/atoms/input';
import { cn } from '@/lib/cn';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Product } from '@/services/rexer/types';

/**
 * Pick a product to merge into the canvas.
 *
 * Same flow as `ProductPickerDialog` — the picked product goes through
 * `applyProduct`, which produces a diff and opens `ReviewChangesDialog` rather
 * than writing straight to the canvas. The dialog is still mounted for the
 * header entry point; this is the always-visible version.
 *
 * Picking is one click here, not select-then-confirm: the review dialog is
 * already the confirmation step, so a second one was just friction.
 */

interface ProductPanelProps {
  onPick: (product: Product, categoryName?: string) => void;
}

export function ProductPanel({ onPick }: ProductPanelProps) {
  const [items, setItems] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [applyingId, setApplyingId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    const handle = setTimeout(() => {
      rexerApi.products
        .list({ limit: 50, q: search.trim() || undefined })
        .then(r => {
          if (alive) setItems(r.items);
        })
        .catch(err => {
          if (!alive) return;
          const msg =
            err instanceof RxApiError
              ? err.message || err.code
              : err instanceof Error
                ? err.message
                : 'Lỗi';
          toast.error(`Không tải được danh sách sản phẩm: ${msg}`);
        })
        .finally(() => {
          if (alive) setLoading(false);
        });
    }, 300);

    return () => {
      alive = false;
      clearTimeout(handle);
    };
  }, [search]);

  const handlePick = async (product: Product) => {
    setApplyingId(product.id);
    try {
      /* Refetch detail for `media` bindings + features — the list endpoint is
         shallow. Falling back to the list shape still applies the text fields. */
      const detail = await rexerApi.products.get(product.id);
      onPick(detail.product, detail.category?.name);
    } catch {
      onPick(product);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <div className='shrink-0 p-2.5'>
        <div className='relative'>
          <Search className='absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-neutral-400' />
          <Input
            placeholder='Tìm sản phẩm…'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='h-8 pl-8 text-xs'
          />
        </div>
        <p className='text-3xs mt-2 leading-relaxed text-neutral-500'>
          Chọn 1 sản phẩm — tên, mô tả, màu, kích cỡ, đặc điểm sẽ được điền vào
          tất cả block. Bạn sẽ xem lại thay đổi trước khi áp dụng.
        </p>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto px-2.5 pb-2.5'>
        {loading ? (
          <div className='flex items-center justify-center gap-2 py-8 text-xs text-neutral-500'>
            <Loader2 className='size-3.5 animate-spin' />
            Đang tải…
          </div>
        ) : items.length === 0 ? (
          <p className='py-8 text-center text-xs text-neutral-500'>
            Không tìm thấy sản phẩm nào.
          </p>
        ) : (
          <div className='flex flex-col gap-1'>
            {items.map(product => {
              const applying = applyingId === product.id;
              return (
                <button
                  key={product.id}
                  type='button'
                  disabled={applyingId !== null}
                  onClick={() => handlePick(product)}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left transition-colors',
                    'hover:bg-[var(--pv2-paper)]',
                    'disabled:cursor-wait disabled:opacity-60'
                  )}
                >
                  <span className='grid size-7 shrink-0 place-items-center rounded bg-neutral-100 text-neutral-400'>
                    {applying ? (
                      <Loader2 className='size-3.5 animate-spin' />
                    ) : (
                      <Package className='size-3.5' />
                    )}
                  </span>
                  <span className='min-w-0 flex-1'>
                    <span className='text-2xs block truncate font-medium text-neutral-800'>
                      {product.name}
                    </span>
                    {product.sku && (
                      <span className='text-3xs block truncate text-neutral-400'>
                        {product.sku}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
