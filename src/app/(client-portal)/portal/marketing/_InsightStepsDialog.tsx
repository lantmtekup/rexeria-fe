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

import {
  Check,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
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
  InsightJourneyStage,
  InsightReport,
  InsightReportStep,
  InsightStepKey,
} from '@/services/rexer/types';

import {
  BlocksSection,
  TemplatesSection,
} from '@/components/modules/Insights/steps/BlueprintBlocks';
import { ConfidenceRing } from '@/components/modules/Insights/steps/ui';

import { GOAL_LABEL, type InsightSummary } from './_insights-labels';

const STEPS = ['Experience Goal', 'Customer Journey', 'Blocks', 'Templates'];
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
  savedGoal,
  applying,
  onApply,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: InsightReport;
  /** InsightBrief đã map từ Marketing — dùng để generate lại từng phần. */
  brief: Record<string, unknown>;
  workspaceId?: string;
  /** Goal đã sửa lần trước (lưu trong notes) — seed lại khi mở. */
  savedGoal?: InsightBlueprintGoal;
  applying?: boolean;
  /** Bấm "Áp dụng" ở step cuối → handoff dựng template. */
  onApply: () => void;
  /** Lưu chỉnh sửa: PATCH journey/blocks lên BE + đẩy summary (kèm goal) lên. */
  onSaved?: (s: InsightSummary) => void;
}) {
  const t = useTranslations('portal');
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  // Override từ "Generate lại" / sửa tay — ưu tiên hơn dữ liệu poll.
  const [ovGoal, setOvGoal] = useState<InsightBlueprintGoal | undefined>(
    savedGoal
  );
  const [ovJourney, setOvJourney] = useState<InsightBlueprintJourney>();
  const [ovBlocks, setOvBlocks] = useState<InsightBlueprintBlocks>();
  const [ovTemplates, setOvTemplates] = useState<InsightBlueprintTemplates>();
  // Block đã chọn cho mỗi stage (1/stage). Trống → mặc định block đầu của stage.
  const [selBlocks, setSelBlocks] = useState<Record<string, string>>({});

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
    toast.error(t('marketingInsightStepsDialog.regenNotSupported'));

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
      toast.success(t('marketingInsightStepsDialog.regeneratedGoal'));
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
      toast.success(t('marketingInsightStepsDialog.regeneratedJourney'));
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
          toast.success(t('marketingInsightStepsDialog.regeneratedBlocks'));
          return;
        }
        if (r.status === 'failed') return unavailable();
        await new Promise(res => setTimeout(res, 4000));
      }
      toast.message(t('marketingInsightStepsDialog.processingRetry'));
    } catch {
      unavailable();
    } finally {
      setBusy(false);
    }
  };

  // step 2 = Blocks, step 3 = Templates (cùng regenerate qua re-run report).
  const regenerate = [regenGoal, regenJourney, regenBlocks, regenBlocks][step];
  const blockCount =
    blocks?.blocks_by_stage?.reduce((n, s) => n + s.blocks.length, 0) ?? 0;
  const templatesLoading =
    !templates?.templates?.length &&
    running &&
    !isDone(stepOf(report, 'recommend_templates'));
  const canApply = report.status === 'succeeded';

  // Lưu chỉnh sửa: journey/blocks lên BE (KB3 — BE chỉ nhận 2 phần này);
  // goal-edit gói trong summary để editor ghi vào notes (BE chưa nhận goal).
  // Thu gọn về 1 block đã chọn / stage (mặc định block đầu nếu chưa chọn).
  const chosenBlocks: InsightBlueprintBlocks | undefined = blocks && {
    blocks_by_stage: blocks.blocks_by_stage.map(s => {
      const code = selBlocks[s.stage_key];
      const pick =
        s.blocks.find(b => b.block_type_code === code) ?? s.blocks[0];
      return { ...s, blocks: pick ? [pick] : s.blocks };
    }),
  };

  const handleSaveEdits = async () => {
    setSaving(true);
    try {
      if (journey || chosenBlocks) {
        await rexerApi.insights.updateBlueprint(report.id, {
          customer_journey: journey,
          recommended_blocks: chosenBlocks,
        });
      }
      onSaved?.({
        status: 'succeeded',
        goal: goal?.primary_goal,
        goalLabel: goal ? GOAL_LABEL[goal.primary_goal] : undefined,
        goalEdit: goal,
        journeyName: journey?.journey_pattern_name,
        blockCount: chosenBlocks?.blocks_by_stage.length ?? blockCount,
      });
      toast.success(t('marketingInsightStepsDialog.editsSaved'));
    } catch {
      toast.error(t('marketingInsightStepsDialog.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] !w-[96vw] !max-w-[1150px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Sparkles className='size-4 text-blue-600' />{' '}
            {t('marketingInsightStepsDialog.title')}
            {running && (
              <span className='text-content-muted inline-flex items-center gap-1 text-xs font-normal'>
                <Loader2 className='size-3 animate-spin' />{' '}
                {t('marketingInsightStepsDialog.analyzing')}
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

        {/* Step body — cuộn nội bộ (max-h), nội dung phẳng. */}
        <div className='max-h-[62vh] min-h-[40vh] overflow-y-auto py-1 pr-1'>
          {step === 0 && (
            <StepBody loading={goalLoading} empty={!goal} failed={failed}>
              {goal && <GoalEditable goal={goal} onChange={setOvGoal} />}
            </StepBody>
          )}

          {step === 1 && (
            <StepBody loading={journeyLoading} empty={!journey} failed={failed}>
              {journey && (
                <JourneyEditable journey={journey} onChange={setOvJourney} />
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
                <BlocksSection
                  blueprint={{ recommended_blocks: blocks }}
                  reportId={report.id}
                  collapsible={false}
                  selected={selBlocks}
                  onSelectBlock={(sk, c) =>
                    setSelBlocks(p => ({ ...p, [sk]: c }))
                  }
                />
              )}
            </StepBody>
          )}

          {step === 3 && (
            <StepBody
              loading={templatesLoading}
              empty={!templates?.templates?.length}
              failed={failed}
            >
              {!!templates?.templates?.length && (
                <TemplatesSection
                  blueprint={{ recommended_templates: templates }}
                  collapsible={false}
                />
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
            {onSaved && (
              <Button
                variant='ghost'
                size='sm'
                onClick={handleSaveEdits}
                disabled={busy || saving || !canApply}
                title={t('marketingInsightStepsDialog.saveTooltip')}
              >
                {saving
                  ? t('marketingInsightStepsDialog.saving')
                  : t('marketingInsightStepsDialog.save')}
              </Button>
            )}
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
              {t('marketingInsightStepsDialog.regenerate')}
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
                    : t('marketingInsightStepsDialog.applyTooltip')
                }
              >
                {applying
                  ? t('marketingInsightStepsDialog.building')
                  : t('marketingInsightStepsDialog.apply')}
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
  const t = useTranslations('portal');
  const pct = Math.round((goal.confidence ?? 0) * 100);
  return (
    <div className='flex flex-col gap-5 sm:flex-row sm:items-start'>
      <div className='flex shrink-0 flex-col items-center gap-1 pt-1'>
        <ConfidenceRing pct={pct} />
        <span className='text-content-muted text-xs'>
          {t('marketingInsightStepsDialog.confidence')}
        </span>
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
          placeholder={t('marketingInsightStepsDialog.rationalePlaceholder')}
          className='border-input bg-background text-foreground focus:border-foreground/40 min-h-[44vh] w-full resize-y rounded-lg border p-4 text-sm leading-7 outline-none'
        />
        <p className='text-content-muted text-2xs'>
          {t('marketingInsightStepsDialog.aiContentHint')}
        </p>
      </div>
    </div>
  );
}

/**
 * Customer Journey sửa được: đổi tên pattern, sửa từng stage (tên · intent ·
 * Why), thêm/xoá stage. Wire vào `setOvJourney`; Save (handleSaveEdits) đã
 * PATCH `customer_journey` lên BE (updateBlueprint KB3).
 */
function JourneyEditable({
  journey,
  onChange,
}: {
  journey: InsightBlueprintJourney;
  onChange: (j: InsightBlueprintJourney) => void;
}) {
  const t = useTranslations('portal');
  const stages = journey.stages ?? [];

  const patchStage = (i: number, patch: Partial<InsightJourneyStage>) =>
    onChange({
      ...journey,
      stages: stages.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    });
  const removeStage = (i: number) =>
    onChange({ ...journey, stages: stages.filter((_, idx) => idx !== i) });
  const addStage = () =>
    onChange({
      ...journey,
      stages: [
        ...stages,
        {
          key: `custom-${stages.length + 1}`,
          name: '',
          intent: '',
          rationale: '',
        },
      ],
    });

  const inputCls =
    'border-input bg-background text-foreground focus:border-foreground/40 h-9 w-full rounded-lg border px-3 text-sm outline-none';

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex flex-col gap-1'>
        <label className='text-content-muted text-xs font-semibold uppercase'>
          {t('marketingInsightStepsDialog.journeyPatternName')}
        </label>
        <input
          value={journey.journey_pattern_name ?? ''}
          onChange={e =>
            onChange({ ...journey, journey_pattern_name: e.target.value })
          }
          className={cn(inputCls, 'h-10 font-semibold')}
        />
      </div>

      <ol className='flex flex-col gap-3'>
        {stages.map((s, i) => (
          <li
            key={s.key || i}
            className='border-border bg-muted/20 rounded-xl border p-3'
          >
            <div className='flex items-start gap-3'>
              <span className='bg-primary/10 text-primary mt-1 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold'>
                {i + 1}
              </span>
              <div className='flex flex-1 flex-col gap-2'>
                <div className='flex flex-col gap-2 sm:flex-row'>
                  <input
                    value={s.name}
                    onChange={e => patchStage(i, { name: e.target.value })}
                    placeholder={t('marketingInsightStepsDialog.stageName')}
                    className={cn(inputCls, 'font-medium')}
                  />
                  <input
                    value={s.intent}
                    onChange={e => patchStage(i, { intent: e.target.value })}
                    placeholder={t('marketingInsightStepsDialog.stageIntent')}
                    className={inputCls}
                  />
                </div>
                <textarea
                  value={s.rationale}
                  onChange={e => patchStage(i, { rationale: e.target.value })}
                  rows={3}
                  placeholder={t('marketingInsightStepsDialog.stageWhy')}
                  className='border-input bg-background text-foreground focus:border-foreground/40 w-full resize-y rounded-lg border p-3 text-sm leading-6 outline-none'
                />
              </div>
              <button
                type='button'
                onClick={() => removeStage(i)}
                aria-label={t('marketingInsightStepsDialog.removeStage')}
                className='text-content-muted hover:bg-destructive/10 hover:text-destructive mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors'
              >
                <Trash2 className='size-4' />
              </button>
            </div>
          </li>
        ))}
      </ol>

      <Button variant='outline' size='sm' onClick={addStage} className='w-fit'>
        <Plus className='size-4' />
        {t('marketingInsightStepsDialog.addStage')}
      </Button>

      <p className='text-content-muted text-2xs'>
        {t('marketingInsightStepsDialog.aiContentHint')}
      </p>
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
  const t = useTranslations('portal');
  if (loading) {
    return (
      <div className='text-content-muted flex h-[50vh] flex-col items-center justify-center gap-2 text-sm'>
        <Loader2 className='size-6 animate-spin text-blue-600' />
        {t('marketingInsightStepsDialog.stepAnalyzing')}
      </div>
    );
  }
  if (empty) {
    return (
      <div className='text-content-muted flex h-[50vh] flex-col items-center justify-center text-sm'>
        {failed
          ? t('marketingInsightStepsDialog.stepFailed')
          : t('marketingInsightStepsDialog.stepEmpty')}
      </div>
    );
  }
  return <>{children}</>;
}
