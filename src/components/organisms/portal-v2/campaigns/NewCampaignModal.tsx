'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import {
  Field,
  TextInput,
  TextSelect,
  TextTextarea,
} from '@/components/molecules/portal-v2/brand-form';
import { cn } from '@/lib/cn';
import {
  CAMPAIGN_CHANNELS,
  CAMPAIGN_GOAL_IDS,
  CAMPAIGN_GOALS,
  CAMPAIGN_TYPES,
  CAMPAIGN_TYPE_IDS,
} from '@/lib/portal-v2/campaigns/constants';
import { blankDraft } from '@/lib/portal-v2/campaigns/helpers';
import type {
  CampaignDraft,
  CampaignGoal,
  CampaignSource,
  CampaignType,
} from '@/lib/portal-v2/campaigns/types';

type NewCampaignModalProps = {
  source: CampaignSource;
  products: { id: string; name: string }[];
  saving: boolean;
  onClose: () => void;
  onCreate: (draft: CampaignDraft) => void;
};

/**
 * "Plan a campaign" — the brief first, the experiences follow from it.
 *
 * The product select only appears on the `campaigns` source: `/v1/campaigns`
 * makes `product_id` mandatory, the ads endpoint has no such column. The chosen
 * product also seeds the campaign's first subject, which is what the plan means
 * by "tạo được chiến dịch → hạng mục".
 */
export const NewCampaignModal = ({
  source,
  products,
  saving,
  onClose,
  onCreate,
}: NewCampaignModalProps) => {
  const t = useTranslations('portalV2.campaigns');

  const [draft, setDraft] = useState<CampaignDraft>(blankDraft);
  const [error, setError] = useState<string | null>(null);
  const [channelText, setChannelText] = useState('');
  const [budgetText, setBudgetText] = useState('');

  const needsProduct = source === 'campaigns';
  const patch = (partial: Partial<CampaignDraft>) =>
    setDraft(prev => ({ ...prev, ...partial }));

  const patchBrief = (partial: Partial<CampaignDraft['brief']>) =>
    setDraft(prev => ({ ...prev, brief: { ...prev.brief, ...partial } }));

  const submit = () => {
    if (!draft.name.trim()) {
      setError(t('errNameRequired'));
      return;
    }
    if (!draft.brief.objective.trim()) {
      setError(t('errObjectiveRequired'));
      return;
    }
    if (needsProduct && !draft.productId) {
      setError(t('errProductRequired'));
      return;
    }
    if (draft.startDate && draft.endDate && draft.endDate < draft.startDate) {
      setError(t('errEndBeforeStart'));
      return;
    }

    const channels = channelText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const budget = Number(budgetText.replace(/[^0-9.]/g, ''));

    onCreate({
      ...draft,
      channels,
      budgetAmount: Number.isFinite(budget) && budget > 0 ? budget : null,
      items:
        needsProduct && draft.productId
          ? [
              {
                id: 'it1',
                kind: 'product',
                productId: draft.productId,
                expIds: [],
                status: 'todo',
                owner: draft.owner.trim(),
                due: draft.endDate,
                note: '',
              },
            ]
          : [],
    });
  };

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={t('newTitle')}
      subtitle={t('newSub')}
      footer={
        <>
          <Button variant='ghost' onClick={onClose} disabled={saving}>
            {t('cancel')}
          </Button>
          <span className='flex-1' />
          <Button variant='primary' onClick={submit} disabled={saving}>
            {saving ? t('creating') : t('createCampaign')}
          </Button>
        </>
      }
    >
      {error ? (
        <p className='mb-4 rounded-[var(--pv2-r)] border border-[color-mix(in_srgb,var(--pv2-error)_35%,transparent)] bg-[color-mix(in_srgb,var(--pv2-error)_8%,transparent)] px-4 py-2.5 text-[12.5px] font-medium text-[var(--pv2-error)]'>
          {error}
        </p>
      ) : null}

      <fieldset className='mb-6'>
        <legend className='mb-2.5 text-[9.5px] font-bold tracking-[0.09em] text-[var(--pv2-faint)] uppercase'>
          {t('typeLegend')}
        </legend>
        <div className='grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2'>
          {CAMPAIGN_TYPE_IDS.map(id => {
            const on = draft.type === id;
            return (
              <button
                key={id}
                type='button'
                aria-pressed={on}
                onClick={() => patch({ type: id as CampaignType })}
                className={cn(
                  'cursor-pointer rounded-[var(--pv2-r)] border px-3 py-2.5 text-left transition-colors',
                  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
                  on
                    ? 'border-[var(--pv2-electric)] ring-[3px] ring-[var(--pv2-electric-soft)]'
                    : 'border-[var(--pv2-hair)] hover:border-[var(--pv2-slate-300)]'
                )}
              >
                <span
                  aria-hidden
                  className='mb-2 block size-[26px] rounded-[8px]'
                  style={{ background: CAMPAIGN_TYPES[id].color }}
                />
                <span className='block text-[12.5px] font-semibold text-[var(--pv2-ink)]'>
                  {t(CAMPAIGN_TYPES[id].labelKey)}
                </span>
                <span className='mt-0.5 block text-[11px] leading-snug text-[var(--pv2-faint)]'>
                  {t(CAMPAIGN_TYPES[id].descKey)}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className='grid gap-x-4 sm:grid-cols-2'>
        <Field label={t('fieldName')}>
          <TextInput
            value={draft.name}
            onChange={e => patch({ name: e.target.value })}
            placeholder={t('fieldNamePlaceholder')}
          />
        </Field>
        <Field label={t('fieldOwner')}>
          <TextInput
            value={draft.owner}
            onChange={e => patch({ owner: e.target.value })}
            placeholder={t('fieldOwnerPlaceholder')}
          />
        </Field>

        {needsProduct ? (
          <Field label={t('fieldProduct')} className='sm:col-span-2'>
            <TextSelect
              value={draft.productId ?? ''}
              onChange={e => patch({ productId: e.target.value || null })}
            >
              <option value=''>{t('fieldProductPlaceholder')}</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </TextSelect>
          </Field>
        ) : null}

        <Field label={t('fieldStart')}>
          <TextInput
            type='date'
            value={draft.startDate ?? ''}
            onChange={e => patch({ startDate: e.target.value || null })}
          />
        </Field>
        <Field
          label={draft.type === 'always' ? t('fieldEndAlways') : t('fieldEnd')}
        >
          <TextInput
            type='date'
            disabled={draft.type === 'always'}
            value={draft.type === 'always' ? '' : (draft.endDate ?? '')}
            onChange={e => patch({ endDate: e.target.value || null })}
          />
        </Field>

        <Field label={t('fieldBudget')}>
          <TextInput
            inputMode='decimal'
            value={budgetText}
            onChange={e => setBudgetText(e.target.value)}
            placeholder='240000'
          />
        </Field>
        <Field label={t('fieldChannels')}>
          <TextInput
            value={channelText}
            onChange={e => setChannelText(e.target.value)}
            placeholder={CAMPAIGN_CHANNELS.slice(0, 3).join(', ')}
          />
        </Field>
      </div>

      <p className='mt-2 mb-3 text-[9.5px] font-bold tracking-[0.09em] text-[var(--pv2-faint)] uppercase'>
        {t('briefLegend')}
      </p>

      <Field label={t('fieldGoal')}>
        <TextSelect
          value={draft.goal ?? ''}
          onChange={e =>
            patch({ goal: (e.target.value || null) as CampaignGoal | null })
          }
        >
          <option value=''>{t('goalNone')}</option>
          {CAMPAIGN_GOAL_IDS.map(id => (
            <option key={id} value={id}>
              {t(CAMPAIGN_GOALS[id].labelKey)}
            </option>
          ))}
        </TextSelect>
      </Field>

      <Field label={t('fieldObjective')}>
        <TextTextarea
          rows={3}
          value={draft.brief.objective}
          onChange={e => patchBrief({ objective: e.target.value })}
          placeholder={t('fieldObjectivePlaceholder')}
        />
      </Field>

      <Field label={t('fieldAudience')}>
        <TextInput
          value={draft.brief.audience}
          onChange={e => patchBrief({ audience: e.target.value })}
        />
      </Field>

      <div className='grid gap-x-4 sm:grid-cols-2'>
        <Field label={t('fieldMessage')}>
          <TextInput
            value={draft.brief.message}
            onChange={e => patchBrief({ message: e.target.value })}
          />
        </Field>
        <Field label={t('fieldOffer')}>
          <TextInput
            value={draft.brief.offer}
            onChange={e => patchBrief({ offer: e.target.value })}
          />
        </Field>
      </div>
    </Modal>
  );
};
