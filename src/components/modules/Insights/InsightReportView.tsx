'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { useInsightReport } from '@/services/rexer/use-rexer';
import { GeneratingStep } from './steps/GeneratingStep';
import { BlueprintStep } from './steps/BlueprintStep';

/**
 * Xem chi tiết 1 báo cáo AI-Insights. Poll report qua `useInsightReport`:
 * - queued/running → màn generating (timeline 5 bước).
 * - succeeded/failed → blueprint (hoặc lỗi). Nút "Tạo lại" → `${basePath}/new`.
 *
 * `basePath`: `/portal/insights` | `/admin/insights` (link back + tạo lại đúng ngữ cảnh).
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

  return (
    <div className='space-y-6'>
      <Link
        href={basePath}
        className='group border-border text-content-muted hover:border-foreground hover:text-foreground inline-flex items-center gap-2 self-start rounded-full border bg-white px-3 py-1.5 text-xs font-medium shadow-sm transition-all'
      >
        <ArrowLeft
          className='size-3.5 transition-transform group-hover:-translate-x-0.5'
          aria-hidden
        />
        {t('list.back')}
      </Link>

      {loading && !report ? (
        <div className='text-content-muted flex items-center justify-center gap-2 py-16 text-sm'>
          <Loader2 className='size-4 animate-spin' /> {t('list.loading')}
        </div>
      ) : !report ? (
        <div className='border-border text-content-muted rounded-2xl border border-dashed bg-white p-12 text-center text-sm'>
          {t('list.notFound')}
        </div>
      ) : terminal ? (
        <BlueprintStep
          report={report}
          onRestart={() => router.push(`${basePath}/new`)}
        />
      ) : (
        <GeneratingStep report={report} />
      )}
    </div>
  );
}
