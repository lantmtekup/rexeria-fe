'use client';

import { useTranslations } from 'next-intl';

import { LAYER_COMPONENT_LABEL_KEY } from '@/lib/portal-v2/experiences/constants';
import {
  COVERAGE_TONE_STYLE,
  ROLE_STYLE,
  coverageTone,
} from '@/lib/portal-v2/experiences/roleStyles';
import type { ExperienceView } from '@/lib/portal-v2/experiences/types';

type ExperienceSignalsPaneProps = {
  experience: ExperienceView;
};

/**
 * What this experience can report, before any traffic arrives.
 *
 * Reduced from the prototype on purpose: the `SIGNAL_TYPES` taxonomy and the
 * `meaningOf()` sentence machinery ("Customer compared two products") are the
 * editor's job. This is a read-only surface, so it shows which components carry
 * a tracking point and which do not, and stops there.
 */
export const ExperienceSignalsPane = ({
  experience,
}: ExperienceSignalsPaneProps) => {
  const t = useTranslations('portalV2.experiences');
  const { coverage, layers } = experience;
  const toneStyle = COVERAGE_TONE_STYLE[coverageTone(coverage.pct)];

  const tracked = layers.flatMap((layer, i) =>
    layer.trackedComponents.map(component => ({ layer, i, component }))
  );

  const blind = layers.flatMap((layer, i) =>
    layer.components
      .filter(c => !layer.trackedComponents.includes(c))
      .map(component => ({ layer, i, component }))
  );

  return (
    <div className='flex flex-col gap-5'>
      <section>
        <div className='flex items-baseline justify-between gap-3'>
          <h3 className='font-[family-name:var(--pv2-disp)] text-[15px] font-bold tracking-[-0.02em] text-[var(--pv2-ink)]'>
            {t('sectionCoverage')}
          </h3>
          <span
            className='font-[family-name:var(--pv2-disp)] text-[15px] font-bold tabular-nums'
            style={{ color: toneStyle.fg }}
          >
            {coverage.pct}%
          </span>
        </div>
        <div className='mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--pv2-canvas)]'>
          <span
            className='block h-full rounded-full'
            style={{ width: `${coverage.pct}%`, background: toneStyle.bg }}
          />
        </div>
        <p className='mt-2.5 max-w-[62ch] text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
          {t('coverageBody', {
            tracked: coverage.trackedComponents,
            total: coverage.components,
            trackedBlocks: coverage.trackedBlocks,
            blocks: coverage.blocks,
          })}
        </p>
      </section>

      <section className='border-t border-[var(--pv2-hair)] pt-5'>
        <h3 className='font-[family-name:var(--pv2-disp)] text-[15px] font-bold tracking-[-0.02em] text-[var(--pv2-ink)]'>
          {t('signalsCount', { count: tracked.length })}
        </h3>

        {tracked.length ? (
          <ul className='mt-3 flex flex-col gap-1.5'>
            {tracked.map(({ layer, i, component }) => {
              const role = ROLE_STYLE[layer.role];
              return (
                <li
                  key={`${i}-${component}`}
                  className='flex flex-wrap items-center gap-2 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] px-3 py-2'
                >
                  <span className='grid size-5 shrink-0 place-items-center rounded-md bg-[var(--pv2-canvas)] text-[10px] font-bold text-[var(--pv2-mut)] tabular-nums'>
                    {i + 1}
                  </span>
                  <span className='text-[12.5px] font-semibold text-[var(--pv2-ink)]'>
                    {layer.name}
                  </span>
                  <span
                    className='inline-flex rounded-full px-1.5 py-px text-[9px] font-bold tracking-[0.05em] uppercase'
                    style={{ background: role.bg, color: role.fg }}
                  >
                    {t(role.labelKey)}
                  </span>
                  <span className='ml-auto text-[11.5px] text-[var(--pv2-mut)]'>
                    {t(LAYER_COMPONENT_LABEL_KEY[component])}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className='mt-2 text-[12.5px] text-[var(--pv2-faint)]'>
            {t('signalsEmpty')}
          </p>
        )}
      </section>

      {blind.length ? (
        <section className='border-t border-[var(--pv2-hair)] pt-5'>
          <h3 className='font-[family-name:var(--pv2-disp)] text-[15px] font-bold tracking-[-0.02em] text-[var(--pv2-ink)]'>
            {t('sectionBlindSpots')}
          </h3>
          <div className='mt-2.5 flex flex-wrap gap-1.5'>
            {blind.map(({ layer, i, component }) => (
              <span
                key={`${i}-${component}`}
                className='rounded-full border border-dashed border-[var(--pv2-hair)] px-2.5 py-1 text-[11.5px] text-[var(--pv2-faint)]'
              >
                {t('coverageBlind', {
                  name: `${layer.name} · ${t(LAYER_COMPONENT_LABEL_KEY[component])}`,
                })}
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};
