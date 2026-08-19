'use client';

import { Check, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { cn } from '@/lib/cn';
import { listLibraryImages } from '@/services/portal-v2/productMediaUpload';

type LibraryImage = {
  id: string;
  name: string;
  url?: string;
  kind: 'image' | 'video';
};

/**
 * Chọn ảnh CÓ SẴN trong thư viện để gắn vào sản phẩm.
 *
 * Đường thứ hai bên cạnh tải file lên. Ảnh thường đã nằm trong Media rồi —
 * bắt tải lại vừa sinh bản trùng trong thư viện vừa tốn dung lượng.
 *
 * Ảnh đã gắn vào sản phẩm này bị loại khỏi danh sách: gắn hai lần cho ra hai
 * binding trỏ cùng một asset, và lưới ảnh hiện đúp.
 */
export const MediaPickerModal = ({
  attachedIds,
  onClose,
  onConfirm,
  busy = false,
}: {
  attachedIds: string[];
  onClose: () => void;
  onConfirm: (mediaIds: string[]) => void;
  busy?: boolean;
}) => {
  const t = useTranslations('portalV2.products');
  const [items, setItems] = useState<LibraryImage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    void listLibraryImages()
      .then(list => {
        if (cancelled) return;
        const taken = new Set(attachedIds);
        setItems(list.filter(x => !taken.has(x.id)));
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load media');
      });
    return () => {
      cancelled = true;
    };
  }, [attachedIds]);

  const toggle = (id: string) =>
    setPicked(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={t('pickFromLibrary')}
      subtitle={t('pickFromLibraryHint')}
      footer={
        <>
          <Button variant='ghost' size='sm' onClick={onClose}>
            {t('cancel')}
          </Button>
          <span className='flex-1' />
          <Button
            size='sm'
            disabled={!picked.length || busy}
            onClick={() => onConfirm(picked)}
          >
            {busy ? (
              <Loader2 className='size-3.5 animate-spin' aria-hidden />
            ) : null}
            {t('attachSelected', { count: picked.length })}
          </Button>
        </>
      }
    >
      {error ? (
        <p className='py-8 text-center text-[13px] text-[var(--pv2-error)]'>
          {error}
        </p>
      ) : !items ? (
        <p className='py-8 text-center text-[13px] text-[var(--pv2-mut)]'>
          {t('loading')}
        </p>
      ) : !items.length ? (
        <p className='py-8 text-center text-[13px] text-[var(--pv2-mut)]'>
          {t('libraryEmpty')}
        </p>
      ) : (
        <div className='grid max-h-[52vh] grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-2.5 overflow-y-auto'>
          {items.map(m => {
            const on = picked.includes(m.id);
            return (
              <button
                key={m.id}
                type='button'
                aria-pressed={on}
                title={m.name}
                onClick={() => toggle(m.id)}
                className={cn(
                  'relative aspect-square overflow-hidden rounded-[var(--pv2-r-sm)] border',
                  on
                    ? 'border-[var(--pv2-electric)] ring-2 ring-[var(--pv2-electric)]'
                    : 'border-[var(--pv2-hair)] hover:border-[var(--pv2-slate-300)]'
                )}
              >
                {m.url && m.kind === 'video' ? (
                  <video
                    src={m.url}
                    muted
                    playsInline
                    preload='metadata'
                    className='size-full object-cover'
                  />
                ) : m.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.url}
                    alt={m.name}
                    className='size-full object-cover'
                  />
                ) : (
                  <span className='grid size-full place-items-center bg-[var(--pv2-canvas)] px-1 text-[9.5px] text-[var(--pv2-faint)]'>
                    {m.name.slice(0, 24)}
                  </span>
                )}
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
