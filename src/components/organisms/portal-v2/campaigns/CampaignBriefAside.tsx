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
import { cn } from '@/lib/cn';
import {
  CAMPAIGN_CHANNELS,
  CAMPAIGN_GOALS,
  CAMPAIGN_GOAL_IDS,
  CAMPAIGN_TYPES,
  CAMPAIGN_TYPE_IDS,
} from '@/lib/portal-v2/campaigns/constants';
import { fmtBudget } from '@/lib/portal-v2/campaigns/helpers';
import type {
  CampaignDraft,
  CampaignGoal,
  CampaignStage,
  CampaignTeamMember,
  CampaignType,
} from '@/lib/portal-v2/campaigns/types';

type CampaignBriefAsideProps = {
  draft: CampaignDraft;
  editing: boolean;
  team: CampaignTeamMember[];
  onChange: (patch: Partial<CampaignDraft>) => void;
};

/**
 * Trạng thái KHÔNG chọn tự do được: BE suy ra bằng `core.DeriveCampaignStage`
 * và `PATCH /campaigns/{id}/status` chỉ nhận `'done'` hoặc `null` — mọi giá
 * trị khác là 400 INVALID_TRANSITION. Nên đây là một công tắc đóng/mở, còn
 * chặng hiện tại chỉ để đọc.
 */
const DONE: CampaignStage = 'done';

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
 * `goal` is the commercial intent; the four narrative fields are the argument.
 * Read/edit fork mirrors the Brand panels.
 */
export const CampaignBriefAside = ({
  draft,
  editing,
  team,
  onChange,
}: CampaignBriefAsideProps) => {
  const t = useTranslations('portalV2.campaigns');

  const patchBrief = (partial: Partial<CampaignDraft['brief']>) =>
    onChange({ brief: { ...draft.brief, ...partial } });

  const toggleChannel = (channel: string) =>
    onChange({
      channels: draft.channels.includes(channel)
        ? draft.channels.filter(x => x !== channel)
        : [...draft.channels, channel],
    });

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
              value={draft.type ?? ''}
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
              value={draft.status === DONE ? DONE : 'auto'}
              onChange={e =>
                onChange({
                  status: e.target.value === DONE ? DONE : 'planning',
                })
              }
            >
              <option value='auto'>
                {t('statusAuto', { stage: t(`status_${draft.status}`) })}
              </option>
              <option value={DONE}>{t('status_done')}</option>
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
              <TextSelect
                value={draft.owner}
                onChange={e => onChange({ owner: e.target.value })}
              >
                <option value=''>{t('unassigned')}</option>
                {team.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </TextSelect>
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

          <fieldset>
            <legend className='mb-2 block text-[9.5px] font-bold tracking-[0.09em] text-[var(--pv2-faint)] uppercase'>
              {t('fieldChannels')}
            </legend>
            <div className='flex flex-wrap gap-1.5'>
              {CAMPAIGN_CHANNELS.map(channel => {
                const on = draft.channels.includes(channel);
                return (
                  <button
                    key={channel}
                    type='button'
                    aria-pressed={on}
                    onClick={() => toggleChannel(channel)}
                    className={cn(
                      'cursor-pointer rounded-full border px-2.5 py-1 text-[11.5px] font-semibold transition-colors',
                      'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
                      on
                        ? 'border-[var(--pv2-ink)] bg-[var(--pv2-ink)] text-[var(--pv2-paper)]'
                        : 'border-[var(--pv2-hair)] text-[var(--pv2-mut)] hover:border-[var(--pv2-slate-300)] hover:text-[var(--pv2-ink)]'
                    )}
                  >
                    {channel}
                  </button>
                );
              })}
            </div>
          </fieldset>
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
