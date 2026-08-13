'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { IntelActionTiles } from '@/components/organisms/portal-v2/intelligence/IntelActionTiles';
import { IntelFindingCard } from '@/components/organisms/portal-v2/intelligence/IntelFindingCard';
import { StandardsStrip } from '@/components/organisms/portal-v2/intelligence/StandardsStrip';
import { TrustChip } from '@/components/organisms/portal-v2/intelligence/TrustChip';
import { cn } from '@/lib/cn';
import {
  INTEL_ACTION_META,
  INTEL_GROUPS,
  OBJECTIVE_LABEL,
} from '@/lib/portal-v2/intelligence/constants';
import {
  buildIntelFindings,
  sortFindingsByImpact,
} from '@/lib/portal-v2/intelligence/findings';
import { writeIntelViewState } from '@/lib/portal-v2/intelligence/params';
import {
  promoteStandard,
  readAllStandards,
  retireStandard,
  type StandardsMap,
} from '@/lib/portal-v2/intelligence/standards';
import { buildIntelTrust } from '@/lib/portal-v2/intelligence/trust';
import type {
  IntelAction,
  IntelFocus,
  IntelViewState,
} from '@/lib/portal-v2/intelligence/types';
import type { ExperienceObjective } from '@/lib/portal-v2/experiences/types';

type IntelligenceWorkspaceProps = {
  initialState: IntelViewState;
};

export const IntelligenceWorkspace = ({
  initialState,
}: IntelligenceWorkspaceProps) => {
  const t = useTranslations('portalV2.intelligence');
  const [state, setState] = useState<IntelViewState>(initialState);
  const [standards, setStandards] = useState<StandardsMap>({});
  const [trustOpen, setTrustOpen] = useState(false);

  useEffect(() => {
    writeIntelViewState(state);
  }, [state]);

  const trust = useMemo(() => buildIntelTrust(), []);
  const findings = useMemo(() => buildIntelFindings(), []);
  const standardRows = useMemo(() => readAllStandards(standards), [standards]);

  const counts = useMemo(
    () =>
      INTEL_GROUPS.reduce(
        (acc, action) => {
          acc[action] = findings.filter(item => item.act === action).length;
          return acc;
        },
        {} as Record<IntelAction, number>
      ),
    [findings]
  );

  const visibleFindings = useMemo(() => {
    const filtered =
      state.focus === 'all'
        ? findings
        : findings.filter(item => item.act === state.focus);
    return sortFindingsByImpact(filtered);
  }, [findings, state.focus]);

  const groupedFindings = useMemo(() => {
    if (state.focus !== 'all') return null;
    return INTEL_GROUPS.map(action => ({
      action,
      items: sortFindingsByImpact(
        findings.filter(item => item.act === action)
      ).slice(0, 4),
      total: counts[action],
    })).filter(group => group.items.length > 0);
  }, [counts, findings, state.focus]);

  const handleFocusChange = (focus: IntelFocus) => {
    setState(current => ({ ...current, focus }));
  };

  const handlePromote = (
    experienceId: string,
    objective: ExperienceObjective
  ) => {
    setStandards(current => promoteStandard(current, experienceId, objective));
    toast.success(t('promoted', { objective: OBJECTIVE_LABEL[objective] }));
  };

  const handleRetire = (objective: ExperienceObjective) => {
    setStandards(current => retireStandard(current, objective));
    toast.message(t('retired', { objective: OBJECTIVE_LABEL[objective] }));
  };

  return (
    <div className='flex min-h-0 flex-col'>
      <header className='pv2-page-header'>
        <div className='mx-auto flex w-full flex-wrap items-start justify-between gap-4 px-5 pt-6 pb-4 md:px-8'>
          <div className='min-w-0 flex-1'>
            <h1 className='font-[family-name:var(--pv2-disp)] text-[1.625rem] font-bold tracking-[-0.03em] text-[var(--pv2-ink)] md:text-[1.75rem]'>
              {t('title')}
            </h1>
            <p className='mt-1 max-w-3xl text-[13.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {findings.length
                ? t('subtitleActive', { count: findings.length })
                : t('subtitleEmpty')}
            </p>
            {findings.length ? (
              <p className='mt-2 text-[12px] text-[var(--pv2-mut)]'>
                {t('rankingsNote')}{' '}
                <Link
                  href='/portal-v2/analytics?lens=insights'
                  className='inline-flex items-center gap-1 font-semibold text-[var(--pv2-electric)] hover:text-[var(--pv2-ink)]'
                >
                  {t('pulseLink')}
                  <ArrowRight
                    className='size-3'
                    strokeWidth={2.2}
                    aria-hidden
                  />
                </Link>
              </p>
            ) : null}
          </div>

          <TrustChip
            trust={trust}
            open={trustOpen}
            onOpen={() => setTrustOpen(true)}
            onClose={() => setTrustOpen(false)}
          />
        </div>
      </header>

      <main className='mx-auto w-full space-y-6 px-5 py-8 md:px-8'>
        <IntelActionTiles
          focus={state.focus}
          counts={counts}
          onFocusChange={handleFocusChange}
        />

        <StandardsStrip standards={standardRows} onRetire={handleRetire} />

        {state.focus !== 'all' ? (
          <section className='space-y-3'>
            <div className='flex flex-wrap items-center gap-2'>
              <h2 className='text-[12px] font-bold tracking-wide text-[var(--pv2-ink)] uppercase'>
                {t(INTEL_ACTION_META[state.focus].labelKey)}
              </h2>
              <span className='text-[11px] text-[var(--pv2-faint)]'>
                {t(INTEL_ACTION_META[state.focus].descKey)}
              </span>
              <button
                type='button'
                onClick={() => handleFocusChange('all')}
                className='ml-auto text-[11.5px] font-semibold text-[var(--pv2-electric)] hover:text-[var(--pv2-ink)] hover:underline'
              >
                {t('showAll')}
              </button>
            </div>
            {visibleFindings.length ? (
              <div className='grid items-stretch gap-2.5 md:grid-cols-2'>
                {visibleFindings.map(finding => (
                  <IntelFindingCard
                    key={`${finding.act}-${finding.title}-${finding.link.id}`}
                    finding={finding}
                    standards={standards}
                    onPromote={handlePromote}
                  />
                ))}
              </div>
            ) : (
              <p className='rounded-[var(--pv2-r-md)] border border-dashed border-[var(--pv2-hair)] px-4 py-8 text-center text-[13px] text-[var(--pv2-faint)]'>
                {t('emptyFocus')}
              </p>
            )}
          </section>
        ) : groupedFindings ? (
          groupedFindings.map(group => (
            <section key={group.action} className='space-y-3'>
              <div className='flex flex-wrap items-center gap-2'>
                <h2
                  className={cn(
                    'flex items-center gap-2 text-[12px] font-bold tracking-wide uppercase',
                    'text-[var(--pv2-ink)]'
                  )}
                >
                  <span
                    className={cn(
                      'size-1.5 rounded-full',
                      group.action === 'scale' && 'bg-[var(--pv2-success)]',
                      group.action === 'fix' && 'bg-[var(--pv2-warning)]',
                      group.action === 'instrument' &&
                        'bg-[var(--pv2-electric)]',
                      group.action === 'refresh' && 'bg-[#a855f7]'
                    )}
                    aria-hidden
                  />
                  {t(INTEL_ACTION_META[group.action].labelKey)}
                </h2>
                <span className='text-[11px] text-[var(--pv2-faint)]'>
                  {t(INTEL_ACTION_META[group.action].descKey)}
                </span>
                {group.total > group.items.length ? (
                  <button
                    type='button'
                    onClick={() => handleFocusChange(group.action)}
                    className='ml-auto text-[11.5px] font-semibold text-[var(--pv2-electric)] hover:text-[var(--pv2-ink)] hover:underline'
                  >
                    {t('moreCount', {
                      count: group.total - group.items.length,
                    })}
                  </button>
                ) : null}
              </div>
              <div className='grid items-stretch gap-2.5 md:grid-cols-2'>
                {group.items.map(finding => (
                  <IntelFindingCard
                    key={`${finding.act}-${finding.title}-${finding.link.id}`}
                    finding={finding}
                    standards={standards}
                    onPromote={handlePromote}
                  />
                ))}
              </div>
            </section>
          ))
        ) : null}

        <p className='text-[11.5px] leading-relaxed text-[var(--pv2-faint)]'>
          {t('disclaimer')}
        </p>
      </main>
    </div>
  );
};
