'use client';

import { Check, Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { cn } from '@/lib/cn';
import {
  STAGE_MIN,
  STAGE_TEMPLATES,
  stageCount,
} from '@/lib/portal-v2/journeys/stages';
import type { Journey, JourneyStage } from '@/lib/portal-v2/journeys/types';

/**
 * The journey's spine.
 *
 * A funnel is not the same shape in every business, and a tool that insists on
 * Awareness → Retention is telling a property developer and a SaaS onboarding
 * team that they run the same play. So the five phases are the brand's to name.
 *
 * APPLYING A FRAMEWORK MOVES NOTHING. It re-labels the phases where they stand,
 * positionally, so the cards keep their columns and only the words change. That
 * is what makes trying one cheap: if it reads wrong, Cmd+Z, or pick another.
 */

type StageFrameworkModalProps = {
  draft: Journey;
  stages: JourneyStage[];
  onClose: () => void;
  onApply: (stages: JourneyStage[]) => void;
  onRename: (index: number, name: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
};

export const StageFrameworkModal = ({
  draft,
  stages,
  onClose,
  onApply,
  onRename,
  onAdd,
  onRemove,
}: StageFrameworkModalProps) => {
  const t = useTranslations('portalV2.journeys');

  /* A framework is "in use" when every phase it names is where it says. */
  const active = STAGE_TEMPLATES.find(template =>
    template.stages.every((stage, index) => stages[index]?.name === stage.name)
  );

  return (
    <Modal
      open
      onClose={onClose}
      title={t('frameworkTitle')}
      subtitle={t('frameworkSubtitle')}
      footer={
        <>
          <span className='flex-1' />
          <Button variant='ghost' size='sm' onClick={onClose}>
            {t('close')}
          </Button>
        </>
      }
    >
      <section className='mb-5 border-b border-[var(--pv2-hair)] pb-5'>
        <h3 className='mb-2 text-[10.5px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase'>
          {t('frameworkPhases')}
        </h3>

        <ul className='flex flex-col gap-1.5'>
          {stages.map((stage, index) => {
            const count = stageCount(draft, index);
            const removable = count === 0 && stages.length > STAGE_MIN;

            return (
              <li key={stage.id} className='flex items-center gap-2'>
                <span className='w-4 shrink-0 text-[11px] text-[var(--pv2-faint)] tabular-nums'>
                  {index + 1}
                </span>
                <input
                  value={stage.name}
                  aria-label={t('stageRename')}
                  onChange={e => onRename(index, e.target.value)}
                  className={cn(
                    'min-w-0 flex-1 rounded-[var(--pv2-r-sm)] border border-[var(--pv2-hair)] px-2 py-1.5',
                    'text-[13px] text-[var(--pv2-ink)]',
                    'focus:border-[var(--pv2-electric)] focus:outline-none'
                  )}
                />
                <span className='w-[86px] shrink-0 text-right text-[11px] text-[var(--pv2-faint)] tabular-nums'>
                  {stage.kind === 'convert'
                    ? t('frameworkConvertPhase')
                    : t('stageNodeCount', { count })}
                </span>
                <button
                  type='button'
                  disabled={!removable}
                  aria-label={t('stageRemoveAria', { name: stage.name })}
                  title={removable ? t('stageRemove') : t('stageRemoveBlocked')}
                  onClick={() => onRemove(index)}
                  className={cn(
                    'grid size-7 shrink-0 cursor-pointer place-items-center rounded-[var(--pv2-r-sm)]',
                    'text-[var(--pv2-faint)] transition-colors',
                    'hover:bg-[color-mix(in_srgb,var(--pv2-error)_12%,transparent)] hover:text-[var(--pv2-error)]',
                    'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
                    'disabled:pointer-events-none disabled:opacity-30'
                  )}
                >
                  <X className='size-3.5' strokeWidth={2.4} aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>

        <div className='mt-2.5'>
          <Button variant='dashed' size='sm' onClick={onAdd}>
            <Plus className='size-3' strokeWidth={2.6} aria-hidden />
            {t('stageAdd')}
          </Button>
        </div>
      </section>

      <section>
        <h3 className='mb-1 text-[10.5px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase'>
          {t('frameworkPresets')}
        </h3>
        <p className='mb-2.5 text-[12px] leading-relaxed text-[var(--pv2-mut)]'>
          {t('frameworkNote')}
        </p>

        <ul className='flex flex-col gap-1.5'>
          {STAGE_TEMPLATES.map(template => {
            const on = active?.id === template.id;

            return (
              <li key={template.id}>
                <button
                  type='button'
                  aria-pressed={on}
                  onClick={() => onApply(template.stages)}
                  className={cn(
                    'flex w-full cursor-pointer items-start gap-2.5 rounded-[var(--pv2-r)] border px-3 py-2.5 text-left',
                    'transition-colors',
                    on
                      ? 'border-[var(--pv2-electric)] bg-[var(--pv2-electric-soft)]'
                      : 'border-[var(--pv2-hair)] hover:bg-[var(--pv2-canvas)]',
                    'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border',
                      on
                        ? 'border-[var(--pv2-electric)] bg-[var(--pv2-electric)] text-[var(--pv2-paper)]'
                        : 'border-[var(--pv2-slate-300)]'
                    )}
                    aria-hidden
                  >
                    {on ? <Check className='size-2.5' strokeWidth={3} /> : null}
                  </span>

                  <span className='min-w-0 flex-1'>
                    <span className='flex items-baseline gap-2'>
                      <span className='text-[13px] font-semibold text-[var(--pv2-ink)]'>
                        {template.name}
                      </span>
                      <span className='truncate text-[11.5px] text-[var(--pv2-faint)]'>
                        {template.for}
                      </span>
                    </span>
                    <span className='mt-1 flex flex-wrap gap-1'>
                      {template.stages.map(stage => (
                        <span
                          key={stage.id}
                          className={cn(
                            'rounded-full px-1.5 py-0.5 text-[10.5px]',
                            stage.kind === 'convert'
                              ? 'bg-[color-mix(in_srgb,var(--pv2-success)_16%,transparent)] text-[#0e9d6e]'
                              : 'bg-[var(--pv2-canvas)] text-[var(--pv2-mut)]'
                          )}
                        >
                          {stage.name}
                        </span>
                      ))}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </Modal>
  );
};
