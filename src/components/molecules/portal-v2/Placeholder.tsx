'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';

type PlaceholderProps = {
  /** Key under portalV2.pages, e.g. `brandTitle` */
  titleKey: string;
  /** Key under portalV2.pages; defaults to placeholderDesc */
  descriptionKey?: string;
};

export const Placeholder = ({
  titleKey,
  descriptionKey = 'placeholderDesc',
}: PlaceholderProps) => {
  const t = useTranslations('portalV2.pages');

  return (
    <div className='mx-auto p-5'>
      <h1
        className={cn(
          'font-[family-name:var(--pv2-disp)] text-[2rem] font-bold tracking-[-0.03em]',
          'leading-tight text-[var(--pv2-ink)]'
        )}
      >
        {t(titleKey)}
      </h1>
      <p className='mt-3 max-w-prose text-base leading-relaxed text-[var(--pv2-mut)]'>
        {t(descriptionKey)}
      </p>
      <div
        className={cn(
          'mt-10 rounded-[var(--pv2-r-lg)] border border-dashed border-[var(--pv2-hair)]',
          'bg-[var(--pv2-paper)] px-8 py-14 text-center text-[15px] text-[var(--pv2-faint)]'
        )}
      >
        {t('comingSoon')}
      </div>
    </div>
  );
};
