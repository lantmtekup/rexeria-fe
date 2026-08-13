'use client';

import { useTranslations } from 'next-intl';

import {
  COMPONENT_EVENT_LABEL_KEY,
  COMPONENT_KIND_LABEL_KEY,
} from '@/lib/portal-v2/experiences/constants';
import {
  COVERAGE_TONE_STYLE,
  coverageTone,
} from '@/lib/portal-v2/experiences/roleStyles';
import type {
  ExperienceLayer,
  SignalCoverage,
} from '@/lib/portal-v2/experiences/types';

type ExperienceSignalsPaneProps = {
  /**
   * Độ phủ nạp từ `GET /experiences/{id}/coverage`. null = chưa nạp xong hoặc
   * BE nói loại này không đo được — cả hai đều KHÔNG phải 0%.
   */
  coverage: SignalCoverage | null;
  /** Block thật từ `GET /experiences/{id}`; null = chưa nạp xong hoặc hỏng. */
  layers: ExperienceLayer[] | null;
};

/**
 * Trải nghiệm này BÁO VỀ ĐƯỢC GÌ, trước khi có lượt truy cập nào.
 *
 * Đọc `layers[].components[]` của `GET /experiences/{id}` — cùng một nguồn với
 * badge trên tab. Bản trước đọc một mảng luôn rỗng do `fromV2` dựng ra, nên tab
 * ghi "Tín hiệu 9" (lấy từ `/coverage`) còn pane vẽ 0 dòng.
 */
export const ExperienceSignalsPane = ({
  coverage,
  layers,
}: ExperienceSignalsPaneProps) => {
  const t = useTranslations('portalV2.experiences');
  const toneStyle = COVERAGE_TONE_STYLE[coverageTone(coverage?.pct ?? 0)];

  const rows = (layers ?? []).flatMap((layer, i) =>
    layer.components.map(component => ({ layer, i, component }))
  );
  const tracked = rows.filter(r => r.component.tracked);
  const blind = rows.filter(r => !r.component.tracked);

  const kindLabel = (kind: string) =>
    COMPONENT_KIND_LABEL_KEY[kind] ? t(COMPONENT_KIND_LABEL_KEY[kind]) : kind;

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
            {coverage ? `${coverage.pct}%` : '—'}
          </span>
        </div>
        {coverage ? (
          <>
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
          </>
        ) : (
          <p className='mt-2.5 text-[12.5px] text-[var(--pv2-faint)]'>
            {t('coverageUnmeasured')}
          </p>
        )}
      </section>

      <section className='border-t border-[var(--pv2-hair)] pt-5'>
        <h3 className='font-[family-name:var(--pv2-disp)] text-[15px] font-bold tracking-[-0.02em] text-[var(--pv2-ink)]'>
          {t('signalsCount', { count: tracked.length })}
        </h3>

        {layers === null ? (
          <p className='mt-2 text-[12.5px] text-[var(--pv2-faint)]'>
            {t('layersLoading')}
          </p>
        ) : tracked.length ? (
          <ul className='mt-3 flex flex-col gap-1.5'>
            {tracked.map(({ layer, i, component }) => {
              return (
                <li
                  key={`${i}-${component.key}`}
                  className='flex flex-wrap items-center gap-2 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] px-3 py-2'
                >
                  <span className='grid size-5 shrink-0 place-items-center rounded-md bg-[var(--pv2-canvas)] text-[10px] font-bold text-[var(--pv2-mut)] tabular-nums'>
                    {i + 1}
                  </span>
                  <span className='text-[12.5px] font-semibold text-[var(--pv2-ink)]'>
                    {layer.name}
                  </span>
                  <code className='font-mono text-[11px] text-[var(--pv2-faint)]'>
                    {component.key}
                  </code>
                  <span className='ml-auto flex shrink-0 items-center gap-2 text-[11.5px] text-[var(--pv2-mut)]'>
                    {/* Ý NGHĨA đứng trước cơ học: "xoay" nói được điều mà
                        "media" không nói. */}
                    {component.event ? (
                      <span className='font-semibold text-[var(--pv2-ink)]'>
                        {COMPONENT_EVENT_LABEL_KEY[component.event]
                          ? t(COMPONENT_EVENT_LABEL_KEY[component.event])
                          : component.event}
                      </span>
                    ) : null}
                    {kindLabel(component.kind)}
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
                key={`${i}-${component.key}`}
                className='rounded-full border border-dashed border-[var(--pv2-hair)] px-2.5 py-1 text-[11.5px] text-[var(--pv2-faint)]'
              >
                {t('coverageBlind', {
                  name: `${layer.name} · ${kindLabel(component.kind)}`,
                })}
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};
