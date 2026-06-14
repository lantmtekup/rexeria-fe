'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  LayoutGrid,
  LayoutTemplate,
  Loader2,
  Search,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react';

import { rexerApi } from '@/services/rexer/endpoints';

import { Badge } from '@/components/atoms/badge';
import { Button } from '@/components/atoms/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/dialog';
import { cn } from '@/lib/cn';
import type {
  InsightBlocksByStage,
  InsightBlueprint,
  InsightRecommendedBlock,
  InsightRecommendedTemplate,
} from '@/services/rexer/types';
import { AddBlockDialog } from '../../CanvasTemplate/block-editor/AddBlockDialog';
import { BlockMiniPreview } from '../../CanvasTemplate/block-editor/BlockMiniPreview';
import { createBlock } from '../../CanvasTemplate/block-editor/factory';
import {
  BLOCK_TYPE_META,
  type BlockType,
} from '../../CanvasTemplate/block-editor/types';
import { SectionCard } from './ui';

/**
 * Section Blocks & Templates của blueprint — bản nâng cấp:
 * - mỗi stage collapse/expand được;
 * - mỗi block/template có thumbnail (placeholder gradient theo code — preview thật
 *   sẽ wire khi BE có catalog), nút "Xem chi tiết" (dialog), và 2 hành động:
 *   "AI tạo nội dung" / "Tìm thủ công" (hiện là placeholder, cần BE — xem be-spec).
 */

const THUMB_GRADIENTS = [
  'from-indigo-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-sky-500 to-blue-600',
  'from-rose-500 to-pink-600',
  'from-fuchsia-500 to-purple-600',
];

/** Gradient ổn định theo code (placeholder thumbnail khi chưa có ảnh preview). */
function thumbGradient(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return THUMB_GRADIENTS[Math.abs(h) % THUMB_GRADIENTS.length];
}

/**
 * AI gợi ý block bằng taxonomy riêng (headline_overlay, ad_story_1080x1920…)
 * KHÔNG trùng key editor (hero_overlay, stories…). Map fuzzy → editor BlockType
 * gần nhất để render preview THẬT. Khớp trực tiếp ưu tiên; không khớp → null
 * (fallback gradient tile + ghi chú catalog).
 */
const FUZZY_RULES: [RegExp, BlockType][] = [
  [/headline.*overlay|hero.*overlay/, 'hero_overlay'],
  [/stor(y|ies)|reel|1080x1920|9x16/, 'stories'],
  [/hero|intro|banner|cover/, 'hero_split'],
  [/gallery|photo|lookbook/, 'photo_gallery'],
  [/carousel|slider|swipe/, 'image_carousel'],
  [/booking|form|lead|contact|sign.?up|register/, 'booking_form'],
  [/\bcta\b|call.?to|button/, 'cta_section'],
  [/feature|benefit|value|highlight/, 'feature_section'],
  [/quiz/, 'quiz'],
  [/poll|vote/, 'poll'],
  [/faq|question/, 'framer_faq_minimal'],
  [/quote|testimonial|review/, 'framer_large_quote'],
  [/stat|metric|number|count/, 'framer_stats_grid'],
  [/split/, 'split_screen'],
  [/3d|three.?d/, 'carousel_3d'],
  [/panorama|360/, 'panorama'],
  [/flip/, 'flipbook'],
];

function resolveEditorType(code: string): BlockType | null {
  if (code in BLOCK_TYPE_META) return code as BlockType;
  const c = code.toLowerCase();
  for (const [re, t] of FUZZY_RULES) if (re.test(c)) return t;
  return null;
}

function Thumb({
  code,
  name,
  imageUrl,
  kind = 'block',
  className,
}: {
  code: string;
  /** Tên block — hiển thị trên tile fallback để dễ nhận diện. */
  name?: string;
  /** Ảnh preview thật từ catalog (KB5) — ưu tiên cao nhất khi có. */
  imageUrl?: string;
  kind?: 'block' | 'template';
  className?: string;
}) {
  const Icon = kind === 'template' ? LayoutTemplate : LayoutGrid;
  const [imgError, setImgError] = useState(false);
  const meta = (
    BLOCK_TYPE_META as Record<string, { gradient?: string } | undefined>
  )[code];
  // Editor type (trực tiếp hoặc fuzzy) → dựng block mặc định (seed) rồi
  // render preview thật.
  const preview = useMemo(() => {
    if (kind !== 'block') return null;
    const editorType = resolveEditorType(code);
    if (!editorType) return null;
    try {
      return createBlock(editorType);
    } catch {
      return null;
    }
  }, [code, kind]);

  // Ưu tiên 1: ảnh preview thật từ BE (KB5).
  if (imageUrl && !imgError) {
    return (
      <div
        className={cn(
          'border-border shrink-0 overflow-hidden rounded-lg border bg-white',
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={name ?? code}
          onError={() => setImgError(true)}
          className='h-full w-full object-cover'
        />
      </div>
    );
  }

  if (preview) {
    return (
      <div
        className={cn(
          'border-border shrink-0 overflow-hidden rounded-lg border bg-white',
          className
        )}
      >
        <BlockMiniPreview block={preview} aspect='4 / 3' />
      </div>
    );
  }

  // Fallback (vd block framer_* chưa có preview): tile gradient + icon + tên.
  return (
    <div
      className={cn(
        'relative flex shrink-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-lg bg-gradient-to-br p-2 text-center text-white',
        meta?.gradient ?? thumbGradient(code),
        className
      )}
    >
      <Icon className='size-5 shrink-0 opacity-90' aria-hidden />
      {name && (
        <span className='line-clamp-2 text-[10px] leading-tight font-semibold'>
          {name}
        </span>
      )}
    </div>
  );
}

/* ── Block ───────────────────────────────────────────────────────────────── */

function BlockRow({
  block,
  index,
  count,
  reportId,
  stageKey,
  onMove,
  onDelete,
}: {
  block: InsightRecommendedBlock;
  index: number;
  count: number;
  reportId?: string;
  stageKey: string;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
}) {
  const t = useTranslations('insights');
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<Record<string, unknown> | null>(
    null
  );

  // Preview thật khi block là editor type (có trong BLOCK_TYPE_META): dựng
  // block mặc định rồi render qua BlockMiniPreview. Type lạ (vd framer_*) →
  // null → dialog hiện ghi chú "chờ BE catalog".
  const detailPreview = useMemo(() => {
    const editorType = resolveEditorType(block.block_type_code);
    if (!editorType) return null;
    try {
      return createBlock(editorType);
    } catch {
      return null;
    }
  }, [block.block_type_code]);

  // KB4: sinh nội dung mẫu cho block (khớp props_schema) → hiện trong dialog.
  const generate = async () => {
    if (!reportId) {
      toast.info(t('blueprint.generatePending'));
      return;
    }
    setGenerating(true);
    try {
      const r = await rexerApi.insights.generateBlockContent({
        report_id: reportId,
        block_type_code: block.block_type_code,
        stage_key: stageKey,
      });
      setGenerated(r.content);
      toast.success(t('blueprint.generated'));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('blueprint.generateFailed')
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <li className='border-border bg-card flex gap-3 rounded-xl border p-3'>
      <Thumb
        code={block.block_type_code}
        name={block.block_name}
        imageUrl={block.preview_image_url}
        className='h-20 w-32'
      />
      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-baseline gap-2'>
          <span className='text-content-main text-sm font-semibold'>
            {block.block_name}
          </span>
          <Badge variant='outline' className='bg-emerald-50 text-emerald-700'>
            {block.block_type_code}
          </Badge>
        </div>
        {block.reason && (
          <p className='text-content-muted mt-0.5 line-clamp-2 text-xs'>
            {block.reason}
          </p>
        )}
        <div className='mt-2 flex flex-wrap gap-1.5'>
          <ActionBtn
            icon={<Eye className='size-3' aria-hidden />}
            label={t('blueprint.viewDetail')}
            onClick={() => setOpen(true)}
          />
          <ActionBtn
            icon={
              generating ? (
                <Loader2 className='size-3 animate-spin' aria-hidden />
              ) : (
                <Wand2 className='size-3' aria-hidden />
              )
            }
            label={t('blueprint.aiGenerate')}
            accent='violet'
            onClick={generate}
          />
        </div>
      </div>

      {/* Điều khiển: di chuyển lên/xuống + xoá */}
      <div className='flex shrink-0 flex-col items-center gap-0.5'>
        <IconBtn
          icon={<ChevronUp className='size-3.5' aria-hidden />}
          label={t('blueprint.moveUp')}
          disabled={index === 0}
          onClick={() => onMove(-1)}
        />
        <IconBtn
          icon={<ChevronDown className='size-3.5' aria-hidden />}
          label={t('blueprint.moveDown')}
          disabled={index === count - 1}
          onClick={() => onMove(1)}
        />
        <IconBtn
          icon={<Trash2 className='size-3.5' aria-hidden />}
          label={t('blueprint.removeBlock')}
          danger
          onClick={onDelete}
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Thumb code={block.block_type_code} className='size-9' />
              {block.block_name}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-3 text-sm'>
            <DetailRow label={t('blueprint.blockCode')}>
              <code className='bg-muted rounded px-1.5 py-0.5 font-mono text-xs'>
                {block.block_type_code}
              </code>
            </DetailRow>
            {block.reason && (
              <DetailRow label={t('blueprint.why')}>{block.reason}</DetailRow>
            )}
            {detailPreview ? (
              <div>
                <p className='text-content-muted text-2xs mb-1.5 font-semibold tracking-wider uppercase'>
                  {t('blueprint.preview')}
                </p>
                <div className='border-border bg-muted overflow-hidden rounded-lg border'>
                  <BlockMiniPreview block={detailPreview} aspect='16 / 9' />
                </div>
              </div>
            ) : (
              <p className='text-content-muted border-border rounded-lg border border-dashed p-3 text-xs'>
                {t('blueprint.previewNote')}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Kết quả "AI tạo nội dung" (KB4) — key/value theo props_schema */}
      <Dialog
        open={generated !== null}
        onOpenChange={o => !o && setGenerated(null)}
      >
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Wand2 className='size-4 text-violet-600' aria-hidden />
              {t('blueprint.generatedTitle')} · {block.block_name}
            </DialogTitle>
          </DialogHeader>
          <div className='max-h-[55vh] space-y-2 overflow-y-auto text-sm'>
            {Object.entries(generated ?? {}).map(([k, v]) => (
              <div key={k} className='bg-muted/50 rounded-lg px-3 py-2'>
                <div className='text-content-muted mb-0.5 font-mono text-[11px] font-semibold'>
                  {k}
                </div>
                <div className='text-content-main break-words'>
                  {typeof v === 'string' ? v : JSON.stringify(v, null, 2)}
                </div>
              </div>
            ))}
          </div>
          <p className='text-content-muted text-xs'>
            {t('blueprint.generatedHint')}
          </p>
        </DialogContent>
      </Dialog>
    </li>
  );
}

/* ── Stage group (collapse ở cấp section/cha) — "Tìm thủ công" thêm block ──── */

function StageGroup({
  stage,
  reportId,
  onAddBlock,
  onMoveBlock,
  onDeleteBlock,
}: {
  stage: InsightBlocksByStage;
  reportId?: string;
  onAddBlock: () => void;
  onMoveBlock: (idx: number, dir: -1 | 1) => void;
  onDeleteBlock: (idx: number) => void;
}) {
  const t = useTranslations('insights');
  const blocks = stage.blocks ?? [];
  return (
    <div className='border-border overflow-hidden rounded-xl border'>
      <div className='bg-muted/40 flex items-center gap-2 px-3 py-2.5'>
        <span className='text-content-main flex-1 text-sm font-semibold'>
          {stage.stage_key}
        </span>
        <span className='text-content-muted bg-card rounded-full px-2 py-0.5 text-[11px] font-semibold'>
          {blocks.length}
        </span>
        <button
          type='button'
          onClick={onAddBlock}
          className='border-border text-content-muted hover:bg-card inline-flex items-center gap-1 rounded-lg border bg-white/60 px-2 py-1 text-[11px] font-semibold transition'
        >
          <Search className='size-3' aria-hidden />{' '}
          {t('blueprint.manualSearch')}
        </button>
      </div>
      <div className='space-y-2 px-3 pt-2 pb-3'>
        {stage.stage_rationale && (
          <p className='text-content-muted text-xs'>{stage.stage_rationale}</p>
        )}
        <ul className='space-y-2'>
          {blocks.map((b, i) => (
            <BlockRow
              key={`${b.block_type_code}-${i}`}
              block={b}
              index={i}
              count={blocks.length}
              reportId={reportId}
              stageKey={stage.stage_key}
              onMove={dir => onMoveBlock(i, dir)}
              onDelete={() => onDeleteBlock(i)}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

export function BlocksSection({
  blueprint,
  reportId,
  collapsible = true,
}: {
  blueprint: InsightBlueprint;
  reportId?: string;
  collapsible?: boolean;
}) {
  const t = useTranslations('insights');
  const [stages, setStages] = useState<InsightBlocksByStage[]>(
    blueprint.recommended_blocks?.blocks_by_stage ?? []
  );
  const [addStageKey, setAddStageKey] = useState<string | null>(null);

  if (!blueprint.recommended_blocks) return null;

  /**
   * Cập nhật stages + persist lên BE (KB3 — PATCH blueprint). Optimistic: set
   * state ngay; nếu lưu lỗi → rollback về state trước + toast.
   */
  const mutate = (next: InsightBlocksByStage[]) => {
    const prev = stages;
    setStages(next);
    if (!reportId) return; // không có report (vd preview) → chỉ local
    rexerApi.insights
      .updateBlueprint(reportId, {
        recommended_blocks: { blocks_by_stage: next },
      })
      .then(() => toast.success(t('blueprint.saved')))
      .catch(() => {
        setStages(prev);
        toast.error(t('blueprint.saveFailed'));
      });
  };

  const appendBlock = (stageKey: string, b: InsightRecommendedBlock) =>
    mutate(
      stages.map(s =>
        s.stage_key === stageKey
          ? { ...s, blocks: [...(s.blocks ?? []), b] }
          : s
      )
    );
  const deleteBlock = (stageKey: string, idx: number) =>
    mutate(
      stages.map(s =>
        s.stage_key === stageKey
          ? { ...s, blocks: (s.blocks ?? []).filter((_, i) => i !== idx) }
          : s
      )
    );
  const moveBlock = (stageKey: string, idx: number, dir: -1 | 1) =>
    mutate(
      stages.map(s => {
        if (s.stage_key !== stageKey) return s;
        const arr = [...(s.blocks ?? [])];
        const j = idx + dir;
        if (j < 0 || j >= arr.length) return s;
        [arr[idx], arr[j]] = [arr[j], arr[idx]];
        return { ...s, blocks: arr };
      })
    );

  // Thêm block từ AddBlockDialog của editor → map BlockType → recommended block.
  const addFromType = (type: BlockType) => {
    if (!addStageKey) return;
    appendBlock(addStageKey, {
      block_type_code: type,
      block_name: BLOCK_TYPE_META[type]?.label ?? type,
      reason: '',
    });
    setAddStageKey(null);
  };

  return (
    <SectionCard
      icon={<LayoutGrid aria-hidden />}
      title={t('blueprint.blocks')}
      index={3}
      accent='emerald'
      delayMs={160}
      collapsible={collapsible}
    >
      <div className='space-y-2.5'>
        {stages.map(stage => (
          <StageGroup
            key={stage.stage_key}
            stage={stage}
            reportId={reportId}
            onAddBlock={() => setAddStageKey(stage.stage_key)}
            onMoveBlock={(i, dir) => moveBlock(stage.stage_key, i, dir)}
            onDeleteBlock={i => deleteBlock(stage.stage_key, i)}
          />
        ))}
      </div>

      {/* Popup tìm/thêm block — tái dùng AddBlockDialog của editor */}
      <AddBlockDialog
        open={addStageKey !== null}
        onOpenChange={o => {
          if (!o) setAddStageKey(null);
        }}
        onPick={addFromType}
        onPickSaved={b => addFromType(b.blockType)}
      />
    </SectionCard>
  );
}

/* ── Template ──────────────────────────────────────────────────────────────── */

function TemplateCard({
  tpl,
  busy,
  disabled,
  onUse,
}: {
  tpl: InsightRecommendedTemplate;
  /** Card này đang handoff → hiện spinner. */
  busy: boolean;
  /** Có handoff khác đang chạy → khoá nút. */
  disabled: boolean;
  onUse: () => void;
}) {
  const t = useTranslations('insights');
  const [open, setOpen] = useState(false);
  const codes = tpl.block_codes ?? [];
  // SP1: nhãn nguồn — template thật trong thư viện vs AI tự dựng. Thiếu `source`
  // (report trước SP1) → không hiển thị badge.
  const sourceBadge =
    tpl.source === 'library' ? (
      <Badge variant='default' className='shrink-0'>
        {t('blueprint.sourceLibrary')}
      </Badge>
    ) : tpl.source === 'composed' ? (
      <Badge variant='outline' className='shrink-0'>
        {t('blueprint.sourceComposed')}
      </Badge>
    ) : null;

  return (
    <div className='group/tpl border-border bg-card flex h-full flex-col overflow-hidden rounded-xl border transition hover:-translate-y-0.5 hover:shadow-md'>
      <div className='relative'>
        <Thumb
          code={tpl.name}
          kind='template'
          imageUrl={tpl.thumbnail_url ?? undefined}
          className='h-36 w-full rounded-none'
        />
        <button
          type='button'
          onClick={() => setOpen(true)}
          className='text-content-main absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-lg bg-white/95 px-2 py-1 text-[11px] font-semibold shadow-sm backdrop-blur transition hover:bg-white'
        >
          <Eye className='size-3' aria-hidden /> {t('blueprint.viewDetail')}
        </button>
      </div>
      <div className='flex flex-1 flex-col gap-2 p-4'>
        <div className='flex items-start justify-between gap-2'>
          <span className='text-content-main min-w-0 font-semibold'>
            {tpl.name}
          </span>
          <div className='flex shrink-0 items-center gap-1'>
            {sourceBadge}
            {tpl.category && (
              <Badge variant='secondary' className='shrink-0'>
                {tpl.category}
              </Badge>
            )}
          </div>
        </div>
        {tpl.description && (
          <p className='text-content-muted line-clamp-2 text-sm'>
            {tpl.description}
          </p>
        )}
        <div className='mt-auto flex flex-col gap-2 pt-1'>
          {codes.length > 0 && (
            <div className='flex flex-wrap gap-1.5'>
              {codes.slice(0, 4).map(code => (
                <Badge key={code} variant='outline'>
                  {code}
                </Badge>
              ))}
              {codes.length > 4 && (
                <span className='text-content-muted self-center text-xs'>
                  +{codes.length - 4}
                </span>
              )}
            </div>
          )}
          <Button
            type='button'
            size='sm'
            onClick={onUse}
            disabled={disabled}
            className='w-full'
          >
            {busy ? (
              <Loader2 className='size-4 animate-spin' aria-hidden />
            ) : (
              <Wand2 className='size-4' aria-hidden />
            )}
            {t('blueprint.useTemplate')}
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Sparkles className='text-warning size-4' aria-hidden />{' '}
              {tpl.name}
            </DialogTitle>
          </DialogHeader>
          <div className='space-y-3 text-sm'>
            {tpl.category && (
              <DetailRow label={t('blueprint.category')}>
                <Badge variant='secondary'>{tpl.category}</Badge>
              </DetailRow>
            )}
            {tpl.description && (
              <DetailRow label={t('blueprint.description')}>
                {tpl.description}
              </DetailRow>
            )}
            {codes.length > 0 && (
              <DetailRow label={t('blueprint.blocks')}>
                <span className='flex flex-wrap gap-1.5'>
                  {codes.map(c => (
                    <Badge key={c} variant='outline'>
                      {c}
                    </Badge>
                  ))}
                </span>
              </DetailRow>
            )}
            {tpl.why_fit && (
              <DetailRow label={t('blueprint.why')}>{tpl.why_fit}</DetailRow>
            )}
            <p className='text-content-muted border-border rounded-lg border border-dashed p-3 text-xs'>
              {t('blueprint.previewNote')}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function TemplatesSection({
  blueprint,
  pending = null,
  onUse,
  collapsible = true,
}: {
  blueprint: InsightBlueprint;
  /** Key handoff đang chạy (tên template) — null khi rảnh. Khoá các card khi
   * != null. Optional: chế độ preview (popup marketing) bỏ qua handoff. */
  pending?: string | null;
  onUse?: (tpl: InsightRecommendedTemplate) => void;
  collapsible?: boolean;
}) {
  const t = useTranslations('insights');
  const templates = blueprint.recommended_templates;
  if (!templates) return null;

  return (
    <SectionCard
      icon={<LayoutTemplate aria-hidden />}
      title={t('blueprint.templates')}
      index={4}
      accent='amber'
      delayMs={240}
      collapsible={collapsible}
    >
      <div className='grid gap-4 sm:grid-cols-2'>
        {(templates.templates ?? []).map(tpl => (
          <TemplateCard
            key={tpl.name}
            tpl={tpl}
            busy={pending === tpl.name}
            disabled={pending !== null}
            onUse={() => onUse?.(tpl)}
          />
        ))}
      </div>
    </SectionCard>
  );
}

/* ── helpers ───────────────────────────────────────────────────────────────── */

function ActionBtn({
  icon,
  label,
  onClick,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  accent?: 'violet';
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold transition',
        accent === 'violet'
          ? 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100'
          : 'border-border text-content-muted hover:bg-muted'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function IconBtn({
  icon,
  label,
  onClick,
  disabled,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-6 items-center justify-center rounded-md transition disabled:opacity-30',
        danger
          ? 'text-content-muted hover:bg-rose-50 hover:text-rose-600'
          : 'text-content-muted hover:bg-muted'
      )}
    >
      {icon}
    </button>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className='flex flex-col gap-1'>
      <span className='text-content-muted text-[11px] font-semibold tracking-wide uppercase'>
        {label}
      </span>
      <div className='text-content-main'>{children}</div>
    </div>
  );
}
