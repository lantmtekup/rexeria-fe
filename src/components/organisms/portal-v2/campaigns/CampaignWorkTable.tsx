'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  StageBar,
  SubjectBadge,
} from '@/components/molecules/portal-v2/campaigns-form';
import { cn } from '@/lib/cn';
import {
  fmtDate,
  isLate,
  subjectName,
} from '@/lib/portal-v2/campaigns/helpers';
import type { CampaignItem } from '@/lib/portal-v2/campaigns/types';
import type { ExperienceView } from '@/lib/portal-v2/experiences/types';

type CampaignWorkTableProps = {
  items: CampaignItem[];
  productNames: Record<string, string>;
  experiences: ExperienceView[];
  /** `YYYY-MM-DD` — passed in so the overdue check stays deterministic. */
  today: string;
  editing: boolean;
  onOpenItem: (index: number) => void;
  onDeleteItem: (index: number) => void;
  onAddItem: () => void;
};

const headClass =
  'bg-[var(--pv2-canvas)] px-3.5 py-2.5 text-left text-[10.5px] font-bold tracking-[0.05em] text-[var(--pv2-mut)] uppercase whitespace-nowrap';

const cellClass =
  'border-b border-[var(--pv2-hair)] px-3.5 py-3 text-[12.5px] align-middle';

/** "The work" — one row per subject, the status axis the plan says is missing. */
export const CampaignWorkTable = ({
  items,
  productNames,
  experiences,
  today,
  editing,
  onOpenItem,
  onDeleteItem,
  onAddItem,
}: CampaignWorkTableProps) => {
  const t = useTranslations('portalV2.campaigns');

  return (
    <div className='overflow-x-auto rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
      <table className='w-full border-collapse'>
        <thead>
          <tr>
            <th className={headClass}>{t('colSubject')}</th>
            <th className={headClass}>{t('colExperience')}</th>
            <th className={headClass}>{t('colStage')}</th>
            <th className={headClass}>{t('colOwner')}</th>
            <th className={headClass}>{t('colDue')}</th>
            {editing ? (
              <th className={cn(headClass, 'w-[56px]')}>
                <span className='sr-only'>{t('colActions')}</span>
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const name = subjectName(item, productNames);
            const late = isLate(item, today);
            const attached = item.expIds
              .map(id => experiences.find(e => e.id === id))
              .filter((e): e is ExperienceView => Boolean(e));

            return (
              <tr
                key={item.id}
                onClick={() => onOpenItem(index)}
                className='group cursor-pointer transition-colors hover:bg-[var(--pv2-canvas)]'
              >
                <td className={cellClass}>
                  <span className='flex min-w-[220px] flex-col gap-1'>
                    <span className='flex items-center gap-2'>
                      <span className='truncate text-[13px] font-semibold text-[var(--pv2-ink)]'>
                        {name || t('untitledSubject')}
                      </span>
                      <SubjectBadge>
                        {item.kind === 'topic'
                          ? t('kindTopic')
                          : t('kindProduct')}
                      </SubjectBadge>
                    </span>
                    <span className='truncate text-[11px] text-[var(--pv2-faint)]'>
                      {item.note || t('noItemNote')}
                    </span>
                  </span>
                </td>

                <td className={cellClass}>
                  {attached.length ? (
                    <span className='flex flex-wrap gap-1.5'>
                      {attached.map(experience => (
                        <span
                          key={experience.id}
                          className='inline-flex max-w-[190px] items-center rounded-[6px] border-l-[3px] border-[var(--pv2-electric)] bg-[var(--pv2-canvas)] px-2 py-1 text-[11px] font-medium text-[var(--pv2-ink)]'
                        >
                          <span className='truncate'>{experience.name}</span>
                        </span>
                      ))}
                    </span>
                  ) : item.expIds.length ? (
                    <span className='text-[11.5px] text-[var(--pv2-faint)]'>
                      {t('experienceCount', { count: item.expIds.length })}
                    </span>
                  ) : (
                    <span className='text-[11.5px] text-[var(--pv2-faint)]'>
                      {t('notBuilt')}
                    </span>
                  )}
                </td>

                <td className={cellClass}>
                  <StageBar status={item.status} />
                </td>

                <td className={cn(cellClass, 'whitespace-nowrap')}>
                  <span
                    className={cn(
                      !item.owner.trim() &&
                        'font-semibold text-[var(--pv2-error)]'
                    )}
                  >
                    {item.owner.trim() || t('unassigned')}
                  </span>
                </td>

                <td className={cn(cellClass, 'whitespace-nowrap')}>
                  <span
                    className={cn(
                      late && 'font-semibold text-[var(--pv2-error)]'
                    )}
                  >
                    {item.due ? fmtDate(item.due) : t('shipped')}
                  </span>
                  {late ? (
                    <span className='block text-[10.5px] text-[var(--pv2-error)]'>
                      {t('overdue')}
                    </span>
                  ) : null}
                </td>

                {editing ? (
                  <td className={cellClass}>
                    <button
                      type='button'
                      title={t('removeSubject')}
                      aria-label={t('removeSubjectAria', {
                        name: name || t('untitledSubject'),
                      })}
                      onClick={e => {
                        e.stopPropagation();
                        onDeleteItem(index);
                      }}
                      className={cn(
                        'grid size-7 cursor-pointer place-items-center rounded-[7px] text-[var(--pv2-mut)] transition-colors',
                        'hover:bg-[color-mix(in_srgb,var(--pv2-error)_10%,transparent)] hover:text-[var(--pv2-error)]',
                        'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
                      )}
                    >
                      <Trash2
                        className='size-3.5'
                        strokeWidth={2}
                        aria-hidden
                      />
                    </button>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>

        {editing ? (
          <tfoot>
            <tr>
              <td colSpan={6} className='px-3.5 py-2.5'>
                <button
                  type='button'
                  onClick={onAddItem}
                  className={cn(
                    'flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[var(--pv2-r-sm)]',
                    'border border-dashed border-[var(--pv2-hair)] py-2.5 text-[12.5px] font-semibold text-[var(--pv2-electric)]',
                    'transition-colors hover:border-[var(--pv2-electric)] hover:bg-[var(--pv2-electric-soft)]',
                    'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
                  )}
                >
                  <Plus className='size-3.5' strokeWidth={2.4} aria-hidden />
                  {t('addSubject')}
                </button>
              </td>
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
};
