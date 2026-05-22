'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PanelRightOpen } from 'lucide-react';
import { toast } from 'sonner';

import { Spinner } from '@/components/atoms/spinner';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import type { CanvasTemplate } from '@/services/rexer/types';

import { AddBlockDialog } from './block-editor/AddBlockDialog';
import { BlockEditorHeader } from './block-editor/BlockEditorHeader';
import { BlockEditorSidebar } from './block-editor/BlockEditorSidebar';
import { BlockPreview } from './block-editor/BlockPreview';
import { BlockTabBar } from './block-editor/BlockTabBar';
import { DuplicateTemplateDialog } from './block-editor/DuplicateTemplateDialog';
import { SaveBlockDialog } from './block-editor/SaveBlockDialog';
import { ElementToolbar } from './block-editor/ElementToolbar';
import { ImportBlockDialog } from './block-editor/ImportBlockDialog';
import { PreviewMode } from './block-editor/PreviewMode';
import { ProductPickerDialog } from './block-editor/ProductPickerDialog';
import { PublishDialog } from './block-editor/PublishDialog';
import { ReviewChangesDialog } from './block-editor/ReviewChangesDialog';
import { MotionTimelineModal } from './block-editor/motion/timeline/MotionTimelineModal';
import type { BlockMotion } from './block-editor/motion/types';
import { createBlock } from './block-editor/factory';
import {
  parseCanvas,
  seedBlocks,
  serializeCanvas,
} from './block-editor/serialize';
import {
  type BlockBackground,
  type BlockContent,
  type BlockMotionStored,
  type BlockType,
  type ElementStyle,
  type ElementStylesMap,
  type ExtraElementKind,
} from './block-editor/types';
import {
  bringToFront,
  makeExtraElement,
  patchExtraElement,
  sendToBack,
} from './block-editor/extraElements';
import { ExtraElementToolbar } from './block-editor/ExtraElementToolbar';
import { useAiApplyProduct } from './block-editor/hooks/useAiApplyProduct';
import { useAutosave } from './block-editor/hooks/useAutosave';
import { useCanvasState } from './block-editor/hooks/useCanvasState';
import { useDeviceLang } from './block-editor/hooks/useDeviceLang';
import { useElementSelection } from './block-editor/hooks/useElementSelection';
import { useMotionPreview } from './block-editor/hooks/useMotionPreview';
import { usePublishState } from './block-editor/hooks/usePublishState';

interface BlockEditorProps {
  templateId: string;
  /**
   * When set, after canvas loads run `applyProduct(product)` once. Wired
   * from the campaign detail page link `?apply_product=<id>` so user lands
   * on a canvas already merged with their product info.
   */
  autoApplyProductId?: string;
}

// BE `/canvas-templates/{id}/canvas` endpoint is currently slow (~10s even
// for unauth 401 — see GAP-18 in be-issues-master.md). Keep client timeout
// generous until BE adds early auth gating.
const LOAD_TIMEOUT_MS = 15_000;

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

function rxErrorMessage(err: unknown): string {
  if (err instanceof RxApiError) return err.message || err.code;
  if (err instanceof Error) return err.message;
  return 'Lỗi không xác định';
}

export function BlockEditor({
  templateId,
  autoApplyProductId,
}: BlockEditorProps) {
  const router = useRouter();

  // ── Hooks ───────────────────────────────────────────────────────────────
  const [template, setTemplate] = React.useState<CanvasTemplate | null>(null);
  const canvas = useCanvasState();
  const deviceState = useDeviceLang();
  const selection = useElementSelection();
  const motionPreview = useMotionPreview({
    onElementSelect: selection.selectKey,
  });
  const publishState = usePublishState();

  // Autosave — payload built from latest canvas + publish state at save time.
  const autosave = useAutosave({
    templateId,
    version: template?.version,
    enabled: !!template,
    buildPayload: () =>
      serializeCanvas(
        canvas.blocks,
        canvas.activeId ?? undefined,
        publishState.publish
      ),
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
    templateId,
    lang: deviceState.lang,
    getBlocks: () => canvas.blocks,
    getCanvasEtag: () => template?.canvas_etag,
    getActiveId: () => canvas.activeId,
    getPublish: () => publishState.publish,
    applyBlocks: (next, nextActiveId) => canvas.reset(next, nextActiveId),
    markDirty: autosave.markDirty,
  });

  // ── Local UI state (not hook-worthy on its own) ────────────────────────
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
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
  const editingSavedBlockId = searchParams?.get('saved_block_id') ?? undefined;
  const [layersCollapsed, setLayersCollapsed] = React.useState(false);
  const [sidebarTab, setSidebarTab] = React.useState<'layers' | 'motion'>(
    'layers'
  );
  const [motionEditorOpen, setMotionEditorOpen] = React.useState(false);

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
        canvas.reset(initial, parsed?.activeBlockId ?? initial[0]?.id ?? null);
        publishState.setPublish(parsed?.publish);
        // When we fell back to seed (parsed null), persist the seed by marking
        // the canvas dirty so autosave fires after mount.
        if (parsed === null) autosave.markDirty();
      } catch (err) {
        if (cancelled) return;
        setLoadError(rxErrorMessage(err));
        const seeded = seedBlocks();
        canvas.reset(seeded, seeded[0]?.id ?? null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

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

  const updateActiveContent = (next: BlockContent) => {
    if (tabletReadOnly()) return;
    canvas.mutateActive(b => {
      b[langKey] = { ...b[langKey], [editVariant]: next };
    });
    autosave.markDirty();
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

  const handleResetElementStyle = (key: string) => {
    if (deviceState.device === 'tablet') return;
    canvas.mutateActive(b => {
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

  const handleUpdateBackground = (next: BlockBackground | undefined) => {
    if (tabletReadOnly()) return;
    canvas.mutateActive(b => {
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
    key: string,
    pos: { x: number; y: number }
  ) => {
    if (tabletReadOnly()) return;
    canvas.mutateActive(b => {
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
    id: string,
    pos: { x: number; y: number }
  ) => {
    if (tabletReadOnly()) return;
    canvas.mutateActive(b => {
      b.extraElements = (b.extraElements ?? []).map(e =>
        e.id === id ? { ...e, position: pos } : e
      );
    });
    autosave.markDirty();
  };

  const handlePatchExtraElement = (
    id: string,
    patch: Partial<import('./block-editor/types').ExtraElement>
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

  const handleReorderBlocks = (
    next: Parameters<typeof canvas.replaceBlocks>[0]
  ) => {
    canvas.replaceBlocks(next);
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
  // Drop selection when block changes; drop inline edit when device/lang
  // changes (content shape differs across variants).
  React.useEffect(() => {
    selection.selectKey(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas.activeId]);
  React.useEffect(() => {
    selection.endInlineEdit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceState.device, deviceState.lang]);

  const handleStartInlineEdit = (key: string) => {
    if (tabletReadOnly()) return;
    selection.startInlineEdit(key);
  };

  const handleCommitInlineEdit = (key: string, value: string) => {
    const block = canvas.blocks.find(b => b.id === canvas.activeId);
    if (!block) {
      selection.endInlineEdit();
      return;
    }
    const langContent = block[langKey];
    const current =
      (editVariant === 'mobile' ? langContent.mobile : undefined) ??
      langContent.desktop;
    if ((current as Record<string, unknown>)[key] === value) {
      selection.endInlineEdit();
      return;
    }
    canvas.mutateActive(b => {
      const variants = b[langKey];
      const baseContent =
        (editVariant === 'mobile' ? variants.mobile : undefined) ??
        variants.desktop;
      const nextContent: BlockContent = {
        ...(baseContent as Record<string, unknown>),
        [key]: value,
      } as BlockContent;
      b[langKey] = { ...variants, [editVariant]: nextContent };
    });
    autosave.markDirty();
    selection.endInlineEdit();
  };

  // ── Publish ─────────────────────────────────────────────────────────────
  const handlePublishToggle = async () => {
    if (!template) return;
    publishState.togglePublish();
    // Let the publish state flush, then push an immediate save so the share
    // URL is live without waiting for the autosave debounce.
    await new Promise(r => setTimeout(r, 50));
    autosave.markDirty();
    await autosave.flush({ silent: true });
  };

  const handleRotateShareToken = async () => {
    publishState.rotateShareToken();
    await new Promise(r => setTimeout(r, 50));
    autosave.markDirty();
    await autosave.flush({ silent: true });
  };

  // ── Block CRUD ──────────────────────────────────────────────────────────
  const handleAddBlock = (type: BlockType) => {
    const created = createBlock(type);
    canvas.mutate(draft => {
      draft.push(created);
    });
    canvas.setActiveId(created.id);
    autosave.markDirty();
  };

  const handleAddSavedBlock = (block: import('./block-editor/types').Block) => {
    canvas.mutate(draft => {
      draft.push(block);
    });
    canvas.setActiveId(block.id);
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
    autosave.markDirty();
  };

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
        canvas_data: serializeCanvas(
          structuredClone(canvas.blocks),
          canvas.activeId ?? undefined,
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

  // ── Render ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className='flex h-full flex-1 items-center justify-center bg-neutral-100'>
        <Spinner size={28} />
      </div>
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

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col bg-neutral-100'>
      <BlockEditorHeader
        blockName={activeBlock?.name ?? '—'}
        lang={deviceState.lang}
        device={deviceState.device}
        saving={saving}
        dirty={dirty}
        duplicating={duplicating}
        onLangChange={deviceState.setLang}
        onDeviceChange={deviceState.setDevice}
        onAi={() =>
          toast.info('Click 1 element trên canvas để mở popup AI riêng')
        }
        onApplyProduct={() => setProductPickerOpen(true)}
        onImportFromImage={() => setImportOpen(true)}
        onDuplicate={() => setDuplicateOpen(true)}
        onSaveBlock={activeBlock ? () => setSaveBlockOpen(true) : undefined}
        onPreview={() => setPreviewing(true)}
        onUndo={() => {
          canvas.undo();
          autosave.markDirty();
        }}
        onRedo={() => {
          canvas.redo();
          autosave.markDirty();
        }}
        onPublish={() => setPublishOpen(true)}
        onPlayMotionPreview={motionPreview.playBlock}
        onOpenMotionEditor={() => setMotionEditorOpen(true)}
        canUndo={canvas.canUndo}
        canRedo={canvas.canRedo}
        isPublished={!!publishState.publish?.published}
        isMotionPreviewing={motionPreview.previewing}
      />

      {loadError && (
        <div className='border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800'>
          Không tải được canvas từ REXER ({loadError}). Đang dùng dữ liệu mẫu —
          lưu sẽ không hoạt động.
        </div>
      )}

      <div className='relative flex min-h-0 flex-1 overflow-hidden'>
        <div className='flex min-w-0 flex-1 flex-col'>
          {activeBlock && selectedExtraElementId ? (
            (() => {
              const el = activeBlock.extraElements?.find(
                e => e.id === selectedExtraElementId
              );
              if (!el) return null;
              return (
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
              );
            })()
          ) : activeBlock ? (
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
          ) : null}
          {activeBlock ? (
            <BlockPreview
              block={activeBlock}
              lang={deviceState.lang}
              device={deviceState.device}
              zoom={deviceState.zoom}
              selectedElementKey={selection.selectedKey}
              editingKey={selection.editingKey}
              onSelectElement={selection.selectKey}
              onStartInlineEdit={handleStartInlineEdit}
              onCommitInlineEdit={handleCommitInlineEdit}
              onCancelInlineEdit={selection.endInlineEdit}
              onCommitElementPosition={handleCommitElementPosition}
              motionMode={motionPreview.previewing ? 'preview' : 'edit'}
              motionPreviewNonce={motionPreview.nonce}
              motionPreviewElement={motionPreview.previewElement}
              onAutoFitZoom={deviceState.applyAutoFitZoom}
              selectedExtraElementId={selectedExtraElementId}
              onSelectExtraElement={setSelectedExtraElementId}
              onCommitExtraElementPosition={handleCommitExtraElementPosition}
            />
          ) : (
            <EmptyState onAdd={() => setAddOpen(true)} />
          )}
          <BlockTabBar
            blocks={canvas.blocks}
            activeId={activeBlock?.id ?? null}
            lang={deviceState.lang}
            zoom={deviceState.zoom}
            onSelect={canvas.setActiveId}
            onAdd={() => setAddOpen(true)}
            onRemove={handleRemoveBlock}
            onReorder={handleReorderBlocks}
            onZoomChange={deviceState.setZoom}
          />
        </div>

        {activeBlock && !layersCollapsed && (
          <BlockEditorSidebar
            block={activeBlock}
            device={deviceState.device}
            selectedElementKey={selection.selectedKey}
            onSelectElement={selection.selectKey}
            onReorderElements={handleReorderElements}
            onCollapse={() => setLayersCollapsed(true)}
            activeTab={sidebarTab}
            onChangeTab={setSidebarTab}
            motion={motionForActiveVariant}
            onChangeMotion={handleChangeBlockMotion}
            onOpenMotionEditor={() => setMotionEditorOpen(true)}
            onPlayMotionPreview={motionPreview.playBlock}
            onPlayElementPreview={motionPreview.playElement}
            isMotionPreviewing={motionPreview.previewing}
            selectedExtraElementId={selectedExtraElementId}
            onAddExtraElement={handleAddExtraElement}
            onSelectExtraElement={setSelectedExtraElementId}
            onRemoveExtraElement={handleRemoveExtraElement}
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
        onPick={handleAddBlock}
        onPickSaved={handleAddSavedBlock}
      />

      {previewing && (
        <PreviewMode
          blocks={canvas.blocks}
          lang={deviceState.lang}
          onClose={() => setPreviewing(false)}
        />
      )}

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
        templateId={templateId}
        publish={publishState.publish}
        onTogglePublish={handlePublishToggle}
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
          canvas.mutate(draft => {
            draft.push(block);
          });
          canvas.setActiveId(block.id);
          autosave.markDirty();
          toast.success(`Đã thêm block "${block.name}" từ AI`);
        }}
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

      <SaveBlockDialog
        open={saveBlockOpen}
        block={activeBlock ?? null}
        onOpenChange={setSaveBlockOpen}
        editingSavedBlockId={editingSavedBlockId}
      />

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
