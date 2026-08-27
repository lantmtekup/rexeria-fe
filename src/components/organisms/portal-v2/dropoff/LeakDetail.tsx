'use client';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import { formatMoney } from '@/lib/portal-v2/format';
import type {
  AuditDropoff,
  AuditLeak,
  AuditSource,
} from '@/lib/portal-v2/journey-audit/types';

type LeakDetailProps = {
  leak: AuditLeak;
  dropoff: AuditDropoff;
  sources: AuditSource[];
  stageName: string | null;
  tpName: string;
  tpScore: number | null;
  onOpenTouchpoint: () => void;
};

/** Panel chẩn đoán một leak: meta pills, narrative, evidence theo nguồn, fix. */
export const LeakDetail = ({
  leak,
  dropoff,
  sources,
  stageName,
  tpName,
  tpScore,
  onOpenTouchpoint,
}: LeakDetailProps) => {
  const t = useTranslations('portalV2.dropoff');
  const fromLabel = dropoff.steps[leak.fromStep]?.label ?? '';
  const toLabel = dropoff.steps[leak.toStep]?.label ?? '';

  return (
    <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-5 py-5'>
      <p className='text-2xs font-bold tracking-[0.12em] text-[var(--pv2-electric)] uppercase'>
        {fromLabel} → {toLabel}
        {stageName ? ` · ${t('happensAt', { stage: stageName })}` : ''}
      </p>
      <h2 className='mt-1.5 font-[family-name:var(--pv2-disp)] text-[22px] leading-tight font-extrabold tracking-[-0.01em] text-[var(--pv2-ink)]'>
        {leak.title}
      </h2>
      <div className='my-3.5 flex flex-wrap items-center gap-2.5'>
        <span className='text-2xs rounded-full bg-[color-mix(in_srgb,var(--pv2-error)_10%,var(--pv2-paper))] px-2.5 py-1 font-bold text-[var(--pv2-error)]'>
          {t('pillRisk', { amount: formatMoney(leak.usd) })}
        </span>
        <span className='text-2xs rounded-full bg-[color-mix(in_srgb,var(--pv2-success)_10%,var(--pv2-paper))] px-2.5 py-1 font-bold text-[var(--pv2-success)]'>
          {t('pillConf', { conf: leak.confidence })}
        </span>
        <span className='text-2xs rounded-full bg-[var(--pv2-electric-soft)] px-2.5 py-1 font-bold text-[var(--pv2-electric)]'>
          {t('pillRec', { range: leak.recoveryRange })}
        </span>
        {tpScore != null ? (
          <span className='text-2xs rounded-full bg-[var(--pv2-canvas)] px-2.5 py-1 font-bold text-[var(--pv2-mut)]'>
            {t('pillTp', { name: tpName, score: tpScore })}
          </span>
        ) : null}
      </div>
      <p className='border-b border-[var(--pv2-hair)] pb-3.5 text-[13.5px] leading-relaxed text-[var(--pv2-ink)]'>
        {leak.narrative}
      </p>

      <h4 className='text-3xs mt-4 mb-2 font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
        {t('evidenceTitle')}
      </h4>
      {leak.evidence.map(item => {
        const source = sources.find(
          s => s.id === item.sourceId || s.provider === item.sourceId
        );
        // "Evidence unavailable" chỉ khi nguồn CÓ trong catalog nhưng đã ngắt;
        // nguồn lạ (vd "snapshot" của BE) vẽ dòng trung tính.
        const off = source != null && source.status === 'available';
        if (off) {
          return (
            <p
              key={item.text}
              className='mb-2 flex items-start gap-2.5 rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-3 py-2.5 text-xs leading-relaxed text-[var(--pv2-faint)]'
            >
              <span aria-hidden>🔌</span>
              <span>
                {t('evidenceUnavailable', {
                  name: source?.name ?? item.sourceId,
                })}
              </span>
            </p>
          );
        }
        return (
          <p
            key={item.text}
            className='mb-2 flex items-start gap-2.5 rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] px-3 py-2.5 text-xs leading-relaxed text-[var(--pv2-ink)]'
          >
            <span
              aria-hidden
              className='grid size-[26px] shrink-0 place-items-center rounded-[7px] bg-[var(--pv2-canvas)] text-[13px]'
            >
              {source?.icon ?? '📸'}
            </span>
            <span>
              {item.text}
              <br />
              <span className='text-3xs text-[var(--pv2-faint)]'>
                {source?.name ?? item.sourceId}
                {source?.status === 'attention'
                  ? ` · ⚠ ${t('evidenceStale')}`
                  : ''}
              </span>
            </span>
          </p>
        );
      })}

      <h4 className='text-3xs mt-4 mb-2 font-bold tracking-[0.12em] text-[var(--pv2-faint)] uppercase'>
        {t('fixTitle')}
      </h4>
      <div className='rounded-[var(--pv2-r)] border border-[color-mix(in_srgb,var(--pv2-electric)_25%,var(--pv2-hair))] bg-[var(--pv2-electric-soft)] px-3.5 py-3 text-xs leading-relaxed text-[var(--pv2-ink)]'>
        <b className='text-2xs mb-1.5 block font-bold tracking-[0.08em] text-[var(--pv2-electric)] uppercase'>
          ◆ {t('fixLabel')}
        </b>
        {leak.fix}
      </div>

      <div className='mt-4 flex flex-wrap gap-2.5'>
        {tpName ? (
          <Button variant='primary' onClick={onOpenTouchpoint}>
            {t('openTpInJourney', { name: tpName })}
          </Button>
        ) : null}
        <Button
          variant='ghost'
          onClick={() =>
            toast(t('toastOpportunity', { amount: formatMoney(leak.usd) }))
          }
        >
          {t('createOpportunity')}
        </Button>
      </div>
    </div>
  );
};
