'use client';

import { useTranslations } from 'next-intl';

import { LayerStack } from '@/components/organisms/portal-v2/experiences/LayerStack';
import { EXPERIENCE_INTERACTIONS } from '@/lib/portal-v2/experiences/constants';
import {
  COVERAGE_TONE_STYLE,
  coverageTone,
  objectivePillStyle,
} from '@/lib/portal-v2/experiences/roleStyles';
import type {
  ExperienceLayer,
  ExperienceView,
  SignalCoverage,
} from '@/lib/portal-v2/experiences/types';
import { cn } from '@/lib/cn';

type ExperienceDetailsPaneProps = {
  experience: ExperienceView;
  /** Nạp từ `GET /experiences/{id}/coverage`; null = chưa đo được. */
  coverage?: SignalCoverage | null;
  /** Block thật từ `GET /experiences/{id}`; null = chưa nạp xong hoặc hỏng. */
  layers: ExperienceLayer[] | null;
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

const CATEGORY_LABEL_KEY = {
  blocks: 'catBlocks',
  collection: 'catCollection',
} as const;

const STATUS_LABEL_KEY = {
  draft: 'statusDraft',
  published: 'statusPublished',
  archived: 'statusArchived',
} as const;

/** Khối viền hairline — prototype `.box` (~L5092). */
const Box = ({
  title,
  aside,
  children,
  className,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={cn(
      'rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] px-4 py-3.5',
      className
    )}
  >
    <div className='mb-2.5 flex items-baseline gap-3'>
      <h3 className='font-[family-name:var(--pv2-disp)] text-[14px] font-bold tracking-[-0.02em] text-[var(--pv2-ink)]'>
        {title}
      </h3>
      {aside ? (
        <span className='ml-auto shrink-0 text-[11px] text-[var(--pv2-faint)]'>
          {aside}
        </span>
      ) : null}
    </div>
    {children}
  </section>
);

/**
 * Nhãn TRÊN, giá trị DƯỚI — prototype `.rofield` (~L7504).
 *
 * Bản trước xếp nhãn trái / giá trị phải trên cùng một dòng, nên tóm tắt dài
 * hai câu bị ép vào nửa khung bên phải và xuống dòng lởm chởm.
 */
const ReadField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className='py-2'>
    <span className='block text-[10.5px] font-bold tracking-[0.06em] text-[var(--pv2-faint)] uppercase'>
      {label}
    </span>
    <span className='mt-1 block text-[13.5px] leading-relaxed font-medium text-[var(--pv2-ink)]'>
      {children}
    </span>
  </div>
);

/** Trường trống phải NÓI là trống — không để lại một khoảng trắng câm. */
const NotSet = () => {
  const t = useTranslations('portalV2.experiences');
  return <i className='font-normal text-[var(--pv2-faint)]'>{t('notSet')}</i>;
};

export const ExperienceDetailsPane = ({
  experience,
  coverage = null,
  layers,
}: ExperienceDetailsPaneProps) => {
  const t = useTranslations('portalV2.experiences');
  const tone = coverageTone(coverage?.pct ?? 0);
  const toneStyle = COVERAGE_TONE_STYLE[tone];
  const pill = objectivePillStyle(experience.objective);

  // Layer không báo gì — prototype liệt kê chúng ngay dưới con số, vì đó mới
  // là phần hành động được. Chỉ tính khi ĐÃ nạp xong.
  const silent = (layers ?? []).filter(l => !l.components.some(c => c.tracked));

  return (
    <div className='grid gap-5 md:grid-cols-[minmax(0,1fr)_268px]'>
      <div className='flex min-w-0 flex-col gap-3.5'>
        <Box
          title={t('sectionProfile')}
          aside={t(VEHICLE_LABEL_KEY[experience.vehicle])}
        >
          {layers === null ? (
            <p className='py-6 text-center text-[12.5px] text-[var(--pv2-faint)]'>
              {t('layersLoading')}
            </p>
          ) : layers.length ? (
            <>
              <LayerStack layers={layers} />
              <p className='mt-2.5 text-center text-[11.5px] leading-relaxed text-[var(--pv2-mut)]'>
                {t('stackCaption', { count: layers.length })}
              </p>
            </>
          ) : (
            <p className='py-6 text-center text-[12.5px] text-[var(--pv2-faint)]'>
              {t('layersEmpty')}
            </p>
          )}
        </Box>

        <Box title={t('sectionExperience')}>
          <div className='divide-y divide-[var(--pv2-hair)]'>
            <ReadField label={t('fieldName')}>{experience.name}</ReadField>
            <ReadField label={t('fieldTagline')}>
              {experience.tagline || <NotSet />}
            </ReadField>
            <ReadField label={t('fieldSummary')}>
              {experience.summary || <NotSet />}
            </ReadField>
          </div>
        </Box>
      </div>

      <aside className='flex min-w-0 flex-col gap-3'>
        <Box title={t('sectionOrganization')}>
          <div className='divide-y divide-[var(--pv2-hair)]'>
            <ReadField label={t('fieldCategory')}>
              {t(CATEGORY_LABEL_KEY[experience.category])}
            </ReadField>
            <ReadField label={t('fieldVehicle')}>
              {t(VEHICLE_LABEL_KEY[experience.vehicle])}
            </ReadField>
            <ReadField label={t('fieldObjective')}>
              <span
                className='inline-flex items-center rounded-full px-2 py-[3px] text-[9.5px] font-bold tracking-[0.05em] uppercase'
                style={{ background: pill.bg, color: pill.fg }}
              >
                {t(OBJECTIVE_LABEL_KEY[experience.objective])}
              </span>
            </ReadField>
            <ReadField label={t('fieldInteractions')}>
              {experience.interactions.length ? (
                <span className='flex flex-wrap gap-1.5'>
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
                </span>
              ) : (
                <span className='text-[12.5px] font-normal text-[var(--pv2-faint)]'>
                  {t('interactionNone')}
                </span>
              )}
            </ReadField>
            {/* Ba dòng dưới KHÔNG có trong prototype. Giữ vì chúng là thứ duy
                nhất trên màn này nối bản ghi với trang thật ngoài kia. */}
            <ReadField label={t('fieldSlug')}>
              {experience.slug ? (
                <span className='font-mono text-[11.5px]'>
                  /{experience.slug}
                </span>
              ) : (
                <span className='text-[12.5px] font-normal text-[var(--pv2-faint)]'>
                  {t('noSlug')}
                </span>
              )}
            </ReadField>
            <ReadField label={t('fieldStatus')}>
              {t(STATUS_LABEL_KEY[experience.status])}
            </ReadField>
            <ReadField label={t('fieldUpdated')}>
              {experience.updatedLabel}
            </ReadField>
          </div>
        </Box>

        <section
          className='rounded-[var(--pv2-r)] border px-4 py-3.5'
          /* Viền theo tông — prototype `border-color:${cc}`. Con số một mình
             không nói được 29% là tệ; cái viền nói. */
          style={{
            borderColor: coverage ? toneStyle.bg : 'var(--pv2-hair)',
          }}
        >
          <h3 className='font-[family-name:var(--pv2-disp)] text-[14px] font-bold tracking-[-0.02em] text-[var(--pv2-ink)]'>
            {t('sectionCoverage')}
          </h3>
          {coverage ? (
            <>
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
              {silent.length ? (
                <ul className='mt-2.5 flex flex-col gap-1 border-t border-[var(--pv2-hair)] pt-2.5'>
                  {silent.map((l, i) => (
                    <li
                      key={`${l.blockType ?? l.name}-${i}`}
                      className='flex items-center gap-2 text-[11.5px] text-[var(--pv2-mut)]'
                    >
                      <span
                        className='grid size-4 shrink-0 place-items-center rounded-full text-[9px] font-bold text-white'
                        style={{ background: toneStyle.bg }}
                        aria-hidden
                      >
                        !
                      </span>
                      <span className='min-w-0 truncate'>
                        {t('coverageBlind', { name: l.name })}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : (
            /* Chưa nạp xong, hoặc BE nói loại này không đo được. Vẽ 0% ở đây
               là dựng lại đúng con số bịa vừa gỡ khỏi module. */
            <p className='mt-1.5 text-[12px] text-[var(--pv2-faint)]'>
              {t('coverageUnmeasured')}
            </p>
          )}
        </section>
      </aside>
    </div>
  );
};
