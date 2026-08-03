'use client';

import { Eye, PenLine } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { Tabs } from '@/components/molecules/portal-v2/Tabs';
import { ExperienceDetailsPane } from '@/components/organisms/portal-v2/experiences/ExperienceDetailsPane';
import { ExperiencePerfPane } from '@/components/organisms/portal-v2/experiences/ExperiencePerfPane';
import { ExperienceSignalsPane } from '@/components/organisms/portal-v2/experiences/ExperienceSignalsPane';
import { EXPERIENCE_DETAIL_TABS } from '@/lib/portal-v2/experiences/constants';
import {
  canEditCanvas,
  canPreview,
  formatCount,
  formatLift,
} from '@/lib/portal-v2/experiences/helpers';
import { EVIDENCE_TIER_STYLE } from '@/lib/portal-v2/experiences/roleStyles';
import type {
  ExperienceDetailTab,
  ExperienceStats,
  ExperienceView,
} from '@/lib/portal-v2/experiences/types';
import { cn } from '@/lib/cn';

type ExperienceDetailModalProps = {
  experience: ExperienceView;
  onClose: () => void;
  onPreview: (experience: ExperienceView) => void;
  onEdit: (experience: ExperienceView) => void;
};

const CATEGORY_LABEL_KEY = {
  blocks: 'catBlocks',
  collection: 'catCollection',
} as const;

const VEHICLE_LABEL_KEY = {
  curated: 'vehicleCurated',
  ads: 'vehicleAds',
  showcase: 'vehicleShowcase',
  microsite: 'vehicleMicrosite',
} as const;

const OBJECTIVE_LABEL_KEY = {
  insight: 'objInsight',
  lead: 'objLead',
  cta: 'objCta',
  convert: 'objConvert',
} as const;

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

/** One labeled read: a lift and the sessions behind it. */
const StripRead = ({
  label,
  stats,
}: {
  label: string;
  stats: ExperienceStats;
}) => {
  const t = useTranslations('portalV2.experiences');
  const up = stats.lift >= 0;

  return (
    <div className='flex min-w-0 flex-col'>
      <span className='text-[10.5px] font-semibold tracking-[0.03em] text-[var(--pv2-faint)] uppercase'>
        {label}
      </span>
      <span className='mt-0.5 flex items-baseline gap-2'>
        <span
          className={cn(
            'font-[family-name:var(--pv2-disp)] text-[17px] font-bold tabular-nums',
            up ? 'text-[#0e9d6e]' : 'text-[#9a2436]'
          )}
        >
          {formatLift(stats.lift)}
        </span>
        <span className='text-[11.5px] text-[var(--pv2-mut)] tabular-nums'>
          {t('sessionsLabel', { count: formatCount(stats.sessions) })}
        </span>
      </span>
    </div>
  );
};

export const ExperienceDetailModal = ({
  experience,
  onClose,
  onPreview,
  onEdit,
}: ExperienceDetailModalProps) => {
  const t = useTranslations('portalV2.experiences');
  const [tab, setTab] = useState<ExperienceDetailTab>('details');

  const tabItems = useMemo(
    () =>
      EXPERIENCE_DETAIL_TABS.map(item => ({
        id: item.id,
        label: t(item.labelKey),
        count:
          item.id === 'signals'
            ? experience.coverage.trackedComponents
            : undefined,
      })),
    [t, experience.coverage.trackedComponents]
  );

  const { stats, evidence } = experience;
  const tierStyle = EVIDENCE_TIER_STYLE[evidence.tier];
  const previewable = canPreview(experience);
  const editable = canEditCanvas(experience);

  const subtitleParts = [
    t(CATEGORY_LABEL_KEY[experience.category]),
    t(VEHICLE_LABEL_KEY[experience.vehicle]),
    t(OBJECTIVE_LABEL_KEY[experience.objective]),
  ].join(' · ');

  /* Never "0 post-click sessions" — a record with no rows has no number. */
  const subtitle = stats
    ? t('detailSub', {
        meta: subtitleParts,
        sessions: formatCount(stats.sessions),
      })
    : t('detailSubUnrun', { meta: subtitleParts });

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={experience.name}
      subtitle={subtitle}
      footer={
        <>
          <Button variant='ghost' size='sm' onClick={onClose}>
            {t('close')}
          </Button>
          <span className='flex-1' />
          <Button
            variant='ghost'
            size='sm'
            disabled={!previewable}
            title={previewable ? undefined : t('previewNoSlug')}
            onClick={() => onPreview(experience)}
          >
            <Eye className='size-3.5' strokeWidth={2.2} aria-hidden />
            {t('previewLabel')}
          </Button>
          <Button
            size='sm'
            disabled={!editable}
            title={editable ? undefined : t('editExternalHint')}
            onClick={() => onEdit(experience)}
          >
            <PenLine className='size-3.5' strokeWidth={2.2} aria-hidden />
            {t('editExperience')}
          </Button>
        </>
      }
    >
      {/* THE IDENTITY STRIP — the verdict at the door, above every tab. */}
      <div className='mb-4 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-4 py-3'>
        {stats ? (
          <StripRead label={t('stripMeasured')} stats={stats} />
        ) : (
          <p className='max-w-[58ch] text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
            {t('stripNoHistory')}
          </p>
        )}

        <span
          title={t(TIER_TITLE_KEY[evidence.tier])}
          className='ml-auto inline-flex cursor-help rounded-full px-2.5 py-1 text-[9.5px] font-extrabold tracking-[0.05em] uppercase'
          style={{ color: tierStyle.fg, background: tierStyle.bg }}
        >
          {t(TIER_LABEL_KEY[evidence.tier])}
        </span>
      </div>

      <Tabs
        items={tabItems}
        value={tab}
        onChange={id => setTab(id as ExperienceDetailTab)}
        aria-label={t('detailTabsAria')}
      />

      <div className='pt-4' role='tabpanel'>
        {tab === 'details' ? (
          <ExperienceDetailsPane experience={experience} />
        ) : null}
        {tab === 'signals' ? (
          <ExperienceSignalsPane experience={experience} />
        ) : null}
        {tab === 'perf' ? <ExperiencePerfPane experience={experience} /> : null}
      </div>
    </Modal>
  );
};
