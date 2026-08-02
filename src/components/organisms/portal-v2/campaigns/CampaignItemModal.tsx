'use client';

import { Loader2, Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import {
  Field,
  TextInput,
  TextTextarea,
} from '@/components/molecules/portal-v2/brand-form';
import { StageBar } from '@/components/molecules/portal-v2/campaigns-form';
import { cn } from '@/lib/cn';
import { ITEM_FLOW, ITEM_STATUS } from '@/lib/portal-v2/campaigns/constants';
import { syncItemStage } from '@/lib/portal-v2/campaigns/helpers';
import type {
  CampaignItem,
  CampaignItemStatus,
} from '@/lib/portal-v2/campaigns/types';
import type { ExperienceView } from '@/lib/portal-v2/experiences/types';

type CampaignItemModalProps = {
  item: CampaignItem;
  subjectLabel: string;
  campaignName: string;
  experiences: ExperienceView[];
  experiencesLoading: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (item: CampaignItem) => void;
  onDelete: () => void;
};

/**
 * One subject's work surface: where it is in the flow, who owns it, when it is
 * due, and which experiences are attached.
 *
 * Attaching the first experience promotes a `todo` item to `building` on save
 * (`syncItemStage`) — the plan's "tự chuyển In build khi hạng mục đã có trải
 * nghiệm". Everything past that is set by hand.
 */
export const CampaignItemModal = ({
  item,
  subjectLabel,
  campaignName,
  experiences,
  experiencesLoading,
  saving,
  onClose,
  onSave,
  onDelete,
}: CampaignItemModalProps) => {
  const t = useTranslations('portalV2.campaigns');

  const [draft, setDraft] = useState<CampaignItem>(() => ({
    ...item,
    expIds: [...item.expIds],
  }));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');

  const patch = (partial: Partial<CampaignItem>) =>
    setDraft(prev => ({ ...prev, ...partial }));

  const attached = useMemo(
    () =>
      draft.expIds.map(id => ({
        id,
        view: experiences.find(e => e.id === id) ?? null,
      })),
    [draft.expIds, experiences]
  );

  const candidates = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    return experiences
      .filter(e => !draft.expIds.includes(e.id))
      .filter(e => !q || e.searchText.toLowerCase().includes(q))
      .slice(0, 24);
  }, [experiences, draft.expIds, pickerQuery]);

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={subjectLabel || t('untitledSubject')}
      subtitle={t('itemSub', {
        kind: draft.kind === 'topic' ? t('kindTopic') : t('kindProduct'),
        campaign: campaignName,
      })}
      footer={
        <>
          <Button variant='ghost' onClick={onClose} disabled={saving}>
            {t('cancel')}
          </Button>
          <Button variant='danger' onClick={onDelete} disabled={saving}>
            {t('removeSubject')}
          </Button>
          <span className='flex-1' />
          <Button
            variant='primary'
            disabled={saving}
            onClick={() => onSave(syncItemStage(draft))}
          >
            {saving ? t('saving') : t('save')}
          </Button>
        </>
      }
    >
      <fieldset className='mb-5'>
        <legend className='mb-2.5 text-[9.5px] font-bold tracking-[0.09em] text-[var(--pv2-faint)] uppercase'>
          {t('stageLegend')}
        </legend>
        <div className='flex flex-wrap gap-1.5'>
          {ITEM_FLOW.map(id => {
            const on = draft.status === id;
            return (
              <button
                key={id}
                type='button'
                aria-pressed={on}
                onClick={() => patch({ status: id as CampaignItemStatus })}
                className={cn(
                  'cursor-pointer rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors',
                  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
                  on
                    ? 'border-[var(--pv2-ink)] bg-[var(--pv2-ink)] text-[var(--pv2-paper)]'
                    : 'border-[var(--pv2-hair)] bg-[var(--pv2-paper)] text-[var(--pv2-mut)] hover:border-[var(--pv2-slate-300)] hover:text-[var(--pv2-ink)]'
                )}
              >
                {t(ITEM_STATUS[id].labelKey)}
              </button>
            );
          })}
        </div>
        <div className='mt-3'>
          <StageBar status={draft.status} />
        </div>
      </fieldset>

      {draft.kind === 'topic' ? (
        <Field label={t('fieldTopicName')}>
          <TextInput
            value={draft.name ?? ''}
            onChange={e => patch({ name: e.target.value })}
            placeholder={t('addTopicPlaceholder')}
          />
        </Field>
      ) : null}

      <div className='grid gap-x-4 sm:grid-cols-2'>
        <Field label={t('fieldItemOwner')}>
          <TextInput
            value={draft.owner}
            onChange={e => patch({ owner: e.target.value })}
            placeholder={t('unassigned')}
          />
        </Field>
        <Field label={t('fieldDue')}>
          <TextInput
            type='date'
            value={draft.due ?? ''}
            onChange={e => patch({ due: e.target.value || null })}
          />
        </Field>
      </div>

      <Field label={t('fieldItemNote')}>
        <TextTextarea
          rows={3}
          value={draft.note}
          onChange={e => patch({ note: e.target.value })}
          placeholder={t('fieldItemNotePlaceholder')}
        />
      </Field>

      <p className='mt-4 mb-2.5 text-[9.5px] font-bold tracking-[0.09em] text-[var(--pv2-faint)] uppercase'>
        {t('experiencesLegend')}
      </p>

      {attached.length ? (
        <div className='mb-3 flex flex-col gap-2'>
          {attached.map(({ id, view }) => (
            <div
              key={id}
              className='flex items-center gap-3 rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] px-3 py-2.5'
            >
              <span className='min-w-0 flex-1'>
                <span className='block truncate text-[12.5px] font-semibold text-[var(--pv2-ink)]'>
                  {view?.name ?? t('experienceMissing')}
                </span>
                <span className='block truncate text-[11px] text-[var(--pv2-faint)]'>
                  {view?.slug ? `/p/${view.slug}` : id}
                </span>
              </span>
              <button
                type='button'
                aria-label={t('detachExperience')}
                title={t('detachExperience')}
                onClick={() =>
                  patch({ expIds: draft.expIds.filter(x => x !== id) })
                }
                className={cn(
                  'grid size-7 shrink-0 cursor-pointer place-items-center rounded-[7px] text-[var(--pv2-mut)] transition-colors',
                  'hover:bg-[color-mix(in_srgb,var(--pv2-error)_10%,transparent)] hover:text-[var(--pv2-error)]',
                  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
                )}
              >
                <X className='size-3.5' strokeWidth={2} aria-hidden />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className='mb-3 rounded-[10px] bg-[var(--pv2-canvas)] px-4 py-4 text-[12.5px] text-[var(--pv2-faint)]'>
          {t('noExperiencesYet')}
        </p>
      )}

      {pickerOpen ? (
        <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] px-4 py-3.5'>
          <TextInput
            value={pickerQuery}
            onChange={e => setPickerQuery(e.target.value)}
            placeholder={t('experienceSearchPlaceholder')}
            className='mb-3'
          />
          {experiencesLoading ? (
            <p className='flex items-center justify-center gap-2 py-6 text-[12.5px] text-[var(--pv2-mut)]'>
              <Loader2
                className='size-4 animate-spin text-[var(--pv2-electric)]'
                aria-hidden
              />
              {t('loading')}
            </p>
          ) : candidates.length ? (
            <div className='grid max-h-[240px] gap-2 overflow-y-auto sm:grid-cols-2'>
              {candidates.map(experience => (
                <button
                  key={experience.id}
                  type='button'
                  onClick={() => {
                    patch({ expIds: [...draft.expIds, experience.id] });
                    setPickerOpen(false);
                    setPickerQuery('');
                  }}
                  className={cn(
                    'cursor-pointer rounded-[var(--pv2-r-sm)] border px-3 py-2.5 text-left transition-colors',
                    'border-[var(--pv2-hair)] hover:border-[var(--pv2-electric)] hover:bg-[var(--pv2-electric-soft)]',
                    'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
                  )}
                >
                  <span className='block truncate text-[12.5px] font-semibold text-[var(--pv2-ink)]'>
                    {experience.name}
                  </span>
                  <span className='block truncate text-[11px] text-[var(--pv2-faint)]'>
                    {experience.summary || experience.tagline}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className='py-4 text-center text-[12.5px] text-[var(--pv2-faint)]'>
              {t('noExperienceMatch')}
            </p>
          )}
        </div>
      ) : (
        <Button variant='dashed' onClick={() => setPickerOpen(true)}>
          <Plus className='size-3.5' strokeWidth={2.4} aria-hidden />
          {t('attachExperience')}
        </Button>
      )}
    </Modal>
  );
};
