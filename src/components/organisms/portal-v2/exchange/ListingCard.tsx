'use client';

import { Check, Lock, Package, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { KeyboardEvent, MouseEvent } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { ListingCover } from '@/components/organisms/portal-v2/exchange/ListingCover';
import { ListingEvidence } from '@/components/organisms/portal-v2/exchange/ListingEvidence';
import { ListingMeta } from '@/components/organisms/portal-v2/exchange/ListingMeta';
import {
  formatPrice,
  resolveActionState,
} from '@/lib/portal-v2/exchange/helpers';
import type {
  ExchangeListingView,
  ExchangeSessionState,
} from '@/lib/portal-v2/exchange/types';
import { cn } from '@/lib/cn';

type ListingCardProps = {
  listing: ExchangeListingView;
  session: ExchangeSessionState;
  onOpen: (listing: ExchangeListingView) => void;
  onAction: (listing: ExchangeListingView) => void;
  onPreview: (listing: ExchangeListingView) => void;
  /** Món đã có trong thư viện — mở thẳng nó ở màn Experiences. */
  onOpenInLibrary: (listing: ExchangeListingView) => void;
};

const cardShell = cn(
  'group flex cursor-pointer flex-col overflow-hidden rounded-[var(--pv2-r)]',
  'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]',
  'transition-[box-shadow,border-color] duration-[140ms]',
  'hover:border-[color-mix(in_srgb,var(--pv2-violet)_35%,var(--pv2-hair))] hover:shadow-[var(--pv2-sh-soft)]',
  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2 focus-visible:outline-none'
);

export const ListingCard = ({
  listing,
  session,
  onOpen,
  onAction,
  onPreview,
  onOpenInLibrary,
}: ListingCardProps) => {
  const t = useTranslations('portalV2.exchange');
  const action = resolveActionState(listing, session);
  const { meta } = listing;

  const handleCardClick = (e: MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest('[data-exchange-preview]')) return;
    onOpen(listing);
  };

  const handleCardKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(listing);
    }
  };

  const handleActionClick = (e: MouseEvent) => {
    e.stopPropagation();
    onAction(listing);
  };

  return (
    <article
      role='button'
      tabIndex={0}
      aria-label={t('openListing', { name: listing.name })}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      className={cardShell}
    >
      <ListingCover
        listing={listing}
        showPreview
        onPreview={() => onPreview(listing)}
      />

      <div className='flex flex-1 flex-col gap-2 px-3.5 pt-3 pb-3.5'>
        <div className='flex min-w-0 flex-col gap-0.5'>
          <h3 className='truncate text-left text-[14px] font-semibold tracking-[-0.01em] text-[var(--pv2-ink)]'>
            {listing.name}
          </h3>
          <p className='truncate text-[11.5px] text-[var(--pv2-faint)]'>
            {t('byAuthor', { author: listing.author })}
          </p>
        </div>

        <ListingMeta meta={meta} />
        <ListingEvidence listing={listing} />
      </div>

      <div className='flex items-center gap-2.5 border-t border-[var(--pv2-hair)] px-3.5 py-2.5'>
        <span
          className={cn(
            'text-[13px] font-bold',
            meta.price > 0 ? 'text-[var(--pv2-ink)]' : 'text-[#0e9d6e]'
          )}
        >
          {formatPrice(meta.price)}
        </span>
        <span className='flex-1' />
        {/*
          Đã có rồi thì đừng dừng ở một nhãn chết. Người dùng đọc "đã có" xong
          câu hỏi kế tiếp luôn là "vậy nó nằm đâu" — trả lời ngay tại đây bằng
          một cú bấm, thay vì để họ tự đi mò trong thư viện.
        */}
        {action === 'added' ? (
          <Button
            variant='ghost'
            size='sm'
            className='whitespace-nowrap text-[#0e9d6e]'
            title={t('inLibrary')}
            onClick={e => {
              e.stopPropagation();
              onOpenInLibrary(listing);
            }}
          >
            <Check className='size-3.5' strokeWidth={2.6} aria-hidden />
            {t('openInLibrary')}
          </Button>
        ) : null}
        {action === 'owned' ? (
          <Button
            variant='primary'
            size='sm'
            className='whitespace-nowrap'
            onClick={handleActionClick}
          >
            <Plus className='size-3.5' strokeWidth={2.4} aria-hidden />
            {t('addShort')}
          </Button>
        ) : null}
        {action === 'buy' ? (
          <Button
            variant='primary'
            size='sm'
            className='whitespace-nowrap'
            onClick={handleActionClick}
          >
            <Package className='size-3.5' strokeWidth={2.2} aria-hidden />
            {t('buyShort', { price: formatPrice(meta.price) })}
          </Button>
        ) : null}
        {action === 'locked' ? (
          <Button
            variant='ghost'
            size='sm'
            className='whitespace-nowrap text-[#b45309]'
            onClick={handleActionClick}
          >
            <Lock className='size-3.5' strokeWidth={2.2} aria-hidden />
            {t('premium')}
          </Button>
        ) : null}
      </div>
    </article>
  );
};
