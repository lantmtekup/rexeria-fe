'use client';

/**
 * Figma-style stats annotation overlay for landing pages.
 *
 * Wraps the rendered page; when enabled (toggle + logged-in user), measures
 * each `[data-block-id]` and `[data-element-id]` descendant via ResizeObserver
 * and renders one summary card per block in the LEFT gutter + one per element
 * (≥ ELEMENT_VIEWS_THRESHOLD) in the RIGHT gutter, connected by an SVG leader
 * line. Stats fetched from `rexerApi.templateAnalytics.breakdown`.
 *
 * Persistence: toggle state + date range stored in localStorage. Overlay is
 * zero-cost when OFF (renders nothing, doesn't measure).
 *
 * Permission: visible to ANY logged-in user (admin / staff / client_user).
 * The BE breakdown endpoint is still admin-gated, so for client_user we
 * surface a "BE pending" banner instead of data until wave 2 W2.1 ships
 * `/portal/templates/{id}/breakdown` (see `docs/be-missing-apis-phase1-wave2.md`).
 */

import * as React from 'react';
import { BarChart3, Eye, EyeOff, MousePointerClick, Timer } from 'lucide-react';

import { useAppSelector } from '@/hooks/useRedux';
import { rexerApi } from '@/services/rexer/endpoints';
import type { ActionStat, BlockBreakdownRow } from '@/services/rexer/types';

const ELEMENT_VIEWS_THRESHOLD = 50;
const STORAGE_KEY = 'rexer.statsOverlay.enabled';
const RANGE_KEY = 'rexer.statsOverlay.range';
const GUTTER_WIDTH = 220; // px reserved each side for cards
const MIN_VIEWPORT = 1280; // below this we fold into a side panel (not yet)

type DateRange = '7d' | '30d' | '90d' | 'all';

const RANGE_LABEL: Record<DateRange, string> = {
  '7d': '7 ngày',
  '30d': '30 ngày',
  '90d': '90 ngày',
  all: 'Toàn thời gian',
};

function rangeToParams(range: DateRange): { start?: string; end?: string } {
  if (range === 'all') return {};
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  return { start: start.toISOString(), end: end.toISOString() };
}

function readEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_KEY) === '1';
}

function writeEnabled(v: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, v ? '1' : '0');
  } catch {
    // ignore quota errors
  }
}

function readRange(): DateRange {
  if (typeof window === 'undefined') return '30d';
  const v = window.localStorage.getItem(RANGE_KEY);
  if (v === '7d' || v === '30d' || v === '90d' || v === 'all') return v;
  return '30d';
}

function writeRange(r: DateRange) {
  try {
    window.localStorage.setItem(RANGE_KEY, r);
  } catch {
    // ignore
  }
}

/* ---------- measurements ---------- */

type Measurement = {
  /** Top in document coords (page-relative). */
  top: number;
  /** Height in px. */
  height: number;
  /** Left edge (used to draw leader line back to element). */
  left: number;
  /** Right edge. */
  right: number;
};

function useElementMeasurements(
  selector: string,
  enabled: boolean
): Map<string, Measurement> {
  const [map, setMap] = React.useState<Map<string, Measurement>>(new Map());

  React.useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      setMap(new Map());
      return;
    }

    const measure = () => {
      const next = new Map<string, Measurement>();
      const nodes = document.querySelectorAll<HTMLElement>(selector);
      const scrollY = window.scrollY;
      nodes.forEach(node => {
        const id =
          node.getAttribute('data-block-id') ??
          node.getAttribute('data-element-id');
        if (!id) return;
        const rect = node.getBoundingClientRect();
        next.set(id, {
          top: rect.top + scrollY,
          height: rect.height,
          left: rect.left,
          right: rect.right,
        });
      });
      setMap(next);
    };

    measure();
    const ro = new ResizeObserver(measure);
    document.querySelectorAll(selector).forEach(n => ro.observe(n));
    // Also observe body so scroll-related layout shifts re-measure
    ro.observe(document.body);

    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure);
    };
  }, [selector, enabled]);

  return map;
}

/* ---------- formatters ---------- */

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return String(n);
}

function fmtPct(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(1)}%`;
}

function fmtDwellMs(ms: number | null | undefined): string {
  if (!ms) return '—';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms / 60_000)}m`;
}

function ctrFromRow(r: BlockBreakdownRow): number {
  if (!r.views) return 0;
  return (r.clicks / r.views) * 100;
}

/* ---------- mock data ---------- */

/**
 * Deterministic pseudo-random from a string seed — same block id gives the
 * same numbers across renders so cards don't flicker between fetches.
 */
function seededRandom(seed: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

/**
 * Generate a believable demo `BlockBreakdownRow[]` from real DOM blocks.
 * Used when BE has no analytics events for the template yet — lets the
 * overlay show what populated cards look like instead of an empty grid.
 *
 * Numbers degrade per block index (first block sees the most traffic,
 * later blocks see less — mirroring real visitor drop-off).
 */
function generateMockBreakdown(
  blockIds: string[],
  blockTypes: Map<string, string>
): BlockBreakdownRow[] {
  return blockIds.map((blockId, index) => {
    const decay = Math.max(0.25, 1 - index * 0.18); // 1, .82, .64, .46, .28, .25...
    const baseViews = Math.round(
      12_000 * decay * (0.6 + seededRandom(blockId, 1) * 0.8)
    );
    const ctrPct = 2 + seededRandom(blockId, 2) * 18; // 2 % – 20 %
    const clicks = Math.round(baseViews * (ctrPct / 100));
    const unique = Math.round(
      baseViews * (0.6 + seededRandom(blockId, 3) * 0.3)
    );
    const avgDwell = Math.round(2000 + seededRandom(blockId, 4) * 18_000);

    const blockType = blockTypes.get(blockId) ?? 'block';
    const targetPrefix = blockType.split('_')[0] ?? 'el';
    const targets = [
      {
        target: `${targetPrefix}_cta_primary`,
        count: Math.round(clicks * 0.62),
      },
      { target: `${targetPrefix}_link`, count: Math.round(clicks * 0.28) },
      { target: `${targetPrefix}_image`, count: Math.round(clicks * 0.1) },
    ].filter(t => t.count >= ELEMENT_VIEWS_THRESHOLD);

    const actions: ActionStat[] =
      targets.length === 0
        ? []
        : [
            {
              action: 'click',
              count: clicks,
              unique_visitors: Math.round(clicks * 0.85),
              targets,
            },
          ];

    return {
      block_id: blockId,
      block_type: blockType,
      views: baseViews,
      clicks,
      unique_viewers: unique,
      avg_dwell_ms: avgDwell,
      total_dwell_ms: baseViews * avgDwell,
      top_action: actions[0]?.action ?? null,
      top_target: targets[0]?.target ?? null,
      actions,
    };
  });
}

/* ---------- cards ---------- */

function BlockSummaryCard({
  index,
  row,
}: {
  index: number;
  row: BlockBreakdownRow;
}) {
  const ctr = ctrFromRow(row);
  const tone =
    ctr >= 5
      ? 'text-emerald-600'
      : ctr >= 2
        ? 'text-amber-600'
        : 'text-rose-600';
  return (
    <div className='pointer-events-auto w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-[11.5px] shadow-sm'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-1.5 font-semibold text-zinc-700'>
          <span className='flex size-4 items-center justify-center rounded bg-zinc-900 font-mono text-[9px] font-bold text-white'>
            {index + 1}
          </span>
          <span className='truncate text-[9.5px] tracking-wider text-zinc-500 uppercase'>
            {row.block_type ?? 'BLOCK'}
          </span>
        </div>
      </div>
      <div className='mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1'>
        <Metric icon={<Eye className='size-3' />} value={fmtCount(row.views)} />
        <Metric
          icon={<MousePointerClick className='size-3' />}
          value={fmtCount(row.clicks)}
        />
        <Metric
          icon={<BarChart3 className='size-3' />}
          value={fmtPct(ctr)}
          tone={tone}
        />
        <Metric
          icon={<Timer className='size-3' />}
          value={fmtDwellMs(row.avg_dwell_ms)}
        />
      </div>
    </div>
  );
}

function ElementStatCard({
  elementId,
  action,
}: {
  elementId: string;
  action: ActionStat;
}) {
  const topTargets = action.targets.slice(0, 2);
  return (
    <div className='pointer-events-auto w-full rounded-lg border border-zinc-200 bg-white p-2.5 text-[11.5px] shadow-sm'>
      <div className='truncate font-mono text-[10px] font-semibold text-zinc-700'>
        {elementId}
      </div>
      <div className='text-[9px] tracking-wider text-zinc-400 uppercase'>
        {action.action}
      </div>
      <div className='mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1'>
        <Metric
          icon={<MousePointerClick className='size-3' />}
          value={fmtCount(action.count)}
        />
        <Metric
          icon={<Eye className='size-3' />}
          value={fmtCount(action.unique_visitors)}
        />
      </div>
      {topTargets.length > 0 && (
        <div className='mt-1.5 border-t border-zinc-100 pt-1 text-[10px] text-zinc-500'>
          {topTargets.map(t => (
            <div key={t.target} className='flex items-center justify-between'>
              <span className='truncate font-mono'>→ {t.target}</span>
              <span className='ml-1 font-semibold text-zinc-700'>
                {fmtCount(t.count)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({
  icon,
  value,
  tone,
}: {
  icon: React.ReactNode;
  value: string;
  tone?: string;
}) {
  return (
    <div className='flex items-center gap-1 text-zinc-700'>
      <span className='text-zinc-400'>{icon}</span>
      <span className={`font-semibold ${tone ?? ''}`}>{value}</span>
    </div>
  );
}

/* ---------- leader line ---------- */

function LeaderLine({
  from,
  to,
  side,
}: {
  /** Card edge (the card's gutter side). */
  from: { x: number; y: number };
  /** Element edge (the anchored element). */
  to: { x: number; y: number };
  side: 'left' | 'right';
}) {
  const midX =
    side === 'left'
      ? from.x + (to.x - from.x) / 2
      : from.x - (from.x - to.x) / 2;
  const path = `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
  return (
    <path
      d={path}
      fill='none'
      stroke='rgb(203 213 225)'
      strokeWidth={1}
      strokeDasharray='3 3'
    />
  );
}

/* ---------- toolbar ---------- */

function StatsToolbar({
  enabled,
  setEnabled,
  range,
  setRange,
  loading,
  hasData,
  isDemo,
}: {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  range: DateRange;
  setRange: (r: DateRange) => void;
  loading: boolean;
  hasData: boolean;
  isDemo: boolean;
}) {
  return (
    <div className='fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full border border-zinc-200 bg-white/95 px-2 py-1.5 shadow-lg backdrop-blur'>
      <button
        type='button'
        onClick={() => setEnabled(!enabled)}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
          enabled ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-100'
        }`}
        title={enabled ? 'Tắt overlay' : 'Bật stats overlay'}
      >
        {enabled ? (
          <Eye className='size-3.5' />
        ) : (
          <EyeOff className='size-3.5' />
        )}
        Stats {enabled ? 'ON' : 'OFF'}
      </button>
      {enabled && (
        <>
          <div className='h-4 w-px bg-zinc-200' />
          <select
            value={range}
            onChange={e => setRange(e.target.value as DateRange)}
            className='cursor-pointer rounded-md bg-transparent px-1 py-0.5 text-[11.5px] font-medium text-zinc-700 outline-none hover:bg-zinc-50'
          >
            {(Object.keys(RANGE_LABEL) as DateRange[]).map(r => (
              <option key={r} value={r}>
                {RANGE_LABEL[r]}
              </option>
            ))}
          </select>
          <span
            className={`font-mono text-[10px] ${
              isDemo ? 'text-violet-500' : 'text-zinc-400'
            }`}
          >
            {loading ? '…' : isDemo ? 'demo' : hasData ? 'live' : 'no data'}
          </span>
        </>
      )}
    </div>
  );
}

/* ---------- main ---------- */

export function StatsAnnotationOverlay({
  templateId,
  children,
}: {
  templateId: string;
  children: React.ReactNode;
}) {
  const user = useAppSelector(s => s.auth.user);
  const role = user?.role ?? user?.principal_type ?? '';
  const isLoggedIn = !!user;
  const isAdminScope = role === 'admin' || role === 'staff';

  const [enabled, setEnabledState] = React.useState(false);
  const [range, setRangeState] = React.useState<DateRange>('30d');
  const [fetchedRows, setFetchedRows] = React.useState<BlockBreakdownRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [narrow, setNarrow] = React.useState(false);
  // Sticky 403 flag so the brand-pending banner doesn't flash off between
  // dropdown range changes (each change re-triggers fetch).
  const [forbidden, setForbidden] = React.useState(false);

  // Hydrate persisted state once we know the user is logged in.
  React.useEffect(() => {
    if (!isLoggedIn) return;
    setEnabledState(readEnabled());
    setRangeState(readRange());
  }, [isLoggedIn]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setNarrow(window.innerWidth < MIN_VIEWPORT);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const setEnabled = (v: boolean) => {
    setEnabledState(v);
    writeEnabled(v);
  };
  const setRange = (r: DateRange) => {
    setRangeState(r);
    writeRange(r);
  };

  React.useEffect(() => {
    if (!enabled || !isLoggedIn) return;
    let cancelled = false;
    setLoading(true);
    rexerApi.templateAnalytics
      .breakdown(templateId, rangeToParams(range))
      .then(data => {
        if (cancelled) return;
        setFetchedRows(Array.isArray(data) ? data : []);
        setForbidden(false);
      })
      .catch(err => {
        if (cancelled) return;
        setFetchedRows([]);
        // BE breakdown is admin-gated — flag 403 for brand users so we can
        // surface a friendly "BE pending" banner instead of silent emptiness.
        const status =
          err && typeof err === 'object' && 'status' in err
            ? (err as { status: number }).status
            : undefined;
        setForbidden(status === 403);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, range, templateId, isLoggedIn]);

  const blockSelector = '[data-block-id]';
  const elementSelector = '[data-element-id]';
  const blockMeasurements = useElementMeasurements(
    blockSelector,
    enabled && !narrow
  );
  const elementMeasurements = useElementMeasurements(
    elementSelector,
    enabled && !narrow
  );

  // Mock fallback: when BE has no events (empty fetch OR 403), generate a
  // demo dataset off the real DOM blocks so the overlay still has something
  // to render. Driven by `data-block-id` attributes + the block-type label
  // that `renderBlock.tsx` stamps via `data-block-type` (best-effort lookup
  // — falls back to `block` if not present).
  const blockTypeMap = React.useMemo(() => {
    const m = new Map<string, string>();
    if (typeof document === 'undefined') return m;
    document.querySelectorAll<HTMLElement>('[data-block-id]').forEach(el => {
      const id = el.getAttribute('data-block-id');
      const type = el.getAttribute('data-block-type') ?? 'block';
      if (id) m.set(id, type);
    });
    return m;
    // blockMeasurements is a stable proxy for "DOM blocks changed" — the
    // body reads from `document.querySelectorAll`, not the Map itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockMeasurements]);

  const isDemo =
    enabled && fetchedRows.length === 0 && blockMeasurements.size > 0;

  const rows: BlockBreakdownRow[] = React.useMemo(() => {
    if (fetchedRows.length > 0) return fetchedRows;
    if (!isDemo) return [];
    const ids = Array.from(blockMeasurements.entries())
      .sort((a, b) => a[1].top - b[1].top)
      .map(([id]) => id);
    return generateMockBreakdown(ids, blockTypeMap);
  }, [fetchedRows, isDemo, blockMeasurements, blockTypeMap]);

  // Index breakdown by block_id for O(1) lookup.
  const rowByBlock = React.useMemo(() => {
    const m = new Map<string, BlockBreakdownRow>();
    for (const r of rows) m.set(r.block_id, r);
    return m;
  }, [rows]);

  // Flatten elements above the threshold, with their parent block_id so
  // we can locate the action stat for the card.
  const elementCards = React.useMemo(() => {
    const items: Array<{
      elementId: string;
      action: ActionStat;
    }> = [];
    for (const row of rows) {
      for (const action of row.actions ?? []) {
        for (const target of action.targets ?? []) {
          if (target.count < ELEMENT_VIEWS_THRESHOLD) continue;
          items.push({
            elementId: target.target,
            action: {
              action: action.action,
              count: target.count,
              unique_visitors: action.unique_visitors,
              targets: [target],
            },
          });
        }
      }
    }
    return items;
  }, [rows]);

  // Anonymous viewers (public visitor without login) never see the overlay.
  if (!isLoggedIn) {
    return <>{children}</>;
  }

  return (
    <>
      <StatsToolbar
        enabled={enabled}
        setEnabled={setEnabled}
        range={range}
        setRange={setRange}
        loading={loading}
        hasData={rows.length > 0}
        isDemo={isDemo}
      />
      {enabled && forbidden && !isAdminScope && (
        <div className='fixed top-16 right-4 z-50 max-w-sm rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900 shadow'>
          <div className='font-semibold'>
            Phân tích cho brand — đang phát triển
          </div>
          <div className='mt-0.5 text-amber-800'>
            BE chưa ship endpoint <code>/portal/templates/.../breakdown</code>{' '}
            (wave 2 W2.1). Hiện chỉ admin xem được dữ liệu chi tiết. UI sẽ tự
            live khi BE merge.
          </div>
        </div>
      )}
      {children}
      {enabled && !narrow && (
        <Gutters
          blockMeasurements={blockMeasurements}
          elementMeasurements={elementMeasurements}
          rowByBlock={rowByBlock}
          elementCards={elementCards}
        />
      )}
      {enabled && narrow && (
        <div className='fixed right-4 bottom-4 z-40 max-w-xs rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800 shadow'>
          Viewport &lt; {MIN_VIEWPORT}px — overlay cần màn hình rộng hơn để hiện
          gutter.
        </div>
      )}
    </>
  );
}

function Gutters({
  blockMeasurements,
  elementMeasurements,
  rowByBlock,
  elementCards,
}: {
  blockMeasurements: Map<string, Measurement>;
  elementMeasurements: Map<string, Measurement>;
  rowByBlock: Map<string, BlockBreakdownRow>;
  elementCards: Array<{ elementId: string; action: ActionStat }>;
}) {
  // Ordered block ids by vertical position so the index number reflects scroll order.
  const orderedBlockIds = React.useMemo(() => {
    return Array.from(blockMeasurements.entries())
      .sort((a, b) => a[1].top - b[1].top)
      .map(([id]) => id);
  }, [blockMeasurements]);

  // Document height to size the SVG layer.
  const docHeight =
    typeof document !== 'undefined'
      ? Math.max(
          document.documentElement.scrollHeight,
          document.body.scrollHeight
        )
      : 0;

  return (
    <>
      {/* SVG layer for leader lines — full-page, behind cards */}
      <svg
        aria-hidden
        className='pointer-events-none absolute top-0 left-0 z-30'
        width='100%'
        height={docHeight}
        style={{ position: 'absolute' }}
      >
        {orderedBlockIds.map(blockId => {
          const m = blockMeasurements.get(blockId);
          if (!m) return null;
          if (!rowByBlock.has(blockId)) return null;
          const cardCenterY = m.top + 24;
          return (
            <LeaderLine
              key={`bl-${blockId}`}
              from={{ x: GUTTER_WIDTH, y: cardCenterY }}
              to={{ x: m.left, y: cardCenterY }}
              side='left'
            />
          );
        })}
        {elementCards.map(({ elementId }) => {
          const m = elementMeasurements.get(elementId);
          if (!m) return null;
          const cardCenterY = m.top + 24;
          // Right gutter starts at viewport - GUTTER_WIDTH; use window width.
          const winW = typeof window !== 'undefined' ? window.innerWidth : 1280;
          return (
            <LeaderLine
              key={`el-${elementId}`}
              from={{ x: winW - GUTTER_WIDTH, y: cardCenterY }}
              to={{ x: m.right, y: cardCenterY }}
              side='right'
            />
          );
        })}
      </svg>

      {/* Left gutter cards */}
      <div className='pointer-events-none absolute top-0 left-0 z-40 w-[200px]'>
        {orderedBlockIds.map((blockId, idx) => {
          const m = blockMeasurements.get(blockId);
          const row = rowByBlock.get(blockId);
          if (!m || !row) return null;
          return (
            <div
              key={blockId}
              style={{
                position: 'absolute',
                top: m.top,
                left: 8,
                width: GUTTER_WIDTH - 24,
              }}
            >
              <BlockSummaryCard index={idx} row={row} />
            </div>
          );
        })}
      </div>

      {/* Right gutter cards */}
      <div className='pointer-events-none absolute top-0 right-0 z-40 w-[200px]'>
        {elementCards.map(({ elementId, action }) => {
          const m = elementMeasurements.get(elementId);
          if (!m) return null;
          return (
            <div
              key={elementId}
              style={{
                position: 'absolute',
                top: m.top,
                right: 8,
                width: GUTTER_WIDTH - 24,
              }}
            >
              <ElementStatCard elementId={elementId} action={action} />
            </div>
          );
        })}
      </div>
    </>
  );
}
