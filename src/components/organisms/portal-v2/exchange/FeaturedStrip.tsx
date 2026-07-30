'use client';

import { useTranslations } from 'next-intl';

import { ListingCover } from '@/components/organisms/portal-v2/exchange/ListingCover';
import { ListingEvidence } from '@/components/organisms/portal-v2/exchange/ListingEvidence';
import type { ExchangeListingView } from '@/lib/portal-v2/exchange/types';
import { cn } from '@/lib/cn';

type FeaturedStripProps = {
  items: ExchangeListingView[];
  onOpen: (listing: ExchangeListingView) => void;
  onPreview?: (listing: ExchangeListingView) => void;
};

const featuredCard = cn(
  'group flex cursor-pointer flex-col overflow-hidden rounded-[var(--pv2-r)] text-left',
  'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]',
  'transition-[box-shadow,border-color] duration-[140ms]',
  'hover:border-[var(--pv2-violet)] hover:shadow-[var(--pv2-sh-soft)]',
  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2 focus-visible:outline-none'
);

export const FeaturedStrip = ({
  items,
  onOpen,
  onPreview,
}: FeaturedStripProps) => {
  const t = useTranslations('portalV2.exchange');

  if (!items.length) return null;

  return (
    <section className='mb-[22px]' aria-label={t('featuredAria')}>
      <div className='grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-3.5'>
        {items.map(listing => (
          <article
            key={listing.id}
            role='button'
            tabIndex={0}
            aria-label={t('openListing', { name: listing.name })}
            onClick={e => {
              if (
                (e.target as HTMLElement).closest('[data-exchange-preview]')
              ) {
                return;
              }
              onOpen(listing);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpen(listing);
              }
            }}
            className={featuredCard}
          >
            <ListingCover
              listing={listing}
              showPreview={Boolean(onPreview)}
              onPreview={onPreview ? () => onPreview(listing) : undefined}
            />

            <div className='flex flex-col gap-1.5 px-3.5 pt-3 pb-3.5'>
              <span className='truncate text-[14px] font-semibold tracking-[-0.01em] text-[var(--pv2-ink)]'>
                {listing.name}
              </span>
              <span className='truncate text-[11.5px] text-[var(--pv2-faint)]'>
                {t('byAuthor', { author: listing.author })}
              </span>
              <ListingEvidence listing={listing} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
