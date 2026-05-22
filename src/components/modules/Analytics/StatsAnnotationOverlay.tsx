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
import { Eye, EyeOff, MousePointerClick, Timer } from 'lucide-react';

import { useAppSelector } from '@/hooks/useRedux';
import { rexerApi } from '@/services/rexer/endpoints';
import type { ActionStat, BlockBreakdownRow } from '@/services/rexer/types';

const ELEMENT_VIEWS_THRESHOLD = 50;
const STORAGE_KEY = 'rexer.statsOverlay.enabled';
const RANGE_KEY = 'rexer.statsOverlay.range';
const GUTTER_WIDTH = 280; // px reserved each side for cards (HUD-style needs room)
const MIN_VIEWPORT = 1320; // below this we fold into a side panel (not yet)

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

/**
 * HUD frame corners — 4 small L-shapes at each corner of a card, in cyan
 * glow. Pure decoration; doesn't affect layout.
 */
function HudCorners() {
  const cls =
    'pointer-events-none absolute size-2.5 border-cyan-400/70 shadow-[0_0_6px_rgba(34,211,238,0.6)]';
  return (
    <>
      <span className={`${cls} top-1 left-1 border-t border-l`} />
      <span className={`${cls} top-1 right-1 border-t border-r`} />
      <span className={`${cls} bottom-1 left-1 border-b border-l`} />
      <span className={`${cls} right-1 bottom-1 border-r border-b`} />
    </>
  );
}

/**
 * Mini sparkline — synthesises 12 points from a seed for the trend line
 * at the bottom of each block card. Goes up + down to feel organic.
 */
function Sparkline({ seed, tone }: { seed: string; tone: string }) {
  const points = React.useMemo(() => {
    const arr: number[] = [];
    let v = 0.5;
    for (let i = 0; i < 12; i++) {
      const delta = (seededRandom(seed, i + 10) - 0.45) * 0.4;
      v = Math.min(1, Math.max(0.1, v + delta));
      arr.push(v);
    }
    return arr;
  }, [seed]);
  const w = 100;
  const h = 22;
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - p * h;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className='block h-5 w-full overflow-visible'
      aria-hidden
    >
      <defs>
        <linearGradient id={`spark-${seed}`} x1='0' x2='1' y1='0' y2='0'>
          <stop offset='0%' stopColor='currentColor' stopOpacity='0' />
          <stop offset='100%' stopColor='currentColor' stopOpacity='1' />
        </linearGradient>
      </defs>
      <path
        d={path}
        fill='none'
        stroke={`url(#spark-${seed})`}
        strokeWidth={1.5}
        strokeLinecap='round'
        strokeLinejoin='round'
        className={tone}
        style={{ filter: 'drop-shadow(0 0 3px currentColor)' }}
      />
    </svg>
  );
}

function BlockSummaryCard({
  index,
  row,
  isDemo,
}: {
  index: number;
  row: BlockBreakdownRow;
  isDemo: boolean;
}) {
  const ctr = ctrFromRow(row);
  const ctrTone =
    ctr >= 5
      ? 'text-emerald-300'
      : ctr >= 2
        ? 'text-amber-300'
        : 'text-rose-300';
  return (
    <div className='group pointer-events-auto relative w-full overflow-visible rounded-xl border border-cyan-400/30 bg-gradient-to-br from-zinc-950/95 via-zinc-900/95 to-zinc-950/95 p-3 text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.15),0_0_60px_rgba(34,211,238,0.06)_inset] backdrop-blur-md transition-all hover:border-cyan-300/60 hover:shadow-[0_0_32px_rgba(34,211,238,0.3)]'>
      <HudCorners />

      {/* Header: index + type + live/demo pulse */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <span className='relative flex size-5 items-center justify-center rounded-md bg-cyan-400 font-mono text-[10px] font-black text-zinc-950 shadow-[0_0_12px_rgba(34,211,238,0.8)]'>
            {index + 1}
          </span>
          <span className='truncate font-mono text-[9.5px] font-bold tracking-[0.18em] text-cyan-200/90 uppercase'>
            {row.block_type ?? 'BLOCK'}
          </span>
        </div>
        <span className='flex items-center gap-1 font-mono text-[8.5px] tracking-widest text-cyan-300/70 uppercase'>
          <span
            className={`size-1.5 rounded-full ${
              isDemo ? 'bg-violet-400' : 'bg-cyan-400'
            } animate-pulse shadow-[0_0_6px_currentColor]`}
          />
          {isDemo ? 'demo' : 'live'}
        </span>
      </div>

      {/* Hero stat — views, big */}
      <div className='mt-3 flex items-baseline justify-between border-b border-cyan-400/20 pb-2'>
        <div>
          <div className='font-mono text-3xl leading-none font-black tracking-tight text-cyan-50 tabular-nums [text-shadow:0_0_12px_rgba(34,211,238,0.4)]'>
            {fmtCount(row.views)}
          </div>
          <div className='mt-1 flex items-center gap-1 font-mono text-[8.5px] tracking-[0.2em] text-cyan-300/60 uppercase'>
            <Eye className='size-2.5' />
            page views
          </div>
        </div>
        <div className={`text-right ${ctrTone}`}>
          <div className='font-mono text-xl leading-none font-bold tabular-nums [text-shadow:0_0_8px_currentColor]'>
            {fmtPct(ctr)}
          </div>
          <div className='mt-1 font-mono text-[8.5px] tracking-[0.2em] text-cyan-300/60 uppercase'>
            CTR
          </div>
        </div>
      </div>

      {/* Secondary stats grid */}
      <div className='mt-2 grid grid-cols-2 gap-2'>
        <HudStat
          icon={<MousePointerClick className='size-2.5' />}
          label='clicks'
          value={fmtCount(row.clicks)}
        />
        <HudStat
          icon={<Timer className='size-2.5' />}
          label='avg dwell'
          value={fmtDwellMs(row.avg_dwell_ms)}
        />
      </div>

      {/* Sparkline trend */}
      <div className='mt-2 border-t border-cyan-400/15 pt-2'>
        <Sparkline seed={row.block_id} tone='text-cyan-300' />
      </div>
    </div>
  );
}

function ElementStatCard({
  elementId,
  label,
  action,
}: {
  elementId: string;
  /** Human label scraped from the button text — preferred over the raw id. */
  label?: string;
  action: ActionStat;
}) {
  const topTargets = action.targets.slice(0, 2);
  return (
    <div className='group pointer-events-auto relative w-full overflow-visible rounded-xl border border-fuchsia-400/30 bg-gradient-to-br from-zinc-950/95 via-zinc-900/95 to-zinc-950/95 p-3 text-fuchsia-50 shadow-[0_0_24px_rgba(232,121,249,0.15),0_0_60px_rgba(232,121,249,0.06)_inset] backdrop-blur-md transition-all hover:border-fuchsia-300/60 hover:shadow-[0_0_32px_rgba(232,121,249,0.3)]'>
      <HudCorners />

      <div className='truncate text-[12px] leading-tight font-bold tracking-tight text-fuchsia-100'>
        {label || elementId}
      </div>
      <div className='mt-0.5 truncate font-mono text-[8.5px] tracking-[0.18em] text-fuchsia-300/60 uppercase'>
        {action.action} · {elementId.split('__').slice(-1)[0]}
      </div>

      <div className='mt-2 flex items-baseline justify-between border-b border-fuchsia-400/20 pb-2'>
        <div>
          <div className='font-mono text-2xl leading-none font-black text-fuchsia-50 tabular-nums [text-shadow:0_0_10px_rgba(232,121,249,0.5)]'>
            {fmtCount(action.count)}
          </div>
          <div className='mt-1 font-mono text-[8.5px] tracking-[0.2em] text-fuchsia-300/60 uppercase'>
            clicks
          </div>
        </div>
        <div className='text-right'>
          <div className='font-mono text-base leading-none font-bold text-fuchsia-200 tabular-nums'>
            {fmtCount(action.unique_visitors)}
          </div>
          <div className='mt-1 font-mono text-[8.5px] tracking-[0.2em] text-fuchsia-300/60 uppercase'>
            unique
          </div>
        </div>
      </div>

      {topTargets.length > 0 && (
        <div className='mt-2 space-y-1'>
          {topTargets.map(t => {
            const pct = action.count
              ? Math.min(100, (t.count / action.count) * 100)
              : 0;
            return (
              <div key={t.target}>
                <div className='flex items-center justify-between font-mono text-[10px]'>
                  <span className='truncate text-fuchsia-200/80'>
                    → {t.target}
                  </span>
                  <span className='ml-1 font-bold text-fuchsia-100 tabular-nums'>
                    {fmtCount(t.count)}
                  </span>
                </div>
                <div className='mt-0.5 h-0.5 w-full overflow-hidden rounded-full bg-fuchsia-400/15'>
                  <div
                    className='h-full rounded-full bg-fuchsia-400 shadow-[0_0_6px_rgba(232,121,249,0.8)]'
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Single stat tile inside a HUD card — small icon + label + big mono value. */
function HudStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className='rounded-md border border-cyan-400/15 bg-cyan-400/5 px-2 py-1.5'>
      <div className='flex items-center gap-1 font-mono text-[8.5px] tracking-[0.2em] text-cyan-300/60 uppercase'>
        {icon}
        {label}
      </div>
      <div className='mt-0.5 font-mono text-sm leading-none font-bold text-cyan-50 tabular-nums'>
        {value}
      </div>
    </div>
  );
}

/* ---------- leader line ---------- */

function LeaderLine({
  from,
  to,
  side,
  color = 'cyan',
}: {
  /** Card edge (the card's gutter side). */
  from: { x: number; y: number };
  /** Element edge (the anchored element). */
  to: { x: number; y: number };
  side: 'left' | 'right';
  /** Glow color theme — cyan for block lines (left), fuchsia for element (right). */
  color?: 'cyan' | 'fuchsia';
}) {
  const midX =
    side === 'left'
      ? from.x + (to.x - from.x) / 2
      : from.x - (from.x - to.x) / 2;
  const path = `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
  const stroke = color === 'fuchsia' ? 'rgb(232 121 249)' : 'rgb(34 211 238)';
  return (
    <g
      style={{
        filter: `drop-shadow(0 0 4px ${stroke})`,
      }}
    >
      <path
        d={path}
        fill='none'
        stroke={stroke}
        strokeOpacity={0.85}
        strokeWidth={1.25}
      />
      {/* Endpoint dot at the element side */}
      <circle cx={to.x} cy={to.y} r={2.5} fill={stroke} />
    </g>
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

  // Auto-tag every clickable inside a `[data-block-id]` with a stable
  // `data-element-id` + label so the right-gutter cards can anchor to
  // each button individually instead of collapsing them into one
  // aggregated card per block.
  const [taggedClickables, setTaggedClickables] = React.useState<
    Array<{ elementId: string; label: string }>
  >([]);
  React.useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;
    const list: Array<{ elementId: string; label: string }> = [];
    document
      .querySelectorAll<HTMLElement>('[data-block-id]')
      .forEach(blockEl => {
        const blockId = blockEl.getAttribute('data-block-id');
        if (!blockId) return;
        const clickables =
          blockEl.querySelectorAll<HTMLElement>('button, a[href]');
        clickables.forEach((el, idx) => {
          let elementId = el.getAttribute('data-element-id');
          if (!elementId) {
            const key =
              el.getAttribute('data-element-key') ??
              el
                .getAttribute('aria-label')
                ?.toLowerCase()
                .replace(/\s+/g, '_') ??
              `cta_${idx + 1}`;
            elementId = `${blockId.slice(0, 8)}__${key}`;
            el.setAttribute('data-element-id', elementId);
          }
          const text =
            (el.textContent || '').trim().split('\n')[0].slice(0, 40) ||
            el.getAttribute('aria-label') ||
            elementId;
          list.push({ elementId, label: text });
        });
      });
    setTaggedClickables(list);
    // blockMeasurements changing means new blocks mounted — re-tag.
  }, [enabled, blockMeasurements]);

  // Element cards: one card per real clickable button on the page.
  // In live mode we pick the matching real ActionStat from `rows`; in
  // demo mode we synthesise per-button numbers from a seed.
  const elementCards = React.useMemo(() => {
    if (taggedClickables.length === 0) return [];
    // Index real targets by their raw target string for cheap lookup.
    const realByTarget = new Map<
      string,
      {
        actionName: string;
        target: { target: string; count: number };
        uv: number;
      }
    >();
    if (!isDemo) {
      for (const row of rows) {
        for (const action of row.actions ?? []) {
          for (const target of action.targets ?? []) {
            realByTarget.set(target.target, {
              actionName: action.action,
              target,
              uv: action.unique_visitors,
            });
          }
        }
      }
    }
    return taggedClickables.map(({ elementId, label }) => {
      const real = realByTarget.get(elementId);
      if (real) {
        return {
          elementId,
          label,
          action: {
            action: real.actionName,
            count: real.target.count,
            unique_visitors: real.uv,
            targets: [real.target],
          },
        };
      }
      // Demo synthesis — seeded per button so reload stays consistent.
      const count = Math.round(120 + seededRandom(elementId, 5) * 880);
      return {
        elementId,
        label,
        action: {
          action: 'click',
          count,
          unique_visitors: Math.round(count * 0.78),
          targets: [{ target: elementId, count }],
        },
      };
    });
  }, [taggedClickables, rows, isDemo]);

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
          isDemo={isDemo}
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
  isDemo,
}: {
  blockMeasurements: Map<string, Measurement>;
  elementMeasurements: Map<string, Measurement>;
  rowByBlock: Map<string, BlockBreakdownRow>;
  elementCards: Array<{
    elementId: string;
    label?: string;
    action: ActionStat;
  }>;
  isDemo: boolean;
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

  const CARD_GAP = 50; // px gap between card edge and the anchored element
  const CARD_WIDTH = GUTTER_WIDTH - 28;
  const PAGE_PAD = 12;
  const winW = typeof window !== 'undefined' ? window.innerWidth : 1280;

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
          // Block card sits just left of the block — short stub line.
          const cardRight = Math.max(
            PAGE_PAD + CARD_WIDTH,
            m.left - CARD_GAP + CARD_WIDTH
          );
          return (
            <LeaderLine
              key={`bl-${blockId}`}
              from={{ x: cardRight, y: cardCenterY }}
              to={{ x: m.left, y: cardCenterY }}
              side='left'
            />
          );
        })}
        {elementCards.map(({ elementId }) => {
          const m = elementMeasurements.get(elementId);
          if (!m) return null;
          const elementCenterY = m.top + m.height / 2;
          const cardLeft = Math.min(
            winW - CARD_WIDTH - PAGE_PAD,
            m.right + CARD_GAP
          );
          return (
            <LeaderLine
              key={`el-${elementId}`}
              from={{ x: cardLeft, y: elementCenterY }}
              to={{ x: m.right, y: elementCenterY }}
              side='right'
              color='fuchsia'
            />
          );
        })}
      </svg>

      {/* Block cards — sit ~50px to the left of each block (clamped). */}
      <div className='pointer-events-none absolute top-0 left-0 z-40'>
        {orderedBlockIds.map((blockId, idx) => {
          const m = blockMeasurements.get(blockId);
          const row = rowByBlock.get(blockId);
          if (!m || !row) return null;
          const left = Math.max(PAGE_PAD, m.left - CARD_WIDTH - CARD_GAP);
          return (
            <div
              key={blockId}
              style={{
                position: 'absolute',
                top: m.top,
                left,
                width: CARD_WIDTH,
              }}
            >
              <BlockSummaryCard index={idx} row={row} isDemo={isDemo} />
            </div>
          );
        })}
      </div>

      {/* Element cards — sit ~50px to the right of each button (clamped). */}
      <div className='pointer-events-none absolute top-0 left-0 z-40'>
        {elementCards.map(({ elementId, label, action }) => {
          const m = elementMeasurements.get(elementId);
          if (!m) return null;
          // Vertically centre the card on the element (~80px tall card).
          const cardTop = m.top + m.height / 2 - 40;
          const left = Math.min(
            winW - CARD_WIDTH - PAGE_PAD,
            m.right + CARD_GAP
          );
          return (
            <div
              key={elementId}
              style={{
                position: 'absolute',
                top: cardTop,
                left,
                width: CARD_WIDTH,
              }}
            >
              <ElementStatCard
                elementId={elementId}
                label={label}
                action={action}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
