'use client';

import { Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { KeyboardEvent, MouseEvent } from 'react';

import { ExperienceCover } from '@/components/organisms/portal-v2/experiences/ExperienceCover';
import { ExperienceEvidence } from '@/components/organisms/portal-v2/experiences/ExperienceEvidence';
import { ExperienceMeta } from '@/components/organisms/portal-v2/experiences/ExperienceMeta';
import { canPreview } from '@/lib/portal-v2/experiences/helpers';
import type { ExperienceView } from '@/lib/portal-v2/experiences/types';
import { cn } from '@/lib/cn';

type ExperienceCardProps = {
  experience: ExperienceView;
  onOpen: (experience: ExperienceView) => void;
  onPreview: (experience: ExperienceView) => void;
};

const cardShell = cn(
  'group flex cursor-pointer flex-col overflow-hidden rounded-[var(--pv2-r)]',
  'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]',
  'transition-[box-shadow,border-color] duration-[140ms]',
  'hover:border-[color-mix(in_srgb,var(--pv2-violet)_35%,var(--pv2-hair))] hover:shadow-[var(--pv2-sh-soft)]',
  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2 focus-visible:outline-none'
);

export const ExperienceCard = ({
  experience,
  onOpen,
  onPreview,
}: ExperienceCardProps) => {
  const t = useTranslations('portalV2.experiences');

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    /* The cover's Preview button lives inside the card's click target. */
    if ((e.target as HTMLElement).closest('[data-experience-preview]')) return;
    onOpen(experience);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(experience);
    }
  };

  return (
    <article
      role='button'
      tabIndex={0}
      aria-label={t('openExperience', { name: experience.name })}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cardShell}
    >
      <ExperienceCover
        experience={experience}
        showPreview={canPreview(experience)}
        onPreview={() => onPreview(experience)}
      />

      {/* Three rows, one job each: what it is · how it is classified · what it
          has earned. Anything quieter than that lives in the footer. */}
      <div className='flex flex-1 flex-col gap-2.5 px-3.5 pt-3 pb-3.5'>
        <div className='flex min-w-0 flex-col gap-0.5'>
          <h3 className='truncate text-left text-[14px] font-semibold tracking-[-0.01em] text-[var(--pv2-ink)]'>
            {experience.name}
          </h3>
          {/* The slug, not the name, is what identifies a page in the wild —
              and two pages can share a name. A block has no slug; its type code
              is the equivalent stable identifier, and it is what a user would
              search for. */}
          <p className='truncate font-mono text-[11px] text-[var(--pv2-faint)]'>
            {experience.kind === 'block'
              ? (experience.typeCode ?? '—')
              : experience.slug
                ? `/${experience.slug}`
                : t('noSlug')}
          </p>
        </div>

        <ExperienceMeta experience={experience} />

        <div className='mt-auto'>
          <ExperienceEvidence experience={experience} />
        </div>
      </div>

      <div className='flex items-center gap-2 border-t border-[var(--pv2-hair)] px-3.5 py-2.5 text-[11px] text-[var(--pv2-faint)]'>
        <Layers className='size-3.5 shrink-0' strokeWidth={2.2} aria-hidden />
        {/* A block IS one layer, so counting its blocks says nothing — it
            reports its instrumentation and stops there. */}
        <span className='truncate'>
          {experience.kind === 'block'
            ? t('cardFooterMetaBlock', { pct: experience.coverage.pct })
            : t('cardFooterMeta', {
                layers: experience.layers.length,
                pct: experience.coverage.pct,
              })}
        </span>
        <span className='flex-1' />
        <span className='shrink-0 tabular-nums'>{experience.updatedLabel}</span>
      </div>
    </article>
  );
};
