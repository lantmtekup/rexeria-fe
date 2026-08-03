'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { BLOCK_TYPE_META } from '@/components/modules/block-editor/types';
import {
  getCachedExchangePageLayers,
  prefetchExchangePageLayers,
  type ExchangePageLayerGroup,
} from '@/lib/portal-v2/exchange/pageLayers';
import {
  formatPreviewCount,
  formatPreviewLift,
} from '@/lib/portal-v2/preview/format';
import type { PreviewEvidence } from '@/lib/portal-v2/preview/types';
import { cn } from '@/lib/cn';
import { RxApiError } from '@/services/rexer/client';

type ExchangePreviewRailProps = {
  /** Public slug of the page being previewed. Empty ⇒ nothing to list. */
  slug?: string;
  /** Omit or null to render the "never run" note instead of the panel. */
  evidence?: PreviewEvidence | null;
  activeBlockId?: string | null;
  /** `pagePath` is '' for the home page — sub-pages live at `/p/{slug}/{pagePath}`. */
  onSelectBlock?: (blockId: string, pagePath: string) => void;
};

export const ExchangePreviewRail = ({
  slug: slugProp,
  evidence,
  activeBlockId = null,
  onSelectBlock,
}: ExchangePreviewRailProps) => {
  const t = useTranslations('portalV2.preview');
  const slug = slugProp ?? '';

  const [groups, setGroups] = useState<ExchangePageLayerGroup[]>(
    () => (slug ? getCachedExchangePageLayers(slug) : null) ?? []
  );
  const [loading, setLoading] = useState(
    () => Boolean(slug) && !getCachedExchangePageLayers(slug)
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setGroups([]);
      setLoading(false);
      setLoadError(null);
      return;
    }

    const cached = getCachedExchangePageLayers(slug);
    if (cached) {
      setGroups(cached);
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
        setGroups(next);
      })
      .catch(err => {
        if (cancelled) return;
        setGroups([]);
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
  }, [slug]);

  const count = useMemo(
    () => groups.reduce((sum, g) => sum + g.layers.length, 0),
    [groups]
  );
  const multiPage = groups.length > 1;
  const resolvedActiveId = activeBlockId ?? groups[0]?.layers[0]?.id ?? null;

  return (
    <aside
      className={cn(
        'hidden min-h-0 overflow-y-auto border-r border-[var(--pv2-hair)]',
        'bg-[var(--pv2-paper)] px-4 py-5 min-[861px]:block'
      )}
      aria-label={t('previewStack', { count })}
    >
      <div className='mb-3 text-[10px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase'>
        {multiPage
          ? t('previewStackPages', {
              pages: loading ? '…' : groups.length,
              count: loading ? '…' : count,
            })
          : t('previewStack', { count: loading ? '…' : count })}
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
        <div className='flex flex-col gap-1'>
          {groups.map(group => (
            <section key={group.id} aria-label={group.name}>
              {multiPage ? (
                <div className='mt-2.5 mb-1 flex min-w-0 items-baseline gap-1.5 px-2.5 first:mt-0'>
                  <span className='truncate text-[11.5px] font-bold text-[var(--pv2-mut)]'>
                    {group.name}
                  </span>
                  <span className='shrink-0 text-[10px] text-[var(--pv2-faint)]'>
                    /{group.pagePath}
                  </span>
                </div>
              ) : null}

              <div className='flex flex-col gap-0.5'>
                {group.layers.map(layer => {
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
                      onClick={() => onSelectBlock?.(layer.id, group.pagePath)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectBlock?.(layer.id, group.pagePath);
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
            </section>
          ))}
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
              {formatPreviewCount(evidence.sessions)}
            </b>
          </div>
          <div className='flex items-center px-2.5 py-2 text-[12.5px] text-[var(--pv2-mut)]'>
            <span>{t('previewLift')}</span>
            <b className='ml-auto font-[family-name:var(--pv2-disp)] font-bold text-[var(--pv2-ink)]'>
              {formatPreviewLift(evidence.lift)}
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
