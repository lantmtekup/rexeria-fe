'use client';

import { Database, Plug } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import type {
  AuditProductRow,
  AuditSource,
} from '@/lib/portal-v2/journey-audit/types';

/** Provider sở hữu sản phẩm → giá trị `products.source` tương ứng. Provider
 *  ngoài map (ga4, meta…) là nguồn đo lường: không sync sản phẩm riêng, chọn
 *  nó nghĩa là audit toàn bộ danh mục. */
export const PRODUCT_SOURCE_BY_PROVIDER: Record<string, string> = {
  shopify: 'shopify',
  woocommerce: 'woocommerce',
  csv: 'csv',
};

type SourceGateProps = {
  sources: AuditSource[];
  products: AuditProductRow[];
  /** key = 'all' hoặc provider của nguồn được chọn. */
  onPick: (key: string) => void;
  onOpenSources: () => void;
};

/**
 * Màn mở đầu Journey Audit (live mode): chọn nguồn dữ liệu trước, rail sản
 * phẩm sẽ lọc theo nguồn đã sync rồi mới bắt đầu audit.
 */
export const SourceGate = ({
  sources,
  products,
  onPick,
  onOpenSources,
}: SourceGateProps) => {
  const t = useTranslations('portalV2.journeyAudit');

  const connected = sources.filter(s => s.status !== 'available');

  const countFor = (provider: string): number | null => {
    const src = PRODUCT_SOURCE_BY_PROVIDER[provider];
    // Nguồn đo lường (GA4, Meta…) phủ toàn bộ danh mục — không có count riêng.
    if (!src) return null;
    return products.filter(p => p.source === src).length;
  };

  const card =
    'flex w-full items-center gap-3.5 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4 py-3.5 text-left shadow-[var(--pv2-sh-sm)] transition-colors';
  const cardActive =
    'cursor-pointer hover:border-[var(--pv2-electric)] hover:bg-[var(--pv2-electric-soft)]';

  return (
    <div className='flex min-h-0 flex-1 items-start justify-center overflow-y-auto px-5 py-10'>
      <div className='w-full max-w-[560px]'>
        <div className='mb-5 text-center'>
          <span className='mx-auto mb-3 grid size-11 place-items-center rounded-full bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)]'>
            <Database className='size-5' aria-hidden />
          </span>
          <h2 className='text-[17px] font-bold text-[var(--pv2-ink)]'>
            {t('srcGateTitle')}
          </h2>
          <p className='mt-1 text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
            {t('srcGateSub')}
          </p>
        </div>

        {connected.length ? (
          <div className='flex flex-col gap-2.5'>
            {connected.map(source => {
              const count = countFor(source.provider);
              const empty = count === 0;
              return (
                <button
                  key={source.id}
                  type='button'
                  disabled={empty}
                  onClick={() => onPick(source.provider)}
                  className={`${card} ${empty ? 'opacity-55' : cardActive}`}
                >
                  <span
                    aria-hidden
                    className='grid size-9 shrink-0 place-items-center rounded-[var(--pv2-r-sm)] bg-[var(--pv2-canvas)] text-lg'
                  >
                    {source.icon}
                  </span>
                  <span className='min-w-0 flex-1'>
                    <span className='block truncate text-[13.5px] font-semibold text-[var(--pv2-ink)]'>
                      {source.name}
                    </span>
                    <span className='text-2xs block truncate text-[var(--pv2-faint)]'>
                      {source.lastSync ?? source.category}
                    </span>
                  </span>
                  <span className='text-2xs shrink-0 rounded-full bg-[var(--pv2-canvas)] px-2.5 py-1 font-semibold text-[var(--pv2-mut)]'>
                    {count === null
                      ? t('srcGateMeasures')
                      : empty
                        ? t('srcGateNoProducts')
                        : t('srcGateProducts', { count })}
                  </span>
                </button>
              );
            })}

            <button
              type='button'
              onClick={() => onPick('all')}
              className={`${card} ${cardActive}`}
            >
              <span
                aria-hidden
                className='grid size-9 shrink-0 place-items-center rounded-[var(--pv2-r-sm)] bg-[var(--pv2-canvas)] text-lg'
              >
                📦
              </span>
              <span className='min-w-0 flex-1'>
                <span className='block text-[13.5px] font-semibold text-[var(--pv2-ink)]'>
                  {t('srcGateAll')}
                </span>
                <span className='text-2xs block text-[var(--pv2-faint)]'>
                  {t('srcGateAllHint')}
                </span>
              </span>
              <span className='text-2xs shrink-0 rounded-full bg-[var(--pv2-canvas)] px-2.5 py-1 font-semibold text-[var(--pv2-mut)]'>
                {t('srcGateProducts', { count: products.length })}
              </span>
            </button>
          </div>
        ) : (
          <div className='rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-5 py-8 text-center'>
            <p className='mb-3 text-[12.5px] text-[var(--pv2-mut)]'>
              {t('srcGateEmpty')}
            </p>
            <Button variant='primary' onClick={onOpenSources}>
              <Plug className='size-[15px]' aria-hidden />
              {t('srcGateConnect')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
