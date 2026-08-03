'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Check,
  ExternalLink,
  Loader2,
  Pencil,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';

import { Input } from '@/components/atoms/input';
import { Textarea } from '@/components/atoms/textarea';
import { cn } from '@/lib/cn';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import { resolveTemplateFromVersionId } from '@/services/rexer/resolveTemplateFromVersion';
import { useRexer } from '@/services/rexer/use-rexer';
import type { Page, Template } from '@/services/rexer/types';
import { GradientButton } from '../steps/ui';
import { ImageUrlInput } from './ImageUrlInput';
import { pollInsightReport } from './pollInsightReport';
import { FieldRow, ScopeFields } from './ScopeFields';
import { TemplateChecklist } from './TemplateChecklist';
import {
  applyOverrides,
  buildChecklist,
  countFilled,
  countSlots,
  overridesFromChecklist,
  type ChecklistBlock,
  type ChecklistOverrides,
} from './checklistModel';
import { useWorkspaceScope } from './useWorkspaceScope';

/**
 * Tạo landing mới từ 1 landing có sẵn dùng làm khuôn — AI viết lại TOÀN BỘ nội
 * dung theo brief người dùng nhập. Page gốc không đổi.
 *
 * Trước đây màn này gọi `POST /insights/pages/{id}/variants`. Đã bỏ: endpoint đó
 * chỉ clone canvas rồi CHÈN THÊM đúng 1 block AI viết, mọi block cũ giữ nguyên
 * từng chữ (swagger BE ghi rõ `inputs` là "hints *for the new block*"). Kết quả
 * thực tế là landing bất động sản Cà Mau gắn thêm một form đặt lịch xem nhẫn.
 *
 * Luồng hiện tại dựa trên handoff, vì `insight.go:387-412` đã làm sẵn đúng việc:
 * `cloneTemplateBlocks` giữ bố cục (và giữ nguyên `id` từng block), rồi
 * `fillBlockContent` gọi LLM viết lại MỌI block theo brief của report, với ảnh
 * brief được ưu tiên trong enum ảnh.
 *
 * Màn chia làm HAI CHẶNG, vì bản một-chặng bắt người dùng điền vào những ô trống
 * mang placeholder là chữ tiếng Anh của khuôn — tức là bắt họ tự nghĩ ra đúng
 * thứ mà AI sinh ra để làm.
 *
 *   Chặng 1 — nhập brief, bấm "Tạo nội dung":
 *     1. resolve Template từ page đã chọn (chạy ngay lúc chọn, lỗi thì rẻ)
 *     2. tạo insight report từ brief (ảnh gửi ở key `media` — BE KHÔNG đọc
 *        `image_urls`, xem `briefMedia` trong insight_block_schema.go)
 *     3. poll tới `succeeded`
 *     4. handoff `publish:false` → template mới, AI đã viết hết 7 block
 *     5. đọc canvas đó, đổ vào checklist làm bản nháp để soát
 *
 *   Chặng 2 — soát/sửa rồi bấm "Tạo trang":
 *     6. tạo page từ template đã dựng
 *     7. ghi đè phần người dùng sửa lên canvas của page
 *     8. publish nếu người dùng chọn
 *
 * Handoff dừng được ở template vì nhánh tạo page của nó chỉ chạy khi
 * `publish: true` (insight.go:458) — nhờ vậy mới có bản nháp để soát mà chưa có
 * gì công khai. Bỏ ngang ở chặng 2 chỉ để lại một template thừa.
 *
 * Bước 7 cố ý KHÔNG dùng `block_contents` của handoff: BE bỏ qua nguyên block
 * nếu block đó đã có key `content`, nên điền 2/5 ô sẽ khiến 3 ô còn lại giữ
 * nguyên chữ của khuôn — đúng cái lỗi đang phải sửa.
 *
 * Vì chạy nhiều bước trong một hàm async nên màn này tự quản submit/kết quả,
 * không đi qua `useInsightsFlow` (hook đó gắn với vòng đời 3 phase của wizard).
 */
export function TemplateVariantIntake({
  brandLocked,
}: {
  brandLocked: boolean;
}) {
  const t = useTranslations('insights');
  const scope = useWorkspaceScope(brandLocked);

  const [pageId, setPageId] = useState('');
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [objective, setObjective] = useState('');
  const [audience, setAudience] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [publish, setPublish] = useState(false);

  const [template, setTemplate] = useState<Template | null>(null);
  const [checklist, setChecklist] = useState<ChecklistBlock[]>([]);
  const [overrides, setOverrides] = useState<ChecklistOverrides>({});
  const [tplLoading, setTplLoading] = useState(false);
  // Lưu MÃ lỗi (`errTpl` | `errNoVersion`) chứ không lưu câu đã dịch — xem chú
  // thích ở effect resolve template bên dưới.
  const [tplError, setTplError] = useState<'errTpl' | 'errNoVersion' | null>(
    null
  );

  // Có giá trị = đã qua chặng 1, đang ở màn soát. Template đã tồn tại nhưng
  // chưa có page nào — bỏ ngang chỉ để lại một template thừa, không có gì
  // công khai.
  const [draft, setDraft] = useState<{
    templateId: string;
    reportId: string;
  } | null>(null);

  const [stage, setStage] = useState<Stage | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);

  // Chỉ list page khi đã có workspace — endpoint là workspace-scoped. Lọc
  // `type: 'landing'` vì ad/curate/email không dùng làm khuôn landing được.
  const pages = useRexer(
    () =>
      scope.workspaceId
        ? rexerApi.pages.list(scope.workspaceId, {
            type: 'landing',
            limit: 200,
          })
        : Promise.resolve(null),
    [scope.workspaceId]
  );

  /**
   * External landing chỉ là một URL trỏ ra ngoài, không có canvas để làm khuôn.
   * Lọc sẵn ở đây để người dùng không chọn được rồi mới ăn lỗi.
   */
  const templateItems = useMemo(
    () => (pages.data?.items ?? []).filter(p => !p.external_url),
    [pages.data]
  );

  const selectedPage = useMemo(
    () => templateItems.find(p => p.id === pageId) ?? null,
    [templateItems, pageId]
  );

  // Đổi workspace → page cũ thuộc workspace khác, bỏ chọn để không chạy nhầm.
  useEffect(() => {
    setPageId('');
  }, [scope.workspaceId]);

  /**
   * Chọn khuôn → resolve Template rồi dựng checklist.
   *
   * Đọc canvas của `current_version_id` chứ KHÔNG phải `template_version_id` mà
   * page đang ghim: handoff clone theo current version (`cloneTemplateBlocks`
   * đọc `tpl.CurrentVersionID`), nên checklist phải soi đúng bản đó, không thì
   * hiện ra những ô sẽ không tồn tại trong trang kết quả.
   *
   * Chạy ngay lúc chọn, không đợi tới lúc bấm chạy — hỏng ở đây thì báo lỗi khi
   * chưa tốn đồng token nào.
   */
  useEffect(() => {
    if (!selectedPage) {
      setTemplate(null);
      setChecklist([]);
      setOverrides({});
      setTplError(null);
      return;
    }
    let alive = true;
    setTplLoading(true);
    setTplError(null);
    setChecklist([]);
    setOverrides({});
    (async () => {
      try {
        const tpl = await resolveTemplateFromVersionId(
          selectedPage.template_version_id
        );
        if (!tpl.current_version_id) {
          setTplError('errNoVersion');
          return;
        }
        const version = await rexerApi.templates.version(
          tpl.id,
          tpl.current_version_id
        );
        if (!alive) return;
        setTemplate(tpl);
        setChecklist(
          buildChecklist(
            (version.canvas_blueprint as { blocks?: unknown } | undefined)
              ?.blocks
          )
        );
      } catch {
        if (alive) {
          setTemplate(null);
          setTplError('errTpl');
        }
      } finally {
        if (alive) setTplLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // `t` cố ý KHÔNG nằm trong deps: effect này gọi `resolveTemplateFromVersionId`,
    // hàm có thể phải list 500 template rồi probe từng batch. Nếu `t` đổi tham
    // chiếu giữa các render thì effect bắn lại liên tục — đúng kiểu spam Network
    // mà `resolveTemplateFromVersion.ts` mô tả. Vì thế lỗi được lưu ở dạng MÃ và
    // chỉ dịch lúc render.
  }, [selectedPage]);

  // Đồng hồ cho màn đang chạy — 1–3 phút không có phản hồi thì người dùng tưởng treo.
  useEffect(() => {
    if (!stage) return;
    const started = Date.now();
    const id = setInterval(
      () => setElapsed(Math.round((Date.now() - started) / 1000)),
      1000
    );
    return () => clearInterval(id);
  }, [stage]);

  const canRun = !!selectedPage && !!template && !stage && !tplLoading;
  const slots = useMemo(() => countSlots(checklist), [checklist]);

  // Chốt đồng bộ chống tái nhập. `stage` là state nên cập nhật bất đồng bộ:
  // giữa lúc click và lúc re-render disable nút vẫn còn một khe hẹp, đủ để một
  // cú double-click bắn 2 lượt. Mỗi lượt tạo page thật + gọi LLM nhiều lần, nên
  // đây là loại lỗi tốn tiền và tạo rác. Ref cập nhật ngay trong cùng tick.
  const runningRef = useRef(false);

  const pageName = selectedPage
    ? name.trim() || t('variant.autoName', { of: selectedPage.name })
    : '';

  /**
   * Chặng 1 — AI viết nháp. Dừng ở template, CHƯA tạo page: handoff chỉ đi tiếp
   * tới page khi `publish: true` (insight.go:458), nên `publish:false` cho ta
   * một canvas đã viết xong để soát mà chưa có gì công khai.
   */
  const handleDraft = async () => {
    if (!selectedPage || !template || runningRef.current) return;
    runningRef.current = true;
    setError(null);
    setElapsed(0);

    try {
      setStage('report');
      const report = await rexerApi.insights.create({
        workspace_id: scope.workspaceId,
        title: pageName,
        inputs: {
          brief_text: buildBrief({ details, objective, audience, mediaUrls }),
          // BE đọc ảnh brief ở `media`/`media_urls`/`images` (briefMedia,
          // insight_block_schema.go:121) — KHÔNG đọc `image_urls`.
          ...(mediaUrls.length ? { media: mediaUrls } : {}),
          source: 'template_intake',
        },
      });

      const done = await pollInsightReport(report.id);
      if (done.status !== 'succeeded') {
        throw new Error(done.error_message || t('variant.errReport'));
      }

      setStage('writing');
      const handoff = await rexerApi.insights.handoff(done.id, {
        template: { name: pageName, source_template_id: template.id },
        publish: false,
        workspace_id: scope.workspaceId,
      });

      const canvas = await fetchTemplateCanvas(handoff.template_id);
      const drafted = buildChecklist(
        (canvas as { blocks?: unknown } | undefined)?.blocks
      );

      setDraft({ templateId: handoff.template_id, reportId: done.id });
      setChecklist(drafted);
      setOverrides(overridesFromChecklist(drafted));
    } catch (err) {
      setError(errorMessage(err, t));
    } finally {
      setStage(null);
      runningRef.current = false;
    }
  };

  /** Chặng 2 — dựng trang từ template đã soát, ghi đè phần người dùng sửa. */
  const handleBuild = async () => {
    if (!draft || runningRef.current) return;
    runningRef.current = true;
    setError(null);
    setElapsed(0);

    try {
      setStage('page');
      const page = await rexerApi.pages.create(scope.workspaceId, {
        type: 'landing',
        template_id: draft.templateId,
        name: pageName,
      });

      const overrideCount = countFilled(overrides);
      if (overrideCount) {
        setStage('overrides');
        await writeOverrides(page.id, draft.templateId, overrides);
      }

      let published = false;
      if (publish) {
        setStage('publish');
        await rexerApi.pages.publish(page.id, undefined, { slug: page.slug });
        published = true;
      }

      setResult({
        page,
        templateId: draft.templateId,
        reportId: draft.reportId,
        blocks: checklist.length,
        overrideCount,
        published,
        raw: { page },
      });
    } catch (err) {
      setError(errorMessage(err, t));
    } finally {
      setStage(null);
      runningRef.current = false;
    }
  };

  if (result) {
    return (
      <ResultCard
        result={result}
        sourceName={selectedPage?.name ?? ''}
        onAgain={() => {
          setResult(null);
          setDraft(null);
          setName('');
        }}
      />
    );
  }

  if (stage) {
    return (
      <RunningCard stage={stage} elapsed={elapsed} blocks={checklist.length} />
    );
  }

  // ── Chặng 2: soát bản nháp AI rồi mới dựng trang ──────────────────────────
  if (draft) {
    return (
      <div className='border-border bg-card mx-auto max-w-3xl space-y-5 rounded-2xl border p-5'>
        <div className='space-y-1'>
          <h2 className='text-content-main text-lg font-semibold'>
            {t('variant.reviewTitle')}
          </h2>
          <p className='text-content-muted text-sm'>
            {t('variant.reviewSubtitle', { name: pageName })}
          </p>
        </div>

        <TemplateChecklist
          mode='review'
          blocks={checklist}
          overrides={overrides}
          onChange={setOverrides}
          mediaUrls={mediaUrls}
        />

        <FieldRow label={t('variant.publish')}>
          <label className='border-border bg-background flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm'>
            <input
              type='checkbox'
              checked={publish}
              onChange={e => setPublish(e.target.checked)}
              className='accent-primary h-4 w-4'
            />
            <span className='text-content-muted'>
              {t('variant.publishHint')}
            </span>
          </label>
        </FieldRow>

        {error && (
          <p
            role='alert'
            className='border-destructive/30 bg-destructive/5 text-destructive rounded-xl border px-3 py-2.5 text-sm'
          >
            {error}
          </p>
        )}

        <div className='flex flex-wrap items-center justify-between gap-3'>
          <button
            type='button'
            onClick={() => setDraft(null)}
            className='text-content-muted hover:text-content-main text-sm'
          >
            {t('variant.backToInput')}
          </button>
          <GradientButton
            onClick={handleBuild}
            leading={<Sparkles className='h-4 w-4' />}
          >
            {t('variant.build')}
          </GradientButton>
        </div>
      </div>
    );
  }

  return (
    <div className='border-border bg-card mx-auto max-w-3xl space-y-5 rounded-2xl border p-5'>
      <div className='space-y-1'>
        <h2 className='text-content-main text-lg font-semibold'>
          {t('variant.heading')}
        </h2>
        <p className='text-content-muted text-sm'>{t('variant.subheading')}</p>
      </div>

      <ScopeFields brandLocked={brandLocked} scope={scope} />

      <FieldRow label={t('variant.template')} hint={t('variant.templateHint')}>
        <TemplatePicker
          items={templateItems}
          value={pageId}
          onChange={setPageId}
          loading={pages.loading}
          hasWorkspace={!!scope.workspaceId}
        />
      </FieldRow>

      {tplLoading && <EmptyNote text={t('variant.readingTemplate')} />}

      {tplError && (
        <p
          role='alert'
          className='border-destructive/30 bg-destructive/5 text-destructive rounded-xl border px-3 py-2.5 text-sm'
        >
          {t(`variant.${tplError}`)}
        </p>
      )}

      <FieldRow label={t('variant.name')} hint={t('variant.nameHint')}>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={t('variant.namePlaceholder')}
        />
      </FieldRow>

      <FieldRow label={t('variant.details')} hint={t('variant.detailsHint')}>
        <Textarea
          value={details}
          onChange={e => setDetails(e.target.value)}
          placeholder={t('variant.detailsPlaceholder')}
          className='min-h-28'
        />
      </FieldRow>

      <FieldRow label={t('variant.objective')}>
        <Textarea
          value={objective}
          onChange={e => setObjective(e.target.value)}
          placeholder={t('variant.objectivePlaceholder')}
          className='min-h-20'
        />
      </FieldRow>

      <FieldRow label={t('variant.audience')}>
        <Textarea
          value={audience}
          onChange={e => setAudience(e.target.value)}
          placeholder={t('variant.audiencePlaceholder')}
          className='min-h-20'
        />
      </FieldRow>

      <FieldRow label={t('variant.media')} hint={t('variant.mediaHint')}>
        <ImageUrlInput urls={mediaUrls} onChange={setMediaUrls} />
      </FieldRow>

      {/* Chặng 1 KHÔNG bày form checklist nữa — ô trống với placeholder là chữ
          tiếng Anh của khuôn buộc người dùng tự nghĩ ra nội dung, đúng thứ AI
          sinh ra để làm. Chỉ cho biết khuôn này đòi bao nhiêu; soát và sửa dời
          sang chặng 2, khi đã có bản nháp thật để đọc. */}
      {!tplLoading && !tplError && checklist.length > 0 && (
        <p className='border-border bg-muted/30 text-content-muted rounded-xl border px-3 py-2.5 text-xs'>
          {t('variant.templateSummary', {
            blocks: checklist.length,
            text: slots.text,
            image: slots.image + slots.video,
          })}
        </p>
      )}

      {error && (
        <p
          role='alert'
          className='border-destructive/30 bg-destructive/5 text-destructive rounded-xl border px-3 py-2.5 text-sm'
        >
          {error}
        </p>
      )}

      <div className='flex flex-wrap items-center justify-between gap-3'>
        <p className='text-content-muted text-xs'>
          {selectedPage ? t('variant.runNote') : t('variant.pickFirst')}
        </p>
        <GradientButton
          disabled={!canRun}
          onClick={handleDraft}
          leading={<Sparkles className='h-4 w-4' />}
        >
          {t('variant.run')}
        </GradientButton>
      </div>
    </div>
  );
}

type Stage = 'report' | 'writing' | 'page' | 'overrides' | 'publish';

interface RunResult {
  page: Page;
  templateId: string;
  reportId: string;
  blocks: number;
  overrideCount: number;
  published: boolean;
  raw: Record<string, unknown>;
}

/**
 * Gộp 3 ô nhập thành một brief cho engine.
 *
 * Ảnh vẫn được nhắc lại trong text dù đã gửi ở `inputs.media`: BE dùng `media`
 * để dựng enum cho trường ảnh (nên ảnh chắc chắn vào được canvas), còn nhắc
 * trong brief giúp model hiểu đây là ảnh của sản phẩm khi viết phần chữ quanh nó.
 */
function buildBrief({
  details,
  objective,
  audience,
  mediaUrls,
}: {
  details: string;
  objective: string;
  audience: string;
  mediaUrls: string[];
}): string {
  const parts: string[] = [];
  if (details.trim()) parts.push(`Sản phẩm / nội dung:\n${details.trim()}`);
  if (objective.trim()) parts.push(`Mục tiêu chiến dịch:\n${objective.trim()}`);
  if (audience.trim()) parts.push(`Đối tượng:\n${audience.trim()}`);
  if (mediaUrls.length) {
    parts.push(
      [
        'Ảnh có sẵn của thương hiệu — dùng đúng các URL này cho mọi trường ảnh,',
        'không tự bịa URL khác:',
        ...mediaUrls.map(u => `- ${u}`),
      ].join('\n')
    );
  }
  return parts.join('\n\n');
}

/** Canvas của version hiện hành của một template. */
async function fetchTemplateCanvas(
  templateId: string
): Promise<Record<string, unknown> | undefined> {
  const { template } = await rexerApi.templates.get(templateId);
  if (!template.current_version_id) return undefined;
  const version = await rexerApi.templates.version(
    templateId,
    template.current_version_id
  );
  return version.canvas_blueprint as Record<string, unknown> | undefined;
}

/**
 * Ghi nội dung người dùng tự điền lên canvas của page vừa tạo.
 *
 * Vá vào page_revision chứ không vào template: BE `Publish()` luôn ưu tiên
 * revision mới nhất của page hơn template version khi revision đó đã có block —
 * mà nó luôn có, vì được seed từ template lúc tạo page (xem chú thích cùng nội
 * dung ở `CanvasTemplate/BlockEditor.tsx:1213`). Sửa template ở bước này sẽ bị
 * publish bỏ qua.
 */
async function writeOverrides(
  pageId: string,
  templateId: string,
  overrides: ChecklistOverrides
): Promise<void> {
  const revs = await rexerApi.pages.revisions(pageId, { limit: 1 });
  const latest = revs.items?.[0];

  let canvas = latest?.canvas_blueprint;
  if (!canvas) {
    // Page mới đôi khi chưa kịp có revision mang canvas — lấy thẳng bản template
    // vừa dựng làm nền để ghi đè.
    const { template } = await rexerApi.templates.get(templateId);
    if (!template.current_version_id) return;
    const version = await rexerApi.templates.version(
      templateId,
      template.current_version_id
    );
    canvas = version.canvas_blueprint as Record<string, unknown> | undefined;
  }
  if (!canvas) return;

  await rexerApi.pages.saveConfig(pageId, {
    config_json: latest?.config_json ?? {},
    canvas_blueprint: applyOverrides(canvas, overrides),
    base_revision_no: latest?.revision_no ?? 0,
  });
}

// Hai chặng chạy riêng nên danh sách bước cũng phải tách: đứng ở chặng 1 mà
// thấy "Publish ra trang công khai" đang chờ là nói dối — chặng đó chưa tạo
// page nào.
const DRAFT_STAGES: Stage[] = ['report', 'writing'];
const BUILD_STAGES: Stage[] = ['page', 'overrides', 'publish'];

/** Màn đang chạy: từng bước một, có đồng hồ — vì tổng thời gian là 1–3 phút. */
function RunningCard({
  stage,
  elapsed,
  blocks,
}: {
  stage: Stage;
  elapsed: number;
  blocks: number;
}) {
  const t = useTranslations('insights');
  const order = DRAFT_STAGES.includes(stage) ? DRAFT_STAGES : BUILD_STAGES;
  const current = order.indexOf(stage);
  const mm = String(Math.floor(elapsed / 60));
  const ss = String(elapsed % 60).padStart(2, '0');

  return (
    <div className='border-border bg-card mx-auto max-w-3xl space-y-4 rounded-2xl border p-5'>
      <div className='flex items-center justify-between gap-3'>
        <h2 className='text-content-main flex items-center gap-2 text-lg font-semibold'>
          <Loader2 className='size-4 animate-spin' aria-hidden />
          {t('variant.running')}
        </h2>
        <span className='text-content-muted font-mono text-sm'>{`${mm}:${ss}`}</span>
      </div>

      <ol className='space-y-2'>
        {order.map((s, i) => {
          const state = i < current ? 'done' : i === current ? 'now' : 'todo';
          return (
            <li
              key={s}
              className={cn(
                'flex items-center gap-2.5 text-sm',
                state === 'todo' && 'text-content-muted opacity-60',
                state === 'now' && 'text-content-main',
                state === 'done' && 'text-content-muted'
              )}
            >
              {state === 'done' ? (
                <Check
                  aria-hidden
                  className='size-4 shrink-0 text-emerald-600'
                />
              ) : state === 'now' ? (
                <Loader2 aria-hidden className='size-4 shrink-0 animate-spin' />
              ) : (
                <span
                  aria-hidden
                  className='border-border size-3.5 shrink-0 rounded-full border'
                />
              )}
              {t(`variant.stage.${s}`, { n: blocks })}
            </li>
          );
        })}
      </ol>

      <p className='border-warning/30 bg-warning/5 text-content-muted flex gap-2 rounded-lg border px-3 py-2 text-xs'>
        <TriangleAlert
          aria-hidden
          className='mt-0.5 size-3.5 shrink-0 opacity-70'
        />
        <span>{t('variant.dontClose')}</span>
      </p>
    </div>
  );
}

/**
 * Bộ chọn khuôn dạng lưới thẻ có thumbnail.
 *
 * Vì sao không dùng `<select>`: danh sách thực tế có 30+ landing với slug bị
 * BE cắt dấu (`/landing-d-n-d-t-quy-t-nh-3`), đọc tên trong dropdown không đoán
 * nổi trang đó trông thế nào. Thumbnail + link mở `/p/{slug}` ở tab mới cho
 * người dùng kiểm tra đúng trang trước khi tốn vài phút gọi AI.
 *
 * Có ô tìm kiếm vì lưới 30+ thẻ thì cuộn tìm còn tệ hơn dropdown.
 */
function TemplatePicker({
  items,
  value,
  onChange,
  loading,
  hasWorkspace,
}: {
  items: Page[];
  value: string;
  onChange: (id: string) => void;
  loading: boolean;
  hasWorkspace: boolean;
}) {
  const t = useTranslations('insights');
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(p =>
      `${p.name} ${p.slug}`.toLowerCase().includes(needle)
    );
  }, [items, q]);

  if (!hasWorkspace) {
    return <EmptyNote text={t('variant.workspaceFirst')} />;
  }
  if (loading) {
    return <EmptyNote text={t('variant.loadingPages')} />;
  }
  if (!items.length) {
    return <EmptyNote text={t('variant.noPages')} />;
  }

  return (
    <div className='space-y-2'>
      <Input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder={t('variant.searchPh')}
      />

      {filtered.length === 0 ? (
        <EmptyNote text={t('variant.noMatch')} />
      ) : (
        <div className='border-border max-h-96 overflow-y-auto rounded-xl border p-2'>
          <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
            {filtered.map(p => {
              const active = p.id === value;
              return (
                <div
                  key={p.id}
                  className={cn(
                    'group relative overflow-hidden rounded-lg border transition',
                    active
                      ? 'border-primary ring-primary/30 ring-2'
                      : 'border-border hover:border-content-muted'
                  )}
                >
                  <button
                    type='button'
                    onClick={() => onChange(p.id)}
                    aria-pressed={active}
                    className='block w-full text-left'
                  >
                    <span className='bg-muted block aspect-video w-full overflow-hidden'>
                      {p.thumbnail_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={p.thumbnail_url}
                          alt=''
                          loading='lazy'
                          className='h-full w-full object-cover'
                        />
                      ) : (
                        <span className='text-content-muted flex h-full w-full items-center justify-center text-[10px]'>
                          {t('variant.noThumb')}
                        </span>
                      )}
                    </span>
                    <span className='block px-2 py-1.5'>
                      <span className='text-content-main line-clamp-2 block text-xs font-medium'>
                        {p.name}
                      </span>
                      <span className='text-content-muted block truncate text-[10px]'>
                        /{p.slug}
                      </span>
                    </span>
                  </button>

                  {/* Mở trang thật để đối chiếu. Nằm ngoài <button> vì lồng
                      <a> trong <button> là HTML không hợp lệ. */}
                  <a
                    href={`/p/${p.slug}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    title={t('variant.preview')}
                    className='bg-background/85 text-content-main absolute top-1.5 right-1.5 rounded-md p-1 opacity-0 shadow transition group-hover:opacity-100 focus-visible:opacity-100'
                  >
                    <ExternalLink className='h-3.5 w-3.5' />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <p className='border-border text-content-muted rounded-xl border border-dashed px-3 py-4 text-center text-sm'>
      {text}
    </p>
  );
}

/** Kết quả: page mới + link mở editor / xem bản public. */
function ResultCard({
  result,
  sourceName,
  onAgain,
}: {
  result: RunResult;
  sourceName: string;
  onAgain: () => void;
}) {
  const t = useTranslations('insights');
  const { page } = result;

  return (
    <div className='border-border bg-card mx-auto max-w-3xl space-y-5 rounded-2xl border p-5'>
      <div className='space-y-1'>
        <h2 className='text-content-main text-lg font-semibold'>
          {t('variant.doneHeading')}
        </h2>
        <p className='text-content-muted text-sm'>
          {t('variant.doneSubheading', { slug: page.slug })}
        </p>
      </div>

      <dl className='border-border bg-muted/40 grid gap-2 rounded-xl border p-4 text-sm sm:grid-cols-[10rem_1fr]'>
        <dt className='text-content-muted'>{t('variant.sourceTemplate')}</dt>
        <dd className='text-content-main'>{sourceName}</dd>

        <dt className='text-content-muted'>{t('variant.newTemplate')}</dt>
        <dd className='text-content-main font-mono text-xs break-all'>
          {result.templateId}
        </dd>

        <dt className='text-content-muted'>{t('variant.contentSummary')}</dt>
        <dd className='text-content-main'>
          {t('variant.contentSummaryValue', {
            blocks: result.blocks,
            kept: result.overrideCount,
          })}
        </dd>

        <dt className='text-content-muted'>{t('variant.state')}</dt>
        <dd className='text-content-main'>
          {result.published
            ? t('variant.statePublished')
            : t('variant.stateDraft')}
        </dd>
      </dl>

      <div className='flex flex-wrap gap-2'>
        {/* Route `/admin/landing-pages/[id]` nhận cả page slug lẫn page UUID. */}
        <a
          href={`/admin/landing-pages/${page.id}`}
          className='border-border text-content-main hover:bg-muted inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm'
        >
          <Pencil className='h-4 w-4' />
          {t('variant.openEditor')}
        </a>
        {result.published && (
          <a
            href={`/p/${page.slug}`}
            target='_blank'
            rel='noopener noreferrer'
            className='border-border text-content-main hover:bg-muted inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm'
          >
            <ExternalLink className='h-4 w-4' />
            {t('variant.openPublic')}
          </a>
        )}
        <button
          type='button'
          onClick={onAgain}
          className='text-content-muted hover:text-content-main px-3 py-2 text-sm'
        >
          {t('variant.again')}
        </button>
      </div>

      {!result.published && (
        <p className='text-content-muted text-xs'>{t('variant.draftNote')}</p>
      )}

      <details className='border-border rounded-xl border'>
        <summary className='text-content-muted hover:text-content-main cursor-pointer px-3 py-2 text-xs'>
          {t('variant.rawResponse')}
        </summary>
        <pre className='bg-muted/50 max-h-72 overflow-auto rounded-b-xl px-3 py-2 text-[11px] leading-relaxed'>
          {JSON.stringify(result.raw, null, 2)}
        </pre>
      </details>
    </div>
  );
}

/** Lỗi BE → câu tiếng Việt người dùng hiểu được. */
function errorMessage(err: unknown, t: (k: string) => string): string {
  if (err instanceof RxApiError) {
    if (err.status === 400) return t('variant.errExternal');
    if (err.status === 404) return t('variant.errNotFound');
    return err.message || t('variant.errGeneric');
  }
  if (err instanceof Error && err.message) return err.message;
  return t('variant.errGeneric');
}
