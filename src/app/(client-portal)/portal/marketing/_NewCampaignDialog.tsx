'use client';

/**
 * Popup tạo campaign — thông tin tối thiểu (Tên + CHỌN NHIỀU sản phẩm) → tạo
 * NHÁP (status 'draft') → vào editor `/[id]` (edit mode), các bước sau autosave.
 *
 * BE campaign chỉ có 1 `product_id` (bắt buộc) → product đầu làm product_id
 * chính, toàn bộ list lưu vào `notes.product_ids` để giữ lựa chọn nhiều SP.
 */

import { Check, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const [creating, setCreating] = useState(false);

  // Nạp sản phẩm mỗi khi mở.
  useEffect(() => {
    if (!open) return;
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

  const toggle = (id: string) =>
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{t('marketingEditor.createTitle')}</DialogTitle>
          <DialogDescription>{t('marketingNew.subtitle')}</DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-4'>
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
              autoFocus
            />
          </div>

          <div className='flex flex-col gap-1.5'>
            <Label>
              {t('marketingNew.productLabel')}
              <span className='text-content-muted ml-1 font-normal'>
                {t('marketingNew.productOptional')}
                {selected.length > 0 && ` · ${selected.length}`}
              </span>
            </Label>
            {products === null ? (
              <div className='text-content-muted flex items-center gap-2 text-sm'>
                <Loader2 className='size-4 animate-spin' />{' '}
                {t('marketingNew.loadingProducts')}
              </div>
            ) : products.length === 0 ? (
              <p className='text-content-muted text-sm'>
                {t('marketingNew.noProducts')}
              </p>
            ) : (
              <div className='border-border max-h-60 overflow-y-auto rounded-lg border'>
                {products.map(p => {
                  const on = selected.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type='button'
                      onClick={() => toggle(p.id)}
                      className={cn(
                        'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
                        on ? 'bg-primary/5' : 'hover:bg-muted'
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-4 shrink-0 items-center justify-center rounded border',
                          on
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-input'
                        )}
                      >
                        {on && <Check className='size-3' />}
                      </span>
                      <span className='text-foreground truncate'>{p.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
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
