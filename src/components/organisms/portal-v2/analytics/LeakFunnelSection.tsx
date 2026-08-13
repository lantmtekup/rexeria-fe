import type { ReactNode } from 'react';

type LeakFunnelSectionProps = {
  title: string;
  hint: string;
  note: string;
  children: ReactNode;
};

/** Card chrome shared with Journey Audit leak map (`MiningWorkspace`). */
export const LeakFunnelSection = ({
  title,
  hint,
  note,
  children,
}: LeakFunnelSectionProps) => (
  <section className='overflow-hidden rounded-[var(--pv2-r-lg)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)]'>
    <div className='border-b border-[var(--pv2-hair)] px-4 py-3'>
      <h2 className='text-sm font-bold text-[var(--pv2-ink)]'>{title}</h2>
      <p className='mt-0.5 text-[10px] text-[var(--pv2-faint)]'>{hint}</p>
    </div>
    <div className='px-3 pt-4'>{children}</div>
    <div className='border-t border-[var(--pv2-hair)] px-4 py-4'>
      <p className='text-[11.5px] leading-relaxed text-[var(--pv2-faint)]'>
        {note}
      </p>
    </div>
  </section>
);
