'use client';

import { Pencil, Trash2, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  ItemDot,
  ProgressBar,
  StagePill,
  TypeSwatch,
} from '@/components/molecules/portal-v2/campaigns-form';
import { SelectBox } from '@/components/molecules/portal-v2/product-form';
import { cn } from '@/lib/cn';
import { CAMPAIGN_TYPES } from '@/lib/portal-v2/campaigns/constants';
import {
  campExpCount,
  campProgress,
  deriveStage,
  fmtBudget,
  fmtRange,
  shortLabel,
  subjectName,
  unassignedCount,
} from '@/lib/portal-v2/campaigns/helpers';
import type { CampaignView } from '@/lib/portal-v2/campaigns/types';

type CampaignCardProps = {
  campaign: CampaignView;
  productNames: Record<string, string>;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const CHIP_LIMIT = 4;

const actionButton = cn(
  'grid size-7 cursor-pointer place-items-center rounded-[7px] text-[var(--pv2-mut)] transition-colors',
  'hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)]',
  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
);

export const CampaignCard = ({
  campaign,
  productNames,
  selected,
  onToggleSelect,
  onOpen,
  onEdit,
  onDelete,
}: CampaignCardProps) => {
  const t = useTranslations('portalV2.campaigns');

  const stage = deriveStage(campaign);
  const progress = campProgress(campaign);
  const experiences = campExpCount(campaign);
  const unassigned = unassignedCount(campaign);
  const budget = fmtBudget(campaign.budgetAmount, campaign.budgetCurrency);
  const shown = campaign.items.slice(0, CHIP_LIMIT);
  const overflow = campaign.items.length - shown.length;

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={() => onOpen(campaign.id)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(campaign.id);
        }
      }}
      className={cn(
        'group relative flex cursor-pointer flex-col rounded-[var(--pv2-r)] border bg-[var(--pv2-paper)] px-4 py-[15px]',
        'transition-[border-color,box-shadow,transform] duration-150',
        'hover:-translate-y-0.5 hover:border-[var(--pv2-electric)] hover:shadow-[var(--pv2-sh-sm)]',
        'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
        selected
          ? 'border-[var(--pv2-electric)] bg-[var(--pv2-electric-soft)]'
          : 'border-[var(--pv2-hair)]'
      )}
    >
      <span
        className={cn(
          'absolute top-3 right-3 flex items-center gap-0.5 transition-opacity',
          selected
            ? 'opacity-100'
            : 'opacity-0 group-focus-within:opacity-100 group-hover:opacity-100'
        )}
        onClick={e => e.stopPropagation()}
        role='presentation'
      >
        <button
          type='button'
          className={actionButton}
          title={t('rowEdit')}
          aria-label={t('rowEditAria', { name: campaign.name })}
          onClick={() => onEdit(campaign.id)}
        >
          <Pencil className='size-3.5' strokeWidth={2} aria-hidden />
        </button>
        <button
          type='button'
          className={cn(
            actionButton,
            'hover:bg-[color-mix(in_srgb,var(--pv2-error)_10%,transparent)] hover:text-[var(--pv2-error)]'
          )}
          title={t('rowDelete')}
          aria-label={t('rowDeleteAria', { name: campaign.name })}
          onClick={() => onDelete(campaign.id)}
        >
          <Trash2 className='size-3.5' strokeWidth={2} aria-hidden />
        </button>
        <SelectBox
          checked={selected}
          onToggle={() => onToggleSelect(campaign.id)}
          label={t('selectRow', { name: campaign.name })}
        />
      </span>

      <div className='flex items-start gap-3 pr-[104px]'>
        <TypeSwatch type={campaign.type} />
        <div className='min-w-0 flex-1'>
          <p className='truncate font-[family-name:var(--pv2-disp)] text-[14.5px] font-semibold text-[var(--pv2-ink)]'>
            {campaign.name}
          </p>
          <p className='mt-0.5 truncate text-[11px] text-[var(--pv2-faint)]'>
            {t(CAMPAIGN_TYPES[campaign.type].labelKey)} ·{' '}
            {fmtRange(campaign, t('ongoing'))}
          </p>
        </div>
      </div>

      <div className='mt-2.5 flex justify-end'>
        <StagePill stage={stage} />
      </div>

      <p className='mt-2 line-clamp-2 min-h-[38px] text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
        {campaign.brief.objective || t('noObjective')}
      </p>

      <ProgressBar
        className='mt-2.5'
        done={progress.done}
        total={progress.total}
        pct={progress.pct}
      />

      {campaign.items.length ? (
        <div className='mt-3 flex flex-wrap gap-1.5'>
          {shown.map(item => {
            const name = subjectName(item, productNames);
            return (
              <span
                key={item.id}
                title={name || t('untitledSubject')}
                className='inline-flex items-center gap-1.5 rounded-full bg-[var(--pv2-canvas)] px-2 py-1 text-[11px] font-medium text-[var(--pv2-mut)]'
              >
                <ItemDot status={item.status} />
                {shortLabel(name) || t('untitledSubject')}
                {item.kind === 'topic' ? (
                  <b className='text-[9px] font-bold text-[var(--pv2-violet)]'>
                    T
                  </b>
                ) : null}
                {item.expIds.length ? (
                  <b className='text-[10px] font-bold text-[var(--pv2-electric)]'>
                    {item.expIds.length}
                  </b>
                ) : null}
              </span>
            );
          })}
          {overflow > 0 ? (
            <span className='inline-flex items-center rounded-full bg-[var(--pv2-canvas)] px-2 py-1 text-[11px] font-semibold text-[var(--pv2-faint)]'>
              +{overflow}
            </span>
          ) : null}
        </div>
      ) : (
        <p className='mt-3 text-[11.5px] text-[var(--pv2-faint)]'>
          {t('noSubjects')}
        </p>
      )}

      <div className='mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--pv2-hair)] pt-2.5 text-[11px] text-[var(--pv2-faint)]'>
        <span className='inline-flex items-center gap-1'>
          <User className='size-3' strokeWidth={2} aria-hidden />
          {campaign.owner || t('unassigned')}
        </span>
        {budget ? <span>{budget}</span> : null}
        <span>{t('experienceCount', { count: experiences })}</span>
        {unassigned ? (
          <span className='font-bold text-[var(--pv2-error)]'>
            {t('unassignedCount', { count: unassigned })}
          </span>
        ) : null}
      </div>
    </div>
  );
};
