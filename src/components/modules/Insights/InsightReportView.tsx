'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ClipboardList, Loader2, Pencil } from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { useInsightReport } from '@/services/rexer/use-rexer';
import type { ExperienceGoal } from '@/services/rexer/types';
import { GeneratingStep } from './steps/GeneratingStep';
import { BlueprintStep } from './steps/BlueprintStep';

/**
 * Xem chi tiết 1 báo cáo AI-Insights. Poll report qua `useInsightReport`:
 * - queued/running → tóm tắt dữ liệu đã nhập + màn generating (chưa có blueprint).
 * - succeeded/failed → tóm tắt + blueprint (hoặc lỗi).
 *
 * Tóm tắt input đọc từ `report.input_snapshot` (BE gói brief ở `manual.brief`,
 * context DB ở `brand`, lựa chọn ở `selections`) — để vào lại luôn thấy thông tin
 * kể cả khi job chưa chạy xong.
 *
 * `basePath`: `/portal/insights` | `/admin/insights`.
 */
export function InsightReportView({
  reportId,
  basePath,
}: {
  reportId: string;
  basePath: string;
}) {
  const t = useTranslations('insights');
  const router = useRouter();
  const { report, loading } = useInsightReport(reportId);

  const terminal =
    report?.status === 'succeeded' || report?.status === 'failed';

  const goalLabel = (g: ExperienceGoal | string) => {
    const key = `goals.${g}`;
    const label = t(key);
    return label === key ? String(g) : label;
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <Link
          href={basePath}
          className='group border-border text-content-muted hover:border-foreground hover:text-foreground bg-background inline-flex items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm transition-all'
        >
          <ArrowLeft
            className='size-3.5 transition-transform group-hover:-translate-x-0.5'
            aria-hidden
          />
          {t('list.back')}
        </Link>
        {report && (
          <Button
            variant='neutral'
            size='sm'
            onClick={() => router.push(`${basePath}/new?from=${reportId}`)}
          >
            <Pencil className='size-3.5' aria-hidden /> {t('list.editRerun')}
          </Button>
        )}
      </div>

      {loading && !report ? (
        <div className='text-content-muted flex items-center justify-center gap-2 py-16 text-sm'>
          <Loader2 className='size-4 animate-spin' /> {t('list.loading')}
        </div>
      ) : !report ? (
        <div className='border-border text-content-muted bg-background rounded-2xl border border-dashed p-12 text-center text-sm'>
          {t('list.notFound')}
        </div>
      ) : (
        <>
          {/* Tóm tắt dữ liệu đã nhập — luôn hiển thị */}
          <InputSummary
            snapshot={report.input_snapshot}
            title={report.title}
            goalLabel={goalLabel}
            t={t}
          />

          {terminal ? (
            <BlueprintStep
              report={report}
              onRestart={() => router.push(`${basePath}/new`)}
            />
          ) : (
            <GeneratingStep report={report} />
          )}
        </>
      )}
    </div>
  );
}

function InputSummary({
  snapshot,
  title,
  goalLabel,
  t,
}: {
  snapshot?: Record<string, unknown>;
  title?: string;
  goalLabel: (g: ExperienceGoal | string) => string;
  t: ReturnType<typeof useTranslations>;
}) {
  const s = (snapshot ?? {}) as any;
  const brief = s.manual?.brief ?? s.brief ?? {};
  const sel = s.selections ?? {};
  const join = (v: unknown) =>
    Array.isArray(v) ? v.filter(Boolean).join(', ') : '';

  const goal = sel.experience_goal?.primary_goal as string | undefined;
  const secondary = sel.experience_goal?.secondary_goal as string | undefined;
  const stages = sel.customer_journey?.stages;

  const rows: Array<[string, string]> = [
    [t('intake.review.brand'), s.brand?.name ?? brief.brand?.name ?? ''],
    [t('intake.review.objective'), join(brief.objective?.campaign_objectives)],
    [t('intake.review.audience'), brief.audience?.persona ?? ''],
    [
      t('intake.review.goal'),
      goal
        ? goalLabel(goal) + (secondary ? ` + ${goalLabel(secondary)}` : '')
        : '',
    ],
    [
      t('intake.review.journey'),
      Array.isArray(stages)
        ? t('intake.review.journeyCount', { n: stages.length })
        : '',
    ],
    [t('intake.review.challenges'), join(brief.challenges)],
    ['Custom goals', join(s.manual?.custom_goals)],
  ];
  const visible = rows.filter(([, v]) => v && v.trim());

  if (visible.length === 0) return null;

  return (
    <section className='border-border bg-card rounded-2xl border p-5 shadow-sm'>
      <div className='mb-4 flex items-center gap-2.5'>
        <span className='bg-primary/10 text-primary inline-flex size-8 items-center justify-center rounded-lg'>
          <ClipboardList className='size-4' aria-hidden />
        </span>
        <h2 className='text-content-main text-sm font-semibold'>
          {title || t('list.untitled')} · {t('reportInput')}
        </h2>
      </div>
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {visible.map(([k, v]) => (
          <div key={k} className='bg-muted/50 rounded-xl px-3.5 py-3'>
            <div className='text-content-muted mb-0.5 text-[11px] font-semibold'>
              {k}
            </div>
            <div className='text-content-main text-sm font-medium'>{v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
