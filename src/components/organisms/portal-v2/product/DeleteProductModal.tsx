'use client';

import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import {
  ProductThumb,
  TonePill,
  WarnBox,
} from '@/components/molecules/portal-v2/product-form';
import { productCoverUrl, productStock } from '@/lib/portal-v2/product/helpers';
import type { Product, ProductAsset } from '@/lib/portal-v2/product/types';

type DeleteProductModalProps = {
  items: Product[];
  /** Only so each row can show its cover — deletion never touches the library. */
  assets?: ProductAsset[];
  onClose: () => void;
  onConfirm: () => void;
};

export const DeleteProductModal = ({
  items,
  assets = [],
  onClose,
  onConfirm,
}: DeleteProductModalProps) => {
  const t = useTranslations('portalV2.products');

  const live = items.filter(p => p.channels.length).length;
  const single = items.length === 1;

  return (
    <Modal
      open
      onClose={onClose}
      title={
        single
          ? t('deleteOneTitle', { name: items[0]?.title ?? '' })
          : t('deleteManyTitle', { count: items.length })
      }
      subtitle={t('deleteSub')}
      footer={
        <>
          <Button variant='ghost' onClick={onClose}>
            {t('cancel')}
          </Button>
          <span className='flex-1' />
          <Button
            variant='ghost'
            onClick={() => {
              toast.message(t('toastArchivedInstead'));
              onClose();
            }}
          >
            {t('archiveInstead')}
          </Button>
          <Button
            variant='primary'
            className='bg-[var(--pv2-error)] shadow-none hover:bg-[color-mix(in_srgb,var(--pv2-error)_80%,#000)]'
            onClick={onConfirm}
          >
            <Trash2 className='size-3.5' strokeWidth={2} aria-hidden />
            {single
              ? t('deleteProduct')
              : t('deleteNProducts', { count: items.length })}
          </Button>
        </>
      }
    >
      {live ? (
        <WarnBox title={t('deleteLiveWarnTitle', { count: live })}>
          {t('deleteLiveWarnBody', { count: live })}
        </WarnBox>
      ) : null}

      <div className='flex flex-col gap-2'>
        {items.map(p => (
          <div
            key={p.id}
            className='flex items-center gap-3 rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] px-3 py-2.5'
          >
            <ProductThumb
              letter={p.title[0] ?? '?'}
              src={productCoverUrl(p, assets)}
              size={30}
            />
            <span className='min-w-0 flex-1'>
              <span className='block truncate text-[12.5px] font-semibold text-[var(--pv2-ink)]'>
                {p.title}
              </span>
              <span className='block truncate text-[11px] text-[var(--pv2-faint)]'>
                /{p.handle} · {t('variantCount', { count: p.variants.length })}{' '}
                · {t('inStock', { count: productStock(p) })}
              </span>
            </span>
            {p.channels.length ? (
              <TonePill
                bg='color-mix(in srgb, var(--pv2-error) 10%, transparent)'
                fg='var(--pv2-error)'
              >
                {t('channelCount', { count: p.channels.length })}
              </TonePill>
            ) : null}
          </div>
        ))}
      </div>
    </Modal>
  );
};
