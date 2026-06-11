'use client';

import { useEffect, useRef, useState } from 'react';

interface StutterEvent {
  t: number;
  scrollY: number;
  type: 'spike' | 'cluster';
  frameMs: number; // for spike: that frame's ms; for cluster: avg of cluster
  clusterLen: number; // number of slow frames in this cluster (1 for spike)
  velocity: number;
  triggers: string;
  section: string;
}

// Threshold tuning:
//   SPIKE = single frame ≥ 20ms (vs 16.67ms target). Catches obvious 1-frame
//           drops. Lowered from 24ms — at 60fps even a 20ms frame is a
//           visible "tick".
//   SLOW  = ≥ 18ms. Used for cluster detection only — many consecutive
//           18-19ms frames (each individually below SPIKE) compound into
//           visible "khựng" without firing the single-frame detector.
const SPIKE_MS = 20;
const SLOW_MS = 18;
const CLUSTER_MIN = 3; // 3+ consecutive SLOW frames = stutter cluster

const STRIP_LEN = 60; // 1 second of frame history at 60fps

export default function DebugOverlay() {
  const [open, setOpen] = useState(false);
  const [stutters, setStutters] = useState<StutterEvent[]>([]);
  const [flash, setFlash] = useState(false);
  const startTRef = useRef(performance.now());

  const liveRef = useRef({
    fps: 0,
    avgFps: 0,
    avgFrame: 0,
    worstFrame: 0,
    variance: 0,
    scrollY: 0,
    velocity: 0,
    triggerCount: 0,
    activeTriggers: 'none',
    longTasks: 0,
    strip: [] as number[],
  });
  const [, force] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (new URLSearchParams(window.location.search).has('debug')) setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'D' || e.key === 'd')) setOpen(v => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!open) return;

    let rafId = 0;
    let last = performance.now();
    const frameTimes: number[] = [];
    const strip: number[] = [];
    let lastUiUpdate = 0;
    let flashClearT: ReturnType<typeof setTimeout> | null = null;

    // Cluster tracking
    let clusterRun = 0; // current consecutive slow frame count
    let clusterStartScroll = 0;
    let clusterSum = 0;

    let lt: PerformanceObserver | null = null;
    let longTaskCount = 0;
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        lt = new PerformanceObserver(list => {
          longTaskCount += list.getEntries().length;
        });
        lt.observe({ entryTypes: ['longtask'] });
      } catch {}
    }

    // Pre-cache section bounds so spike capture doesn't query the DOM on
    // every slow frame (overlay was adding ~2ms of meta-work per spike,
    // pushing 18ms frames over the 20ms threshold and self-reporting them).
    type SectionRef = { name: string; top: number; bottom: number };
    let cachedSections: SectionRef[] = [];
    const refreshSections = () => {
      cachedSections = Array.from(
        document.querySelectorAll<HTMLElement>('main > *, section')
      ).map(s => {
        const cls = s.className || '';
        let name: string | null = null;
        if (s.id) name = s.id;
        else if (typeof cls === 'string') {
          name =
            cls
              .split(' ')
              .find(c => /hero|details|product|sku|variant|intro/.test(c)) ||
            null;
        }
        return {
          name: name || s.tagName.toLowerCase(),
          top: s.offsetTop,
          bottom: s.offsetTop + s.offsetHeight,
        };
      });
    };
    refreshSections();
    window.addEventListener('resize', refreshSections, { passive: true });

    const sectionFor = (y: number): string => {
      for (const s of cachedSections) {
        if (y >= s.top && y <= s.bottom) return s.name;
      }
      return '?';
    };

    const captureContext = () => {
      const lenis = (window as unknown as { __lenis?: { velocity?: number } })
        .__lenis;
      const ST = (
        window as unknown as {
          ScrollTrigger?: {
            getAll?: () => Array<{
              vars?: { scrub?: unknown };
              isActive?: boolean;
              trigger?: { className?: string; tagName?: string };
            }>;
          };
        }
      ).ScrollTrigger;
      const triggers = ST?.getAll?.() || [];
      const active = triggers
        .filter(t => t.isActive)
        .map(t => {
          const cls = t.trigger?.className || '';
          const name =
            typeof cls === 'string'
              ? cls
                  .split(' ')
                  .find(c => /hero|details|product|sku|variant|intro/.test(c))
              : null;
          return name || t.trigger?.tagName?.toLowerCase() || '?';
        })
        .slice(0, 4)
        .join('+');
      return {
        velocity: lenis?.velocity ?? 0,
        triggers: active || '-',
        scrollY: Math.round(window.scrollY),
        section: sectionFor(window.scrollY),
      };
    };

    const fireFlash = () => {
      setFlash(true);
      if (flashClearT) clearTimeout(flashClearT);
      flashClearT = setTimeout(() => setFlash(false), 200);
    };

    const tick = () => {
      const now = performance.now();
      const dt = now - last;
      last = now;

      frameTimes.push(dt);
      if (frameTimes.length > 60) frameTimes.shift();

      strip.push(dt);
      if (strip.length > STRIP_LEN) strip.shift();

      // ── Stutter detection ───────────────────────────────────────────
      // Pattern A — SPIKE: single frame ≥ SPIKE_MS
      if (dt >= SPIKE_MS) {
        const ctx = captureContext();
        const ev: StutterEvent = {
          t: +((now - startTRef.current) / 1000).toFixed(1),
          scrollY: ctx.scrollY,
          type: 'spike',
          frameMs: +dt.toFixed(1),
          clusterLen: 1,
          velocity: +ctx.velocity.toFixed(1),
          triggers: ctx.triggers,
          section: ctx.section,
        };
        setStutters(p => [ev, ...p].slice(0, 30));
        fireFlash();
      }

      // Pattern B — CLUSTER: N consecutive frames ≥ SLOW_MS
      if (dt >= SLOW_MS) {
        if (clusterRun === 0) {
          clusterStartScroll = Math.round(window.scrollY);
          clusterSum = 0;
        }
        clusterRun += 1;
        clusterSum += dt;
      } else {
        // Cluster ended — if it was long enough, log it
        if (clusterRun >= CLUSTER_MIN) {
          const ctx = captureContext();
          const ev: StutterEvent = {
            t: +((now - startTRef.current) / 1000).toFixed(1),
            scrollY: clusterStartScroll,
            type: 'cluster',
            frameMs: +(clusterSum / clusterRun).toFixed(1),
            clusterLen: clusterRun,
            velocity: +ctx.velocity.toFixed(1),
            triggers: ctx.triggers,
            section: ctx.section,
          };
          setStutters(p => [ev, ...p].slice(0, 30));
          fireFlash();
        }
        clusterRun = 0;
      }

      // ── UI refresh @ 5Hz ────────────────────────────────────────────
      if (now - lastUiUpdate > 200) {
        lastUiUpdate = now;
        const sum = frameTimes.reduce((a, b) => a + b, 0);
        const avgDt = sum / frameTimes.length;
        const worstDt = Math.max(...frameTimes);
        // population variance
        const variance =
          frameTimes.reduce((acc, f) => acc + (f - avgDt) ** 2, 0) /
          frameTimes.length;
        const lenis = (window as unknown as { __lenis?: { velocity?: number } })
          .__lenis;
        const ST = (
          window as unknown as {
            ScrollTrigger?: {
              getAll?: () => Array<{
                vars?: { scrub?: unknown };
                isActive?: boolean;
                trigger?: { className?: string; tagName?: string };
              }>;
            };
          }
        ).ScrollTrigger;
        const triggers = ST?.getAll?.() || [];
        const active = triggers.filter(
          t => t.isActive && t.vars?.scrub != null
        );
        const names = active
          .map(t => {
            const cls = t.trigger?.className || '';
            return typeof cls === 'string'
              ? cls
                  .split(' ')
                  .find(c =>
                    /hero|details|product|sku|variant|intro/.test(c)
                  ) || cls.split(' ')[0]
              : '?';
          })
          .slice(0, 3)
          .join(', ');

        liveRef.current = {
          fps: dt > 0 ? Math.round(1000 / dt) : 0,
          avgFps: avgDt > 0 ? Math.round(1000 / avgDt) : 0,
          avgFrame: +avgDt.toFixed(1),
          worstFrame: +worstDt.toFixed(1),
          variance: +variance.toFixed(2),
          scrollY: Math.round(window.scrollY),
          velocity: lenis?.velocity ? +lenis.velocity.toFixed(1) : 0,
          triggerCount: triggers.length,
          activeTriggers: names || 'none',
          longTasks: longTaskCount,
          strip: [...strip],
        };
        force(n => n + 1);
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      lt?.disconnect();
      window.removeEventListener('resize', refreshSections);
      if (flashClearT) clearTimeout(flashClearT);
    };
  }, [open]);

  if (!open) {
    return (
      <button
        type='button'
        onClick={() => setOpen(true)}
        // Top-right (was bottom-left) so the floating "D" doesn't overlap
        // the sticky menu on mobile — the menu always sits at bottom and
        // grows wider on small viewports.
        className='fixed top-4 right-4 z-[9999] h-7 w-7 rounded-full bg-black/40 font-mono text-xs text-white opacity-60 hover:opacity-100'
        aria-label='Open debug overlay'
        title='Shift+D'
      >
        D
      </button>
    );
  }

  const s = liveRef.current;
  const fpsColor =
    s.avgFps >= 55 ? '#7CFC00' : s.avgFps >= 40 ? '#FFD700' : '#FF6B6B';
  const frameColor =
    s.avgFrame <= 18 ? '#7CFC00' : s.avgFrame <= 25 ? '#FFD700' : '#FF6B6B';
  const varColor =
    s.variance < 4 ? '#7CFC00' : s.variance < 10 ? '#FFD700' : '#FF6B6B';

  return (
    <>
      <div
        className='pointer-events-none fixed inset-0 z-[9998] transition-opacity duration-200'
        style={{ backgroundColor: '#FF000022', opacity: flash ? 1 : 0 }}
      />

      <div
        className='pointer-events-auto fixed bottom-4 left-4 z-[9999] rounded-lg bg-black/90 px-4 py-3 font-mono text-[11px] leading-snug text-white select-none'
        style={{ minWidth: 420, maxHeight: '78vh', overflowY: 'auto' }}
      >
        <div className='mb-2 flex items-center justify-between gap-3'>
          <strong className='text-[10px] tracking-wider text-white/70 uppercase'>
            perf · stutters: {stutters.length}
          </strong>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={() => setStutters([])}
              className='px-1 text-[10px] text-white/50 hover:text-white'
            >
              clear
            </button>
            <button
              type='button'
              onClick={() => setOpen(false)}
              className='text-white/50 hover:text-white'
            >
              ×
            </button>
          </div>
        </div>

        {/* Visual frame strip — last 60 frames as colored vertical bars.
            Easier to spot stutter PATTERNS than reading numbers. Each bar's
            height encodes frame ms (capped at 50ms = full height). Color:
            green ≤16ms, yellow 16-20ms, orange 20-33ms, red >33ms. */}
        <div className='mb-3'>
          <div className='mb-1 text-[9px] tracking-wider text-white/40 uppercase'>
            frame strip · 1s history (target 16.67ms)
          </div>
          <div className='flex h-12 items-end gap-[1px] rounded bg-white/5 p-1'>
            {Array.from({ length: STRIP_LEN }).map((_, i) => {
              const ms = s.strip[i] ?? 0;
              const h = Math.min(100, (ms / 50) * 100);
              const color =
                ms <= 16.67
                  ? '#7CFC00'
                  : ms <= 20
                    ? '#C8E020'
                    : ms <= 33
                      ? '#FFA500'
                      : '#FF6B6B';
              return (
                <div
                  key={i}
                  style={{ height: `${h}%`, background: color, width: 4 }}
                />
              );
            })}
          </div>
        </div>

        <table className='mb-3 w-full'>
          <tbody>
            <Row label='FPS (avg / now)'>
              <span style={{ color: fpsColor }}>{s.avgFps}</span> / {s.fps}
            </Row>
            <Row label='frame avg / variance'>
              <span style={{ color: frameColor }}>
                {s.avgFrame.toFixed(1)}ms
              </span>{' '}
              · <span style={{ color: varColor }}>σ²={s.variance}</span>
            </Row>
            <Row label='long tasks (50ms+)'>
              <span style={{ color: s.longTasks ? '#FF6B6B' : '#7CFC00' }}>
                {s.longTasks}
              </span>
            </Row>
            <Row label='scrollY · vel'>
              {s.scrollY} · {s.velocity > 0 ? '↓' : s.velocity < 0 ? '↑' : '·'}
              {Math.abs(s.velocity)}
            </Row>
            <Row label='scrubbing'>
              <span className='text-white/70'>{s.activeTriggers}</span>
            </Row>
          </tbody>
        </table>

        <div className='border-t border-white/15 pt-2'>
          <div className='mb-1 text-[10px] tracking-wider text-white/60 uppercase'>
            stutter log · spike ≥{SPIKE_MS}ms · cluster {CLUSTER_MIN}+ frames ≥
            {SLOW_MS}ms
          </div>
          {stutters.length === 0 ? (
            <div className='text-white/40 italic'>
              no stutters captured — scroll to test
            </div>
          ) : (
            <div className='font-mono text-[10px] leading-relaxed'>
              <div className='mb-1 grid grid-cols-[36px_60px_50px_55px_36px_85px_1fr] gap-1.5 border-b border-white/10 pb-1 text-white/40'>
                <span>t</span>
                <span>type</span>
                <span>frame</span>
                <span>scrollY</span>
                <span>dir</span>
                <span>section</span>
                <span>triggers</span>
              </div>
              {stutters.map((ev, i) => (
                <div
                  key={i}
                  className='grid grid-cols-[36px_60px_50px_55px_36px_85px_1fr] gap-1.5 py-0.5'
                  style={{
                    color:
                      ev.frameMs > 33 || ev.clusterLen > 6
                        ? '#FF6B6B'
                        : ev.frameMs > 22 || ev.clusterLen > 4
                          ? '#FFD700'
                          : '#FFFFFF',
                  }}
                >
                  <span>{ev.t}s</span>
                  <span className='text-white/70'>
                    {ev.type === 'cluster' ? `×${ev.clusterLen}` : 'spike'}
                  </span>
                  <span>{ev.frameMs}</span>
                  <span>{ev.scrollY}</span>
                  <span>
                    {ev.velocity > 0 ? '↓' : ev.velocity < 0 ? '↑' : '·'}
                    {Math.abs(ev.velocity)}
                  </span>
                  <span className='truncate'>{ev.section}</span>
                  <span className='truncate text-white/60' title={ev.triggers}>
                    {ev.triggers}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <tr>
      <td className='pr-3 text-white/50'>{label}</td>
      <td>{children}</td>
    </tr>
  );
}
