'use client';

import { Check, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { cn } from '@/lib/cn';
import type { ProductAsset } from '@/lib/portal-v2/product/types';

/**
 * Chọn ảnh ĐẠI DIỆN cho sản phẩm — chỉ trong media của chính nó.
 *
 * Tách khỏi chế độ sửa cả sản phẩm: bấm "Edit to change it" mà mở nguyên form
 * kèm nút Xoá là sai việc người dùng đang làm. Ở đây chỉ đổi đúng một trường,
 * nên ghi thẳng `cover_media_id` bằng một PATCH.
 *
 * Không có ảnh nào thì nói thẳng phải thêm media trước, chứ không hiện một
 * bảng rỗng để người dùng đứng nhìn.
 */
export const CoverPickerModal = ({
  media,
  current,
  onClose,
  onConfirm,
  busy = false,
}: {
  media: ProductAsset[];
  current: string | null;
  onClose: () => void;
  onConfirm: (mediaId: string) => void;
  busy?: boolean;
}) => {
  const t = useTranslations('portalV2.products');
  const images = media.filter(m => m.kind === 'IMG');
  const [picked, setPicked] = useState<string | null>(current);

  return (
    <Modal
      open
      onClose={onClose}
      title={t('pickCover')}
      subtitle={t('pickCoverHint')}
      footer={
        <>
          <Button variant='ghost' size='sm' onClick={onClose}>
            {t('cancel')}
          </Button>
          <span className='flex-1' />
          <Button
            size='sm'
            disabled={!picked || busy || picked === current}
            onClick={() => picked && onConfirm(picked)}
          >
            {busy ? (
              <Loader2 className='size-3.5 animate-spin' aria-hidden />
            ) : null}
            {t('setAsCover')}
          </Button>
        </>
      }
    >
      {!images.length ? (
        <p className='py-8 text-center text-[13px] text-[var(--pv2-mut)]'>
          {t('coverNeedsMedia')}
        </p>
      ) : (
        <div className='grid max-h-[46vh] grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-2.5 overflow-y-auto'>
          {images.map(m => {
            const on = picked === m.id;
            return (
              <button
                key={m.id}
                type='button'
                aria-pressed={on}
                title={m.name}
                onClick={() => setPicked(m.id)}
                className={cn(
                  'relative aspect-square overflow-hidden rounded-[var(--pv2-r-sm)] border',
                  on
                    ? 'border-[var(--pv2-electric)] ring-2 ring-[var(--pv2-electric)]'
                    : 'border-[var(--pv2-hair)] hover:border-[var(--pv2-slate-300)]'
                )}
                style={on ? undefined : { background: m.grad }}
              >
                {m.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.url}
                    alt={m.name}
                    className='size-full object-cover'
                  />
                ) : null}
                {on ? (
                  <span className='absolute top-1 right-1 grid size-[18px] place-items-center rounded-full bg-[var(--pv2-electric)] text-[var(--pv2-paper)]'>
                    <Check className='size-3' strokeWidth={3.4} aria-hidden />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
};
