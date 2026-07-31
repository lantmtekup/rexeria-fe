import { cn } from '@/lib/cn';

const shimmer =
  'animate-pulse rounded-[var(--pv2-r-sm)] bg-[var(--pv2-canvas)]';

const CardSkeleton = () => (
  <div className='flex flex-col overflow-hidden rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
    <div className='aspect-[16/10] max-h-[clamp(140px,28vw,200px)] w-full animate-pulse border-b border-[var(--pv2-hair)] bg-[var(--pv2-canvas)]' />
    <div className='flex flex-1 flex-col gap-2 px-3.5 pt-3 pb-3.5'>
      <span className={cn(shimmer, 'h-3.5 w-3/4')} />
      <span className={cn(shimmer, 'h-2.5 w-2/5')} />
      <div className='mt-1 flex gap-2'>
        <span className={cn(shimmer, 'h-4 w-16 rounded-full')} />
        <span className={cn(shimmer, 'h-4 w-20 rounded-full')} />
      </div>
      <span className={cn(shimmer, 'h-3 w-1/2')} />
    </div>
    <div className='flex items-center gap-2 border-t border-[var(--pv2-hair)] px-3.5 py-2.5'>
      <span className={cn(shimmer, 'h-3 w-20')} />
      <span className='flex-1' />
      <span className={cn(shimmer, 'h-3 w-16')} />
    </div>
  </div>
);

/**
 * Mirrors the workspace layout while the route awaits the pages API, so the
 * swap to real content does not shift the page.
 */
export const ExperiencesPageSkeleton = () => (
  <div className='flex min-h-0 flex-col' aria-busy aria-live='polite'>
    <div className='border-b border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
      <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-4 md:px-8'>
        <div className='min-w-0 flex-1'>
          <span className={cn(shimmer, 'block h-7 w-56')} />
          <span
            className={cn(shimmer, 'mt-2 block h-3.5 w-[min(70ch,100%)]')}
          />
        </div>
      </div>
    </div>

    <div className='mx-auto w-full px-5 py-6 md:px-8'>
      <div className='mb-3.5 flex flex-wrap items-center gap-2'>
        <span
          className={cn(
            'h-9 min-w-[250px] flex-1 animate-pulse rounded-[10px]',
            'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'
          )}
        />
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className={cn(shimmer, 'h-7 w-24 rounded-full')} />
        ))}
      </div>

      <span className={cn(shimmer, 'mb-3 block h-3 w-28')} />

      <div className='grid grid-cols-[repeat(auto-fill,minmax(244px,1fr))] gap-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);
