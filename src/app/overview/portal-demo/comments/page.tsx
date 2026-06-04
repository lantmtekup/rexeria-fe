'use client';

import { CheckCircle2, MessageSquare, Send } from 'lucide-react';

import { FAKE_TEMPLATES } from '../_data';
import { PortalShell } from '../_shell';

type Thread = {
  template_id: string;
  template_name: string;
  status: 'open' | 'resolved';
  author: string;
  author_role: 'brand' | 'staff';
  body: string;
  reply?: { author: string; body: string; at: string };
  at: string;
};

const FAKE_THREADS: Thread[] = [
  {
    template_id: 'tpl_01',
    template_name: 'Coca-Cola Tết 2026',
    status: 'open',
    author: 'An (Brand)',
    author_role: 'brand',
    body: 'Cần đổi màu CTA sang đỏ đậm hơn — tone luxury hơn cho Tết.',
    at: '5 giờ trước',
  },
  {
    template_id: 'tpl_01',
    template_name: 'Coca-Cola Tết 2026',
    status: 'open',
    author: 'Linh (Brand)',
    author_role: 'brand',
    body: 'Text hero "Sum vầy ngày Tết" cần lớn hơn, font weight bold.',
    reply: {
      author: 'Minh (Rexer)',
      body: 'Mình sẽ tăng font-size lên 72px + weight 900. Update trong 1 giờ nữa nhé.',
      at: '4 giờ trước',
    },
    at: '6 giờ trước',
  },
  {
    template_id: 'tpl_03',
    template_name: 'Fanta Watermelon',
    status: 'open',
    author: 'An (Brand)',
    author_role: 'brand',
    body: 'Thêm 1 block quiz vui về độ nóng mùa hè đi — tăng engagement.',
    at: 'hôm qua',
  },
  {
    template_id: 'tpl_02',
    template_name: 'Coca-Cola Zero Sugar',
    status: 'resolved',
    author: 'An (Brand)',
    author_role: 'brand',
    body: 'Đổi nền hero sang gradient navy.',
    reply: {
      author: 'Lan (Rexer)',
      body: 'Done ✓ — đã update + republish. Bạn check thử nhé.',
      at: '2 ngày trước',
    },
    at: '3 ngày trước',
  },
];

export default function PortalCommentsPage() {
  const open = FAKE_THREADS.filter(t => t.status === 'open');
  const resolved = FAKE_THREADS.filter(t => t.status === 'resolved');
  return (
    <PortalShell>
      <section>
        <div className='text-2xs flex items-center gap-2 font-semibold tracking-wider text-zinc-500 uppercase'>
          <MessageSquare className='size-3' /> Comments &amp; Requests
        </div>
        <h1 className='mt-1 text-2xl font-bold tracking-tight'>
          Trao đổi với Rexer
        </h1>
        <p className='mt-1 text-sm text-zinc-500'>
          Yêu cầu sửa landing page, hỏi đáp, feedback. Staff phụ trách brand sẽ
          trả lời trong vòng 24 giờ làm việc.
        </p>
      </section>

      {/* New comment box */}
      <section className='mt-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm'>
        <div className='mb-2 flex items-center gap-2'>
          <div className='flex size-7 items-center justify-center rounded-lg bg-blue-500 text-white shadow-sm'>
            <Send className='size-3.5' />
          </div>
          <h3 className='text-sm font-semibold'>Gửi yêu cầu mới</h3>
        </div>
        <select className='mb-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400'>
          <option>Chọn landing page muốn comment...</option>
          {FAKE_TEMPLATES.map(t => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <textarea
          placeholder="Viết yêu cầu của bạn... vd: 'Đổi màu nền hero sang gradient navy', 'Thêm 1 block về certifications'..."
          rows={3}
          className='w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400'
        />
        <div className='mt-2 flex items-center justify-between'>
          <span className='text-3xs text-zinc-500'>
            Hỗ trợ Markdown · Tối đa 4000 ký tự
          </span>
          <button className='rounded-lg bg-zinc-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-700'>
            Gửi yêu cầu
          </button>
        </div>
      </section>

      {/* Open threads */}
      <section className='mt-6'>
        <h2 className='text-2xs mb-3 font-semibold tracking-wider text-zinc-500 uppercase'>
          Đang chờ Rexer ({open.length})
        </h2>
        <div className='space-y-3'>
          {open.map((t, i) => (
            <ThreadCard key={i} t={t} />
          ))}
        </div>
      </section>

      {/* Resolved */}
      <section className='mt-6'>
        <h2 className='text-2xs mb-3 font-semibold tracking-wider text-zinc-500 uppercase'>
          Đã giải quyết ({resolved.length})
        </h2>
        <div className='space-y-3 opacity-60'>
          {resolved.map((t, i) => (
            <ThreadCard key={i} t={t} />
          ))}
        </div>
      </section>
    </PortalShell>
  );
}

function ThreadCard({ t }: { t: Thread }) {
  return (
    <div className='overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm'>
      <div className='border-b border-zinc-100 bg-zinc-50/50 px-4 py-2'>
        <div className='flex items-center justify-between'>
          <span className='text-2xs font-mono font-semibold text-zinc-700'>
            {t.template_name}
          </span>
          {t.status === 'resolved' && (
            <span className='text-3xs flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-700'>
              <CheckCircle2 className='size-2.5' /> Resolved
            </span>
          )}
        </div>
      </div>
      <div className='p-4'>
        <div className='flex items-start gap-3'>
          <div
            className={`text-2xs flex size-8 shrink-0 items-center justify-center rounded-full font-mono font-bold text-white shadow-sm ${
              t.author_role === 'brand' ? 'bg-rose-500' : 'bg-orange-500'
            }`}
          >
            {t.author.slice(0, 2).toUpperCase()}
          </div>
          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-baseline gap-x-2'>
              <span className='text-sm font-semibold'>{t.author}</span>
              <span className='text-3xs font-mono text-zinc-400'>{t.at}</span>
            </div>
            <p className='mt-1 text-sm leading-relaxed text-zinc-700'>
              {t.body}
            </p>
          </div>
        </div>

        {t.reply && (
          <div className='mt-3 ml-11 flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3'>
            <div className='text-3xs flex size-7 shrink-0 items-center justify-center rounded-full bg-orange-500 font-mono font-bold text-white shadow-sm'>
              {t.reply.author.slice(0, 2).toUpperCase()}
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-baseline gap-x-2'>
                <span className='text-xs font-semibold'>{t.reply.author}</span>
                <span className='text-3xs rounded bg-orange-100 px-1.5 py-0.5 font-mono font-bold text-orange-700'>
                  STAFF
                </span>
                <span className='text-3xs font-mono text-zinc-400'>
                  {t.reply.at}
                </span>
              </div>
              <p className='mt-1 text-xs leading-relaxed text-zinc-700'>
                {t.reply.body}
              </p>
            </div>
          </div>
        )}

        {t.status === 'open' && !t.reply && (
          <div className='text-2xs mt-3 ml-11 rounded-xl border border-dashed border-zinc-200 bg-white px-3 py-2 text-center text-zinc-500'>
            ⏳ Đang chờ Rexer phản hồi
          </div>
        )}
      </div>
    </div>
  );
}
