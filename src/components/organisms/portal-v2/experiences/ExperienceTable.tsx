'use client';

import { Copy, Eye, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { canPreview } from '@/lib/portal-v2/experiences/helpers';
import { EVIDENCE_TIER_STYLE } from '@/lib/portal-v2/experiences/roleStyles';
import type { ExperienceView } from '@/lib/portal-v2/experiences/types';
import { cn } from '@/lib/cn';

type ExperienceTableProps = {
  experiences: ExperienceView[];
  selected: string[];
  onToggleSelect: (experience: ExperienceView) => void;
  onToggleAll: () => void;
  onOpen: (experience: ExperienceView) => void;
  onPreview: (experience: ExperienceView) => void;
  onDuplicate: (experience: ExperienceView) => void;
  onDelete: (experience: ExperienceView) => void;
};

const headClass =
  'bg-[var(--pv2-canvas)] px-3.5 py-2.5 text-left text-[10.5px] font-bold tracking-[0.05em] text-[var(--pv2-mut)] uppercase whitespace-nowrap';

const cellClass =
  'border-b border-[var(--pv2-hair)] px-3.5 py-3 text-[12.5px] align-middle';

const actionButton = cn(
  'grid size-7 cursor-pointer place-items-center rounded-[7px] text-[var(--pv2-mut)] transition-colors',
  'hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)]',
  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
);

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

const OBJECTIVE_LABEL_KEY = {
  insight: 'objInsight',
  lead: 'objLead',
  cta: 'objCta',
  convert: 'objConvert',
} as const;

const STATUS_LABEL_KEY = {
  published: 'statusPublished',
  archived: 'statusArchived',
  draft: 'statusDraft',
} as const;

const statusClass = (status: ExperienceView['status']) =>
  status === 'published'
    ? 'bg-[color-mix(in_srgb,var(--pv2-success)_14%,transparent)] text-[#15803d]'
    : status === 'archived'
      ? 'bg-[var(--pv2-canvas)] text-[var(--pv2-faint)]'
      : 'bg-[color-mix(in_srgb,var(--pv2-warning)_18%,transparent)] text-[#b45309]';

/**
 * Chế độ xem dạng bảng — prototype `xview:table`.
 *
 * Bảng KHÔNG phải thẻ xếp dọc. Nó tồn tại để so sánh nhiều dòng theo cùng một
 * cột, nên chỗ này bày đúng những trục người ta cần đối chiếu (trạng thái, mục
 * tiêu, bậc bằng chứng, độ phủ) thay vì ảnh bìa.
 *
 * Cột **Bằng chứng** in thẳng `evidence.tier`. Thẻ không in được nó: thẻ đi qua
 * `ExperienceEvidence`, mà component đó thoát sớm khi `stats === null` — và
 * `stats` LUÔN null ở danh sách (số đo nằm ở `GET /experiences/{id}/stats`).
 * Còn `ev` thì danh sách có thật, do BE suy từ fact row. Đây cũng đúng là trục
 * mà nút xếp hạng sắp theo, nên bật xếp hạng ở chế độ bảng thì nhìn ra ngay
 * thứ tự có hợp lý không.
 */
export const ExperienceTable = ({
  experiences,
  selected,
  onToggleSelect,
  onToggleAll,
  onOpen,
  onPreview,
  onDuplicate,
  onDelete,
}: ExperienceTableProps) => {
  const t = useTranslations('portalV2.experiences');
  // Theo ID, không theo số lượng — khớp với `toggleAllVisible` của workspace.
  const allSelected =
    experiences.length > 0 && experiences.every(e => selected.includes(e.id));

  return (
    <div className='overflow-x-auto rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
      <table className='w-full border-collapse'>
        <thead>
          <tr>
            <th className={cn(headClass, 'w-[34px]')}>
              <input
                type='checkbox'
                checked={allSelected}
                onChange={onToggleAll}
                aria-label={t('selectAll')}
                className='size-3.5 cursor-pointer accent-[var(--pv2-electric)]'
              />
            </th>
            <th className={headClass}>{t('colName')}</th>
            <th className={headClass}>{t('colStatus')}</th>
            <th className={headClass}>{t('colObjective')}</th>
            <th className={headClass}>{t('colEvidence')}</th>
            <th className={headClass}>{t('colCoverage')}</th>
            <th className={headClass}>{t('colUpdated')}</th>
            <th className={cn(headClass, 'w-[112px]')}>
              <span className='sr-only'>{t('colActions')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {experiences.map(experience => {
            const tier = experience.evidence.tier;
            const tierStyle = EVIDENCE_TIER_STYLE[tier];
            const isSelected = selected.includes(experience.id);

            return (
              <tr
                key={experience.id}
                className={cn(
                  'cursor-pointer transition-colors hover:bg-[var(--pv2-canvas)]',
                  isSelected &&
                    'bg-[color-mix(in_srgb,var(--pv2-electric)_7%,transparent)]'
                )}
                onClick={e => {
                  if ((e.target as HTMLElement).closest('[data-row-action]')) {
                    return;
                  }
                  onOpen(experience);
                }}
              >
                <td className={cellClass} data-row-action>
                  <input
                    type='checkbox'
                    checked={isSelected}
                    onChange={() => onToggleSelect(experience)}
                    aria-label={t('selectExperience', {
                      name: experience.name,
                    })}
                    className='size-3.5 cursor-pointer accent-[var(--pv2-electric)]'
                  />
                </td>

                <td className={cellClass}>
                  <div className='flex min-w-0 flex-col gap-0.5'>
                    <span className='truncate font-semibold text-[var(--pv2-ink)]'>
                      {experience.name}
                    </span>
                    <span className='truncate font-mono text-[11px] text-[var(--pv2-faint)]'>
                      {experience.slug ? `/${experience.slug}` : t('noSlug')}
                    </span>
                  </div>
                </td>

                <td className={cellClass}>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-1.5 py-px text-[10px] font-semibold tracking-[0.02em] uppercase',
                      statusClass(experience.status)
                    )}
                  >
                    {t(STATUS_LABEL_KEY[experience.status])}
                  </span>
                </td>

                <td
                  className={cn(
                    cellClass,
                    'whitespace-nowrap text-[var(--pv2-mut)]'
                  )}
                >
                  {t(OBJECTIVE_LABEL_KEY[experience.objective])}
                </td>

                <td className={cellClass}>
                  <span
                    title={t(TIER_TITLE_KEY[tier])}
                    style={{ color: tierStyle.fg, background: tierStyle.bg }}
                    className='inline-flex cursor-help rounded-full px-2 py-[2.5px] text-[9px] font-extrabold tracking-[0.05em] uppercase'
                  >
                    {t(TIER_LABEL_KEY[tier])}
                  </span>
                </td>

                {/*
                  `null` = BE nói loại này KHÔNG đo được, và nó cố ý bỏ trường
                  đi thay vì trả 0. In "0%" ở đây đọc như "đã đo và trượt hết".
                */}
                <td
                  className={cn(
                    cellClass,
                    'text-[var(--pv2-mut)] tabular-nums'
                  )}
                >
                  {experience.coveragePct !== null
                    ? `${experience.coveragePct}%`
                    : '—'}
                </td>

                <td
                  className={cn(
                    cellClass,
                    'whitespace-nowrap text-[var(--pv2-faint)] tabular-nums'
                  )}
                >
                  {experience.updatedLabel}
                </td>

                <td className={cellClass} data-row-action>
                  <div className='flex items-center gap-0.5'>
                    {canPreview(experience) ? (
                      <button
                        type='button'
                        onClick={() => onPreview(experience)}
                        title={t('preview')}
                        aria-label={t('previewExperience', {
                          name: experience.name,
                        })}
                        className={actionButton}
                      >
                        <Eye
                          className='size-3.5'
                          strokeWidth={2.2}
                          aria-hidden
                        />
                      </button>
                    ) : null}
                    <button
                      type='button'
                      onClick={() => onDuplicate(experience)}
                      title={t('duplicate')}
                      aria-label={t('duplicateExperience', {
                        name: experience.name,
                      })}
                      className={actionButton}
                    >
                      <Copy
                        className='size-3.5'
                        strokeWidth={2.2}
                        aria-hidden
                      />
                    </button>
                    <button
                      type='button'
                      onClick={() => onDelete(experience)}
                      title={t('delete')}
                      aria-label={t('deleteExperience', {
                        name: experience.name,
                      })}
                      className={cn(
                        actionButton,
                        'hover:text-[var(--pv2-error)]'
                      )}
                    >
                      <Trash2
                        className='size-3.5'
                        strokeWidth={2.2}
                        aria-hidden
                      />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
