'use client';

import { useTranslations } from 'next-intl';

import {
  Field,
  TextInput,
  TextSelect,
  TextTextarea,
} from '@/components/molecules/portal-v2/brand-form';
import {
  BriefLabel,
  ChannelTags,
} from '@/components/molecules/portal-v2/campaigns-form';
import {
  CAMPAIGN_GOALS,
  CAMPAIGN_GOAL_IDS,
  CAMPAIGN_TYPES,
  CAMPAIGN_TYPE_IDS,
} from '@/lib/portal-v2/campaigns/constants';
import { fmtBudget } from '@/lib/portal-v2/campaigns/helpers';
import type {
  CampaignDraft,
  CampaignGoal,
  CampaignStatus,
  CampaignType,
} from '@/lib/portal-v2/campaigns/types';

type CampaignBriefAsideProps = {
  draft: CampaignDraft;
  editing: boolean;
  onChange: (patch: Partial<CampaignDraft>) => void;
};

const STATUSES: CampaignStatus[] = ['draft', 'active', 'paused', 'completed'];

const ReadRow = ({ label, value }: { label: string; value: string }) => (
  <div className='border-b border-[var(--pv2-hair)] px-4 py-3 last:border-b-0'>
    <BriefLabel>{label}</BriefLabel>
    <p className='text-[12.5px] leading-relaxed text-[var(--pv2-ink)]'>
      {value}
    </p>
  </div>
);

/**
 * "The brief" — what everyone building this has to agree on before they start.
 *
 * `goal` is the real `objective` column on the wire; the four narrative fields
 * ride inside `notes.pv2.brief`. Read/edit fork mirrors the Brand panels.
 */
export const CampaignBriefAside = ({
  draft,
  editing,
  onChange,
}: CampaignBriefAsideProps) => {
  const t = useTranslations('portalV2.campaigns');

  const patchBrief = (partial: Partial<CampaignDraft['brief']>) =>
    onChange({ brief: { ...draft.brief, ...partial } });

  const notSet = t('notSet');
  const budget = fmtBudget(draft.budgetAmount, draft.budgetCurrency);

  return (
    <aside className='sticky top-3.5 overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
      <div className='bg-[var(--pv2-ink)] px-4 py-3.5'>
        <p className='text-[9.5px] font-bold tracking-[0.12em] text-[var(--pv2-cyan)] uppercase'>
          {t('briefEyebrow')}
        </p>
        <p className='mt-1 text-[11.5px] leading-relaxed text-white/70'>
          {t('briefLead')}
        </p>
      </div>

      {editing ? (
        <div className='px-4 py-4'>
          <Field label={t('fieldName')}>
            <TextInput
              value={draft.name}
              onChange={e => onChange({ name: e.target.value })}
            />
          </Field>

          <Field label={t('fieldType')}>
            <TextSelect
              value={draft.type}
              onChange={e => onChange({ type: e.target.value as CampaignType })}
            >
              {CAMPAIGN_TYPE_IDS.map(id => (
                <option key={id} value={id}>
                  {t(CAMPAIGN_TYPES[id].labelKey)}
                </option>
              ))}
            </TextSelect>
          </Field>

          <Field label={t('fieldGoal')}>
            <TextSelect
              value={draft.goal ?? ''}
              onChange={e =>
                onChange({
                  goal: (e.target.value || null) as CampaignGoal | null,
                })
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
            />
          </Field>

          <Field label={t('fieldAudience')}>
            <TextTextarea
              rows={3}
              value={draft.brief.audience}
              onChange={e => patchBrief({ audience: e.target.value })}
            />
          </Field>

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

          <Field label={t('fieldStatus')}>
            <TextSelect
              value={draft.status}
              onChange={e =>
                onChange({ status: e.target.value as CampaignStatus })
              }
            >
              {STATUSES.map(id => (
                <option key={id} value={id}>
                  {t(`status_${id}`)}
                </option>
              ))}
            </TextSelect>
          </Field>

          <div className='grid grid-cols-2 gap-x-3'>
            <Field label={t('fieldBudget')}>
              <TextInput
                inputMode='decimal'
                value={draft.budgetAmount === null ? '' : draft.budgetAmount}
                onChange={e => {
                  const raw = e.target.value.replace(/[^0-9.]/g, '');
                  onChange({ budgetAmount: raw ? Number(raw) : null });
                }}
              />
            </Field>
            <Field label={t('fieldOwner')}>
              <TextInput
                value={draft.owner}
                onChange={e => onChange({ owner: e.target.value })}
              />
            </Field>
            <Field label={t('fieldStart')}>
              <TextInput
                type='date'
                value={draft.startDate ?? ''}
                onChange={e => onChange({ startDate: e.target.value || null })}
              />
            </Field>
            <Field label={t('fieldEnd')}>
              <TextInput
                type='date'
                value={draft.endDate ?? ''}
                onChange={e => onChange({ endDate: e.target.value || null })}
              />
            </Field>
          </div>

          <Field label={t('fieldChannels')}>
            <TextInput
              value={draft.channels.join(', ')}
              onChange={e =>
                onChange({
                  channels: e.target.value
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </Field>
        </div>
      ) : (
        <div>
          <ReadRow
            label={t('fieldObjective')}
            value={draft.brief.objective || notSet}
          />
          <ReadRow
            label={t('fieldAudience')}
            value={draft.brief.audience || notSet}
          />
          <ReadRow
            label={t('fieldMessage')}
            value={draft.brief.message || notSet}
          />
          <ReadRow
            label={t('fieldOffer')}
            value={draft.brief.offer || notSet}
          />
          <ReadRow
            label={t('fieldGoal')}
            value={draft.goal ? t(CAMPAIGN_GOALS[draft.goal].labelKey) : notSet}
          />
          <ReadRow
            label={t('fieldBudget')}
            value={
              [
                budget,
                draft.startDate || draft.endDate
                  ? `${draft.startDate ?? '—'} → ${draft.endDate ?? t('ongoing')}`
                  : null,
              ]
                .filter(Boolean)
                .join(' · ') || notSet
            }
          />
          <div className='px-4 py-3'>
            <BriefLabel>{t('fieldChannels')}</BriefLabel>
            <ChannelTags channels={draft.channels} empty={notSet} />
          </div>
        </div>
      )}
    </aside>
  );
};
