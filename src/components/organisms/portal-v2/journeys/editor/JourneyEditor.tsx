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
  JourneyNodeKind,
  JourneyNodePatch,
  JourneyStage,
} from '@/lib/portal-v2/journeys/types';
import type { ExperienceObjective } from '@/lib/portal-v2/experiences/types';

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
  onSave: (next: Journey) => void;
};

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  );
};

export const JourneyEditor = ({
  journey,
  journeys,
  onCancel,
  onSave,
}: JourneyEditorProps) => {
  const t = useTranslations('portalV2.journeys');
  const {
    draft,
    apply,
    applyLive,
    commit,
    undo,
    redo,
    canUndo,
    canRedo,
    isDirty,
  } = useJourneyDraft(journey);

  const [selection, setSelection] = useState<JourneyEditorSelection>(null);
  const [view, setView] = useState<ViewTransform>({
    zoom: 1,
    panX: 0,
    panY: 0,
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [framesOpen, setFramesOpen] = useState(false);

  const selectedNodeId = selection?.kind === 'node' ? selection.id : null;
  const selectedNode = selectedNodeId ? nodeById(draft, selectedNodeId) : null;

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

  const handleSave = useCallback(() => {
    onSave({ ...draft, updated: 'just now' });
  }, [draft, onSave]);

  /* ── shortcuts ─────────────────────────────────────────────────────────
     Skipped while a field has focus (Delete belongs to the text there, Cmd+Z to
     the input's own undo) and while a dialog owns the screen. */
  useEffect(() => {
    if (pickerOpen || discardOpen || framesOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      const meta = e.metaKey || e.ctrlKey;

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

      if (e.key === 'Escape') {
        if (selection) {
          setSelection(null);
          return;
        }
        handleClose();
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
    pickerOpen,
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

  return (
    <div className='fixed inset-0 z-[calc(var(--pv2-z-top)+20)] flex flex-col bg-[var(--pv2-canvas)]'>
      {/* ── top bar ─────────────────────────────────────────────────── */}
      <header className='flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-3 py-2.5'>
        <button
          type='button'
          aria-label={t('cancel')}
          title={t('cancel')}
          onClick={handleClose}
          className='grid size-8 shrink-0 cursor-pointer place-items-center rounded-[var(--pv2-r)] text-[var(--pv2-mut)] hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)] focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
        >
          <X className='size-4' strokeWidth={2} aria-hidden />
        </button>

        <div className='min-w-0 flex-1'>
          <input
            value={draft.name}
            onChange={e =>
              applyLive(updateMeta(draft, { name: e.target.value }))
            }
            onBlur={commit}
            aria-label={t('overName')}
            className={cn(
              'w-full max-w-[420px] min-w-0 truncate rounded-[8px] border border-transparent bg-transparent px-1.5 py-0.5',
              'font-[family-name:var(--pv2-disp)] text-[15px] font-bold tracking-[-0.02em] text-[var(--pv2-ink)]',
              'hover:border-[var(--pv2-hair)] focus:border-[var(--pv2-electric)] focus:outline-none'
            )}
          />
          <p className='truncate px-1.5 text-[11px] text-[var(--pv2-faint)]'>
            {draft.template
              ? t('subBlueprint')
              : t('subCopy', { home: journeyHome(draft) })}
          </p>
        </div>

        <div className='flex shrink-0 items-center gap-0.5 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] px-0.5 py-0.5'>
          <button
            type='button'
            aria-label={t('editorUndo')}
            title={t('editorUndo')}
            disabled={!canUndo}
            onClick={undo}
            className='grid size-7 cursor-pointer place-items-center rounded-[6px] text-[var(--pv2-mut)] hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)] focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40'
          >
            <Undo2 className='size-3.5' strokeWidth={2.2} aria-hidden />
          </button>
          <button
            type='button'
            aria-label={t('editorRedo')}
            title={t('editorRedo')}
            disabled={!canRedo}
            onClick={redo}
            className='grid size-7 cursor-pointer place-items-center rounded-[6px] text-[var(--pv2-mut)] hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)] focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40'
          >
            <Redo2 className='size-3.5' strokeWidth={2.2} aria-hidden />
          </button>
        </div>

        <div className='flex shrink-0 items-center gap-0.5 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] px-0.5 py-0.5'>
          <button
            type='button'
            aria-label={t('editorZoomOut')}
            title={t('editorZoomOut')}
            onClick={() => setZoom(view.zoom - ZOOM_STEP)}
            className='grid size-7 cursor-pointer place-items-center rounded-[6px] text-[var(--pv2-mut)] hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)] focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
          >
            <Minus className='size-3.5' strokeWidth={2.4} aria-hidden />
          </button>
          <button
            type='button'
            onClick={resetView}
            title={t('editorZoomReset')}
            className='min-w-[42px] cursor-pointer rounded-[6px] px-1 text-[11px] font-semibold text-[var(--pv2-mut)] tabular-nums hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)] focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
          >
            {Math.round(view.zoom * 100)}%
          </button>
          <button
            type='button'
            aria-label={t('editorZoomIn')}
            title={t('editorZoomIn')}
            onClick={() => setZoom(view.zoom + ZOOM_STEP)}
            className='grid size-7 cursor-pointer place-items-center rounded-[6px] text-[var(--pv2-mut)] hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)] focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:outline-none'
          >
            <Plus className='size-3.5' strokeWidth={2.4} aria-hidden />
          </button>
        </div>

        <Button
          variant='ghost'
          size='sm'
          onClick={() => setFramesOpen(true)}
          title={t('frameworkSubtitle')}
        >
          <Columns3 className='size-3.5' strokeWidth={2.2} aria-hidden />
          {t('frameworkOpen')}
        </Button>

        <Button
          variant='ghost'
          size='sm'
          onClick={() => {
            const tidy = tidyLayout(draft);
            apply(tidy);
            const bounds = floorBounds(tidy);
            setView({ zoom: 1, panX: -bounds.minX, panY: -bounds.minY });
          }}
          title={t('editorTidyHint')}
        >
          <LayoutGrid className='size-3.5' strokeWidth={2.2} aria-hidden />
          {t('editorTidy')}
        </Button>

        <span
          className='shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold tabular-nums'
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

        <Button size='sm' disabled={!isDirty} onClick={handleSave}>
          {t('editorSave')}
        </Button>
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
            onSelect={setSelection}
            onNodeDrag={handleNodeDrag}
            onNodeDrop={handleNodeDrop}
            onConnect={handleConnect}
            onCutEdge={handleCutEdge}
            onRerouteEdge={handleRerouteEdge}
            onAddNode={handleAdd}
            onRenameNode={handleRenameNode}
            onDuplicateNode={handleDuplicate}
            onDeleteNode={handleDelete}
            onRenameStage={handleRenameStage}
            onRemoveStage={handleRemoveStage}
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
            onDuplicateNode={() =>
              selectedNodeId && handleDuplicate(selectedNodeId)
            }
            onDeleteNode={() => selectedNodeId && handleDelete(selectedNodeId)}
            onMetaPatch={handleMetaPatch}
            onMetaSelect={handleMetaSelect}
          />
          <EditorChecks
            draft={draft}
            onSelectNode={id => setSelection({ kind: 'node', id })}
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
              <Button variant='danger' size='sm' onClick={onCancel}>
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
