'use client';

import * as React from 'react';
import { BookmarkPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type { Product } from '@/services/rexer/types';

export interface SaveAsTemplateDialogProps {
  open: boolean;
  product: Product | null;
  /** When user is admin, they can flag the new template as `is_public_template`. */
  canPublish?: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (newTemplateId: string) => void;
}

/**
 * Curated category options. Free-form on the BE — these are just suggestions
 * to keep templates findable. Add more as the library grows.
 */
const CATEGORY_OPTIONS = [
  { value: 'fmcg', label: 'FMCG' },
  { value: 'fashion', label: 'Thời trang' },
  { value: 'f&b', label: 'F&B' },
  { value: 'cosmetics', label: 'Mỹ phẩm' },
  { value: 'electronics', label: 'Điện tử' },
  { value: 'home', label: 'Gia dụng' },
  { value: 'other', label: 'Khác' },
];

/**
 * "Lưu thành template" modal. Calls `POST /products/{id}/clone` with
 * `as_template=true` so the user can reuse the current product as a starting
 * point next time.
 */
export function SaveAsTemplateDialog({
  open,
  product,
  canPublish = false,
  onOpenChange,
  onSaved,
}: SaveAsTemplateDialogProps) {
  const [name, setName] = React.useState('');
  const [category, setCategory] = React.useState<string>('other');
  const [tags, setTags] = React.useState('');
  const [makePublic, setMakePublic] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (open && product) {
      setName(`${product.name} - Template`);
      setCategory(product.template_category ?? 'other');
      setTags((product.template_tags ?? []).join(', '));
      setMakePublic(false);
    }
    if (!open) setBusy(false);
  }, [open, product]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!name.trim()) return;
    setBusy(true);
    try {
      const tagList = tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
        .slice(0, 10);
      // BE clone endpoint accepts `is_public_template` directly — no
      // 2-step PATCH needed. Admin-gated server-side: returns 403 if
      // non-admin sets it true.
      const res = await rexerApi.products.clone(product.id, {
        name: name.trim(),
        as_template: true,
        template_category: category || undefined,
        template_tags: tagList.length > 0 ? tagList : undefined,
        ...(makePublic && canPublish ? { is_public_template: true } : {}),
      });
      toast.success('Đã lưu template — tìm trong tab Templates');
      onOpenChange(false);
      onSaved?.(res.product.id);
    } catch (err) {
      const msg =
        err instanceof RxApiError
          ? err.message || err.code
          : err instanceof Error
            ? err.message
            : 'Lỗi';
      toast.error(`Lưu template thất bại: ${msg}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md p-6'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-base'>
            <BookmarkPlus className='size-4 text-amber-500' />
            Lưu thành template
          </DialogTitle>
          <p className='text-xs text-neutral-500'>
            Sao lưu sản phẩm hiện tại thành template để dùng lại sau. Bao gồm
            attribute + media bindings.
          </p>
        </DialogHeader>

        <form onSubmit={submit} className='flex flex-col gap-3'>
          <label className='flex flex-col gap-1'>
            <span className='text-[10px] font-semibold tracking-widest text-neutral-500 uppercase'>
              Tên template
            </span>
            <input
              type='text'
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className='border-border rounded-md border bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900'
            />
          </label>

          <label className='flex flex-col gap-1'>
            <span className='text-[10px] font-semibold tracking-widest text-neutral-500 uppercase'>
              Danh mục
            </span>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className='border-border rounded-md border bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900'
            >
              {CATEGORY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className='flex flex-col gap-1'>
            <span className='text-[10px] font-semibold tracking-widest text-neutral-500 uppercase'>
              Tags{' '}
              <span className='text-neutral-400 normal-case'>
                (ngăn cách dấu phẩy)
              </span>
            </span>
            <input
              type='text'
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder='vd: hữu cơ, premium, mùa hè'
              className='border-border rounded-md border bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900'
            />
          </label>

          {canPublish && (
            <label className='flex items-center gap-2 rounded-md bg-violet-50/60 px-3 py-2 text-xs text-violet-900 ring-1 ring-violet-200'>
              <input
                type='checkbox'
                checked={makePublic}
                onChange={e => setMakePublic(e.target.checked)}
                className='size-3.5 cursor-pointer'
              />
              Công khai trong thư viện (mọi user dùng được)
            </label>
          )}

          <div className='flex items-center justify-end gap-2 pt-1'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Huỷ
            </Button>
            <Button
              type='submit'
              variant='primary'
              size='sm'
              disabled={busy || !name.trim()}
            >
              {busy ? (
                <>
                  <Loader2 className='size-3.5 animate-spin' /> Đang lưu…
                </>
              ) : (
                'Lưu template'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
