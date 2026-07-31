'use client';

import { Copy, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  ChannelDots,
  ProductThumb,
  ReadinessBar,
  SelectBox,
  StatusPill,
} from '@/components/molecules/portal-v2/product-form';
import { cn } from '@/lib/cn';
import { PRODUCT_CHANNELS } from '@/lib/portal-v2/product/constants';
import {
  productGradient,
  productPriceRange,
  readiness,
  stockSummary,
} from '@/lib/portal-v2/product/helpers';
import type { Product, ProductAsset } from '@/lib/portal-v2/product/types';

type ProductTableProps = {
  products: Product[];
  assets: ProductAsset[];
  selected: string[];
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
};

const headClass =
  'bg-[var(--pv2-canvas)] px-3.5 py-2.5 text-left text-[10.5px] font-bold tracking-[0.05em] text-[var(--pv2-mut)] uppercase whitespace-nowrap';

const cellClass =
  'border-b border-[var(--pv2-hair)] px-3.5 py-3 text-[12.5px] align-middle';

const actionButton = cn(
  'grid size-7 cursor-pointer place-items-center rounded-[7px] text-[var(--pv2-mut)] transition-colors',
  'hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)]',
  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
);

export const ProductTable = ({
  products,
  assets,
  selected,
  onToggleSelect,
  onToggleAll,
  onOpen,
  onEdit,
  onDuplicate,
  onDelete,
}: ProductTableProps) => {
  const t = useTranslations('portalV2.products');
  const allSelected =
    products.length > 0 && selected.length === products.length;

  return (
    <div className='overflow-x-auto rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
      <table className='w-full border-collapse'>
        <thead>
          <tr>
            <th className={cn(headClass, 'w-[34px]')}>
              <SelectBox
                checked={allSelected}
                onToggle={onToggleAll}
                label={t('selectAll')}
              />
            </th>
            <th className={headClass}>{t('colProduct')}</th>
            <th className={headClass}>{t('colStatus')}</th>
            <th className={headClass}>{t('colInventory')}</th>
            <th className={headClass}>{t('colPrice')}</th>
            <th className={headClass}>{t('colType')}</th>
            <th className={headClass}>{t('colChannels')}</th>
            <th className={headClass}>{t('colReadiness')}</th>
            <th className={headClass}>{t('colUpdated')}</th>
            <th className={cn(headClass, 'w-[104px]')}>
              <span className='sr-only'>{t('colActions')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => {
            const on = selected.includes(p.id);
            const stock = stockSummary(p);
            return (
              <tr
                key={p.id}
                onClick={() => onOpen(p.id)}
                className={cn(
                  'group cursor-pointer transition-colors',
                  on
                    ? 'bg-[var(--pv2-electric-soft)]'
                    : 'hover:bg-[var(--pv2-canvas)]'
                )}
              >
                <td className={cellClass}>
                  <SelectBox
                    checked={on}
                    onToggle={() => onToggleSelect(p.id)}
                    label={t('selectRow', { name: p.title })}
                  />
                </td>

                <td className={cellClass}>
                  <span className='flex min-w-[230px] items-center gap-3'>
                    <ProductThumb
                      gradient={productGradient(p, assets)}
                      letter={p.title[0] ?? '?'}
                    />
                    <span className='min-w-0'>
                      <span className='block truncate text-[13px] font-semibold text-[var(--pv2-ink)]'>
                        {p.title}
                      </span>
                      <span className='block truncate text-[11px] text-[var(--pv2-faint)]'>
                        /{p.handle}
                      </span>
                    </span>
                  </span>
                </td>

                <td className={cellClass}>
                  <StatusPill status={p.status} />
                </td>

                <td className={cellClass}>
                  <span
                    className={cn(
                      'block text-[12.5px] tabular-nums',
                      stock.total === 0
                        ? 'text-[var(--pv2-error)]'
                        : stock.out
                          ? 'text-[var(--pv2-warning)]'
                          : 'text-[var(--pv2-ink)]'
                    )}
                  >
                    {t('inStock', { count: stock.total })}
                  </span>
                  <span className='block text-[10.5px] whitespace-nowrap text-[var(--pv2-faint)]'>
                    {t('forVariants', { count: p.variants.length })}
                    {stock.out
                      ? ` · ${t('outOfStock', { count: stock.out })}`
                      : stock.low
                        ? ` · ${t('lowStock', { count: stock.low })}`
                        : ''}
                  </span>
                </td>

                <td
                  className={cn(
                    cellClass,
                    'whitespace-nowrap text-[var(--pv2-ink)] tabular-nums'
                  )}
                >
                  {productPriceRange(p)}
                </td>

                <td className={cn(cellClass, 'whitespace-nowrap')}>{p.type}</td>

                <td className={cellClass}>
                  <ChannelDots channels={p.channels} all={PRODUCT_CHANNELS} />
                </td>

                <td className={cellClass}>
                  <ReadinessBar score={readiness(p, assets).score} />
                </td>

                <td
                  className={cn(
                    cellClass,
                    'text-[11.5px] whitespace-nowrap text-[var(--pv2-faint)]'
                  )}
                >
                  {p.updated}
                </td>

                <td className={cellClass}>
                  <span
                    className={cn(
                      'flex items-center gap-0.5 transition-opacity',
                      on
                        ? 'opacity-100'
                        : 'opacity-0 group-focus-within:opacity-100 group-hover:opacity-100'
                    )}
                  >
                    <button
                      type='button'
                      className={actionButton}
                      title={t('rowEdit')}
                      aria-label={t('rowEditAria', { name: p.title })}
                      onClick={e => {
                        e.stopPropagation();
                        onEdit(p.id);
                      }}
                    >
                      <Pencil
                        className='size-3.5'
                        strokeWidth={2}
                        aria-hidden
                      />
                    </button>
                    <button
                      type='button'
                      className={actionButton}
                      title={t('rowDuplicate')}
                      aria-label={t('rowDuplicateAria', { name: p.title })}
                      onClick={e => {
                        e.stopPropagation();
                        onDuplicate(p.id);
                      }}
                    >
                      <Copy className='size-3.5' strokeWidth={2} aria-hidden />
                    </button>
                    <button
                      type='button'
                      className={cn(
                        actionButton,
                        'hover:bg-[color-mix(in_srgb,var(--pv2-error)_10%,transparent)] hover:text-[var(--pv2-error)]'
                      )}
                      title={t('rowDelete')}
                      aria-label={t('rowDeleteAria', { name: p.title })}
                      onClick={e => {
                        e.stopPropagation();
                        onDelete(p.id);
                      }}
                    >
                      <Trash2
                        className='size-3.5'
                        strokeWidth={2}
                        aria-hidden
                      />
                    </button>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
