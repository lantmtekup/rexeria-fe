'use client';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import type {
  ExperienceGoal,
  InsightBlueprint,
  InsightReport,
} from '@/services/rexer/types';

/**
 * Màn Blueprint của wizard AI-Insights: render 4 section chiến lược
 * (experience_goal, customer_journey, recommended_blocks, recommended_templates)
 * từ `report.blueprint`. Mỗi đề xuất luôn đi kèm lý do (rationale/why) để người
 * dùng hiểu vì sao AI gợi ý như vậy.
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

/** Section experience goal: goal chính + độ tin cậy + lý do (+ goal phụ nếu có). */
function GoalSection({ blueprint }: { blueprint: InsightBlueprint }) {
  const t = useTranslations('insights');
  const goalLabel = useGoalLabel();
  const goal = blueprint.experience_goal;
  if (!goal) return null;

  const confidencePct = Math.round((goal.confidence ?? 0) * 100);

  return (
    <section className='space-y-3'>
      <h2 className='text-lg font-semibold'>{t('blueprint.goal')}</h2>
      <div className='flex flex-wrap items-center gap-3'>
        <span className='text-xl font-medium'>
          {goalLabel(goal.primary_goal)}
        </span>
        <Badge variant='secondary'>
          {t('blueprint.confidence')}: {confidencePct}%
        </Badge>
        {goal.secondary_goal && (
          <Badge variant='outline'>{goalLabel(goal.secondary_goal)}</Badge>
        )}
      </div>
      {goal.rationale && <p className='text-content'>{goal.rationale}</p>}
    </section>
  );
}

/** Section customer journey: tên pattern, lý do và các stage có thứ tự. */
function JourneySection({ blueprint }: { blueprint: InsightBlueprint }) {
  const t = useTranslations('insights');
  const journey = blueprint.customer_journey;
  if (!journey) return null;

  return (
    <section className='space-y-3'>
      <h2 className='text-lg font-semibold'>{t('blueprint.journey')}</h2>
      {journey.journey_pattern_name && (
        <p className='font-medium'>{journey.journey_pattern_name}</p>
      )}
      {journey.rationale && (
        <p className='text-content-muted text-sm'>{journey.rationale}</p>
      )}
      <div className='grid gap-3 sm:grid-cols-2'>
        {(journey.stages ?? []).map(stage => (
          <div
            key={stage.key}
            className='border-border space-y-1 rounded-lg border p-3'
          >
            <div className='font-medium'>{stage.name}</div>
            <div className='text-content-muted text-sm'>{stage.intent}</div>
            {stage.rationale && (
              <div className='text-content-muted text-xs'>
                {t('blueprint.why')}: {stage.rationale}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/** Section blocks đề xuất: gom theo từng stage, mỗi block kèm lý do. */
function BlocksSection({ blueprint }: { blueprint: InsightBlueprint }) {
  const t = useTranslations('insights');
  const blocks = blueprint.recommended_blocks;
  if (!blocks) return null;

  return (
    <section className='space-y-3'>
      <h2 className='text-lg font-semibold'>{t('blueprint.blocks')}</h2>
      <div className='space-y-4'>
        {(blocks.blocks_by_stage ?? []).map(stage => (
          <div key={stage.stage_key} className='space-y-2'>
            <div className='font-medium'>{stage.stage_key}</div>
            {stage.stage_rationale && (
              <p className='text-content-muted text-sm'>
                {stage.stage_rationale}
              </p>
            )}
            <ul className='space-y-1.5'>
              {(stage.blocks ?? []).map(block => (
                <li
                  key={block.block_type_code}
                  className='flex flex-wrap items-baseline gap-2 text-sm'
                >
                  <Badge variant='outline'>{block.block_type_code}</Badge>
                  <span className='font-medium'>{block.block_name}</span>
                  {block.reason && (
                    <span className='text-content-muted'>— {block.reason}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Section templates đề xuất: mỗi template kèm block codes và lý do phù hợp. */
function TemplatesSection({ blueprint }: { blueprint: InsightBlueprint }) {
  const t = useTranslations('insights');
  const templates = blueprint.recommended_templates;
  if (!templates) return null;

  return (
    <section className='space-y-3'>
      <h2 className='text-lg font-semibold'>{t('blueprint.templates')}</h2>
      <div className='grid gap-4 sm:grid-cols-2'>
        {(templates.templates ?? []).map(tpl => (
          <div
            key={tpl.name}
            className='border-border space-y-2 rounded-lg border p-4'
          >
            <div className='flex items-center justify-between gap-2'>
              <span className='font-semibold'>{tpl.name}</span>
              {tpl.category && (
                <Badge variant='secondary'>{tpl.category}</Badge>
              )}
            </div>
            {tpl.description && (
              <p className='text-content-muted text-sm'>{tpl.description}</p>
            )}
            {(tpl.block_codes ?? []).length > 0 && (
              <div className='flex flex-wrap gap-1.5'>
                {tpl.block_codes.map(code => (
                  <Badge key={code} variant='outline'>
                    {code}
                  </Badge>
                ))}
              </div>
            )}
            {tpl.why_fit && (
              <p className='text-content-muted text-xs'>
                {t('blueprint.why')}: {tpl.why_fit}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function BlueprintStep({ report, onRestart }: BlueprintStepProps) {
  const t = useTranslations('insights');

  if (!report) return null;

  // Case lỗi: report failed hoặc không có blueprint → báo lỗi + cho chạy lại.
  if (report.status === 'failed' || !report.blueprint) {
    return (
      <div className='space-y-4'>
        <p className='text-danger'>
          {report.error_message ?? t('blueprint.failed')}
        </p>
        <Button type='button' variant='outline' onClick={onRestart}>
          {t('setup.run')}
        </Button>
      </div>
    );
  }

  const blueprint = report.blueprint;

  return (
    <div className='space-y-8'>
      <header className='space-y-1'>
        {report.title && (
          <h1 className='text-2xl font-semibold'>{report.title}</h1>
        )}
        <p className='text-content-muted'>{t('subtitle')}</p>
      </header>

      <GoalSection blueprint={blueprint} />
      <JourneySection blueprint={blueprint} />
      <BlocksSection blueprint={blueprint} />
      <TemplatesSection blueprint={blueprint} />

      {blueprint.generated_with && (
        <p className='text-content-muted text-xs'>
          {t('blueprint.generatedWith')}: {blueprint.generated_with}
        </p>
      )}

      <div className='flex flex-wrap gap-3'>
        <Button type='button'>{t('blueprint.handoff')}</Button>
        <Button type='button' variant='outline' onClick={onRestart}>
          {t('setup.run')}
        </Button>
      </div>
    </div>
  );
}
