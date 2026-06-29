'use client';

/**
 * Popup tạo campaign — thông tin tối thiểu (Tên + CHỌN NHIỀU sản phẩm) → tạo
 * NHÁP (status 'draft') → vào editor `/[id]` (edit mode), các bước sau autosave.
 *
 * BE campaign chỉ có 1 `product_id` (bắt buộc) → product ĐẦU TIÊN trong
 * `selected` làm product_id chính (hiển thị badge "Chính"), toàn bộ list lưu
 * vào `notes.product_ids` để giữ lựa chọn nhiều SP.
 */

import { Check, Loader2, Megaphone, Package, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { Input } from '@/components/atoms/input';
import { Label } from '@/components/atoms/label';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { Product } from '@/services/rexer/types';
import { cn } from '@/lib/cn';

export function NewCampaignDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations('portal');
  const router = useRouter();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);

  // Nạp sản phẩm mỗi khi mở.
  useEffect(() => {
    if (!open) return;
    setName('');
    setQuery('');
    setProducts(null);
    rexerApi.products
      .list({ limit: 100 })
      .then(r => {
        const items = r.items ?? [];
        setProducts(items);
        setSelected(items[0] ? [items[0].id] : []);
      })
      .catch(() => setProducts([]));
  }, [open]);

  // Toggle giữ THỨ TỰ chọn — phần tử đầu = sản phẩm chính (BE product_id).
  const toggle = (id: string) =>
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        (p.sku?.toLowerCase().includes(q) ?? false)
    );
  }, [products, query]);

  const primaryId = selected[0];
  const allFilteredSelected =
    filtered.length > 0 && filtered.every(p => selected.includes(p.id));

  const toggleAll = () =>
    setSelected(prev => {
      if (allFilteredSelected) {
        const drop = new Set(filtered.map(p => p.id));
        return prev.filter(id => !drop.has(id));
      }
      const add = filtered.map(p => p.id).filter(id => !prev.includes(id));
      return [...prev, ...add];
    });

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error(t('marketingNew.needName'));
      return;
    }
    // Sản phẩm là tuỳ chọn với user: không chọn → mặc định sản phẩm đầu
    // (BE campaign vẫn BẮT BUỘC 1 product_id). Không có SP nào → chặn.
    const ids = selected.length
      ? selected
      : products?.[0]
        ? [products[0].id]
        : [];
    if (ids.length === 0) {
      toast.error(t('marketingNew.noProducts'));
      return;
    }
    setCreating(true);
    try {
      const primary = products?.find(p => p.id === ids[0]);
      const created = await rexerApi.campaigns.create({
        name: trimmed,
        product_id: ids[0],
        brand_id: primary?.brand_id,
        objective: 'conversion',
        status: 'draft',
        // Nhiều SP: giữ list trong notes (BE campaign chỉ 1 product_id).
        ...(ids.length > 1
          ? { notes: JSON.stringify({ product_ids: ids }) }
          : {}),
      });
      router.push(`/portal/marketing/${created.id}`);
    } catch (err) {
      toast.error(
        err instanceof RxApiError
          ? err.code || err.message
          : err instanceof Error
            ? err.message
            : t('marketingEditor.saveFailed')
      );
      setCreating(false);
    }
  };

  const hasProducts = (products?.length ?? 0) > 0;
  const showSearch = (products?.length ?? 0) > 6;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='gap-0 overflow-hidden p-0 sm:max-w-lg'>
        <DialogHeader className='flex-row items-start gap-3 space-y-0 px-6 pt-6 pr-10 pb-5'>
          <span className='bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl'>
            <Megaphone className='size-[18px]' />
          </span>
          <div className='flex min-w-0 flex-col gap-1'>
            <DialogTitle className='text-lg leading-tight font-semibold'>
              {t('marketingEditor.createTitle')}
            </DialogTitle>
            <DialogDescription className='text-content-muted text-sm leading-snug'>
              {t('marketingNew.subtitle')}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className='flex min-w-0 flex-col gap-5 px-6 pb-2'>
          {/* Tên chiến dịch */}
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='nc-name'>
              {t('marketingNew.nameLabel')}{' '}
              <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='nc-name'
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('marketingNew.namePlaceholder')}
              maxLength={128}
              autoFocus
            />
          </div>

          {/* Sản phẩm */}
          <div className='flex flex-col gap-2'>
            <div className='flex items-center justify-between gap-2'>
              <Label className='gap-1'>
                {t('marketingNew.productLabel')}
                <span className='text-content-muted font-normal'>
                  {t('marketingNew.productOptional')}
                </span>
              </Label>
              {hasProducts && (
                <div className='flex items-center gap-2'>
                  {selected.length > 0 && (
                    <span className='bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums'>
                      {selected.length} {t('marketingNew.selectedSuffix')}
                    </span>
                  )}
                  <button
                    type='button'
                    onClick={toggleAll}
                    className='text-content-muted hover:text-foreground text-xs font-medium transition-colors'
                  >
                    {allFilteredSelected
                      ? t('marketingNew.clearAll')
                      : t('marketingNew.selectAll')}
                  </button>
                </div>
              )}
            </div>

            {showSearch && (
              <div className='relative'>
                <Search className='text-content-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
                <Input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={t('marketingNew.searchPlaceholder')}
                  className='h-9 pl-9'
                />
              </div>
            )}

            {products === null ? (
              <div className='border-border flex flex-col rounded-lg border'>
                {[0, 1, 2].map(i => (
                  <div key={i} className='flex items-center gap-3 px-3 py-2.5'>
                    <div className='bg-muted size-9 shrink-0 animate-pulse rounded-md' />
                    <div className='flex flex-1 flex-col gap-1.5'>
                      <div className='bg-muted h-3 w-2/3 animate-pulse rounded' />
                      <div className='bg-muted h-2.5 w-1/3 animate-pulse rounded' />
                    </div>
                  </div>
                ))}
              </div>
            ) : !hasProducts ? (
              <p className='border-border text-content-muted rounded-lg border border-dashed px-3 py-6 text-center text-sm'>
                {t('marketingNew.noProducts')}
              </p>
            ) : filtered.length === 0 ? (
              <p className='border-border text-content-muted rounded-lg border px-3 py-6 text-center text-sm'>
                {t('marketingNew.noMatch')}
              </p>
            ) : (
              <div className='border-border divide-border max-h-64 divide-y overflow-y-auto rounded-lg border'>
                {filtered.map(p => {
                  const on = selected.includes(p.id);
                  const isPrimary = p.id === primaryId;
                  return (
                    <button
                      key={p.id}
                      type='button'
                      onClick={() => toggle(p.id)}
                      aria-pressed={on}
                      className={cn(
                        'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
                        on ? 'bg-primary/5' : 'hover:bg-muted/60'
                      )}
                    >
                      {p.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.thumbnail_url}
                          alt=''
                          className='border-border size-9 shrink-0 rounded-md border object-cover'
                        />
                      ) : (
                        <span className='bg-muted text-content-muted flex size-9 shrink-0 items-center justify-center rounded-md'>
                          <Package className='size-4' />
                        </span>
                      )}

                      <span className='flex min-w-0 flex-1 flex-col'>
                        <span className='flex min-w-0 items-center gap-1.5'>
                          <span className='text-foreground truncate text-sm font-medium'>
                            {p.name}
                          </span>
                          {isPrimary && (
                            <span className='bg-primary/10 text-primary shrink-0 rounded px-1.5 py-px text-[10px] font-semibold tracking-wide uppercase'>
                              {t('marketingNew.primaryBadge')}
                            </span>
                          )}
                        </span>
                        {p.sku && (
                          <span className='text-content-muted truncate text-xs'>
                            {p.sku}
                          </span>
                        )}
                      </span>

                      <span
                        className={cn(
                          'flex size-[18px] shrink-0 items-center justify-center rounded-md border transition-colors',
                          on
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-input'
                        )}
                      >
                        {on && <Check className='size-3' strokeWidth={3} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {selected.length > 1 && (
              <p className='text-content-muted text-xs'>
                {t('marketingNew.primaryHint')}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className='bg-muted/40 border-border mt-5 border-t px-6 py-4'>
          <Button
            variant='neutral'
            onClick={() => onOpenChange(false)}
            disabled={creating}
          >
            {t('marketingEditor.cancel')}
          </Button>
          <Button onClick={handleCreate} disabled={creating || !name.trim()}>
            {creating && <Loader2 className='size-4 animate-spin' />}
            {t('marketingNew.createDraft')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
