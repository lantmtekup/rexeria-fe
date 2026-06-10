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
  Plus,
  Sparkles,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

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
import { EMPTY_BRIEF, HAPPY_CITY_BRIEF } from './seed';
import { AssetPickerDialog } from './AssetPickerDialog';

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
  /** Mở để "chỉnh sửa & chạy lại" từ 1 report cũ → prefill brief/goal/journey. */
  fromReportId?: string;
}

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
  fromReportId,
}: IntakeWizardProps) {
  const t = useTranslations('insights');

  const [step, setStep] = useState(0);
  // Tạo mới: prefill seed Happy City. Chỉnh sửa từ report cũ: bắt đầu trắng rồi
  // hydrate từ input_snapshot (effect bên dưới).
  const [brief, setBrief] = useState<InsightBrief>(
    fromReportId ? EMPTY_BRIEF : HAPPY_CITY_BRIEF
  );
  const [hydrating, setHydrating] = useState(!!fromReportId);
  const [parentReportId, setParentReportId] = useState<string | undefined>(
    undefined
  );

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

  // "Chỉnh sửa & chạy lại": nạp brief/goal/journey từ report cũ (input_snapshot).
  useEffect(() => {
    if (!fromReportId) return;
    let alive = true;
    setHydrating(true);
    rexerApi.insights
      .get(fromReportId)
      .then(r => {
        if (!alive) return;

        const s = (r.input_snapshot ?? {}) as Record<string, any>;
        const b = s.manual?.brief ?? s.brief;
        if (b) setBrief(b as InsightBrief);
        const eg = s.selections?.experience_goal;
        const goals: string[] = [];
        if (eg?.primary_goal) goals.push(eg.primary_goal);
        if (eg?.secondary_goal) goals.push(eg.secondary_goal);
        if (Array.isArray(s.manual?.custom_goals))
          goals.push(...s.manual.custom_goals);
        if (goals.length) setSelectedGoals(goals);
        if (s.selections?.customer_journey)
          setJourney(s.selections.customer_journey as InsightBlueprintJourney);
        setParentReportId(fromReportId);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setHydrating(false);
      });
    return () => {
      alive = false;
    };
  }, [fromReportId]);

  // Gợi ý lũy tiến cho bước hiện tại.
  const [suggestion, setSuggestion] = useState<InsightStepSuggestion | null>(
    null
  );
  const [suggestSource, setSuggestSource] = useState<'ai' | 'guide'>('guide');

  // Experience Goal đã xếp hạng + lựa chọn.
  const [goalRanks, setGoalRanks] = useState<GoalRanking[]>([]);
  const [goalSource, setGoalSource] = useState<'ai' | 'guide'>('guide');
  // Multi-select goal: mảng có thứ tự — enum đầu = primary, enum kế = secondary;
  // có thể chứa goal tuỳ chỉnh (string ngoài enum) do user tự nhập.
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [goalInput, setGoalInput] = useState('');

  // Journey đề xuất (sửa được).
  const [journey, setJourney] = useState<InsightBlueprintJourney | null>(null);
  const [pattern, setPattern] = useState<{
    name: string;
    stages: string[];
  } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Bước "assets": upload file thật + ô thêm tay + chọn từ thư viện.
  const [uploading, setUploading] = useState(false);
  const [assetInput, setAssetInput] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  // Bước "brand": ô thêm tone tuỳ chỉnh.
  const [toneInput, setToneInput] = useState('');
  // Bước "objective": ô thêm mục tiêu tuỳ chỉnh.
  const [objectiveInput, setObjectiveInput] = useState('');
  // Bước "challenges": ô thêm thách thức tuỳ chỉnh.
  const [challengeInput, setChallengeInput] = useState('');

  const cur = STEPS[step];
  const ctx = { workspace_id: workspaceId || undefined };

  // g có phải Experience Goal enum hợp lệ không?
  const isExpGoal = (g: string): g is ExperienceGoal =>
    GOAL_META.some(m => m.id === g);
  // primary = enum goal đầu tiên đã chọn; secondary = enum kế tiếp.
  const enumGoals = selectedGoals.filter(isExpGoal) as ExperienceGoal[];
  const primaryGoal: ExperienceGoal | null = enumGoals[0] ?? null;
  const secondaryGoal: ExperienceGoal | null = enumGoals[1] ?? null;

  // Mỗi lần đổi bước: nạp gợi ý (ưu tiên BE, fallback heuristic). Chỉ gọi BE cho
  // các bước BE `suggest` hỗ trợ (xem be-fe-test §1) — bước khác chỉ dùng heuristic.
  useEffect(() => {
    let alive = true;
    const id = cur.id;
    const SUGGEST_STEPS: StepId[] = [
      'product',
      'objective',
      'audience',
      'market',
      'assets',
      'challenges',
    ];
    if (!SUGGEST_STEPS.includes(id)) {
      setSuggestion(localSuggest(id, brief));
      setSuggestSource('guide');
      return;
    }
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
    if (goalRanks.length && selectedGoals.length === 0)
      setSelectedGoals([goalRanks[0].goal]);
  }, [goalRanks, selectedGoals.length]);

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

  // ── Assets: thêm/xoá + upload file thật (tái dùng luồng media init→raw→complete)
  function appendAssets(names: string[]) {
    if (!names.length) return;
    setBrief(b => {
      const cur = b.assets?.items ?? [];
      const fresh = names.filter(n => n && !cur.includes(n));
      if (!fresh.length) return b;
      return { ...b, assets: { ...b.assets, items: [...cur, ...fresh] } };
    });
  }
  function removeAsset(idx: number) {
    setBrief(b => ({
      ...b,
      assets: {
        ...b.assets,
        items: (b.assets?.items ?? []).filter((_, i) => i !== idx),
      },
    }));
  }
  function addTone() {
    const v = toneInput.trim();
    if (!v) return;
    setBrief(b => {
      const cur = b.brand?.tone ?? [];
      if (cur.includes(v)) return b;
      return { ...b, brand: { ...b.brand, tone: [...cur, v] } };
    });
    setToneInput('');
  }
  function addObjective() {
    const v = objectiveInput.trim();
    if (!v) return;
    setBrief(b => {
      const cur = b.objective?.campaign_objectives ?? [];
      if (cur.includes(v)) return b;
      return {
        ...b,
        objective: { ...b.objective, campaign_objectives: [...cur, v] },
      };
    });
    setObjectiveInput('');
  }
  function addChallenge() {
    const v = challengeInput.trim();
    if (!v) return;
    setBrief(b => {
      const cur = b.challenges ?? [];
      if (cur.includes(v)) return b;
      return { ...b, challenges: [...cur, v] };
    });
    setChallengeInput('');
  }
  function kindOf(mime: string): 'image' | 'video' | 'file' {
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    return 'file';
  }
  async function uploadAssets(fileList: FileList | null) {
    const files = fileList ? Array.from(fileList) : [];
    if (!files.length) return;
    setUploading(true);
    const names: string[] = [];
    for (const file of files) {
      try {
        const init = await rexerApi.media.initUpload({
          filename: file.name,
          mime_type: file.type || 'application/octet-stream',
          file_size: file.size,
          owner_scope: 'library',
          media_type: kindOf(file.type),
        });
        // PUT thẳng chỉ khi presigned_url là storage external thật; còn lại
        // dùng proxy uploadRaw (đi qua /api/rexer rewrite) — giống MediaLibrary.
        const ps = init.presigned_url;
        const useDirect =
          !!ps && /^https?:\/\//i.test(ps) && !ps.includes('/media/uploads/');
        if (useDirect) {
          const r = await fetch(ps!, {
            method: 'PUT',
            headers: {
              'Content-Type': file.type || 'application/octet-stream',
            },
            body: file,
          });
          if (!r.ok) throw new Error(`upload ${r.status}`);
        } else {
          await rexerApi.media.uploadRaw(init.upload_id, file);
        }
        const res = await rexerApi.media.completeUpload({
          upload_id: init.upload_id,
        });
        names.push(res?.media_asset?.original_filename || file.name);
      } catch {
        toast.error(`Upload "${file.name}" thất bại`);
      }
    }
    appendAssets(names);
    setUploading(false);
    if (names.length) toast.success(`Đã thêm ${names.length} file`);
  }

  function toggleGoal(g: string) {
    setSelectedGoals(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
    );
    setJourney(null); // đổi goal → dựng lại journey ở bước sau
  }
  function addGoal() {
    const v = goalInput.trim();
    if (!v) return;
    setSelectedGoals(prev => (prev.includes(v) ? prev : [...prev, v]));
    setGoalInput('');
    setJourney(null);
  }

  // Journey: thêm / sửa / xoá stage (chỉnh trực tiếp trên journey.stages).
  function addStage() {
    setJourney(j => {
      const base = j ?? {
        journey_pattern_name: '',
        rationale: '',
        stages: [],
      };
      const key = `custom-${base.stages.length}-${base.stages.reduce((a, s) => a + s.key.length, 0)}`;
      return {
        ...base,
        stages: [...base.stages, { key, name: '', intent: '', rationale: '' }],
      };
    });
  }
  function updateStage(
    i: number,
    patchStage: { name?: string; intent?: string }
  ) {
    setJourney(j => {
      if (!j) return j;
      const stages = [...j.stages];
      stages[i] = { ...stages[i], ...patchStage };
      return { ...j, stages };
    });
  }
  function removeStage(i: number) {
    setJourney(j =>
      j ? { ...j, stages: j.stages.filter((_, idx) => idx !== i) } : j
    );
  }

  const goalLabel = (g: ExperienceGoal) => {
    const key = `goals.${g}`;
    const label = t(key);
    return label === key ? g : label;
  };

  // Điều kiện cho phép sang bước kế.
  const canNext = (() => {
    if (cur.id === 'brand') return !!workspaceId && !!brief.brand?.name?.trim();
    if (cur.id === 'goal') return selectedGoals.length > 0;
    return true;
  })();

  const isReview = cur.id === 'review';
  const nextIsAi = STEPS[step + 1]?.ai;

  function submit() {
    const customGoals = selectedGoals.filter(g => !isExpGoal(g));
    onRun({
      workspace_id: workspaceId,
      title: brief.brand?.name || undefined,
      parent_report_id: parentReportId,
      inputs: {
        brief,
        source: 'wizard_v2',
        ...(customGoals.length ? { custom_goals: customGoals } : {}),
      },
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
        {(analyzing || hydrating) && (
          <div className='absolute inset-0 z-10 grid place-items-center rounded-2xl bg-white/85 backdrop-blur-sm'>
            <div className='text-center'>
              <Loader2 className='mx-auto size-7 animate-spin text-violet-600' />
              <p className='text-content-main mt-3 text-sm font-semibold'>
                {hydrating ? t('list.loading') : t('intake.analyzing')}
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
                {/* Tone mặc định + tone tuỳ chỉnh user đã thêm */}
                {[
                  ...TONES,
                  ...(brief.brand?.tone ?? []).filter(x => !TONES.includes(x)),
                ].map(o => (
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
              <div className='mt-2 flex gap-2'>
                <Input
                  value={toneInput}
                  onChange={e => setToneInput(e.target.value)}
                  placeholder={t('intake.fields.toneAddPh')}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTone();
                    }
                  }}
                />
                <button
                  type='button'
                  onClick={addTone}
                  disabled={!toneInput.trim()}
                  className='border-border text-content-muted hover:bg-muted inline-flex shrink-0 items-center gap-1 rounded-xl border px-3 text-sm font-semibold transition disabled:opacity-40'
                >
                  <Plus className='size-4' aria-hidden />
                  {t('intake.fields.assetAddBtn')}
                </button>
              </div>
            </FieldRow>
            <FieldRow label={t('intake.fields.visualIdentity')}>
              <Textarea
                className='min-h-20'
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
              <FieldRow
                label={t('intake.fields.pricing')}
                hint={t('intake.fields.perLine')}
              >
                <Textarea
                  defaultValue={(brief.product?.pricing ?? []).join('\n')}
                  onChange={e =>
                    patch('product', { pricing: lines(e.target.value) })
                  }
                />
              </FieldRow>
              <FieldRow
                label={t('intake.fields.useCases')}
                hint={t('intake.fields.perLine')}
              >
                <Textarea
                  defaultValue={(brief.product?.use_cases ?? []).join('\n')}
                  onChange={e =>
                    patch('product', { use_cases: lines(e.target.value) })
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
              {/* Mục tiêu mặc định + mục tiêu tuỳ chỉnh user đã thêm */}
              {[
                ...OBJECTIVES,
                ...(brief.objective?.campaign_objectives ?? []).filter(
                  x => !OBJECTIVES.includes(x)
                ),
              ].map(o => (
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
            <div className='mt-2 flex gap-2'>
              <Input
                value={objectiveInput}
                onChange={e => setObjectiveInput(e.target.value)}
                placeholder={t('intake.fields.objectiveAddPh')}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addObjective();
                  }
                }}
              />
              <button
                type='button'
                onClick={addObjective}
                disabled={!objectiveInput.trim()}
                className='border-border text-content-muted hover:bg-muted inline-flex shrink-0 items-center gap-1 rounded-xl border px-3 text-sm font-semibold transition disabled:opacity-40'
              >
                <Plus className='size-4' aria-hidden />
                {t('intake.fields.assetAddBtn')}
              </button>
            </div>
          </FieldRow>
        );

      case 'audience':
        return (
          <div className='space-y-4'>
            <FieldRow label={t('intake.fields.persona')}>
              <Textarea
                className='min-h-16'
                value={brief.audience?.persona ?? ''}
                onChange={e => patch('audience', { persona: e.target.value })}
              />
            </FieldRow>
            <FieldRow label={t('intake.fields.ageRange')}>
              <Input
                className='sm:max-w-xs'
                value={brief.audience?.age_range ?? ''}
                onChange={e => patch('audience', { age_range: e.target.value })}
              />
            </FieldRow>
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
              <Textarea
                value={brief.market?.trends ?? ''}
                onChange={e => patch('market', { trends: e.target.value })}
              />
            </FieldRow>
            <FieldRow label={t('intake.fields.expectations')}>
              <Textarea
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
            {/* Upload thật: label bọc input ẩn → click hoặc kéo-thả */}
            <label
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                if (!uploading) uploadAssets(e.dataTransfer.files);
              }}
              className={cn(
                'border-border bg-muted/40 flex cursor-pointer flex-col items-center rounded-2xl border border-dashed p-6 text-center transition',
                uploading
                  ? 'cursor-wait opacity-80'
                  : 'hover:border-primary/40 hover:bg-primary/5'
              )}
            >
              <input
                type='file'
                multiple
                accept='image/*,video/*,.pdf,.doc,.docx'
                className='sr-only'
                disabled={uploading}
                onChange={e => {
                  uploadAssets(e.target.files);
                  e.target.value = '';
                }}
              />
              {uploading ? (
                <>
                  <Loader2 className='text-primary mb-1.5 size-5 animate-spin' />
                  <p className='text-content-main text-sm font-semibold'>
                    {t('intake.fields.assetUploading')}
                  </p>
                </>
              ) : (
                <>
                  <Upload
                    className='text-content-muted mb-1.5 size-5'
                    aria-hidden
                  />
                  <p className='text-content-main text-sm font-semibold'>
                    {t('intake.fields.assetDrop')}
                  </p>
                  <p className='text-content-muted mt-0.5 text-xs'>
                    {t('intake.fields.assetUploadHint')}
                  </p>
                </>
              )}
            </label>

            {/* Chọn từ thư viện media đã có */}
            <button
              type='button'
              onClick={() => setPickerOpen(true)}
              className='border-border text-content-main hover:bg-muted flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition'
            >
              <ImageIcon className='text-primary size-4' aria-hidden />
              {t('intake.fields.assetPick')}
            </button>
            <AssetPickerDialog
              open={pickerOpen}
              onOpenChange={setPickerOpen}
              onPick={appendAssets}
            />

            {/* Thêm tay (tên/URL asset đã có sẵn) */}
            <FieldRow label={t('intake.fields.assetAdd')}>
              <div className='flex gap-2'>
                <Input
                  value={assetInput}
                  onChange={e => setAssetInput(e.target.value)}
                  placeholder={t('intake.fields.assetManualPh')}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const v = assetInput.trim();
                      if (v) {
                        appendAssets([v]);
                        setAssetInput('');
                      }
                    }
                  }}
                />
                <button
                  type='button'
                  onClick={() => {
                    const v = assetInput.trim();
                    if (v) {
                      appendAssets([v]);
                      setAssetInput('');
                    }
                  }}
                  disabled={!assetInput.trim()}
                  className='border-border text-content-muted hover:bg-muted inline-flex shrink-0 items-center gap-1 rounded-xl border px-3 text-sm font-semibold transition disabled:opacity-40'
                >
                  <Plus className='size-4' aria-hidden />
                  {t('intake.fields.assetAddBtn')}
                </button>
              </div>
            </FieldRow>

            {/* Chips: mỗi asset có nút xoá */}
            {(brief.assets?.items ?? []).length > 0 && (
              <ChipRow>
                {brief.assets!.items!.map((a, i) => (
                  <span
                    key={`${a}-${i}`}
                    className='bg-primary/5 text-primary inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-xs'
                  >
                    <ImageIcon className='size-3' aria-hidden />
                    {a}
                    <button
                      type='button'
                      onClick={() => removeAsset(i)}
                      className='hover:text-primary/60 -mr-0.5 ml-0.5'
                      aria-label='Xoá'
                    >
                      <X className='size-3' aria-hidden />
                    </button>
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
              {/* Thách thức mặc định + tuỳ chỉnh user đã thêm */}
              {[
                ...CHALLENGES,
                ...(brief.challenges ?? []).filter(
                  x => !CHALLENGES.includes(x)
                ),
              ].map(o => (
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
            <div className='mt-2 flex gap-2'>
              <Input
                value={challengeInput}
                onChange={e => setChallengeInput(e.target.value)}
                placeholder={t('intake.fields.challengeAddPh')}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addChallenge();
                  }
                }}
              />
              <button
                type='button'
                onClick={addChallenge}
                disabled={!challengeInput.trim()}
                className='border-border text-content-muted hover:bg-muted inline-flex shrink-0 items-center gap-1 rounded-xl border px-3 text-sm font-semibold transition disabled:opacity-40'
              >
                <Plus className='size-4' aria-hidden />
                {t('intake.fields.assetAddBtn')}
              </button>
            </div>
          </FieldRow>
        );

      case 'goal':
        return (
          <div className='space-y-4'>
            <p className='text-content-muted text-[12.5px]'>
              {(goalSource === 'ai'
                ? t('intake.goal.introAi')
                : t('intake.goal.introGuide')) +
                ' ' +
                t('intake.goal.multiHint')}
            </p>
            <div className='grid gap-2.5 sm:grid-cols-2'>
              {[
                ...GOAL_META.map(m => ({
                  id: m.id as string,
                  en: m.en,
                  vn: goalLabel(m.id),
                  custom: false,
                })),
                ...selectedGoals
                  .filter(g => !isExpGoal(g))
                  .map(g => ({
                    id: g,
                    en: t('intake.goal.customLabel'),
                    vn: g,
                    custom: true,
                  })),
              ].map(item => {
                const on = selectedGoals.includes(item.id);
                const role =
                  item.id === primaryGoal
                    ? 'primary'
                    : item.id === secondaryGoal
                      ? 'secondary'
                      : null;
                const rank = item.custom
                  ? undefined
                  : goalRanks.find(g => g.goal === item.id);
                return (
                  <button
                    key={item.id}
                    type='button'
                    onClick={() => toggleGoal(item.id)}
                    className={cn(
                      'relative rounded-2xl border p-3 text-left transition',
                      on
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-border bg-card hover:border-violet-200'
                    )}
                  >
                    <span className='absolute top-2.5 right-2.5'>
                      {role === 'primary' ? (
                        <span className='rounded-md bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold text-white'>
                          {t('intake.goal.primary')}
                        </span>
                      ) : role === 'secondary' ? (
                        <span className='text-[10px] font-bold text-violet-500'>
                          {t('intake.goal.secondary')}
                        </span>
                      ) : rank?.rank === 'primary' ? (
                        <span className='rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-700'>
                          {Math.round(rank.confidence * 100)}%
                        </span>
                      ) : null}
                    </span>
                    <div
                      className={cn(
                        'pr-10 text-sm font-semibold',
                        on ? 'text-violet-700' : 'text-content-main'
                      )}
                    >
                      {item.vn}
                    </div>
                    <div className='text-content-muted mt-0.5 font-mono text-[11px]'>
                      {item.en}
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Thêm goal tuỳ chỉnh nếu không có option phù hợp */}
            <div className='flex gap-2'>
              <Input
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                placeholder={t('intake.goal.addPh')}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addGoal();
                  }
                }}
              />
              <button
                type='button'
                onClick={addGoal}
                disabled={!goalInput.trim()}
                className='border-border text-content-muted hover:bg-muted inline-flex shrink-0 items-center gap-1 rounded-xl border px-3 text-sm font-semibold transition disabled:opacity-40'
              >
                <Plus className='size-4' aria-hidden />
                {t('intake.fields.assetAddBtn')}
              </button>
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
                    className='border-border flex items-center gap-2 rounded-xl border px-3 py-2'
                  >
                    <span className='bg-primary/10 text-primary inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold'>
                      {i + 1}
                    </span>
                    <input
                      value={st.name}
                      onChange={e => updateStage(i, { name: e.target.value })}
                      placeholder={t('intake.journey.stageNamePh')}
                      className='text-content-main min-w-0 flex-1 border-none bg-transparent text-sm font-semibold outline-none'
                    />
                    <input
                      value={st.intent}
                      onChange={e => updateStage(i, { intent: e.target.value })}
                      placeholder={t('intake.journey.intentPh')}
                      className='text-success w-28 shrink-0 border-none bg-transparent text-right text-[11px] font-semibold outline-none'
                    />
                    <button
                      type='button'
                      onClick={() => removeStage(i)}
                      aria-label='Xoá'
                      className='text-content-muted hover:text-danger shrink-0'
                    >
                      <X className='size-3.5' aria-hidden />
                    </button>
                  </div>
                ))}
                <button
                  type='button'
                  onClick={addStage}
                  className='border-border text-content-muted hover:bg-muted flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed px-3 py-2 text-sm font-semibold transition'
                >
                  <Plus className='size-4' aria-hidden />
                  {t('intake.journey.addStage')}
                </button>
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
              value={
                selectedGoals
                  .map(g => (isExpGoal(g) ? goalLabel(g) : g))
                  .join(', ') || undefined
              }
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
