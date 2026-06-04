'use client';

import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  FileCode2,
  Filter,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import {
  CATEGORY_META,
  SPECS,
  STATUS_META,
  type Category,
  type SpecDoc,
  type Status,
} from './_data';

/* ---------- accents (full Tailwind class strings) ---------- */

const ACCENT: Record<
  string,
  {
    bg: string;
    bgSoft: string;
    border: string;
    text: string;
    chip: string;
    gradient: string;
  }
> = {
  blue: {
    bg: 'bg-blue-500',
    bgSoft: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    chip: 'bg-blue-100 text-blue-700',
    gradient: 'from-blue-50 to-white',
  },
  violet: {
    bg: 'bg-violet-500',
    bgSoft: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-600',
    chip: 'bg-violet-100 text-violet-700',
    gradient: 'from-violet-50 to-white',
  },
  fuchsia: {
    bg: 'bg-fuchsia-500',
    bgSoft: 'bg-fuchsia-50',
    border: 'border-fuchsia-200',
    text: 'text-fuchsia-600',
    chip: 'bg-fuchsia-100 text-fuchsia-700',
    gradient: 'from-fuchsia-50 to-white',
  },
  emerald: {
    bg: 'bg-emerald-500',
    bgSoft: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-600',
    chip: 'bg-emerald-100 text-emerald-700',
    gradient: 'from-emerald-50 to-white',
  },
  amber: {
    bg: 'bg-amber-500',
    bgSoft: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-600',
    chip: 'bg-amber-100 text-amber-700',
    gradient: 'from-amber-50 to-white',
  },
  cyan: {
    bg: 'bg-cyan-500',
    bgSoft: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-600',
    chip: 'bg-cyan-100 text-cyan-700',
    gradient: 'from-cyan-50 to-white',
  },
  rose: {
    bg: 'bg-rose-500',
    bgSoft: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-600',
    chip: 'bg-rose-100 text-rose-700',
    gradient: 'from-rose-50 to-white',
  },
  orange: {
    bg: 'bg-orange-500',
    bgSoft: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-600',
    chip: 'bg-orange-100 text-orange-700',
    gradient: 'from-orange-50 to-white',
  },
  sky: {
    bg: 'bg-sky-500',
    bgSoft: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-600',
    chip: 'bg-sky-100 text-sky-700',
    gradient: 'from-sky-50 to-white',
  },
  indigo: {
    bg: 'bg-indigo-500',
    bgSoft: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-600',
    chip: 'bg-indigo-100 text-indigo-700',
    gradient: 'from-indigo-50 to-white',
  },
};

const STATUS_ORDER: Status[] = ['inprogress', 'new', 'done'];

function Priority({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className='inline-flex items-center gap-0.5'>
      {[1, 2, 3].map(i => (
        <Star
          key={i}
          className={`size-3 ${i <= level ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}`}
        />
      ))}
    </span>
  );
}

/* ---------- page ---------- */

export default function DocumentBEPage() {
  const [active, setActive] = useState<string>(SPECS[0].id);
  const [statusFilter, setStatusFilter] = useState<'all' | Status>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | Category>('all');

  useEffect(() => {
    const sections = SPECS.map(s => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => !!el
    );
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );
    sections.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  // Sort by status order first, then by priority desc
  const sorted = useMemo(
    () =>
      [...SPECS].sort((a, b) => {
        const sa = STATUS_ORDER.indexOf(a.status);
        const sb = STATUS_ORDER.indexOf(b.status);
        if (sa !== sb) return sa - sb;
        return b.priority - a.priority;
      }),
    []
  );

  const filtered = useMemo(
    () =>
      sorted.filter(s => {
        if (statusFilter !== 'all' && s.status !== statusFilter) return false;
        if (categoryFilter !== 'all' && s.category !== categoryFilter)
          return false;
        return true;
      }),
    [sorted, statusFilter, categoryFilter]
  );

  const counts = useMemo(() => {
    const c = { new: 0, inprogress: 0, done: 0 };
    for (const s of SPECS) c[s.status]++;
    return c;
  }, []);

  return (
    <div className='min-h-screen bg-zinc-50 text-zinc-900 antialiased'>
      <header className='sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-6 py-3 backdrop-blur'>
        <div className='flex items-center gap-3'>
          <Link
            href='/overview'
            className='flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100'
          >
            <ArrowLeft className='size-3.5' /> Overview
          </Link>
          <div className='flex items-center gap-2'>
            <div className='flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-sm'>
              <FileCode2 className='size-3.5' />
            </div>
            <span className='text-sm font-semibold tracking-tight'>
              Rexer AI — Tài liệu BE
            </span>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-2xs rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-2.5 py-0.5 font-medium text-white shadow-sm'>
            {SPECS.length} specs
          </span>
        </div>
      </header>

      {/* Filter bar */}
      <div className='sticky top-[57px] z-20 border-b border-zinc-200 bg-white/95 px-6 py-2.5 backdrop-blur'>
        <div className='flex flex-wrap items-center gap-3'>
          <span className='text-3xs flex items-center gap-1 font-semibold tracking-wider text-zinc-500 uppercase'>
            <Filter className='size-3' /> Trạng thái
          </span>
          <div className='flex flex-wrap items-center gap-1.5'>
            {(['all', ...STATUS_ORDER] as const).map(s => {
              const isAll = s === 'all';
              const active = statusFilter === s;
              const meta = isAll
                ? {
                    label: `Tất cả · ${SPECS.length}`,
                    chip: 'bg-zinc-900 text-white',
                  }
                : {
                    label: `${STATUS_META[s].label} · ${counts[s]}`,
                    chip: STATUS_META[s].chip,
                  };
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                    active
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                      : `border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50`
                  }`}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
          <span className='text-3xs ml-2 flex items-center gap-1 font-semibold tracking-wider text-zinc-500 uppercase'>
            Module
          </span>
          <div className='flex flex-wrap items-center gap-1'>
            <button
              onClick={() => setCategoryFilter('all')}
              className={`text-2xs rounded-full px-2.5 py-1 font-medium transition-all ${
                categoryFilter === 'all'
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              All
            </button>
            {(Object.keys(CATEGORY_META) as Category[]).map(cat => {
              const active = categoryFilter === cat;
              const accent = CATEGORY_META[cat].accent;
              const a = ACCENT[accent];
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`text-2xs rounded-full px-2.5 py-1 font-medium transition-all ${
                    active
                      ? `${a.bg} text-white shadow-sm`
                      : 'border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  {CATEGORY_META[cat].label}
                </button>
              );
            })}
          </div>
          <div className='ml-auto font-mono text-xs text-zinc-500'>
            <span className='font-bold text-zinc-900'>{filtered.length}</span>
            <span className='text-zinc-400'>/{SPECS.length} hiển thị</span>
          </div>
        </div>
      </div>

      <div className='flex'>
        <aside className='sticky top-[107px] hidden h-[calc(100vh-107px)] w-72 shrink-0 overflow-y-auto border-r border-zinc-200 bg-white px-4 py-6 lg:block'>
          <div className='mb-4 flex items-center justify-between'>
            <span className='text-2xs font-semibold tracking-wider text-zinc-500 uppercase'>
              Mục lục
            </span>
            <span className='text-3xs font-mono text-zinc-400'>
              {filtered.length} mục
            </span>
          </div>
          <nav className='space-y-1'>
            {sorted.map(s => {
              const hidden =
                (statusFilter !== 'all' && s.status !== statusFilter) ||
                (categoryFilter !== 'all' && s.category !== categoryFilter);
              const a = ACCENT[s.accent];
              const isActive = active === s.id;
              const Icon = s.icon;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`group flex items-start gap-3 rounded-lg px-2 py-2 text-sm transition-all ${
                    hidden
                      ? 'pointer-events-none opacity-25'
                      : isActive
                        ? 'bg-zinc-900 text-white shadow-sm'
                        : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${
                      isActive ? a.bg : a.bgSoft
                    } ${isActive ? 'text-white' : a.text} text-3xs font-mono font-bold`}
                  >
                    {s.num}
                  </span>
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-1.5'>
                      <Icon className='size-3 shrink-0 opacity-70' />
                      <span
                        className={`text-3xs truncate font-bold tracking-wider uppercase ${
                          isActive ? 'text-zinc-300' : 'text-zinc-400'
                        }`}
                      >
                        {STATUS_META[s.status].label}
                      </span>
                    </div>
                    <div className='mt-0.5 truncate text-xs leading-snug'>
                      {s.title}
                    </div>
                    <div className='text-3xs mt-0.5 flex items-center gap-2'>
                      <span
                        className={`flex items-center gap-0.5 ${
                          isActive ? 'text-zinc-300' : 'text-zinc-400'
                        }`}
                      >
                        <Clock className='size-2.5' /> {s.est_time}
                      </span>
                      <Priority level={s.priority} />
                    </div>
                  </div>
                </a>
              );
            })}
          </nav>
          <div className='text-2xs mt-6 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-3 leading-relaxed text-zinc-600'>
            💡 Mỗi mục là 1 spec file trong{' '}
            <code className='rounded bg-white px-1'>docs/</code>. File path đầy
            đủ ở header của mỗi card.
          </div>
        </aside>

        <main className='mx-auto w-full max-w-4xl px-5 py-8 lg:px-10'>
          <Hero />

          {filtered.length === 0 ? (
            <div className='rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500'>
              Không có spec nào khớp filter.
            </div>
          ) : (
            filtered.map((s, i) => (
              <SpecSection key={s.id} s={s} next={filtered[i + 1]} />
            ))
          )}

          <footer className='mt-12 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm'>
            <div className='flex items-start gap-3'>
              <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white'>
                <CheckCircle2 className='size-5' />
              </div>
              <div>
                <div className='font-semibold text-zinc-900'>
                  Tổng {SPECS.length} spec · {counts.inprogress} đang làm ·{' '}
                  {counts.new} mới · {counts.done} xong
                </div>
                <p className='mt-1 leading-relaxed'>
                  Mỗi spec là 1 file <code>docs/be-*-spec.md</code> trong repo.
                  Sửa spec bằng cách edit file gốc; trang này load summary từ{' '}
                  <code>_data.tsx</code> (cập nhật manually khi spec đổi).
                </p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className='relative mb-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm'>
      <div className='absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 opacity-70' />
      <div
        className='absolute -top-12 -right-12 size-48 rounded-full bg-indigo-200 blur-3xl'
        aria-hidden
      />
      <div
        className='absolute -bottom-16 -left-12 size-48 rounded-full bg-fuchsia-200 blur-3xl'
        aria-hidden
      />
      <div className='relative'>
        <span className='text-2xs inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-3 py-1 font-medium text-white shadow-sm'>
          <FileCode2 className='size-3' /> Backend specs · live doc
        </span>
        <h1 className='mt-4 text-4xl font-bold tracking-tight md:text-5xl'>
          Tài liệu{' '}
          <span className='bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent'>
            Backend
          </span>
        </h1>
        <p className='mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600 md:text-base'>
          {SPECS.length} spec trong <code>docs/be-*-spec.md</code> — chia 8
          module. Mỗi card có mục tiêu, endpoints, schema bảng, key requirements
          và file path để mở chi tiết.
        </p>
        <div className='mt-5 flex flex-wrap items-center gap-2 text-xs'>
          {STATUS_ORDER.map(s => (
            <span
              key={s}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${STATUS_META[s].chip}`}
            >
              <span className={`size-1.5 rounded-full ${STATUS_META[s].dot}`} />
              {STATUS_META[s].label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpecSection({ s, next }: { s: SpecDoc; next?: SpecDoc }) {
  const a = ACCENT[s.accent];
  const Icon = s.icon;
  return (
    <section id={s.id} className='mb-6 scroll-mt-32'>
      <div className='overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm'>
        <div className={`h-1 ${a.bg}`} aria-hidden />

        {/* Header */}
        <div className={`bg-gradient-to-br ${a.gradient} px-6 pt-6 pb-5`}>
          <div className='flex items-start gap-3'>
            <div
              className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${a.bg} text-white shadow-md`}
            >
              <Icon className='size-6' />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <span className={`text-2xs font-mono font-bold ${a.text}`}>
                  SPEC #{s.num}
                </span>
                <span
                  className={`text-3xs rounded-full px-2 py-0.5 font-medium ${STATUS_META[s.status].chip}`}
                >
                  {STATUS_META[s.status].label}
                </span>
                <span
                  className={`text-3xs rounded-full px-2 py-0.5 font-medium ${a.chip}`}
                >
                  {CATEGORY_META[s.category].label}
                </span>
              </div>
              <h2 className='mt-1 text-xl font-bold tracking-tight'>
                {s.title}
              </h2>
              <code className='text-3xs mt-1 inline-block rounded bg-white/70 px-1.5 py-0.5 font-mono text-zinc-600 ring-1 ring-zinc-200/60'>
                docs/{s.filename}
              </code>
            </div>
          </div>

          <div className='mt-3 flex flex-wrap items-center gap-2 text-xs'>
            <span className='inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-zinc-600 ring-1 ring-zinc-200'>
              <Clock className='size-3 text-zinc-400' /> {s.est_time}
            </span>
            <span className='inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-zinc-600 ring-1 ring-zinc-200'>
              <Priority level={s.priority} />{' '}
              <span className='text-3xs font-mono text-zinc-500'>
                P{s.priority}
              </span>
            </span>
            <span className='inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-zinc-600 ring-1 ring-zinc-200'>
              {s.requirements.length} requirement
            </span>
          </div>

          {/* Goal + Prereq */}
          <div className='mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2'>
            <div className='rounded-lg border border-white/60 bg-white/70 px-3 py-2'>
              <div className='text-3xs font-semibold tracking-wider text-zinc-500 uppercase'>
                🎯 Mục tiêu
              </div>
              <p className='mt-1 text-xs leading-snug text-zinc-700'>
                {s.goal}
              </p>
            </div>
            {s.prereq && (
              <div className='rounded-lg border border-white/60 bg-white/70 px-3 py-2'>
                <div className='text-3xs font-semibold tracking-wider text-zinc-500 uppercase'>
                  📋 Phụ thuộc
                </div>
                <p className='text-2xs mt-1 font-mono leading-snug text-zinc-700'>
                  {s.prereq}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Endpoints */}
        {s.endpoints.length > 0 && (
          <div className='border-b border-zinc-100 px-6 py-4'>
            <h5 className='text-2xs flex items-center gap-1.5 font-semibold tracking-wider text-zinc-500 uppercase'>
              <FileCode2 className='size-3.5' /> Endpoints ({s.endpoints.length}
              )
            </h5>
            <div className='mt-2 flex flex-wrap gap-1.5'>
              {s.endpoints.map(e => (
                <EndpointChip key={e} text={e} />
              ))}
            </div>
          </div>
        )}

        {/* Schema tables */}
        {s.schema_tables.length > 0 && (
          <div className='border-b border-zinc-100 px-6 py-4'>
            <h5 className='text-2xs flex items-center gap-1.5 font-semibold tracking-wider text-zinc-500 uppercase'>
              <Database className='size-3.5' /> Schema tables (
              {s.schema_tables.length})
            </h5>
            <div className='mt-2 flex flex-wrap gap-1.5'>
              {s.schema_tables.map(t => (
                <span
                  key={t}
                  className='text-2xs inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-emerald-700'
                >
                  <Database className='size-2.5' /> {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Requirements as numbered steps */}
        <ol className='relative px-6 py-5'>
          <div
            className={`absolute top-5 bottom-5 left-[26px] w-0.5 ${a.bgSoft}`}
            aria-hidden
          />
          {s.requirements.map((req, i) => (
            <li key={i} className='relative pb-4 pl-12 last:pb-0'>
              <span
                className={`absolute top-0 left-0 flex size-8 items-center justify-center rounded-full ${a.bg} font-mono text-xs font-bold text-white shadow-sm ring-4 ring-white`}
              >
                {i + 1}
              </span>
              <div className='text-sm leading-relaxed text-zinc-700 [&_b]:font-semibold [&_b]:text-zinc-900 [&_code]:rounded [&_code]:bg-zinc-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs'>
                {req}
              </div>
            </li>
          ))}
        </ol>

        {/* Footer */}
        {next && (
          <div className='border-t border-zinc-100 bg-zinc-50/50 px-6 py-4'>
            <a
              href={`#${next.id}`}
              className='inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-zinc-700'
            >
              Spec #{next.num}: {next.title}
              <ChevronRight className='size-3.5' />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function EndpointChip({ text }: { text: string }) {
  // Extract HTTP method (GET / POST / etc.) if present
  const m = text.match(/^(GET|POST|PUT|PATCH|DELETE)\s+(.+)$/);
  if (!m) {
    return (
      <span className='text-2xs inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-zinc-600'>
        {text}
      </span>
    );
  }
  const [, method, path] = m;
  const methodColor: Record<string, string> = {
    GET: 'bg-emerald-600',
    POST: 'bg-blue-600',
    PUT: 'bg-amber-600',
    PATCH: 'bg-amber-600',
    DELETE: 'bg-rose-600',
  };
  return (
    <span className='inline-flex items-center gap-1.5 overflow-hidden rounded-md border border-zinc-200 bg-white'>
      <span
        className={`${methodColor[method] ?? 'bg-zinc-600'} text-3xs px-1.5 py-0.5 font-mono font-bold text-white`}
      >
        {method}
      </span>
      <code className='text-2xs px-1.5 py-0.5 pr-2 font-mono text-zinc-700'>
        {path}
      </code>
    </span>
  );
}
