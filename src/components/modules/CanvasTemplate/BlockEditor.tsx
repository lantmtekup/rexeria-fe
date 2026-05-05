'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PanelRightOpen } from 'lucide-react';
import { toast } from 'sonner';

import { Spinner } from '@/components/atoms/spinner';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { CanvasTemplate, Product } from '@/services/rexer/types';

import { AddBlockDialog } from './block-editor/AddBlockDialog';
import { BlockEditorHeader } from './block-editor/BlockEditorHeader';
import { BlockEditorSidebar } from './block-editor/BlockEditorSidebar';
import { BlockPreview } from './block-editor/BlockPreview';
import { BlockTabBar } from './block-editor/BlockTabBar';
import { DuplicateTemplateDialog } from './block-editor/DuplicateTemplateDialog';
import { ElementToolbar } from './block-editor/ElementToolbar';
import { PreviewMode } from './block-editor/PreviewMode';
import { ProductPickerDialog } from './block-editor/ProductPickerDialog';
import { PublishDialog } from './block-editor/PublishDialog';
import { applyProductToBlocks } from './block-editor/applyProduct';
import { createBlock } from './block-editor/factory';
import {
  newShareToken,
  parseCanvas,
  seedBlocks,
  serializeCanvas,
  type PublishMeta,
} from './block-editor/serialize';
import {
  editingVariantOf,
  type Block,
  type BlockBackground,
  type BlockContent,
  type BlockMotionConfigStored,
  type BlockMotionMapStored,
  type BlockType,
  type Device,
  type ElementStyle,
  type ElementStylesMap,
  type Lang,
} from './block-editor/types';
import type { MotionConfig } from './block-editor/motion/types';

interface BlockEditorProps {
  templateId: string;
  /**
   * When set, after canvas loads run `handleApplyProduct(product)` once.
   * Wired from the campaign detail page link `?apply_product=<id>` so user
   * lands on a canvas that's already merged with their product info.
   */
  autoApplyProductId?: string;
}

const AUTOSAVE_DELAY_MS = 1500;

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Lỗi không xác định';
}

// BE `/canvas-templates/{id}/canvas` endpoint is currently slow (~10s even
// for unauth 401 — see GAP-18 in be-issues-master.md). Keep client timeout
// generous until BE adds early auth gating.
const LOAD_TIMEOUT_MS = 15000;

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

export function BlockEditor({
  templateId,
  autoApplyProductId,
}: BlockEditorProps) {
  const router = useRouter();
  const [template, setTemplate] = React.useState<CanvasTemplate | null>(null);
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [lang, setLang] = React.useState<Lang>('vi');
  const [device, setDevice] = React.useState<Device>('desktop');
  const [zoom, setZoom] = React.useState<number>(100);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);
  const [previewing, setPreviewing] = React.useState(false);
  const [selectedElementKey, setSelectedElementKey] = React.useState<
    string | null
  >(null);
  /** Element key currently being edited inline via double-click. */
  const [editingKey, setEditingKey] = React.useState<string | null>(null);
  const [publish, setPublish] = React.useState<PublishMeta | undefined>(
    undefined
  );
  const [publishOpen, setPublishOpen] = React.useState(false);
  const [productPickerOpen, setProductPickerOpen] = React.useState(false);
  const [duplicateOpen, setDuplicateOpen] = React.useState(false);
  const [duplicating, setDuplicating] = React.useState(false);
  const [layersCollapsed, setLayersCollapsed] = React.useState(false);
  // Sidebar tab — 'layers' shows existing LayersPanel, 'motion' shows
  // element-level motion editor. Block-level motion lives in header popover.
  const [sidebarTab, setSidebarTab] = React.useState<'layers' | 'motion'>(
    'layers'
  );
  // Motion preview mode: when true, BlockPreview switches to mode='preview'
  // so timelines actually run. Auto-revert after 5s; click ▶ again to extend.
  const [motionPreviewing, setMotionPreviewing] = React.useState(false);
  const motionPreviewTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  // Once a save fails (typically 409 version conflict) we suppress the autosave
  // retry loop to stop toast spam. Reset on the next user-driven mutation so a
  // single retry happens automatically when the user keeps working.
  const [saveBlocked, setSaveBlocked] = React.useState(false);

  // Refs to read latest state from autosave/unmount-flush callbacks.
  const blocksRef = React.useRef(blocks);
  const templateRef = React.useRef(template);
  const activeIdRef = React.useRef(activeId);
  const dirtyRef = React.useRef(dirty);
  const savingRef = React.useRef(saving);

  // Undo / redo stacks (keyed off blocks only — light snapshots).
  const HISTORY_CAP = 50;
  const undoStackRef = React.useRef<Block[][]>([]);
  const redoStackRef = React.useRef<Block[][]>([]);
  const [, forceHistoryRender] = React.useReducer(c => c + 1, 0);

  const pushHistory = React.useCallback(() => {
    undoStackRef.current.push(structuredClone(blocksRef.current));
    if (undoStackRef.current.length > HISTORY_CAP) {
      undoStackRef.current.shift();
    }
    redoStackRef.current = [];
    setSaveBlocked(false);
    forceHistoryRender();
  }, []);
  React.useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);
  React.useEffect(() => {
    templateRef.current = template;
  }, [template]);
  React.useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);
  React.useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);
  React.useEffect(() => {
    savingRef.current = saving;
  }, [saving]);

  // ── Load ────────────────────────────────────────────────────────────────
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const meta = await withTimeout(
          rexerApi.canvasTemplates.get(templateId),
          LOAD_TIMEOUT_MS
        );
        if (cancelled) return;
        setTemplate(meta);
        const canvasResp = await withTimeout(
          rexerApi.canvasTemplates.getCanvas(templateId),
          LOAD_TIMEOUT_MS
        );
        if (cancelled) return;
        const parsed = parseCanvas(canvasResp?.canvas_data);
        const initial = parsed?.blocks.length ? parsed.blocks : seedBlocks();
        setBlocks(initial);
        setActiveId(parsed?.activeBlockId ?? initial[0]?.id ?? null);
        setPublish(parsed?.publish);
        setDirty(parsed === null);
      } catch (err) {
        if (cancelled) return;
        const msg = rxErrorMessage(err);
        setLoadError(msg);
        const seeded = seedBlocks();
        setBlocks(seeded);
        setActiveId(seeded[0]?.id ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [templateId]);

  // Auto-apply product when launched from campaign detail link
  // (`?apply_product=<id>`). Run once after the first successful load — guard
  // with a ref so re-renders don't re-trigger.
  const autoAppliedRef = React.useRef(false);
  React.useEffect(() => {
    if (!autoApplyProductId) return;
    if (loading || !template || autoAppliedRef.current) return;
    autoAppliedRef.current = true;
    rexerApi.products
      .get(autoApplyProductId)
      .then(res => handleApplyProduct(res.product))
      .catch(err => {
        toast.error(`Auto-apply thất bại: ${rxErrorMessage(err)}`);
      });
    // handleApplyProduct intentionally omitted — captured via closure, runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoApplyProductId, loading, template]);

  // Keep latest publish in a ref for save.
  const publishRef = React.useRef(publish);
  React.useEffect(() => {
    publishRef.current = publish;
  }, [publish]);

  // ── Save ────────────────────────────────────────────────────────────────
  const doSave = React.useCallback(async (opts: { silent?: boolean } = {}) => {
    const t = templateRef.current;
    const bs = blocksRef.current;
    const aid = activeIdRef.current;
    const pub = publishRef.current;
    if (!t || !bs.length || savingRef.current) return;
    setSaving(true);
    try {
      const updated = await rexerApi.canvasTemplates.update(t.id, {
        canvas_data: serializeCanvas(
          bs,
          aid ?? undefined,
          pub
        ) as unknown as Record<string, unknown>,
        version: t.version,
      });
      setTemplate(updated);
      setDirty(false);
      setSaveBlocked(false);
      if (!opts.silent) toast.success(`Đã lưu · v${updated.version}`);
    } catch (err) {
      // Stop the autosave retry loop so a single failure doesn't pile up
      // toasts every AUTOSAVE_DELAY_MS. Reset happens on next user mutation.
      setSaveBlocked(true);
      const isConflict = err instanceof RxApiError && err.status === 409;
      if (isConflict) {
        toast.error(
          'Canvas đã bị thay đổi từ chỗ khác — tải lại trang để đồng bộ trước khi sửa tiếp.'
        );
      } else {
        toast.error(`Lưu thất bại: ${rxErrorMessage(err)}`);
      }
    } finally {
      setSaving(false);
    }
  }, []);

  // Debounced autosave triggered by dirty state changes.
  React.useEffect(() => {
    if (!dirty || !template || saving || saveBlocked) return;
    const id = setTimeout(() => {
      void doSave({ silent: true });
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(id);
  }, [dirty, blocks, template, saving, saveBlocked, doSave]);

  // Flush on unmount and tab close (best-effort).
  React.useEffect(() => {
    const flush = () => {
      if (dirtyRef.current && templateRef.current && !savingRef.current) {
        void doSave({ silent: true });
      }
    };
    window.addEventListener('beforeunload', flush);
    return () => {
      window.removeEventListener('beforeunload', flush);
      flush();
    };
  }, [doSave]);

  const activeBlock = React.useMemo(
    () => blocks.find(b => b.id === activeId) ?? blocks[0] ?? null,
    [blocks, activeId]
  );

  // Which variant the editor is currently writing to. Tablet → desktop.
  const editVariant = editingVariantOf(device);

  // ── Mutations ───────────────────────────────────────────────────────────
  const updateActiveContent = (next: BlockContent) => {
    if (!activeBlock) return;
    if (device === 'tablet') {
      // Tablet preview is read-only — header banner explains why.
      toast.info(
        'Tablet đang xem layout desktop (read-only). Chuyển Desktop hoặc Mobile để chỉnh sửa.'
      );
      return;
    }
    pushHistory();
    setBlocks(prev =>
      prev.map(b => {
        if (b.id !== activeBlock.id) return b;
        const langKey = lang === 'vi' ? 'contentVi' : 'contentEn';
        const current = b[langKey];
        return {
          ...b,
          [langKey]: { ...current, [editVariant]: next },
        };
      })
    );
    setDirty(true);
  };

  const handleReorder = (next: Block[]) => {
    pushHistory();
    setBlocks(next);
    setDirty(true);
  };

  const handleUpdateElementStyle = (key: string, patch: ElementStyle) => {
    if (!activeBlock) return;
    if (device === 'tablet') {
      toast.info(
        'Tablet đang xem layout desktop (read-only). Chuyển Desktop hoặc Mobile để chỉnh sửa.'
      );
      return;
    }
    pushHistory();
    setBlocks(prev =>
      prev.map(b => {
        if (b.id !== activeBlock.id) return b;
        const variants = b.elementStyles ?? { desktop: {} };
        const currentMap = variants[editVariant] ?? {};
        const currentStyle = currentMap[key] ?? {};
        const nextMap: ElementStylesMap = {
          ...currentMap,
          [key]: { ...currentStyle, ...patch },
        };
        return {
          ...b,
          elementStyles: { ...variants, [editVariant]: nextMap },
        };
      })
    );
    setDirty(true);
  };

  const handleResetElementStyle = (key: string) => {
    if (!activeBlock) return;
    if (device === 'tablet') return;
    pushHistory();
    setBlocks(prev =>
      prev.map(b => {
        if (b.id !== activeBlock.id) return b;
        const variants = b.elementStyles;
        const currentMap = variants?.[editVariant];
        if (!currentMap?.[key]) return b;
        const nextMap = { ...currentMap };
        delete nextMap[key];
        return {
          ...b,
          elementStyles: {
            ...(variants ?? { desktop: {} }),
            [editVariant]: nextMap,
          },
        };
      })
    );
    setDirty(true);
  };

  const handleUpdateBackground = (next: BlockBackground | undefined) => {
    if (!activeBlock) return;
    if (device === 'tablet') {
      toast.info(
        'Tablet đang xem layout desktop (read-only). Chuyển Desktop hoặc Mobile để chỉnh sửa.'
      );
      return;
    }
    pushHistory();
    setBlocks(prev =>
      prev.map(b => {
        if (b.id !== activeBlock.id) return b;
        const variants = b.background;
        if (!next) {
          // Clear this variant's background; if both variants empty, drop the field.
          if (!variants) return b;
          const stripped = { ...variants };
          delete stripped[editVariant];
          if (!stripped.desktop && !stripped.mobile) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { background: _drop, ...rest } = b;
            return rest;
          }
          return { ...b, background: stripped as Block['background'] };
        }
        const cleaned: BlockBackground = {
          ...(next.color ? { color: next.color } : {}),
          ...(next.imageUrl ? { imageUrl: next.imageUrl } : {}),
          ...(next.imageTransform
            ? { imageTransform: next.imageTransform }
            : {}),
        };
        const baseDesktop = variants?.desktop ?? {};
        return {
          ...b,
          background: {
            ...(variants ?? { desktop: baseDesktop }),
            [editVariant]: cleaned,
          },
        };
      })
    );
    setDirty(true);
  };

  // ── Motion mutations ───────────────────────────────────────────────────
  const editVariantForMotion: 'desktop' | 'mobile' = editingVariantOf(device);

  const writeMotion = React.useCallback(
    (
      patch: (
        current: BlockMotionMapStored | undefined
      ) => BlockMotionMapStored | undefined
    ) => {
      if (!activeBlock) return;
      pushHistory();
      setBlocks(prev =>
        prev.map(b => {
          if (b.id !== activeBlock.id) return b;
          const variants = b.motion;
          const currentForVariant = variants?.[editVariantForMotion];
          const nextForVariant = patch(currentForVariant);
          // DeviceVariants requires `desktop` to be defined. When the user
          // edits the mobile variant first, seed desktop with an empty map
          // so the type holds; the editor reads via `readVariant` which
          // already falls back to desktop.
          const desktopNext: BlockMotionMapStored =
            editVariantForMotion === 'desktop'
              ? (nextForVariant ?? {})
              : (variants?.desktop ?? {});
          const mobileNext: BlockMotionMapStored | undefined =
            editVariantForMotion === 'mobile'
              ? nextForVariant
              : variants?.mobile;
          const desktopEmpty =
            !desktopNext.block &&
            !(desktopNext.elements && Object.keys(desktopNext.elements).length);
          const mobileEmpty =
            !mobileNext ||
            (!mobileNext.block &&
              !(
                mobileNext.elements && Object.keys(mobileNext.elements).length
              ));
          if (desktopEmpty && mobileEmpty) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { motion: _drop, ...rest } = b;
            return rest;
          }
          return {
            ...b,
            motion: { desktop: desktopNext, mobile: mobileNext },
          };
        })
      );
      setDirty(true);
    },
    [activeBlock, editVariantForMotion, pushHistory]
  );

  const handleChangeBlockMotion = React.useCallback(
    (next: MotionConfig | null) => {
      writeMotion(current => {
        if (!next) {
          if (!current) return undefined;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { block: _drop, ...rest } = current;
          return Object.keys(rest).length
            ? (rest as BlockMotionMapStored)
            : undefined;
        }
        return {
          ...(current ?? {}),
          block: next as BlockMotionConfigStored,
        };
      });
    },
    [writeMotion]
  );

  const handleChangeElementMotion = React.useCallback(
    (elementKey: string, next: MotionConfig | null) => {
      writeMotion(current => {
        const elements = { ...(current?.elements ?? {}) };
        if (!next) {
          delete elements[elementKey];
        } else {
          elements[elementKey] = next as BlockMotionConfigStored;
        }
        const cleaned: BlockMotionMapStored = {
          ...(current ?? {}),
          elements: Object.keys(elements).length ? elements : undefined,
        };
        if (!cleaned.block && !cleaned.elements) return undefined;
        return cleaned;
      });
    },
    [writeMotion]
  );

  const playMotionPreview = React.useCallback(() => {
    setMotionPreviewing(true);
    if (motionPreviewTimer.current) {
      clearTimeout(motionPreviewTimer.current);
    }
    motionPreviewTimer.current = setTimeout(() => {
      setMotionPreviewing(false);
      motionPreviewTimer.current = null;
    }, 5000);
  }, []);

  React.useEffect(
    () => () => {
      if (motionPreviewTimer.current) clearTimeout(motionPreviewTimer.current);
    },
    []
  );

  // Sync helpers: copy one variant's content/styles/background/order to the other.
  const syncVariant = (
    from: 'desktop' | 'mobile',
    to: 'desktop' | 'mobile'
  ) => {
    if (!activeBlock) return;
    pushHistory();
    setBlocks(prev =>
      prev.map(b => {
        if (b.id !== activeBlock.id) return b;
        const cloneSrc = <T,>(v: { desktop: T; mobile?: T } | undefined) => {
          if (!v) return v;
          const src = v[from] ?? v.desktop;
          if (src === undefined) return v;
          return { ...v, [to]: structuredClone(src) };
        };
        return {
          ...b,
          contentVi: cloneSrc(b.contentVi)!,
          contentEn: cloneSrc(b.contentEn)!,
          elementStyles: cloneSrc(b.elementStyles),
          background: cloneSrc(b.background),
          elementOrder: cloneSrc(b.elementOrder),
          motion: cloneSrc(b.motion),
        };
      })
    );
    setDirty(true);
    toast.success(
      from === 'desktop'
        ? 'Đã copy Desktop → Mobile'
        : 'Đã copy Mobile → Desktop'
    );
  };

  /**
   * Persist a new element order array for the active block + active variant.
   * Triggered by drag-end in LayersPanel. CSS `order` on each element div
   * makes the reorder visible on the canvas.
   */
  const handleReorderElements = (nextOrder: string[]) => {
    if (!activeBlock) return;
    if (device === 'tablet') {
      toast.info(
        'Tablet đang xem layout desktop (read-only). Chuyển Desktop hoặc Mobile để chỉnh sửa.'
      );
      return;
    }
    pushHistory();
    setBlocks(prev =>
      prev.map(b => {
        if (b.id !== activeBlock.id) return b;
        const variants = b.elementOrder ?? { desktop: nextOrder };
        return {
          ...b,
          elementOrder: { ...variants, [editVariant]: nextOrder },
        };
      })
    );
    setDirty(true);
  };

  // Drop the selection when switching blocks so it doesn't bleed across.
  React.useEffect(() => {
    setSelectedElementKey(null);
    setEditingKey(null);
  }, [activeId]);

  // Drop inline edit when switching device or lang — content shape changes.
  React.useEffect(() => {
    setEditingKey(null);
  }, [device, lang]);

  // Selection driven from canvas (BlockPreview). Rect is unused — toolbar
  // is sticky and doesn't need to anchor to the element.
  const handleSelectFromCanvas = React.useCallback((key: string | null) => {
    setSelectedElementKey(key);
  }, []);

  const handleSelectFromSidebar = React.useCallback((key: string | null) => {
    setSelectedElementKey(key);
  }, []);

  const handleToolbarUpdateStyle = (patch: ElementStyle) => {
    if (!selectedElementKey) return;
    handleUpdateElementStyle(selectedElementKey, patch);
  };
  const handleToolbarResetStyle = () => {
    if (!selectedElementKey) return;
    handleResetElementStyle(selectedElementKey);
  };

  // Inline edit (double-click on text element) handlers.
  const handleStartInlineEdit = React.useCallback(
    (key: string) => {
      if (device === 'tablet') {
        toast.info(
          'Tablet đang xem layout desktop (read-only). Chuyển Desktop hoặc Mobile để chỉnh sửa.'
        );
        return;
      }
      setSelectedElementKey(key);
      setEditingKey(key);
    },
    [device]
  );

  const handleCommitInlineEdit = React.useCallback(
    (key: string, value: string) => {
      // Read current content for the active variant + lang.
      const block = blocksRef.current.find(b => b.id === activeIdRef.current);
      if (!block) {
        setEditingKey(null);
        return;
      }
      const langKey = lang === 'vi' ? 'contentVi' : 'contentEn';
      const langContent = block[langKey];
      const current =
        (editVariant === 'mobile' ? langContent.mobile : undefined) ??
        langContent.desktop;
      const cur = current as Record<string, unknown>;
      // No-op when value didn't change → don't push history.
      if (cur[key] === value) {
        setEditingKey(null);
        return;
      }
      pushHistory();
      setBlocks(prev =>
        prev.map(b => {
          if (b.id !== block.id) return b;
          const variants = b[langKey];
          const baseContent =
            (editVariant === 'mobile' ? variants.mobile : undefined) ??
            variants.desktop;
          const nextContent: BlockContent = {
            ...(baseContent as Record<string, unknown>),
            [key]: value,
          } as BlockContent;
          return {
            ...b,
            [langKey]: { ...variants, [editVariant]: nextContent },
          };
        })
      );
      setDirty(true);
      setEditingKey(null);
    },
    [lang, editVariant, pushHistory]
  );

  const handleCancelInlineEdit = React.useCallback(() => {
    setEditingKey(null);
  }, []);

  // ── Publish ─────────────────────────────────────────────────────────────
  const handlePublishToggle = async () => {
    if (!template) return;
    const next: PublishMeta = publish?.published
      ? { ...publish, published: false }
      : {
          published: true,
          shareToken: publish?.shareToken ?? newShareToken(),
          publishedAt: new Date().toISOString(),
        };
    setPublish(next);
    setDirty(true);
    // Save immediately so the share URL is live.
    await new Promise(r => setTimeout(r, 50));
    await doSave({ silent: true });
    toast.success(
      next.published
        ? 'Đã xuất bản — link sẵn sàng chia sẻ'
        : 'Đã ngưng xuất bản'
    );
  };

  const handleRotateShareToken = async () => {
    if (!publish?.published) return;
    const next: PublishMeta = {
      ...publish,
      shareToken: newShareToken(),
      publishedAt: new Date().toISOString(),
    };
    setPublish(next);
    setDirty(true);
    await new Promise(r => setTimeout(r, 50));
    await doSave({ silent: true });
    toast.success('Đã đổi link chia sẻ — link cũ không còn dùng được');
  };

  const [applyingProduct, setApplyingProduct] = React.useState(false);

  const handleApplyProduct = async (product: Product) => {
    if (applyingProduct) return;
    pushHistory();
    setApplyingProduct(true);
    const toastId = toast.loading(
      `AI đang áp dụng "${product.name}" vào canvas…`
    );
    try {
      const res = await rexerApi.ai.canvasApplyProduct(templateId, {
        product_id: product.id,
        lang,
        preserve_user_overrides: true,
        expected_canvas_etag: templateRef.current?.canvas_etag,
      });
      const parsed = parseCanvas(res.canvas_data);
      if (!parsed?.blocks.length) {
        throw new Error('BE returned empty canvas_data');
      }
      setBlocks(parsed.blocks);
      // Move active to the first block of the new layout if current id is gone.
      if (!parsed.blocks.find(b => b.id === activeIdRef.current)) {
        setActiveId(parsed.blocks[0]?.id ?? null);
      }
      setDirty(true);
      const { applied, source } = res;
      toast.success(
        source === 'ai'
          ? `AI rewrote ${applied.blocks_rewritten}/${applied.blocks_total} block · ${applied.image_bindings_replaced} ảnh thay`
          : `Đã áp dụng "${product.name}" (fallback mẫu — BE chưa nối AI)`,
        { id: toastId }
      );
    } catch (err) {
      // BE call failed — fall back to client-side deterministic mapping so
      // user still gets something rather than nothing. Keep the pushHistory
      // entry so undo works either way.
      setBlocks(prev => applyProductToBlocks(prev, product));
      setDirty(true);
      toast.error(
        `AI thất bại (${rxErrorMessage(err)}) — đã fill bằng mapping mặc định`,
        { id: toastId }
      );
    } finally {
      setApplyingProduct(false);
    }
  };

  const handleDuplicate = () => {
    if (!templateRef.current || !blocksRef.current.length) return;
    setDuplicateOpen(true);
  };

  const handleDuplicateConfirm = async (name: string) => {
    const t = templateRef.current;
    const bs = blocksRef.current;
    const aid = activeIdRef.current;
    if (!t || !bs.length || duplicating) return;
    setDuplicating(true);
    try {
      const created = await rexerApi.canvasTemplates.create({
        name,
        width: t.width,
        height: t.height,
        engine: t.engine,
        engine_version: t.engine_version,
        // is_template=false so duplicate shows in "My Template" filter
        // (CanvasTemplateList treats !is_template as user-owned).
        is_template: false,
        // Clone canvas_data — drop publish state so duplicates start unpublished.
        canvas_data: serializeCanvas(
          structuredClone(bs),
          aid ?? undefined,
          undefined
        ) as unknown as Record<string, unknown>,
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

  const handleAdd = (type: BlockType) => {
    pushHistory();
    const created = createBlock(type);
    setBlocks(prev => [...prev, created]);
    setActiveId(created.id);
    setDirty(true);
  };

  const handleRemove = (id: string) => {
    const target = blocks.find(b => b.id === id);
    if (!target) return;
    if (!window.confirm(`Xoá block "${target.name}"?`)) return;
    pushHistory();
    setBlocks(prev => {
      const next = prev.filter(b => b.id !== id);
      if (activeIdRef.current === id) {
        const fallback = next[0]?.id ?? null;
        setActiveId(fallback);
      }
      return next;
    });
    setDirty(true);
  };

  const handleUndo = React.useCallback(() => {
    const prev = undoStackRef.current.pop();
    if (!prev) return;
    redoStackRef.current.push(structuredClone(blocksRef.current));
    if (redoStackRef.current.length > HISTORY_CAP) {
      redoStackRef.current.shift();
    }
    setBlocks(prev);
    setDirty(true);
    setSaveBlocked(false);
    forceHistoryRender();
  }, []);

  const handleRedo = React.useCallback(() => {
    const next = redoStackRef.current.pop();
    if (!next) return;
    undoStackRef.current.push(structuredClone(blocksRef.current));
    if (undoStackRef.current.length > HISTORY_CAP) {
      undoStackRef.current.shift();
    }
    setBlocks(next);
    setDirty(true);
    setSaveBlocked(false);
    forceHistoryRender();
  }, []);

  // Keyboard shortcuts: Cmd/Ctrl+Z = undo, Cmd/Ctrl+Shift+Z or Ctrl+Y = redo,
  // Space = play motion preview. Skip when target is a form input so native
  // field undo / Spacebar typing still works.
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
        handleUndo();
      } else if (meta && ((key === 'z' && e.shiftKey) || key === 'y')) {
        e.preventDefault();
        handleRedo();
      } else if (!meta && (e.code === 'Space' || key === ' ')) {
        e.preventDefault();
        playMotionPreview();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleUndo, handleRedo, playMotionPreview]);

  if (loading) {
    return (
      <div className='flex h-full flex-1 items-center justify-center bg-neutral-100'>
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col bg-neutral-100'>
      <BlockEditorHeader
        blockName={activeBlock?.name ?? '—'}
        blockType={activeBlock?.blockType ?? 'hero_split'}
        lang={lang}
        device={device}
        saving={saving}
        dirty={dirty}
        duplicating={duplicating}
        blockMotion={
          (activeBlock?.motion?.[editVariantForMotion]?.block ??
            null) as MotionConfig | null
        }
        onLangChange={setLang}
        onDeviceChange={setDevice}
        onAi={() =>
          toast.info('Click 1 element trên canvas để mở popup AI riêng')
        }
        onApplyProduct={() => setProductPickerOpen(true)}
        onDuplicate={handleDuplicate}
        onPreview={() => setPreviewing(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onPublish={() => setPublishOpen(true)}
        onChangeBlockMotion={handleChangeBlockMotion}
        onPlayMotionPreview={playMotionPreview}
        canUndo={undoStackRef.current.length > 0}
        canRedo={redoStackRef.current.length > 0}
        isPublished={!!publish?.published}
        isMotionPreviewing={motionPreviewing}
      />

      {loadError && (
        <div className='border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800'>
          Không tải được canvas từ REXER ({loadError}). Đang dùng dữ liệu mẫu —
          lưu sẽ không hoạt động.
        </div>
      )}

      <div className='relative flex min-h-0 flex-1 overflow-hidden'>
        <div className='flex min-w-0 flex-1 flex-col'>
          {activeBlock && (
            <ElementToolbar
              block={activeBlock}
              lang={lang}
              device={device}
              selectedKey={selectedElementKey}
              onClose={() => setSelectedElementKey(null)}
              onContentChange={updateActiveContent}
              onUpdateStyle={handleToolbarUpdateStyle}
              onResetStyle={handleToolbarResetStyle}
              onUpdateBackground={handleUpdateBackground}
              onSyncVariant={syncVariant}
            />
          )}
          {activeBlock ? (
            <BlockPreview
              block={activeBlock}
              lang={lang}
              device={device}
              zoom={zoom}
              selectedElementKey={selectedElementKey}
              editingKey={editingKey}
              onSelectElement={handleSelectFromCanvas}
              onStartInlineEdit={handleStartInlineEdit}
              onCommitInlineEdit={handleCommitInlineEdit}
              onCancelInlineEdit={handleCancelInlineEdit}
              motionMode={motionPreviewing ? 'preview' : 'edit'}
            />
          ) : (
            <EmptyState onAdd={() => setAddOpen(true)} />
          )}
          <BlockTabBar
            blocks={blocks}
            activeId={activeBlock?.id ?? null}
            lang={lang}
            zoom={zoom}
            onSelect={setActiveId}
            onAdd={() => setAddOpen(true)}
            onRemove={handleRemove}
            onReorder={handleReorder}
            onZoomChange={setZoom}
          />
        </div>

        {activeBlock && !layersCollapsed && (
          <BlockEditorSidebar
            block={activeBlock}
            device={device}
            selectedElementKey={selectedElementKey}
            onSelectElement={handleSelectFromSidebar}
            onReorderElements={handleReorderElements}
            onCollapse={() => setLayersCollapsed(true)}
            activeTab={sidebarTab}
            onChangeTab={setSidebarTab}
            blockMotion={
              (activeBlock.motion?.[editVariantForMotion]?.block ??
                null) as MotionConfig | null
            }
            elementMotion={
              selectedElementKey
                ? ((activeBlock.motion?.[editVariantForMotion]?.elements?.[
                    selectedElementKey
                  ] ?? null) as MotionConfig | null)
                : null
            }
            onChangeElementMotion={handleChangeElementMotion}
          />
        )}

        {activeBlock && layersCollapsed && (
          <button
            type='button'
            aria-label='Hiện bảng lớp'
            onClick={() => setLayersCollapsed(false)}
            className='absolute top-3 right-3 z-30 flex size-9 cursor-pointer items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-700 shadow-sm hover:bg-neutral-50'
          >
            <PanelRightOpen className='size-4' />
          </button>
        )}
      </div>

      <AddBlockDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onPick={handleAdd}
      />

      {previewing && (
        <PreviewMode
          blocks={blocks}
          lang={lang}
          onClose={() => setPreviewing(false)}
        />
      )}

      <PublishDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        templateId={templateId}
        publish={publish}
        onTogglePublish={handlePublishToggle}
        onRotateToken={handleRotateShareToken}
      />

      <ProductPickerDialog
        open={productPickerOpen}
        onOpenChange={setProductPickerOpen}
        onPick={handleApplyProduct}
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
    </div>
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
