import { cn } from '@/lib/cn';

const shimmer =
  'animate-pulse rounded-[var(--pv2-r-sm)] bg-[var(--pv2-canvas)]';

const KpiCellSkeleton = () => (
  <div className='px-4 py-4 sm:px-5 sm:py-5'>
    <span className={cn(shimmer, 'block h-3 w-24')} />
    <span className={cn(shimmer, 'mt-3 block h-6 w-16')} />
    <span className={cn(shimmer, 'mt-2.5 block h-3 w-28')} />
  </div>
);

const BandSkeleton = ({ cells }: { cells: number }) => (
  <section className='overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
    <div className='border-b border-[var(--pv2-hair)] px-4 py-2.5 sm:px-5'>
      <span className={cn(shimmer, 'block h-3 w-24')} />
    </div>
    <div
      className={cn(
        'grid divide-y divide-[var(--pv2-hair)] sm:divide-x sm:divide-y-0',
        cells === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'
      )}
    >
      {Array.from({ length: cells }).map((_, i) => (
        <KpiCellSkeleton key={i} />
      ))}
    </div>
  </section>
);

const ListSkeleton = ({ rows }: { rows: number }) => (
  <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4'>
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className='flex items-center gap-3 border-b border-[var(--pv2-hair)] py-3.5 last:border-b-0'
      >
        <span className='size-8 shrink-0 animate-pulse rounded-[var(--pv2-r-sm)] bg-[var(--pv2-canvas)]' />
        <span className='flex flex-1 flex-col gap-1.5'>
          <span className={cn(shimmer, 'h-3.5 w-2/5')} />
          <span className={cn(shimmer, 'h-2.5 w-3/5')} />
        </span>
        <span className={cn(shimmer, 'h-3 w-12')} />
      </div>
    ))}
  </div>
);

/**
 * Mirrors the Portfolio tab so the swap to real content does not shift the
 * page. The KPI bands are the tallest thing above the fold, so they are the
 * part worth reserving.
 */
export const CommandPageSkeleton = () => (
  <div className='flex min-h-0 flex-col' aria-busy aria-live='polite'>
    <div className='border-b border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
      <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-4 py-5 md:px-5'>
        <div className='min-w-0 flex-1'>
          <span className={cn(shimmer, 'block h-7 w-52')} />
          <span
            className={cn(shimmer, 'mt-2 block h-3.5 w-[min(48ch,100%)]')}
          />
        </div>
        <div className='flex gap-2'>
          <span className={cn(shimmer, 'h-8 w-32 rounded-full')} />
          <span className={cn(shimmer, 'h-8 w-24 rounded-[var(--pv2-r)]')} />
        </div>
      </div>
    </div>

    <div className='mx-auto w-full px-4 md:px-5'>
      <div className='flex gap-4 border-b border-[var(--pv2-hair)] py-2.5'>
        <span className={cn(shimmer, 'h-4 w-20')} />
        <span className={cn(shimmer, 'h-4 w-20')} />
        <span className={cn(shimmer, 'h-4 w-28')} />
      </div>
    </div>

    <div className='mx-auto w-full space-y-6 px-4 py-5 md:px-5'>
      <div className='space-y-3'>
        <BandSkeleton cells={4} />
        <div className='grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,280px)]'>
          <BandSkeleton cells={3} />
          <BandSkeleton cells={1} />
        </div>
      </div>

      <ListSkeleton rows={3} />

      <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]'>
        <ListSkeleton rows={5} />
        <ListSkeleton rows={4} />
      </div>
    </div>
  </div>
);
