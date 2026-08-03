import { cn } from '@/lib/cn';

export const ListingCardSkeleton = () => {
  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-[var(--pv2-r)]',
        'border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'
      )}
      aria-hidden
    >
      <div className='relative flex aspect-[16/10] w-full flex-col overflow-hidden border-b border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
        <div className='h-[38%] animate-pulse bg-[var(--pv2-electric-soft)]' />
        <div className='flex flex-1 flex-col gap-2 px-4 py-3'>
          <div className='h-2 w-3/5 animate-pulse rounded-sm bg-[var(--pv2-slate-300)]' />
          <div className='h-2 w-2/5 animate-pulse rounded-sm bg-[var(--pv2-hair)]' />
          <div className='mt-auto h-7 w-24 animate-pulse rounded-[6px] bg-[var(--pv2-electric)]/20' />
        </div>
      </div>

      <div className='flex flex-1 flex-col gap-2 px-3.5 pt-3 pb-3.5'>
        <div className='flex flex-col gap-1.5'>
          <div className='h-3.5 w-3/4 animate-pulse rounded bg-[var(--pv2-canvas)]' />
          <div className='h-3 w-1/2 animate-pulse rounded bg-[var(--pv2-canvas)]' />
        </div>
        <div className='flex gap-2'>
          <div className='h-5 w-14 animate-pulse rounded-full bg-[var(--pv2-canvas)]' />
          <div className='h-5 w-[100px] animate-pulse rounded-full bg-[var(--pv2-canvas)]' />
        </div>
        <div className='h-5 w-24 animate-pulse rounded-full bg-[var(--pv2-canvas)]' />
      </div>

      <div className='flex items-center gap-2.5 border-t border-[var(--pv2-hair)] px-3.5 py-2.5'>
        <div className='h-4 w-10 animate-pulse rounded bg-[var(--pv2-canvas)]' />
        <span className='flex-1' />
        <div className='h-8 w-[72px] animate-pulse rounded-[var(--pv2-r-sm)] bg-[var(--pv2-canvas)]' />
      </div>
    </div>
  );
};
