'use client';

import { AlignLeft, LayoutGrid, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { TextSelect } from '@/components/molecules/portal-v2/brand-form';
import { cn } from '@/lib/cn';
import {
  PRODUCT_BRANDS,
  PRODUCT_TYPES,
} from '@/lib/portal-v2/product/constants';
import type {
  ProductFilters,
  ProductViewMode,
} from '@/lib/portal-v2/product/types';

type ProductToolbarProps = {
  filters: ProductFilters;
  onChange: (patch: Partial<ProductFilters>) => void;
};

const viewButtonClass = (on: boolean) =>
  cn(
    'grid size-8 cursor-pointer place-items-center rounded-[8px] transition-colors',
    'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
    on
      ? 'bg-[var(--pv2-ink)] text-[var(--pv2-paper)]'
      : 'text-[var(--pv2-mut)] hover:text-[var(--pv2-ink)]'
  );

export const ProductToolbar = ({ filters, onChange }: ProductToolbarProps) => {
  const t = useTranslations('portalV2.products');

  const setView = (view: ProductViewMode) => onChange({ view });

  return (
    <div className='mb-3.5 flex flex-wrap items-center gap-2'>
      <label
        className={cn(
          'flex min-w-[250px] flex-1 items-center gap-2 rounded-[10px]',
          'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-[11px] py-2 text-[var(--pv2-faint)]',
          'transition-colors focus-within:border-[var(--pv2-electric)]'
        )}
      >
        <Search className='size-3.5 shrink-0' strokeWidth={2.2} aria-hidden />
        <input
          type='search'
          value={filters.q}
          onChange={e => onChange({ q: e.target.value })}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchAria')}
          className='min-w-0 flex-1 border-0 bg-transparent text-[12.5px] text-[var(--pv2-ink)] outline-none placeholder:text-[var(--pv2-faint)]'
        />
      </label>

      <TextSelect
        value={filters.type}
        onChange={e => onChange({ type: e.target.value })}
        aria-label={t('filterTypeAria')}
        className='w-auto min-w-[150px] py-2 text-[12.5px]'
      >
        <option value='all'>{t('allTypes')}</option>
        {PRODUCT_TYPES.map(x => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </TextSelect>

      <TextSelect
        value={filters.brand}
        onChange={e => onChange({ brand: e.target.value })}
        aria-label={t('filterBrandAria')}
        className='w-auto min-w-[150px] py-2 text-[12.5px]'
      >
        <option value='all'>{t('allBrands')}</option>
        {PRODUCT_BRANDS.map(x => (
          <option key={x} value={x}>
            {x}
          </option>
        ))}
      </TextSelect>

      <span className='ml-auto flex items-center gap-0.5 rounded-[10px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] p-0.5'>
        <button
          type='button'
          onClick={() => setView('table')}
          aria-pressed={filters.view === 'table'}
          aria-label={t('viewTable')}
          title={t('viewTable')}
          className={viewButtonClass(filters.view === 'table')}
        >
          <AlignLeft className='size-3.5' strokeWidth={2} aria-hidden />
        </button>
        <button
          type='button'
          onClick={() => setView('grid')}
          aria-pressed={filters.view === 'grid'}
          aria-label={t('viewGrid')}
          title={t('viewGrid')}
          className={viewButtonClass(filters.view === 'grid')}
        >
          <LayoutGrid className='size-3.5' strokeWidth={2} aria-hidden />
        </button>
      </span>
    </div>
  );
};
