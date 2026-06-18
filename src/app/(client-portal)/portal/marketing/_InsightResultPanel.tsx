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
  Eye,
  Loader2,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';

import { InsightStepsDialog } from './_InsightStepsDialog';
import { createLandingFromBlueprint } from './_insights-bridge';
import {
  BlocksSection,
  buildBlocksFromCodes,
} from '@/components/modules/Insights/steps/BlueprintBlocks';
import { PreviewMode } from '@/components/modules/CanvasTemplate/block-editor/PreviewMode';
import type { Lang } from '@/components/modules/CanvasTemplate/block-editor/types';
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

/** Hiệu ứng chuyển trang của landing (per-landing, lưu trong notes campaign).
 *  BE hiện chỉ render transition từ MotionKit mức brand (page_canonical.go) —
 *  per-page chưa support → giá trị này lưu sẵn, áp khi BE thêm transition/page. */
export type TransitionStyle = 'fade' | 'slide' | 'morph';
const TRANSITION_OPTIONS: { value: TransitionStyle; label: string }[] = [
  { value: 'fade', label: 'Fade (mờ dần)' },
  { value: 'slide', label: 'Slide (trượt)' },
  { value: 'morph', label: 'Morph (biến đổi)' },
];

export function InsightResultPanel({
  reportId,
  brief,
  workspaceId,
  handoff,
  summary,
  autoOpenId,
  onSummary,
  initialTransition,
  onLandingCreated,
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
  /** Đẩy tóm tắt kết quả lên editor để lưu vào notes (list card + instant). */
  onSummary?: (s: InsightSummary) => void;
  /** Transition đã lưu (notes) — seed cho selector khi mở lại. */
  initialTransition?: TransitionStyle;
  /** Tạo landing page xong → editor gắn campaign.landing_page_id + lưu transition. */
  onLandingCreated?: (pageId: string, transition?: TransitionStyle) => void;
}) {
  const t = useTranslations('portal');
  const locale = useLocale();
  const lang: Lang = locale === 'en' ? 'en' : 'vi';
  const [report, setReport] = useState<InsightReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [landingOpen, setLandingOpen] = useState(false);
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

  const [creatingLanding, setCreatingLanding] = useState(false);
  const [transition, setTransition] = useState<TransitionStyle>(
    initialTransition ?? 'fade'
  );

  const status = report?.status;
  const bp = report?.blueprint;

  // Landing preview: dựng từ recommended_blocks (taxonomy AI → editor block
  // gần nhất, theo đúng thứ tự stage). KHÔNG dùng template BE handoff vì nó
  // hiện lưu block rỗng (chưa có renderer FE). Code không map được → bỏ qua.
  const landingBlocks = useMemo(() => {
    const stages = bp?.recommended_blocks?.blocks_by_stage ?? [];
    const codes = stages.flatMap(s =>
      (s.blocks ?? []).map(b => b.block_type_code)
    );
    return buildBlocksFromCodes(codes);
  }, [bp?.recommended_blocks]);

  // Tạo landing TỪ ĐÚNG block AI đã chọn (landingBlocks) → gửi canvas_blueprint
  // lên BE (from-blueprint). Landing ra là block template → mở BlockEditor +
  // preview khớp. transition nhúng thẳng vào blueprint (per-page).
  // BE endpoint: docs/be-spec-portal-page-from-blueprint-2026-06-17.md (chờ BE).
  const handleCreateLanding = async () => {
    if (!workspaceId || landingBlocks.length === 0) {
      toast.error('Chưa có block hoặc workspace để tạo landing.');
      return;
    }
    setCreatingLanding(true);
    try {
      const name = summary?.goalLabel
        ? `Landing: ${summary.goalLabel}`
        : 'Landing page';
      const page = await createLandingFromBlueprint(
        landingBlocks,
        name,
        workspaceId,
        transition
      );
      onLandingCreated?.(page.id, transition);
      toast.success('Đã tạo landing page từ block đã chọn.');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Tạo landing page thất bại.'
      );
    } finally {
      setCreatingLanding(false);
    }
  };

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

          {/* Bỏ list "chọn template" — bước cuối giờ tạo thẳng landing page từ
              block đã chọn (nút "Tạo landing page" bên dưới). */}

          {handoff ? (
            <div className='border-border flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2'>
              <span className='inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700'>
                <Check className='size-3.5' />{' '}
                {t('marketingInsightResultPanel.templateBuilt')}
              </span>
              <div className='flex items-center gap-3'>
                {/* Xem landing — overlay full-screen dựng từ recommended_blocks
                    (template BE còn rỗng nên không preview được trực tiếp). */}
                {landingBlocks.length > 0 && (
                  <button
                    type='button'
                    onClick={() => setLandingOpen(true)}
                    className='text-foreground inline-flex items-center gap-1 text-xs font-semibold hover:underline'
                  >
                    <Eye className='size-3.5' />{' '}
                    {t('marketingInsightResultPanel.viewLanding')}
                  </button>
                )}
                <Link
                  href={handoff.edit_url}
                  className='text-primary inline-flex items-center gap-0.5 text-xs font-semibold hover:underline'
                >
                  {t('marketingInsightResultPanel.openEditor')}{' '}
                  <ArrowUpRight className='size-3' />
                </Link>
              </div>
            </div>
          ) : (
            <div className='flex flex-wrap items-end gap-2'>
              {/* Hiệu ứng chuyển trang (per-landing, lưu notes — chờ BE render). */}
              <label className='flex flex-col gap-1'>
                <span className='text-content-muted text-2xs font-medium'>
                  Hiệu ứng chuyển trang
                </span>
                <select
                  value={transition}
                  onChange={e =>
                    setTransition(e.target.value as TransitionStyle)
                  }
                  className='border-border bg-background text-foreground h-8 rounded-lg border px-2 text-xs'
                >
                  {TRANSITION_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                size='sm'
                variant='outline'
                onClick={() => setStepsOpen(true)}
              >
                <Sparkles className='size-4' />{' '}
                {t('marketingInsightResultPanel.viewSteps')}
              </Button>
              <Button
                size='sm'
                onClick={handleCreateLanding}
                disabled={creatingLanding || landingBlocks.length === 0}
              >
                {creatingLanding ? (
                  <>
                    <Loader2 className='size-4 animate-spin' /> Đang tạo
                    landing…
                  </>
                ) : (
                  'Tạo landing page'
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
          onSaved={onSummary}
          onLandingCreated={onLandingCreated}
        />
      )}

      {/* Landing preview toàn màn hình — portal ra body để thoát transform/
          overflow của panel marketing. */}
      {landingOpen &&
        landingBlocks.length > 0 &&
        createPortal(
          <PreviewMode
            blocks={landingBlocks}
            lang={lang}
            onClose={() => setLandingOpen(false)}
          />,
          document.body
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
