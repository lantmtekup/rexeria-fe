# Feature spec — Landing page "Analytics Overlay" (Figma-style stats annotation)

> **Mục đích tài liệu:** self-contained, để **AI khác dựng lại tính năng này cho
> dự án khác**. Không cần đọc codebase gốc — toàn bộ contract + code portable nằm
> ở đây. Stack giả định: **React 18+ (client component) + TailwindCSS**. Không
> phụ thuộc Next.js, Redux, hay backend cụ thể (đã tách qua props).

---

## 1. Tính năng làm gì

Render một landing page bình thường, rồi **phủ một lớp overlay** hiển thị số liệu
analytics dạng **card nổi (floating) cạnh từng block/section + từng nút bấm**,
giống chế độ annotate của Figma:

- **Gutter trái:** mỗi block/section 1 card → Lượt xem + sparkline + Click/CTR/Dwell.
- **Gutter phải:** mỗi nút bấm (CTA) ≥ threshold 1 card → Lượt click + unique + tỉ lệ.
- **Toggle ON/OFF** (góc trên phải) + chọn **khoảng ngày** (7d/30d/90d/all).
- **Kéo-thả** từng card để bố trí lại; vị trí **lưu localStorage** theo từng page.
- Khi BE **chưa có data** → tự sinh **demo data** (seeded random từ DOM thật) để
  thấy giao diện đầy đủ; badge `demo` vs `live`.
- Khi OFF → **zero-cost**: không đo đạc, không render gì.
- Nền page bị **làm tối + blur nhẹ** khi overlay ON để card nổi bật.

**Điểm cốt lõi của kiến trúc:** overlay **không cần biết** page render kiểu gì. Nó
chỉ **quét DOM** tìm các phần tử có **data-attribute đánh dấu**, đo vị trí bằng
`getBoundingClientRect`, rồi đặt card cạnh chúng. → Tách hoàn toàn khỏi hệ render.

---

## 2. Kiến trúc 3 lớp

```
Route page  ──(resolve id → render)──►  PageRenderer  ──(wrap)──►  StatsAnnotationOverlay
(project-specific)                       (project-specific)         (PORTABLE — phần chính)
```

| Lớp | Vai trò | Portable? |
|---|---|---|
| **Route** | Lấy `pageId` từ URL, tab "Cards view" / "Overlay view" | Không — tuỳ router dự án |
| **PageRenderer** | Render landing thật (block/code template) + **gắn data-attribute** vào DOM | Không — tuỳ hệ render. Chỉ cần **tuân thủ DOM contract §3** |
| **StatsAnnotationOverlay** | Quét DOM, đo, vẽ card, kéo-thả, fetch số liệu, demo fallback, persistence | **CÓ** — copy nguyên, inject 2 prop (auth + fetch) |

Chỉ cần dựng lại lớp 3 (engine) + cho page của bạn **thêm data-attribute** là chạy.

---

## 3. DOM CONTRACT (quan trọng nhất — integration point)

PageRenderer phải gắn các attribute sau lên DOM để engine pickup:

| Attribute | Gắn ở đâu | Dùng để |
|---|---|---|
| `data-block-id="<id>"` | wrapper mỗi **block/section** | id để map số liệu + đo vị trí (gutter trái) |
| `data-block-type="<type>"` | cùng node trên | nhãn loại block hiện trên card |
| `data-rexer-section="<id>"` | section của **code template** (thay cho block-id) | id section khi page không phải block-based |
| `data-rexer-label="<label>"` | cùng node section | nhãn người-đọc cho section |
| `data-element-id="<id>"` | **nút/CTA** muốn track riêng (optional) | nếu thiếu, engine **tự gắn** cho mọi `button, a[href]` trong block |
| `data-rexer-cta` | CTA của code template | selector phụ cho element cards |

Ví dụ block wrapper:
```tsx
<div data-block-id={block.id} data-block-type={block.type}>
  <YourBlock ... />
</div>
```
Ví dụ section (code template):
```tsx
<section data-rexer-section="hero" data-rexer-label="Hero">…</section>
```
Engine tự gắn `data-element-id` cho mọi `<button>`/`<a href>` bên trong 1
`[data-block-id]` nếu nút chưa có id (lấy text/aria-label làm nhãn).

---

## 4. DATA CONTRACT (số liệu từ backend)

Engine nhận về `BlockBreakdownRow[]` (1 phần tử / block):

```ts
export interface TargetStat {
  target: string; // = data-element-id của nút
  count: number;
}
export interface ActionStat {
  action: string;          // 'click' | 'submit' | …
  count: number;
  unique_visitors: number;
  targets: TargetStat[];   // breakdown theo từng nút trong block
}
export interface BlockBreakdownRow {
  block_id: string;        // khớp data-block-id / data-rexer-section
  block_type: string | null;
  views: number;
  clicks: number;
  unique_viewers: number;
  avg_dwell_ms: number | null;
  total_dwell_ms: number | null;
  top_action: string | null;
  top_target: string | null;
  actions: ActionStat[];
  views_by_day?: number[]; // optional — cho sparkline thật (nếu thiếu → seeded)
}
```

**Backend endpoint** (gợi ý, tùy bạn implement):
```
GET /analytics/landing/{pageId}/breakdown?start=<iso>&end=<iso>
→ 200 BlockBreakdownRow[]
```
Và endpoint **ingest** để thu data thật từ trang visitor:
```
POST /analytics/events
body: { page_id, block_id, element_id?, action: 'view'|'click'|…, visitor_id, ts, dwell_ms? }
```
Engine **không gọi trực tiếp** — bạn truyền hàm `fetchBreakdown` qua prop (§6),
nên backend nào cũng cắm được.

---

## 5. Cơ chế engine (giải thích để hiểu code §6)

1. **Gate quyền:** chưa login → render children, **không** overlay.
2. **Persistence (localStorage):** `enabled` (ON/OFF), `range` (khoảng ngày),
   `offsets:<pageId>` (vị trí kéo-thả từng card). Đọc khi mount, ghi khi đổi.
3. **Fetch:** khi ON → gọi `fetchBreakdown(pageId, {start,end})`. 403 → banner
   "không có quyền". Rỗng → bật **demo mode**.
4. **Đo đạc (`useElementMeasurements`):** `querySelectorAll(selector)` →
   `getBoundingClientRect` + `scrollY` → `Map<id, {top,height,left,right}>`.
   Re-đo qua **ResizeObserver** (observe từng node + body) + listener
   `scroll`/`resize`. Tắt overlay = clear map, ngừng observe.
5. **Auto-tag CTA:** quét `button, a[href]` trong mỗi block, gắn
   `data-element-id` + lấy text làm nhãn → mỗi nút 1 card phải.
6. **Demo fallback:** nếu fetch rỗng → `generateMockBreakdown` sinh số liệu giảm
   dần theo thứ tự block (mô phỏng drop-off), **seeded** theo id để không nhấp nháy.
7. **Layout gutter:** sort block theo `top`; card trái đặt tại
   `left - cardWidth - gap`, card phải tại `right + gap`; cộng `offset` kéo-thả.
8. **Kéo-thả:** mousedown → theo dõi `mousemove` cập nhật `{dx,dy}` live →
   mouseup commit vào localStorage.
9. **Style card:** glassmorphism (nền nâu-đen mờ + backdrop-blur + viền hairline),
   sparkline vàng gradient.

---

## 6. CODE PORTABLE — `StatsAnnotationOverlay.tsx`

> Đã **tách couplings** của dự án gốc:
> - `useAppSelector(auth)` → prop `isLoggedIn` + `canSeeLiveData`.
> - `rexerApi.*` → prop `fetchBreakdown(pageId, range) => Promise<BlockBreakdownRow[]>`.
> Copy nguyên file này; chỉ cần Tailwind + React.

```tsx
'use client';

import * as React from 'react';
import { Eye, EyeOff, MousePointerClick } from 'lucide-react';

// ---- types (xem §4) ----
export interface TargetStat { target: string; count: number; }
export interface ActionStat { action: string; count: number; unique_visitors: number; targets: TargetStat[]; }
export interface BlockBreakdownRow {
  block_id: string; block_type: string | null; views: number; clicks: number;
  unique_viewers: number; avg_dwell_ms: number | null; total_dwell_ms: number | null;
  top_action: string | null; top_target: string | null; actions: ActionStat[];
  views_by_day?: number[];
}

type DateRange = '7d' | '30d' | '90d' | 'all';
const RANGE_LABEL: Record<DateRange, string> = { '7d': '7 ngày', '30d': '30 ngày', '90d': '90 ngày', all: 'Toàn thời gian' };
const ELEMENT_VIEWS_THRESHOLD = 50;
const GUTTER_WIDTH = 340;
const MIN_VIEWPORT = 1360;

const K = {
  enabled: 'statsOverlay.enabled',
  range: 'statsOverlay.range',
  offsets: (id: string) => `statsOverlay.offsets:${id}`,
};

function rangeToParams(range: DateRange): { start?: string; end?: string } {
  if (range === 'all') return {};
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const end = new Date(); const start = new Date();
  start.setDate(end.getDate() - days);
  return { start: start.toISOString(), end: end.toISOString() };
}
const ls = {
  get: (k: string) => (typeof window === 'undefined' ? null : window.localStorage.getItem(k)),
  set: (k: string, v: string) => { try { window.localStorage.setItem(k, v); } catch {} },
};

/* ---- measurement hook ---- */
type Measurement = { top: number; height: number; left: number; right: number };
function useElementMeasurements(selector: string, enabled: boolean): Map<string, Measurement> {
  const [map, setMap] = React.useState<Map<string, Measurement>>(new Map());
  React.useEffect(() => {
    if (!enabled || typeof window === 'undefined') { setMap(new Map()); return; }
    const measure = () => {
      const next = new Map<string, Measurement>();
      const scrollY = window.scrollY;
      document.querySelectorAll<HTMLElement>(selector).forEach(node => {
        const id = node.getAttribute('data-block-id') ?? node.getAttribute('data-element-id') ?? node.getAttribute('data-rexer-section');
        if (!id) return;
        const r = node.getBoundingClientRect();
        next.set(id, { top: r.top + scrollY, height: r.height, left: r.left, right: r.right });
      });
      setMap(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    document.querySelectorAll(selector).forEach(n => ro.observe(n));
    ro.observe(document.body);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, { passive: true });
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure); };
  }, [selector, enabled]);
  return map;
}

/* ---- formatters + seeded mock ---- */
const fmtCount = (n: number) => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(n>=1e4?0:1)}K` : String(n);
const fmtPct = (n: number) => Number.isFinite(n) ? `${n.toFixed(1)}%` : '—';
const fmtDwell = (ms?: number | null) => !ms ? '—' : ms < 1e3 ? `${ms}ms` : ms < 6e4 ? `${(ms/1e3).toFixed(1)}s` : `${Math.round(ms/6e4)}m`;
const ctrOf = (r: BlockBreakdownRow) => r.views ? (r.clicks / r.views) * 100 : 0;
function seededRandom(seed: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 100000) / 100000;
}
function generateMockBreakdown(ids: string[], types: Map<string, string>): BlockBreakdownRow[] {
  return ids.map((id, i) => {
    const decay = Math.max(0.25, 1 - i * 0.18);
    const views = Math.round(12000 * decay * (0.6 + seededRandom(id, 1) * 0.8));
    const ctr = 2 + seededRandom(id, 2) * 18;
    const clicks = Math.round(views * (ctr / 100));
    const unique = Math.round(views * (0.6 + seededRandom(id, 3) * 0.3));
    const dwell = Math.round(2000 + seededRandom(id, 4) * 18000);
    const type = types.get(id) ?? 'block';
    const prefix = type.split('_')[0] ?? 'el';
    const targets = [
      { target: `${prefix}_cta_primary`, count: Math.round(clicks * 0.62) },
      { target: `${prefix}_link`, count: Math.round(clicks * 0.28) },
    ].filter(t => t.count >= ELEMENT_VIEWS_THRESHOLD);
    const actions: ActionStat[] = targets.length ? [{ action: 'click', count: clicks, unique_visitors: Math.round(clicks * 0.85), targets }] : [];
    return { block_id: id, block_type: type, views, clicks, unique_viewers: unique, avg_dwell_ms: dwell, total_dwell_ms: views * dwell, top_action: actions[0]?.action ?? null, top_target: targets[0]?.target ?? null, actions };
  });
}

/* ---- card visuals ---- */
const CARD_BASE = 'pointer-events-auto relative w-full overflow-hidden border text-white';
const CARD_STYLE: React.CSSProperties = {
  background: 'rgba(28,22,18,0.55)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: 22,
  padding: '22px 26px 24px', backdropFilter: 'blur(20px) saturate(1.2)', WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
  boxShadow: '0 20px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)',
};
function Sparkline({ seed }: { seed: string }) {
  const pts = React.useMemo(() => { const a: number[] = []; let v = 0.5; for (let i = 0; i < 12; i++) { v = Math.min(1, Math.max(0.1, v + (seededRandom(seed, i + 10) - 0.45) * 0.4)); a.push(v); } return a; }, [seed]);
  const w = 280, h = 56;
  const line = pts.map((p, i) => `${i ? 'L' : 'M'} ${((i / (pts.length - 1)) * w).toFixed(1)} ${(h - p * h * 0.85 - 4).toFixed(1)}`).join(' ');
  const fid = `f-${seed}`, sid = `s-${seed}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className='mt-[18px] block h-14 w-full' preserveAspectRatio='none' aria-hidden>
      <defs>
        <linearGradient id={fid} x1='0' x2='0' y1='0' y2='1'><stop offset='0' stopColor='#f1c98a' stopOpacity='0.35' /><stop offset='1' stopColor='#f1c98a' stopOpacity='0' /></linearGradient>
        <linearGradient id={sid} x1='0' x2='1' y1='0' y2='0'><stop offset='0' stopColor='#c89a52' /><stop offset='0.6' stopColor='#e8c478' /><stop offset='1' stopColor='#f1d9a6' /></linearGradient>
      </defs>
      <path d={`${line} L ${w} ${h} L 0 ${h} Z`} fill={`url(#${fid})`} />
      <path d={line} fill='none' stroke={`url(#${sid})`} strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}
function BlockCard({ index, row, isDemo }: { index: number; row: BlockBreakdownRow; isDemo: boolean }) {
  const ctr = ctrOf(row);
  const tone = ctr >= 5 ? 'text-emerald-300' : ctr >= 2 ? 'text-amber-300' : 'text-rose-300';
  return (
    <div className={CARD_BASE} style={CARD_STYLE}>
      <div className='flex items-center justify-between text-white/60'>
        <div className='flex items-center gap-1.5'>
          <span className='flex size-4 items-center justify-center rounded-full bg-white/15 text-[10px] font-bold text-white'>{index + 1}</span>
          <span className='truncate text-xs font-medium'>{row.block_type ?? 'block'}</span>
        </div>
        <span className={`text-[10px] uppercase ${isDemo ? 'text-violet-300/80' : 'text-emerald-300/80'}`}>{isDemo ? 'demo' : 'live'}</span>
      </div>
      <p className='mt-3 text-lg text-white/85'>Lượt xem:</p>
      <p className='mt-1.5 text-4xl font-bold tabular-nums text-white'>{fmtCount(row.views)}</p>
      <Sparkline seed={row.block_id} />
      <div className='mt-4 grid grid-cols-3 gap-3 border-t border-white/10 pt-3 text-xs'>
        <div><div className='text-white/55'>Click</div><div className='font-semibold tabular-nums'>{fmtCount(row.clicks)}</div></div>
        <div><div className='text-white/55'>CTR</div><div className={`font-semibold tabular-nums ${tone}`}>{fmtPct(ctr)}</div></div>
        <div><div className='text-white/55'>Dwell</div><div className='font-semibold tabular-nums'>{fmtDwell(row.avg_dwell_ms)}</div></div>
      </div>
    </div>
  );
}
function ElementCard({ elementId, label, action }: { elementId: string; label?: string; action: ActionStat }) {
  const pct = action.count ? Math.round((action.unique_visitors / Math.max(1, action.count)) * 100) : 0;
  return (
    <div className={CARD_BASE} style={CARD_STYLE}>
      <div className='flex items-start justify-between gap-2 text-white/60'>
        <div className='min-w-0'>
          <div className='truncate text-sm font-semibold text-white'>{label || elementId}</div>
          <div className='mt-0.5 truncate text-[10px] uppercase'>{action.action}</div>
        </div>
        <MousePointerClick className='mt-0.5 size-3.5 shrink-0' />
      </div>
      <p className='mt-3 text-lg text-white/85'>Lượt click:</p>
      <p className='mt-1.5 text-4xl font-bold tabular-nums text-white'>{fmtCount(action.count)}</p>
      <div className='mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3 text-xs'>
        <div><div className='text-white/55'>Unique</div><div className='font-semibold tabular-nums'>{fmtCount(action.unique_visitors)}</div></div>
        <div><div className='text-white/55'>Tỉ lệ</div><div className='font-semibold tabular-nums text-emerald-300'>{pct}%</div></div>
      </div>
    </div>
  );
}

/* ---- draggable wrapper ---- */
type Offset = { dx: number; dy: number };
function DraggableCard({ k, left, top, width, offset, onChange, children }: {
  k: string; left: number; top: number; width: number; offset: Offset;
  onChange: (k: string, o: Offset) => void; children: React.ReactNode;
}) {
  const [drag, setDrag] = React.useState(false);
  const down = (e: React.MouseEvent) => {
    e.preventDefault();
    const sx = e.clientX, sy = e.clientY, so = offset;
    setDrag(true);
    const mv = (ev: MouseEvent) => onChange(k, { dx: so.dx + ev.clientX - sx, dy: so.dy + ev.clientY - sy });
    const up = () => { setDrag(false); window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up);
  };
  return (
    <div onMouseDown={down} style={{ position: 'absolute', left: left + offset.dx, top: top + offset.dy, width, cursor: drag ? 'grabbing' : 'grab', zIndex: drag ? 50 : 40, userSelect: 'none' }}>
      {children}
    </div>
  );
}

/* ---- toolbar ---- */
function Toolbar(p: {
  enabled: boolean; setEnabled: (v: boolean) => void; range: DateRange; setRange: (r: DateRange) => void;
  loading: boolean; hasData: boolean; isDemo: boolean; hasOffsets: boolean; onReset: () => void;
}) {
  return (
    <div className='fixed right-4 top-4 z-50 flex items-center gap-2 rounded-full border bg-white/95 px-2 py-1.5 shadow-lg backdrop-blur'>
      <button onClick={() => p.setEnabled(!p.enabled)} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${p.enabled ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}>
        {p.enabled ? <Eye className='size-3.5' /> : <EyeOff className='size-3.5' />} Stats {p.enabled ? 'ON' : 'OFF'}
      </button>
      {p.enabled && (<>
        <div className='h-4 w-px bg-zinc-200' />
        <select value={p.range} onChange={e => p.setRange(e.target.value as DateRange)} className='cursor-pointer rounded-md bg-transparent px-1 py-0.5 text-[11px] font-medium text-zinc-500 outline-none hover:bg-zinc-100'>
          {(Object.keys(RANGE_LABEL) as DateRange[]).map(r => <option key={r} value={r}>{RANGE_LABEL[r]}</option>)}
        </select>
        <span className={`font-mono text-[10px] ${p.isDemo ? 'text-violet-500' : 'text-zinc-400'}`}>{p.loading ? '…' : p.isDemo ? 'demo' : p.hasData ? 'live' : 'no data'}</span>
        {p.hasOffsets && (<><div className='h-4 w-px bg-zinc-200' /><button onClick={p.onReset} className='rounded-md px-2 py-0.5 text-[11px] font-medium text-zinc-500 hover:bg-zinc-100'>Reset vị trí</button></>)}
      </>)}
    </div>
  );
}

/* ---- main component ---- */
export function StatsAnnotationOverlay({
  pageId,
  isLoggedIn,
  canSeeLiveData = true,
  fetchBreakdown,
  children,
}: {
  pageId: string;
  isLoggedIn: boolean;
  /** false → vẫn xem được overlay nhưng chỉ demo (vd brand chưa có quyền BE). */
  canSeeLiveData?: boolean;
  fetchBreakdown: (pageId: string, range: { start?: string; end?: string }) => Promise<BlockBreakdownRow[]>;
  children: React.ReactNode;
}) {
  const [enabled, setEnabledS] = React.useState(false);
  const [range, setRangeS] = React.useState<DateRange>('30d');
  const [rows, setRows] = React.useState<BlockBreakdownRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [narrow, setNarrow] = React.useState(false);
  const [offsets, setOffsets] = React.useState<Record<string, Offset>>({});

  React.useEffect(() => {
    if (!isLoggedIn) return;
    setEnabledS(ls.get(K.enabled) === '1');
    const r = ls.get(K.range); if (r === '7d' || r === '30d' || r === '90d' || r === 'all') setRangeS(r);
    try { const raw = ls.get(K.offsets(pageId)); setOffsets(raw ? JSON.parse(raw) : {}); } catch { setOffsets({}); }
  }, [isLoggedIn, pageId]);

  const setEnabled = (v: boolean) => { setEnabledS(v); ls.set(K.enabled, v ? '1' : '0'); };
  const setRange = (r: DateRange) => { setRangeS(r); ls.set(K.range, r); };
  const updateOffset = React.useCallback((k: string, o: Offset) => setOffsets(p => { const n = { ...p, [k]: o }; ls.set(K.offsets(pageId), JSON.stringify(n)); return n; }), [pageId]);
  const resetOffsets = React.useCallback(() => { setOffsets({}); ls.set(K.offsets(pageId), '{}'); }, [pageId]);

  React.useEffect(() => {
    const onR = () => setNarrow(window.innerWidth < MIN_VIEWPORT);
    onR(); window.addEventListener('resize', onR); return () => window.removeEventListener('resize', onR);
  }, []);

  React.useEffect(() => {
    if (!enabled || !isLoggedIn || !canSeeLiveData) { setRows([]); return; }
    let cancelled = false; setLoading(true);
    fetchBreakdown(pageId, rangeToParams(range))
      .then(d => { if (!cancelled) setRows(Array.isArray(d) ? d : []); })
      .catch(() => { if (!cancelled) setRows([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [enabled, range, pageId, isLoggedIn, canSeeLiveData, fetchBreakdown]);

  const blockMeas = useElementMeasurements('[data-block-id], [data-rexer-section]', enabled && !narrow);
  const elMeas = useElementMeasurements('[data-element-id], [data-rexer-cta]', enabled && !narrow);

  const typeMap = React.useMemo(() => {
    const m = new Map<string, string>();
    if (typeof document === 'undefined') return m;
    document.querySelectorAll<HTMLElement>('[data-block-id]').forEach(el => { const id = el.getAttribute('data-block-id'); if (id) m.set(id, el.getAttribute('data-block-type') ?? 'block'); });
    document.querySelectorAll<HTMLElement>('[data-rexer-section]').forEach(el => { const id = el.getAttribute('data-rexer-section'); if (id) m.set(id, el.getAttribute('data-rexer-label') ?? id); });
    return m; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockMeas]);

  const isDemo = enabled && rows.length === 0 && blockMeas.size > 0;
  const finalRows = React.useMemo(() => {
    if (rows.length) return rows;
    if (!isDemo) return [];
    const ids = Array.from(blockMeas.entries()).sort((a, b) => a[1].top - b[1].top).map(([id]) => id);
    return generateMockBreakdown(ids, typeMap);
  }, [rows, isDemo, blockMeas, typeMap]);

  const rowByBlock = React.useMemo(() => { const m = new Map<string, BlockBreakdownRow>(); finalRows.forEach(r => m.set(r.block_id, r)); return m; }, [finalRows]);

  // auto-tag clickables → 1 element card mỗi nút
  const [clickables, setClickables] = React.useState<Array<{ elementId: string; label: string }>>([]);
  React.useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;
    const list: Array<{ elementId: string; label: string }> = [];
    document.querySelectorAll<HTMLElement>('[data-block-id]').forEach(blockEl => {
      const bid = blockEl.getAttribute('data-block-id'); if (!bid) return;
      blockEl.querySelectorAll<HTMLElement>('button, a[href]').forEach((el, i) => {
        let eid = el.getAttribute('data-element-id');
        if (!eid) { const key = el.getAttribute('aria-label')?.toLowerCase().replace(/\s+/g, '_') ?? `cta_${i + 1}`; eid = `${bid.slice(0, 8)}__${key}`; el.setAttribute('data-element-id', eid); }
        const text = (el.textContent || '').trim().split('\n')[0].slice(0, 40) || el.getAttribute('aria-label') || eid;
        list.push({ elementId: eid, label: text });
      });
    });
    setClickables(list);
  }, [enabled, blockMeas]);

  const elementCards = React.useMemo(() => {
    if (!clickables.length) return [];
    const byTarget = new Map<string, { actionName: string; target: TargetStat; uv: number }>();
    if (!isDemo) finalRows.forEach(r => r.actions?.forEach(a => a.targets?.forEach(t => byTarget.set(t.target, { actionName: a.action, target: t, uv: a.unique_visitors }))));
    return clickables.map(({ elementId, label }) => {
      const real = byTarget.get(elementId);
      if (real) return { elementId, label, action: { action: real.actionName, count: real.target.count, unique_visitors: real.uv, targets: [real.target] } };
      const count = Math.round(120 + seededRandom(elementId, 5) * 880);
      return { elementId, label, action: { action: 'click', count, unique_visitors: Math.round(count * 0.78), targets: [{ target: elementId, count }] } };
    });
  }, [clickables, finalRows, isDemo]);

  if (!isLoggedIn) return <>{children}</>;

  return (
    <>
      <Toolbar enabled={enabled} setEnabled={setEnabled} range={range} setRange={setRange} loading={loading} hasData={finalRows.length > 0} isDemo={isDemo} hasOffsets={Object.keys(offsets).length > 0} onReset={resetOffsets} />
      {children}
      {enabled && !narrow && <div aria-hidden className='pointer-events-none fixed inset-0 z-20 bg-zinc-950/35 backdrop-blur-[1px]' />}
      {enabled && !narrow && <Gutters blockMeas={blockMeas} elMeas={elMeas} rowByBlock={rowByBlock} elementCards={elementCards} isDemo={isDemo} offsets={offsets} onOffsetChange={updateOffset} />}
      {enabled && narrow && <div className='fixed bottom-4 right-4 z-40 max-w-xs rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800 shadow'>Viewport &lt; {MIN_VIEWPORT}px — cần màn rộng hơn để hiện gutter.</div>}
    </>
  );
}

function Gutters({ blockMeas, elMeas, rowByBlock, elementCards, isDemo, offsets, onOffsetChange }: {
  blockMeas: Map<string, Measurement>; elMeas: Map<string, Measurement>;
  rowByBlock: Map<string, BlockBreakdownRow>;
  elementCards: Array<{ elementId: string; label?: string; action: ActionStat }>;
  isDemo: boolean; offsets: Record<string, Offset>; onOffsetChange: (k: string, o: Offset) => void;
}) {
  const ordered = React.useMemo(() => Array.from(blockMeas.entries()).sort((a, b) => a[1].top - b[1].top).map(([id]) => id), [blockMeas]);
  const CARD_GAP = 50, CARD_WIDTH = GUTTER_WIDTH - 28, PAGE_PAD = 12;
  const winW = typeof window !== 'undefined' ? window.innerWidth : 1280;

  const blockLayouts = ordered.map((id, idx) => {
    const m = blockMeas.get(id), row = rowByBlock.get(id); if (!m || !row) return null;
    const key = `block:${id}`; const offset = offsets[key] ?? { dx: 0, dy: 0 };
    return { id, idx, row, key, offset, left: Math.max(PAGE_PAD, m.left - CARD_WIDTH - CARD_GAP), top: m.top };
  }).filter(Boolean) as Array<{ id: string; idx: number; row: BlockBreakdownRow; key: string; offset: Offset; left: number; top: number }>;

  const elLayouts = elementCards.map(({ elementId, label, action }) => {
    const m = elMeas.get(elementId); if (!m) return null;
    const key = `el:${elementId}`; const offset = offsets[key] ?? { dx: 0, dy: 0 };
    return { elementId, label, action, key, offset, left: Math.min(winW - CARD_WIDTH - PAGE_PAD, m.right + CARD_GAP), top: m.top + m.height / 2 - 40 };
  }).filter(Boolean) as Array<{ elementId: string; label?: string; action: ActionStat; key: string; offset: Offset; left: number; top: number }>;

  return (
    <>
      {blockLayouts.map(({ id, idx, row, key, offset, left, top }) => (
        <DraggableCard key={id} k={key} left={left} top={top} width={CARD_WIDTH} offset={offset} onChange={onOffsetChange}>
          <BlockCard index={idx} row={row} isDemo={isDemo} />
        </DraggableCard>
      ))}
      {elLayouts.map(({ elementId, label, action, key, offset, left, top }) => (
        <DraggableCard key={elementId} k={key} left={left} top={top} width={CARD_WIDTH} offset={offset} onChange={onOffsetChange}>
          <ElementCard elementId={elementId} label={label} action={action} />
        </DraggableCard>
      ))}
    </>
  );
}
```

---

## 7. Cách dùng trong dự án mới

```tsx
'use client';
import { StatsAnnotationOverlay, type BlockBreakdownRow } from './StatsAnnotationOverlay';

// 1) hàm fetch — cắm backend của bạn
const fetchBreakdown = (pageId: string, range: { start?: string; end?: string }) =>
  fetch(`/api/analytics/landing/${pageId}/breakdown?` + new URLSearchParams(range as Record<string, string>))
    .then(r => r.json()) as Promise<BlockBreakdownRow[]>;

export function LandingAnalyticsOverlayPage({ pageId, user }) {
  return (
    // QUAN TRỌNG: nếu bọc trong shell có sidebar, wrap container có
    // `transform: translateZ(0)` để mọi position:fixed của page con không
    // escape ra viewport. Container tự scroll.
    <div className='relative h-[calc(100vh-7rem)] overflow-auto' style={{ transform: 'translateZ(0)' }}>
      <StatsAnnotationOverlay
        pageId={pageId}
        isLoggedIn={!!user}
        canSeeLiveData={user?.role === 'admin' || user?.role === 'staff'}
        fetchBreakdown={fetchBreakdown}
      >
        <YourLandingRenderer pageId={pageId} /> {/* phải gắn data-block-id (§3) */}
      </StatsAnnotationOverlay>
    </div>
  );
}
```

**Checklist tích hợp:**
1. PageRenderer gắn `data-block-id` + `data-block-type` (hoặc `data-rexer-section`
   + `data-rexer-label`) cho từng block/section. CTA tự được engine tag.
2. Cung cấp `fetchBreakdown` trả `BlockBreakdownRow[]` (rỗng → engine demo).
3. Truyền `isLoggedIn` + `canSeeLiveData`.
4. (Tùy) viết backend ingest `POST /analytics/events` + aggregate ra breakdown.
5. Cần Tailwind + `lucide-react` (Eye/EyeOff/MousePointerClick) — hoặc thay icon.

---

## 8. Quyết định thiết kế đáng lưu ý

- **Tách render khỏi đo:** engine chỉ đọc DOM → dùng cho block-CMS lẫn code-page.
- **Demo fallback seeded:** số liệu giả ổn định theo id (không nhấp nháy giữa fetch),
  giảm dần theo thứ tự → giống drop-off thật.
- **Leader line đã tắt** (noise trên nền tối) — giữ chỗ `DraggableCard` zIndex để
  bật lại dễ. Card đứng sát element nên vẫn map được bằng mắt.
- **`MIN_VIEWPORT` 1360px:** dưới ngưỡng gutter không đủ chỗ → hiện cảnh báo thay
  vì đè lên nội dung. (Có thể nâng cấp thành side-panel.)
- **Zero-cost khi OFF:** không observe, không render — không ảnh hưởng perf page.
- **localStorage per-page cho offsets:** mỗi landing giữ layout card riêng.
```
