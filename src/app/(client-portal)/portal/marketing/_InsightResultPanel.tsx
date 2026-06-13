'use client';

/**
 * GĐ2 — panel kết quả AI-Insights trong section Campaign
 * (docs/plan-marketing-insights-bridge-2026-06-13.md §3).
 * Poll report tới khi succeeded → tóm tắt goal/journey/blocks (read-only) +
 * nút "Dùng kết quả này" = handoff KB2 dựng template draft, lưu kết quả vào
 * notes của campaign để mở lại không mất.
 */

import {
  ArrowUpRight,
  Check,
  Loader2,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';
import type {
  ExperienceGoal,
  InsightReport,
  InsightStatus,
} from '@/services/rexer/types';

const GOAL_LABEL: Record<ExperienceGoal, string> = {
  product_discovery: 'Khám phá sản phẩm',
  interactive_story: 'Câu chuyện tương tác',
  comparison: 'So sánh lựa chọn',
  lead_excitement: 'Tạo lead / hứng khởi',
  brand_storytelling: 'Kể chuyện thương hiệu',
  guided_decision: 'Dẫn dắt quyết định',
};

const STATUS_META: Record<InsightStatus, { label: string; cls: string }> = {
  queued: { label: 'Đang chờ xử lý…', cls: 'text-amber-600' },
  running: { label: 'AI đang phân tích…', cls: 'text-blue-600' },
  succeeded: { label: 'Hoàn tất', cls: 'text-emerald-600' },
  failed: { label: 'Thất bại', cls: 'text-destructive' },
};

export interface InsightHandoff {
  template_id: string;
  edit_url: string;
}

export function InsightResultPanel({
  reportId,
  handoff,
  onHandoff,
}: {
  reportId: string;
  handoff?: InsightHandoff;
  /** Lưu kết quả handoff vào notes campaign (editor tự PATCH). */
  onHandoff: (h: InsightHandoff) => void;
}) {
  const [report, setReport] = useState<InsightReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const poll = useCallback(async () => {
    try {
      const r = await rexerApi.insights.get(reportId);
      setReport(r);
      setError(null);
      // Còn đang chạy → hẹn poll lại sau 4s (worker mất vài chục giây).
      if (r.status === 'queued' || r.status === 'running') {
        timer.current = setTimeout(poll, 4000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được report');
    }
  }, [reportId]);

  useEffect(() => {
    poll();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [poll]);

  const handleApply = async () => {
    setApplying(true);
    try {
      const res = await rexerApi.insights.handoff(reportId);
      const h = { template_id: res.template_id, edit_url: res.edit_url };
      onHandoff(h);
      toast.success('Đã dựng template từ kết quả AI-Insights');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Handoff thất bại');
    } finally {
      setApplying(false);
    }
  };

  const status = report?.status;
  const bp = report?.blueprint;

  return (
    <div className='border-border bg-muted/30 mt-2 flex flex-col gap-3 rounded-xl border p-4'>
      <div className='flex items-center justify-between gap-2'>
        <span className='text-foreground inline-flex items-center gap-1.5 text-sm font-semibold'>
          <Sparkles className='size-4 text-blue-600' /> AI-Insights
        </span>
        <Link
          href={`/portal/insights/${reportId}`}
          className='text-primary inline-flex items-center gap-0.5 text-xs hover:underline'
        >
          Xem đầy đủ <ArrowUpRight className='size-3' />
        </Link>
      </div>

      {error ? (
        <p className='text-destructive text-xs'>{error}</p>
      ) : !report ? (
        <StatusLine
          icon='spin'
          text='Đang tải report…'
          cls='text-content-muted'
        />
      ) : status === 'failed' ? (
        <div className='flex flex-col gap-2'>
          <StatusLine
            icon='warn'
            text={report.error_message || 'AI chạy thất bại'}
            cls='text-destructive'
          />
          <span className='text-content-muted text-xs'>
            Thử chạy lại từ nút AI-Assistant phía trên.
          </span>
        </div>
      ) : status !== 'succeeded' ? (
        <StatusLine
          icon='spin'
          text={STATUS_META[status ?? 'queued'].label}
          cls={STATUS_META[status ?? 'queued'].cls}
        />
      ) : (
        <div className='flex flex-col gap-3'>
          {bp?.experience_goal && (
            <Field label='Experience goal'>
              <span className='text-foreground text-sm font-medium'>
                {GOAL_LABEL[bp.experience_goal.primary_goal] ??
                  bp.experience_goal.primary_goal}
              </span>
              {bp.experience_goal.rationale && (
                <p className='text-content-muted mt-0.5 text-xs'>
                  {bp.experience_goal.rationale}
                </p>
              )}
            </Field>
          )}

          {!!bp?.customer_journey?.stages?.length && (
            <Field
              label={`Journey · ${bp.customer_journey.journey_pattern_name}`}
            >
              <div className='flex flex-wrap items-center gap-1'>
                {bp.customer_journey.stages.map((s, i) => (
                  <span key={s.key} className='flex items-center gap-1'>
                    <span className='bg-background border-border rounded-md border px-2 py-0.5 text-xs'>
                      {s.name}
                    </span>
                    {i < bp.customer_journey!.stages.length - 1 && (
                      <span className='text-content-muted text-xs'>→</span>
                    )}
                  </span>
                ))}
              </div>
            </Field>
          )}

          {!!bp?.recommended_blocks?.blocks_by_stage?.length && (
            <Field label='Block đề xuất'>
              <span className='text-content-muted text-xs'>
                {bp.recommended_blocks.blocks_by_stage.reduce(
                  (n, s) => n + s.blocks.length,
                  0
                )}{' '}
                block qua {bp.recommended_blocks.blocks_by_stage.length} stage
              </span>
            </Field>
          )}

          {handoff ? (
            <div className='border-border flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2'>
              <span className='inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700'>
                <Check className='size-3.5' /> Đã dựng template từ kết quả
              </span>
              <Link
                href={handoff.edit_url}
                className='text-primary inline-flex items-center gap-0.5 text-xs font-semibold hover:underline'
              >
                Mở editor <ArrowUpRight className='size-3' />
              </Link>
            </div>
          ) : (
            <Button size='sm' onClick={handleApply} disabled={applying}>
              {applying ? (
                <>
                  <Loader2 className='size-4 animate-spin' /> Đang dựng…
                </>
              ) : (
                'Dùng kết quả này → dựng template'
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className='text-content-muted mb-1 text-xs font-semibold uppercase'>
        {label}
      </p>
      {children}
    </div>
  );
}

function StatusLine({
  icon,
  text,
  cls,
}: {
  icon: 'spin' | 'warn';
  text: string;
  cls: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-sm', cls)}>
      {icon === 'spin' ? (
        <Loader2 className='size-4 animate-spin' />
      ) : (
        <TriangleAlert className='size-4' />
      )}
      {text}
    </span>
  );
}
