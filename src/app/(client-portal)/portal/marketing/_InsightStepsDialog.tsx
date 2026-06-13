'use client';

/**
 * Popup review kết quả AI-Insights theo 3 step (yêu cầu 2026-06-13):
 *   1. Experience Goal · 2. Customer Journey · 3. Blocks + Templates.
 * Mỗi step hiện kết quả AI + nút "Generate lại" (gọi lại đúng phần đó) và
 * "Next"; step cuối là "Áp dụng → dựng template" (handoff).
 *
 * Generate lại từng phần dùng endpoint sync wizard-v2 (classify-goal /
 * suggest-journey); step 3 tạo report mới với selections đã chốt rồi poll.
 * Các endpoint này hiện 404 trên prod (audit §20) → fallback toast, UI không vỡ.
 */

import { Check, Loader2, RefreshCw, Sparkles, X } from 'lucide-react';
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
} from '@/services/rexer/types';

import { GOAL_LABEL } from './_InsightResultPanel';

const STEPS = ['Experience Goal', 'Customer Journey', 'Blocks & Templates'];

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
  const bp = report.blueprint;
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<InsightBlueprintGoal | undefined>(
    bp?.experience_goal
  );
  const [journey, setJourney] = useState<InsightBlueprintJourney | undefined>(
    bp?.customer_journey
  );
  const [blocks, setBlocks] = useState<InsightBlueprintBlocks | undefined>(
    bp?.recommended_blocks
  );
  const [templates, setTemplates] = useState<
    InsightBlueprintTemplates | undefined
  >(bp?.recommended_templates);
  const [busy, setBusy] = useState(false);

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
      setGoal({
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
      setJourney(r.journey);
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
      // Poll tối đa ~40s.
      for (let i = 0; i < 10; i++) {
        const r = await rexerApi.insights.get(rep.id);
        if (r.status === 'succeeded') {
          setBlocks(r.blueprint?.recommended_blocks);
          setTemplates(r.blueprint?.recommended_templates);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Sparkles className='size-4 text-blue-600' /> Kết quả AI-Insights
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

        {/* Step body */}
        <div className='max-h-[46vh] overflow-y-auto py-1'>
          {step === 0 && (
            <StepBox empty={!goal} label='goal'>
              {goal && (
                <>
                  <p className='text-foreground text-base font-semibold'>
                    {GOAL_LABEL[goal.primary_goal] ?? goal.primary_goal}
                  </p>
                  {goal.rationale && (
                    <p className='text-content-muted mt-1 text-sm'>
                      {goal.rationale}
                    </p>
                  )}
                  {goal.secondary_goal && (
                    <p className='text-content-muted mt-2 text-xs'>
                      Phụ:{' '}
                      {GOAL_LABEL[goal.secondary_goal] ?? goal.secondary_goal}
                    </p>
                  )}
                </>
              )}
            </StepBox>
          )}

          {step === 1 && (
            <StepBox empty={!journey?.stages?.length} label='journey'>
              {journey && (
                <>
                  <p className='text-foreground text-sm font-semibold'>
                    {journey.journey_pattern_name}
                  </p>
                  <ol className='mt-3 flex flex-col gap-2'>
                    {journey.stages.map((s, i) => (
                      <li key={s.key} className='flex gap-3'>
                        <span className='bg-primary/10 text-primary flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold'>
                          {i + 1}
                        </span>
                        <div>
                          <p className='text-foreground text-sm font-medium'>
                            {s.name}
                          </p>
                          {s.intent && (
                            <p className='text-content-muted text-xs'>
                              {s.intent}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </StepBox>
          )}

          {step === 2 && (
            <StepBox empty={!blockCount} label='blocks'>
              {!!blockCount && (
                <div className='flex flex-col gap-3'>
                  {blocks!.blocks_by_stage.map(s => (
                    <div key={s.stage_key}>
                      <p className='text-content-muted text-2xs font-semibold uppercase'>
                        {s.stage_key}
                      </p>
                      <div className='mt-1 flex flex-wrap gap-1.5'>
                        {s.blocks.map(b => (
                          <span
                            key={b.block_type_code}
                            className='border-border bg-background rounded-md border px-2 py-0.5 text-xs'
                          >
                            {b.block_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  {!!templates?.templates?.length && (
                    <p className='text-content-muted text-xs'>
                      + {templates.templates.length} template gợi ý
                    </p>
                  )}
                </div>
              )}
            </StepBox>
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
              <Button size='sm' onClick={onApply} disabled={busy || applying}>
                {applying ? 'Đang dựng…' : 'Áp dụng → dựng template'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepBox({
  empty,
  label,
  children,
}: {
  empty?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (empty) {
    return (
      <div className='border-border text-content-muted flex h-28 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm'>
        <X className='size-4' />
        Chưa có dữ liệu {label} — bấm Generate lại.
      </div>
    );
  }
  return (
    <div className='border-border bg-muted/30 rounded-xl border p-4'>
      {children}
    </div>
  );
}
