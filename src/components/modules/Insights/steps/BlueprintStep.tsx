'use client';

import { useTranslations } from 'next-intl';
import {
  AlertTriangle,
  Check,
  RotateCcw,
  Route,
  Target,
  Wand2,
} from 'lucide-react';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import type {
  ExperienceGoal,
  InsightBlueprint,
  InsightReport,
} from '@/services/rexer/types';
import { ConfidenceRing, GradientButton, SectionCard } from './ui';
import { BlocksSection, TemplatesSection } from './BlueprintBlocks';

/**
 * Màn Blueprint của wizard AI-Insights: render 4 section chiến lược
 * (experience_goal, customer_journey, recommended_blocks, recommended_templates)
 * từ `report.blueprint` dưới dạng card có accent riêng. Mỗi đề xuất luôn đi kèm
 * lý do (rationale/why) để người dùng hiểu vì sao AI gợi ý như vậy.
 *
 * Xử lý cả case `failed` / thiếu blueprint: hiện thông báo lỗi + nút chạy lại.
 * Nút "Tùy chỉnh trải nghiệm" (handoff) hiện chưa có đích điều hướng (ngoài
 * phạm vi task này); nút "Chạy phân tích" reset wizard về màn Setup.
 *
 * Lưu ý contract: blueprint của BE KHÔNG có field `assumptions` (xác nhận theo
 * openapi.yaml #/components/schemas/InsightBlueprint) → không render panel đó.
 */
export interface BlueprintStepProps {
  report: InsightReport | null;
  onRestart: () => void;
}

/**
 * Nhãn hiển thị cho experience goal theo i18n; fallback về chính enum khi chưa
 * có copy để không vỡ UI nếu BE bổ sung goal mới.
 */
function useGoalLabel() {
  const t = useTranslations('insights');
  return (goal: ExperienceGoal): string => {
    const key = `goals.${goal}`;
    const label = t(key);
    return label === key ? goal : label;
  };
}

/** Section experience goal: vòng tin cậy + goal chính + lý do (+ goal phụ nếu có). */
function GoalSection({ blueprint }: { blueprint: InsightBlueprint }) {
  const t = useTranslations('insights');
  const goalLabel = useGoalLabel();
  const goal = blueprint.experience_goal;
  if (!goal) return null;

  const confidencePct = Math.round((goal.confidence ?? 0) * 100);

  return (
    <SectionCard
      icon={<Target aria-hidden />}
      title={t('blueprint.goal')}
      index={1}
      accent='blue'
      delayMs={0}
    >
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
        <div className='flex flex-col items-center gap-1'>
          <ConfidenceRing pct={confidencePct} />
          <span className='text-content-muted text-[11px] font-medium'>
            {t('blueprint.confidence')}
          </span>
        </div>
        <div className='space-y-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-content-main text-xl font-semibold'>
              {goalLabel(goal.primary_goal)}
            </span>
            {goal.secondary_goal && (
              <Badge variant='secondary'>
                + {goalLabel(goal.secondary_goal)}
              </Badge>
            )}
          </div>
          {goal.rationale && (
            <p className='text-content-muted text-sm leading-relaxed'>
              {goal.rationale}
            </p>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

/** Section customer journey: tên pattern + lý do + các stage có thứ tự (timeline). */
function JourneySection({ blueprint }: { blueprint: InsightBlueprint }) {
  const t = useTranslations('insights');
  const journey = blueprint.customer_journey;
  if (!journey) return null;

  const stages = journey.stages ?? [];

  return (
    <SectionCard
      icon={<Route aria-hidden />}
      title={t('blueprint.journey')}
      index={2}
      accent='violet'
      delayMs={80}
    >
      {journey.journey_pattern_name && (
        <div className='rounded-pill mb-2 inline-flex bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700'>
          {journey.journey_pattern_name}
        </div>
      )}
      {journey.rationale && (
        <p className='text-content-muted mb-4 text-sm leading-relaxed'>
          {journey.rationale}
        </p>
      )}
      <ol className='space-y-0'>
        {stages.map((stage, i) => {
          const isLast = i === stages.length - 1;
          return (
            <li key={stage.key} className='flex items-stretch gap-3'>
              <div className='flex flex-col items-center'>
                <span className='inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700'>
                  {i + 1}
                </span>
                {!isLast && <span className='bg-border my-1 w-px flex-1' />}
              </div>
              <div className='space-y-0.5 pb-4'>
                <div className='text-content-main font-medium'>
                  {stage.name}
                </div>
                <div className='text-content-muted text-sm'>{stage.intent}</div>
                {stage.rationale && (
                  <div className='text-content-muted text-xs'>
                    {t('blueprint.why')}: {stage.rationale}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </SectionCard>
  );
}

// BlocksSection + TemplatesSection (collapse/expand, thumbnail, xem chi tiết,
// AI tạo nội dung / tìm thủ công) đã tách sang ./BlueprintBlocks.

export function BlueprintStep({ report, onRestart }: BlueprintStepProps) {
  const t = useTranslations('insights');

  if (!report) return null;

  // Case lỗi: report failed hoặc không có blueprint → báo lỗi + cho chạy lại.
  if (report.status === 'failed' || !report.blueprint) {
    return (
      <div className='border-danger/30 bg-danger-bg space-y-4 rounded-2xl border p-6 text-center'>
        <span className='bg-card text-danger mx-auto inline-flex size-12 items-center justify-center rounded-full shadow-sm'>
          <AlertTriangle className='size-6' aria-hidden />
        </span>
        <p className='text-content-main text-sm'>
          {report.error_message ?? t('blueprint.failed')}
        </p>
        <Button type='button' variant='outline' onClick={onRestart}>
          <RotateCcw className='size-4' aria-hidden />
          {t('setup.run')}
        </Button>
      </div>
    );
  }

  const blueprint = report.blueprint;

  return (
    <div className='space-y-5'>
      {/* Ribbon "đã sẵn sàng" */}
      <div className='border-success/30 bg-success-bg flex items-center gap-3 rounded-2xl border p-4'>
        <span className='bg-success inline-flex size-9 shrink-0 items-center justify-center rounded-full text-white'>
          <Check className='size-5' aria-hidden />
        </span>
        <div className='min-w-0'>
          <p className='text-content-main truncate text-sm font-semibold'>
            {report.title ?? t('blueprint.readyTitle')}
          </p>
          <p className='text-content-muted text-xs'>
            {t('blueprint.readySubtitle')}
          </p>
        </div>
      </div>

      <GoalSection blueprint={blueprint} />
      <JourneySection blueprint={blueprint} />
      <BlocksSection blueprint={blueprint} />
      <TemplatesSection blueprint={blueprint} />

      {blueprint.generated_with && (
        <p className='text-content-muted text-xs'>
          {t('blueprint.generatedWith')}: {blueprint.generated_with}
        </p>
      )}

      {/* Footer hành động */}
      <div className='border-border flex flex-wrap items-center gap-3 border-t pt-5'>
        <GradientButton leading={<Wand2 className='size-4' aria-hidden />}>
          {t('blueprint.handoff')}
        </GradientButton>
        <Button type='button' variant='outline' onClick={onRestart}>
          <RotateCcw className='size-4' aria-hidden />
          {t('setup.run')}
        </Button>
      </div>
    </div>
  );
}
