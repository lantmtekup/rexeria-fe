'use client';

import {
  Activity,
  Bookmark,
  CheckCircle2,
  Download,
  Eye,
  Hand,
  Heart,
  MessageCircle,
  MousePointerClick,
  Play,
  Search,
  Send,
  Share2,
  Sparkles,
  Sticker,
  ToggleLeft,
  ToggleRight,
  Type,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { fmtFull, fmtNum } from '../_data';
import { PortalShell } from '../_shell';

/* ---------- types + fake data ---------- */

type InteractionKind =
  | 'page_view'
  | 'block_view'
  | 'cta_click'
  | 'image_click'
  | 'hover_long'
  | 'form_submit'
  | 'video_play'
  | 'video_complete'
  | 'scroll_depth'
  | 'share'
  | 'save_bookmark'
  | 'reaction'
  | 'comment'
  | 'download'
  | 'swipe'
  | 'custom';

type InteractionMeta = {
  label: string;
  description: string;
  icon: LucideIcon;
  color: string; // bg-*
  gradient: string; // from-*
  count_30d: number;
  enabled: boolean;
  scope: 'page' | 'block' | 'element';
  default: boolean; // built-in / system
};

const INTERACTIONS: Record<InteractionKind, InteractionMeta> = {
  page_view: {
    label: 'Page view',
    description: 'Mỗi lần visitor mở trang public.',
    icon: Eye,
    color: 'bg-blue-500',
    gradient: 'from-blue-50',
    count_30d: 124_820,
    enabled: true,
    scope: 'page',
    default: true,
  },
  block_view: {
    label: 'Block view',
    description: 'Block vào viewport ≥ 50%.',
    icon: Activity,
    color: 'bg-blue-400',
    gradient: 'from-blue-50',
    count_30d: 48_310,
    enabled: true,
    scope: 'block',
    default: true,
  },
  cta_click: {
    label: 'CTA click',
    description: 'Click vào nút CTA chính / phụ.',
    icon: MousePointerClick,
    color: 'bg-emerald-500',
    gradient: 'from-emerald-50',
    count_30d: 5_620,
    enabled: true,
    scope: 'element',
    default: true,
  },
  image_click: {
    label: 'Image click',
    description: 'Click vào ảnh trong gallery / hero.',
    icon: Hand,
    color: 'bg-amber-500',
    gradient: 'from-amber-50',
    count_30d: 3_120,
    enabled: true,
    scope: 'element',
    default: true,
  },
  hover_long: {
    label: 'Hover dài',
    description: 'Hover element > 2 giây.',
    icon: MousePointerClick,
    color: 'bg-cyan-500',
    gradient: 'from-cyan-50',
    count_30d: 8_940,
    enabled: true,
    scope: 'element',
    default: true,
  },
  form_submit: {
    label: 'Form submit',
    description: 'BookingForm submit thành công.',
    icon: Send,
    color: 'bg-fuchsia-500',
    gradient: 'from-fuchsia-50',
    count_30d: 287,
    enabled: true,
    scope: 'block',
    default: true,
  },
  video_play: {
    label: 'Video play',
    description: 'Visitor bấm play video.',
    icon: Play,
    color: 'bg-rose-500',
    gradient: 'from-rose-50',
    count_30d: 2_840,
    enabled: true,
    scope: 'element',
    default: true,
  },
  video_complete: {
    label: 'Video xem hết',
    description: 'Xem ≥ 95% thời lượng video.',
    icon: CheckCircle2,
    color: 'bg-rose-400',
    gradient: 'from-rose-50',
    count_30d: 1_240,
    enabled: true,
    scope: 'element',
    default: true,
  },
  scroll_depth: {
    label: 'Scroll depth',
    description: 'Mốc scroll: 25/50/75/100% của trang.',
    icon: Activity,
    color: 'bg-indigo-500',
    gradient: 'from-indigo-50',
    count_30d: 18_400,
    enabled: true,
    scope: 'page',
    default: true,
  },
  share: {
    label: 'Share',
    description: 'Share link / copy URL.',
    icon: Share2,
    color: 'bg-blue-600',
    gradient: 'from-blue-50',
    count_30d: 142,
    enabled: true,
    scope: 'page',
    default: false,
  },
  save_bookmark: {
    label: 'Save / Bookmark',
    description: 'Lưu trang để xem lại.',
    icon: Bookmark,
    color: 'bg-violet-500',
    gradient: 'from-violet-50',
    count_30d: 68,
    enabled: false,
    scope: 'page',
    default: false,
  },
  reaction: {
    label: 'Reaction',
    description: 'Like / love / wow trên trang.',
    icon: Heart,
    color: 'bg-pink-500',
    gradient: 'from-pink-50',
    count_30d: 384,
    enabled: true,
    scope: 'element',
    default: false,
  },
  comment: {
    label: 'Comment',
    description: 'Visitor comment trên trang public.',
    icon: MessageCircle,
    color: 'bg-amber-600',
    gradient: 'from-amber-50',
    count_30d: 24,
    enabled: false,
    scope: 'page',
    default: false,
  },
  download: {
    label: 'Download',
    description: 'Tải file đính kèm trang.',
    icon: Download,
    color: 'bg-emerald-600',
    gradient: 'from-emerald-50',
    count_30d: 412,
    enabled: true,
    scope: 'element',
    default: false,
  },
  swipe: {
    label: 'Swipe',
    description: 'Swipe carousel / slide.',
    icon: Hand,
    color: 'bg-orange-500',
    gradient: 'from-orange-50',
    count_30d: 6_240,
    enabled: true,
    scope: 'block',
    default: true,
  },
  custom: {
    label: 'Custom event',
    description: 'Event tự định nghĩa qua data-track attribute.',
    icon: Sparkles,
    color: 'bg-zinc-700',
    gradient: 'from-zinc-50',
    count_30d: 1_820,
    enabled: true,
    scope: 'element',
    default: false,
  },
};

/* ---------- recent events feed ---------- */

type Event = {
  id: string;
  kind: InteractionKind;
  template_name: string;
  target?: string;
  visitor: string;
  at: string;
  meta?: string;
};

const FAKE_EVENTS: Event[] = [
  {
    id: 'e1',
    kind: 'cta_click',
    template_name: 'Coca-Cola Tết 2026',
    target: 'btn-book-now',
    visitor: 'v_8e4a',
    at: '12 giây trước',
  },
  {
    id: 'e2',
    kind: 'form_submit',
    template_name: 'Coca-Cola Zero Sugar',
    target: 'form-booking',
    visitor: 'v_2c1f',
    at: '2 phút trước',
    meta: 'name=An, phone=09xxxxxxxx',
  },
  {
    id: 'e3',
    kind: 'video_play',
    template_name: 'Fanta Watermelon',
    target: 'hero-video',
    visitor: 'v_b8d2',
    at: '3 phút trước',
  },
  {
    id: 'e4',
    kind: 'image_click',
    template_name: 'Coca-Cola Tết 2026',
    target: 'gallery-3.jpg',
    visitor: 'v_91ec',
    at: '4 phút trước',
  },
  {
    id: 'e5',
    kind: 'page_view',
    template_name: 'Sprite Lemon',
    visitor: 'v_4d80',
    at: '5 phút trước',
    meta: 'referrer=facebook.com',
  },
  {
    id: 'e6',
    kind: 'swipe',
    template_name: 'Hạ Long Bay Cruise',
    target: 'slide-1→slide-2',
    visitor: 'v_77a4',
    at: '6 phút trước',
  },
  {
    id: 'e7',
    kind: 'scroll_depth',
    template_name: 'Coca-Cola Tết 2026',
    target: '75%',
    visitor: 'v_8e4a',
    at: '7 phút trước',
  },
  {
    id: 'e8',
    kind: 'cta_click',
    template_name: 'Olympic 2026',
    target: 'btn-reserve',
    visitor: 'v_e012',
    at: '8 phút trước',
  },
  {
    id: 'e9',
    kind: 'share',
    template_name: 'Fanta Watermelon',
    target: 'facebook',
    visitor: 'v_b8d2',
    at: '10 phút trước',
  },
  {
    id: 'e10',
    kind: 'video_complete',
    template_name: 'Coca-Cola Tết 2026',
    target: 'hero-video',
    visitor: 'v_91ec',
    at: '12 phút trước',
  },
  {
    id: 'e11',
    kind: 'hover_long',
    template_name: 'Coca-Cola Zero Sugar',
    target: 'feature-1',
    visitor: 'v_2c1f',
    at: '15 phút trước',
  },
  {
    id: 'e12',
    kind: 'reaction',
    template_name: 'Coca-Cola Tết 2026',
    target: '❤',
    visitor: 'v_55bc',
    at: '18 phút trước',
  },
  {
    id: 'e13',
    kind: 'custom',
    template_name: 'Sprite Lemon',
    target: 'spin-wheel-result-win',
    visitor: 'v_3a09',
    at: '20 phút trước',
  },
  {
    id: 'e14',
    kind: 'download',
    template_name: 'Hạ Long Bay Cruise',
    target: 'brochure.pdf',
    visitor: 'v_77a4',
    at: '23 phút trước',
  },
  {
    id: 'e15',
    kind: 'block_view',
    template_name: 'Fanta Watermelon',
    target: 'BookingForm',
    visitor: 'v_b8d2',
    at: '25 phút trước',
  },
];

const SCOPE_META: Record<
  InteractionMeta['scope'],
  { label: string; chip: string }
> = {
  page: { label: 'Page-level', chip: 'bg-muted text-content-muted' },
  block: { label: 'Block-level', chip: 'bg-blue-100 text-blue-700' },
  element: { label: 'Element-level', chip: 'bg-violet-100 text-violet-700' },
};

/* ---------- page ---------- */

type ScopeFilter = 'all' | InteractionMeta['scope'];

export default function PortalCuratePage() {
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
  const [enabledMap, setEnabledMap] = useState<
    Record<InteractionKind, boolean>
  >(
    Object.fromEntries(
      (Object.keys(INTERACTIONS) as InteractionKind[]).map(k => [
        k,
        INTERACTIONS[k].enabled,
      ])
    ) as Record<InteractionKind, boolean>
  );

  const allKinds = Object.keys(INTERACTIONS) as InteractionKind[];

  const filtered = useMemo(() => {
    return allKinds.filter(k => {
      const m = INTERACTIONS[k];
      if (scopeFilter !== 'all' && m.scope !== scopeFilter) return false;
      if (
        search &&
        !m.label.toLowerCase().includes(search.toLowerCase()) &&
        !m.description.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [allKinds, scopeFilter, search]);

  const totals = useMemo(() => {
    const enabled = allKinds.filter(k => enabledMap[k]).length;
    const totalEvents = allKinds
      .filter(k => enabledMap[k])
      .reduce((s, k) => s + INTERACTIONS[k].count_30d, 0);
    return { enabled, total: allKinds.length, totalEvents };
  }, [enabledMap, allKinds]);

  const toggle = (k: InteractionKind) => {
    setEnabledMap(m => {
      const next = { ...m, [k]: !m[k] };
      toast.success(
        `${INTERACTIONS[k].label} ${next[k] ? 'đã bật' : 'đã tắt'} tracking`
      );
      return next;
    });
  };

  return (
    <PortalShell>
      {/* Header */}
      <section>
        <div className='text-2xs text-content-muted flex items-center gap-2 font-semibold tracking-wider uppercase'>
          <Sticker className='size-3' /> Curate · Loại tương tác
        </div>
        <h1 className='mt-1 text-2xl font-bold tracking-tight'>
          Quản lý tương tác visitor
        </h1>
        <p className='text-content-muted mt-1 max-w-2xl text-sm'>
          Chọn loại tương tác Rexer sẽ track trên trang public của brand. Mỗi
          loại fire 1 analytics event để dashboard tổng hợp.
        </p>
        <div className='text-2xs mt-3 inline-block rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800'>
          <strong>UI Demo · dữ liệu mẫu</strong> — số liệu event + feed
          real-time bên dưới là mock; chờ BE wire endpoint analytics events.
        </div>
      </section>

      {/* Top stats */}
      <div className='mt-4 grid grid-cols-3 gap-3'>
        <StatTile
          label='Loại đang track'
          value={`${totals.enabled}/${totals.total}`}
          hint='Có thể bật/tắt từng loại'
          color='bg-emerald-500'
          icon={CheckCircle2}
        />
        <StatTile
          label='Events 30 ngày'
          value={fmtNum(totals.totalEvents)}
          hint={`${fmtFull(totals.totalEvents)} sự kiện`}
          color='bg-blue-500'
          icon={Activity}
        />
        <StatTile
          label='Events real-time'
          value={`${FAKE_EVENTS.length} mới`}
          hint='Trong 25 phút qua'
          color='bg-fuchsia-500'
          icon={Sparkles}
        />
      </div>

      {/* Filter bar */}
      <div className='border-border mt-5 flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm'>
        <div className='border-border bg-muted flex flex-1 items-center gap-2 rounded-lg border px-3 py-1.5 lg:max-w-sm'>
          <Search className='text-muted-foreground size-3.5' />
          <input
            type='text'
            placeholder='Tìm theo tên / mô tả...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none'
          />
        </div>
        <div className='flex flex-wrap items-center gap-1'>
          {(['all', 'page', 'block', 'element'] as const).map(s => (
            <button
              key={s}
              onClick={() => setScopeFilter(s)}
              className={`text-2xs rounded-full px-2.5 py-1 font-medium transition-all ${
                scopeFilter === s
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'border-border text-content-muted hover:bg-muted border bg-white'
              }`}
            >
              {s === 'all'
                ? `Tất cả · ${allKinds.length}`
                : SCOPE_META[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Interaction cards */}
      <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {filtered.map(k => (
          <InteractionCard
            key={k}
            kind={k}
            enabled={enabledMap[k]}
            onToggle={() => toggle(k)}
          />
        ))}
      </div>

      {/* Recent events feed */}
      <section className='border-border mt-8 rounded-2xl border bg-white shadow-sm'>
        <div className='border-border flex items-center justify-between border-b px-5 py-3'>
          <div className='flex items-center gap-2'>
            <div className='flex size-7 items-center justify-center rounded-lg bg-zinc-900 text-white shadow-sm'>
              <Activity className='size-4' />
            </div>
            <div>
              <h3 className='text-sm font-semibold'>Events real-time</h3>
              <p className='text-2xs text-content-muted'>
                {FAKE_EVENTS.length} sự kiện gần nhất trên các trang public
              </p>
            </div>
          </div>
          <span className='text-3xs flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-700'>
            <span className='size-1.5 animate-pulse rounded-full bg-emerald-500' />
            LIVE feed
          </span>
        </div>
        <div className='divide-y divide-zinc-100'>
          {FAKE_EVENTS.map(e => (
            <EventRow key={e.id} e={e} />
          ))}
        </div>
      </section>
    </PortalShell>
  );
}

/* ---------- subcomponents ---------- */

function StatTile({
  label,
  value,
  hint,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  color: string;
  icon: LucideIcon;
}) {
  return (
    <div className='border-border overflow-hidden rounded-2xl border bg-white p-4 shadow-sm'>
      <div className='flex items-center gap-2.5'>
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${color} text-white shadow-sm`}
        >
          <Icon className='size-4' />
        </div>
        <div className='min-w-0 flex-1'>
          <div className='text-3xs text-content-muted font-semibold tracking-wider uppercase'>
            {label}
          </div>
          <div className='text-foreground font-mono text-lg font-bold'>
            {value}
          </div>
          {hint && (
            <div className='text-3xs text-muted-foreground font-mono'>
              {hint}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InteractionCard({
  kind,
  enabled,
  onToggle,
}: {
  kind: InteractionKind;
  enabled: boolean;
  onToggle: () => void;
}) {
  const m = INTERACTIONS[kind];
  const Icon = m.icon;
  const scope = SCOPE_META[m.scope];
  return (
    <div
      className={`group border-border relative overflow-hidden rounded-2xl border bg-gradient-to-br ${m.gradient} to-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
        !enabled ? 'opacity-60' : ''
      }`}
    >
      <div className='flex items-start justify-between'>
        <div
          className={`flex size-10 items-center justify-center rounded-xl ${m.color} text-white shadow-sm transition-transform group-hover:scale-110 ${
            !enabled ? 'grayscale' : ''
          }`}
        >
          <Icon className='size-5' />
        </div>
        <button
          onClick={onToggle}
          className='flex items-center'
          aria-label='Toggle'
        >
          {enabled ? (
            <ToggleRight className='size-7 text-emerald-500' />
          ) : (
            <ToggleLeft className='text-muted-foreground size-7' />
          )}
        </button>
      </div>

      <div className='mt-3 flex items-center gap-1.5'>
        <span className='text-3xs text-muted-foreground font-mono'>{kind}</span>
        {m.default && (
          <span className='text-3xs bg-muted text-content-muted rounded px-1 py-0.5 font-mono font-bold'>
            DEFAULT
          </span>
        )}
      </div>
      <h3 className='mt-0.5 text-sm font-bold tracking-tight'>{m.label}</h3>
      <p className='text-2xs text-content-muted mt-1 leading-snug'>
        {m.description}
      </p>

      <div className='border-border mt-3 flex items-end justify-between border-t pt-2'>
        <div>
          <div className='text-3xs text-content-muted font-mono'>30 ngày</div>
          <div className='text-foreground font-mono text-base font-bold'>
            {fmtNum(m.count_30d)}
          </div>
        </div>
        <span
          className={`text-3xs rounded-full px-2 py-0.5 font-bold ${scope.chip}`}
        >
          {scope.label}
        </span>
      </div>
    </div>
  );
}

function EventRow({ e }: { e: Event }) {
  const m = INTERACTIONS[e.kind];
  const Icon = m.icon;
  return (
    <div className='hover:bg-muted/60 flex items-start gap-3 px-5 py-2.5 transition-colors'>
      <div
        className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${m.color} text-white shadow-sm`}
      >
        <Icon className='size-3.5' />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs'>
          <span className='text-3xs rounded bg-blue-100 px-1.5 py-0.5 font-mono font-bold text-blue-700'>
            {e.kind}
          </span>
          <span className='text-foreground font-semibold'>
            {e.template_name}
          </span>
          {e.target && (
            <>
              <span className='text-muted-foreground'>→</span>
              <code className='text-3xs bg-muted text-content-muted rounded px-1 py-0.5 font-mono'>
                {e.target}
              </code>
            </>
          )}
          {e.meta && (
            <span className='text-3xs text-muted-foreground font-mono'>
              · {e.meta}
            </span>
          )}
        </div>
        <div className='text-3xs text-content-muted mt-0.5 flex items-center gap-2'>
          <span className='font-mono'>visitor {e.visitor}</span>
          <span>·</span>
          <Type className='size-2.5' /> {m.scope}
        </div>
      </div>
      <span className='text-3xs text-muted-foreground shrink-0 font-mono'>
        {e.at}
      </span>
    </div>
  );
}
