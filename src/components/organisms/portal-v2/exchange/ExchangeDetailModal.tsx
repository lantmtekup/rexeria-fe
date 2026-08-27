'use client';

import { Check, Eye, Lock, Package, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { ListingCover } from '@/components/organisms/portal-v2/exchange/ListingCover';
import {
  formatLift,
  formatPrice,
  kindLabelKey,
  resolveActionState,
} from '@/lib/portal-v2/exchange/helpers';
import { objectiveLabelKey } from '@/lib/portal-v2/exchange/mapPage';
import type {
  ExchangeListingView,
  ExchangeSessionState,
} from '@/lib/portal-v2/exchange/types';
import { cn } from '@/lib/cn';

type ExchangeDetailModalProps = {
  listing: ExchangeListingView | null;
  session: ExchangeSessionState;
  onClose: () => void;
  onAction: (listing: ExchangeListingView) => void;
  onPreview: (listing: ExchangeListingView) => void;
  /** Món đã có trong thư viện — mở thẳng nó ở màn Experiences. */
  onOpenInLibrary: (listing: ExchangeListingView) => void;
};

export const ExchangeDetailModal = ({
  listing,
  session,
  onClose,
  onAction,
  onPreview,
  onOpenInLibrary,
}: ExchangeDetailModalProps) => {
  const t = useTranslations('portalV2.exchange');

  if (!listing) return null;

  const { meta } = listing;
  const action = resolveActionState(listing, session);
  const kindLabel = t(kindLabelKey(meta.kind));

  const footer = (
    <>
      <span
        className={cn(
          'text-[15px] font-bold',
          meta.price > 0 ? 'text-[var(--pv2-ink)]' : 'text-[var(--pv2-success)]'
        )}
      >
        {formatPrice(meta.price)}
      </span>
      <span className='flex-1' />
      <Button
        variant='ghost'
        size='sm'
        className='whitespace-nowrap'
        onClick={() => onPreview(listing)}
      >
        <Eye className='size-3.5 shrink-0' strokeWidth={2} aria-hidden />
        {t('previewLabel')}
      </Button>
      {action === 'added' ? (
        <Button
          variant='ghost'
          size='sm'
          title={t('inLibrary')}
          onClick={() => onOpenInLibrary(listing)}
        >
          <Check className='size-3.5' strokeWidth={2.6} aria-hidden />
          {t('openInLibrary')}
        </Button>
      ) : null}
      {action === 'owned' ? (
        <Button variant='primary' size='sm' onClick={() => onAction(listing)}>
          <Plus className='size-3.5' strokeWidth={2.4} aria-hidden />
          {t('addToWorkspace')}
        </Button>
      ) : null}
      {action === 'buy' ? (
        <Button variant='primary' size='sm' onClick={() => onAction(listing)}>
          <Package className='size-3.5' strokeWidth={2.2} aria-hidden />
          {t('buy', { price: formatPrice(meta.price) })}
        </Button>
      ) : null}
      {action === 'locked' ? (
        <Button variant='ghost' size='sm' onClick={() => onAction(listing)}>
          <Lock className='size-3.5' strokeWidth={2.2} aria-hidden />
          {t('premium')}
        </Button>
      ) : null}
    </>
  );

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title={listing.name}
      subtitle={t('detailSub', {
        author: listing.author,
        kind: kindLabel,
        objective: meta.objective
          ? t(objectiveLabelKey(meta.objective))
          : t('objUnset'),
      })}
      footer={footer}
    >
      <div className='grid gap-6 md:grid-cols-[minmax(0,300px)_1fr]'>
        <ListingCover
          listing={listing}
          height={180}
          eagerLivePreview
          className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)]'
        />

        <div className='space-y-6'>
          <p className='text-[14px] leading-relaxed text-[var(--pv2-mut)]'>
            {meta.summary || listing.description}
          </p>

          <section className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)]/60 p-4'>
            <h3 className='text-[13px] font-bold text-[var(--pv2-ink)]'>
              {t('evidenceHeading')}
            </h3>
            {listing.proven && meta.evidence ? (
              <div className='mt-2 space-y-2'>
                <p className='text-[13px] font-semibold text-[var(--pv2-ink)]'>
                  {formatLift(meta.evidence.lift)} ·{' '}
                  {meta.evidence.sessions.toLocaleString()} {t('sessions')}
                </p>
                <p className='text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
                  {t('evidenceNote')}
                </p>
              </div>
            ) : (
              <div className='mt-2 space-y-2'>
                <p className='text-[13px] font-semibold text-[var(--pv2-faint)]'>
                  {t('unprovenDetail')}
                </p>
                <p className='text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
                  {t('unprovenNote')}
                </p>
              </div>
            )}
          </section>

          <section className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)]/60 p-4'>
            <h3 className='text-[13px] font-bold text-[var(--pv2-ink)]'>
              {t('coverageHeading')}
            </h3>
            <div className='mt-2 flex flex-wrap items-center gap-2'>
              {/* Vắng độ phủ ⇒ nói "chưa đo", không in 0%. */}
              <span className='text-[13px] font-semibold text-[var(--pv2-ink)]'>
                {meta.coverage
                  ? t('coverageStats', {
                      blocks: meta.coverage.blocks,
                      pct: meta.coverage.pct,
                    })
                  : t('coverageUnknown')}
              </span>
            </div>
            {meta.coverage && meta.objective ? (
              <p
                className={cn(
                  'mt-2 text-[12.5px] leading-relaxed',
                  meta.coverage.objCovered
                    ? 'text-[var(--pv2-mut)]'
                    : 'text-[var(--pv2-faint)]'
                )}
              >
                {meta.coverage.objCovered
                  ? t('coverageOk', {
                      objective: t(objectiveLabelKey(meta.objective)),
                    })
                  : t('coverageGap', {
                      objective: t(objectiveLabelKey(meta.objective)),
                    })}
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </Modal>
  );
};
