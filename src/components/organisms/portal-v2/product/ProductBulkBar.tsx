'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';

type ProductBulkBarProps = {
  count: number;
  onPublish: () => void;
  onAddTags: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onClear: () => void;
};

const barButton = cn(
  'cursor-pointer rounded-full px-3 py-1.5 text-[12px] font-semibold text-[var(--pv2-paper)]',
  'bg-white/[0.13] transition-colors hover:bg-white/25',
  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-paper)] focus-visible:outline-none'
);

export const ProductBulkBar = ({
  count,
  onPublish,
  onAddTags,
  onArchive,
  onDelete,
  onClear,
}: ProductBulkBarProps) => {
  const t = useTranslations('portalV2.products');

  return (
    <div
      role='toolbar'
      aria-label={t('bulkAria')}
      className='mb-3.5 flex flex-wrap items-center gap-2 rounded-[var(--pv2-r)] bg-[var(--pv2-ink)] px-3.5 py-2.5'
    >
      <span className='mr-1 text-[12.5px] font-semibold text-[var(--pv2-paper)]'>
        {t('bulkSelected', { count })}
      </span>
      <button type='button' className={barButton} onClick={onPublish}>
        {t('bulkPublish')}
      </button>
      <button type='button' className={barButton} onClick={onAddTags}>
        {t('bulkAddTags')}
      </button>
      <button type='button' className={barButton} onClick={onArchive}>
        {t('bulkArchive')}
      </button>
      <button
        type='button'
        onClick={onDelete}
        className={cn(
          barButton,
          'bg-[var(--pv2-error)] hover:bg-[color-mix(in_srgb,var(--pv2-error)_80%,#000)]'
        )}
      >
        {t('bulkDelete')}
      </button>
      <button
        type='button'
        className={cn(barButton, 'ml-auto')}
        onClick={onClear}
      >
        {t('bulkClear')}
      </button>
    </div>
  );
};
