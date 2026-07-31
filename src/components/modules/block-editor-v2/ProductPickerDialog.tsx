'use client';

import * as React from 'react';
import { Loader2, Package, Search } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@/components/atoms/input';
import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Spinner } from '@/components/atoms/spinner';
import { cn } from '@/lib/cn';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Product } from '@/services/rexer/types';

interface ProductPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Called with the picked product. `categoryName` comes from the
   * `ProductResponse.category` embed (when BE returns one) — useful for
   * forms that need a human label rather than the raw category_id.
   */
  onPick: (product: Product, categoryName?: string) => void;
}

export function ProductPickerDialog({
  open,
  onOpenChange,
  onPick,
}: ProductPickerDialogProps) {
  const [items, setItems] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoading(true);
    rexerApi.products
      .list({ limit: 50, q: search.trim() || undefined })
      .then(r => {
        if (!alive) return;
        setItems(r.items);
        if (r.items.length > 0) setSelectedId(r.items[0].id);
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
    return () => {
      alive = false;
    };
  }, [open, search]);

  const handleApply = async () => {
    if (!selectedId) return;
    const picked = items.find(i => i.id === selectedId);
    if (!picked) return;
    setLoading(true);
    try {
      // Refetch detail to pick up `media` bindings + features (list endpoint
      // is shallow — see GAP-17 in be-issues-master.md).
      const detail = await rexerApi.products.get(selectedId);
      onPick(detail.product, detail.category?.name);
      onOpenChange(false);
    } catch {
      // Fall back to the list shape — features still work, just no media.
      onPick(picked);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Áp dụng sản phẩm vào template</DialogTitle>
          <DialogDescription>
            Chọn 1 sản phẩm — tên, mô tả, màu, kích cỡ, đặc điểm sẽ được điền tự
            động vào tất cả block.
          </DialogDescription>
        </DialogHeader>

        <div className='relative'>
          <Search className='text-muted-foreground absolute top-1/2 left-3 size-3.5 -translate-y-1/2' />
          <Input
            placeholder='Tìm sản phẩm…'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='h-9 pl-9'
          />
        </div>

        <div className='max-h-[400px] overflow-y-auto'>
          {loading ? (
            <div className='flex justify-center py-8'>
              <Spinner size={18} />
            </div>
          ) : items.length === 0 ? (
            <div className='flex flex-col items-center gap-2 py-8 text-sm text-neutral-500'>
              <Package className='size-8 text-neutral-300' />
              {search ? 'Không có sản phẩm khớp' : 'Chưa có sản phẩm nào'}
            </div>
          ) : (
            <div className='flex flex-col gap-1.5'>
              {items.map(p => {
                const isSel = selectedId === p.id;
                return (
                  <button
                    key={p.id}
                    type='button'
                    onClick={() => setSelectedId(p.id)}
                    className={cn(
                      'border-border bg-background hover:border-primary flex items-start gap-3 rounded-lg border-2 px-3 py-2.5 text-left transition-colors',
                      isSel && 'border-primary bg-primary/5'
                    )}
                  >
                    <div className='bg-muted relative size-14 shrink-0 overflow-hidden rounded-md border border-neutral-200'>
                      {p.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.thumbnail_url}
                          alt={p.name}
                          className='size-full object-cover'
                          draggable={false}
                        />
                      ) : (
                        <div className='flex size-full items-center justify-center'>
                          <Package className='text-muted-foreground size-5' />
                        </div>
                      )}
                    </div>
                    <div className='flex min-w-0 flex-1 flex-col gap-1'>
                      <div className='flex items-center justify-between gap-2'>
                        <p className='text-foreground truncate text-sm font-semibold'>
                          {p.name}
                        </p>
                        <span className='text-muted-foreground text-3xs shrink-0 font-medium tracking-wider uppercase'>
                          {p.status ?? 'draft'}
                        </span>
                      </div>
                      {p.description && (
                        <p className='text-muted-foreground line-clamp-2 text-xs'>
                          {p.description}
                        </p>
                      )}
                      <div className='text-muted-foreground text-3xs flex flex-wrap gap-2'>
                        {p.sku && <span>SKU {p.sku}</span>}
                        {p.colors?.length ? (
                          <span>{p.colors.length} màu</span>
                        ) : null}
                        {p.sizes?.length ? (
                          <span>{p.sizes.length} cỡ</span>
                        ) : null}
                        {p.features?.length ? (
                          <span>{p.features.length} tiện ích</span>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className='flex items-center justify-end gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Huỷ
          </Button>
          <Button
            type='button'
            variant='primary'
            disabled={!selectedId || loading}
            onClick={handleApply}
          >
            {loading ? (
              <>
                <Loader2 className='size-3.5 animate-spin' />
                Đang áp dụng…
              </>
            ) : (
              'Áp dụng'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
