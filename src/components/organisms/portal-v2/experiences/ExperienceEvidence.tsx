'use client';

import { useTranslations } from 'next-intl';

import { formatCount, formatLift } from '@/lib/portal-v2/experiences/helpers';
import { EVIDENCE_TIER_STYLE } from '@/lib/portal-v2/experiences/roleStyles';
import type { ExperienceView } from '@/lib/portal-v2/experiences/types';
import { cn } from '@/lib/cn';

type ExperienceEvidenceProps = {
  experience: ExperienceView;
};

const TIER_LABEL_KEY = {
  high: 'evHigh',
  directional: 'evDirectional',
  early: 'evEarly',
  unmeasured: 'evUnmeasured',
} as const;

const TIER_TITLE_KEY = {
  high: 'evHighTitle',
  directional: 'evDirectionalTitle',
  early: 'evEarlyTitle',
  unmeasured: 'evUnmeasuredTitle',
} as const;

/**
 * The evidence read.
 *
 * A record that has never run shows "Not yet run" — never a zero and never a
 * `+0%`. It has no fact rows behind it, so it has no numbers; reporting one
 * would be inventing it.
 */
export const ExperienceEvidence = ({ experience }: ExperienceEvidenceProps) => {
  const t = useTranslations('portalV2.experiences');
  const { stats, evidence } = experience;

  /* No fact rows behind it ⇒ no numbers. Not a zero — nothing. */
  if (!stats) {
    return (
      <div className='flex flex-wrap items-center gap-1.5'>
        <span
          title={t('notYetRunTitle')}
          className='inline-flex cursor-help rounded-full bg-[var(--pv2-canvas)] px-2 py-[2.5px] text-[9px] font-extrabold tracking-[0.05em] text-[var(--pv2-faint)] uppercase'
        >
          {t('notYetRun')}
        </span>
      </div>
    );
  }

  const tierStyle = EVIDENCE_TIER_STYLE[evidence.tier];
  const liftUp = stats.lift >= 0;

  return (
    <div className='flex flex-wrap items-center gap-1.5'>
      <span
        title={t(TIER_TITLE_KEY[evidence.tier])}
        className='inline-flex cursor-help rounded-full px-2 py-[2.5px] text-[9px] font-extrabold tracking-[0.05em] uppercase'
        style={{ color: tierStyle.fg, background: tierStyle.bg }}
      >
        {t(TIER_LABEL_KEY[evidence.tier])}
      </span>

      <span
        title={t('liftTitle')}
        className={cn(
          'cursor-help text-[12px] font-bold tabular-nums',
          liftUp ? 'text-[#0e9d6e]' : 'text-[#9a2436]'
        )}
      >
        {formatLift(stats.lift)}
      </span>

      <span className='text-[11px] text-[var(--pv2-faint)] tabular-nums'>
        {t('sessionsLabel', { count: formatCount(stats.sessions) })}
      </span>
    </div>
  );
};
