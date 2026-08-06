'use client';

import {
  Columns3,
  LayoutGrid,
  Minus,
  Plus,
  Redo2,
  Undo2,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/molecules/portal-v2/Button';
import { Modal } from '@/components/molecules/portal-v2/Modal';
import { ExchangePreviewShell } from '@/components/organisms/portal-v2/exchange/ExchangePreviewShell';
import {
  EditorCanvas,
  ZOOM_STEP,
  clampZoom,
  type ViewTransform,
} from '@/components/organisms/portal-v2/journeys/editor/EditorCanvas';
import { EditorChecks } from '@/components/organisms/portal-v2/journeys/editor/EditorChecks';
import { EditorInspector } from '@/components/organisms/portal-v2/journeys/editor/EditorInspector';
import { ExperiencePickerModal } from '@/components/organisms/portal-v2/journeys/editor/ExperiencePickerModal';
import { StageFrameworkModal } from '@/components/organisms/portal-v2/journeys/editor/StageFrameworkModal';
import { useJourneyDraft } from '@/components/organisms/portal-v2/journeys/editor/useJourneyDraft';
import { cn } from '@/lib/cn';
import {
  GRID,
  addNodeToStage,
  addStage,
  applyStageTemplate,
  floorBounds,
  changeNodeKind,
  connectNodes,
  cutEdge,
  deleteNode,
  dropNode,
  duplicateNode,
  linkExperience,
  moveNode,
  removeStage,
  renameStage,
  rerouteEdge,
  setEntrySource,
  tidyLayout,
  unlinkExperience,
  updateMeta,
  updateNode,
} from '@/lib/portal-v2/journeys/editor';
import type { PreviewItem } from '@/lib/portal-v2/preview/types';
import type { JourneyEdgeRef } from '@/lib/portal-v2/journeys/routing';
import { floorNumbers, stagesOf } from '@/lib/portal-v2/journeys/stages';
import {
  journeyHome,
  journeyReadiness,
  nodeById,
} from '@/lib/portal-v2/journeys/helpers';
import type {
  Journey,
  JourneyEditorSelection,
  JourneyExperienceLink,
  JourneyNode,
  JourneyNodeKind,
  JourneyNodePatch,
  JourneyStage,
} from '@/lib/portal-v2/journeys/types';
import type { ExperienceObjective } from '@/lib/portal-v2/experiences/types';
import { fetchExperienceLibrary } from '@/services/portal-v2/experienceLibrary';
import type {
  CampaignSubjectLens,
  LensNodeOverlay,
  StageFit,
} from '@/lib/portal-v2/campaigns/subjectLane';

/**
 * The Journey editor — full screen, one journey, one draft.
 *
 * IT EDITS A CLONE (see `useJourneyDraft`). The workspace's record cannot change
 * while this is open; Save writes back, Cancel discards. A copy edited here
 * never touches its blueprint, and a blueprint edited here never reaches the
 * copies already forked from it — the same ownership rule the rest of the module
 * keeps, stated in the Save toast so it is impossible to be surprised by.
 */

type JourneyEditorProps = {
  journey: Journey;
  /**
   * The whole library. A blueprint has never run, so the figures on its bands
   * are rolled up from the copies forked out of it — which means the editor
   * cannot derive a single number from the journey in front of it alone.
   */
  journeys: Journey[];
  onCancel: () => void;
  /** Quiet write-back (autosave / discard restore). No alert, no close. */
  onPersist: (next: Journey) => void;
  /** Explicit save: persist + alert JSON (no API yet) + close. */
  onSave: (next: Journey) => void;
  /** Product lens — the route read for one campaign subject (demo `S.jed.lens`). */
  lens?: CampaignSubjectLens;
  /** Pre-select a node when the lens opens (from a jcell dot). */
  initialNodeId?: string | null;
  returnLabel?: string;
  onLensNodeActivate?: (nodeId: string) => void;
  /**
   * Leave subject-lens view-only and edit the shared route (demo `jedlens:edit`).
   * Structural changes affect every subject on the campaign.
   */
  onEditJourney?: () => void;
};

const AUTOSAVE_MS = 1500;

type AutosaveStatus = 'idle' | 'dirty' | 'saving' | 'saved';

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  );
};

const toolBtnClass = cn(
  'grid size-7 cursor-pointer place-items-center rounded-full',
  'text-[var(--pv2-mut)] transition-colors',
  'hover:bg-[var(--pv2-paper)] hover:text-[var(--pv2-ink)]',
  'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none',
  'disabled:pointer-events-none disabled:opacity-35'
);

export const JourneyEditor = ({
  journey,
  journeys,
  onCancel,
  onPersist,
  onSave,
  lens,
  initialNodeId = null,
  returnLabel,
  onLensNodeActivate,
  onEditJourney,
}: JourneyEditorProps) => {
  const t = useTranslations('portalV2.journeys');
  const tCamp = useTranslations('portalV2.campaigns');
  /** Demo `ro = !!S.jed.lens` — structure is view-only under a subject lens. */
  const lensReadOnly = Boolean(lens);
  const {
    draft,
    apply,
    applyLive,
    commit,
    markAutosaved,
    opened,
    undo,
    redo,
    canUndo,
    canRedo,
    isDirty,
  } = useJourneyDraft(journey);

  const [selection, setSelection] = useState<JourneyEditorSelection>(() =>
    initialNodeId ? { kind: 'node', id: initialNodeId } : null
  );
  const [view, setView] = useState<ViewTransform>({
    zoom: 1,
    panX: 0,
    panY: 0,
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [framesOpen, setFramesOpen] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>('idle');

  /* ── the shopper view ──────────────────────────────────────────────────
     An experience node names a page; it never showed one. The same shell the
     Experiences workspace opens now opens over the editor, so what a stage
     actually looks like is one click from the card that plans it. */
  const [previewNodeId, setPreviewNodeId] = useState<string | null>(null);
  /**
   * Slugs the library answered for links that carry none of their own — a page
   * that had no public slug when it was picked and has one now. Keyed by
   * experience id and kept for the session: one round-trip per page at most.
   */
  const [foundSlugs, setFoundSlugs] = useState<Record<string, string>>({});
  const [slugPending, setSlugPending] = useState(false);

  const selectedNodeId = selection?.kind === 'node' ? selection.id : null;
  const selectedNode = selectedNodeId ? nodeById(draft, selectedNodeId) : null;

  /** What `/p/{slug}` this node points at, or nothing — the one place that decides. */
  const slugOf = useCallback(
    (node: JourneyNode | null): string | null => {
      if (!node || node.kind !== 'experience') return null;
      return node.xSlug ?? (node.x ? (foundSlugs[node.x] ?? null) : null);
    },
    [foundSlugs]
  );

  /* The editor owns the viewport while it is open. */
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  /** Leaving with unsaved work asks first; leaving with none just leaves. */
  const handleClose = useCallback(() => {
    if (isDirty) {
      setDiscardOpen(true);
      return;
    }
    onCancel();
  }, [isDirty, onCancel]);

  const handleDiscardLeave = useCallback(() => {
    onPersist(opened);
    setDiscardOpen(false);
    onCancel();
  }, [onPersist, opened, onCancel]);

  const handleSave = useCallback(() => {
    onSave({ ...draft, updated: 'just now' });
  }, [draft, onSave]);

  /* Debounced quiet write-back. Manual Save still alerts JSON + closes. */
  useEffect(() => {
    if (!isDirty) return;

    setAutosaveStatus('dirty');
    const timer = window.setTimeout(() => {
      setAutosaveStatus('saving');
      const next = { ...draft, updated: 'just now' };
      onPersist(next);
      markAutosaved(next);
      setAutosaveStatus('saved');
    }, AUTOSAVE_MS);

    return () => window.clearTimeout(timer);
  }, [draft, isDirty, onPersist, markAutosaved]);

  /* ── shortcuts ─────────────────────────────────────────────────────────
     Skipped while a field has focus (Delete belongs to the text there, Cmd+Z to
     the input's own undo) and while a dialog owns the screen. */
  useEffect(() => {
    if (pickerOpen || discardOpen || framesOpen || previewNodeId) return;

    const handleKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      const meta = e.metaKey || e.ctrlKey;

      if (e.key === 'Escape') {
        if (selection) {
          setSelection(null);
          return;
        }
        handleClose();
        return;
      }

      /* Subject lens: select and leave only — no structural shortcuts. */
      if (lensReadOnly) return;

      if (meta && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }

      if (meta && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selection?.kind === 'node') {
          e.preventDefault();
          apply(deleteNode(draft, selection.id));
          setSelection(null);
          return;
        }
        if (selection?.kind === 'edge') {
          e.preventDefault();
          apply(cutEdge(draft, selection.from, selection.to));
          setSelection(null);
        }
        return;
      }

      /* Arrow keys nudge the selected node — the keyboard's drag, and undone the
         same way: live while held, one step once released. */
      if (selection?.kind === 'node' && e.key.startsWith('Arrow')) {
        const node = nodeById(draft, selection.id);
        if (!node) return;
        e.preventDefault();
        const step = e.shiftKey ? GRID * 4 : GRID;
        const dx =
          e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy =
          e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        applyLive(
          moveNode(draft, node.id, (node.px ?? 0) + dx, (node.py ?? 0) + dy)
        );
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (lensReadOnly) return;
      if (!e.key.startsWith('Arrow')) return;
      /* The nudge lands in a slot, exactly like a drag does — which makes the
         arrow keys a way to reorder a column and to move a card to the next
         phase, not just a way to shift it eight pixels. */
      if (selection?.kind === 'node') apply(dropNode(draft, selection.id));
      else commit();
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    apply,
    applyLive,
    commit,
    discardOpen,
    draft,
    framesOpen,
    handleClose,
    handleSave,
    lensReadOnly,
    pickerOpen,
    previewNodeId,
    redo,
    selection,
    undo,
  ]);

  /* ── graph verbs ───────────────────────────────────────────────────── */

  const handleAdd = useCallback(
    (kind: JourneyNodeKind, stage: number) => {
      const result = addNodeToStage(draft, kind, stage, selectedNodeId);
      apply(result.journey);
      setSelection({ kind: 'node', id: result.nodeId });
    },
    [apply, draft, selectedNodeId]
  );

  const handleConnect = useCallback(
    (from: string, to: string) => {
      const next = connectNodes(draft, from, to);
      if (next) apply(next);
    },
    [apply, draft]
  );

  const handleCutEdge = useCallback(
    (from: string, to: string) => {
      apply(cutEdge(draft, from, to));
      setSelection(null);
    },
    [apply, draft]
  );

  /** Dragging one end of a route onto another node. One step, not two. */
  const handleRerouteEdge = useCallback(
    (prev: JourneyEdgeRef, next: JourneyEdgeRef) => {
      const moved = rerouteEdge(draft, prev, next);
      if (!moved) return;
      apply(moved);
      /* Follow the route to where it landed — the selection is what carries the
         handles, and losing it would mean hunting for the line again. */
      setSelection({ kind: 'edge', from: next.from, to: next.to });
    },
    [apply, draft]
  );

  const handleNodeDrag = useCallback(
    (nodeId: string, x: number, y: number) => {
      applyLive(moveNode(draft, nodeId, x, y));
    },
    [applyLive, draft]
  );

  /** The drop: phase from x, rank from y, both bands re-flow. One undo step. */
  const handleNodeDrop = useCallback(
    (nodeId: string) => {
      apply(dropNode(draft, nodeId));
    },
    [apply, draft]
  );

  const handleRenameNode = useCallback(
    (nodeId: string, name: string) => {
      apply(updateNode(draft, nodeId, { name }));
    },
    [apply, draft]
  );

  const handleDuplicate = useCallback(
    (nodeId: string) => {
      const result = duplicateNode(draft, nodeId);
      if (!result) return;
      apply(result.journey);
      setSelection({ kind: 'node', id: result.nodeId });
    },
    [apply, draft]
  );

  const handleDelete = useCallback(
    (nodeId: string) => {
      apply(deleteNode(draft, nodeId));
      setSelection(null);
    },
    [apply, draft]
  );

  /* ── phase verbs ───────────────────────────────────────────────────── */

  const handleRenameStage = useCallback(
    (index: number, name: string) => {
      apply(renameStage(draft, index, name));
    },
    [apply, draft]
  );

  const handleAddStage = useCallback(() => {
    apply(addStage(draft));
  }, [apply, draft]);

  /** Refuses rather than cascades — a phase holding cards is not the `✕`'s call. */
  const handleRemoveStage = useCallback(
    (index: number) => {
      const next = removeStage(draft, index);
      if (!next) {
        toast.error(t('stageRemoveBlocked'));
        return;
      }
      apply(next);
    },
    [apply, draft, t]
  );

  const handleApplyTemplate = useCallback(
    (stages: JourneyStage[]) => {
      apply(applyStageTemplate(draft, stages));
    },
    [apply, draft]
  );

  /* ── field verbs ───────────────────────────────────────────────────── */

  const handlePatch = useCallback(
    (patch: JourneyNodePatch) => {
      if (!selectedNodeId) return;
      applyLive(updateNode(draft, selectedNodeId, patch));
    },
    [applyLive, draft, selectedNodeId]
  );

  const handleKindChange = useCallback(
    (kind: JourneyNodeKind) => {
      if (!selectedNodeId) return;
      apply(changeNodeKind(draft, selectedNodeId, kind));
    },
    [apply, draft, selectedNodeId]
  );

  const handleSourceChange = useCallback(
    (sourceId: string) => {
      if (!selectedNodeId) return;
      apply(setEntrySource(draft, selectedNodeId, sourceId));
    },
    [apply, draft, selectedNodeId]
  );

  const handlePick = useCallback(
    (link: JourneyExperienceLink) => {
      if (!selectedNodeId) return;
      apply(linkExperience(draft, selectedNodeId, link));
      setPickerOpen(false);
    },
    [apply, draft, selectedNodeId]
  );

  const handleUnlink = useCallback(() => {
    if (!selectedNodeId) return;
    apply(unlinkExperience(draft, selectedNodeId));
  }, [apply, draft, selectedNodeId]);

  const handlePickExperience = useCallback((nodeId: string) => {
    setSelection({ kind: 'node', id: nodeId });
    setPickerOpen(true);
  }, []);

  /* ── preview verbs ─────────────────────────────────────────────────────
     The shell opens on a slug. A link made through the picker carries one, so
     the common path is synchronous; an older link asks the library once, and
     says so plainly when the page it names is no longer published. */
  const handlePreviewNode = useCallback(
    (nodeId: string) => {
      const node = nodeById(draft, nodeId);
      if (!node || node.kind !== 'experience' || !node.x) return;

      if (slugOf(node)) {
        setPreviewNodeId(nodeId);
        return;
      }

      const experienceId = node.x;
      setSlugPending(true);
      void fetchExperienceLibrary()
        .then(({ items }) => {
          const match = items.find(item => item.id === experienceId);
          if (!match?.slug || match.externalUrl) {
            toast.error(t('previewExperienceUnavailable'));
            return;
          }
          setFoundSlugs(prev => ({ ...prev, [experienceId]: match.slug! }));
          setPreviewNodeId(nodeId);
        })
        .finally(() => setSlugPending(false));
    },
    [draft, slugOf, t]
  );

  const previewNode = previewNodeId ? nodeById(draft, previewNodeId) : null;

  /** A node reads as a `PreviewItem` by its id, so stepping lands back on a card. */
  const toPreviewItem = useCallback(
    (node: JourneyNode): PreviewItem | null => {
      const slug = slugOf(node);
      if (!slug) return null;
      return {
        id: node.id,
        name: node.xName ?? node.name,
        source: 'page',
        slug,
        kindLabel: t('previewExperienceKind'),
        evidence: node.stats
          ? { sessions: node.stats.sessions, lift: node.stats.lift }
          : null,
      };
    },
    [slugOf, t]
  );

  /* Prev / Next walks this journey's own experiences — the stages either side of
     the one on screen, not an unrelated library page. */
  const previewNeighbors = useMemo(
    () => draft.nodes.flatMap(node => toPreviewItem(node) ?? []),
    [draft.nodes, toPreviewItem]
  );

  const previewItem = previewNode ? toPreviewItem(previewNode) : null;

  /* If the node behind the open preview stops being previewable — unlinked,
     retyped, deleted — the shell goes with it, rather than leaving the editor
     holding a closed preview and the shortcuts it suppresses. */
  useEffect(() => {
    if (previewNodeId && !previewItem) setPreviewNodeId(null);
  }, [previewNodeId, previewItem]);

  const handlePreviewNavigate = useCallback((item: PreviewItem) => {
    setPreviewNodeId(item.id);
  }, []);

  const handleMetaPatch = useCallback(
    (patch: { tagline?: string; summary?: string }) => {
      applyLive(updateMeta(draft, patch));
    },
    [applyLive, draft]
  );

  const handleMetaSelect = useCallback(
    (patch: { obj?: ExperienceObjective; seg?: string }) => {
      apply(updateMeta(draft, patch));
    },
    [apply, draft]
  );

  const setZoom = (next: number) =>
    setView(prev => ({ ...prev, zoom: clampZoom(next) }));

  /**
   * Back to 100%, parked on the graph rather than on the origin. Dragging is
   * unclamped, so coordinate 0,0 is not necessarily where anything is.
   */
  const resetView = useCallback(() => {
    const bounds = floorBounds(draft);
    setView({ zoom: 1, panX: -bounds.minX, panY: -bounds.minY });
  }, [draft]);

  /* Derived every render from the draft, like everywhere else in the module: the
     score in the bar cannot lag behind the graph on screen. */
  const readiness = useMemo(() => journeyReadiness(draft), [draft]);
  const stages = useMemo(() => stagesOf(draft), [draft]);
  /* One walk, read by the band headers and the badges on the cards under them,
     so the two can never disagree. */
  const numbers = useMemo(
    () => floorNumbers(journeys, draft),
    [draft, journeys]
  );

  const lensFitByNodeId = useMemo(() => {
    if (!lens) return null;
    const map: Record<string, StageFit | null> = {};
    for (const node of draft.nodes) {
      const overlay = lens.overlaysByNodeId[node.id];
      map[node.id] = overlay?.state === 'experience' ? overlay.fit : null;
    }
    return map;
  }, [draft.nodes, lens]);

  const lensOverlayByNodeId = useMemo(() => {
    if (!lens) return null;
    const map: Record<string, LensNodeOverlay> = {};
    for (const node of draft.nodes) {
      const overlay = lens.overlaysByNodeId[node.id];
      map[node.id] = overlay ?? {
        state: 'context',
        fit: null,
        ok: false,
        labelKey: null,
      };
    }
    return map;
  }, [draft.nodes, lens]);

  const handleSelect = useCallback((next: JourneyEditorSelection) => {
    setSelection(next);
  }, []);

  const handleLensStageAction = useCallback(() => {
    if (!selectedNodeId || !onLensNodeActivate) return;
    onLensNodeActivate(selectedNodeId);
  }, [onLensNodeActivate, selectedNodeId]);

  const selectedLensFit =
    lens && selectedNodeId && lensFitByNodeId
      ? (lensFitByNodeId[selectedNodeId] ?? null)
      : null;

  return (
    <div className='fixed inset-0 z-[calc(var(--pv2-z-top)+20)] flex flex-col bg-[var(--pv2-canvas)]'>
      {/* ── top bar: identity · tools · commit ──────────────────────── */}
      <header className='flex h-14 shrink-0 items-center gap-4 border-b border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4'>
        {/* Identity */}
        <div className='flex min-w-0 flex-1 items-center gap-2.5'>
          <button
            type='button'
            aria-label={t('cancel')}
            title={t('cancel')}
            onClick={handleClose}
            className='grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-[var(--pv2-mut)] transition-colors hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)] focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
          >
            <X className='size-4' strokeWidth={2} aria-hidden />
          </button>

          <div className='h-6 w-px shrink-0 bg-[var(--pv2-hair)]' aria-hidden />

          <div className='min-w-0'>
            {lensReadOnly ? (
              <p
                className={cn(
                  'w-full max-w-[320px] min-w-0 truncate px-1 py-0',
                  'font-[family-name:var(--pv2-disp)] text-[14px] leading-tight font-bold tracking-[-0.02em] text-[var(--pv2-ink)]'
                )}
              >
                {draft.name}
              </p>
            ) : (
              <input
                value={draft.name}
                onChange={e =>
                  applyLive(updateMeta(draft, { name: e.target.value }))
                }
                onBlur={commit}
                aria-label={t('overName')}
                className={cn(
                  'w-full max-w-[320px] min-w-0 truncate rounded-[6px] border border-transparent bg-transparent px-1 py-0',
                  'font-[family-name:var(--pv2-disp)] text-[14px] leading-tight font-bold tracking-[-0.02em] text-[var(--pv2-ink)]',
                  'hover:bg-[var(--pv2-canvas)] focus:border-[var(--pv2-electric)] focus:bg-[var(--pv2-paper)] focus:outline-none'
                )}
              />
            )}
            <p className='truncate px-1 text-[10.5px] leading-tight text-[var(--pv2-faint)]'>
              {lens
                ? tCamp('journeyLensPill', { name: lens.subjectName })
                : draft.template
                  ? t('subBlueprint')
                  : t('subCopy', { home: journeyHome(draft) })}
            </p>
          </div>

          {lens ? (
            <span className='hidden shrink-0 rounded-full bg-[var(--pv2-electric-soft)] px-2.5 py-1 text-[10.5px] font-semibold text-[var(--pv2-electric)] sm:inline'>
              {tCamp('journeyLensMode')}
            </span>
          ) : null}
        </div>

        {/* Tools: history · zoom · align */}
        <div
          role='toolbar'
          aria-label={t('editCanvas')}
          className='flex h-9 shrink-0 items-center gap-0.5 rounded-full border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)]/60 px-1'
        >
          <button
            type='button'
            aria-label={t('editorUndo')}
            title={t('editorUndo')}
            disabled={lensReadOnly || !canUndo}
            onClick={undo}
            className={toolBtnClass}
          >
            <Undo2 className='size-3.5' strokeWidth={2.2} aria-hidden />
          </button>
          <button
            type='button'
            aria-label={t('editorRedo')}
            title={t('editorRedo')}
            disabled={lensReadOnly || !canRedo}
            onClick={redo}
            className={toolBtnClass}
          >
            <Redo2 className='size-3.5' strokeWidth={2.2} aria-hidden />
          </button>

          <span className='mx-0.5 h-4 w-px bg-[var(--pv2-hair)]' aria-hidden />

          <button
            type='button'
            aria-label={t('editorZoomOut')}
            title={t('editorZoomOut')}
            onClick={() => setZoom(view.zoom - ZOOM_STEP)}
            className={toolBtnClass}
          >
            <Minus className='size-3.5' strokeWidth={2.4} aria-hidden />
          </button>
          <button
            type='button'
            onClick={resetView}
            title={t('editorZoomReset')}
            className='min-w-[40px] cursor-pointer rounded-full px-1.5 py-1 text-[11px] font-semibold text-[var(--pv2-mut)] tabular-nums transition-colors hover:bg-[var(--pv2-paper)] hover:text-[var(--pv2-ink)] focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
          >
            {Math.round(view.zoom * 100)}%
          </button>
          <button
            type='button'
            aria-label={t('editorZoomIn')}
            title={t('editorZoomIn')}
            onClick={() => setZoom(view.zoom + ZOOM_STEP)}
            className={toolBtnClass}
          >
            <Plus className='size-3.5' strokeWidth={2.4} aria-hidden />
          </button>

          <span className='mx-0.5 h-4 w-px bg-[var(--pv2-hair)]' aria-hidden />

          <button
            type='button'
            aria-label={t('editorAlign')}
            title={t('editorAlignHint')}
            disabled={lensReadOnly}
            onClick={() => {
              const aligned = tidyLayout(draft);
              apply(aligned);
              const bounds = floorBounds(aligned);
              setView({ zoom: 1, panX: -bounds.minX, panY: -bounds.minY });
            }}
            className={toolBtnClass}
          >
            <LayoutGrid className='size-3.5' strokeWidth={2.2} aria-hidden />
          </button>
        </div>

        {/* Commit */}
        <div className='flex shrink-0 items-center gap-2'>
          {lensReadOnly && onEditJourney ? (
            <Button
              variant='ghost'
              size='sm'
              onClick={onEditJourney}
              title={tCamp('journeyLensEdit')}
              className='h-8 rounded-full border-transparent px-2.5'
            >
              {tCamp('journeyLensEdit')}
            </Button>
          ) : null}
          {!lensReadOnly ? (
            <>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setFramesOpen(true)}
                title={t('frameworkSubtitle')}
                className='h-8 rounded-full border-transparent px-2.5 text-[var(--pv2-mut)] hover:border-[var(--pv2-hair)] hover:text-[var(--pv2-ink)]'
              >
                <Columns3 className='size-3.5' strokeWidth={2.2} aria-hidden />
                {t('frameworkOpen')}
              </Button>
              <span
                className='rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums'
                title={t('tabReady')}
                style={{
                  background:
                    readiness.score >= 80
                      ? 'color-mix(in srgb, var(--pv2-success) 14%, transparent)'
                      : readiness.score >= 50
                        ? 'color-mix(in srgb, var(--pv2-warning) 18%, transparent)'
                        : 'color-mix(in srgb, var(--pv2-error) 12%, transparent)',
                  color:
                    readiness.score >= 80
                      ? '#0e9d6e'
                      : readiness.score >= 50
                        ? '#b45309'
                        : '#9a2436',
                }}
              >
                {t('readyScore', { score: readiness.score })}
              </span>
              {autosaveStatus !== 'idle' ? (
                <span
                  className={cn(
                    'min-w-[4.5rem] text-right text-[11px] tabular-nums',
                    autosaveStatus === 'saved'
                      ? 'text-[var(--pv2-faint)]'
                      : 'text-[var(--pv2-mut)]'
                  )}
                  aria-live='polite'
                >
                  {autosaveStatus === 'dirty'
                    ? t('editorAutosavePending')
                    : autosaveStatus === 'saving'
                      ? t('editorAutosaveSaving')
                      : t('editorAutosaveSaved')}
                </span>
              ) : null}
              <Button
                size='sm'
                disabled={autosaveStatus === 'idle' && !isDirty}
                onClick={handleSave}
              >
                {t('editorSave')}
              </Button>
            </>
          ) : (
            <Button size='sm' onClick={handleClose}>
              {returnLabel ?? t('cancel')}
            </Button>
          )}
        </div>
      </header>

      {/* ── body ────────────────────────────────────────────────────── */}
      <div className='flex min-h-0 flex-1'>
        <div className='min-h-0 min-w-0 flex-1'>
          <EditorCanvas
            draft={draft}
            numbers={numbers}
            selection={selection}
            view={view}
            onViewChange={setView}
            onSelect={handleSelect}
            lensFitByNodeId={lensFitByNodeId}
            lensOverlayByNodeId={lensOverlayByNodeId}
            readOnly={lensReadOnly}
            onNodeDrag={handleNodeDrag}
            onNodeDrop={handleNodeDrop}
            onConnect={handleConnect}
            onCutEdge={handleCutEdge}
            onRerouteEdge={handleRerouteEdge}
            onAddNode={handleAdd}
            onRenameNode={handleRenameNode}
            onDuplicateNode={handleDuplicate}
            onDeleteNode={handleDelete}
            onPreviewNode={handlePreviewNode}
            onPickExperience={handlePickExperience}
            onRenameStage={handleRenameStage}
            onRemoveStage={handleRemoveStage}
            onAddStage={handleAddStage}
          />
        </div>

        <aside className='flex h-full min-h-0 w-[276px] shrink-0 flex-col border-l border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
          <EditorInspector
            draft={draft}
            node={selectedNode}
            onPatch={handlePatch}
            onCommit={commit}
            onKindChange={handleKindChange}
            onSourceChange={handleSourceChange}
            onPickExperience={() => setPickerOpen(true)}
            onUnlinkExperience={handleUnlink}
            onPreviewExperience={() =>
              selectedNodeId && handlePreviewNode(selectedNodeId)
            }
            previewPending={slugPending}
            onDuplicateNode={() =>
              selectedNodeId && handleDuplicate(selectedNodeId)
            }
            onDeleteNode={() => selectedNodeId && handleDelete(selectedNodeId)}
            onMetaPatch={handleMetaPatch}
            onMetaSelect={handleMetaSelect}
            lensFit={selectedLensFit}
            onLensStageAction={
              lens && onLensNodeActivate ? handleLensStageAction : undefined
            }
            lensReadOnly={lensReadOnly}
          />
          <EditorChecks
            draft={draft}
            onSelectNode={id => handleSelect({ kind: 'node', id })}
          />
        </aside>
      </div>

      {framesOpen ? (
        <StageFrameworkModal
          draft={draft}
          stages={stages}
          onClose={() => setFramesOpen(false)}
          onApply={handleApplyTemplate}
          onRename={handleRenameStage}
          onAdd={handleAddStage}
          onRemove={handleRemoveStage}
        />
      ) : null}

      {/* Over the editor, not instead of it: closing puts the planner back on
          the same card, with the draft untouched. */}
      <ExchangePreviewShell
        open={previewItem !== null}
        listing={previewItem}
        neighbors={previewNeighbors}
        onClose={() => setPreviewNodeId(null)}
        onNavigate={handlePreviewNavigate}
      />

      {pickerOpen && selectedNode ? (
        <ExperiencePickerModal
          currentId={selectedNode.x ?? null}
          onClose={() => setPickerOpen(false)}
          onPick={handlePick}
        />
      ) : null}

      {discardOpen ? (
        <Modal
          open
          onClose={() => setDiscardOpen(false)}
          title={t('editorDiscardTitle')}
          subtitle={draft.name}
          footer={
            <>
              <span className='flex-1' />
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setDiscardOpen(false)}
              >
                {t('editorDiscardKeep')}
              </Button>
              <Button variant='danger' size='sm' onClick={handleDiscardLeave}>
                {t('editorDiscardLeave')}
              </Button>
            </>
          }
        >
          <p className='text-[13.5px] leading-relaxed text-[var(--pv2-slate-500)]'>
            {t('editorDiscardBody')}
          </p>
        </Modal>
      ) : null}
    </div>
  );
};
