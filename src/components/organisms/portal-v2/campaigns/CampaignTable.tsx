'use client';

import { Copy, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  HealthBadge,
  ProgressBar,
  StagePill,
  TypeSwatch,
} from '@/components/molecules/portal-v2/campaigns-form';
import { SelectBox } from '@/components/molecules/portal-v2/product-form';
import { cn } from '@/lib/cn';
import { campaignTypeStyle } from '@/lib/portal-v2/campaigns/constants';
import {
  campExpCount,
  campProgress,
  deriveStage,
  fmtBudget,
  fmtRange,
  ownerName,
} from '@/lib/portal-v2/campaigns/helpers';
import type {
  CampaignExperience,
  CampaignTeamMember,
  CampaignView,
} from '@/lib/portal-v2/campaigns/types';
import { campHealth } from '@/lib/portal-v2/campaigns/verdict';

import type { Journey } from '@/lib/portal-v2/journeys/types';

type CampaignTableProps = {
  campaigns: CampaignView[];
  experiences: CampaignExperience[];
  journeys: Journey[];
  team: CampaignTeamMember[];
  today: string;
  selected: string[];
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
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

export const CampaignTable = ({
  campaigns,
  experiences,
  journeys,
  team,
  today,
  selected,
  onToggleSelect,
  onToggleAll,
  onOpen,
  onDuplicate,
  onDelete,
}: CampaignTableProps) => {
  const t = useTranslations('portalV2.campaigns');
  const allSelected =
    campaigns.length > 0 && selected.length === campaigns.length;

  return (
    <div className='overflow-x-auto rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
      <table className='w-full border-collapse'>
        <thead>
          <tr>
            <th className={cn(headClass, 'w-[34px]')}>
              <SelectBox
                checked={allSelected}
                onToggle={onToggleAll}
                label={t('selectAll')}
              />
            </th>
            <th className={headClass}>{t('colCampaign')}</th>
            <th className={headClass}>{t('colType')}</th>
            <th className={headClass}>{t('colDates')}</th>
            <th className={headClass}>{t('colOwner')}</th>
            <th className={headClass}>{t('colSubjects')}</th>
            <th className={headClass}>{t('colProgress')}</th>
            <th className={headClass}>{t('colBudget')}</th>
            <th className={headClass}>{t('colStage')}</th>
            <th className={headClass}>{t('colHealth')}</th>
            <th className={cn(headClass, 'w-[80px]')}>
              <span className='sr-only'>{t('colActions')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map(campaign => {
            const on = selected.includes(campaign.id);
            const owner = ownerName(campaign.owner, team);
            const progress = campProgress(campaign);
            const budget = fmtBudget(
              campaign.budgetAmount,
              campaign.budgetCurrency
            );
            const topics = campaign.items.filter(
              i => i.kind === 'topic'
            ).length;
            const products = campaign.items.length - topics;

            return (
              <tr
                key={campaign.id}
                onClick={() => onOpen(campaign.id)}
                className={cn(
                  'group cursor-pointer transition-colors',
                  on
                    ? 'bg-[var(--pv2-electric-soft)]'
                    : 'hover:bg-[var(--pv2-canvas)]'
                )}
              >
                <td className={cellClass}>
                  <SelectBox
                    checked={on}
                    onToggle={() => onToggleSelect(campaign.id)}
                    label={t('selectRow', { name: campaign.name })}
                  />
                </td>

                <td className={cellClass}>
                  <span className='flex min-w-[240px] items-center gap-3'>
                    <TypeSwatch type={campaign.type} size={30} radius={8} />
                    <span className='min-w-0'>
                      <span className='block truncate text-[13px] font-semibold text-[var(--pv2-ink)]'>
                        {campaign.name}
                      </span>
                      <span className='block truncate text-[11px] text-[var(--pv2-faint)]'>
                        {campaign.brief.objective || t('noObjective')}
                      </span>
                    </span>
                  </span>
                </td>

                <td className={cn(cellClass, 'whitespace-nowrap')}>
                  {t(campaignTypeStyle(campaign.type).labelKey)}
                </td>

                <td
                  className={cn(
                    cellClass,
                    'whitespace-nowrap text-[var(--pv2-mut)]'
                  )}
                >
                  {fmtRange(campaign, t('ongoing'))}
                </td>

                <td className={cn(cellClass, 'whitespace-nowrap')}>
                  <span
                    className={cn(
                      !owner && 'font-semibold text-[var(--pv2-error)]'
                    )}
                  >
                    {owner || t('unassigned')}
                  </span>
                </td>

                <td className={cellClass}>
                  <span className='block whitespace-nowrap text-[var(--pv2-ink)] tabular-nums'>
                    {t('subjectCount', { count: campaign.items.length })}
                  </span>
                  <span className='block text-[10.5px] whitespace-nowrap text-[var(--pv2-faint)]'>
                    {topics
                      ? t('productAndTopic', { products, topics })
                      : t('experienceCount', { count: campExpCount(campaign) })}
                  </span>
                </td>

                <td className={cellClass}>
                  <ProgressBar
                    className='min-w-[130px]'
                    done={progress.done}
                    total={progress.total}
                    pct={progress.pct}
                  />
                </td>

                <td
                  className={cn(
                    cellClass,
                    'whitespace-nowrap text-[var(--pv2-ink)] tabular-nums'
                  )}
                >
                  {budget ?? '—'}
                </td>

                <td className={cellClass}>
                  <StagePill stage={deriveStage(campaign)} />
                </td>

                <td className={cellClass}>
                  <HealthBadge
                    health={campHealth(campaign, experiences, today, journeys)}
                  />
                </td>

                <td className={cellClass}>
                  <span
                    className={cn(
                      'flex items-center gap-0.5 transition-opacity',
                      on
                        ? 'opacity-100'
                        : 'opacity-0 group-focus-within:opacity-100 group-hover:opacity-100'
                    )}
                  >
                    <button
                      type='button'
                      className={actionButton}
                      title={t('rowDuplicate')}
                      aria-label={t('rowDuplicateAria', {
                        name: campaign.name,
                      })}
                      onClick={e => {
                        e.stopPropagation();
                        onDuplicate(campaign.id);
                      }}
                    >
                      <Copy className='size-3.5' strokeWidth={2} aria-hidden />
                    </button>
                    <button
                      type='button'
                      className={cn(
                        actionButton,
                        'hover:bg-[color-mix(in_srgb,var(--pv2-error)_10%,transparent)] hover:text-[var(--pv2-error)]'
                      )}
                      title={t('rowDelete')}
                      aria-label={t('rowDeleteAria', { name: campaign.name })}
                      onClick={e => {
                        e.stopPropagation();
                        onDelete(campaign.id);
                      }}
                    >
                      <Trash2
                        className='size-3.5'
                        strokeWidth={2}
                        aria-hidden
                      />
                    </button>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
