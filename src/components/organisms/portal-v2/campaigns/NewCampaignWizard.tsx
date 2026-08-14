'use client';

import { ArrowLeft, ArrowRight, Check, Plus, Route, X } from 'lucide-react';
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
import { TypeSwatch } from '@/components/molecules/portal-v2/campaigns-form';
import { cn } from '@/lib/cn';
import {
  CAMPAIGN_CHANNELS,
  CAMPAIGN_GOALS,
  CAMPAIGN_GOAL_IDS,
  CAMPAIGN_TYPES,
  CAMPAIGN_TYPE_IDS,
  CAMPAIGN_WIZARD_STEPS,
} from '@/lib/portal-v2/campaigns/constants';
import { routeMastersFor } from '@/lib/portal-v2/campaigns/journeyLink';
import type {
  CampaignGoal,
  CampaignTeamMember,
  CampaignType,
  CampaignWizard,
} from '@/lib/portal-v2/campaigns/types';
import {
  WIZARD_LAST_STEP,
  blankWizard,
  isAlwaysOn,
  stepBlocker,
  wizardItems,
} from '@/lib/portal-v2/campaigns/wizard';
import type { Journey } from '@/lib/portal-v2/journeys/types';

type NewCampaignWizardProps = {
  team: CampaignTeamMember[];
  products: { id: string; name: string }[];
  blueprints: Journey[];
  onClose: () => void;
  onCreate: (wizard: CampaignWizard) => void;
};

const chip = (on: boolean) =>
  cn(
    'cursor-pointer rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors',
    'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
    on
      ? 'border-[var(--pv2-ink)] bg-[var(--pv2-ink)] text-[var(--pv2-paper)]'
      : 'border-[var(--pv2-hair)] bg-[var(--pv2-paper)] text-[var(--pv2-mut)] hover:border-[var(--pv2-slate-300)] hover:text-[var(--pv2-ink)]'
  );

const legend =
  'mb-2.5 block text-[9.5px] font-bold tracking-[0.09em] text-[var(--pv2-faint)] uppercase';

/**
 * Four questions, in the order a campaign is actually decided: the moment, the
 * brief, the route, then the merchandise.
 *
 * The merchandise comes last on purpose. Asked first, a campaign becomes a
 * product list with a title on it — and the brief ends up reverse-engineered from
 * whatever happened to be in stock.
 */
export const NewCampaignWizard = ({
  team,
  products,
  blueprints,
  onClose,
  onCreate,
}: NewCampaignWizardProps) => {
  const t = useTranslations('portalV2.campaigns');

  const [wizard, setWizard] = useState<CampaignWizard>(() =>
    blankWizard(team[0]?.id ?? '')
  );
  const [topicDraft, setTopicDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const patch = (partial: Partial<CampaignWizard>) => {
    setWizard(prev => ({ ...prev, ...partial }));
    setError(null);
  };

  const toggle = (key: 'channels' | 'subjects' | 'topics', value: string) =>
    setWizard(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(x => x !== value)
        : [...prev[key], value],
    }));

  const step = CAMPAIGN_WIZARD_STEPS[wizard.step - 1];
  const last = wizard.step === WIZARD_LAST_STEP;

  const advance = () => {
    const blocker = stepBlocker(wizard, wizard.step);
    if (blocker) {
      setError(blocker);
      return;
    }
    if (last) {
      onCreate(wizard);
      return;
    }
    patch({ step: wizard.step + 1 });
  };

  const addTopic = () => {
    const name = topicDraft.trim();
    if (!name || wizard.topics.includes(name)) return;
    patch({ topics: [...wizard.topics, name] });
    setTopicDraft('');
  };

  const derived = wizardItems(wizard);

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={t('newTitle')}
      subtitle={t(step.subKey)}
      footer={
        <>
          <Button
            variant='ghost'
            disabled={wizard.step === 1}
            onClick={() => patch({ step: wizard.step - 1 })}
          >
            <ArrowLeft className='size-[15px]' strokeWidth={2} aria-hidden />
            {t('wizBack')}
          </Button>
          <span className='flex-1' />
          <Button variant='ghost' onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button variant='primary' onClick={advance}>
            {last ? (
              <>
                <Check className='size-[15px]' strokeWidth={2.4} aria-hidden />
                {t('createCampaign')}
              </>
            ) : (
              <>
                {t('wizNext')}
                <ArrowRight
                  className='size-[15px]'
                  strokeWidth={2}
                  aria-hidden
                />
              </>
            )}
          </Button>
        </>
      }
    >
      <ol className='mb-5 flex flex-wrap items-center gap-x-2 gap-y-1.5'>
        {CAMPAIGN_WIZARD_STEPS.map(({ step: index, titleKey }) => {
          const done = index < wizard.step;
          const now = index === wizard.step;
          return (
            <li key={index} className='flex items-center gap-2'>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold',
                  now && 'bg-[var(--pv2-ink)] text-[var(--pv2-paper)]',
                  done &&
                    'bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)]',
                  !now && !done && 'text-[var(--pv2-faint)]'
                )}
              >
                {done ? (
                  <Check className='size-3' strokeWidth={2.6} aria-hidden />
                ) : (
                  <span className='tabular-nums'>{index}</span>
                )}
                {t(titleKey)}
              </span>
              {index < WIZARD_LAST_STEP ? (
                <ArrowRight
                  className='size-3 text-[var(--pv2-faint)]'
                  strokeWidth={2.4}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      {error ? (
        <p
          role='alert'
          className='mb-4 rounded-[var(--pv2-r-sm)] bg-[color-mix(in_srgb,var(--pv2-error)_10%,transparent)] px-4 py-2.5 text-[12.5px] font-semibold text-[var(--pv2-error)]'
        >
          {t(error)}
        </p>
      ) : null}

      {wizard.step === 1 ? (
        <>
          <fieldset className='mb-5'>
            <legend className={legend}>{t('typeLegend')}</legend>
            <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
              {CAMPAIGN_TYPE_IDS.map(id => {
                const on = wizard.type === id;
                return (
                  <button
                    key={id}
                    type='button'
                    aria-pressed={on}
                    onClick={() => patch({ type: id as CampaignType })}
                    className={cn(
                      'flex cursor-pointer items-start gap-2.5 rounded-[var(--pv2-r)] border px-3 py-3 text-left transition-colors',
                      'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
                      on
                        ? 'border-[var(--pv2-electric)] bg-[var(--pv2-electric-soft)]'
                        : 'border-[var(--pv2-hair)] hover:border-[var(--pv2-slate-300)] hover:bg-[var(--pv2-canvas)]'
                    )}
                  >
                    <TypeSwatch type={id} size={28} radius={8} />
                    <span className='min-w-0'>
                      <span className='block text-[12.5px] font-semibold text-[var(--pv2-ink)]'>
                        {t(CAMPAIGN_TYPES[id].labelKey)}
                      </span>
                      <span className='block text-[11px] leading-relaxed text-[var(--pv2-mut)]'>
                        {t(CAMPAIGN_TYPES[id].descKey)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Field label={t('fieldName')}>
            <TextInput
              value={wizard.name}
              onChange={e => patch({ name: e.target.value })}
              placeholder={t('fieldNamePlaceholder')}
            />
          </Field>

          <div className='grid gap-x-4 sm:grid-cols-3'>
            <Field label={t('fieldOwner')}>
              <TextSelect
                value={wizard.owner}
                onChange={e => patch({ owner: e.target.value })}
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
                value={wizard.startDate}
                onChange={e => patch({ startDate: e.target.value })}
              />
            </Field>
            <Field
              label={isAlwaysOn(wizard) ? t('fieldEndAlways') : t('fieldEnd')}
            >
              <TextInput
                type='date'
                value={isAlwaysOn(wizard) ? '' : wizard.endDate}
                disabled={isAlwaysOn(wizard)}
                onChange={e => patch({ endDate: e.target.value })}
              />
            </Field>
          </div>
        </>
      ) : null}

      {wizard.step === 2 ? (
        <>
          <Field label={t('fieldObjective')}>
            <TextTextarea
              rows={3}
              value={wizard.objective}
              onChange={e => patch({ objective: e.target.value })}
              placeholder={t('fieldObjectivePlaceholder')}
            />
          </Field>
          <Field label={t('fieldAudience')}>
            <TextInput
              value={wizard.audience}
              onChange={e => patch({ audience: e.target.value })}
            />
          </Field>
          <div className='grid gap-x-4 sm:grid-cols-2'>
            <Field label={t('fieldMessage')}>
              <TextInput
                value={wizard.message}
                onChange={e => patch({ message: e.target.value })}
              />
            </Field>
            <Field label={t('fieldOffer')}>
              <TextInput
                value={wizard.offer}
                onChange={e => patch({ offer: e.target.value })}
              />
            </Field>
          </div>
          <div className='grid gap-x-4 sm:grid-cols-2'>
            <Field label={t('fieldGoal')}>
              <TextSelect
                value={wizard.goal ?? ''}
                onChange={e =>
                  patch({
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
            <Field label={t('fieldBudget')}>
              <TextInput
                value={wizard.budget}
                onChange={e => patch({ budget: e.target.value })}
                placeholder='240000'
                inputMode='numeric'
              />
            </Field>
          </div>

          <fieldset>
            <legend className={legend}>{t('fieldChannels')}</legend>
            <div className='flex flex-wrap gap-1.5'>
              {CAMPAIGN_CHANNELS.map(channel => (
                <button
                  key={channel}
                  type='button'
                  aria-pressed={wizard.channels.includes(channel)}
                  onClick={() => toggle('channels', channel)}
                  className={chip(wizard.channels.includes(channel))}
                >
                  {channel}
                </button>
              ))}
            </div>
          </fieldset>
        </>
      ) : null}

      {wizard.step === 3 ? (
        <>
          <p className='mb-4 text-[13px] leading-relaxed text-[var(--pv2-mut)]'>
            {t('wizRouteLead')}
          </p>
          <div className='flex flex-col gap-2'>
            {blueprints.map(blueprint => {
              const on = wizard.journeyId === blueprint.id;
              const carries = routeMastersFor(blueprint.id, blueprints).length;
              return (
                <button
                  key={blueprint.id}
                  type='button'
                  aria-pressed={on}
                  onClick={() =>
                    patch({ journeyId: blueprint.id, skipJourney: false })
                  }
                  className={cn(
                    'cursor-pointer rounded-[var(--pv2-r)] border px-4 py-3.5 text-left transition-colors',
                    'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
                    on
                      ? 'border-[var(--pv2-electric)] bg-[var(--pv2-electric-soft)]'
                      : 'border-[var(--pv2-hair)] hover:border-[var(--pv2-slate-300)] hover:bg-[var(--pv2-canvas)]'
                  )}
                >
                  <span className='flex items-center gap-2'>
                    <Route
                      className='size-4 shrink-0 text-[var(--pv2-electric)]'
                      strokeWidth={2}
                      aria-hidden
                    />
                    <span className='truncate text-[13.5px] font-semibold text-[var(--pv2-ink)]'>
                      {blueprint.name}
                    </span>
                    {on ? (
                      <Check
                        className='ml-auto size-4 shrink-0 text-[var(--pv2-electric)]'
                        strokeWidth={2.6}
                        aria-hidden
                      />
                    ) : null}
                  </span>
                  <span className='mt-1 block text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
                    {blueprint.tagline}
                  </span>
                  {carries ? (
                    <span className='mt-1.5 block text-[11px] text-[var(--pv2-faint)]'>
                      {t('routeCarries', { count: carries })}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <button
            type='button'
            aria-pressed={wizard.skipJourney}
            onClick={() =>
              patch({ skipJourney: !wizard.skipJourney, journeyId: null })
            }
            className={cn(
              'mt-3 w-full cursor-pointer rounded-[var(--pv2-r)] border border-dashed px-4 py-3 text-left transition-colors',
              'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
              wizard.skipJourney
                ? 'border-[var(--pv2-ink)] bg-[var(--pv2-canvas)]'
                : 'border-[var(--pv2-hair)] hover:border-[var(--pv2-slate-300)]'
            )}
          >
            <span className='block text-[12.5px] font-semibold text-[var(--pv2-ink)]'>
              {t('wizRouteSkip')}
            </span>
            <span className='mt-0.5 block text-[11.5px] leading-relaxed text-[var(--pv2-mut)]'>
              {t('wizRouteSkipHint')}
            </span>
          </button>
        </>
      ) : null}

      {wizard.step === 4 ? (
        <>
          <fieldset className='mb-5'>
            <legend className={legend}>{t('wizSubjects')}</legend>
            {products.length ? (
              <div className='flex flex-wrap gap-1.5'>
                {products.map(product => (
                  <button
                    key={product.id}
                    type='button'
                    aria-pressed={wizard.subjects.includes(product.id)}
                    onClick={() => toggle('subjects', product.id)}
                    className={chip(wizard.subjects.includes(product.id))}
                  >
                    {product.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className='text-[12.5px] text-[var(--pv2-faint)]'>
                {t('addItemNoProducts')}
              </p>
            )}
          </fieldset>

          <fieldset className='mb-5'>
            <legend className={legend}>{t('wizTopics')}</legend>
            <p className='mb-2.5 text-[12px] leading-relaxed text-[var(--pv2-mut)]'>
              {t('addTopicHint')}
            </p>
            <div className='flex flex-wrap items-center gap-2'>
              <TextInput
                value={topicDraft}
                onChange={e => setTopicDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTopic();
                  }
                }}
                placeholder={t('addTopicPlaceholder')}
                className='max-w-[300px]'
              />
              <Button variant='ghost' onClick={addTopic}>
                <Plus className='size-[15px]' strokeWidth={2.4} aria-hidden />
                {t('addTopic')}
              </Button>
            </div>
            {wizard.topics.length ? (
              <div className='mt-2.5 flex flex-wrap gap-1.5'>
                {wizard.topics.map(topic => (
                  <span
                    key={topic}
                    className='inline-flex items-center gap-1.5 rounded-full bg-[var(--pv2-canvas)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--pv2-mut)]'
                  >
                    {topic}
                    <button
                      type='button'
                      aria-label={t('wizTopicRemove', { name: topic })}
                      onClick={() => toggle('topics', topic)}
                      className='grid size-4 cursor-pointer place-items-center rounded-full text-[var(--pv2-faint)] hover:text-[var(--pv2-error)] focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
                    >
                      <X className='size-3' strokeWidth={2.4} aria-hidden />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </fieldset>

          <p className='rounded-[var(--pv2-r-sm)] bg-[var(--pv2-canvas)] px-4 py-3 text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
            {wizard.journeyId
              ? t('wizPreviewRouted', {
                  subjects: derived.length,
                  experiences: routeMastersFor(wizard.journeyId, blueprints)
                    .length,
                })
              : t('wizPreviewBare', { subjects: derived.length })}
          </p>
        </>
      ) : null}
    </Modal>
  );
};
