'use client';

import { cn } from '@/lib/cn';

type DeployEmptyProps = {
  title: string;
  hint: string;
  className?: string;
};

export const DeployEmpty = ({ title, hint, className }: DeployEmptyProps) => (
  <div
    className={cn(
      'rounded-[var(--pv2-r)] border border-dashed border-[var(--pv2-hair)]',
      'px-10 py-12 text-center',
      className
    )}
  >
    <p className='text-[14px] font-semibold text-[var(--pv2-ink)]'>{title}</p>
    <p className='mx-auto mt-1.5 max-w-[52ch] text-[13px] leading-relaxed text-[var(--pv2-faint)]'>
      {hint}
    </p>
  </div>
);
