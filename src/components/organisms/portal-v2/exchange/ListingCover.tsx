'use client';

import { Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { ExchangeListingView } from '@/lib/portal-v2/exchange/types';
import { cn } from '@/lib/cn';

type ListingCoverProps = {
  listing: ExchangeListingView;
  /** Fixed height override (modal). Cards use aspect-[16/10] by default. */
  height?: number;
  showPreview?: boolean;
  onPreview?: () => void;
  className?: string;
};

/** Branded abstract cover used when the catalog item has no thumbnail. */
const GeneratedThumb = ({ listing }: { listing: ExchangeListingView }) => {
  const isPage = listing.meta.kind === 'page';

  return (
    <div
      className='absolute inset-0 overflow-hidden bg-(--pv2-electric-soft)'
      aria-hidden
    >
      <div className='absolute inset-x-[13%] top-[13%] bottom-[17%] overflow-hidden rounded-[10px] border border-white/70 bg-(--pv2-paper) shadow-[0_12px_30px_rgba(56,98,255,0.14)]'>
        <div className='flex h-5 items-center border-b border-(--pv2-hair) bg-(--pv2-canvas) px-2.5'>
          <span className='h-1 w-8 rounded-full bg-(--pv2-slate-300)' />
        </div>

        {isPage ? (
          <div className='grid h-[calc(100%-1.25rem)] grid-cols-[1.15fr_0.85fr] gap-2.5 p-3'>
            <div className='flex min-w-0 flex-col justify-center'>
              <span className='h-1.5 w-8 rounded-full bg-(--pv2-electric)/35' />
              <span className='mt-1 h-2.5 w-4/5 rounded-sm bg-(--pv2-ink)/25' />
              <span className='mt-1 h-1.5 w-3/5 rounded-full bg-(--pv2-hair)' />
              <span className='mt-2.5 h-4 w-14 rounded-[5px] bg-(--pv2-electric)' />
            </div>
            <div className='relative overflow-hidden rounded-[7px] bg-(--pv2-electric-soft)'></div>
          </div>
        ) : (
          <div className='flex h-[calc(100%-1.25rem)] items-center p-3'>
            <div className='grid w-full grid-cols-[0.82fr_1.18fr] gap-2.5 rounded-md bg-(--pv2-electric-soft) p-2.5'>
              <div className='aspect-square rounded-[6px] bg-(--pv2-electric)/25' />
              <div className='flex min-w-0 flex-col justify-center py-1'>
                <span className='h-2 w-5/6 rounded-sm bg-(--pv2-ink)/25' />
                <span className='mt-2 h-1.5 w-full rounded-full bg-(--pv2-slate-300)' />
                <span className='mt-2.5 h-4 w-12 rounded-[5px] bg-(--pv2-electric)' />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ListingCover = ({
  listing,
  height,
  showPreview = false,
  onPreview,
  className,
}: ListingCoverProps) => {
  const t = useTranslations('portalV2.exchange');
  const hasThumb = Boolean(listing.thumbnailUrl);

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        !height && 'aspect-[16/10] w-full border-b border-[var(--pv2-hair)]',
        !hasThumb && 'bg-[var(--pv2-canvas)]',
        className
      )}
      style={height ? { height } : undefined}
    >
      {hasThumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={listing.thumbnailUrl}
          alt=''
          className='absolute inset-0 size-full object-cover'
        />
      ) : (
        <GeneratedThumb listing={listing} />
      )}

      {/* {listing.meta.badge ? (
        <span className='absolute top-2 left-2 z-[1] rounded-full bg-[var(--pv2-paper)] px-2 py-[3px] text-[10px] font-bold tracking-[0.03em] text-[var(--pv2-ink)] shadow-[var(--pv2-sh-sm)]'>
          {listing.meta.badge}
        </span>
      ) : null} */}

      {showPreview && onPreview ? (
        <button
          type='button'
          data-exchange-preview='true'
          aria-label={t('preview', { name: listing.name })}
          tabIndex={0}
          onPointerDown={e => {
            e.stopPropagation();
          }}
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            onPreview();
          }}
          onKeyDown={e => {
            e.stopPropagation();
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onPreview();
            }
          }}
          className={cn(
            'absolute top-1/2 left-1/2 z-[1] inline-flex shrink-0 -translate-x-1/2 -translate-y-1/2 items-center gap-1.5',
            'rounded-[10px] border-0 bg-[rgba(255,255,255,0.94)] px-[15px] py-[9px] whitespace-nowrap',
            'text-[12.5px] font-semibold text-[var(--pv2-ink)] shadow-[var(--pv2-sh-soft)]',
            'backdrop-blur-[4px] transition-opacity duration-150',
            'opacity-0 group-hover:opacity-100',
            'hover:bg-[var(--pv2-paper)]',
            'focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
          )}
        >
          <Eye className='size-3.5 shrink-0' strokeWidth={2} aria-hidden />
          {t('previewLabel')}
        </button>
      ) : null}
    </div>
  );
};
