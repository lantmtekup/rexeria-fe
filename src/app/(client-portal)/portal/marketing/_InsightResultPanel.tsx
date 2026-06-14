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
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';

import { InsightStepsDialog } from './_InsightStepsDialog';
import { BlocksSection } from '@/components/modules/Insights/steps/BlueprintBlocks';
import {
  GOAL_LABEL,
  deriveSummary,
  type InsightSummary,
} from './_insights-labels';
import type { InsightReport, InsightStatus } from '@/services/rexer/types';

const STATUS_META: Record<InsightStatus, { labelKey: string; cls: string }> = {
  queued: { labelKey: 'statusQueued', cls: 'text-amber-600' },
  running: { labelKey: 'statusRunning', cls: 'text-blue-600' },
  succeeded: { labelKey: 'statusSucceeded', cls: 'text-emerald-600' },
  failed: { labelKey: 'statusFailed', cls: 'text-destructive' },
};

export interface InsightHandoff {
  template_id: string;
  edit_url: string;
}

export function InsightResultPanel({
  reportId,
  brief,
  workspaceId,
  handoff,
  summary,
  autoOpenId,
  onHandoff,
  onSummary,
}: {
  reportId: string;
  /** InsightBrief đã map từ Marketing — cho popup generate lại từng step. */
  brief: Record<string, unknown>;
  workspaceId?: string;
  handoff?: InsightHandoff;
  /** Snapshot từ notes — hiện ngay trước khi poll xong. */
  summary?: InsightSummary;
  /** Chỉ auto-mở popup khi id này == reportId (report vừa chạy phiên này). */
  autoOpenId?: string;
  /** Lưu kết quả handoff vào notes campaign (editor tự PATCH). */
  onHandoff: (h: InsightHandoff) => void;
  /** Đẩy tóm tắt kết quả lên editor để lưu vào notes (list card + instant). */
  onSummary?: (s: InsightSummary) => void;
}) {
  const t = useTranslations('portal');
  const [report, setReport] = useState<InsightReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);
  const autoOpened = useRef(false);
  const summarized = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const poll = useCallback(async () => {
    try {
      const r = await rexerApi.insights.get(reportId, true); // kèm steps
      setReport(r);
      setError(null);
      // Auto-mở popup CHỈ cho report vừa chạy phiên này (autoOpenId), không
      // bung lại mỗi lần vào lại trang.
      if (
        !autoOpened.current &&
        autoOpenId === reportId &&
        r.status !== 'failed'
      ) {
        autoOpened.current = true;
        setStepsOpen(true);
      }
      // Xong → đẩy summary lên editor 1 lần để lưu notes.
      if (r.status === 'succeeded' && !summarized.current) {
        summarized.current = true;
        onSummary?.(deriveSummary(r));
      }
      // Còn đang chạy → hẹn poll lại sau 4s (worker mất vài chục giây).
      if (r.status === 'queued' || r.status === 'running') {
        timer.current = setTimeout(poll, 4000);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('marketingInsightResultPanel.loadReportError')
      );
    }
  }, [reportId, autoOpenId, onSummary, t]);

  useEffect(() => {
    poll();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [poll]);

  // Template user chọn để dựng (mặc định cái đầu) — truyền block_codes vào
  // handoff. Không chọn → BE tự derive từ blueprint.
  const [picked, setPicked] = useState<number>(0);

  const handleApply = async () => {
    setApplying(true);
    try {
      const tpls = report?.blueprint?.recommended_templates?.templates ?? [];
      const chosen = tpls[picked];
      const res = await rexerApi.insights.handoff(
        reportId,
        chosen
          ? { template: { name: chosen.name, block_codes: chosen.block_codes } }
          : undefined
      );
      const h = { template_id: res.template_id, edit_url: res.edit_url };
      onHandoff(h);
      setStepsOpen(false);
      toast.success(t('marketingInsightResultPanel.handoffSuccess'));
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : t('marketingInsightResultPanel.handoffError')
      );
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
          {t('marketingInsightResultPanel.viewFull')}{' '}
          <ArrowUpRight className='size-3' />
        </Link>
      </div>

      {error ? (
        <p className='text-destructive text-xs'>{error}</p>
      ) : !report ? (
        // Hiện summary từ notes ngay trong lúc poll BE (đỡ nhấp nháy).
        <div className='flex flex-col gap-2'>
          {summary?.goalLabel && (
            <Field label={t('marketingInsightResultPanel.experienceGoal')}>
              <span className='text-foreground text-sm font-medium'>
                {summary.goalLabel}
              </span>
            </Field>
          )}
          <StatusLine
            icon='spin'
            text={t('marketingInsightResultPanel.loadingReport')}
            cls='text-content-muted'
          />
        </div>
      ) : status === 'failed' ? (
        <div className='flex flex-col gap-2'>
          <StatusLine
            icon='warn'
            text={
              report.error_message || t('marketingInsightResultPanel.aiFailed')
            }
            cls='text-destructive'
          />
          <span className='text-content-muted text-xs'>
            {t('marketingInsightResultPanel.retryHint')}
          </span>
        </div>
      ) : status !== 'succeeded' ? (
        <StatusLine
          icon='spin'
          text={t(
            `marketingInsightResultPanel.${STATUS_META[status ?? 'queued'].labelKey}`
          )}
          cls={STATUS_META[status ?? 'queued'].cls}
        />
      ) : (
        <div className='flex flex-col gap-3'>
          {bp?.experience_goal && (
            <Field label={t('marketingInsightResultPanel.experienceGoal')}>
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
              label={t('marketingInsightResultPanel.journeyLabel', {
                name: bp.customer_journey.journey_pattern_name,
              })}
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

          {/* Block đề xuất — list đầy đủ theo stage (mỗi block có "AI tạo
              nội dung" để xem nội dung mẫu). */}
          {!!bp?.recommended_blocks?.blocks_by_stage?.length && (
            <BlocksSection
              blueprint={{ recommended_blocks: bp.recommended_blocks }}
              reportId={reportId}
              collapsible
            />
          )}

          {/* Template gợi ý — user CHỌN 1 cái để dựng (block_codes truyền vào
              handoff). Mỗi template hiện block bên trong + lý do phù hợp. */}
          {!!bp?.recommended_templates?.templates?.length && !handoff && (
            <Field label={t('marketingInsightResultPanel.pickTemplate')}>
              <div className='flex flex-col gap-2'>
                {bp.recommended_templates.templates.map((tpl, i) => (
                  <button
                    key={tpl.name}
                    type='button'
                    onClick={() => setPicked(i)}
                    className={cn(
                      'rounded-lg border p-3 text-left transition-colors',
                      picked === i
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    )}
                  >
                    <div className='flex items-center justify-between gap-2'>
                      <span className='text-foreground text-sm font-semibold'>
                        {tpl.name}
                      </span>
                      <span
                        className={cn(
                          'flex size-4 shrink-0 items-center justify-center rounded-full border',
                          picked === i
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border'
                        )}
                      >
                        {picked === i && <Check className='size-3' />}
                      </span>
                    </div>
                    {tpl.description && (
                      <p className='text-content-muted mt-0.5 text-xs'>
                        {tpl.description}
                      </p>
                    )}
                    {!!tpl.block_codes?.length && (
                      <div className='mt-1.5 flex flex-wrap gap-1'>
                        {tpl.block_codes.map(code => (
                          <span
                            key={code}
                            className='bg-muted text-content-muted text-2xs rounded px-1.5 py-0.5'
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                    )}
                    {tpl.why_fit && (
                      <p className='text-content-muted text-2xs mt-1 italic'>
                        {t('marketingInsightResultPanel.whyFit', {
                          reason: tpl.why_fit,
                        })}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </Field>
          )}

          {handoff ? (
            <div className='border-border flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2'>
              <span className='inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700'>
                <Check className='size-3.5' />{' '}
                {t('marketingInsightResultPanel.templateBuilt')}
              </span>
              <Link
                href={handoff.edit_url}
                className='text-primary inline-flex items-center gap-0.5 text-xs font-semibold hover:underline'
              >
                {t('marketingInsightResultPanel.openEditor')}{' '}
                <ArrowUpRight className='size-3' />
              </Link>
            </div>
          ) : (
            <div className='flex flex-wrap gap-2'>
              <Button
                size='sm'
                variant='outline'
                onClick={() => setStepsOpen(true)}
              >
                <Sparkles className='size-4' />{' '}
                {t('marketingInsightResultPanel.viewSteps')}
              </Button>
              <Button size='sm' onClick={handleApply} disabled={applying}>
                {applying ? (
                  <>
                    <Loader2 className='size-4 animate-spin' />{' '}
                    {t('marketingInsightResultPanel.building')}
                  </>
                ) : (
                  t('marketingInsightResultPanel.useResult')
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {report && (
        <InsightStepsDialog
          open={stepsOpen}
          onOpenChange={setStepsOpen}
          report={report}
          brief={brief}
          workspaceId={workspaceId}
          savedGoal={summary?.goalEdit}
          applying={applying}
          onApply={handleApply}
          onSaved={onSummary}
        />
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
