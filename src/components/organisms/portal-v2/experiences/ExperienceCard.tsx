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
              and two pages can share a name. */}
          <div className='flex min-w-0 items-center gap-1.5'>
            <p className='truncate font-mono text-[11px] text-[var(--pv2-faint)]'>
              {experience.slug ? `/${experience.slug}` : t('noSlug')}
            </p>
            {/*
              Trạng thái đứng cạnh slug vì hai thứ này chỉ có nghĩa cùng nhau:
              `/{slug}` của một bản NHÁP trả 404 — nó chưa có Release nào để
              phục vụ. Thẻ trước đây in slug như thể địa chỉ nào cũng mở được,
              nên không cách nào biết trang nào thật sự đang sống.
            */}
            <span
              className={cn(
                'shrink-0 rounded-full px-1.5 py-px text-[10px] font-semibold tracking-[0.02em] uppercase',
                experience.status === 'published'
                  ? 'bg-[color-mix(in_srgb,var(--pv2-success)_14%,transparent)] text-[#15803d]'
                  : experience.status === 'archived'
                    ? 'bg-[var(--pv2-canvas)] text-[var(--pv2-faint)]'
                    : 'bg-[color-mix(in_srgb,var(--pv2-warning)_18%,transparent)] text-[#b45309]'
              )}
            >
              {experience.status === 'published'
                ? t('statusPublished')
                : experience.status === 'archived'
                  ? t('statusArchived')
                  : t('statusDraft')}
            </span>
          </div>
        </div>

        <ExperienceMeta experience={experience} />

        <div className='mt-auto'>
          <ExperienceEvidence experience={experience} />
        </div>
      </div>

      <div className='flex items-center gap-2 border-t border-[var(--pv2-hair)] px-3.5 py-2.5 text-[11px] text-[var(--pv2-faint)]'>
        <Layers className='size-3.5 shrink-0' strokeWidth={2.2} aria-hidden />
        <span className='truncate'>
          {/*
            `coveragePct` null = BE nói loại này KHÔNG đo được. Bản cũ luôn có
            số vì nó bốc từ hàm băm id; giờ thiếu thì nói thiếu.

            Đếm VAI PHỄU, không đếm block: danh sách không trả số block, và
            `funnel_coverage` là tối đa 5 chữ vai. Ghi "5 layer" ở đây rồi mở
            ra thấy 7 block là đúng kiểu vênh thẻ-với-chi-tiết mà journey đang
            mắc (62% ngoài thẻ / 33% khi mở).
          */}
          {experience.coveragePct !== null
            ? t('cardFooterMeta', {
                roles: experience.funnelRoles.length,
                pct: experience.coveragePct,
              })
            : t('cardFooterUnmeasured')}
        </span>
        <span className='flex-1' />
        <span className='shrink-0 tabular-nums'>{experience.updatedLabel}</span>
      </div>
    </article>
  );
};
