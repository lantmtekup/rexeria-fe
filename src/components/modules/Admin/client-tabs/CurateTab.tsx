'use client';

/**
 * Tab "Curate" trong màn quản lý khách hàng. Mirror /portal/curate — chọn loại
 * tương tác Rexer track trên trang public của khách + feed events real-time.
 * Staff-facing, scope theo brand. UI demo · dữ liệu mẫu (chờ BE analytics).
 */

import * as React from 'react';
import {
  Activity,
  CheckCircle2,
  Eye,
  Hand,
  MessageCircle,
  MousePointerClick,
  Play,
  Send,
  Share2,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/cn';

type Kind =
  | 'page_view'
  | 'cta_click'
  | 'image_click'
  | 'form_submit'
  | 'video_play'
  | 'scroll_depth'
  | 'share'
  | 'reaction'
  | 'comment'
  | 'custom';

interface Meta {
  label: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  count_30d: number;
  enabled: boolean;
}

const INTERACTIONS: Record<Kind, Meta> = {
  page_view: {
    label: 'Page view',
    desc: 'Mỗi lần visitor mở trang public.',
    icon: Eye,
    color: 'bg-blue-500',
    count_30d: 124_820,
    enabled: true,
  },
  cta_click: {
    label: 'CTA click',
    desc: 'Click vào nút CTA chính / phụ.',
    icon: MousePointerClick,
    color: 'bg-emerald-500',
    count_30d: 5_620,
    enabled: true,
  },
  image_click: {
    label: 'Image click',
    desc: 'Click ảnh trong gallery / hero.',
    icon: Hand,
    color: 'bg-amber-500',
    count_30d: 3_120,
    enabled: true,
  },
  form_submit: {
    label: 'Form submit',
    desc: 'BookingForm submit thành công.',
    icon: Send,
    color: 'bg-fuchsia-500',
    count_30d: 287,
    enabled: true,
  },
  video_play: {
    label: 'Video play',
    desc: 'Visitor bấm play video.',
    icon: Play,
    color: 'bg-rose-500',
    count_30d: 2_840,
    enabled: true,
  },
  scroll_depth: {
    label: 'Scroll depth',
    desc: 'Mốc 25/50/75/100% của trang.',
    icon: Activity,
    color: 'bg-indigo-500',
    count_30d: 18_400,
    enabled: true,
  },
  share: {
    label: 'Share',
    desc: 'Share link / copy URL.',
    icon: Share2,
    color: 'bg-blue-600',
    count_30d: 142,
    enabled: true,
  },
  reaction: {
    label: 'Reaction',
    desc: 'Like / love / wow trên trang.',
    icon: Sparkles,
    color: 'bg-pink-500',
    count_30d: 384,
    enabled: false,
  },
  comment: {
    label: 'Comment',
    desc: 'Visitor comment trên trang public.',
    icon: MessageCircle,
    color: 'bg-amber-600',
    count_30d: 24,
    enabled: false,
  },
  custom: {
    label: 'Custom event',
    desc: 'Event tự định nghĩa qua data-track.',
    icon: Sparkles,
    color: 'bg-zinc-700',
    count_30d: 1_820,
    enabled: false,
  },
};

interface Ev {
  id: string;
  kind: Kind;
  page: string;
  target?: string;
  visitor: string;
  at: string;
}

const EVENTS: Ev[] = [
  {
    id: 'e1',
    kind: 'cta_click',
    page: 'Landing Tết 2026',
    target: 'btn-book',
    visitor: 'v_8e4a',
    at: '12 giây trước',
  },
  {
    id: 'e2',
    kind: 'form_submit',
    page: 'Zero Sugar',
    target: 'form-booking',
    visitor: 'v_2c1f',
    at: '2 phút trước',
  },
  {
    id: 'e3',
    kind: 'video_play',
    page: 'Fanta Watermelon',
    target: 'hero-video',
    visitor: 'v_b8d2',
    at: '3 phút trước',
  },
  {
    id: 'e4',
    kind: 'image_click',
    page: 'Landing Tết 2026',
    target: 'gallery-3',
    visitor: 'v_91ec',
    at: '4 phút trước',
  },
  {
    id: 'e5',
    kind: 'page_view',
    page: 'Sprite Lemon',
    visitor: 'v_4d80',
    at: '5 phút trước',
  },
  {
    id: 'e6',
    kind: 'scroll_depth',
    page: 'Landing Tết 2026',
    target: '75%',
    visitor: 'v_8e4a',
    at: '7 phút trước',
  },
  {
    id: 'e7',
    kind: 'share',
    page: 'Fanta Watermelon',
    target: 'facebook',
    visitor: 'v_b8d2',
    at: '10 phút trước',
  },
];

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

const KINDS = Object.keys(INTERACTIONS) as Kind[];

export function CurateTab({ onCount }: { onCount: (n: number) => void }) {
  const [enabled, setEnabled] = React.useState<Record<Kind, boolean>>(
    () =>
      Object.fromEntries(
        KINDS.map(k => [k, INTERACTIONS[k].enabled])
      ) as Record<Kind, boolean>
  );

  const enabledCount = KINDS.filter(k => enabled[k]).length;
  const onCountRef = React.useRef(onCount);
  onCountRef.current = onCount;
  React.useEffect(() => onCountRef.current(enabledCount), [enabledCount]);

  const toggle = (k: Kind) =>
    setEnabled(m => {
      const next = { ...m, [k]: !m[k] };
      toast.success(
        `${INTERACTIONS[k].label} ${next[k] ? 'đã bật' : 'đã tắt'} tracking`
      );
      return next;
    });

  return (
    <div className='p-4'>
      <div className='text-2xs mb-3 inline-block rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800'>
        <strong>UI Demo · dữ liệu mẫu</strong> — chọn loại tương tác Rexer track
        trên trang public của khách. Chờ BE wire endpoint analytics events.
      </div>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {KINDS.map(k => {
          const m = INTERACTIONS[k];
          const Icon = m.icon;
          const on = enabled[k];
          return (
            <div
              key={k}
              className={cn(
                'border-border rounded-2xl border bg-white p-3 shadow-sm transition-all',
                !on && 'opacity-60'
              )}
            >
              <div className='flex items-start justify-between'>
                <div
                  className={cn(
                    'flex size-9 items-center justify-center rounded-xl text-white shadow-sm',
                    m.color,
                    !on && 'grayscale'
                  )}
                >
                  <Icon className='size-4' />
                </div>
                <button
                  type='button'
                  onClick={() => toggle(k)}
                  aria-label='Toggle'
                >
                  {on ? (
                    <ToggleRight className='size-7 text-emerald-500' />
                  ) : (
                    <ToggleLeft className='text-muted-foreground size-7' />
                  )}
                </button>
              </div>
              <div className='text-3xs text-muted-foreground mt-2 font-mono'>
                {k}
              </div>
              <h3 className='text-sm font-bold tracking-tight'>{m.label}</h3>
              <p className='text-2xs text-content-muted mt-0.5 leading-snug'>
                {m.desc}
              </p>
              <div className='border-border mt-2 flex items-end justify-between border-t pt-2'>
                <span className='text-3xs text-content-muted font-mono'>
                  30 ngày
                </span>
                <span className='text-foreground font-mono text-sm font-bold'>
                  {fmt(m.count_30d)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Events feed */}
      <section className='border-border mt-5 overflow-hidden rounded-2xl border bg-white shadow-sm'>
        <div className='border-border flex items-center justify-between border-b px-4 py-2.5'>
          <div className='flex items-center gap-2'>
            <Activity className='size-4' />
            <h3 className='text-sm font-semibold'>Events real-time</h3>
          </div>
          <span className='text-3xs flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-700'>
            <span className='size-1.5 animate-pulse rounded-full bg-emerald-500' />
            LIVE
          </span>
        </div>
        <div className='divide-y divide-zinc-100'>
          {EVENTS.map(e => {
            const m = INTERACTIONS[e.kind];
            const Icon = m.icon;
            return (
              <div
                key={e.id}
                className='hover:bg-muted/60 flex items-center gap-3 px-4 py-2'
              >
                <div
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-lg text-white shadow-sm',
                    m.color
                  )}
                >
                  <Icon className='size-3' />
                </div>
                <div className='min-w-0 flex-1 text-xs'>
                  <span className='text-3xs rounded bg-blue-100 px-1.5 py-0.5 font-mono font-bold text-blue-700'>
                    {e.kind}
                  </span>{' '}
                  <span className='font-semibold'>{e.page}</span>
                  {e.target && (
                    <code className='text-3xs bg-muted text-content-muted ml-1 rounded px-1 py-0.5 font-mono'>
                      {e.target}
                    </code>
                  )}
                  <span className='text-3xs text-content-muted ml-1 font-mono'>
                    · {e.visitor}
                  </span>
                </div>
                <span className='text-3xs text-muted-foreground shrink-0 font-mono'>
                  {e.at}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <div className='text-content-muted text-3xs mt-3 flex items-center gap-1.5'>
        <CheckCircle2 className='size-3' /> {enabledCount}/{KINDS.length} loại
        tương tác đang track.
      </div>
    </div>
  );
}
