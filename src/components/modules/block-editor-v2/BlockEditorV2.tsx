'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PanelRightOpen } from 'lucide-react';
import { toast } from 'sonner';

import { PreviewStageLoading } from '@/components/organisms/portal-v2/exchange/PreviewStageLoading';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import { ALL_BLOCK_SURFACES } from '@/services/rexer/types';
import type {
  CanvasTemplate,
  Template,
  TemplateVersion as TemplateVersionType,
} from '@/services/rexer/types';

import { AddBlockDialog } from '@/components/modules/block-editor-v2/AddBlockDialog';
import { BlockEditorHeader } from '@/components/modules/block-editor-v2/BlockEditorHeader';
import {
  EditorRail,
  type EditorRailTab,
} from '@/components/modules/block-editor-v2/EditorRail';
import { EditorPanel } from '@/components/modules/block-editor-v2/EditorPanel';
import { BlocksPanel } from '@/components/modules/block-editor-v2/panels/BlocksPanel';
import { MediaPanel } from '@/components/modules/block-editor-v2/panels/MediaPanel';
import { PagesPanel } from '@/components/modules/block-editor-v2/panels/PagesPanel';
import { ProductPanel } from '@/components/modules/block-editor-v2/panels/ProductPanel';
import { SignalPanel } from '@/components/modules/block-editor-v2/panels/SignalPanel';
import { LayersPanel } from '@/components/modules/block-editor-v2/LayersPanel';
import {
  BlockEditorSidebar,
  type SidebarTab,
} from '@/components/modules/block-editor-v2/BlockEditorSidebar';
import { BlockPreview } from '@/components/modules/block-editor-v2/BlockPreview';
import { PageCanvas } from '@/components/modules/block-editor-v2/PageCanvas';
import type { PageCanvasBlockActions } from '@/components/modules/block-editor-v2/PageCanvasBlockFrame';
import { isInspectorKind } from '@/components/modules/block-editor-v2/inspector/kinds';
import { resolveElementMeta } from '@/components/modules/block-editor-v2/resolveElementKind';
import {
  CanvasZoomBar,
  type CanvasMode,
} from '@/components/modules/block-editor-v2/CanvasZoomBar';
import {
  getContentAt,
  setContentAt,
} from '@/components/modules/block-editor-v2/contentPath';
import { writeImageUrl } from '@/components/modules/block-editor-v2/imageField';
import { DuplicateTemplateDialog } from '@/components/modules/block-editor-v2/DuplicateTemplateDialog';
import { SaveBlockDialog } from '@/components/modules/block-editor-v2/SaveBlockDialog';
import { ElementToolbar } from '@/components/modules/block-editor-v2/ElementToolbar';
import { ImportBlockDialog } from '@/components/modules/block-editor-v2/ImportBlockDialog';
import { ExchangeLiveCanvasPreview } from '@/components/organisms/portal-v2/exchange/ExchangeLiveCanvasPreview';
import { ExchangePreviewShell } from '@/components/organisms/portal-v2/exchange/ExchangePreviewShell';
import type { PreviewItem } from '@/lib/portal-v2/preview/types';
import { TransitionSelect } from '@/components/modules/block-editor/transitions/TransitionSelect';
import { ProductPickerDialog } from '@/components/modules/block-editor-v2/ProductPickerDialog';
import { PublishDialog } from '@/components/modules/block-editor-v2/PublishDialog';
import { ReviewChangesDialog } from '@/components/modules/block-editor-v2/ReviewChangesDialog';
import { MotionTimelineModal } from '@/components/modules/block-editor-v2/motion/timeline/MotionTimelineModal';
import type { BlockMotion } from '@/components/modules/block-editor/motion/types';
import {
  PNJ_PARAGRAPH_KEY_RE,
  resolvePnjParagraphs,
  setPnjParagraphAt,
} from '@/components/modules/block-editor/blocks/PnjDetails';
import {
  PNJ_HERO_TITLE_LINE_KEY_RE,
  resolvePnjHeroTitleLines,
  setPnjHeroTitleLineAt,
} from '@/components/modules/block-editor/blocks/pnjHeroTitleLines';
import {
  PNJ_VARIANT_HIGHLIGHTS_KEY_RE,
  PNJ_VARIANT_HIGHLIGHT_ITEM_KEY_RE,
  resolvePnjVariantHighlights,
  resolvePnjVariants,
  setPnjVariantHighlightItemAt,
  setPnjVariantHighlightsAt,
} from '@/components/modules/block-editor/blocks/pnjVariantContent';
import { createBlock } from '@/components/modules/block-editor-v2/factory';
import { genId } from '@/components/modules/block-editor-v2/ids';
import { SitePagesProvider } from '@/components/modules/block-editor/links/SitePagesContext';
import { PageSettingsDialog } from '@/components/modules/block-editor-v2/PageSettingsDialog';
import { seedBlocks } from '@/components/modules/block-editor-v2/mock';
import {
  DEFAULT_PAGE_ID,
  adaptCanvasBlueprint,
  parseCanvas,
  serializeCanvas,
  serializeCanvasPages,
  type EditorPage,
} from '@/components/modules/block-editor/serialize';
import {
  BLOCK_TYPE_META,
  type Block,
  type BlockBackground,
  type BlockContent,
  type BlockMotionStored,
  type BlockType,
  type ElementStyle,
  type ElementStylesMap,
  type ExtraElementKind,
  type PnjDetailsContent,
  type PnjHeroContent,
  type PnjVariantContent,
} from '@/components/modules/block-editor/types';
import {
  bringToFront,
  makeExtraElement,
  patchExtraElement,
  sendToBack,
} from '@/components/modules/block-editor-v2/extraElements';
import { ExtraElementToolbar } from '@/components/modules/block-editor-v2/ExtraElementToolbar';
import { useAiApplyProduct } from '@/components/modules/block-editor-v2/hooks/useAiApplyProduct';
import { useAutosave } from '@/components/modules/block-editor-v2/hooks/useAutosave';
import { useCanvasState } from '@/components/modules/block-editor-v2/hooks/useCanvasState';
import { useDeviceLang } from '@/components/modules/block-editor-v2/hooks/useDeviceLang';
import { useElementSelection } from '@/components/modules/block-editor-v2/hooks/useElementSelection';
import { useMotionPreview } from '@/components/modules/block-editor-v2/hooks/useMotionPreview';
import { usePublishState } from '@/components/modules/block-editor-v2/hooks/usePublishState';

interface BlockEditorV2Props {
  /** Canvas template id (chế độ template/landing). Để trống khi mở ở block
   *  mode (sửa 1 saved block trực tiếp — xem `savedBlockDirectId`). */
  templateId?: string;
  /**
   * The `Template` `useResolvedCanvasTarget` already resolved to get
   * `templateId` in the first place (it always fetches the full object en
   * route, whether via a page's `template_version_id` or a raw template id).
   * When present, the load effect uses this directly instead of an extra
   * `templates.get(templateId)` round trip — Experiences/pages have no
   * business re-fetching a system resource the caller already has in hand.
   */
  initialTemplate?: Template;
  /**
   * BLOCK-DIRECT mode: id của 1 saved block. Khi set (và không có templateId),
   * editor load thẳng `blocks.get(id).settings` làm canvas, KHÔNG tạo template
   * tạm, KHÔNG autosave-template. Lưu qua nút 🔖 (SaveBlockDialog overwrite →
   * blocks.update). Đúng bản chất "đang sửa block".
   */
  savedBlockDirectId?: string;
  /**
   * When set, after canvas loads run `applyProduct(product)` once. Wired
   * from the campaign detail page link `?apply_product=<id>` so user lands
   * on a canvas already merged with their product info.
   */
  autoApplyProductId?: string;
  /**
   * Optional — slug của Page mà editor đang chỉnh sửa, dùng để build clean
   * share URL `/p/{slug}` thay vì legacy `/p/{template_id}/{share_token}`.
   * Resolved upstream trong route `/admin/landing-pages/[id]` khi mở editor
   * từ page list (path = slug hoặc page UUID).
   */
  pageSlug?: string;
  /** Optional Page UUID — present cùng `pageSlug`/`pageName` khi editor mở
   *  ở context của 1 page cụ thể. Cho PublishDialog set slug trực tiếp khi
   *  page chưa có. */
  pageId?: string;
  /**
   * `page.draft_canvas_blueprint` — this page's own autosave buffer
   * (migration 000091). Present ⇒ editor resumes from here instead of the
   * template's draft, and further autosaves target the page, not the
   * template (see `useAutosave`'s `pageId`). Undefined on a page that has
   * never been autosaved yet (BE omits the key) — load falls through to the
   * template flow below exactly as before this buffer existed.
   */
  pageDraftCanvasBlueprint?: Record<string, unknown>;
  /** Optional Page name — dùng auto-suggest slug khi user chưa đặt. */
  pageName?: string;
  /** Optional Page.status từ BE — source of truth cho "đã xuất bản hay
   *  chưa". Khi present + 'published', editor seed publishState đúng và
   *  sync `pages.publish/unpublish` khi user toggle. */
  pageStatus?: 'draft' | 'published' | 'archived';
  /** `page.template_version_id` — version mà BE pin page đến (chỉ định
   *  cho public render). Thường stale so với HEAD vì BE chưa cho FE
   *  promote (be-audit §13). PublishDialog warn user nếu diverge. */
  pinnedVersionId?: string;
  /** Callback khi PublishDialog đặt slug mới — để route page reload state.
   *  Optional (no-op nếu không cần refresh). */
  onPageSlugChange?: (slug: string) => void;
  /** Callback sau republish — cập nhật pinnedVersionId ở route cha. */
  onPinnedVersionChange?: (versionId: string) => void;
  /** Action riêng của route, render trong header editor (cạnh nút Xem
   *  trước) — route không cần dựng thanh bar riêng phía trên editor. */
  headerActions?: React.ReactNode;
  /**
   * Nút back trong header editor. Mặc định `router.back()` như v1.
   *
   * Route cần override khi `router.back()` không đúng — vd deep-link/F5 vào
   * thẳng canvas thì history rỗng và back() là no-op, phải push về màn list.
   * KHÔNG dựng thanh back riêng phía trên editor: header đã có sẵn nút này,
   * thêm nữa là trùng affordance và ăn thêm 44px chiều cao canvas.
   */
  onBack?: () => void;
}

// BE `/canvas-templates/{id}/canvas` endpoint is currently slow (~10s even
// for unauth 401 — see GAP-18 in be-issues-master.md). Keep client timeout
// generous until BE adds early auth gating.
const LOAD_TIMEOUT_MS = 15_000;

/** The editor previews one canvas — its own. No prev/next, so no neighbours. */
const NO_PREVIEW_NEIGHBORS: PreviewItem[] = [];
const NOOP = () => {};

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(
      () => reject(new Error(`REXER timeout (${ms}ms)`)),
      ms
    );
    p.then(
      v => {
        clearTimeout(id);
        resolve(v);
      },
      e => {
        clearTimeout(id);
        reject(e);
      }
    );
  });
}

/** Bump the patch segment of a semver-ish "x.y.z" string. Falls back to
 *  appending "-r2" for non-standard formats. Used to suggest the next
 *  immutable version when committing a draft. */
function bumpVersion(v: string): string {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v.trim());
  if (m) {
    return `${m[1]}.${m[2]}.${Number(m[3]) + 1}`;
  }
  return v + '-r2';
}

/**
 * Which block/page/canvas-mode the author last looked at is NOT persisted —
 * not in sessionStorage and not in the saved blueprint. The editor always
 * opens on page mode, the home page, and the first block. Remembering it made
 * every click a document change (autosave fires, version diff noise) for a
 * preference nobody asked to keep.
 */
function firstBlockId(blocks: Block[]): string | null {
  return blocks[0]?.id ?? null;
}

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Lỗi không xác định';
}

export function BlockEditorV2({
  templateId,
  initialTemplate,
  savedBlockDirectId,
  autoApplyProductId,
  pageSlug,
  pageId,
  pageDraftCanvasBlueprint,
  pageName,
  pageStatus,
  pinnedVersionId,
  onPageSlugChange,
  onPinnedVersionChange,
  headerActions,
  onBack,
}: BlockEditorV2Props) {
  const router = useRouter();
  // Block-direct: sửa thẳng 1 saved block, không qua canvas-template.
  const blockMode = !!savedBlockDirectId && !templateId;

  // ── Hooks ───────────────────────────────────────────────────────────────
  const [template, setTemplate] = React.useState<CanvasTemplate | null>(null);
  // Track canonical TemplateVersion (loaded from /templates/:id/versions/:vId)
  // so "Save Version" can inherit field_schema_json + default_config_json
  // when committing the draft to a new immutable version.
  const [currentVersion, setCurrentVersion] =
    React.useState<TemplateVersionType | null>(null);
  const [savingVersion, setSavingVersion] = React.useState(false);
  // Block-direct save (blocks.update) — thay cho Save Version (template) khi block mode.
  const [savingBlock, setSavingBlock] = React.useState(false);
  const canvas = useCanvasState();
  const deviceState = useDeviceLang();
  const selection = useElementSelection();
  const motionPreview = useMotionPreview({
    onElementSelect: selection.selectKey,
  });
  const publishState = usePublishState();
  const [fitRequestKey, setFitRequestKey] = React.useState(0);
  /**
   * Full page vs single-block artboard. Block-direct mode has exactly one
   * block and no page to stitch, so it is pinned to the artboard.
   */
  const [canvasMode, setCanvasMode] = React.useState<CanvasMode>('page');
  const effectiveCanvasMode: CanvasMode = blockMode ? 'block' : canvasMode;
  /** Tránh fetch + reset canvas khi effect load chạy lại cùng template/block. */
  const loadedCanvasKeyRef = React.useRef<string | null>(null);

  // Autosave — payload built from latest canvas + publish state at save time.
  const autosave = useAutosave({
    templateId: templateId ?? '',
    // Only in page-owned mode when there's a page context — the rare
    // raw-template-id fallback (no page resolved) keeps autosaving the
    // template directly, same as before this buffer existed.
    pageId: blockMode ? undefined : pageId,
    version: template?.version,
    // Block mode lưu qua nút 🔖 (blocks.update), KHÔNG autosave-template.
    enabled: !blockMode && !!template,
    // `active_page_id` / `active_block_id` are deliberately absent: which
    // block the author had selected is not part of the document.
    buildPayload: () =>
      serializeCanvasPages({
        pages: canvas.pages,
        publish: publishState.publish,
        transition,
      }),
    onVersionUpdate: nextVersion => {
      setTemplate(prev =>
        prev ? ({ ...prev, version: nextVersion } as CanvasTemplate) : prev
      );
    },
    onConflict: () => {
      // Conflict-recovery is currently user-driven (toast tells them to
      // reload). A future improvement: keep their unsaved changes in
      // sessionStorage and offer a 3-way merge.
    },
  });

  // AI apply-product hook (uses autosave + canvas).
  const ai = useAiApplyProduct({
    templateId: templateId ?? '',
    lang: deviceState.lang,
    getBlocks: () => canvas.blocks,
    getCanvasEtag: () => template?.canvas_etag,
    getActiveId: () => canvas.activeId,
    getPublish: () => publishState.publish,
    // Page-scoped: `canvas.reset` would collapse the template to a single
    // page and discard every other one.
    applyBlocks: (next, nextActiveId) =>
      canvas.replacePageBlocks(canvas.activePageId, next, nextActiveId),
    isHomePage: () => canvas.activePage.isHome,
    markDirty: autosave.markDirty,
  });

  // ── Local UI state (not hook-worthy on its own) ────────────────────────
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  /** Page whose settings dialog is open (`EditorPage.id`), if any. */
  const [pageSettingsId, setPageSettingsId] = React.useState<string | null>(
    null
  );
  const [previewing, setPreviewing] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [publishOpen, setPublishOpen] = React.useState(false);
  const [productPickerOpen, setProductPickerOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [duplicateOpen, setDuplicateOpen] = React.useState(false);
  const [duplicating, setDuplicating] = React.useState(false);
  const [saveBlockOpen, setSaveBlockOpen] = React.useState(false);
  // `/admin/blocks` "Edit" flow appends `?saved_block_id=<id>` so the
  // save-block dialog lights up in overwrite mode instead of fork-as-new.
  const searchParams = useSearchParams();
  const editingSavedBlockId =
    savedBlockDirectId ?? searchParams?.get('saved_block_id') ?? undefined;
  // Starts collapsed: with nothing selected the design panel has nothing to
  // show but its own empty state, and 300px of it is 300px the canvas is not
  // getting. Selecting an element auto-opens it (see the effect below).
  const [layersCollapsed, setLayersCollapsed] = React.useState(true);
  const [railTab, setRailTab] = React.useState<EditorRailTab>('blocks');
  const [panelOpen, setPanelOpen] = React.useState(true);
  // Transition cấp template (preset áp cho cả collection block). Lưu vào
  // canvas_blueprint qua serializeCanvas → public/preview render áp.
  const [transition, setTransition] = React.useState<string>('none');
  const [sidebarTab, setSidebarTab] = React.useState<SidebarTab>('design');
  const [motionEditorOpen, setMotionEditorOpen] = React.useState(false);

  // ── Load ────────────────────────────────────────────────────────────────
  // Wave 3 migration 2026-05-30: canonical `templates.get` + `templates.version`
  // thay vì retired `canvasTemplates.get` + `canvasTemplates.getCanvas`. The
  // adapter folds canonical Template + TemplateVersion into a CanvasTemplate-
  // shaped object so the rest of the editor UI doesn't change.
  //
  // ⚠️ Save path (useAutosave + handlers below) still calls
  // `canvasTemplates.update` (retired, 404). BE chưa có PATCH version endpoint;
  // canonical versions immutable per spec — autosave model không match. Wave 3
  // BE task: ship PATCH /templates/:id/versions/:vId/canvas_blueprint hoặc
  // draft mechanism. Tới khi đó, save toast lỗi cho user — editor vẫn open +
  // preview được.
  React.useEffect(() => {
    let cancelled = false;
    const canvasKey = blockMode
      ? `block:${savedBlockDirectId}`
      : `tpl:${templateId}`;
    const skipReload = loadedCanvasKeyRef.current === canvasKey;

    (async () => {
      if (skipReload) return;

      setLoading(true);
      setLoadError(null);
      try {
        // ── Block-direct mode: load thẳng từ saved block, không qua template.
        if (blockMode && savedBlockDirectId) {
          const blk = await withTimeout(
            rexerApi.blocks.get(savedBlockDirectId),
            LOAD_TIMEOUT_MS
          );
          if (cancelled) return;
          const settings = blk.settings as Record<string, unknown> | undefined;
          if (!settings || !('blockType' in settings)) {
            setLoadError('Block không có canvas data hợp lệ để sửa.');
            return;
          }
          // Roundtrip serialize→parse để chuẩn hoá shape giống template load.
          const wire = serializeCanvas(
            [
              settings as unknown as Parameters<
                typeof serializeCanvas
              >[0][number],
            ],
            String(settings.id ?? '')
          );
          const parsed = parseCanvas(wire);
          const blocks = parsed?.blocks ?? [];
          // Synthetic template meta để UI render (block mode không có template thật).
          setTemplate({
            id: savedBlockDirectId,
            name: blk.name,
            description: blk.description ?? undefined,
            width: 800,
            height: 600,
            engine: 'block_editor',
            engine_version: '2.0',
            canvas_etag: '',
            version: 1,
            is_active: true,
            is_template: false,
            thumbnail_url: blk.thumbnail_url,
            created_by: blk.created_by,
            updated_by: blk.updated_by,
            created_at: blk.created_at,
            updated_at: blk.updated_at,
            canvas_data: wire,
          } as CanvasTemplate);
          canvas.reset(blocks, firstBlockId(blocks));
          setTransition(parsed?.transition ?? 'none');
          publishState.setPublish(undefined);
          loadedCanvasKeyRef.current = canvasKey;
          setLoading(false);
          return;
        }

        // `initialTemplate` — the caller (`useResolvedCanvasTarget`) always
        // resolves the full Template en route to `templateId`, whether via a
        // page's `template_version_id` or a raw template id fallback. Reuse
        // it instead of a second `templates.get()` round trip; only pages
        // opened before this prop existed (there are none left, but keep the
        // fallback cheap) hit the network here.
        const tpl =
          initialTemplate ??
          (
            await withTimeout(
              rexerApi.templates.get(templateId as string),
              LOAD_TIMEOUT_MS
            )
          ).template;
        if (cancelled) return;
        const currentVerId = tpl.current_version_id;

        // Priority order: draft buffer (autosave) → HEAD committed version.
        // BE ship 2026-05-30 — Template.draft_canvas_blueprint holds the
        // mutable autosave buffer. Reload resumes from there so user doesn't
        // lose unsaved canvas edits.
        //
        // 2026-05-31 fix: khi không có draft, load HEAD (max version_no) thay
        // vì tpl.current_version_id. Lý do: BE không auto-bump
        // current_version_id sau createVersion → user save v1.0.6 nhưng
        // current_version_id vẫn = v1.0.0 → reload load v1.0.0 (empty).
        // BE cũng silently ignore PATCH template/page với current/template
        // version_id → FE không promote được. Workaround: editor luôn show
        // HEAD. (Public /p/{slug} render vẫn dùng page.template_version_id
        // nên cần BE fix riêng — log warning.)
        let canvasData: Record<string, unknown> | undefined;
        let loadSource:
          | 'draft-page'
          | 'revision-page'
          | 'draft'
          | 'version-head'
          | 'version-current'
          | 'empty' = 'empty';
        let loadedVersionId: string | undefined;
        if (pageId) {
          // Page-owned (migration 000091): a page cloned off this template
          // has its own in-progress edits + publish history — content comes
          // ONLY from the page's own state, never the shared Template's
          // draft/versions (which could belong to someone editing the
          // template itself, or a different page forked from it later).
          // Draft buffer first (autosave resume), else the latest committed
          // `page_revisions` row — seeded from the template at fork time, so
          // it always exists by the time a page is opened here.
          if (pageDraftCanvasBlueprint) {
            canvasData = adaptCanvasBlueprint(pageDraftCanvasBlueprint);
            loadSource = 'draft-page';
          } else {
            try {
              const revs = await withTimeout(
                rexerApi.pages.revisions(pageId, { limit: 1 }),
                LOAD_TIMEOUT_MS
              );
              const latest = revs.items?.[0];
              if (latest?.canvas_blueprint) {
                canvasData = adaptCanvasBlueprint(latest.canvas_blueprint);
                loadSource = 'revision-page';
              }
            } catch {
              /* revision fetch failed — canvasData stays undefined, falls
                 to the empty/seed precedence below. */
            }
          }
        } else if (tpl.draft_canvas_blueprint) {
          canvasData = adaptCanvasBlueprint(tpl.draft_canvas_blueprint);
          loadSource = 'draft';
        } else {
          // Fetch versions list to find HEAD.
          let headVer: TemplateVersionType | null = null;
          try {
            const versList = await withTimeout(
              rexerApi.templates.versions(templateId!),
              LOAD_TIMEOUT_MS
            );
            const items = versList.items ?? [];
            headVer = items.reduce<TemplateVersionType | null>((max, v) => {
              if (!max) return v;
              return (v.version_no ?? 0) > (max.version_no ?? 0) ? v : max;
            }, null);
          } catch {
            /* versions list failed — fall back to current_version_id */
          }
          if (cancelled) return;

          // Prefer HEAD; fall back to current_version_id if HEAD load fails.
          const targetVerId = headVer?.id ?? currentVerId;
          if (targetVerId) {
            const ver = await withTimeout(
              rexerApi.templates.version(templateId!, targetVerId),
              LOAD_TIMEOUT_MS
            );
            if (cancelled) return;
            setCurrentVersion(ver);
            loadedVersionId = ver.id;
            // canvas_blueprint stores `schema_version: "1.0"` from BE —
            // parseCanvas nhận trực tiếp; adapt ở đây chỉ để bọc trường hợp
            // blueprint cũ thiếu hẳn vỏ schema_version. Blocks shape already
            // 2.0-aligned post BE fabric_to_blueprint converter (handoff §1.4).
            if (ver.canvas_blueprint) {
              canvasData = adaptCanvasBlueprint(ver.canvas_blueprint);
              loadSource =
                headVer && ver.id === headVer.id
                  ? 'version-head'
                  : 'version-current';
            }
          }
        }
        // eslint-disable-next-line no-console
        console.log(
          '[rexer-editor] LOAD canvas from:',
          loadSource,
          '· template:',
          tpl.id,
          '· current_version_id (BE):',
          currentVerId,
          '· loaded version_id:',
          loadedVersionId,
          '· raw blocks:',
          Array.isArray(
            (canvasData as { blocks?: unknown[] } | undefined)?.blocks
          )
            ? (canvasData as { blocks: unknown[] }).blocks.length
            : 0,
          '· pages:',
          Array.isArray(
            (canvasData as { pages?: unknown[] } | undefined)?.pages
          )
            ? (canvasData as { pages: unknown[] }).pages.length
            : 0
        );
        if (
          loadSource === 'version-head' &&
          loadedVersionId &&
          loadedVersionId !== currentVerId
        ) {
          // eslint-disable-next-line no-console
          console.warn(
            '[rexer-editor] HEAD diverges from template.current_version_id (by design — BE chỉ set current_version_id ở version đầu, contract 2026-06-04 §2a). Render công khai dùng page.template_version_id + release snapshot, KHÔNG dùng current_version_id.'
          );
        }
        // Also stash HEAD version when canvas loaded from the template's own
        // draft — Save Version (template-owned fallback only, no `pageId`)
        // inherits schema fields from currentVersion, dùng HEAD schema để
        // tránh nhánh schema bị regress. Page-owned Save Version doesn't
        // mint template versions at all (see `handleSaveVersion`), so this
        // stash — and the template call it makes — is skipped entirely
        // whenever there's a page context.
        if (!pageId && tpl.draft_canvas_blueprint) {
          rexerApi.templates
            .versions(templateId!)
            .then(list => {
              if (cancelled) return;
              const head = (
                list.items ?? []
              ).reduce<TemplateVersionType | null>(
                (max, v) =>
                  !max || (v.version_no ?? 0) > (max.version_no ?? 0) ? v : max,
                null
              );
              if (head) setCurrentVersion(head);
            })
            .catch(() => {
              /* non-blocking */
            });
        }

        // Adapter: canonical Template → CanvasTemplate-shaped meta. `version`
        // + `canvas_etag` are fakes — autosave optimistic-lock uses them but
        // BE save endpoint is retired anyway (see Wave 3 note above).
        const meta: CanvasTemplate = {
          id: tpl.id,
          name: tpl.name,
          description: tpl.description ?? undefined,
          width: 800,
          height: 600,
          engine: 'block_editor',
          engine_version: '2.0',
          canvas_etag: currentVerId ?? '',
          version: 1,
          is_active: tpl.status === 'active',
          is_template: true,
          thumbnail_url: tpl.thumbnail_url,
          created_by: tpl.created_by,
          updated_by: tpl.created_by,
          created_at: tpl.created_at,
          updated_at: tpl.updated_at,
          canvas_data: canvasData,
        };
        setTemplate(meta);

        const parsed = parseCanvas(canvasData);
        // Wave 3: seed canonical templates start with empty canvas_blueprint
        // (`blocks: []`). Falling back to `seedBlocks()` (hardcoded mock) made
        // every empty template render the same content.
        //
        // Empty-canvas precedence:
        //   1. parsed.blocks → user's actual canvas
        //   2. hasServerCanvas (BE returned blueprint, possibly with blocks:[])
        //      → empty array — user delete-everything-then-reload state
        //   3. tpl.current_version_id === null → fresh template (vừa create
        //      qua CreateTemplateDialog, chưa có version, chưa có draft) →
        //      empty array, user tự add blocks
        //   4. Otherwise → legacy template with missing canvas (mig artifact)
        //      → seed mock để có gì render
        //
        // Multi-page: the precedence above is about the HOME page only. Other
        // pages are taken verbatim from the blueprint — an empty sub-page is a
        // page the user hasn't filled in yet, never a reason to seed mocks.
        const hasServerCanvas = canvasData !== undefined;
        const isFreshTemplate =
          currentVerId === null &&
          !tpl.draft_canvas_blueprint &&
          loadSource !== 'draft-page' &&
          loadSource !== 'revision-page';
        const initial = parsed?.blocks.length
          ? parsed.blocks
          : hasServerCanvas || isFreshTemplate
            ? []
            : seedBlocks();
        // eslint-disable-next-line no-console
        console.log(
          '[rexer-editor] PARSE canvas — parsed blocks:',
          parsed?.blocks.length ?? 0,
          '· hasServerCanvas:',
          hasServerCanvas,
          '· initial blocks installed:',
          initial.length,
          '· seeded mock?',
          parsed === null && !hasServerCanvas && !isFreshTemplate,
          '· isFreshTemplate?',
          isFreshTemplate
        );
        // Pages: parsed always yields ≥1 page (legacy blueprints become one
        // implicit home page). Swap the home page's blocks for the
        // precedence-resolved `initial` computed above.
        const parsedPages = parsed?.pages ?? [];
        const pages: EditorPage[] = parsedPages.length
          ? parsedPages.map(p => (p.isHome ? { ...p, blocks: initial } : p))
          : [
              {
                id: DEFAULT_PAGE_ID,
                name: 'Trang chủ',
                slug: '',
                isHome: true,
                blocks: initial,
              },
            ];
        // Always open on the home page's first block — see `firstBlockId`.
        const homePage = pages.find(p => p.isHome) ?? pages[0];
        canvas.resetPages(
          pages,
          homePage.id,
          firstBlockId(homePage.blocks ?? [])
        );
        setTransition(parsed?.transition ?? 'none');
        loadedCanvasKeyRef.current = canvasKey;
        // Publish state source-of-truth precedence:
        //   1. BE Page.status === 'published' (canonical, set qua
        //      pages.publish — survives Save Version commit clearing draft)
        //   2. parsed blueprint.publish (legacy share-token meta)
        //   3. undefined
        // Save Version commit BE clear draft → blueprint.publish trống ở
        // HEAD; nếu user publish qua kebab Publish ở landing list thì
        // pageStatus='published' tới đây — vẫn show "Đã xuất bản" đúng.
        if (pageStatus === 'published') {
          publishState.setPublish({
            published: true,
            // shareToken giữ lại nếu blueprint cũ có, không thì empty —
            // user click "Đổi link" sẽ generate khi cần (slug URL không
            // cần shareToken).
            shareToken: parsed?.publish?.shareToken ?? '',
            publishedAt: parsed?.publish?.publishedAt,
          });
        } else if (pageStatus === 'archived') {
          publishState.setPublish(undefined);
        } else {
          publishState.setPublish(parsed?.publish);
        }
        // Mark dirty only when we materialised mock seed (legacy fallback).
        // Empty canvas — intentional starting state for fresh template or
        // canonical empty blueprint — doesn't need an autosave fire.
        if (parsed === null && !hasServerCanvas && !isFreshTemplate) {
          autosave.markDirty();
        }
      } catch (err) {
        if (cancelled) return;
        setLoadError(rxErrorMessage(err));
        const seeded = seedBlocks();
        canvas.reset(seeded, firstBlockId(seeded));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    templateId,
    savedBlockDirectId,
    blockMode,
    pageId,
    pageDraftCanvasBlueprint,
  ]);

  // Auto-apply product when launched from campaign detail link (`?apply_product=<id>`).
  const autoAppliedRef = React.useRef(false);
  React.useEffect(() => {
    if (!autoApplyProductId) return;
    if (loading || !template || autoAppliedRef.current) return;
    autoAppliedRef.current = true;
    rexerApi.products
      .get(autoApplyProductId)
      .then(res => ai.applyProduct(res.product))
      .catch(err => {
        toast.error(`Auto-apply thất bại: ${rxErrorMessage(err)}`);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoApplyProductId, loading, template]);

  // ── Mutations ───────────────────────────────────────────────────────────
  const tabletReadOnly = (): boolean => {
    if (deviceState.device !== 'tablet') return false;
    toast.info(
      'Tablet đang xem layout desktop (read-only). Chuyển Desktop hoặc Mobile để chỉnh sửa.'
    );
    return true;
  };

  const editVariant = deviceState.editVariant;
  const langKey = deviceState.lang === 'vi' ? 'contentVi' : 'contentEn';

  /**
   * Content writes are addressed by block id, never by "the active block".
   * On the full-page canvas a commit can land after the user has already
   * clicked into another block — an inline edit commits on blur, a drag on
   * pointerup — and `mutateActive` would then write to the wrong block.
   */
  const updateBlockContent = (
    blockId: string,
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => {
    if (tabletReadOnly()) return;
    canvas.mutateBlock(blockId, b => {
      const variants = b[langKey];
      const prev =
        (editVariant === 'mobile' ? variants.mobile : undefined) ??
        variants.desktop;
      const resolved =
        typeof next === 'function' ? next(prev as BlockContent) : next;
      b[langKey] = { ...variants, [editVariant]: resolved };
    });
    autosave.markDirty();
  };

  /** Same write, aimed at the current selection (sidebar + legacy toolbar). */
  const updateActiveContent = (
    next: BlockContent | ((prev: BlockContent) => BlockContent)
  ) => {
    if (!canvas.activeId) return;
    updateBlockContent(canvas.activeId, next);
  };

  const handleUpdateElementStyle = (key: string, patch: ElementStyle) => {
    if (tabletReadOnly()) return;
    canvas.mutateActive(b => {
      const variants = b.elementStyles ?? { desktop: {} };
      const currentMap = variants[editVariant] ?? {};
      const currentStyle = currentMap[key] ?? {};
      const nextMap: ElementStylesMap = {
        ...currentMap,
        [key]: { ...currentStyle, ...patch },
      };
      b.elementStyles = { ...variants, [editVariant]: nextMap };
    });
    autosave.markDirty();
  };

  const handleResetElementStyleFor = (blockId: string, key: string) => {
    if (deviceState.device === 'tablet') return;
    canvas.mutateBlock(blockId, b => {
      const variants = b.elementStyles;
      const currentMap = variants?.[editVariant];
      if (!currentMap?.[key]) return;
      const nextMap = { ...currentMap };
      delete nextMap[key];
      b.elementStyles = {
        ...(variants ?? { desktop: {} }),
        [editVariant]: nextMap,
      };
    });
    autosave.markDirty();
  };

  const handleResetElementStyle = (key: string) => {
    if (!canvas.activeId) return;
    handleResetElementStyleFor(canvas.activeId, key);
  };

  const handleUpdateBackgroundFor = (
    blockId: string,
    next: BlockBackground | undefined
  ) => {
    if (tabletReadOnly()) return;
    canvas.mutateBlock(blockId, b => {
      const variants = b.background;
      if (!next) {
        if (!variants) return;
        const stripped = { ...variants };
        delete stripped[editVariant];
        if (!stripped.desktop && !stripped.mobile) {
          delete b.background;
          return;
        }
        b.background = stripped as typeof b.background;
        return;
      }
      const cleaned: BlockBackground = {
        ...(next.color ? { color: next.color } : {}),
        ...(next.imageUrl ? { imageUrl: next.imageUrl } : {}),
        ...(next.imageTransform ? { imageTransform: next.imageTransform } : {}),
      };
      const baseDesktop = variants?.desktop ?? {};
      b.background = {
        ...(variants ?? { desktop: baseDesktop }),
        [editVariant]: cleaned,
      };
    });
    autosave.markDirty();
  };

  const handleUpdateBackground = (next: BlockBackground | undefined) => {
    if (!canvas.activeId) return;
    handleUpdateBackgroundFor(canvas.activeId, next);
  };

  const handleChangeBlockMotion = React.useCallback(
    (next: BlockMotionStored | null) => {
      canvas.mutateActive(b => {
        const variants = b.motion;
        const desktopNext: BlockMotionStored | undefined =
          editVariant === 'desktop' ? (next ?? undefined) : variants?.desktop;
        const mobileNext: BlockMotionStored | undefined =
          editVariant === 'mobile' ? (next ?? undefined) : variants?.mobile;
        const isEmpty = (m: BlockMotionStored | undefined) =>
          !m || (m.tracks.length === 0 && m.duration === 0);
        if (isEmpty(desktopNext) && isEmpty(mobileNext)) {
          delete b.motion;
          return;
        }
        b.motion = {
          desktop: desktopNext ?? { tracks: [], duration: 0 },
          mobile: mobileNext,
        };
      });
      autosave.markDirty();
    },
    [canvas, editVariant, autosave]
  );

  const handleCommitElementPosition = (
    blockId: string,
    key: string,
    pos: { x: number; y: number }
  ) => {
    if (tabletReadOnly()) return;
    canvas.mutateBlock(blockId, b => {
      const variants = b.elementPositions ?? { desktop: {} };
      const currentMap = variants[editVariant] ?? {};
      // Drop the entry when the offset is back to zero — keeps wire payloads
      // small and matches the "no override" semantics of positionStyle.
      if (pos.x === 0 && pos.y === 0) {
        if (!currentMap[key]) return;
        const nextMap = { ...currentMap };
        delete nextMap[key];
        b.elementPositions = { ...variants, [editVariant]: nextMap };
        return;
      }
      b.elementPositions = {
        ...variants,
        [editVariant]: { ...currentMap, [key]: { x: pos.x, y: pos.y } },
      };
    });
    autosave.markDirty();
  };

  const handleReorderElements = (nextOrder: string[]) => {
    if (tabletReadOnly()) return;
    canvas.mutateActive(b => {
      const variants = b.elementOrder ?? { desktop: nextOrder };
      b.elementOrder = { ...variants, [editVariant]: nextOrder };
    });
    autosave.markDirty();
  };

  // ── ExtraElements (free-drag user-added objects) ────────────────────────
  const [selectedExtraElementId, setSelectedExtraElementId] = React.useState<
    string | null
  >(null);

  const handleAddExtraElement = (kind: ExtraElementKind) => {
    if (tabletReadOnly()) return;
    // Drop the new element near the block's centre so the user sees it
    // immediately. Coordinates are relative to the block frame.
    const el = makeExtraElement(kind, { x: 80, y: 80 });
    canvas.mutateActive(b => {
      b.extraElements = [...(b.extraElements ?? []), el];
    });
    setSelectedExtraElementId(el.id);
    selection.selectKey(null); // clear fixed-element selection
    autosave.markDirty();
  };

  const handleRemoveExtraElement = (id: string) => {
    if (tabletReadOnly()) return;
    canvas.mutateActive(b => {
      b.extraElements = (b.extraElements ?? []).filter(e => e.id !== id);
    });
    if (selectedExtraElementId === id) setSelectedExtraElementId(null);
    autosave.markDirty();
  };

  const handleCommitExtraElementPosition = (
    blockId: string,
    id: string,
    pos: { x: number; y: number }
  ) => {
    if (tabletReadOnly()) return;
    canvas.mutateBlock(blockId, b => {
      b.extraElements = (b.extraElements ?? []).map(e =>
        e.id === id ? { ...e, position: pos } : e
      );
    });
    autosave.markDirty();
  };

  const handlePatchExtraElement = (
    id: string,
    patch: Partial<
      import('@/components/modules/block-editor/types').ExtraElement
    >
  ) => {
    if (tabletReadOnly()) return;
    canvas.mutateActive(b => {
      const next = patchExtraElement(b, id, patch);
      b.extraElements = next.extraElements;
    });
    autosave.markDirty();
  };

  const handleBringExtraToFront = (id: string) => {
    if (tabletReadOnly()) return;
    canvas.mutateActive(b => {
      const next = bringToFront(b, id);
      b.extraElements = next.extraElements;
    });
    autosave.markDirty();
  };

  const handleSendExtraToBack = (id: string) => {
    if (tabletReadOnly()) return;
    canvas.mutateActive(b => {
      const next = sendToBack(b, id);
      b.extraElements = next.extraElements;
    });
    autosave.markDirty();
  };

  // ── Variant sync (Desktop ↔ Mobile copy) ───────────────────────────────
  const syncVariant = (
    from: 'desktop' | 'mobile',
    to: 'desktop' | 'mobile'
  ) => {
    canvas.mutateActive(b => {
      const cloneSrc = <T,>(v: { desktop: T; mobile?: T } | undefined) => {
        if (!v) return v;
        const src = v[from] ?? v.desktop;
        if (src === undefined) return v;
        return { ...v, [to]: structuredClone(src) };
      };
      b.contentVi = cloneSrc(b.contentVi)!;
      b.contentEn = cloneSrc(b.contentEn)!;
      b.elementStyles = cloneSrc(b.elementStyles);
      b.background = cloneSrc(b.background);
      b.elementOrder = cloneSrc(b.elementOrder);
      b.motion = cloneSrc(b.motion);
    });
    autosave.markDirty();
    toast.success(
      from === 'desktop'
        ? 'Đã copy Desktop → Mobile'
        : 'Đã copy Mobile → Desktop'
    );
  };

  // ── Selection / inline edit ────────────────────────────────────────────
  // Drop inline edit when device/lang changes (content shape differs across
  // variants). Selection is NOT cleared on `canvas.activeId` change: on the
  // full-page canvas, clicking an element in another block sets the active
  // block and the key in the same commit, and an effect here would wipe the
  // key it just received. The paths that really do invalidate the selection
  // (block/page switch from the panels, block removal) clear it themselves.
  React.useEffect(() => {
    selection.endInlineEdit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceState.device, deviceState.lang]);

  /**
   * Canvas element click — makes the owning block active first, so every
   * active-scoped surface (sidebar, layers, motion panel, legacy toolbar)
   * follows the selection without knowing the page canvas exists.
   */
  const handleSelectCanvasElement = React.useCallback(
    (blockId: string | null, key: string | null) => {
      if (blockId && blockId !== canvas.activeId) {
        canvas.setActiveId(blockId);
        setSelectedExtraElementId(null);
      }
      selection.selectKey(key);
    },
    [canvas, selection]
  );

  const handleStartInlineEdit = (blockId: string, key: string) => {
    if (tabletReadOnly()) return;
    if (blockId !== canvas.activeId) handleSelectCanvasElement(blockId, key);
    selection.startInlineEdit(key);
  };

  const handleCommitInlineEdit = (
    blockId: string,
    key: string,
    value: string
  ) => {
    const block = canvas.blocks.find(b => b.id === blockId);
    if (!block) {
      selection.endInlineEdit();
      return;
    }
    const langContent = block[langKey];
    const current =
      (editVariant === 'mobile' ? langContent.mobile : undefined) ??
      langContent.desktop;
    const currentRecord = current as Record<string, unknown>;
    const paraMatch = key.match(PNJ_PARAGRAPH_KEY_RE);
    const titleLineMatch = key.match(PNJ_HERO_TITLE_LINE_KEY_RE);
    const variantHighlightsMatch = key.match(PNJ_VARIANT_HIGHLIGHTS_KEY_RE);
    const variantHighlightItemMatch = key.match(
      PNJ_VARIANT_HIGHLIGHT_ITEM_KEY_RE
    );
    const currentValue = paraMatch
      ? (resolvePnjParagraphs(
          current as PnjDetailsContent & {
            paragraph1?: string;
            paragraph2?: string;
          }
        )[Number(paraMatch[1])] ?? '')
      : titleLineMatch
        ? (resolvePnjHeroTitleLines(current as PnjHeroContent)[
            Number(titleLineMatch[1])
          ] ?? '')
        : variantHighlightsMatch
          ? resolvePnjVariantHighlights(getContentAt(currentRecord, key)).join(
              '\n'
            )
          : variantHighlightItemMatch
            ? (resolvePnjVariants(current as PnjVariantContent)[
                Number(variantHighlightItemMatch[1])
              ]?.highlights[Number(variantHighlightItemMatch[2])] ?? '')
            : getContentAt(currentRecord, key);
    if (currentValue === value) {
      selection.endInlineEdit();
      return;
    }
    canvas.mutateBlock(blockId, b => {
      const variants = b[langKey];
      const baseContent =
        (editVariant === 'mobile' ? variants.mobile : undefined) ??
        variants.desktop;
      // paragraphs[i] / titleLines[i]: preserve full list (setContentAt collapses).
      let nextContent: BlockContent;
      if (paraMatch) {
        nextContent = setPnjParagraphAt(
          baseContent as PnjDetailsContent & {
            paragraph1?: string;
            paragraph2?: string;
          },
          Number(paraMatch[1]),
          value
        ) as BlockContent;
      } else if (titleLineMatch) {
        nextContent = setPnjHeroTitleLineAt(
          baseContent as PnjHeroContent,
          Number(titleLineMatch[1]),
          value
        ) as BlockContent;
      } else if (variantHighlightItemMatch) {
        nextContent = setPnjVariantHighlightItemAt(
          baseContent as PnjVariantContent,
          Number(variantHighlightItemMatch[1]),
          Number(variantHighlightItemMatch[2]),
          value
        ) as BlockContent;
      } else if (variantHighlightsMatch) {
        nextContent = setPnjVariantHighlightsAt(
          baseContent as PnjVariantContent,
          Number(variantHighlightsMatch[1]),
          value
        ) as BlockContent;
      } else {
        nextContent = setContentAt(
          baseContent as Record<string, unknown>,
          key,
          value
        ) as BlockContent;
      }
      b[langKey] = { ...variants, [editVariant]: nextContent };
    });
    autosave.markDirty();
    selection.endInlineEdit();
  };

  // ── Save (block-direct) ──────────────────────────────────────────────────
  // Block mode: ghi thẳng block hiện tại về saved block (blocks.update settings
  // + name + type_code đồng bộ). KHÔNG đụng template/version.
  //
  // Các step (đúng thứ tự — đây là chỗ hay quên):
  //   1. endInlineEdit() — chốt inline-edit đang mở để text/style vừa gõ được
  //      commit vào canvas trước khi snapshot (tránh mất ký tự cuối khi bấm Lưu
  //      lúc con trỏ còn trong ô).
  //   2. Lấy block TƯƠI nhất từ canvas (block mode chỉ có đúng 1 block).
  //   3. Chuẩn hoá serialize→parse y như lúc LOAD (BlockEditor + /dev/blocks?id=)
  //      → `settings` lưu xuống là single editor Block canonical (đã migrate
  //      v1→v2, wrap DeviceVariants). Nhờ vậy preview ?id (parseEditorBlock cast
  //      thẳng settings) render khớp 100% với editor.
  //   4. update name + type_code + settings, rồi reset cờ dirty.
  const handleSaveBlockDirect = async () => {
    if (!savedBlockDirectId) {
      toast.error('Chưa có block để lưu.');
      return;
    }
    // 1. Chốt inline-edit đang mở.
    selection.endInlineEdit();

    // 2. Block tươi nhất từ canvas.
    const block = canvas.activeBlock;
    if (!block) {
      toast.error('Chưa có block để lưu.');
      return;
    }

    // 3. Chuẩn hoá về single editor Block canonical (mirror load).
    const wire = serializeCanvas([block], block.id);
    const normalized = parseCanvas(wire)?.blocks[0] ?? block;

    setSavingBlock(true);
    try {
      // 4. Persist.
      await rexerApi.blocks.update(savedBlockDirectId, {
        type_code: normalized.blockType,
        name: normalized.name,
        settings: normalized as unknown as Record<string, unknown>,
        // Luôn gửi kèm — nếu entry cũ bị BE lưu supported_surfaces=[] (bug
        // trước khi field này tồn tại ở FE), lần lưu này tự sửa luôn.
        supported_surfaces: ALL_BLOCK_SURFACES,
      });
      autosave.reset();
      toast.success('Đã lưu block');
    } catch (err) {
      toast.error(`Lưu thất bại: ${rxErrorMessage(err)}`);
    } finally {
      setSavingBlock(false);
    }
  };

  // ── Save Version ────────────────────────────────────────────────────────
  // Commit the current canvas as durable history.
  //
  // Page-owned (has `pageId` — every Experience/portal-v2 page): commits
  // straight to this PAGE's own `page_revisions` via `pages.saveConfig`.
  // No Template version is minted — BE's Publish() already reads content
  // from `page_revisions`, not from a template version's blueprint (the old
  // flow only minted one to have a valid id to pin
  // `page.template_version_id` to). Pages belong to the portal; templates
  // are a shared system resource a page was cloned from once — editing an
  // experience has no business writing into that catalog.
  //
  // Template-owned fallback (rare raw-template-id route, no page resolved —
  // see `useResolvedCanvasTarget`): unchanged, commits an immutable
  // Template version. Bump LUÔN từ max(version_no) trong template — chứ ko
  // phải từ `currentVersion` (có thể trỏ version cũ, dẫn đến 409 "already
  // exists"). Inherits schema fields from currentVersion / HEAD; nếu
  // template chưa có version nào thì dùng default + v1.0.0.
  const handleSaveVersion = async (): Promise<{
    templateVersionId?: string;
  } | null> => {
    if (!template) {
      toast.error('Chưa load template — đợi 1 giây rồi thử lại.');
      return null;
    }
    setSavingVersion(true);
    try {
      await autosave.flush({ silent: true, force: true });

      const payload = serializeCanvasPages({
        pages: canvas.pages,
        publish: publishState.publish,
        transition,
      });

      // BE's canvas_blueprint_validator only walks root `blocks[]` (= the home
      // page), so an unknown block type on a sub-page sails through both
      // autosave and this commit and only surfaces as a "chưa có renderer"
      // placeholder on the published page. Pre-flight what FE can actually
      // check — that every type is renderable — and name the page.
      const unknown = canvas.pages.flatMap(p =>
        p.blocks
          .filter(b => !BLOCK_TYPE_META[b.blockType])
          .map(b => `${p.name} → ${b.name} (${b.blockType})`)
      );
      if (unknown.length) {
        toast.error(
          `Không commit được: ${unknown.length} block không có renderer — ${unknown.join(', ')}`,
          { duration: 10000 }
        );
        return null;
      }

      if (pageId) {
        try {
          const revs = await rexerApi.pages.revisions(pageId, { limit: 1 });
          const latestRev = revs.items?.[0];
          await rexerApi.pages.saveConfig(pageId, {
            config_json: latestRev?.config_json ?? {},
            canvas_blueprint: payload,
            base_revision_no: latestRev?.revision_no ?? 0,
          });
        } catch (err) {
          toast.error(`Lưu thất bại: ${rxErrorMessage(err)}`, {
            duration: 8000,
          });
          return null;
        }
        toast.success('Đã lưu bản mới nhất');
        return {};
      }

      // Resolve next version string từ HEAD của template (max version_no).
      const versList = await rexerApi.templates.versions(template.id);
      const items = versList.items ?? [];
      const head = items.reduce<TemplateVersionType | null>((max, v) => {
        if (!max) return v;
        return (v.version_no ?? 0) > (max.version_no ?? 0) ? v : max;
      }, null);

      // Schema source: HEAD version → currentVersion → defaults.
      // Template chưa có version nào (template mới create) → defaults.
      const schemaSource: Partial<TemplateVersionType> =
        head ?? currentVersion ?? {};

      // Version bump: từ HEAD nếu có, không thì v1.0.0 (first version).
      let candidate: string;
      if (head?.version) {
        candidate = bumpVersion(head.version);
      } else if (currentVersion?.version) {
        candidate = bumpVersion(currentVersion.version);
      } else {
        candidate = '1.0.0';
      }
      // Hồi tiếp 1 lần nếu candidate vẫn trùng (race với commit khác).
      const existing = new Set(items.map(v => v.version));
      while (existing.has(candidate)) {
        candidate = bumpVersion(candidate);
      }

      const next = await rexerApi.templates.createVersion(template.id, {
        version: candidate,
        schema_version: schemaSource.schema_version ?? '1',
        field_schema_json: schemaSource.field_schema_json ?? {},
        default_config_json: schemaSource.default_config_json ?? {},
        canvas_blueprint: payload,
        ...(schemaSource.renderer_key
          ? { renderer_key: schemaSource.renderer_key }
          : {}),
      });
      setCurrentVersion(next);

      toast.success(`Đã commit version "${next.version}"`);
      return { templateVersionId: next.id };
    } catch (err) {
      toast.error(`Save version thất bại: ${rxErrorMessage(err)}`);
      return null;
    } finally {
      setSavingVersion(false);
    }
  };

  // ── Publish ─────────────────────────────────────────────────────────────
  // Updates 2 sources of truth khi user toggle:
  //   - FE blueprint.publish (legacy meta, save vào draft qua autosave)
  //   - BE Page.status qua pages.publish/unpublish — chỉ khi có pageId
  // Khi publish, gửi kèm template_version_id = HEAD (currentVersion) để
  // BE repoint page sang version mới + snapshot canvas mới nhất (BE
  // Option C, be-audit §13 resolved 2026-05-31).
  const handlePublishToggle = async () => {
    if (!template) return;
    const next = publishState.togglePublish();
    await new Promise(r => setTimeout(r, 50));
    autosave.markDirty();
    await autosave.flush({ silent: true });
    if (pageId && next) {
      try {
        if (next.published) {
          // Commit canvas hiện tại TRƯỚC khi publish, để trang public luôn
          // nhận đúng bản mới nhất (tránh publish bản cũ khi user sửa nhưng
          // quên lưu). Page-owned: commits to page_revisions directly, no
          // template_version_id to pass — publish keeps whatever's pinned.
          const committed = await handleSaveVersion();
          // Commit thất bại (vd BE từ chối block_type "unknown block type") →
          // KHÔNG fallback publish version cũ. Trước đây fallback
          // `currentVersion?.id` khiến publish 1 version rỗng/cũ mà vẫn trả 201
          // → trang public trắng âm thầm. Giờ abort + revert toggle + báo rõ.
          if (!committed) {
            publishState.togglePublish(); // revert optimistic published=true
            autosave.markDirty();
            await autosave.flush({ silent: true });
            toast.error(
              'Chưa publish được: lưu bản mới thất bại (xem lỗi phía trên). Sửa rồi thử lại — KHÔNG publish bản cũ.',
              { duration: 8000 }
            );
            return;
          }
          await rexerApi.pages.publish(
            pageId,
            committed.templateVersionId
              ? { template_version_id: committed.templateVersionId }
              : {},
            { slug: pageSlug }
          );
        } else {
          await rexerApi.pages.unpublish(pageId);
        }
      } catch (err) {
        // Surface BE validation reasons khi ERR_PAGE_PUBLISH_NOT_READY
        // (be-audit §14). Format: details.reasons = string[].
        if (
          err instanceof RxApiError &&
          err.code === 'ERR_PAGE_PUBLISH_NOT_READY'
        ) {
          const reasons =
            (err.details as { reasons?: string[] } | undefined)?.reasons ?? [];
          toast.error('Page chưa sẵn sàng publish', {
            description:
              reasons.length > 0
                ? reasons.slice(0, 5).join(' · ')
                : err.message,
            duration: 8000,
          });
        } else {
          toast.error(
            `BE publish sync thất bại: ${rxErrorMessage(err)} — trạng thái FE đã đổi, refresh để verify`
          );
        }
      }
    }
  };

  const handleRepublish = async () => {
    if (!template || !pageId || !publishState.publish?.published) return;

    // Luôn commit canvas hiện tại trước khi republish (giống publish lần
    // đầu). Nếu chỉ repoint HEAD cũ mà editor còn draft chưa commit → public
    // vẫn render snapshot cũ.
    const committed = await handleSaveVersion();
    if (!committed) {
      toast.error(
        'Chưa xuất bản lại được: lưu bản mới thất bại (xem lỗi phía trên).',
        { duration: 8000 }
      );
      return;
    }

    try {
      await rexerApi.pages.publish(
        pageId,
        committed.templateVersionId
          ? { template_version_id: committed.templateVersionId }
          : {},
        { slug: pageSlug }
      );
      publishState.setPublish({
        ...publishState.publish,
        publishedAt: new Date().toISOString(),
      });
      if (committed.templateVersionId) {
        onPinnedVersionChange?.(committed.templateVersionId);
      }
      toast.success('Đã xuất bản lại — trang public hiển thị bản mới nhất');
    } catch (err) {
      if (
        err instanceof RxApiError &&
        err.code === 'ERR_PAGE_PUBLISH_NOT_READY'
      ) {
        const reasons =
          (err.details as { reasons?: string[] } | undefined)?.reasons ?? [];
        toast.error('Page chưa sẵn sàng publish', {
          description:
            reasons.length > 0 ? reasons.slice(0, 5).join(' · ') : err.message,
          duration: 8000,
        });
      } else {
        toast.error(
          `Xuất bản lại thất bại: ${rxErrorMessage(err)} — refresh để verify`
        );
      }
    }
  };

  const handleRotateShareToken = async () => {
    publishState.rotateShareToken();
    await new Promise(r => setTimeout(r, 50));
    autosave.markDirty();
    await autosave.flush({ silent: true });
  };

  // ── Block CRUD ──────────────────────────────────────────────────────────
  /**
   * Block the "add" dialog should insert AFTER. Set by the page canvas frame
   * bar; null means append, which is what the rail's + button wants.
   */
  const [insertAfterId, setInsertAfterId] = React.useState<string | null>(null);

  /** Append, or splice in after `insertAfterId` when the dialog was opened
   *  from a block's own frame on the page canvas. */
  const insertBlocks = (created: Block[]) => {
    canvas.mutate(draft => {
      const at = insertAfterId
        ? draft.findIndex(b => b.id === insertAfterId)
        : -1;
      if (at >= 0) draft.splice(at + 1, 0, ...created);
      else draft.push(...created);
    });
    const last = created[created.length - 1];
    canvas.setActiveId(last.id);
    setInsertAfterId(null);
    autosave.markDirty();
  };

  const handleAddBlocks = (types: BlockType[]) => {
    if (types.length === 0) return;
    insertBlocks(types.map(t => createBlock(t)));
  };

  const handleAddSavedBlocks = (
    blocks: import('@/components/modules/block-editor/types').Block[]
  ) => {
    if (blocks.length === 0) return;
    // Saved blocks carry their library id. Inserting the same one twice — on
    // two pages, or twice on one page — would duplicate block ids, which makes
    // `mutateBlock` edit the wrong block and conflates the two in analytics.
    insertBlocks(blocks.map(b => ({ ...b, id: genId() })));
  };

  const handleDuplicateBlock = (id: string) => {
    const source = canvas.blocks.find(b => b.id === id);
    if (!source) return;
    const copy: Block = {
      ...structuredClone(source),
      id: genId(),
      name: `${source.name} (copy)`,
    };
    // Extra elements carry their own ids; a duplicate would make
    // `patchExtraElement` hit both blocks at once.
    if (copy.extraElements?.length) {
      copy.extraElements = copy.extraElements.map(el => ({
        ...el,
        id: genId(),
      }));
    }
    canvas.mutate(draft => {
      const at = draft.findIndex(b => b.id === id);
      if (at >= 0) draft.splice(at + 1, 0, copy);
      else draft.push(copy);
    });
    canvas.setActiveId(copy.id);
    selection.selectKey(null);
    setSelectedExtraElementId(null);
    autosave.markDirty();
  };

  const handleToggleBlockVisible = (id: string) => {
    canvas.mutateBlock(id, b => {
      b.isVisible = b.isVisible === false;
    });
    autosave.markDirty();
  };

  /** Move one step up (-1) or down (+1). Clamped at both ends. */
  const handleMoveBlock = (id: string, direction: -1 | 1) => {
    const from = canvas.blocks.findIndex(b => b.id === id);
    if (from < 0) return;
    const to = from + direction;
    if (to < 0 || to >= canvas.blocks.length) return;
    const next = [...canvas.blocks];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    canvas.replaceBlocks(next);
    autosave.markDirty();
  };

  const handleRemoveBlock = (id: string) => {
    const target = canvas.blocks.find(b => b.id === id);
    if (!target) return;
    if (!window.confirm(`Xoá block "${target.name}"?`)) return;
    let nextActive: string | null = canvas.activeId;
    canvas.mutate(draft => {
      const idx = draft.findIndex(b => b.id === id);
      if (idx >= 0) draft.splice(idx, 1);
      if (nextActive === id) nextActive = draft[0]?.id ?? null;
    });
    if (nextActive !== canvas.activeId) canvas.setActiveId(nextActive);
    // The selection pointed into the block that no longer exists.
    selection.selectKey(null);
    setSelectedExtraElementId(null);
    autosave.markDirty();
  };

  const handleSelectBlock = React.useCallback(
    (id: string) => {
      if (!canvas.blocks.some(b => b.id === id)) return;
      if (canvas.activeId === id) return;
      canvas.setActiveId(id);
      selection.selectKey(null);
      setSelectedExtraElementId(null);
    },
    [canvas, selection]
  );

  const handleReorderBlocks = (nextOrder: Block[]) => {
    canvas.replaceBlocks(nextOrder);
    autosave.markDirty();
  };

  /** Clicking an extra element also decides which block is active — on the
   *  page canvas it may belong to a block that isn't selected yet. */
  const handleSelectExtraElement = (blockId: string, id: string | null) => {
    if (id && blockId !== canvas.activeId) handleSelectBlock(blockId);
    setSelectedExtraElementId(id);
  };

  /** Block-level verbs surfaced on each frame of the page canvas. */
  const pageBlockActions: PageCanvasBlockActions = {
    onAddAfter: id => {
      setInsertAfterId(id);
      setAddOpen(true);
    },
    onDuplicate: handleDuplicateBlock,
    onToggleVisible: handleToggleBlockVisible,
    onMove: handleMoveBlock,
    onRemove: handleRemoveBlock,
  };

  // ── Page CRUD ───────────────────────────────────────────────────────────
  // Page switches run in a transition: swapping the active page re-renders
  // every block of the incoming page (canvas + thumbnails) in one commit,
  // and doing that synchronously froze the whole editor for the duration.
  // In a transition React time-slices the render, so the click stays
  // responsive and the old page remains visible until the new one is ready.
  const handleSelectPage = React.useCallback(
    (id: string) => {
      if (id === canvas.activePageId) return;
      React.startTransition(() => {
        canvas.setActivePage(id);
        // Selection state belongs to the outgoing page — clear it so the
        // toolbar doesn't point at an element that isn't on screen any more.
        selection.selectKey(null);
        setSelectedExtraElementId(null);
      });
    },
    [canvas, selection]
  );

  const handleAddPage = React.useCallback(() => {
    React.startTransition(() => {
      canvas.addPage();
      selection.selectKey(null);
      setSelectedExtraElementId(null);
      autosave.markDirty();
    });
  }, [canvas, selection, autosave]);

  const handleRemovePage = React.useCallback(
    (id: string) => {
      const target = canvas.pages.find(p => p.id === id);
      if (!target) return;
      if (canvas.pages.length <= 1) {
        toast.error('Template phải còn ít nhất một trang.');
        return;
      }
      const note = target.blocks.length
        ? ` Trang này đang có ${target.blocks.length} block.`
        : '';
      if (!window.confirm(`Xoá trang "${target.name}"?${note}`)) return;
      React.startTransition(() => {
        canvas.removePage(id);
        selection.selectKey(null);
        setSelectedExtraElementId(null);
        autosave.markDirty();
      });
    },
    [canvas, selection, autosave]
  );

  const handleDuplicatePage = React.useCallback(
    (id: string) => {
      React.startTransition(() => {
        canvas.duplicatePage(id);
        selection.selectKey(null);
        setSelectedExtraElementId(null);
        autosave.markDirty();
      });
    },
    [canvas, selection, autosave]
  );

  const handleSetHomePage = React.useCallback(
    (id: string) => {
      canvas.setHomePage(id);
      autosave.markDirty();
    },
    [canvas, autosave]
  );

  const handleRenamePage = React.useCallback(
    (id: string, patch: Partial<Pick<EditorPage, 'name' | 'slug' | 'seo'>>) => {
      canvas.renamePage(id, patch);
      autosave.markDirty();
    },
    [canvas, autosave]
  );

  const handleReorderPages = React.useCallback(
    (next: EditorPage[]) => {
      canvas.reorderPages(next);
      autosave.markDirty();
    },
    [canvas, autosave]
  );

  /**
   * Blueprint handed to the preview frame. Read at handshake time (not on every
   * keystroke) so opening preview always shows the live canvas — including
   * edits autosave has not flushed yet.
   */
  const buildPreviewBlueprint = React.useCallback(
    () =>
      serializeCanvasPages({
        pages: canvas.pages,
        activePageId: canvas.activePageId,
        activeBlockId: canvas.activeId ?? undefined,
        transition,
      }),
    [canvas.pages, canvas.activePageId, canvas.activeId, transition]
  );

  /** The editor previews its own unsaved canvas — `source: 'live'`, no URL. */
  const previewListing = React.useMemo<PreviewItem>(
    () => ({
      id: templateId ?? savedBlockDirectId ?? 'live-canvas',
      name: pageName ?? template?.name ?? canvas.activeBlock?.name ?? 'Canvas',
      source: 'live',
      kindLabel: blockMode ? 'Block' : 'Landing',
    }),
    [
      templateId,
      savedBlockDirectId,
      pageName,
      template?.name,
      canvas.activeBlock?.name,
      blockMode,
    ]
  );

  /** The shell's switcher is mobile/desktop only — tablet has no button. */
  const previewDevice =
    deviceState.device === 'tablet' ? 'desktop' : deviceState.device;

  const handlePreview = React.useCallback(() => {
    setPreviewing(true);
  }, []);

  // ── Duplicate ───────────────────────────────────────────────────────────
  const handleDuplicateConfirm = async (name: string) => {
    if (!template || !canvas.blocks.length || duplicating) return;
    setDuplicating(true);
    try {
      const created = await rexerApi.canvasTemplates.create({
        name,
        width: template.width,
        height: template.height,
        engine: template.engine,
        engine_version: template.engine_version,
        is_template: false,
        // Every page, not just the active one — serializing `canvas.blocks`
        // here would turn a 3-page template into a 1-page copy.
        canvas_data: serializeCanvasPages({
          pages: structuredClone(canvas.pages),
        }) as unknown as Record<string, unknown>,
      });
      toast.success(`Đã lưu thành "${created.name}"`);
      setDuplicateOpen(false);
      router.push(`/canvas-templates/${created.id}`);
    } catch (err) {
      toast.error(`Lưu thất bại: ${rxErrorMessage(err)}`);
    } finally {
      setDuplicating(false);
    }
  };

  // ── Keyboard shortcuts (Cmd+Z / Y / Space) ─────────────────────────────
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) {
        return;
      }
      const meta = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      if (meta && key === 'z' && !e.shiftKey) {
        e.preventDefault();
        canvas.undo();
        autosave.markDirty();
      } else if (meta && ((key === 'z' && e.shiftKey) || key === 'y')) {
        e.preventDefault();
        canvas.redo();
        autosave.markDirty();
      } else if (!meta && (e.code === 'Space' || key === ' ')) {
        e.preventDefault();
        motionPreview.playBlock();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canvas, autosave, motionPreview]);

  // ── Inspector routing ───────────────────────────────────────────────────
  // Which surface edits the current selection: the vertical sidebar inspector
  // (text/color/image/link/background) or the legacy horizontal toolbar above
  // the canvas (the list-manager kinds, still to be migrated).
  const selectedElementKind =
    canvas.activeBlock && selection.selectedKey
      ? resolveElementMeta(canvas.activeBlock.blockType, selection.selectedKey)
          .kind
      : null;
  const usesInspector =
    !!selectedElementKind && isInspectorKind(selectedElementKind);

  // Latched once the user picks a tab by hand, so switching elements doesn't
  // yank them out of Motion. Cleared when the selection is dropped entirely.
  const userPickedTabRef = React.useRef(false);
  const handleChangeSidebarTab = React.useCallback((tab: SidebarTab) => {
    userPickedTabRef.current = true;
    setSidebarTab(tab);
  }, []);

  React.useEffect(() => {
    // Deselecting only clears the latch — the tab stays put. Flipping back to
    // "Lớp" on every click into empty canvas made the panel feel like it was
    // jumping around; the inspector shows a friendly empty state instead.
    if (!selection.selectedKey) {
      userPickedTabRef.current = false;
      return;
    }
    // The sidebar only mounts when expanded — without this, selecting an
    // element with the panel collapsed silently has nowhere to show controls.
    // Ungated on purpose: kinds still on the legacy toolbar don't use the
    // design tab, but Motion lives here too and they need to reach it. Only
    // re-runs when the selection changes, so a manual collapse stays collapsed.
    setLayersCollapsed(false);
    if (userPickedTabRef.current) return;
    if (!usesInspector) return;
    setSidebarTab('design');
  }, [selection.selectedKey, usesInspector]);

  // ── Left rail ───────────────────────────────────────────────────────────
  // Clicking the active destination closes the panel; that is how you give the
  // canvas its full width back without losing which tab you were on.
  const handleSelectRailTab = React.useCallback(
    (tab: EditorRailTab) => {
      if (tab === railTab && panelOpen) {
        setPanelOpen(false);
        return;
      }
      setRailTab(tab);
      setPanelOpen(true);
    },
    [railTab, panelOpen]
  );

  // Block-direct mode has no template, so Blocks and Pages don't exist there.
  React.useEffect(() => {
    if (blockMode && (railTab === 'blocks' || railTab === 'pages')) {
      setRailTab('layers');
    }
  }, [blockMode, railTab]);

  /**
   * "Chọn từ thư viện" inside any `ImagePicker` lands here.
   *
   * The library is the rail's Media panel rather than a modal on purpose: the
   * panel stays open while you click through several images, so swapping a few
   * in a row is one trip instead of one dialog per image.
   */
  const openMediaLibrary = React.useCallback(() => {
    setRailTab('media');
    setPanelOpen(true);
  }, []);

  /**
   * Where the Media panel writes. Only an image element is a valid target, so
   * with anything else selected the panel says what to do instead of failing
   * silently on click.
   */
  const mediaTarget = React.useMemo(() => {
    if (!canvas.activeBlock || !selection.selectedKey) return null;
    const meta = resolveElementMeta(
      canvas.activeBlock.blockType,
      selection.selectedKey
    );
    if (meta.kind !== 'image') return null;
    return { key: selection.selectedKey, label: meta.label };
  }, [canvas.activeBlock, selection.selectedKey]);

  /* Not memoized on purpose — `updateActiveContent` is rebuilt every render, so
     a useCallback here would be invalidated every render anyway. */
  const handlePickMedia = (url: string) => {
    if (!mediaTarget) return;
    const blockType = canvas.activeBlock?.blockType;
    updateActiveContent(prev =>
      writeImageUrl(blockType, prev, mediaTarget.key, url)
    );
    toast.success(`Đã gán ảnh vào “${mediaTarget.label}”`);
  };

  // ── Render ─────────────────────────────────────────────────────────────
  // Same boot UI as the route's `loading.tsx` and `CanvasEditor`'s resolve
  // step. Opening the canvas crosses all three, so they have to look alike —
  // a spinner here made the progress bar restart as a spin halfway through.
  if (loading) {
    return (
      <PreviewStageLoading className='h-full flex-1' label='Đang tải canvas' />
    );
  }

  const saving = autosave.state.kind === 'saving';
  const dirty =
    autosave.state.kind === 'pending' ||
    autosave.state.kind === 'saving' ||
    autosave.state.kind === 'error';
  const activeBlock = canvas.activeBlock;
  const motionForActiveVariant = activeBlock?.motion?.[editVariant] as
    | BlockMotion
    | undefined;

  // Eye → overlay PreviewMode (layout/render khớp /dev/blocks, không mở tab).
  // Live canvas — xem đúng bản đang edit (kể cả chưa lưu).

  return (
    <SitePagesProvider
      pages={canvas.pages}
      activePageId={canvas.activePageId}
      blocks={canvas.blocks}
    >
      <div className='relative flex h-full min-h-0 flex-1 flex-col bg-neutral-100'>
        <BlockEditorHeader
          blockName={activeBlock?.name ?? '—'}
          lang={deviceState.lang}
          saving={saving}
          dirty={dirty}
          duplicating={duplicating}
          onLangChange={deviceState.setLang}
          onAi={() =>
            toast.info('Click 1 element trên canvas để mở popup AI riêng')
          }
          onApplyProduct={() => setProductPickerOpen(true)}
          onImportFromImage={() => setImportOpen(true)}
          onDuplicate={blockMode ? undefined : () => setDuplicateOpen(true)}
          onSaveBlock={
            !blockMode && activeBlock ? () => setSaveBlockOpen(true) : undefined
          }
          onSaveBlockDirect={blockMode ? handleSaveBlockDirect : undefined}
          savingBlockDirect={savingBlock}
          transitionControl={
            blockMode ? undefined : (
              <TransitionSelect
                value={transition}
                placement='down'
                variant='compact'
                onChange={v => {
                  setTransition(v);
                  autosave.markDirty();
                }}
              />
            )
          }
          committedVersion={
            template && !blockMode
              ? (currentVersion?.version ?? null)
              : undefined
          }
          onSaveVersion={template && !blockMode ? handleSaveVersion : undefined}
          savingVersion={savingVersion}
          onPreview={handlePreview}
          onUndo={() => {
            canvas.undo();
            autosave.markDirty();
          }}
          onRedo={() => {
            canvas.redo();
            autosave.markDirty();
          }}
          onPublish={pageId ? () => setPublishOpen(true) : undefined}
          onPlayMotionPreview={motionPreview.playBlock}
          onOpenMotionEditor={() => setMotionEditorOpen(true)}
          canUndo={canvas.canUndo}
          canRedo={canvas.canRedo}
          isPublished={!!publishState.publish?.published}
          isMotionPreviewing={motionPreview.previewing}
          headerActions={headerActions}
          // Back = quay lại màn làm việc trước đó (vd campaign editor) thay vì
          // đẩy về /canvas-templates mặc định. Route override được khi
          // history rỗng (deep-link/F5) — xem prop `onBack`.
          onBack={onBack ?? (() => router.back())}
        />

        {loadError && (
          <div className='border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800'>
            Không tải được canvas từ REXER ({loadError}). Đang dùng dữ liệu mẫu
            — lưu sẽ không hoạt động.
          </div>
        )}

        {/* Block-direct: nút "Lưu block" đã chuyển lên header (slot CTA). */}

        <div className='relative flex min-h-0 flex-1 overflow-hidden'>
          <EditorRail
            activeTab={railTab}
            panelOpen={panelOpen}
            blockMode={blockMode}
            onSelect={handleSelectRailTab}
          />

          {panelOpen && (
            <EditorPanel tab={railTab}>
              {railTab === 'blocks' && (
                <BlocksPanel
                  blocks={canvas.blocks}
                  activeId={canvas.activeId}
                  lang={deviceState.lang}
                  onSelect={handleSelectBlock}
                  onAdd={() => setAddOpen(true)}
                  onRemove={handleRemoveBlock}
                  onReorder={handleReorderBlocks}
                  pages={canvas.pages}
                  activePageId={canvas.activePageId}
                  onSelectPage={handleSelectPage}
                  onAddPage={handleAddPage}
                />
              )}

              {railTab === 'layers' &&
                (activeBlock ? (
                  <div className='min-h-0 flex-1 overflow-y-auto'>
                    <LayersPanel
                      block={activeBlock}
                      device={deviceState.device}
                      selectedKey={selection.selectedKey}
                      onSelectKey={selection.selectKey}
                      onReorder={handleReorderElements}
                      selectedExtraElementId={selectedExtraElementId}
                      onAddExtraElement={handleAddExtraElement}
                      onSelectExtraElement={setSelectedExtraElementId}
                      onRemoveExtraElement={handleRemoveExtraElement}
                    />
                  </div>
                ) : (
                  <p className='p-3 text-xs text-neutral-500'>
                    Chọn một block để xem các lớp bên trong.
                  </p>
                ))}

              {railTab === 'media' && (
                <MediaPanel
                  onPick={mediaTarget ? handlePickMedia : undefined}
                  targetLabel={mediaTarget?.label ?? null}
                />
              )}

              {railTab === 'product' && (
                <ProductPanel onPick={ai.applyProduct} />
              )}

              {railTab === 'signal' &&
                (activeBlock ? (
                  <SignalPanel
                    block={activeBlock}
                    allBlocks={canvas.blocks}
                    onEdit={recipe => {
                      canvas.mutateActive(recipe);
                      autosave.markDirty();
                    }}
                  />
                ) : (
                  <p className='p-3 text-xs text-neutral-500'>
                    Chọn một block trên canvas để cấu hình đo lường.
                  </p>
                ))}

              {railTab === 'pages' && (
                <PagesPanel
                  pages={canvas.pages}
                  activePageId={canvas.activePageId}
                  onSelect={handleSelectPage}
                  onAdd={handleAddPage}
                  onReorder={handleReorderPages}
                  onDuplicate={handleDuplicatePage}
                  onRemove={handleRemovePage}
                  onSetHome={handleSetHomePage}
                  onOpenSettings={setPageSettingsId}
                />
              )}
            </EditorPanel>
          )}

          <div className='relative flex min-h-0 min-w-0 flex-1 flex-col'>
            {/* Overlay toolbar — absolute so show/hide never pushes the canvas. */}
            {activeBlock && selectedExtraElementId ? (
              (() => {
                const el = activeBlock.extraElements?.find(
                  e => e.id === selectedExtraElementId
                );
                if (!el) return null;
                return (
                  <div className='pointer-events-none absolute inset-x-0 top-0 z-40'>
                    <div className='pointer-events-auto'>
                      <ExtraElementToolbar
                        element={el}
                        onChange={patch =>
                          handlePatchExtraElement(selectedExtraElementId, patch)
                        }
                        onDelete={() =>
                          handleRemoveExtraElement(selectedExtraElementId)
                        }
                        onClose={() => setSelectedExtraElementId(null)}
                        onBringToFront={() =>
                          handleBringExtraToFront(selectedExtraElementId)
                        }
                        onSendToBack={() =>
                          handleSendExtraToBack(selectedExtraElementId)
                        }
                      />
                    </div>
                  </div>
                );
              })()
            ) : activeBlock && !usesInspector ? (
              // Kinds the inspector doesn't own yet keep the legacy top bar.
              // Inspector kinds get the floating SelectionToolbar (rendered
              // inside BlockPreview) plus the "Thiết kế" sidebar tab instead.
              <div className='pointer-events-none absolute inset-x-0 top-0 z-40'>
                <div className='pointer-events-auto'>
                  <ElementToolbar
                    block={activeBlock}
                    lang={deviceState.lang}
                    device={deviceState.device}
                    selectedKey={selection.selectedKey}
                    onClose={() => selection.selectKey(null)}
                    onContentChange={updateActiveContent}
                    onUpdateStyle={patch => {
                      if (!selection.selectedKey) return;
                      handleUpdateElementStyle(selection.selectedKey, patch);
                    }}
                    onResetStyle={() => {
                      if (!selection.selectedKey) return;
                      handleResetElementStyle(selection.selectedKey);
                    }}
                    onUpdateBackground={handleUpdateBackground}
                    onSyncVariant={syncVariant}
                  />
                </div>
              </div>
            ) : null}
            {canvas.blocks.length === 0 ? (
              <EmptyState onAdd={() => setAddOpen(true)} />
            ) : effectiveCanvasMode === 'page' ? (
              <PageCanvas
                blocks={canvas.blocks}
                activeBlockId={canvas.activeId}
                lang={deviceState.lang}
                device={deviceState.device}
                zoom={deviceState.zoom}
                selectedElementKey={selection.selectedKey}
                editingKey={selection.editingKey}
                onSelectElement={handleSelectCanvasElement}
                onStartInlineEdit={handleStartInlineEdit}
                onCommitInlineEdit={handleCommitInlineEdit}
                onCancelInlineEdit={selection.endInlineEdit}
                onCommitElementPosition={handleCommitElementPosition}
                onContentChange={updateBlockContent}
                onResetElementStyle={handleResetElementStyleFor}
                onUpdateBackground={handleUpdateBackgroundFor}
                onBrowseLibrary={openMediaLibrary}
                blockActions={pageBlockActions}
                motionMode={motionPreview.previewing ? 'preview' : 'edit'}
                motionPreviewNonce={motionPreview.nonce}
                motionPreviewElement={motionPreview.previewElement}
                onAutoFitZoom={deviceState.applyAutoFitZoom}
                onZoomChange={deviceState.setZoom}
                fitRequestKey={fitRequestKey}
                selectedExtraElementId={selectedExtraElementId}
                onSelectExtraElement={handleSelectExtraElement}
                onCommitExtraElementPosition={handleCommitExtraElementPosition}
              />
            ) : activeBlock ? (
              <BlockPreview
                block={activeBlock}
                lang={deviceState.lang}
                device={deviceState.device}
                zoom={deviceState.zoom}
                selectedElementKey={selection.selectedKey}
                editingKey={selection.editingKey}
                onSelectElement={handleSelectCanvasElement}
                onStartInlineEdit={handleStartInlineEdit}
                onCommitInlineEdit={handleCommitInlineEdit}
                onCancelInlineEdit={selection.endInlineEdit}
                onCommitElementPosition={handleCommitElementPosition}
                onContentChange={updateBlockContent}
                onResetElementStyle={handleResetElementStyleFor}
                onUpdateBackground={handleUpdateBackgroundFor}
                onBrowseLibrary={openMediaLibrary}
                motionMode={motionPreview.previewing ? 'preview' : 'edit'}
                motionPreviewNonce={motionPreview.nonce}
                motionPreviewElement={motionPreview.previewElement}
                onAutoFitZoom={deviceState.applyAutoFitZoom}
                onZoomChange={deviceState.setZoom}
                fitRequestKey={fitRequestKey}
                selectedExtraElementId={selectedExtraElementId}
                onSelectExtraElement={handleSelectExtraElement}
                onCommitExtraElementPosition={handleCommitExtraElementPosition}
              />
            ) : (
              <EmptyState onAdd={() => setAddOpen(true)} />
            )}
            <CanvasZoomBar
              zoom={deviceState.zoom}
              onChange={deviceState.setZoom}
              onFitToFrame={() => setFitRequestKey(k => k + 1)}
              device={deviceState.device}
              onDeviceChange={deviceState.setDevice}
              mode={blockMode ? undefined : canvasMode}
              onModeChange={blockMode ? undefined : setCanvasMode}
            />
          </div>

          {activeBlock && !layersCollapsed && (
            <BlockEditorSidebar
              block={activeBlock}
              device={deviceState.device}
              lang={deviceState.lang}
              selectedElementKey={selection.selectedKey}
              onCollapse={() => setLayersCollapsed(true)}
              activeTab={sidebarTab}
              onChangeTab={handleChangeSidebarTab}
              onContentChange={updateActiveContent}
              onUpdateElementStyle={patch => {
                if (!selection.selectedKey) return;
                handleUpdateElementStyle(selection.selectedKey, patch);
              }}
              onUpdateBackground={handleUpdateBackground}
              onSyncVariant={syncVariant}
              onBrowseLibrary={openMediaLibrary}
              motion={motionForActiveVariant}
              onChangeMotion={handleChangeBlockMotion}
              onOpenMotionEditor={() => setMotionEditorOpen(true)}
              onPlayMotionPreview={motionPreview.playBlock}
              onPlayElementPreview={motionPreview.playElement}
              isMotionPreviewing={motionPreview.previewing}
            />
          )}

          {activeBlock && layersCollapsed && (
            <button
              type='button'
              aria-label='Hiện bảng thiết kế'
              onClick={() => setLayersCollapsed(false)}
              className='absolute top-3 right-3 z-30 flex size-9 cursor-pointer items-center justify-center rounded-lg bg-[var(--pv2-paper)] text-[var(--pv2-mut)] shadow-[var(--pv2-sh-soft)] hover:text-[var(--pv2-ink)]'
            >
              <PanelRightOpen className='size-4' />
            </button>
          )}
        </div>

        <AddBlockDialog
          open={addOpen}
          onOpenChange={open => {
            setAddOpen(open);
            // Dismissed without picking — the next + must append, not splice.
            if (!open) setInsertAfterId(null);
          }}
          onPick={handleAddBlocks}
          onPickSaved={handleAddSavedBlocks}
        />

        <ExchangePreviewShell
          open={previewing}
          listing={previewing ? previewListing : null}
          neighbors={NO_PREVIEW_NEIGHBORS}
          onClose={() => setPreviewing(false)}
          onNavigate={NOOP}
          initialDevice={previewDevice}
          renderStage={device => (
            <ExchangeLiveCanvasPreview
              device={device}
              lang={deviceState.lang}
              transition={transition}
              urlLabel={pageSlug ? `/${pageSlug}` : '/preview'}
              getBlueprint={buildPreviewBlueprint}
            />
          )}
        />

        {/* Transition cấp template đã chuyển lên header (cạnh trạng thái lưu)
          qua prop transitionControl — bỏ control nổi góc dưới. */}

        {activeBlock && (
          <MotionTimelineModal
            open={motionEditorOpen}
            block={activeBlock}
            device={deviceState.device}
            lang={deviceState.lang}
            motion={motionForActiveVariant}
            onChange={handleChangeBlockMotion}
            onClose={() => setMotionEditorOpen(false)}
          />
        )}

        <PublishDialog
          open={publishOpen}
          onOpenChange={setPublishOpen}
          templateId={templateId ?? ''}
          pageSlug={pageSlug}
          pageId={pageId}
          pageName={pageName}
          pinnedVersionId={pinnedVersionId}
          headVersionId={currentVersion?.id}
          headVersionLabel={
            currentVersion ? `v${currentVersion.version}` : undefined
          }
          onPageSlugChange={onPageSlugChange}
          publish={publishState.publish}
          onTogglePublish={handlePublishToggle}
          onRepublish={pageId ? handleRepublish : undefined}
          onRotateToken={handleRotateShareToken}
        />

        <ProductPickerDialog
          open={productPickerOpen}
          onOpenChange={setProductPickerOpen}
          onPick={ai.applyProduct}
        />

        <ImportBlockDialog
          open={importOpen}
          onOpenChange={setImportOpen}
          onInsert={block => {
            // Fresh id — see handleAddSavedBlock.
            const inserted = { ...block, id: genId() };
            canvas.mutate(draft => {
              draft.push(inserted);
            });
            canvas.setActiveId(inserted.id);
            autosave.markDirty();
            toast.success(`Đã thêm block "${block.name}" từ AI`);
          }}
        />

        <PageSettingsDialog
          page={canvas.pages.find(p => p.id === pageSettingsId) ?? null}
          siblings={canvas.pages}
          rootSlug={pageSlug}
          onOpenChange={open => {
            if (!open) setPageSettingsId(null);
          }}
          onSave={handleRenamePage}
        />

        <DuplicateTemplateDialog
          open={duplicateOpen}
          defaultName={
            template ? `${template.name} (bản của tôi)` : 'Template của tôi'
          }
          saving={duplicating}
          onOpenChange={setDuplicateOpen}
          onConfirm={handleDuplicateConfirm}
        />

        {/* Block mode đã có nút "Lưu block" (ghi đè trực tiếp) → bỏ luôn icon +
          popup "Cập nhật block trong thư viện" cho khỏi trùng. */}
        {!blockMode && (
          <SaveBlockDialog
            open={saveBlockOpen}
            block={activeBlock ?? null}
            onOpenChange={setSaveBlockOpen}
            editingSavedBlockId={editingSavedBlockId}
            onOverwriteSuccess={async () => {
              // The /admin/blocks "Edit" flow creates a throwaway canvas just to
              // host the block during editing. After we've written the changes
              // back to the saved-blocks library, the canvas template is garbage
              // — clean it up so it doesn't clutter the /canvas-templates list.
              // Guard: only auto-delete if the canvas name matches the marker the
              // Edit flow stamps on creation (`[Editing] ...`). Prevents a
              // hand-crafted `?saved_block_id=...` URL from nuking a real canvas.
              const isScratch =
                template?.name?.startsWith('[Editing] ') ?? false;
              if (isScratch) {
                try {
                  await rexerApi.canvasTemplates.remove(templateId as string);
                } catch (err) {
                  // eslint-disable-next-line no-console
                  console.warn(
                    '[BlockEditor] could not auto-delete scratch canvas',
                    err
                  );
                }
              }
              // Brand portal mounts the editor under /portal/blocks/.../edit.
              // Send them back to the portal library — otherwise admin default.
              const inPortal =
                typeof window !== 'undefined' &&
                window.location.pathname.startsWith('/portal/blocks');
              router.push(inPortal ? '/portal/blocks' : '/admin/blocks');
            }}
          />
        )}

        <ReviewChangesDialog
          open={ai.reviewState !== null}
          diff={ai.reviewState?.diff ?? null}
          productName={ai.reviewState?.productName ?? ''}
          onOpenChange={open => {
            if (!open) ai.cancelReview();
          }}
          onApply={ai.acceptReviewed}
        />
      </div>
    </SitePagesProvider>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-3 bg-[#f3f1ec] px-6 text-center'>
      <p className='text-sm text-neutral-500'>
        Chưa có block nào. Thêm block đầu tiên để bắt đầu.
      </p>
      <button
        type='button'
        onClick={onAdd}
        className='rounded-pill cursor-pointer bg-neutral-900 px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800'
      >
        + Thêm block
      </button>
    </div>
  );
}
