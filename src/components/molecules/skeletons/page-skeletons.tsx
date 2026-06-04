/**
 * Bộ skeleton dùng chung cho loading.tsx của portal + admin. Dựng trên
 * <Skeleton/> atom. Preset KHÔNG tự thêm page-padding — caller bọc:
 *   admin  → <div className='mx-auto w-full max-w-6xl p-6'><ListSkeleton/></div>
 *   portal → <PortalShell><ListSkeleton/></PortalShell>  (shell đã có padding)
 */

import { Skeleton } from '@/components/atoms/skeleton';
import { cn } from '@/lib/cn';

/* ─── atoms ─────────────────────────────────────────────────────────── */

function Line({ className }: { className?: string }) {
  return <Skeleton className={cn('h-3', className)} />;
}

function HeaderBlock() {
  return (
    <div className='space-y-2'>
      <Line className='h-6 w-52' />
      <Line className='h-3 w-80 max-w-full' />
    </div>
  );
}

function Toolbar() {
  return (
    <div className='border-border flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm'>
      <Skeleton className='h-8 flex-1 rounded-lg lg:max-w-xs' />
      <Skeleton className='h-7 w-20 rounded-full' />
      <Skeleton className='h-7 w-20 rounded-full' />
      <Skeleton className='ml-auto h-8 w-28 rounded-lg' />
    </div>
  );
}

function StatCards({ count = 4 }: { count?: number }) {
  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className='border-border space-y-2 rounded-2xl border bg-white p-4 shadow-sm'
        >
          <Line className='h-3 w-20' />
          <Line className='h-6 w-16' />
        </div>
      ))}
    </div>
  );
}

function TableBlock({ rows = 6 }: { rows?: number }) {
  return (
    <div className='border-border overflow-hidden rounded-2xl border bg-white shadow-sm'>
      <div className='border-border flex items-center gap-4 border-b px-4 py-3'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Line key={i} className={cn('h-3', i === 0 ? 'w-40' : 'flex-1')} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className='border-border/60 flex items-center gap-4 border-b px-4 py-3 last:border-0'
        >
          <div className='flex flex-1 items-center gap-3'>
            <Skeleton className='size-9 shrink-0 rounded-lg' />
            <div className='min-w-0 flex-1 space-y-1.5'>
              <Line className='h-3 w-2/5' />
              <Line className='h-2.5 w-1/4' />
            </div>
          </div>
          <Line className='hidden h-3 w-16 sm:block' />
          <Line className='hidden h-3 w-16 md:block' />
          <Skeleton className='h-6 w-16 rounded-lg' />
        </div>
      ))}
    </div>
  );
}

function CardGrid({ count = 8 }: { count?: number }) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className='border-border space-y-3 rounded-2xl border bg-white p-3 shadow-sm'
        >
          <Skeleton className='aspect-[4/3] w-full rounded-xl' />
          <Line className='h-3.5 w-3/5' />
          <Line className='h-3 w-2/5' />
        </div>
      ))}
    </div>
  );
}

function ChartBlock() {
  return (
    <div className='border-border rounded-2xl border bg-white p-4 shadow-sm'>
      <Line className='mb-4 h-3 w-32' />
      <Skeleton className='h-48 w-full rounded-xl' />
    </div>
  );
}

/* ─── page presets ──────────────────────────────────────────────────── */

export function ListSkeleton() {
  return (
    <div className='space-y-4'>
      <HeaderBlock />
      <Toolbar />
      <TableBlock />
    </div>
  );
}

export function CardGridSkeleton() {
  return (
    <div className='space-y-4'>
      <HeaderBlock />
      <Toolbar />
      <CardGrid />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className='space-y-5'>
      <HeaderBlock />
      <StatCards count={4} />
      <div className='border-border space-y-3 rounded-2xl border bg-white p-4 shadow-sm'>
        <Line className='h-3 w-32' />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='flex items-center gap-3'>
            <Skeleton className='size-8 shrink-0 rounded-lg' />
            <Line className='h-3 flex-1' />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className='space-y-5'>
      <HeaderBlock />
      <StatCards count={4} />
      <ChartBlock />
      <TableBlock rows={4} />
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className='space-y-5'>
      <Skeleton className='h-7 w-28 rounded-full' />
      <div className='border-border flex items-start gap-5 rounded-3xl border bg-white p-6 shadow-sm'>
        <Skeleton className='size-20 shrink-0 rounded-2xl' />
        <div className='flex-1 space-y-2.5'>
          <Line className='h-7 w-1/2' />
          <Line className='h-3 w-2/3' />
          <Line className='h-3 w-1/3' />
        </div>
      </div>
      <StatCards count={4} />
      <div className='flex gap-2'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className='h-8 w-24 rounded-lg' />
        ))}
      </div>
      <TableBlock rows={5} />
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className='space-y-5'>
      <HeaderBlock />
      <div className='border-border max-w-2xl space-y-5 rounded-2xl border bg-white p-6 shadow-sm'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='space-y-2'>
            <Line className='h-3 w-24' />
            <Skeleton className='h-9 w-full rounded-lg' />
          </div>
        ))}
        <div className='flex justify-end gap-2 pt-2'>
          <Skeleton className='h-9 w-20 rounded-lg' />
          <Skeleton className='h-9 w-28 rounded-lg' />
        </div>
      </div>
    </div>
  );
}

export function PreviewSkeleton() {
  return (
    <div className='flex min-h-[60vh] items-center justify-center'>
      <Skeleton className='h-[70vh] w-full max-w-4xl rounded-2xl' />
    </div>
  );
}
