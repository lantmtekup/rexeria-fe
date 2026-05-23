'use client';

import { Globe, Hammer, Sparkles } from 'lucide-react';

import { PortalShell } from '../_shell';

export default function PortalMicroSitesPage() {
  return (
    <PortalShell>
      <section>
        <div className='flex items-center gap-2 text-[11px] font-semibold tracking-wider text-zinc-500 uppercase'>
          <Globe className='size-3' /> Micro site
        </div>
        <h1 className='mt-1 text-2xl font-bold tracking-tight'>Micro site</h1>
        <p className='mt-1 text-[13px] text-zinc-500'>
          Tổ hợp nhiều landing page thành 1 mini-site có domain riêng, menu,
          navigation cross-page. Khác landing page đơn (1 URL) — micro site là
          nhóm trang liên kết để campaign dài hơi.
        </p>
      </section>

      <div className='mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm'>
        <div className='relative px-8 py-10'>
          <div
            aria-hidden
            className='pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-indigo-50/60 to-transparent'
          />
          <div className='relative flex flex-col items-center text-center'>
            <div className='flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/20'>
              <Hammer className='size-7' strokeWidth={2.2} />
            </div>
            <p className='mt-5 text-[15px] font-semibold text-zinc-900'>
              Tính năng đang phát triển
            </p>
            <p className='mt-1.5 max-w-md text-[12.5px] leading-relaxed text-zinc-500'>
              FE đã wire route + sidebar. Khi BE ship endpoint{' '}
              <code className='rounded bg-zinc-100 px-1 py-0.5 font-mono text-[11px]'>
                /v1/portal/micro-sites
              </code>{' '}
              (schema: name, slug, pages[], theme, domain_id), trang này sẽ live
              ngay.
            </p>

            <div className='mt-6 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3'>
              <RoadmapCard
                title='Cấu trúc nhiều trang'
                body='Mỗi micro site = 1 list landing page có thứ tự + slug riêng.'
              />
              <RoadmapCard
                title='Nav + footer chung'
                body='Tổ chức menu + footer áp dụng đồng bộ trên mọi page.'
              />
              <RoadmapCard
                title='Custom domain'
                body='Map domain phụ (campaign.brand.com) tới micro site.'
              />
            </div>
          </div>
        </div>
        <div className='flex items-center justify-center gap-2 border-t border-zinc-100 bg-zinc-50/50 px-6 py-3 text-[11px] text-zinc-500'>
          <Sparkles className='size-3 text-zinc-400' />
          Roadmap Phase 2 — sau khi /portal/landing-pages chạy data thật ổn
          định.
        </div>
      </div>
    </PortalShell>
  );
}

function RoadmapCard({ title, body }: { title: string; body: string }) {
  return (
    <div className='rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 text-left'>
      <div className='text-[11px] font-semibold text-zinc-800'>{title}</div>
      <p className='mt-1 text-[10.5px] leading-snug text-zinc-500'>{body}</p>
    </div>
  );
}
