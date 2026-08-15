'use client';

import { useTranslations } from 'next-intl';

import { formatCount, formatLift } from '@/lib/portal-v2/experiences/helpers';
import { EVIDENCE_TIER_STYLE } from '@/lib/portal-v2/experiences/roleStyles';
import type { EvidenceTier } from '@/lib/portal-v2/experiences/types';
import { ARCHITECT_ROLE_LABEL } from '@/lib/portal-v2/journeys/constants';
import type {
  JourneyEditorPendingAction,
  JourneyExperienceLink,
  JourneyReview,
} from '@/lib/portal-v2/journeys/types';
import { cn } from '@/lib/cn';

/** BE có thể trả một hạng chưa biết trong tương lai — rơi về `unmeasured`. */
const knownTier = (tier: string): EvidenceTier =>
  tier === 'high' || tier === 'directional' || tier === 'early'
    ? tier
    : 'unmeasured';

const TIER_LABEL_KEY: Record<EvidenceTier, string> = {
  high: 'evHigh',
  directional: 'evDirectional',
  early: 'evEarly',
  unmeasured: 'evUnmeasured',
};

type JourneyArchitectCardProps = {
  review: JourneyReview | null;
  onApply: (action: JourneyEditorPendingAction) => void;
};

/**
 * "What would improve it" — engine THẬT ở BE (`GET /journeys/{id}/review`,
 * `core.JourneyReviewScore`/`core.DecideNextBest`). Component chỉ vẽ lại,
 * không tự chấm điểm hay tự nghĩ ra gợi ý.
 */
export const JourneyArchitectCard = ({
  review,
  onApply,
}: JourneyArchitectCardProps) => {
  const t = useTranslations('portalV2.journeys');
  const te = useTranslations('portalV2.experiences');

  if (!review) return null;

  const tier = knownTier(review.confidenceTier);
  const tierStyle = EVIDENCE_TIER_STYLE[tier];
  const { nextBest } = review;

  const applyDetail = () => {
    if (!nextBest.detail?.experienceId || !nextBest.detail.experienceName)
      return;
    const link: JourneyExperienceLink = {
      id: nextBest.detail.experienceId,
      name: nextBest.detail.experienceName,
      coverage: nextBest.detail.experienceCoverage ?? 0,
    };
    if (nextBest.mode === 'add') {
      onApply({ type: 'add', link });
    } else if (nextBest.mode === 'strengthen' && nextBest.detail.nodeKey) {
      onApply({ type: 'swap', nodeId: nextBest.detail.nodeKey, link });
    }
  };

  return (
    <div className='mt-6 border-t border-[var(--pv2-hair)] pt-5'>
      <h3 className='font-[family-name:var(--pv2-disp)] text-[15px] font-semibold text-[var(--pv2-ink)]'>
        {t('archTitle')}
      </h3>

      <div className='mt-3 flex flex-wrap items-center gap-x-4 gap-y-2'>
        <span
          title={t('archScoreTitle', {
            contract: review.parts.contract,
            contractMax: review.weights.contract,
            evidence: review.parts.evidence,
            evidenceMax: review.weights.evidence,
            structure: review.parts.structure,
            structureMax: review.weights.structure,
          })}
          className='inline-flex cursor-help items-baseline gap-1 rounded-full border border-[var(--pv2-hair)] px-2.5 py-1'
        >
          <b className='font-[family-name:var(--pv2-disp)] text-[15px] font-bold text-[var(--pv2-ink)] tabular-nums'>
            {review.score}
          </b>
          <span className='text-[10.5px] text-[var(--pv2-faint)]'>
            {t('archScoreOf100')}
          </span>
        </span>

        <span
          title={te(`${TIER_LABEL_KEY[tier]}Title`)}
          className='inline-flex cursor-help rounded-full px-2 py-[3px] text-[9px] font-extrabold tracking-[0.05em] uppercase'
          style={{ color: tierStyle.fg, background: tierStyle.bg }}
        >
          {te(TIER_LABEL_KEY[tier])}
        </span>
      </div>

      {review.stageReads.length ? (
        <div className='mt-3 flex flex-col gap-1.5'>
          {review.stageReads.map(read => (
            <div
              key={read.nodeKey}
              className='flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px]'
            >
              <span className='text-[10.5px] font-bold tracking-[0.05em] text-[var(--pv2-faint)] uppercase'>
                {ARCHITECT_ROLE_LABEL[read.role] ?? read.role}
              </span>
              {read.lift === null ? (
                <span className='text-[var(--pv2-faint)]'>
                  {t('archStageUnmeasured')}
                </span>
              ) : (
                <>
                  <span
                    className={cn(
                      'font-semibold tabular-nums',
                      read.lift >= 0 ? 'text-[#0e9d6e]' : 'text-[#9a2436]'
                    )}
                  >
                    {formatLift(read.lift)}
                  </span>
                  <span className='text-[var(--pv2-faint)] tabular-nums'>
                    {t('sessionsAssisted', {
                      count: formatCount(read.sessions),
                    })}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      ) : null}

      <div className='mt-4 rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] p-3.5'>
        <p className='text-[11px] font-bold tracking-[0.05em] text-[var(--pv2-faint)] uppercase'>
          {t('archNextBestTitle')}
        </p>
        {nextBest.mode === 'none' || !nextBest.detail ? (
          <p className='mt-1.5 text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
            {nextBest.noneReason || t('archNextBestNone')}
          </p>
        ) : (
          <>
            <p className='mt-1.5 text-[12.5px] leading-relaxed text-[var(--pv2-ink)]'>
              {nextBest.detail.reason}
            </p>
            {nextBest.detail.experienceId ? (
              <button
                type='button'
                onClick={applyDetail}
                className='mt-2.5 inline-flex cursor-pointer items-center rounded-full border border-[var(--pv2-violet)] px-3 py-1.5 text-[11.5px] font-semibold text-[var(--pv2-violet)] transition-colors hover:bg-[color-mix(in_srgb,var(--pv2-violet)_10%,transparent)]'
              >
                {nextBest.mode === 'add'
                  ? t('archPlaceOnCanvas')
                  : t('archSwapOnCanvas')}
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};
