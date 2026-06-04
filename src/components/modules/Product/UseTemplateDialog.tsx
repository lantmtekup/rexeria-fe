'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';
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

export interface UseTemplateDialogProps {
  open: boolean;
  template: Product | null;
  onOpenChange: (open: boolean) => void;
  /** Triggered after successful clone (default: redirect to new product). */
  onCloned?: (newProductId: string) => void;
}

/**
 * "Sử dụng template" modal. Calls `POST /products/{id}/clone` to atomically
 * copy attributes + media bindings into a new product, then redirects to its
 * information page so the user can edit only what's different.
 */
export function UseTemplateDialog({
  open,
  template,
  onOpenChange,
  onCloned,
}: UseTemplateDialogProps) {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  // Default name when template changes.
  React.useEffect(() => {
    if (open && template) {
      setName(`${template.name} - Bản của tôi`);
    }
    if (!open) setBusy(false);
  }, [open, template]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;
    if (!name.trim()) return;
    setBusy(true);
    try {
      const res = await rexerApi.products.clone(template.id, {
        name: name.trim(),
        as_template: false,
      });
      const newId = res.product.id;
      toast.success(`Đã tạo "${res.product.name}" từ template`);
      onOpenChange(false);
      if (onCloned) onCloned(newId);
      else router.push(`/product/${newId}/information`);
    } catch (err) {
      const msg =
        err instanceof RxApiError
          ? err.message || err.code
          : err instanceof Error
            ? err.message
            : 'Lỗi';
      toast.error(`Tạo từ template thất bại: ${msg}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md p-6'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-base'>
            <Sparkles className='size-4 text-violet-500' />
            Sử dụng template
          </DialogTitle>
          {template && (
            <p className='text-xs text-neutral-500'>
              Tạo sản phẩm mới từ template{' '}
              <strong className='text-neutral-700'>{template.name}</strong>. Bạn
              có thể chỉnh sửa sau khi tạo.
            </p>
          )}
        </DialogHeader>

        <form onSubmit={submit} className='flex flex-col gap-3'>
          <label className='flex flex-col gap-1'>
            <span className='text-3xs font-semibold tracking-widest text-neutral-500 uppercase'>
              Tên sản phẩm mới
            </span>
            <input
              type='text'
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Tên sản phẩm…'
              required
              className='border-border rounded-md border bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900'
            />
          </label>

          {template?.template_category && (
            <p className='text-2xs text-neutral-500'>
              Danh mục:{' '}
              <span className='font-medium text-neutral-700'>
                {template.template_category}
              </span>
            </p>
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
                  <Loader2 className='size-3.5 animate-spin' /> Đang tạo…
                </>
              ) : (
                'Tạo sản phẩm'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
