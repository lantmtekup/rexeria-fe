'use client';

import { Eye } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { GeneratedPageThumb } from '@/components/molecules/portal-v2/GeneratedPageThumb';
import type { ExperienceView } from '@/lib/portal-v2/experiences/types';
import { cn } from '@/lib/cn';

type ExperienceCoverProps = {
  experience: ExperienceView;
  /** Fixed height override (modal). Cards use the responsive clamp. */
  height?: number;
  showPreview?: boolean;
  onPreview?: () => void;
  className?: string;
};

/**
 * The card cover — the page's real thumbnail when it has one, otherwise a
 * generated frame whose artwork is the funnel stack itself: a one-block page
 * draws one bar, a five-block page draws five.
 *
 * `thumbnail_url` is empty on most pages in practice, so the generated path is
 * the common one, not the fallback.
 */
export const ExperienceCover = ({
  experience,
  height,
  showPreview = false,
  onPreview,
  className,
}: ExperienceCoverProps) => {
  const t = useTranslations('portalV2.experiences');
  const thumb = experience.thumbnailUrl;

  return (
    <div
      className={cn(
        'group/cover relative overflow-hidden',
        !thumb && 'bg-(--pv2-electric-soft)',
        !height &&
          'aspect-[16/10] max-h-[clamp(140px,28vw,200px)] w-full border-b border-[var(--pv2-hair)]',
        className
      )}
      style={height ? { height } : undefined}
    >
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt=''
          className='absolute inset-0 size-full object-cover'
        />
      ) : (
        <GeneratedPageThumb />
      )}

      {showPreview && onPreview ? (
        <button
          type='button'
          data-experience-preview='true'
          aria-label={t('previewExperience', { name: experience.name })}
          tabIndex={0}
          onPointerDown={e => {
            e.stopPropagation();
          }}
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            onPreview();
          }}
          onKeyDown={e => {
            e.stopPropagation();
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onPreview();
            }
          }}
          className={cn(
            'absolute top-1/2 left-1/2 z-[1] inline-flex shrink-0 -translate-x-1/2 -translate-y-1/2 items-center gap-1.5',
            'rounded-[10px] border-0 bg-[rgba(255,255,255,0.94)] px-[15px] py-[9px] whitespace-nowrap',
            'text-[12.5px] font-semibold text-[var(--pv2-ink)] shadow-[var(--pv2-sh-soft)]',
            'backdrop-blur-[4px] transition-opacity duration-150',
            'opacity-0 group-hover:opacity-100',
            'hover:bg-[var(--pv2-paper)]',
            'focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
          )}
        >
          <Eye className='size-3.5 shrink-0' strokeWidth={2} aria-hidden />
          {t('previewLabel')}
        </button>
      ) : null}
    </div>
  );
};
