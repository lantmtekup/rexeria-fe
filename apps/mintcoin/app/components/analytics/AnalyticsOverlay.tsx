'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ANALYTICS_BLOCKS, type AnalyticsBlock } from './analytics-data';
import {
  fetchBlocks,
  fetchCtaBreakdown,
  fetchSummary,
  type BlockRow,
  type PageSummary,
} from './rexer-client';

interface BadgePos {
  id: string;
  top: number;
  visible: boolean;
}

interface Props {
  onLogout: () => void;
}

type Source = 'loading' | 'live' | 'error';
const RANGES = ['7d', '30d', '90d'] as const;

export default function AnalyticsOverlay({ onLogout }: Props) {
  const [positions, setPositions] = useState<BadgePos[]>([]);
  // Cards are open by default — track which blocks the user collapsed.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [range, setRange] = useState<(typeof RANGES)[number]>('7d');
  const [source, setSource] = useState<Source>('loading');
  const [summary, setSummary] = useState<PageSummary | null>(null);
  const [liveBlocks, setLiveBlocks] = useState<Record<string, BlockRow>>({});
  // Per-CTA click counts (cta_id → count) for blocks that define hotspots.
  const [ctaCounts, setCtaCounts] = useState<Record<string, number>>({});
  const rafRef = useRef<number | undefined>(undefined);

  // Fetch real data from ReXeR. No mock fallback — on auth/network failure the
  // overlay shows an explicit error state instead of fake numbers.
  useEffect(() => {
    let alive = true;
    setSource('loading');
    Promise.all([
      fetchSummary(range),
      fetchBlocks(range),
      fetchCtaBreakdown(range),
    ]).then(([sum, blocks, ctas]) => {
      if (!alive) return;
      if (blocks) {
        const map: Record<string, BlockRow> = {};
        blocks.forEach(b => (map[b.block_key] = b));
        setLiveBlocks(map);
        setCtaCounts(ctas || {});
        setSummary(sum);
        setSource('live');
      } else {
        setLiveBlocks({});
        setCtaCounts({});
        setSummary(null);
        setSource('error');
      }
    });
    return () => {
      alive = false;
    };
  }, [range]);

  // Continuous rAF: Lenis smooth-scroll makes scroll events unreliable, so read
  // bounding rects every frame to keep badges glued to their blocks.
  useEffect(() => {
    const tick = () => {
      const vh = window.innerHeight;
      const next: BadgePos[] = ANALYTICS_BLOCKS.map(b => {
        const el = document.querySelector(b.selector);
        if (!el) return { id: b.id, top: 0, visible: false };
        const r = el.getBoundingClientRect();
        const inView = r.bottom > 0 && r.top < vh;
        const top = Math.min(Math.max(r.top + 16, 92), vh - 60);
        return { id: b.id, top, visible: inView };
      });
      setPositions(prev => {
        const same =
          prev.length === next.length &&
          prev.every(
            (p, i) =>
              p.visible === next[i].visible &&
              Math.round(p.top) === Math.round(next[i].top)
          );
        return same ? prev : next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const blockById = (id: string): AnalyticsBlock =>
    ANALYTICS_BLOCKS.find(b => b.id === id)!;

  // Live metrics for a block (matched by block_key === block id). Missing row =
  // block has no events yet → all zeros.
  const metricsFor = useCallback(
    (block: AnalyticsBlock): [string, string][] => {
      const live = liveBlocks[block.id];
      const views = live?.views ?? 0;
      const clicks = live?.clicks ?? 0;
      const scroll = live ? Math.round(live.avg_scroll_depth) : 0;
      const ctr = views > 0 ? (clicks / views) * 100 : 0;
      const rows: [string, string][] = [
        ['Views', views.toLocaleString()],
        ['Clicks', clicks.toLocaleString()],
        ['Avg scroll depth', `${scroll}%`],
        ['CTR', `${ctr.toFixed(1)}%`],
      ];
      // Time-on-block — shown only once the BE returns avg_dwell_ms.
      if (live?.avg_dwell_ms != null) {
        rows.push([
          'Avg time on block',
          `${(live.avg_dwell_ms / 1000).toFixed(1)}s`,
        ]);
      }
      return rows;
    },
    [liveBlocks]
  );

  return (
    <>
      {/* Top status bar */}
      <div className='fixed top-0 right-0 left-0 z-[2500] flex flex-wrap items-center gap-x-4 gap-y-1 bg-neutral-950/90 px-4 py-2 text-xs text-white backdrop-blur'>
        <span className='font-medium tracking-wide'>📊 Analytics</span>
        <SourceChip source={source} />
        {summary && (
          <span className='text-neutral-300'>
            {summary.page_views.toLocaleString()} views ·{' '}
            {summary.unique_visitors.toLocaleString()} visitors ·{' '}
            {summary.clicks.toLocaleString()} clicks
          </span>
        )}
        <div className='ml-auto flex items-center gap-2'>
          <div className='flex overflow-hidden rounded border border-neutral-700'>
            {RANGES.map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2 py-0.5 ${
                  range === r
                    ? 'bg-amber-500 text-neutral-950'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <button
            onClick={onLogout}
            className='rounded bg-neutral-800 px-3 py-1 text-neutral-200 transition-colors hover:bg-neutral-700'
          >
            Log out
          </button>
        </div>
      </div>

      {/* Per-block badges */}
      {positions.map(p => {
        if (!p.visible) return null;
        const block = blockById(p.id);
        // Hide a block's badge/card only when it has NO data at all (no views
        // AND no clicks). Blocks without a CTA still get views/scroll-depth, so
        // they must keep showing analytics — clicks alone shouldn't gate them.
        const blockRow = liveBlocks[block.id];
        const blockViews = blockRow?.views ?? 0;
        const blockClicks = blockRow?.clicks ?? 0;
        if (source === 'live' && blockViews === 0 && blockClicks === 0)
          return null;
        const open = !collapsed[p.id]; // open by default
        const rows = metricsFor(block);
        const [heroLabel, heroValue] = rows[0];
        return (
          <div
            key={p.id}
            className='fixed right-4 z-[2400]'
            style={{ top: p.top }}
          >
            <button
              onClick={() => setCollapsed(c => ({ ...c, [p.id]: !c[p.id] }))}
              className='flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-neutral-950 shadow-lg transition-transform hover:scale-105'
            >
              📊 {block.label}
            </button>

            {open && (
              <div className='mt-2 w-64 overflow-hidden rounded-xl border border-amber-500/30 bg-neutral-900/95 text-xs text-neutral-200 shadow-2xl ring-1 ring-amber-500/10 backdrop-blur'>
                <div className='flex items-center justify-between border-b border-neutral-800 px-4 py-2.5'>
                  <span className='font-serif text-sm text-white'>
                    {block.label}
                  </span>
                  <SourceChip source={source} />
                </div>

                {source === 'error' ? (
                  <div className='px-4 py-4 text-amber-300/90'>
                    Log in to ReXeR to view metrics.
                  </div>
                ) : (
                  <>
                    {/* Hero number — the headline metric, made to pop */}
                    <div className='border-b border-neutral-800 bg-gradient-to-br from-amber-500/10 to-transparent px-4 py-3'>
                      <div className='text-[10px] tracking-wider text-amber-300/80 uppercase'>
                        {heroLabel}
                      </div>
                      <div className='bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-3xl leading-tight font-extrabold text-transparent tabular-nums drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]'>
                        {source === 'loading' ? '…' : heroValue}
                      </div>
                    </div>

                    <div className='px-4 py-2'>
                      {rows.slice(1).map(([label, value]) => (
                        <Metric
                          key={label}
                          label={label}
                          value={source === 'loading' ? '…' : value}
                        />
                      ))}
                    </div>

                    {/* Per-hotspot click breakdown (named points) */}
                    {block.ctas && block.ctas.length > 0 && (
                      <div className='border-t border-neutral-800 px-4 py-2'>
                        <div className='mb-1 text-[10px] tracking-wider text-amber-300/80 uppercase'>
                          Clicks by point
                        </div>
                        {block.ctas.map(c => (
                          <Metric
                            key={c.id}
                            label={c.label}
                            value={
                              source === 'loading'
                                ? '…'
                                : (ctaCounts[c.id] ?? 0).toLocaleString()
                            }
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

function SourceChip({ source }: { source: Source }) {
  // "LIVE · ReXeR" is hidden by design; only surface loading / not-logged-in.
  if (source === 'live') return null;
  const map = {
    loading: ['bg-neutral-700 text-neutral-300', 'Loading…'],
    error: ['bg-red-500/20 text-red-300', 'NOT LOGGED IN'],
  } as const;
  const [cls, label] = map[source];
  return <span className={`rounded px-2 py-0.5 ${cls}`}>{label}</span>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-center justify-between border-b border-neutral-800 py-1.5 last:border-0'>
      <span className='text-neutral-400'>{label}</span>
      <span className='text-sm font-bold text-amber-400 tabular-nums drop-shadow-[0_0_6px_rgba(245,158,11,0.25)]'>
        {value}
      </span>
    </div>
  );
}
