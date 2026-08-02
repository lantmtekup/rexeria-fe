'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';
import {
  JOURNEY_KINDS,
  JOURNEY_KIND_STYLE,
  entrySourceById,
} from '@/lib/portal-v2/journeys/constants';
import type { JourneyNode } from '@/lib/portal-v2/journeys/types';

type JourneyInspectorProps = {
  node: JourneyNode | null;
  branches: number;
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className='mt-2 flex gap-2 text-[11.5px] text-[var(--pv2-slate-500)]'>
    <span className='w-[66px] shrink-0 pt-px text-[9.5px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase'>
      {label}
    </span>
    <span className='min-w-0 flex-1'>{value}</span>
  </div>
);

export const JourneyInspector = ({ node, branches }: JourneyInspectorProps) => {
  const t = useTranslations('portalV2.journeys');

  if (!node) {
    return (
      <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4 py-4'>
        <p className='text-[12px] leading-relaxed text-[var(--pv2-faint)]'>
          {t('inspectorEmpty')}
        </p>
      </div>
    );
  }

  const kind = JOURNEY_KINDS[node.kind];
  const style = JOURNEY_KIND_STYLE[node.kind];
  const source = entrySourceById(node.src);
  const linked = Boolean(node.xName);
  const coverage = node.xCoverage ?? 0;

  return (
    <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4 py-4'>
      <span
        className='inline-flex rounded-full px-2.5 py-1 text-[9.5px] font-extrabold tracking-[0.05em] uppercase'
        style={{ background: style.bg, color: style.fg }}
      >
        {kind.name}
      </span>

      <h3 className='mt-2.5 font-[family-name:var(--pv2-disp)] text-[14px] font-semibold text-[var(--pv2-ink)]'>
        {node.name}
      </h3>
      <p className='mt-1.5 text-[12px] leading-relaxed text-[var(--pv2-mut)]'>
        {node.d || t('inspectorNoPurpose')}
      </p>

      {node.via ? <Row label={t('inspectorSystem')} value={node.via} /> : null}
      {source ? (
        <>
          <Row label={t('inspectorSource')} value={source.name} />
          <Row label={t('inspectorSignal')} value={source.sig} />
        </>
      ) : null}
      {node.kind === 'decision' ? (
        <Row
          label={t('inspectorBranches')}
          value={t('branchCount', { count: branches })}
        />
      ) : null}

      {node.kind === 'experience' ? (
        <div className='mt-3.5 border-t border-[var(--pv2-hair)] pt-3'>
          {linked ? (
            <>
              <p className='font-[family-name:var(--pv2-disp)] text-[13px] font-semibold text-[var(--pv2-ink)]'>
                {node.xName}
              </p>
              <p
                className={cn(
                  'mt-1 text-[11.5px]',
                  coverage > 0
                    ? 'text-[var(--pv2-mut)]'
                    : 'font-semibold text-[#9a2436]'
                )}
              >
                {coverage > 0
                  ? t('inspectorCoverage', { pct: coverage })
                  : t('inspectorUntracked')}
              </p>
            </>
          ) : (
            <p className='text-[11.5px] leading-relaxed font-semibold text-[#9a2436]'>
              {t('inspectorNoLink')}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
};
