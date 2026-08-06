'use client';

import { useTranslations } from 'next-intl';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';

import { EditorMinimap } from '@/components/organisms/portal-v2/journeys/editor/EditorMinimap';
import {
  EDGE_CUT,
  EDGE_ON,
  EdgeControls,
  EdgeLayer,
  type EdgePreview,
} from '@/components/organisms/portal-v2/journeys/editor/canvas/EdgeLayer';
import { NodeCard } from '@/components/organisms/portal-v2/journeys/editor/canvas/NodeCard';
import {
  KindFlyout,
  StageAdd,
} from '@/components/organisms/portal-v2/journeys/editor/canvas/StageAdd';
import {
  StageBands,
  StageHeaders,
} from '@/components/organisms/portal-v2/journeys/editor/canvas/StageBands';
import { useFloorGestures } from '@/components/organisms/portal-v2/journeys/editor/useFloorGestures';
import { cn } from '@/lib/cn';
import { entrySourceById } from '@/lib/portal-v2/journeys/constants';
import { floorBounds, journeyEdges } from '@/lib/portal-v2/journeys/editor';
import { nodeById } from '@/lib/portal-v2/journeys/helpers';
import {
  danglingPath,
  edgeKey,
  inAnchor,
  outAnchor,
  routeEdges,
  routeOne,
  type JourneyEdgeRef,
  type Point,
} from '@/lib/portal-v2/journeys/routing';
import {
  BAND_W,
  NODE_W,
  STAGE_MIN,
  slotY,
  stageAt,
  stageCount,
  stagesOf,
  type FloorNumbers,
} from '@/lib/portal-v2/journeys/stages';
import type {
  LensNodeOverlay,
  StageFit,
} from '@/lib/portal-v2/campaigns/subjectLane';
import type {
  Journey,
  JourneyEditorSelection,
  JourneyNode,
  JourneyNodeKind,
} from '@/lib/portal-v2/journeys/types';

/**
 * The editor floor.
 *
 * IT HAS A GEOGRAPHY NOW. Bands, left to right, each one a phase of the funnel;
 * a card lives in a slot inside its band, and dragging it across a border is how
 * it changes phase. The graph underneath is untouched — see `stages.ts` for why
 * that matters and `routing.ts` for what it does to the lines.
 *
 * THREE COORDINATE SYSTEMS, AND THE RULE THAT KEEPS THEM STRAIGHT:
 *   · the FLOOR (pans and zooms) holds content — cards, routes, and the add
 *     button that says where the next card goes;
 *   · the VIEWPORT holds chrome — the band stripes and their headers, the
 *     route controls, the kind menu, the hint, the overview. Chrome that
 *     scaled with the zoom would be unreadable at 40% and absurd at 180%;
 *   · CLIENT coordinates only ever appear inside a pointer handler, and
 *     `toFloor` converts them the moment they arrive.
 *
 * The gestures live in `useFloorGestures` — this file decides what is drawn,
 * that one decides what a pointer means.
 */

export type ViewTransform = {
  /** 1 = 100%. */
  zoom: number;
  panX: number;
  panY: number;
};

export const ZOOM_MIN = 0.4;
export const ZOOM_MAX = 1.8;
export const ZOOM_STEP = 0.1;

export const clampZoom = (zoom: number): number =>
  Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(zoom * 100) / 100));

/**
 * Keep the floor against the edges of the viewport.
 *
 * WITHOUT THIS THE FLOOR CAN BE THROWN AWAY. A canvas that pans without limit
 * lets one flick of the wheel leave the author looking at empty background with
 * no clue which direction the work went — and on a floor whose whole point is
 * columns you can read side by side, that is the one failure that matters.
 *
 * The rule is the same on both axes: the content may never be dragged past an
 * edge it already fits inside. When the floor is SHORTER than the viewport
 * there is nothing to scroll, so it parks against the start; when it is longer,
 * the pan is bounded by its two ends.
 */
export const clampView = (
  view: ViewTransform,
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  viewport: { width: number; height: number }
): ViewTransform => {
  if (!viewport.width || !viewport.height) return view;

  const axis = (min: number, max: number, extent: number, pan: number) => {
    /* `hi` pins the near edge, `lo` the far one. */
    const hi = -min * view.zoom;
    const lo = extent - max * view.zoom;
    return lo > hi ? hi : Math.min(hi, Math.max(lo, pan));
  };

  return {
    zoom: view.zoom,
    panX: axis(bounds.minX, bounds.maxX, viewport.width, view.panX),
    panY: axis(bounds.minY, bounds.maxY, viewport.height, view.panY),
  };
};

type EditorCanvasProps = {
  draft: Journey;
  /** Every figure the floor shows, from one walk. */
  numbers: FloorNumbers;
  selection: JourneyEditorSelection;
  view: ViewTransform;
  /**
   * An updater, not a value: a wheel burst delivers several events before React
   * re-renders, and computing each one from a captured `view` would drop all but
   * the last.
   */
  onViewChange: Dispatch<SetStateAction<ViewTransform>>;
  onSelect: (selection: JourneyEditorSelection) => void;
  lensFitByNodeId?: Record<string, StageFit | null> | null;
  lensOverlayByNodeId?: Record<string, LensNodeOverlay> | null;
  /** Subject lens — view-only for structure (demo `ro = !!S.jed.lens`). */
  readOnly?: boolean;
  /** Live during the drag; `onNodeDrop` is what turns it into one undo step. */
  onNodeDrag: (nodeId: string, x: number, y: number) => void;
  onNodeDrop: (nodeId: string) => void;
  onConnect: (from: string, to: string) => void;
  onCutEdge: (from: string, to: string) => void;
  /** Move one end of an existing route. One step, not a cut plus a connect. */
  onRerouteEdge: (prev: JourneyEdgeRef, next: JourneyEdgeRef) => void;
  onAddNode: (kind: JourneyNodeKind, stage: number) => void;
  onRenameNode: (nodeId: string, name: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  /** Open the shopper view for an experience node. Only offered to linked ones. */
  onPreviewNode: (nodeId: string) => void;
  /** Open the experience picker for a node (link or replace). */
  onPickExperience: (nodeId: string) => void;
  onRenameStage: (index: number, name: string) => void;
  onRemoveStage: (index: number) => void;
  onAddStage: () => void;
};

export const EditorCanvas = ({
  draft,
  numbers,
  selection,
  view,
  onViewChange,
  onSelect,
  lensFitByNodeId = null,
  lensOverlayByNodeId = null,
  readOnly = false,
  onNodeDrag,
  onNodeDrop,
  onConnect,
  onCutEdge,
  onRerouteEdge,
  onAddNode,
  onRenameNode,
  onDuplicateNode,
  onDeleteNode,
  onPreviewNode,
  onPickExperience,
  onRenameStage,
  onRemoveStage,
  onAddStage,
}: EditorCanvasProps) => {
  const t = useTranslations('portalV2.journeys');
  const viewportRef = useRef<HTMLDivElement>(null);

  /** Route under the cursor — reveals its controls without a click. */
  const [hoverEdge, setHoverEdge] = useState<string | null>(null);
  /** Which band's kind menu is open. */
  const [addStage, setAddStage] = useState<number | null>(null);
  /** Measured, because the overview has to know what fraction it is showing. */
  const [size, setSize] = useState({ width: 0, height: 0 });

  const stages = useMemo(() => stagesOf(draft), [draft]);
  const bounds = useMemo(() => floorBounds(draft), [draft]);
  const edges = useMemo(() => journeyEdges(draft), [draft]);
  const routed = useMemo(
    () => routeEdges(draft.nodes, edges),
    [draft.nodes, edges]
  );
  const routedByKey = useMemo(
    () => new Map(routed.map(edge => [edge.key, edge])),
    [routed]
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  /**
   * Every view change goes through here, so there is exactly one place that
   * knows the floor has edges — the wheel, the pan drag, the fit and the
   * overview all share it.
   */
  const applyView = useCallback(
    (update: SetStateAction<ViewTransform>) => {
      onViewChange(prev =>
        clampView(
          typeof update === 'function' ? update(prev) : update,
          bounds,
          size
        )
      );
    },
    [bounds, onViewChange, size]
  );

  /* The zoom buttons and Align live in the top bar and set the view directly,
     without knowing how big the viewport is. Correct them here rather than
     teaching every caller the geometry. */
  useEffect(() => {
    if (!size.width) return;
    const fixed = clampView(view, bounds, size);
    if (fixed.panX === view.panX && fixed.panY === view.panY) return;
    onViewChange(fixed);
  }, [bounds, onViewChange, size, view]);

  /* ── the opening view ──────────────────────────────────────────────────
     Every phase, on screen, once. A floor with a geography is only worth having
     if the author can see the whole shape of the funnel the moment it opens —
     landing at 100% with the last phase off the right edge would hide the one
     thing the columns were added to show. First measurement only; after that
     the view is the author's. */
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current || !size.width) return;
    fitted.current = true;

    const zoom = clampZoom(Math.min(1, size.width / Math.max(bounds.width, 1)));
    applyView({
      zoom,
      panX: -bounds.minX * zoom,
      panY: -bounds.minY * zoom,
    });
  }, [applyView, bounds, size.width]);

  /** Client point → floor point, undoing pan and zoom. */
  const toFloor = useCallback(
    (clientX: number, clientY: number) => {
      const rect = viewportRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: (clientX - rect.left - view.panX) / view.zoom,
        y: (clientY - rect.top - view.panY) / view.zoom,
      };
    },
    [view.panX, view.panY, view.zoom]
  );

  /** Floor point → viewport point, for chrome that must not scale with zoom. */
  const toScreen = useCallback(
    (point: Point) => ({
      left: point.x * view.zoom + view.panX,
      top: point.y * view.zoom + view.panY,
    }),
    [view.panX, view.panY, view.zoom]
  );

  const closeMenu = useCallback(() => setAddStage(null), []);

  const gestures = useFloorGestures({
    draft,
    view,
    toFloor,
    applyView,
    onSelect,
    onNodeDrag,
    onNodeDrop,
    onConnect,
    onCutEdge,
    onRerouteEdge,
    onDismiss: closeMenu,
    readOnly,
  });
  const { link, linkTarget, verdict, busy } = gestures;

  /* ── wheel: zoom under the cursor, or pan ────────────────────────────────
     Non-passive, because both branches have to preventDefault — otherwise the
     page behind the editor scrolls. */
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        const rect = viewport.getBoundingClientRect();
        const pointerX = e.clientX - rect.left;
        const pointerY = e.clientY - rect.top;
        applyView(prev => {
          const zoom = clampZoom(prev.zoom * (e.deltaY > 0 ? 0.92 : 1.08));
          if (zoom === prev.zoom) return prev;
          /* Keep the floor point under the cursor pinned while scaling. */
          const ratio = zoom / prev.zoom;
          return {
            zoom,
            panX: pointerX - (pointerX - prev.panX) * ratio,
            panY: pointerY - (pointerY - prev.panY) * ratio,
          };
        });
        return;
      }

      applyView(prev => ({
        ...prev,
        panX: prev.panX - e.deltaX,
        panY: prev.panY - e.deltaY,
      }));
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [applyView]);

  /** What the card says under its name — the one field its kind lives on. */
  const sublineOf = (node: JourneyNode): { text: string; warn: boolean } => {
    if (node.kind === 'entry') {
      const source = entrySourceById(node.src);
      if (!source) return { text: t('nodeSubNoSource'), warn: true };
      return { text: source.name, warn: false };
    }
    if (node.kind === 'experience') {
      if (!node.xName) return { text: t('nodeSubNoExperience'), warn: true };
      return { text: node.xName, warn: (node.xCoverage ?? 0) === 0 };
    }
    if (node.kind === 'decision') {
      return {
        text: t('branchCount', { count: node.to.length }),
        warn: node.to.length < 2,
      };
    }
    if (!node.via) return { text: t('nodeSubNoSystem'), warn: true };
    return { text: node.via, warn: false };
  };

  const selectedNodeId = selection?.kind === 'node' ? selection.id : null;
  const selectedEdge = selection?.kind === 'edge' ? selection : null;
  const selectedKey = selectedEdge
    ? edgeKey(selectedEdge.from, selectedEdge.to)
    : null;

  /* The route the controls belong to: what is selected, else what is hovered.
     Selection wins so the buttons cannot move out from under the cursor. */
  const activeKey = selectedKey ?? hoverEdge;
  const activeEdge = activeKey ? (routedByKey.get(activeKey) ?? null) : null;
  const selectedRoute = selectedKey
    ? (routedByKey.get(selectedKey) ?? null)
    : null;

  /** The band a dragged card would land in — what the stripe lights up for. */
  const dropStage = useMemo(() => {
    if (!gestures.drag?.moved) return null;
    const node = nodeById(draft, gestures.drag.nodeId);
    if (!node) return null;
    return stageAt(node.px ?? 0, stages.length - 1);
  }, [draft, gestures.drag, stages.length]);

  /* ── the live drag ─────────────────────────────────────────────────── */

  const linkAnchorNode = link ? nodeById(draft, link.anchorId) : null;
  const replacingKey = link?.replacing
    ? edgeKey(link.replacing.from, link.replacing.to)
    : null;

  const preview: EdgePreview | null = (() => {
    if (!link || !linkAnchorNode) return null;

    /* Leave from where the route ACTUALLY leaves, fanned position included, so
       picking a handle up does not make the line jump before it moves. */
    const existing = replacingKey ? routedByKey.get(replacingKey) : null;
    const anchor: Point = existing
      ? link.mode === 'out'
        ? existing.start
        : existing.end
      : link.mode === 'out'
        ? outAnchor(linkAnchorNode)
        : inAnchor(linkAnchorNode);

    const stroke = verdict === 'disconnect' ? EDGE_CUT : EDGE_ON;

    /* Over a card the preview switches to the real orthogonal route: what you
       see while aiming is what gets drawn when you let go. */
    const target = linkTarget ? nodeById(draft, linkTarget) : null;
    if (target && verdict !== 'none') {
      const pair = gestures.pairFor(link, target.id);
      const from = nodeById(draft, pair.from);
      const to = nodeById(draft, pair.to);
      if (from && to) {
        return {
          d: routeOne(from, to).d,
          stroke,
          dashed: false,
          arrow: verdict === 'connect',
        };
      }
    }

    return {
      d: danglingPath(anchor, link.mode === 'out' ? 1 : -1, {
        x: link.x,
        y: link.y,
      }),
      stroke,
      dashed: true,
      arrow: false,
    };
  })();

  const linkHint =
    verdict === 'disconnect'
      ? t('linkHintCut')
      : link?.mode === 'in'
        ? t('linkHintIn')
        : t('linkHint');

  const layerW = Math.max(bounds.maxX, 1);
  const layerH = Math.max(bounds.maxY, 1);
  /* Hit areas are drawn in floor units but have to stay grabbable at 40%. */
  const hitWidth = Math.max(20, 22 / view.zoom);
  const counts = stages.map((_stage, index) => stageCount(draft, index));
  const dropHover = (key: string) =>
    setHoverEdge(current => (current === key ? null : current));

  return (
    <div
      ref={viewportRef}
      role='presentation'
      onPointerDown={gestures.onBackgroundPointerDown}
      className={cn(
        'relative h-full w-full overflow-hidden bg-[var(--pv2-canvas)]',
        'touch-none select-none',
        busy && !link
          ? 'cursor-grabbing'
          : link
            ? 'cursor-crosshair'
            : 'cursor-grab'
      )}
    >
      <StageBands stages={stages} view={view} dropStage={dropStage} />

      {/* The floor keeps its own origin, so a card's px/py IS its position.
          Nothing here clips — the viewport does. */}
      <div
        className='absolute top-0 left-0 origin-top-left'
        style={{
          width: layerW,
          height: layerH,
          transform: `translate(${view.panX}px, ${view.panY}px) scale(${view.zoom})`,
        }}
      >
        <EdgeLayer
          draft={draft}
          routed={routed}
          width={layerW}
          height={layerH}
          selectedKey={selectedKey}
          hoverKey={hoverEdge}
          ghostKey={replacingKey}
          busy={busy}
          hitWidth={hitWidth}
          preview={preview}
          onHover={setHoverEdge}
          onLeave={dropHover}
          onSelect={edge => onSelect({ kind: 'edge', ...edge })}
        />

        {draft.nodes.map(node => (
          <NodeCard
            key={node.id}
            node={node}
            subline={sublineOf(node)}
            selected={node.id === selectedNodeId}
            aiming={Boolean(link) && node.id !== link?.anchorId}
            targeted={node.id === linkTarget}
            verdict={verdict}
            anchored={link?.anchorId === node.id}
            linkMode={link?.mode ?? null}
            reached={numbers.reached.get(node.id) ?? null}
            onPointerDown={e => gestures.onCardPointerDown(node, e)}
            onActivate={() => gestures.onCardActivate(node)}
            onPortDown={(mode, e) => gestures.onPortDown(mode, node, e)}
            onPortArm={mode => gestures.onPortArm(mode, node)}
            onRename={name => onRenameNode(node.id, name)}
            onDuplicate={() => onDuplicateNode(node.id)}
            onDelete={() => onDeleteNode(node.id)}
            onPreview={
              node.kind === 'experience' && node.x
                ? () => onPreviewNode(node.id)
                : undefined
            }
            onPickExperience={
              !readOnly && node.kind === 'experience'
                ? () => onPickExperience(node.id)
                : undefined
            }
            lensFit={lensFitByNodeId?.[node.id] ?? undefined}
            lensOverlay={lensOverlayByNodeId?.[node.id] ?? undefined}
            readOnly={readOnly}
          />
        ))}

        {!readOnly
          ? stages.map((stage, index) => (
              <StageAdd
                key={stage.id}
                stage={index}
                name={stage.name}
                top={slotY(counts[index] ?? 0)}
                open={addStage === index}
                onToggle={setAddStage}
              />
            ))
          : null}
      </div>

      {/* Chrome, over the floor: a header the floor layer covers is a header
          nobody can click. */}
      <StageHeaders
        stages={stages}
        counts={counts}
        pulse={numbers.stages}
        view={view}
        canRemove={!readOnly && stages.length > STAGE_MIN}
        readOnly={readOnly}
        onRename={onRenameStage}
        onRemove={onRemoveStage}
        onAdd={onAddStage}
      />

      {!readOnly ? (
        <EdgeControls
          draft={draft}
          active={busy ? null : activeEdge}
          selected={busy ? null : selectedRoute}
          toScreen={toScreen}
          onHover={setHoverEdge}
          onLeave={dropHover}
          onCut={edge => onCutEdge(edge.from, edge.to)}
          onGrab={gestures.onGrabEnd}
        />
      ) : null}

      {!readOnly && addStage !== null && stages[addStage] ? (
        <KindFlyout
          stage={addStage}
          name={stages[addStage].name}
          at={toScreen({
            x: addStage * BAND_W + (BAND_W - NODE_W) / 2,
            y: slotY(counts[addStage] ?? 0) + 38,
          })}
          onPick={(kind, stage) => {
            onAddNode(kind, stage);
            closeMenu();
          }}
          onClose={closeMenu}
        />
      ) : null}

      {link ? (
        <p
          className='pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 rounded-full px-3 py-1.5 text-[11px] font-medium text-[var(--pv2-paper)]'
          style={{
            top: 56,
            background:
              verdict === 'disconnect' ? 'var(--pv2-error)' : 'var(--pv2-ink)',
          }}
        >
          {linkHint}
        </p>
      ) : null}

      {size.width > 0 ? (
        <EditorMinimap
          draft={draft}
          bounds={bounds}
          view={view}
          viewport={size}
          onViewChange={applyView}
        />
      ) : null}
    </div>
  );
};
