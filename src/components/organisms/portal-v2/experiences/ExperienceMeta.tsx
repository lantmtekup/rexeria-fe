'use client';

import { useTranslations } from 'next-intl';

import { objectivePillStyle } from '@/lib/portal-v2/experiences/roleStyles';
import type { ExperienceView } from '@/lib/portal-v2/experiences/types';

type ExperienceMetaProps = {
  experience: ExperienceView;
};

const OBJECTIVE_LABEL_KEY = {
  insight: 'objInsight',
  lead: 'objLead',
  cta: 'objCta',
  convert: 'objConvert',
} as const;

const VEHICLE_LABEL_KEY = {
  curated: 'vehicleCurated',
  ads: 'vehicleAds',
  showcase: 'vehicleShowcase',
  microsite: 'vehicleMicrosite',
} as const;

/**
 * How this record is classified — the two axes you can also filter by, so what
 * the chips say matches what the toolbar does.
 *
 * The second chip follows the kind, because the filters do: a page is filtered
 * by vehicle, a block by its catalog type. Showing a block a seeded "Microsite"
 * chip it cannot be narrowed on would be a label with nothing behind it.
 *
 * Coverage and layer count used to sit here too. They are quieter facts and
 * moved to the card footer; three competing chip weights on one line read as
 * noise rather than hierarchy.
 */
export const ExperienceMeta = ({ experience }: ExperienceMetaProps) => {
  const t = useTranslations('portalV2.experiences');
  const pill = objectivePillStyle(experience.objective);

  const isBlock = experience.kind === 'block';
  const secondary = isBlock
    ? (experience.typeLabel ?? experience.typeCode ?? null)
    : t(VEHICLE_LABEL_KEY[experience.vehicle]);

  return (
    <div className='flex flex-wrap items-center gap-1.5'>
      <span
        className='inline-flex items-center rounded-full px-2 py-[3px] text-[9.5px] font-bold tracking-[0.05em] uppercase'
        style={{ background: pill.bg, color: pill.fg }}
      >
        {t(OBJECTIVE_LABEL_KEY[experience.objective])}
      </span>

      {secondary ? (
        <span className='inline-flex max-w-full items-center truncate rounded-full border border-[var(--pv2-hair)] px-2 py-[2.5px] text-[10.5px] font-medium text-[var(--pv2-mut)]'>
          {secondary}
        </span>
      ) : null}

      {isBlock && (experience.usageCount ?? 0) > 0 ? (
        <span className='inline-flex items-center rounded-full border border-[var(--pv2-hair)] px-2 py-[2.5px] text-[10.5px] font-medium text-[var(--pv2-mut)]'>
          {t('blockUsageCount', { count: experience.usageCount ?? 0 })}
        </span>
      ) : null}
    </div>
  );
};
