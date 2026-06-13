'use client';

/**
 * Popup review kết quả AI-Insights theo 3 step (yêu cầu 2026-06-13):
 *   1. Experience Goal · 2. Customer Journey · 3. Blocks + Templates.
 *
 * Popup mở NGAY khi AI bắt đầu chạy: mỗi step hiện loading, điền dần khi step
 * tương ứng trong `report.steps` xong (classify_goal / recommend_journey /
 * recommend_blocks / recommend_templates). Mỗi step có "Generate lại" (gọi lại
 * đúng phần đó) + "Next"; step cuối "Áp dụng → dựng template" (handoff, chỉ bật
 * khi report đã succeeded).
 *
 * Generate lại + handoff dùng endpoint wizard-v2 (audit §20 đang 404 trên
 * prod) → fallback toast, UI không vỡ.
 */

import { Check, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { cn } from '@/lib/cn';
import { rexerApi } from '@/services/rexer/endpoints';
import type {
  InsightBlueprintGoal,
  InsightBlueprintJourney,
  InsightBlueprintBlocks,
  InsightBlueprintTemplates,
  InsightReport,
  InsightReportStep,
  InsightStepKey,
} from '@/services/rexer/types';

import { JourneySection } from '@/components/modules/Insights/steps/BlueprintStep';
import {
  BlocksSection,
  TemplatesSection,
} from '@/components/modules/Insights/steps/BlueprintBlocks';
import { ConfidenceRing } from '@/components/modules/Insights/steps/ui';

import { GOAL_LABEL } from './_insights-labels';

const STEPS = ['Experience Goal', 'Customer Journey', 'Blocks & Templates'];
const GOAL_OPTIONS = Object.keys(GOAL_LABEL) as (keyof typeof GOAL_LABEL)[];

/* ── Trích output_payload của từng step trace (canonical key) ───────────── */

const stepOf = (report: InsightReport, key: InsightStepKey) =>
  report.steps?.find(s => s.step_key === key);

const isDone = (s?: InsightReportStep) =>
  s?.status === 'succeeded' || s?.status === 'skipped';

function asGoal(s?: InsightReportStep): InsightBlueprintGoal | undefined {
  const o = s?.output_payload as Partial<InsightBlueprintGoal> | undefined;
  return o?.primary_goal ? (o as InsightBlueprintGoal) : undefined;
}
function asJourney(s?: InsightReportStep): InsightBlueprintJourney | undefined {
  const o = s?.output_payload as Partial<InsightBlueprintJourney> | undefined;
  return Array.isArray(o?.stages) ? (o as InsightBlueprintJourney) : undefined;
}
function asBlocks(s?: InsightReportStep): InsightBlueprintBlocks | undefined {
  const o = s?.output_payload as Partial<InsightBlueprintBlocks> | undefined;
  return Array.isArray(o?.blocks_by_stage)
    ? (o as InsightBlueprintBlocks)
    : undefined;
}
function asTemplates(
  s?: InsightReportStep
): InsightBlueprintTemplates | undefined {
  const o = s?.output_payload as Partial<InsightBlueprintTemplates> | undefined;
  return Array.isArray(o?.templates)
    ? (o as InsightBlueprintTemplates)
    : undefined;
}

export function InsightStepsDialog({
  open,
  onOpenChange,
  report,
  brief,
  workspaceId,
  applying,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: InsightReport;
  /** InsightBrief đã map từ Marketing — dùng để generate lại từng phần. */
  brief: Record<string, unknown>;
  workspaceId?: string;
  applying?: boolean;
  /** Bấm "Áp dụng" ở step cuối → handoff dựng template. */
  onApply: () => void;
}) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  // Override từ "Generate lại" — ưu tiên hơn dữ liệu poll.
  const [ovGoal, setOvGoal] = useState<InsightBlueprintGoal>();
  const [ovJourney, setOvJourney] = useState<InsightBlueprintJourney>();
  const [ovBlocks, setOvBlocks] = useState<InsightBlueprintBlocks>();
  const [ovTemplates, setOvTemplates] = useState<InsightBlueprintTemplates>();

  const bp = report.blueprint;
  const running = report.status === 'queued' || report.status === 'running';
  const failed = report.status === 'failed';

  // Nguồn dữ liệu mỗi phần: override → step trace → blueprint (khi succeeded).
  const goal =
    ovGoal ?? asGoal(stepOf(report, 'classify_goal')) ?? bp?.experience_goal;
  const journey =
    ovJourney ??
    asJourney(stepOf(report, 'recommend_journey')) ??
    bp?.customer_journey;
  const blocks =
    ovBlocks ??
    asBlocks(stepOf(report, 'recommend_blocks')) ??
    bp?.recommended_blocks;
  const templates =
    ovTemplates ??
    asTemplates(stepOf(report, 'recommend_templates')) ??
    bp?.recommended_templates;

  // Loading mỗi step: chưa có data + report còn đang chạy (step đó chưa xong).
  const goalLoading =
    !goal && running && !isDone(stepOf(report, 'classify_goal'));
  const journeyLoading =
    !journey && running && !isDone(stepOf(report, 'recommend_journey'));
  const blocksLoading =
    !blocks && running && !isDone(stepOf(report, 'recommend_blocks'));

  const unavailable = () =>
    toast.error('BE chưa hỗ trợ generate lại (wizard-v2 đang chờ deploy)');

  const regenGoal = async () => {
    setBusy(true);
    try {
      const r = await rexerApi.insights.classifyGoal({
        brief,
        workspace_id: workspaceId,
      });
      if (!r?.goals?.length) return unavailable();
      const top = r.goals[0];
      setOvGoal({
        primary_goal: top.goal,
        confidence: top.confidence,
        rationale: top.rationale ?? '',
        secondary_goal: r.goals[1]?.goal,
      });
      toast.success('Đã tạo lại Experience Goal');
    } finally {
      setBusy(false);
    }
  };

  const regenJourney = async () => {
    if (!goal) return;
    setBusy(true);
    try {
      const r = await rexerApi.insights.suggestJourney({
        primary_goal: goal.primary_goal,
        secondary_goal: goal.secondary_goal,
        brief,
        workspace_id: workspaceId,
      });
      if (!r?.journey) return unavailable();
      setOvJourney(r.journey);
      toast.success('Đã tạo lại Customer Journey');
    } finally {
      setBusy(false);
    }
  };

  // Step 3: tạo report mới với goal/journey đã chốt (skip 2 bước đầu) → poll.
  const regenBlocks = async () => {
    if (!workspaceId || !goal || !journey) return;
    setBusy(true);
    try {
      const rep = await rexerApi.insights.create({
        workspace_id: workspaceId,
        inputs: brief,
        selections: {
          experience_goal: {
            primary_goal: goal.primary_goal,
            secondary_goal: goal.secondary_goal,
          },
          customer_journey: journey,
        },
      });
      for (let i = 0; i < 10; i++) {
        const r = await rexerApi.insights.get(rep.id);
        if (r.status === 'succeeded') {
          setOvBlocks(r.blueprint?.recommended_blocks);
          setOvTemplates(r.blueprint?.recommended_templates);
          toast.success('Đã tạo lại Blocks & Templates');
          return;
        }
        if (r.status === 'failed') return unavailable();
        await new Promise(res => setTimeout(res, 4000));
      }
      toast.message('Đang xử lý — thử lại sau ít phút');
    } catch {
      unavailable();
    } finally {
      setBusy(false);
    }
  };

  const regenerate = [regenGoal, regenJourney, regenBlocks][step];
  const blockCount =
    blocks?.blocks_by_stage?.reduce((n, s) => n + s.blocks.length, 0) ?? 0;
  const canApply = report.status === 'succeeded';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='!w-[96vw] !max-w-[1150px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Sparkles className='size-4 text-blue-600' /> Kết quả AI-Insights
            {running && (
              <span className='text-content-muted inline-flex items-center gap-1 text-xs font-normal'>
                <Loader2 className='size-3 animate-spin' /> đang phân tích…
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <ol className='flex items-center gap-2'>
          {STEPS.map((s, i) => (
            <li key={s} className='flex flex-1 items-center gap-2'>
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  i < step
                    ? 'bg-emerald-500 text-white'
                    : i === step
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-content-muted'
                )}
              >
                {i < step ? <Check className='size-3.5' /> : i + 1}
              </span>
              <span
                className={cn(
                  'truncate text-xs',
                  i === step
                    ? 'text-foreground font-medium'
                    : 'text-content-muted'
                )}
              >
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <span className='bg-border h-px flex-1' />
              )}
            </li>
          ))}
        </ol>

        {/* Step body — content phẳng, không lồng khung thừa. */}
        <div className='min-h-[58vh] overflow-y-auto py-1'>
          {step === 0 && (
            <StepBody loading={goalLoading} empty={!goal} failed={failed}>
              {goal && <GoalEditable goal={goal} onChange={setOvGoal} />}
            </StepBody>
          )}

          {step === 1 && (
            <StepBody
              loading={journeyLoading}
              empty={!journey?.stages?.length}
              failed={failed}
            >
              {journey && (
                <JourneySection
                  blueprint={{ customer_journey: journey }}
                  collapsible={false}
                />
              )}
            </StepBody>
          )}

          {step === 2 && (
            <StepBody
              loading={blocksLoading}
              empty={!blockCount}
              failed={failed}
            >
              {!!blockCount && (
                <div className='flex flex-col gap-4'>
                  <BlocksSection
                    blueprint={{ recommended_blocks: blocks }}
                    reportId={report.id}
                    collapsible={false}
                  />
                  {!!templates?.templates?.length && (
                    <TemplatesSection
                      blueprint={{ recommended_templates: templates }}
                      collapsible={false}
                    />
                  )}
                </div>
              )}
            </StepBody>
          )}
        </div>

        {/* Footer actions */}
        <div className='flex items-center justify-between gap-2 pt-1'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0 || busy}
          >
            Back
          </Button>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={regenerate}
              disabled={busy || applying}
            >
              {busy ? (
                <Loader2 className='size-4 animate-spin' />
              ) : (
                <RefreshCw className='size-4' />
              )}
              Generate lại
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                size='sm'
                onClick={() => setStep(s => s + 1)}
                disabled={busy}
              >
                Next
              </Button>
            ) : (
              <Button
                size='sm'
                onClick={onApply}
                disabled={busy || applying || !canApply}
                title={
                  canApply
                    ? undefined
                    : 'Chờ AI phân tích xong mới áp dụng được'
                }
              >
                {applying ? 'Đang dựng…' : 'Áp dụng → dựng template'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Experience Goal sửa được — render phẳng (KHÔNG bọc SectionCard) để khỏi
 * trùng tiêu đề với step indicator. Vòng tin cậy + chọn goal + textarea cao.
 */
function GoalEditable({
  goal,
  onChange,
}: {
  goal: InsightBlueprintGoal;
  onChange: (g: InsightBlueprintGoal) => void;
}) {
  const pct = Math.round((goal.confidence ?? 0) * 100);
  return (
    <div className='flex flex-col gap-5 sm:flex-row sm:items-start'>
      <div className='flex shrink-0 flex-col items-center gap-1 pt-1'>
        <ConfidenceRing pct={pct} />
        <span className='text-content-muted text-xs'>Độ tin cậy</span>
      </div>
      <div className='flex flex-1 flex-col gap-2'>
        <select
          value={goal.primary_goal}
          onChange={e =>
            onChange({
              ...goal,
              primary_goal: e.target
                .value as InsightBlueprintGoal['primary_goal'],
            })
          }
          className='border-input bg-background text-foreground h-11 w-full rounded-lg border px-3 text-base font-semibold outline-none'
        >
          {GOAL_OPTIONS.map(g => (
            <option key={g} value={g}>
              {GOAL_LABEL[g]}
            </option>
          ))}
        </select>
        <textarea
          value={goal.rationale ?? ''}
          onChange={e => onChange({ ...goal, rationale: e.target.value })}
          rows={14}
          placeholder='Lý do AI đề xuất — bạn có thể chỉnh sửa…'
          className='border-input bg-background text-foreground focus:border-foreground/40 min-h-[44vh] w-full resize-y rounded-lg border p-4 text-sm leading-7 outline-none'
        />
        <p className='text-content-muted text-2xs'>
          Nội dung AI tạo — sửa trực tiếp nếu cần.
        </p>
      </div>
    </div>
  );
}

/** Bọc trạng thái loading/empty; có data thì render thẳng, không khung thừa. */
function StepBody({
  loading,
  empty,
  failed,
  children,
}: {
  loading?: boolean;
  empty?: boolean;
  failed?: boolean;
  children: React.ReactNode;
}) {
  if (loading) {
    return (
      <div className='text-content-muted flex h-[50vh] flex-col items-center justify-center gap-2 text-sm'>
        <Loader2 className='size-6 animate-spin text-blue-600' />
        AI đang phân tích phần này…
      </div>
    );
  }
  if (empty) {
    return (
      <div className='text-content-muted flex h-[50vh] flex-col items-center justify-center text-sm'>
        {failed ? 'AI chạy thất bại phần này.' : 'Chưa có dữ liệu.'}
      </div>
    );
  }
  return <>{children}</>;
}
