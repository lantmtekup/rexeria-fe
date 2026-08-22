'use client';

import { Copy, Pencil, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { StatusPill } from '@/components/molecules/portal-v2/product-form';
import { ProductCover } from '@/components/organisms/portal-v2/product/ProductCover';
import { cn } from '@/lib/cn';
import {
  productCoverUrl,
  productPriceRange,
  readiness,
  readinessColor,
} from '@/lib/portal-v2/product/helpers';
import type { Product, ProductAsset } from '@/lib/portal-v2/product/types';

type ProductGridProps = {
  products: Product[];
  assets: ProductAsset[];
  hydratedIds: Set<string>;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
};

const actionButton = cn(
  'grid size-7 cursor-pointer place-items-center rounded-[7px]',
  'bg-[var(--pv2-paper)]/85 text-[var(--pv2-mut)] backdrop-blur-sm transition-colors',
  'hover:bg-[var(--pv2-paper)] hover:text-[var(--pv2-ink)]',
  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
);

export const ProductGrid = ({
  products,
  assets,
  hydratedIds,
  onOpen,
  onEdit,
  onDuplicate,
  onDelete,
}: ProductGridProps) => {
  const t = useTranslations('portalV2.products');

  return (
    <div className='grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3.5'>
      {products.map(p => {
        const score = readiness(p, assets, hydratedIds.has(p.id)).score;
        return (
          <div
            key={p.id}
            className={cn(
              'group relative w-full overflow-hidden rounded-[var(--pv2-r)]',
              'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]',
              'transition-[box-shadow,transform,border-color] hover:-translate-y-0.5 hover:border-transparent hover:shadow-[var(--pv2-sh-soft)]'
            )}
          >
            <span className='absolute top-2 right-2 z-[1] flex items-center gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100'>
              <button
                type='button'
                className={actionButton}
                title={t('rowEdit')}
                aria-label={t('rowEditAria', { name: p.title })}
                onClick={() => onEdit(p.id)}
              >
                <Pencil className='size-3.5' strokeWidth={2} aria-hidden />
              </button>
              <button
                type='button'
                className={actionButton}
                title={t('rowDuplicate')}
                aria-label={t('rowDuplicateAria', { name: p.title })}
                onClick={() => onDuplicate(p.id)}
              >
                <Copy className='size-3.5' strokeWidth={2} aria-hidden />
              </button>
              <button
                type='button'
                className={cn(actionButton, 'hover:text-[var(--pv2-error)]')}
                title={t('rowDelete')}
                aria-label={t('rowDeleteAria', { name: p.title })}
                onClick={() => onDelete(p.id)}
              >
                <Trash2 className='size-3.5' strokeWidth={2} aria-hidden />
              </button>
            </span>

            <button
              type='button'
              onClick={() => onOpen(p.id)}
              className='block w-full cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
            >
              <ProductCover src={productCoverUrl(p, assets)} alt={p.title} />

              <span className='block px-3.5 pt-3 pb-[13px]'>
                <span className='mb-1.5 block'>
                  <StatusPill status={p.status} />
                </span>
                <span className='block truncate font-[family-name:var(--pv2-disp)] text-[13.5px] font-semibold text-[var(--pv2-ink)]'>
                  {p.title}
                </span>
                <span className='mt-0.5 block truncate text-[11px] text-[var(--pv2-mut)]'>
                  {p.type} · {t('variantCount', { count: p.variants.length })}
                </span>
                <span className='mt-2.5 flex items-center border-t border-[var(--pv2-hair)] pt-2.5'>
                  <span className='font-[family-name:var(--pv2-disp)] text-[14px] font-bold text-[var(--pv2-ink)]'>
                    {productPriceRange(p)}
                  </span>
                  <span
                    className='ml-auto text-[10.5px] font-bold'
                    style={{ color: readinessColor(score) }}
                  >
                    {t('percentReady', { score })}
                  </span>
                </span>
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
