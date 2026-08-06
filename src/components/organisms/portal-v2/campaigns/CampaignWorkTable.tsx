'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  GateDot,
  StageBar,
  SubjectBadge,
} from '@/components/molecules/portal-v2/campaigns-form';
import { JourneyCell } from '@/components/organisms/portal-v2/campaigns/JourneyCell';
import { cn } from '@/lib/cn';
import {
  fmtDate,
  isLate,
  subjectName,
} from '@/lib/portal-v2/campaigns/helpers';
import { itemShipGate } from '@/lib/portal-v2/campaigns/shipGate';
import { subjectLane } from '@/lib/portal-v2/campaigns/subjectLane';
import type {
  CampaignExperience,
  CampaignItem,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';
import type { Journey } from '@/lib/portal-v2/journeys/types';

type CampaignWorkTableProps = {
  campaign: CampaignView;
  items: CampaignItem[];
  productNames: Record<string, string>;
  experiences: CampaignExperience[];
  journeys: Journey[];
  /** `YYYY-MM-DD` — passed in so the overdue check stays deterministic. */
  today: string;
  editing: boolean;
  onOpenItem: (index: number) => void;
  onOpenSubjectJourney: (index: number, nodeId?: string) => void;
  onDeleteItem: (index: number) => void;
  onAddItem: () => void;
};

const headClass =
  'bg-[var(--pv2-canvas)] px-3.5 py-2.5 text-left text-[10.5px] font-bold tracking-[0.05em] text-[var(--pv2-mut)] uppercase whitespace-nowrap';

const cellClass =
  'border-b border-[var(--pv2-hair)] px-3.5 py-3 text-[12.5px] align-middle';

/**
 * "The work" — one row per subject.
 *
 * Demo Build phase columns: Subject | Journey | Stage | Owner | Due.
 * The ship-gate dot sits on the subject; the journey cell is the route in
 * miniature — dot flow plus match/edit/off-journey subline.
 */
export const CampaignWorkTable = ({
  campaign,
  items,
  productNames,
  experiences,
  journeys,
  today,
  editing,
  onOpenItem,
  onOpenSubjectJourney,
  onDeleteItem,
  onAddItem,
}: CampaignWorkTableProps) => {
  const t = useTranslations('portalV2.campaigns');
  const colSpan = editing ? 6 : 5;

  return (
    <div className='overflow-x-auto rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
      <table className='w-full border-collapse'>
        <thead>
          <tr>
            <th className={headClass}>{t('colSubject')}</th>
            <th className={headClass}>{t('colJourney')}</th>
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
            const gate = itemShipGate(item, experiences);
            const lane = subjectLane(campaign, item, journeys, experiences);

            return (
              <tr
                key={item.id}
                className='group transition-colors hover:bg-[var(--pv2-canvas)]'
              >
                <td
                  className={cn(cellClass, 'cursor-pointer')}
                  onClick={() => onOpenItem(index)}
                >
                  <span className='flex min-w-[220px] flex-col gap-1'>
                    <span className='flex items-center gap-2'>
                      <GateDot gate={gate} />
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
                  <JourneyCell
                    lane={lane}
                    subjectKind={item.kind === 'topic' ? 'topic' : 'product'}
                    onOpen={() => onOpenSubjectJourney(index)}
                    onNodeClick={nodeId => onOpenSubjectJourney(index, nodeId)}
                  />
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
              <td colSpan={colSpan} className='px-3.5 py-2.5'>
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
