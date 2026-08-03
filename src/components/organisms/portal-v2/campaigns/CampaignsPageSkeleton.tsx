import { cn } from '@/lib/cn';

const shimmer =
  'animate-pulse rounded-[var(--pv2-r-sm)] bg-[var(--pv2-canvas)]';

const CardSkeleton = () => (
  <div className='flex flex-col gap-2.5 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4 py-[15px]'>
    <div className='flex items-center gap-3'>
      <span className='size-[34px] shrink-0 animate-pulse rounded-[10px] bg-[var(--pv2-canvas)]' />
      <span className='flex flex-1 flex-col gap-1.5'>
        <span className={cn(shimmer, 'h-3.5 w-2/3')} />
        <span className={cn(shimmer, 'h-2.5 w-2/5')} />
      </span>
    </div>
    <span className={cn(shimmer, 'h-8 w-full')} />
    <span className={cn(shimmer, 'h-1.5 w-full rounded-full')} />
    <div className='flex gap-1.5'>
      <span className={cn(shimmer, 'h-5 w-16 rounded-full')} />
      <span className={cn(shimmer, 'h-5 w-20 rounded-full')} />
      <span className={cn(shimmer, 'h-5 w-14 rounded-full')} />
    </div>
    <div className='flex items-center gap-3 border-t border-[var(--pv2-hair)] pt-2.5'>
      <span className={cn(shimmer, 'h-3 w-20')} />
      <span className={cn(shimmer, 'h-3 w-12')} />
    </div>
  </div>
);

/**
 * Mirrors the workspace layout while the route awaits the campaigns API, so
 * the swap to real content does not shift the page.
 */
export const CampaignsPageSkeleton = () => (
  <div className='flex min-h-0 flex-col' aria-busy aria-live='polite'>
    <div className='border-b border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
      <div className='mx-auto flex w-full flex-wrap items-end justify-between gap-4 px-5 pt-6 pb-4 md:px-8'>
        <div className='min-w-0 flex-1'>
          <span className={cn(shimmer, 'block h-7 w-48')} />
          <span
            className={cn(shimmer, 'mt-2 block h-3.5 w-[min(70ch,100%)]')}
          />
        </div>
        <span className={cn(shimmer, 'h-[34px] w-36 rounded-full')} />
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
        <span className={cn(shimmer, 'h-9 w-[76px] rounded-[10px]')} />
      </div>

      <div className='grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3.5'>
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);
