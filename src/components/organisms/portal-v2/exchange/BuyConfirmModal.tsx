'use client';

import { Check, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { formatPrice } from '@/lib/portal-v2/exchange/helpers';
import type { ExchangeListingView } from '@/lib/portal-v2/exchange/types';

type BuyConfirmModalProps = {
  listing: ExchangeListingView | null;
  onClose: () => void;
  onConfirm: (listing: ExchangeListingView) => void;
};

export const BuyConfirmModal = ({
  listing,
  onClose,
  onConfirm,
}: BuyConfirmModalProps) => {
  const t = useTranslations('portalV2.exchange');

  if (!listing) return null;

  const { meta } = listing;

  const footer = (
    <>
      <Button variant='ghost' onClick={onClose}>
        {t('cancel')}
      </Button>
      <span className='flex-1' />
      <Button variant='primary' onClick={() => onConfirm(listing)}>
        <Check className='size-3.5' strokeWidth={2.6} aria-hidden />
        {t('confirmBuy', { price: formatPrice(meta.price) })}
      </Button>
    </>
  );

  return (
    <Modal
      open
      onClose={onClose}
      title={t('buyTitle', { name: listing.name })}
      subtitle={t('buySub', { price: formatPrice(meta.price) })}
      footer={footer}
    >
      <div className='space-y-4'>
        <div className='flex items-center gap-3 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] p-3'>
          <div
            className='grid size-10 shrink-0 place-items-center overflow-hidden rounded-[var(--pv2-r-sm)]'
            style={{ background: meta.grad }}
          >
            <Package
              className='size-5 text-white/80'
              strokeWidth={2}
              aria-hidden
            />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-[14px] font-bold text-[var(--pv2-ink)]'>
              {listing.name}
            </p>
            <p className='text-[12px] text-[var(--pv2-faint)]'>
              {t('byAuthor', { author: listing.author })}
            </p>
          </div>
          <span className='text-[15px] font-bold text-[var(--pv2-ink)]'>
            {formatPrice(meta.price)}
          </span>
        </div>

        <ul className='list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed text-[var(--pv2-mut)]'>
          <li>{t('buyBullet1')}</li>
          <li>{t('buyBullet2')}</li>
          <li>{t('buyBullet3')}</li>
        </ul>

        <p className='text-[12px] leading-relaxed text-[var(--pv2-faint)]'>
          {t('buyNote')}
        </p>
      </div>
    </Modal>
  );
};
