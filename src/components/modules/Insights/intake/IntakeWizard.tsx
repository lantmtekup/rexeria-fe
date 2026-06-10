'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Upload,
  Wand2,
} from 'lucide-react';

import { rexerApi } from '@/services/rexer/endpoints';
import { useRexer } from '@/services/rexer/use-rexer';
import type {
  CreateInsightReportBody,
  ExperienceGoal,
  GoalRanking,
  InsightBlueprintJourney,
  InsightBrief,
  InsightStepSuggestion,
} from '@/services/rexer/types';
import { Input } from '@/components/atoms/input';
import { Textarea } from '@/components/atoms/textarea';
import { Label } from '@/components/atoms/label';
import { cn } from '@/lib/cn';
import { GradientButton } from '../steps/ui';
import {
  CHALLENGES,
  DEVICES,
  FIRST_AI_INDEX,
  GOAL_META,
  OBJECTIVES,
  STEPS,
  TONES,
  localClassifyGoal,
  localSuggest,
  localSuggestJourney,
  type StepId,
} from './logic';

/**
 * Wizard v2 — intake nhiều bước (form có cấu trúc, KHÔNG chatbot). Thay cho
 * `SetupStep` 1 màn: user điền brief 7 bước rồi xác nhận Experience Goal + Customer
 * Journey TRƯỚC khi enqueue job. Mỗi bước có callout "gợi ý dẫn hướng".
 *
 * AI tương tác (goal/journey/gợi ý) hiện chạy bằng heuristic client (xem logic.ts);
 * nếu BE đã deploy endpoint suggest/classify-goal/suggest-journey thì ưu tiên dữ
 * liệu BE (nhãn "AI"), ngược lại fallback heuristic (nhãn "gợi ý dẫn hướng").
 *
 * Khi bấm "Tạo Blueprint": build `CreateInsightReportBody` với brief gói trong
 * `inputs.brief` + goal/journey đã chốt trong `selections`, gọi `onRun` (container
 * cha lo enqueue + poll).
 */
export interface IntakeWizardProps {
  submitting: boolean;
  onRun: (body: CreateInsightReportBody) => void;
  brandLocked: boolean;
}

const EMPTY_BRIEF: InsightBrief = {
  brand: { tone: [] },
  product: { features: [] },
  objective: { campaign_objectives: [] },
  audience: { pain_points: [], device: 'mobile' },
  market: {},
  assets: { items: [] },
  challenges: [],
};

/** Chip chọn được; `accent` để bước AI tô tím, mặc định primary. */
function Chip({
  on,
  onClick,
  accent = 'primary',
  mono,
  children,
}: {
  on: boolean;
  onClick: () => void;
  accent?: 'primary' | 'violet';
  mono?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        'rounded-pill border px-3.5 py-1.5 text-xs font-semibold transition',
        mono && 'font-mono',
        on
          ? accent === 'violet'
            ? 'border-transparent bg-violet-600 text-white'
            : 'bg-primary border-transparent text-white'
          : 'border-border text-content-muted bg-card hover:bg-muted'
      )}
    >
      {children}
    </button>
  );
}

/** Callout gợi ý lũy tiến; nguồn `ai` (BE) hay `guide` (heuristic) để gắn nhãn thật. */
function SuggestCallout({
  suggestion,
  source,
  onApply,
}: {
  suggestion: InsightStepSuggestion;
  source: 'ai' | 'guide';
  onApply?: () => void;
}) {
  const t = useTranslations('insights');
  return (
    <div className='mb-5 rounded-2xl border border-violet-200 bg-violet-50/60 p-3.5'>
      <div className='mb-1.5 flex items-center gap-2'>
        <Wand2 className='size-3.5 text-violet-600' aria-hidden />
        <span className='text-[11px] font-bold tracking-wide text-violet-700'>
          {source === 'ai' ? t('intake.suggest.ai') : t('intake.suggest.guide')}
        </span>
        {suggestion.based_on?.length ? (
          <span className='text-[10.5px] text-violet-600/80'>
            · {t('intake.suggest.basedOn')}: {suggestion.based_on.join(', ')}
          </span>
        ) : null}
      </div>
      <p className='text-[12.5px] leading-relaxed text-violet-900/80'>
        {suggestion.text}
      </p>
      {onApply && suggestion.values && (
        <button
          type='button'
          onClick={onApply}
          className='mt-2 inline-flex items-center gap-1 text-[11.5px] font-semibold text-violet-700 hover:underline'
        >
          <Check className='size-3' aria-hidden /> {t('intake.suggest.apply')}
        </button>
      )}
    </div>
  );
}

export function IntakeWizard({
  submitting,
  onRun,
  brandLocked,
}: IntakeWizardProps) {
  const t = useTranslations('insights');

  const [step, setStep] = useState(0);
  const [brief, setBrief] = useState<InsightBrief>(EMPTY_BRIEF);

  // Workspace bắt buộc cho create (BE yêu cầu). Portal: auto-pick mặc định.
  const [workspaceId, setWorkspaceId] = useState('');
  const workspaces = useRexer(() => rexerApi.workspaces.myMemberships(), []);
  const workspaceItems = useMemo(
    () => (workspaces.data ?? []).map(m => m.workspace),
    [workspaces.data]
  );
  useEffect(() => {
    if (!brandLocked || workspaceId || workspaceItems.length === 0) return;
    const preferred =
      workspaceItems.find(w => w.is_default) ?? workspaceItems[0];
    if (preferred) setWorkspaceId(preferred.id);
  }, [brandLocked, workspaceId, workspaceItems]);

  // Gợi ý lũy tiến cho bước hiện tại.
  const [suggestion, setSuggestion] = useState<InsightStepSuggestion | null>(
    null
  );
  const [suggestSource, setSuggestSource] = useState<'ai' | 'guide'>('guide');

  // Experience Goal đã xếp hạng + lựa chọn.
  const [goalRanks, setGoalRanks] = useState<GoalRanking[]>([]);
  const [goalSource, setGoalSource] = useState<'ai' | 'guide'>('guide');
  const [primaryGoal, setPrimaryGoal] = useState<ExperienceGoal | null>(null);

  // Journey đề xuất (sửa được).
  const [journey, setJourney] = useState<InsightBlueprintJourney | null>(null);
  const [pattern, setPattern] = useState<{
    name: string;
    stages: string[];
  } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const cur = STEPS[step];
  const ctx = { workspace_id: workspaceId || undefined };

  // Goal phụ = goal xếp hạng cao nhất khác primary.
  const secondaryGoal = useMemo<ExperienceGoal | null>(() => {
    if (!primaryGoal) return null;
    const next = goalRanks.find(g => g.goal !== primaryGoal);
    return next?.goal ?? null;
  }, [goalRanks, primaryGoal]);

  // Mỗi lần đổi bước: nạp gợi ý (ưu tiên BE, fallback heuristic).
  useEffect(() => {
    let alive = true;
    const id = cur.id;
    rexerApi.insights
      .suggest({ step: id, brief, ...ctx })
      .then(res => {
        if (!alive) return;
        if (res?.suggestion) {
          setSuggestion(res.suggestion);
          setSuggestSource('ai');
        } else {
          setSuggestion(localSuggest(id, brief));
          setSuggestSource('guide');
        }
      })
      .catch(() => {
        if (alive) {
          setSuggestion(localSuggest(id, brief));
          setSuggestSource('guide');
        }
      });
    return () => {
      alive = false;
    };
    // Chỉ chạy khi đổi bước — brief mới nhất đọc trong closure đủ dùng cho gợi ý.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // Khi vào bước "goal": xếp hạng goal (BE → heuristic), auto-chọn primary.
  useEffect(() => {
    if (cur.id !== 'goal' || goalRanks.length > 0) return;
    let alive = true;
    setAnalyzing(true);
    rexerApi.insights
      .classifyGoal({ brief, ...ctx })
      .then(res => {
        if (!alive) return;
        if (res?.goals?.length) {
          setGoalRanks(res.goals);
          setGoalSource('ai');
        } else {
          setGoalRanks(localClassifyGoal(brief));
          setGoalSource('guide');
        }
      })
      .catch(() => {
        if (alive) {
          setGoalRanks(localClassifyGoal(brief));
          setGoalSource('guide');
        }
      })
      .finally(() => {
        if (alive) setAnalyzing(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur.id]);

  useEffect(() => {
    if (goalRanks.length && !primaryGoal) setPrimaryGoal(goalRanks[0].goal);
  }, [goalRanks, primaryGoal]);

  // Khi vào bước "journey" và đã có goal: dựng journey (BE → heuristic).
  useEffect(() => {
    if (cur.id !== 'journey' || !primaryGoal || journey) return;
    let alive = true;
    setAnalyzing(true);
    rexerApi.insights
      .suggestJourney({
        primary_goal: primaryGoal,
        secondary_goal: secondaryGoal,
        brief,
        ...ctx,
      })
      .then(res => {
        const data = res ?? localSuggestJourney(brief, primaryGoal);
        if (!alive) return;
        setJourney(data.journey);
        setPattern(data.industry_pattern ?? null);
      })
      .catch(() => {
        if (!alive) return;
        const data = localSuggestJourney(brief, primaryGoal);
        setJourney(data.journey);
        setPattern(data.industry_pattern ?? null);
      })
      .finally(() => {
        if (alive) setAnalyzing(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur.id, primaryGoal]);

  // Helpers cập nhật brief theo section (chỉ các section dạng object).
  type ObjSection =
    | 'brand'
    | 'product'
    | 'objective'
    | 'audience'
    | 'market'
    | 'assets';
  function patch<K extends ObjSection>(
    section: K,
    val: Partial<NonNullable<InsightBrief[K]>>
  ) {
    setBrief(
      b =>
        ({
          ...b,
          [section]: { ...(b[section] ?? {}), ...val },
        }) as InsightBrief
    );
  }
  function toggleArr(list: string[] | undefined, v: string): string[] {
    const arr = list ?? [];
    return arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
  }
  function lines(v: string): string[] {
    return v
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
  }

  function pickGoal(g: ExperienceGoal) {
    setPrimaryGoal(g);
    setJourney(null); // đổi goal → dựng lại journey ở bước sau
  }

  const goalLabel = (g: ExperienceGoal) => {
    const key = `goals.${g}`;
    const label = t(key);
    return label === key ? g : label;
  };

  // Điều kiện cho phép sang bước kế.
  const canNext = (() => {
    if (cur.id === 'brand') return !!workspaceId && !!brief.brand?.name?.trim();
    if (cur.id === 'goal') return !!primaryGoal;
    return true;
  })();

  const isReview = cur.id === 'review';
  const nextIsAi = STEPS[step + 1]?.ai;

  function submit() {
    onRun({
      workspace_id: workspaceId,
      title: brief.brand?.name || undefined,
      inputs: { brief, source: 'wizard_v2' },
      selections: {
        experience_goal: primaryGoal
          ? { primary_goal: primaryGoal, secondary_goal: secondaryGoal }
          : undefined,
        customer_journey: journey ?? undefined,
      },
    });
  }

  function goNext() {
    if (isReview) {
      submit();
      return;
    }
    setStep(s => Math.min(STEPS.length - 1, s + 1));
  }

  return (
    <div className='flex flex-col gap-4 lg:flex-row lg:items-start'>
      {/* Sidebar 10 bước */}
      <nav className='border-border bg-card shrink-0 rounded-2xl border p-2.5 lg:w-60'>
        <ul className='flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible'>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = i === step;
            const passed = i < step;
            const reachable = i <= step;
            return (
              <li key={s.id} className='lg:contents'>
                {i === FIRST_AI_INDEX && (
                  <div className='hidden px-2.5 pt-2.5 pb-1 text-[10px] font-bold tracking-wide text-violet-600 lg:block'>
                    {t('intake.aiSection')}
                  </div>
                )}
                <button
                  type='button'
                  onClick={() => reachable && setStep(i)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition',
                    active && (s.ai ? 'bg-violet-50' : 'bg-primary/5'),
                    !reachable && 'opacity-50',
                    reachable && 'cursor-pointer'
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex size-7 shrink-0 items-center justify-center rounded-lg [&_svg]:size-[15px]',
                      passed && 'bg-success-bg text-success',
                      active &&
                        (s.ai
                          ? 'bg-violet-600 text-white'
                          : 'bg-primary text-white'),
                      !passed && !active && 'bg-muted text-content-muted'
                    )}
                  >
                    {passed ? <Check aria-hidden /> : <Icon aria-hidden />}
                  </span>
                  <span className='min-w-0'>
                    <span
                      className={cn(
                        'block font-mono text-[9.5px]',
                        active
                          ? s.ai
                            ? 'text-violet-600'
                            : 'text-primary'
                          : 'text-content-muted'
                      )}
                    >
                      {String(i + 1).padStart(2, '0')}
                      {s.ai && ' · AI'}
                    </span>
                    <span
                      className={cn(
                        'block truncate text-[12.5px] leading-tight',
                        active
                          ? 'text-content-main font-semibold'
                          : 'text-content-muted'
                      )}
                    >
                      {t(`intake.steps.${s.id}`)}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Panel chính */}
      <div className='border-border bg-card relative flex min-h-[480px] flex-1 flex-col rounded-2xl border'>
        {analyzing && (
          <div className='absolute inset-0 z-10 grid place-items-center rounded-2xl bg-white/85 backdrop-blur-sm'>
            <div className='text-center'>
              <Loader2 className='mx-auto size-7 animate-spin text-violet-600' />
              <p className='text-content-main mt-3 text-sm font-semibold'>
                {t('intake.analyzing')}
              </p>
            </div>
          </div>
        )}

        {/* Header bước */}
        <div className='border-border flex items-center justify-between border-b px-6 py-4'>
          <div className='flex items-center gap-2.5'>
            {cur.ai && (
              <span className='rounded-md bg-violet-600 px-2 py-0.5 text-[10.5px] font-bold text-white'>
                AI
              </span>
            )}
            <h2 className='text-content-main text-lg font-semibold tracking-tight'>
              {t(`intake.steps.${cur.id}`)}
            </h2>
          </div>
          <span className='text-content-muted font-mono text-xs'>
            {step + 1}/{STEPS.length}
          </span>
        </div>

        {/* Nội dung bước */}
        <div className='min-h-0 flex-1 overflow-y-auto px-6 py-5'>
          {suggestion && cur.phase === 0 && (
            <SuggestCallout
              suggestion={suggestion}
              source={suggestSource}
              onApply={
                suggestion.values
                  ? () => {
                      const v = suggestion.values as {
                        campaign_objectives?: string[];
                      };
                      if (v.campaign_objectives)
                        patch('objective', {
                          campaign_objectives: v.campaign_objectives,
                        });
                    }
                  : undefined
              }
            />
          )}

          {renderStep()}
        </div>

        {/* Nav */}
        <div className='border-border flex items-center justify-between border-t px-6 py-3.5'>
          <button
            type='button'
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className='text-content-muted hover:bg-muted inline-flex items-center gap-1.5 rounded-xl border border-transparent px-3 py-2 text-sm font-semibold transition disabled:opacity-40'
          >
            <ChevronLeft className='size-4' aria-hidden />{' '}
            {t('intake.nav.back')}
          </button>

          {isReview ? (
            <GradientButton
              disabled={submitting}
              onClick={goNext}
              leading={
                submitting ? (
                  <Loader2 className='size-4 animate-spin' aria-hidden />
                ) : (
                  <Sparkles className='size-4' aria-hidden />
                )
              }
            >
              {t('intake.nav.create')}
            </GradientButton>
          ) : (
            <button
              type='button'
              onClick={goNext}
              disabled={!canNext}
              style={
                nextIsAi
                  ? { background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }
                  : undefined
              }
              className={cn(
                'inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-40',
                !nextIsAi && 'bg-primary hover:brightness-110'
              )}
            >
              {nextIsAi ? (
                <>
                  <Wand2 className='size-4' aria-hidden />{' '}
                  {t('intake.nav.aiNext')}
                </>
              ) : (
                <>
                  {t('intake.nav.next')}{' '}
                  <ChevronRight className='size-4' aria-hidden />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // ── Render nội dung từng bước ─────────────────────────────────────────────
  function renderStep() {
    switch (cur.id as StepId) {
      case 'brand':
        return (
          <div className='space-y-4'>
            {!brandLocked && (
              <FieldRow label={t('setup.workspace')}>
                <select
                  value={workspaceId}
                  onChange={e => setWorkspaceId(e.target.value)}
                  disabled={workspaces.loading}
                  className='border-border text-content-main focus:border-primary focus:ring-primary/20 w-full appearance-none rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2'
                >
                  <option value=''>—</option>
                  {workspaceItems.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </FieldRow>
            )}
            <FieldRow label={t('intake.fields.brandName')}>
              <Input
                value={brief.brand?.name ?? ''}
                onChange={e => patch('brand', { name: e.target.value })}
              />
            </FieldRow>
            <FieldRow label={t('intake.fields.positioning')}>
              <Textarea
                value={brief.brand?.positioning ?? ''}
                onChange={e => patch('brand', { positioning: e.target.value })}
              />
            </FieldRow>
            <FieldRow label={t('intake.fields.tone')}>
              <ChipRow>
                {TONES.map(o => (
                  <Chip
                    key={o}
                    on={brief.brand?.tone?.includes(o) ?? false}
                    onClick={() =>
                      patch('brand', { tone: toggleArr(brief.brand?.tone, o) })
                    }
                  >
                    {o}
                  </Chip>
                ))}
              </ChipRow>
            </FieldRow>
            <FieldRow label={t('intake.fields.visualIdentity')}>
              <Input
                value={brief.brand?.visual_identity ?? ''}
                onChange={e =>
                  patch('brand', { visual_identity: e.target.value })
                }
              />
            </FieldRow>
          </div>
        );

      case 'product':
        return (
          <div className='space-y-4'>
            <FieldRow
              label={t('intake.fields.features')}
              hint={t('intake.fields.perLine')}
            >
              <Textarea
                className='min-h-22'
                defaultValue={(brief.product?.features ?? []).join('\n')}
                onChange={e =>
                  patch('product', { features: lines(e.target.value) })
                }
              />
            </FieldRow>
            <FieldRow label={t('intake.fields.benefits')}>
              <Textarea
                value={brief.product?.benefits ?? ''}
                onChange={e => patch('product', { benefits: e.target.value })}
              />
            </FieldRow>
            <div className='grid gap-4 sm:grid-cols-2'>
              <FieldRow label={t('intake.fields.pricing')}>
                <Input
                  value={brief.product?.pricing ?? ''}
                  onChange={e => patch('product', { pricing: e.target.value })}
                />
              </FieldRow>
              <FieldRow label={t('intake.fields.useCases')}>
                <Input
                  value={brief.product?.use_cases ?? ''}
                  onChange={e =>
                    patch('product', { use_cases: e.target.value })
                  }
                />
              </FieldRow>
            </div>
          </div>
        );

      case 'objective':
        return (
          <FieldRow label={t('intake.fields.objectives')}>
            <ChipRow>
              {OBJECTIVES.map(o => (
                <Chip
                  key={o}
                  on={
                    brief.objective?.campaign_objectives?.includes(o) ?? false
                  }
                  onClick={() =>
                    patch('objective', {
                      campaign_objectives: toggleArr(
                        brief.objective?.campaign_objectives,
                        o
                      ),
                    })
                  }
                >
                  {o}
                </Chip>
              ))}
            </ChipRow>
          </FieldRow>
        );

      case 'audience':
        return (
          <div className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-[2fr_1fr]'>
              <FieldRow label={t('intake.fields.persona')}>
                <Input
                  value={brief.audience?.persona ?? ''}
                  onChange={e => patch('audience', { persona: e.target.value })}
                />
              </FieldRow>
              <FieldRow label={t('intake.fields.ageRange')}>
                <Input
                  value={brief.audience?.age_range ?? ''}
                  onChange={e =>
                    patch('audience', { age_range: e.target.value })
                  }
                />
              </FieldRow>
            </div>
            <FieldRow label={t('intake.fields.behaviours')}>
              <Textarea
                value={brief.audience?.behaviours ?? ''}
                onChange={e =>
                  patch('audience', { behaviours: e.target.value })
                }
              />
            </FieldRow>
            <FieldRow
              label={t('intake.fields.painPoints')}
              hint={t('intake.fields.painHint')}
            >
              <Textarea
                defaultValue={(brief.audience?.pain_points ?? []).join('\n')}
                onChange={e =>
                  patch('audience', { pain_points: lines(e.target.value) })
                }
              />
            </FieldRow>
            <FieldRow label={t('intake.fields.motivations')}>
              <Textarea
                value={brief.audience?.motivations ?? ''}
                onChange={e =>
                  patch('audience', { motivations: e.target.value })
                }
              />
            </FieldRow>
            <FieldRow label={t('intake.fields.device')}>
              <ChipRow>
                {DEVICES.map(d => (
                  <Chip
                    key={d}
                    mono
                    on={brief.audience?.device === d}
                    onClick={() => patch('audience', { device: d })}
                  >
                    {d}
                  </Chip>
                ))}
              </ChipRow>
            </FieldRow>
          </div>
        );

      case 'market':
        return (
          <div className='space-y-4'>
            <FieldRow label={t('intake.fields.competitors')}>
              <Textarea
                value={brief.market?.competitors ?? ''}
                onChange={e => patch('market', { competitors: e.target.value })}
              />
            </FieldRow>
            <FieldRow label={t('intake.fields.trends')}>
              <Input
                value={brief.market?.trends ?? ''}
                onChange={e => patch('market', { trends: e.target.value })}
              />
            </FieldRow>
            <FieldRow label={t('intake.fields.expectations')}>
              <Input
                value={brief.market?.expectations ?? ''}
                onChange={e =>
                  patch('market', { expectations: e.target.value })
                }
              />
            </FieldRow>
          </div>
        );

      case 'assets':
        return (
          <div className='space-y-4'>
            <div className='border-border bg-muted/40 rounded-2xl border border-dashed p-6 text-center'>
              <Upload
                className='text-content-muted mx-auto mb-1.5 size-5'
                aria-hidden
              />
              <p className='text-content-main text-sm font-semibold'>
                {t('intake.fields.assetDrop')}
              </p>
            </div>
            <FieldRow label={t('intake.fields.assetAdd')}>
              <Textarea
                defaultValue={(brief.assets?.items ?? []).join('\n')}
                placeholder={t('intake.fields.perLine')}
                onChange={e =>
                  patch('assets', { items: lines(e.target.value) })
                }
              />
            </FieldRow>
            {(brief.assets?.items ?? []).length > 0 && (
              <ChipRow>
                {brief.assets!.items!.map(a => (
                  <span
                    key={a}
                    className='bg-primary/5 text-primary inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-xs'
                  >
                    <ImageIcon className='size-3' aria-hidden />
                    {a}
                  </span>
                ))}
              </ChipRow>
            )}
          </div>
        );

      case 'challenges':
        return (
          <FieldRow label={t('intake.fields.challenges')}>
            <ChipRow>
              {CHALLENGES.map(o => (
                <Chip
                  key={o}
                  on={brief.challenges?.includes(o) ?? false}
                  onClick={() =>
                    setBrief(b => ({
                      ...b,
                      challenges: toggleArr(b.challenges, o),
                    }))
                  }
                >
                  {o}
                </Chip>
              ))}
            </ChipRow>
          </FieldRow>
        );

      case 'goal':
        return (
          <div className='space-y-4'>
            <p className='text-content-muted text-[12.5px]'>
              {goalSource === 'ai'
                ? t('intake.goal.introAi')
                : t('intake.goal.introGuide')}
            </p>
            <div className='grid gap-2.5 sm:grid-cols-2'>
              {GOAL_META.map(meta => {
                const rank = goalRanks.find(g => g.goal === meta.id);
                const on = primaryGoal === meta.id;
                const isPrimary = rank?.rank === 'primary';
                const isSecondary = rank?.rank === 'secondary';
                return (
                  <button
                    key={meta.id}
                    type='button'
                    onClick={() => pickGoal(meta.id)}
                    className={cn(
                      'relative rounded-2xl border p-3 text-left transition',
                      on
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-border bg-card hover:border-violet-200'
                    )}
                  >
                    {isPrimary && rank && (
                      <span className='absolute top-2.5 right-2.5 rounded-md bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold text-white'>
                        {Math.round(rank.confidence * 100)}%
                      </span>
                    )}
                    {isSecondary && (
                      <span className='absolute top-2.5 right-2.5 text-[10px] font-bold text-violet-500'>
                        {t('intake.goal.secondary')}
                      </span>
                    )}
                    <div
                      className={cn(
                        'text-sm font-semibold',
                        on ? 'text-violet-700' : 'text-content-main'
                      )}
                    >
                      {goalLabel(meta.id)}
                    </div>
                    <div className='text-content-muted mt-0.5 font-mono text-[11px]'>
                      {meta.en}
                    </div>
                  </button>
                );
              })}
            </div>
            {primaryGoal &&
              (() => {
                const r = goalRanks.find(g => g.goal === primaryGoal);
                return r?.rationale ? (
                  <div className='rounded-xl bg-violet-50 px-3.5 py-3 text-[12.5px] leading-relaxed text-violet-900/80'>
                    <b className='text-violet-700'>{t('blueprint.why')}:</b>{' '}
                    {r.rationale}
                  </div>
                ) : null;
              })()}
          </div>
        );

      case 'journey':
        return (
          <div className='space-y-4'>
            <p className='text-content-muted text-[12.5px]'>
              {t('intake.journey.intro')}
            </p>
            {pattern && (
              <div className='bg-muted/50 rounded-xl px-3.5 py-3'>
                <div className='text-content-muted mb-1.5 text-[11px] font-bold tracking-wide'>
                  {t('intake.journey.patternLabel')} · {pattern.name}
                </div>
                <div className='flex flex-wrap items-center gap-1.5'>
                  {pattern.stages.map((p, i) => (
                    <span key={p} className='flex items-center gap-1.5'>
                      <span className='text-content-muted font-mono text-[11px]'>
                        {p}
                      </span>
                      {i < pattern.stages.length - 1 && (
                        <ArrowRight
                          className='size-3 text-neutral-300'
                          aria-hidden
                        />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <FieldRow
              label={t('intake.journey.stagesLabel')}
              hint={t('intake.journey.stagesHint')}
            >
              <div className='space-y-2'>
                {(journey?.stages ?? []).map((st, i) => (
                  <div
                    key={st.key}
                    className='border-border flex items-center gap-3 rounded-xl border px-3 py-2'
                  >
                    <span className='bg-primary/10 text-primary inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold'>
                      {i + 1}
                    </span>
                    <input
                      value={st.name}
                      onChange={e => {
                        const stages = [...(journey?.stages ?? [])];
                        stages[i] = { ...stages[i], name: e.target.value };
                        setJourney(j => (j ? { ...j, stages } : j));
                      }}
                      className='text-content-main flex-1 border-none bg-transparent text-sm font-semibold outline-none'
                    />
                    <span className='text-success shrink-0 text-[11px] font-semibold whitespace-nowrap'>
                      {st.intent}
                    </span>
                  </div>
                ))}
              </div>
            </FieldRow>
          </div>
        );

      case 'review':
        return (
          <div className='grid gap-3 sm:grid-cols-2'>
            <ReviewCard
              label={t('intake.review.brand')}
              value={brief.brand?.name}
            />
            <ReviewCard
              label={t('intake.review.objective')}
              value={brief.objective?.campaign_objectives?.join(', ')}
            />
            <ReviewCard
              label={t('intake.review.audience')}
              value={brief.audience?.persona}
            />
            <ReviewCard
              label={t('intake.review.goal')}
              value={primaryGoal ? goalLabel(primaryGoal) : undefined}
            />
            <ReviewCard
              label={t('intake.review.journey')}
              value={t('intake.review.journeyCount', {
                n: journey?.stages?.length ?? 0,
              })}
            />
            <ReviewCard
              label={t('intake.review.challenges')}
              value={brief.challenges?.join(', ')}
            />
          </div>
        );

      default:
        return null;
    }
  }
}

/** Hàng field: label + control. */
function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='space-y-1.5'>
      <Label>
        {label}
        {hint && (
          <span className='text-content-muted ml-1 text-xs font-normal'>
            · {hint}
          </span>
        )}
      </Label>
      {children}
    </div>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <div className='flex flex-wrap gap-2'>{children}</div>;
}

function ReviewCard({ label, value }: { label: string; value?: string }) {
  return (
    <div className='bg-muted/50 rounded-xl px-3.5 py-3'>
      <div className='text-content-muted mb-0.5 text-[11px] font-semibold'>
        {label}
      </div>
      <div className='text-content-main text-sm font-medium'>
        {value || '—'}
      </div>
    </div>
  );
}
