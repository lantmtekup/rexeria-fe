'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { BLOCK_TYPE_META } from '@/components/modules/block-editor/types';
import { formatLift } from '@/lib/portal-v2/exchange/helpers';
import {
  getCachedExchangePageLayers,
  prefetchExchangePageLayers,
  type ExchangePageLayer,
} from '@/lib/portal-v2/exchange/pageLayers';
import type { ExchangeListingView } from '@/lib/portal-v2/exchange/types';
import { cn } from '@/lib/cn';
import { RxApiError } from '@/services/rexer/client';

type ExchangePreviewRailProps = {
  listing: ExchangeListingView;
  activeBlockId?: string | null;
  onSelectBlock?: (blockId: string) => void;
};

export const ExchangePreviewRail = ({
  listing,
  activeBlockId = null,
  onSelectBlock,
}: ExchangePreviewRailProps) => {
  const t = useTranslations('portalV2.exchange');
  const slug = listing.slug ?? '';

  const [layers, setLayers] = useState<ExchangePageLayer[]>(
    () => (slug ? getCachedExchangePageLayers(slug) : null) ?? []
  );
  const [loading, setLoading] = useState(
    () => Boolean(slug) && !getCachedExchangePageLayers(slug)
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLayers([]);
      setLoading(false);
      setLoadError(null);
      return;
    }

    const cached = getCachedExchangePageLayers(slug);
    if (cached) {
      setLayers(cached);
      setLoading(false);
      setLoadError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    void prefetchExchangePageLayers(slug)
      .then(next => {
        if (cancelled) return;
        setLayers(next);
      })
      .catch(err => {
        if (cancelled) return;
        setLayers([]);
        setLoadError(
          err instanceof RxApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : t('previewStackLoadError')
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- t identity churn
  }, [slug, listing.id]);

  const count = layers.length;
  const evidence = listing.proven ? listing.meta.evidence : undefined;
  const resolvedActiveId = activeBlockId ?? layers[0]?.id ?? null;

  return (
    <aside
      className={cn(
        'hidden min-h-0 overflow-y-auto border-r border-[var(--pv2-hair)]',
        'bg-[var(--pv2-paper)] px-4 py-5 min-[861px]:block'
      )}
      aria-label={t('previewStack', { count })}
    >
      <div className='mb-3 text-[10px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase'>
        {t('previewStack', { count: loading ? '…' : count })}
      </div>

      {loading ? (
        <div className='flex items-center gap-2 px-2.5 py-3 text-[12.5px] text-[var(--pv2-mut)]'>
          <Loader2
            className='size-3.5 animate-spin text-[var(--pv2-electric)]'
            aria-hidden
          />
          {t('previewStackLoading')}
        </div>
      ) : loadError ? (
        <p className='px-2.5 py-2 text-[12px] leading-relaxed text-[var(--pv2-faint)]'>
          {loadError}
        </p>
      ) : count ? (
        <div className='flex flex-col gap-0.5'>
          {layers.map(layer => {
            const active = resolvedActiveId === layer.id;
            const typeLabel =
              BLOCK_TYPE_META[layer.blockType]?.label ?? layer.blockType;
            const title =
              layer.name || t('previewLayerBlock', { n: layer.index });

            return (
              <button
                key={layer.id}
                type='button'
                tabIndex={0}
                aria-current={active ? 'step' : undefined}
                aria-label={`${title}, ${typeLabel}`}
                onClick={() => onSelectBlock?.(layer.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectBlock?.(layer.id);
                  }
                }}
                className={cn(
                  'flex w-full items-start gap-3 rounded-[var(--pv2-r-sm)] px-2.5 py-2 text-left',
                  'transition-colors',
                  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2 focus-visible:outline-none',
                  active
                    ? 'bg-[var(--pv2-electric-soft)]'
                    : 'hover:bg-[var(--pv2-canvas)]'
                )}
              >
                <span
                  className={cn(
                    'grid size-6 shrink-0 place-items-center rounded-[var(--pv2-r-sm)]',
                    'font-[family-name:var(--pv2-disp)] text-[10.5px] font-bold',
                    active
                      ? 'bg-[var(--pv2-electric)] text-white'
                      : 'bg-[var(--pv2-canvas)] text-[var(--pv2-mut)]'
                  )}
                  aria-hidden
                >
                  {layer.index}
                </span>
                <span className='min-w-0 pt-0.5'>
                  <span className='block truncate text-[13px] font-semibold text-[var(--pv2-ink)]'>
                    {title}
                  </span>
                  <span className='mt-0.5 block truncate text-[11px] text-[var(--pv2-faint)]'>
                    {typeLabel}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className='px-2.5 py-2 text-[12px] leading-relaxed text-[var(--pv2-faint)]'>
          {t('previewStackEmpty')}
        </p>
      )}

      <div className='mt-6 mb-3 text-[10px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase'>
        {t('previewMeasured')}
      </div>

      {evidence ? (
        <div className='flex flex-col divide-y divide-[var(--pv2-hair)]'>
          <div className='flex items-center px-2.5 py-2 text-[12.5px] text-[var(--pv2-mut)]'>
            <span>{t('previewSessions')}</span>
            <b className='ml-auto font-[family-name:var(--pv2-disp)] font-bold text-[var(--pv2-ink)]'>
              {evidence.sessions.toLocaleString()}
            </b>
          </div>
          <div className='flex items-center px-2.5 py-2 text-[12.5px] text-[var(--pv2-mut)]'>
            <span>{t('previewLift')}</span>
            <b className='ml-auto font-[family-name:var(--pv2-disp)] font-bold text-[var(--pv2-ink)]'>
              {formatLift(evidence.lift)}
            </b>
          </div>
        </div>
      ) : (
        <p className='px-2.5 py-2 text-[12px] leading-relaxed text-[var(--pv2-faint)]'>
          {t('previewMeasuredEmpty')}
        </p>
      )}
    </aside>
  );
};
