'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import { OBJECTIVE_LABEL } from '@/lib/portal-v2/intelligence/constants';
import { analyticsProofHref } from '@/lib/portal-v2/intelligence/params';
import {
  gapToStandard,
  objectiveForExperience,
  type StandardsMap,
} from '@/lib/portal-v2/intelligence/standards';
import type { IntelFinding } from '@/lib/portal-v2/intelligence/types';

const TONE_BORDER: Record<IntelFinding['act'], string> = {
  scale: 'border-l-[var(--pv2-success)]',
  fix: 'border-l-[var(--pv2-warning)]',
  instrument: 'border-l-[var(--pv2-electric)]',
  refresh: 'border-l-[#a855f7]',
};

type IntelFindingCardProps = {
  finding: IntelFinding;
  standards: StandardsMap;
  onPromote: (
    experienceId: string,
    objective: NonNullable<IntelFinding['objective']>
  ) => void;
};

export const IntelFindingCard = ({
  finding,
  standards,
  onPromote,
}: IntelFindingCardProps) => {
  const t = useTranslations('portalV2.intelligence');
  const objective =
    finding.objective ?? objectiveForExperience(finding.experienceId ?? '');
  const isStandard =
    objective != null &&
    finding.experienceId != null &&
    standards[objective] === finding.experienceId;
  const gap =
    objective != null
      ? gapToStandard(standards, objective, finding.lift)
      : null;

  return (
    <article
      className={cn(
        'flex min-h-full flex-col rounded-[var(--pv2-r-md)] border border-l-[3px] border-[var(--pv2-hair)] bg-[var(--pv2-paper)] p-4',
        TONE_BORDER[finding.act]
      )}
    >
      <div className='flex items-baseline justify-between gap-3'>
        <h3 className='text-[13px] leading-snug font-semibold text-[var(--pv2-ink)]'>
          {finding.title}
        </h3>
        <span className='shrink-0 text-[10.5px] font-semibold tracking-wide text-[var(--pv2-faint)] uppercase'>
          {finding.conf}
        </span>
      </div>

      <p className='mt-2 text-[12.5px] leading-relaxed text-[var(--pv2-ink)]'>
        {finding.what}
      </p>
      <p className='mt-1 text-[12px] leading-relaxed text-[var(--pv2-mut)]'>
        {finding.why}
      </p>

      <Link
        href={analyticsProofHref(finding.link.type, finding.link.id)}
        className={cn(
          'mt-auto inline-flex w-fit items-center gap-1 self-start',
          'rounded-[8px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]',
          'px-2.5 py-1.5 text-[11.5px] font-semibold text-[var(--pv2-electric)]',
          'transition-[border-color,background-color,color] hover:border-[var(--pv2-electric)] hover:bg-[var(--pv2-electric-soft)] hover:text-[var(--pv2-ink)]'
        )}
      >
        {t(`links.${finding.link.labelKey}`)}
        <ArrowRight className='size-3' strokeWidth={2.2} aria-hidden />
      </Link>

      {finding.experienceId && objective ? (
        <div className='mt-2.5 flex flex-wrap items-center gap-2 border-t border-[var(--pv2-hair)] pt-2.5'>
          {isStandard ? (
            <span className='inline-flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--pv2-success)_12%,var(--pv2-paper))] px-2.5 py-1 text-[11px] font-bold text-[var(--pv2-success)]'>
              ★{' '}
              {t('standardIsBar', {
                objective: OBJECTIVE_LABEL[objective],
              })}
            </span>
          ) : (
            <>
              {gap != null ? (
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[10.5px] font-bold whitespace-nowrap',
                    gap >= 0
                      ? 'bg-[color-mix(in_srgb,var(--pv2-success)_12%,var(--pv2-paper))] text-[var(--pv2-success)]'
                      : 'bg-[color-mix(in_srgb,var(--pv2-error)_10%,var(--pv2-paper))] text-[var(--pv2-error)]'
                  )}
                >
                  {gap >= 0 ? '+' : '−'}
                  {Math.abs(gap)} {t('ptsVsBar')}
                </span>
              ) : null}
              <button
                type='button'
                onClick={() => onPromote(finding.experienceId!, objective)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border border-[color-mix(in_srgb,var(--pv2-electric)_35%,var(--pv2-hair))]',
                  'bg-[var(--pv2-electric-soft)] px-2.5 py-1 text-[11.5px] font-bold text-[var(--pv2-electric)]',
                  'transition-[background-color,color] hover:bg-[var(--pv2-electric)] hover:text-[var(--pv2-paper)]'
                )}
              >
                ★ {t('promoteStandard')}
              </button>
            </>
          )}
        </div>
      ) : null}
    </article>
  );
};
