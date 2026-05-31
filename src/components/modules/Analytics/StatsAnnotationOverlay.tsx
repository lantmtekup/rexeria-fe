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
import { Eye, EyeOff, MousePointerClick } from 'lucide-react';

import { useAppSelector } from '@/hooks/useRedux';
import { rexerApi } from '@/services/rexer/endpoints';
import type { ActionStat, BlockBreakdownRow } from '@/services/rexer/types';

const ELEMENT_VIEWS_THRESHOLD = 50;
const STORAGE_KEY = 'rexer.statsOverlay.enabled';
const RANGE_KEY = 'rexer.statsOverlay.range';
const GUTTER_WIDTH = 340; // px reserved each side — ~320 card + breathing room
const MIN_VIEWPORT = 1360; // below this we fold into a side panel (not yet)

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

/* ---------- card offsets (drag-to-reposition persistence) ---------- */

export type CardOffset = { dx: number; dy: number };
export type OffsetMap = Record<string, CardOffset>;

const offsetsStorageKey = (templateId: string) =>
  `rexer.statsOverlay.offsets:${templateId}`;

function readOffsets(templateId: string): OffsetMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(offsetsStorageKey(templateId));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeOffsets(templateId: string, offsets: OffsetMap): void {
  try {
    window.localStorage.setItem(
      offsetsStorageKey(templateId),
      JSON.stringify(offsets)
    );
  } catch {
    // ignore quota errors
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
          node.getAttribute('data-element-id') ??
          // Code template sections (Option C, §17). Cùng treated như block
          // ở measurement, label/data lookup branch ở caller.
          node.getAttribute('data-rexer-section');
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
 * Mini sparkline — gold gradient line on a soft gradient area fill. The
 * palette matches the user's reference HTML (`#c89a52 → #f1d9a6` stroke,
 * `#f1c98a` 35% → 0 area fill). 56px tall, stretches to card width.
 */
function Sparkline({ seed }: { seed: string }) {
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
  const w = 280;
  const h = 56;
  const line = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - p * h * 0.85 - 4;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  const area = `${line} L ${w} ${h} L 0 ${h} Z`;
  const fillId = `spark-fill-${seed}`;
  const strokeId = `spark-stroke-${seed}`;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className='mt-[18px] block h-14 w-full'
      preserveAspectRatio='none'
      aria-hidden
    >
      <defs>
        <linearGradient id={fillId} x1='0' x2='0' y1='0' y2='1'>
          <stop offset='0' stopColor='#f1c98a' stopOpacity='0.35' />
          <stop offset='1' stopColor='#f1c98a' stopOpacity='0' />
        </linearGradient>
        <linearGradient id={strokeId} x1='0' x2='1' y1='0' y2='0'>
          <stop offset='0' stopColor='#c89a52' />
          <stop offset='0.6' stopColor='#e8c478' />
          <stop offset='1' stopColor='#f1d9a6' />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${fillId})`} />
      <path
        d={line}
        fill='none'
        stroke={`url(#${strokeId})`}
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

/**
 * Card shell shared by block + element variants. Warm dark glass treatment
 * (per the user's reference HTML): semi-transparent brown-black with strong
 * backdrop blur + saturate, hairline white border, big drop shadow, plus a
 * subtle inner highlight at the top edge.
 */
const CARD_BASE =
  'pointer-events-auto relative w-full overflow-hidden border text-white';

const CARD_STYLE: React.CSSProperties = {
  background: 'rgba(28, 22, 18, 0.55)',
  borderColor: 'rgba(255, 255, 255, 0.08)',
  borderRadius: 22,
  padding: '22px 26px 24px',
  backdropFilter: 'blur(20px) saturate(1.2)',
  WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
  boxShadow:
    '0 20px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
};

const CARD_LABEL_CLS =
  'm-0 text-[18px] font-normal tracking-[0.005em] text-white/85';
const CARD_VALUE_CLS =
  'm-0 mt-1.5 text-[38px] leading-none font-bold tracking-[-0.01em] text-white tabular-nums';

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
    <div className={CARD_BASE} style={CARD_STYLE}>
      {/* Header */}
      <div className='flex items-center justify-between text-white/60'>
        <div className='flex items-center gap-1.5'>
          <span className='flex size-4 items-center justify-center rounded-full bg-white/15 text-[10px] font-bold text-white'>
            {index + 1}
          </span>
          <span className='truncate text-[11px] font-medium tracking-wide'>
            {row.block_type ?? 'block'}
          </span>
        </div>
        <span
          className={`text-[10px] tracking-wider uppercase ${
            isDemo ? 'text-violet-300/80' : 'text-emerald-300/80'
          }`}
        >
          {isDemo ? 'demo' : 'live'}
        </span>
      </div>

      {/* Hero label + value (per the reference) */}
      <p className={`${CARD_LABEL_CLS} mt-3`}>Lượt xem:</p>
      <p className={CARD_VALUE_CLS}>{fmtCount(row.views)}</p>

      {/* Gold sparkline */}
      <Sparkline seed={row.block_id} />

      {/* Footer stats — small auxiliary row */}
      <div className='mt-4 grid grid-cols-3 gap-3 border-t border-white/10 pt-3 text-[11px]'>
        <div>
          <div className='text-white/55'>Click</div>
          <div className='mt-0.5 font-semibold tabular-nums'>
            {fmtCount(row.clicks)}
          </div>
        </div>
        <div>
          <div className='text-white/55'>CTR</div>
          <div className={`mt-0.5 font-semibold tabular-nums ${ctrTone}`}>
            {fmtPct(ctr)}
          </div>
        </div>
        <div>
          <div className='text-white/55'>Dwell</div>
          <div className='mt-0.5 font-semibold tabular-nums'>
            {fmtDwellMs(row.avg_dwell_ms)}
          </div>
        </div>
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
  const uniquePct = action.count
    ? Math.round((action.unique_visitors / Math.max(1, action.count)) * 100)
    : 0;
  return (
    <div className={CARD_BASE} style={CARD_STYLE}>
      <div className='flex items-start justify-between gap-2 text-white/60'>
        <div className='min-w-0'>
          <div className='truncate text-[13px] leading-tight font-semibold text-white'>
            {label || elementId}
          </div>
          <div className='mt-0.5 truncate text-[10px] tracking-wider uppercase'>
            {action.action}
          </div>
        </div>
        <MousePointerClick className='mt-0.5 size-3.5 shrink-0' />
      </div>

      <p className={`${CARD_LABEL_CLS} mt-3`}>Lượt click:</p>
      <p className={CARD_VALUE_CLS}>{fmtCount(action.count)}</p>

      <div className='mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3 text-[11px]'>
        <div>
          <div className='text-white/55'>Unique</div>
          <div className='mt-0.5 font-semibold tabular-nums'>
            {fmtCount(action.unique_visitors)}
          </div>
        </div>
        <div>
          <div className='text-white/55'>Tỉ lệ</div>
          <div className='mt-0.5 font-semibold text-emerald-300 tabular-nums'>
            {uniquePct}%
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- leader line ---------- */

// User feedback 2026-05-31: dashed leader line + anchor dot quá noise
// trên dark backgrounds (mint-coint hero). Disabled — card đã đứng cạnh
// element nên user vẫn map được visually. Giữ component shell + props
// để revert nhanh nếu cần.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function LeaderLine(_props: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  side: 'left' | 'right';
}) {
  return null;
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
  hasCustomOffsets,
  onResetOffsets,
}: {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  range: DateRange;
  setRange: (r: DateRange) => void;
  loading: boolean;
  hasData: boolean;
  isDemo: boolean;
  hasCustomOffsets: boolean;
  onResetOffsets: () => void;
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
          {hasCustomOffsets && (
            <>
              <div className='h-4 w-px bg-zinc-200' />
              <button
                type='button'
                onClick={onResetOffsets}
                className='rounded-md px-2 py-0.5 text-[11px] font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                title='Đặt lại vị trí mặc định cho mọi card'
              >
                Reset vị trí
              </button>
            </>
          )}
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
  // Drag-positioned card offsets, keyed by `block:<id>` / `el:<id>`.
  // Per-template so different landings keep their own layout.
  const [offsets, setOffsets] = React.useState<OffsetMap>({});

  // Hydrate persisted state once we know the user is logged in.
  React.useEffect(() => {
    if (!isLoggedIn) return;
    setEnabledState(readEnabled());
    setRangeState(readRange());
    setOffsets(readOffsets(templateId));
  }, [isLoggedIn, templateId]);

  const updateOffset = React.useCallback(
    (key: string, off: CardOffset) => {
      setOffsets(prev => {
        const next = { ...prev, [key]: off };
        writeOffsets(templateId, next);
        return next;
      });
    },
    [templateId]
  );

  const resetOffsets = React.useCallback(() => {
    setOffsets({});
    writeOffsets(templateId, {});
  }, [templateId]);

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
    // Phase 2: brand-side `/portal/templates/{id}/breakdown` ships per
    // be-missing-apis-portal.md P0. Admin/staff still hit the original
    // admin endpoint for cross-client visibility.
    const fetchPromise = isAdminScope
      ? rexerApi.templateAnalytics.breakdown(templateId, rangeToParams(range))
      : rexerApi.portal.templateBreakdown(templateId, rangeToParams(range));
    fetchPromise
      .then(data => {
        if (cancelled) return;
        setFetchedRows(Array.isArray(data) ? data : []);
        setForbidden(false);
      })
      .catch(err => {
        if (cancelled) return;
        setFetchedRows([]);
        const status =
          err && typeof err === 'object' && 'status' in err
            ? (err as { status: number }).status
            : undefined;
        // Sticky 403 — should now be rare since brand has its own endpoint,
        // but keep the banner as a safety net for older roles.
        setForbidden(status === 403);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, range, templateId, isLoggedIn, isAdminScope]);

  // Block template: data-block-id. Code template: data-rexer-section.
  // Cùng treat ở measurement layer — gutter card renderer dùng meta
  // lookup riêng để label/icon đúng nguồn.
  const blockSelector = '[data-block-id], [data-rexer-section]';
  const elementSelector = '[data-element-id], [data-rexer-cta]';
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
    // Code template sections — label from data-rexer-label attr (set by
    // PageOverlayView based on meta.tracking.sections lookup). Sections
    // co-exist với blocks ở cùng Map; mock breakdown render unified.
    document
      .querySelectorAll<HTMLElement>('[data-rexer-section]')
      .forEach(el => {
        const id = el.getAttribute('data-rexer-section');
        const label = el.getAttribute('data-rexer-label') ?? id ?? 'section';
        if (id) m.set(id, label);
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
        hasCustomOffsets={Object.keys(offsets).length > 0}
        onResetOffsets={resetOffsets}
      />
      {enabled && forbidden && !isAdminScope && (
        <div className='fixed top-16 right-4 z-50 max-w-sm rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900 shadow'>
          <div className='font-semibold'>Không truy cập được dữ liệu</div>
          <div className='mt-0.5 text-amber-800'>
            Tài khoản hiện không có quyền xem breakdown cho template này. Liên
            hệ staff Rexer nếu cần access.
          </div>
        </div>
      )}
      {children}
      {enabled && !narrow && (
        <div
          aria-hidden
          className='pointer-events-none fixed inset-0 z-20 bg-zinc-950/35 backdrop-blur-[1px]'
        />
      )}
      {enabled && !narrow && (
        <Gutters
          blockMeasurements={blockMeasurements}
          elementMeasurements={elementMeasurements}
          rowByBlock={rowByBlock}
          elementCards={elementCards}
          isDemo={isDemo}
          offsets={offsets}
          onOffsetChange={updateOffset}
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

/**
 * Drag-handle wrapper around each card. Renders at `(baseLeft + offset.dx,
 * baseTop + offset.dy)`; mousedown starts a drag that updates `offset` live
 * and commits to localStorage on mouseup. Cursor flips to `grabbing` while
 * active. Inner card must be `pointer-events-auto` (the shared CARD_BASE is).
 */
function DraggableCard({
  cardKey,
  baseLeft,
  baseTop,
  width,
  offset,
  onChange,
  children,
}: {
  cardKey: string;
  baseLeft: number;
  baseTop: number;
  width: number;
  offset: CardOffset;
  onChange: (key: string, off: CardOffset) => void;
  children: React.ReactNode;
}) {
  const [dragging, setDragging] = React.useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Avoid hijacking text-select inside the card if user wanted to copy stats
    // later — drag only when mousedown lands on a non-text region. For now
    // any region triggers drag; consumers don't have selectable content yet.
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startOffset = offset;
    setDragging(true);

    const onMove = (ev: MouseEvent) => {
      onChange(cardKey, {
        dx: startOffset.dx + (ev.clientX - startX),
        dy: startOffset.dy + (ev.clientY - startY),
      });
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: baseLeft + offset.dx,
        top: baseTop + offset.dy,
        width,
        cursor: dragging ? 'grabbing' : 'grab',
        // Above leader lines so dragging is unimpeded; same as gutter wrapper.
        zIndex: dragging ? 50 : 40,
        userSelect: 'none',
      }}
    >
      {children}
    </div>
  );
}

function Gutters({
  blockMeasurements,
  elementMeasurements,
  rowByBlock,
  elementCards,
  isDemo,
  offsets,
  onOffsetChange,
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
  offsets: OffsetMap;
  onOffsetChange: (key: string, off: CardOffset) => void;
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

  // Precompute the rendered position of each card (base + user offset).
  // Leader lines + draggable wrappers both read from this list so the line
  // tip follows the card while it's being dragged.
  const blockCardLayouts = orderedBlockIds
    .map((blockId, idx) => {
      const m = blockMeasurements.get(blockId);
      const row = rowByBlock.get(blockId);
      if (!m || !row) return null;
      const key = `block:${blockId}`;
      const offset = offsets[key] ?? { dx: 0, dy: 0 };
      const baseLeft = Math.max(PAGE_PAD, m.left - CARD_WIDTH - CARD_GAP);
      const baseTop = m.top;
      return { blockId, idx, m, row, key, offset, baseLeft, baseTop };
    })
    .filter(<T,>(v: T | null): v is T => v !== null);

  const elementCardLayouts = elementCards
    .map(({ elementId, label, action }) => {
      const m = elementMeasurements.get(elementId);
      if (!m) return null;
      const key = `el:${elementId}`;
      const offset = offsets[key] ?? { dx: 0, dy: 0 };
      const baseLeft = Math.min(
        winW - CARD_WIDTH - PAGE_PAD,
        m.right + CARD_GAP
      );
      const baseTop = m.top + m.height / 2 - 40;
      return { elementId, label, action, m, key, offset, baseLeft, baseTop };
    })
    .filter(<T,>(v: T | null): v is T => v !== null);

  return (
    <>
      {/* SVG layer for leader lines — tip follows the card via offsets. */}
      <svg
        aria-hidden
        className='pointer-events-none absolute top-0 left-0 z-30'
        width='100%'
        height={docHeight}
        style={{ position: 'absolute' }}
      >
        {blockCardLayouts.map(({ blockId, m, offset, baseLeft, baseTop }) => {
          // Anchor leader at the right edge of the card (closest to block).
          const cardRight = baseLeft + offset.dx + CARD_WIDTH;
          const cardCenterY = baseTop + offset.dy + 28;
          return (
            <LeaderLine
              key={`bl-${blockId}`}
              from={{ x: cardRight, y: cardCenterY }}
              to={{ x: m.left, y: m.top + 24 }}
              side='left'
            />
          );
        })}
        {elementCardLayouts.map(
          ({ elementId, m, offset, baseLeft, baseTop }) => {
            // Anchor leader at the left edge of the card (closest to button).
            const cardLeft = baseLeft + offset.dx;
            const cardCenterY = baseTop + offset.dy + 40;
            return (
              <LeaderLine
                key={`el-${elementId}`}
                from={{ x: cardLeft, y: cardCenterY }}
                to={{ x: m.right, y: m.top + m.height / 2 }}
                side='right'
              />
            );
          }
        )}
      </svg>

      {/* Block cards — draggable. */}
      {blockCardLayouts.map(
        ({ blockId, idx, row, key, offset, baseLeft, baseTop }) => (
          <DraggableCard
            key={blockId}
            cardKey={key}
            baseLeft={baseLeft}
            baseTop={baseTop}
            width={CARD_WIDTH}
            offset={offset}
            onChange={onOffsetChange}
          >
            <BlockSummaryCard index={idx} row={row} isDemo={isDemo} />
          </DraggableCard>
        )
      )}

      {/* Element cards — draggable. */}
      {elementCardLayouts.map(
        ({ elementId, label, action, key, offset, baseLeft, baseTop }) => (
          <DraggableCard
            key={elementId}
            cardKey={key}
            baseLeft={baseLeft}
            baseTop={baseTop}
            width={CARD_WIDTH}
            offset={offset}
            onChange={onOffsetChange}
          >
            <ElementStatCard
              elementId={elementId}
              label={label}
              action={action}
            />
          </DraggableCard>
        )
      )}
    </>
  );
}
