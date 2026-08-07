'use client';

import { useTranslations } from 'next-intl';

import { FunnelStack } from '@/components/organisms/portal-v2/experiences/FunnelStack';
import { EXPERIENCE_INTERACTIONS } from '@/lib/portal-v2/experiences/constants';
import {
  COVERAGE_TONE_STYLE,
  ROLE_STYLE,
  coverageTone,
  objectivePillStyle,
} from '@/lib/portal-v2/experiences/roleStyles';
import type { ExperienceView } from '@/lib/portal-v2/experiences/types';
import { cn } from '@/lib/cn';

type ExperienceDetailsPaneProps = {
  experience: ExperienceView;
};

const OBJECTIVE_LABEL_KEY = {
  insight: 'objInsight',
  lead: 'objLead',
  cta: 'objCta',
  convert: 'objConvert',
} as const;

const VEHICLE_LABEL_KEY = {
  curated: 'vehicleCurated',
  ads: 'vehicleAds',
  showcase: 'vehicleShowcase',
  microsite: 'vehicleMicrosite',
} as const;

/** `Block.scope` — who the block belongs to. BLOCK rows only. */
const SCOPE_LABEL_KEY = {
  system: 'scopeSystem',
  brand_private: 'scopeBrandPrivate',
  brand_team: 'scopeBrandTeam',
  brand_public: 'scopeBrandPublic',
} as const;

/** `Block.supported_surfaces` — where the block is allowed to land. */
const SURFACE_LABEL_KEY = {
  landing: 'surfaceLanding',
  ad: 'surfaceAd',
  curate: 'surfaceCurate',
} as const;

const ReadRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className='flex items-baseline justify-between gap-3 py-1.5'>
    <span className='shrink-0 text-[11px] font-semibold tracking-[0.03em] text-[var(--pv2-faint)] uppercase'>
      {label}
    </span>
    <span className='min-w-0 text-right text-[12.5px] text-[var(--pv2-ink)]'>
      {children}
    </span>
  </div>
);

const STATUS_LABEL_KEY = {
  draft: 'statusDraft',
  published: 'statusPublished',
  archived: 'statusArchived',
} as const;

export const ExperienceDetailsPane = ({
  experience,
}: ExperienceDetailsPaneProps) => {
  const t = useTranslations('portalV2.experiences');
  const { coverage, layers } = experience;
  const tone = coverageTone(coverage.pct);
  const toneStyle = COVERAGE_TONE_STYLE[tone];
  const pill = objectivePillStyle(experience.objective);
  const isBlock = experience.kind === 'block';

  return (
    <div className='grid gap-6 md:grid-cols-[minmax(0,1fr)_270px]'>
      <div className='min-w-0'>
        <section className='mb-5 border-b border-[var(--pv2-hair)] pb-5'>
          <FunnelStack layers={layers} />
          <p className='mt-2.5 text-[12px] text-[var(--pv2-mut)]'>
            {t('stackCaption', { count: layers.length })}
          </p>
        </section>

        <section className='mb-5 border-b border-[var(--pv2-hair)] pb-5'>
          <h3 className='font-[family-name:var(--pv2-disp)] text-[15px] font-bold tracking-[-0.02em] text-[var(--pv2-ink)]'>
            {t('sectionProfile')}
          </h3>
          <p className='mt-2 text-[13px] leading-relaxed text-[var(--pv2-ink)]'>
            {experience.tagline}
          </p>
          <p className='mt-2 text-[12.5px] leading-relaxed text-[var(--pv2-mut)]'>
            {experience.summary}
          </p>
        </section>

        <section>
          <h3 className='font-[family-name:var(--pv2-disp)] text-[15px] font-bold tracking-[-0.02em] text-[var(--pv2-ink)]'>
            {t('sectionLayers')}
          </h3>
          <ol className='mt-3 flex flex-col gap-2.5'>
            {layers.map((layer, i) => {
              const role = ROLE_STYLE[layer.role];
              return (
                <li
                  key={`${layer.role}-${i}`}
                  className='flex gap-3 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] px-3 py-2.5'
                >
                  <span className='mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-[var(--pv2-canvas)] text-[10px] font-bold text-[var(--pv2-mut)] tabular-nums'>
                    {i + 1}
                  </span>
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='text-[13px] font-semibold text-[var(--pv2-ink)]'>
                        {layer.name}
                      </span>
                      <span
                        className='inline-flex rounded-full px-1.5 py-px text-[9px] font-bold tracking-[0.05em] uppercase'
                        style={{ background: role.bg, color: role.fg }}
                      >
                        {t(role.labelKey)}
                      </span>
                      <span
                        className={cn(
                          'ml-auto text-[10.5px] font-semibold',
                          layer.trackedComponents.length
                            ? 'text-[var(--pv2-mut)]'
                            : 'text-[var(--pv2-faint)]'
                        )}
                      >
                        {layer.trackedComponents.length
                          ? t('layerSignals', {
                              count: layer.trackedComponents.length,
                            })
                          : t('layerNotTracked')}
                      </span>
                    </div>
                    <p className='mt-1 text-[12px] leading-relaxed text-[var(--pv2-mut)]'>
                      {layer.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      <aside className='min-w-0'>
        <section className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] px-3.5 py-3'>
          <h3 className='mb-1 font-[family-name:var(--pv2-disp)] text-[13px] font-bold tracking-[-0.02em] text-[var(--pv2-ink)]'>
            {t('sectionOrganization')}
          </h3>
          {/* Same section, different facts. A block knows what it is (type,
              scope, surfaces, how often it has been used); a page knows where
              it lives (slug, external URL, vehicle). Neither is shown the
              other's empty rows. */}
          <div className='divide-y divide-[var(--pv2-hair)]'>
            <ReadRow label={t('fieldKind')}>
              {t(isBlock ? 'kindBlock' : 'kindPage')}
            </ReadRow>

            {isBlock ? (
              <ReadRow label={t('fieldTypeCode')}>
                <span className='font-mono text-[11.5px]'>
                  {experience.typeCode ?? '—'}
                </span>
              </ReadRow>
            ) : (
              <ReadRow label={t('fieldVehicle')}>
                {t(VEHICLE_LABEL_KEY[experience.vehicle])}
              </ReadRow>
            )}

            <ReadRow label={t('fieldObjective')}>
              <span
                className='inline-flex items-center rounded-full px-2 py-[3px] text-[9.5px] font-bold tracking-[0.05em] uppercase'
                style={{ background: pill.bg, color: pill.fg }}
              >
                {t(OBJECTIVE_LABEL_KEY[experience.objective])}
              </span>
            </ReadRow>

            {isBlock ? (
              <>
                {experience.scope ? (
                  <ReadRow label={t('fieldScope')}>
                    {t(SCOPE_LABEL_KEY[experience.scope])}
                  </ReadRow>
                ) : null}
                <ReadRow label={t('fieldSurfaces')}>
                  {experience.supportedSurfaces?.length ? (
                    experience.supportedSurfaces
                      .map(s => t(SURFACE_LABEL_KEY[s]))
                      .join(' · ')
                  ) : (
                    <span className='text-[var(--pv2-faint)]'>
                      {t('surfacesNone')}
                    </span>
                  )}
                </ReadRow>
                <ReadRow label={t('fieldUsage')}>
                  {t('blockUsageCount', { count: experience.usageCount ?? 0 })}
                </ReadRow>
                {experience.tags?.length ? (
                  <ReadRow label={t('fieldTags')}>
                    {experience.tags.join(' · ')}
                  </ReadRow>
                ) : null}
              </>
            ) : (
              <>
                <ReadRow label={t('fieldSlug')}>
                  {experience.slug ? (
                    <span className='font-mono text-[11.5px]'>
                      /{experience.slug}
                    </span>
                  ) : (
                    <span className='text-[var(--pv2-faint)]'>
                      {t('noSlug')}
                    </span>
                  )}
                </ReadRow>
                <ReadRow label={t('fieldStatus')}>
                  {t(STATUS_LABEL_KEY[experience.status])}
                </ReadRow>
                {experience.externalUrl ? (
                  <ReadRow label={t('fieldExternal')}>
                    <span className='font-mono text-[11.5px] break-all'>
                      {experience.externalUrl}
                    </span>
                  </ReadRow>
                ) : null}
              </>
            )}

            <ReadRow label={t('fieldUpdated')}>
              {experience.updatedLabel}
            </ReadRow>
          </div>

          <div className='mt-3 border-t border-[var(--pv2-hair)] pt-3'>
            <span className='text-[11px] font-semibold tracking-[0.03em] text-[var(--pv2-faint)] uppercase'>
              {t('fieldInteractions')}
            </span>
            {experience.interactions.length ? (
              <div className='mt-1.5 flex flex-wrap gap-1.5'>
                {EXPERIENCE_INTERACTIONS.filter(i =>
                  experience.interactions.includes(i.id)
                ).map(i => (
                  <span
                    key={i.id}
                    title={t(i.descKey)}
                    className='cursor-help rounded-full border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-2 py-0.5 text-[11px] text-[var(--pv2-mut)]'
                  >
                    {t(i.labelKey)}
                  </span>
                ))}
              </div>
            ) : (
              <p className='mt-1.5 text-[12px] text-[var(--pv2-faint)]'>
                {t('interactionNone')}
              </p>
            )}
          </div>
        </section>

        <section className='mt-3 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] px-3.5 py-3'>
          <h3 className='font-[family-name:var(--pv2-disp)] text-[13px] font-bold tracking-[-0.02em] text-[var(--pv2-ink)]'>
            {t('sectionCoverage')}
          </h3>
          <p
            className='mt-1 font-[family-name:var(--pv2-disp)] text-[1.75rem] leading-none font-bold tabular-nums'
            style={{ color: toneStyle.fg }}
          >
            {coverage.pct}%
          </p>
          <div className='mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--pv2-canvas)]'>
            <span
              className='block h-full rounded-full'
              style={{
                width: `${coverage.pct}%`,
                background: toneStyle.bg,
              }}
            />
          </div>
          <p className='mt-2.5 text-[12px] leading-relaxed text-[var(--pv2-mut)]'>
            {t('coverageBody', {
              tracked: coverage.trackedComponents,
              total: coverage.components,
              trackedBlocks: coverage.trackedBlocks,
              blocks: coverage.blocks,
            })}
          </p>
        </section>
      </aside>
    </div>
  );
};
