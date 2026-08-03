'use client';

import { Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type DeployNoteProps = {
  children: ReactNode;
  className?: string;
};

/** The prototype's `dnote` — one line of context, never an instruction. */
export const DeployNote = ({ children, className }: DeployNoteProps) => (
  <div
    className={cn(
      'flex items-start gap-2.5 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)]',
      'bg-[var(--pv2-electric-soft)] px-4 py-3',
      'text-[12.5px] leading-relaxed text-[var(--pv2-slate-500)]',
      className
    )}
  >
    <Sparkles
      className='mt-px size-3.5 shrink-0 text-[var(--pv2-electric)]'
      strokeWidth={2.2}
      aria-hidden
    />
    <span>{children}</span>
  </div>
);
