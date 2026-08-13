'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { fmtLift } from '@/lib/portal-v2/analytics/helpers';
import { analyticsProofHref } from '@/lib/portal-v2/intelligence/params';
import type { IntelStandard } from '@/lib/portal-v2/intelligence/types';

type StandardsStripProps = {
  standards: IntelStandard[];
  onRetire: (objective: IntelStandard['objective']) => void;
};

export const StandardsStrip = ({
  standards,
  onRetire,
}: StandardsStripProps) => {
  const t = useTranslations('portalV2.intelligence');

  if (!standards.length) return null;

  return (
    <section className='rounded-[var(--pv2-r-md)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] p-4'>
      <div className='mb-3 flex flex-wrap items-center gap-2'>
        <Sparkles className='size-3.5 text-[var(--pv2-electric)]' aria-hidden />
        <h2 className='text-[11px] font-bold tracking-wide text-[var(--pv2-ink)] uppercase'>
          {t('bar.title')}
        </h2>
        <span className='text-[11px] text-[var(--pv2-faint)]'>
          {t('bar.subtitle')}
        </span>
      </div>

      <div className='flex flex-col gap-2'>
        {standards.map(standard => (
          <div
            key={standard.objective}
            className='flex flex-wrap items-center gap-3 rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-3 py-2.5'
          >
            <div className='min-w-0 flex-1'>
              <strong className='block text-[13px] text-[var(--pv2-ink)]'>
                {standard.name}
              </strong>
              <span className='text-[11px] text-[var(--pv2-faint)]'>
                {standard.objectiveName}
              </span>
            </div>
            <span className='font-[family-name:var(--pv2-disp)] text-[15px] font-bold tracking-[-0.03em] text-[var(--pv2-ink)]'>
              {fmtLift(standard.lift)}{' '}
              <i className='text-[11px] font-medium text-[var(--pv2-faint)] not-italic'>
                {t('bar.theBar')}
              </i>
            </span>
            <Link
              href={analyticsProofHref('experiences', standard.experienceId)}
              className='inline-flex items-center gap-1 text-[11.5px] font-bold whitespace-nowrap text-[var(--pv2-electric)] transition-colors hover:text-[var(--pv2-ink)] hover:underline'
            >
              {t('bar.record')}
              <ArrowRight className='size-3' strokeWidth={2.2} aria-hidden />
            </Link>
            <button
              type='button'
              aria-label={t('bar.retire', {
                objective: standard.objectiveName,
              })}
              onClick={() => onRetire(standard.objective)}
              className='grid size-7 place-items-center rounded-full text-[var(--pv2-faint)] hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)]'
            >
              <X className='size-3.5' aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
