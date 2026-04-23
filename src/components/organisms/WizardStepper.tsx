'use client';

import * as React from 'react';

import { cn } from '@/lib/cn';

export interface WizardStep {
  key: string;
  label: React.ReactNode;
  state?: 'done' | 'active' | 'todo';
}

export interface WizardStepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: WizardStep[];
  activeKey: string;
}

/**
 * 4-step wizard pill used on the AI-Agents flow:
 *   ( 01 Product )─( 02 Marketing )─( 03 Template )─( 04 Campaign )
 * The active step is filled blue, done steps are filled darker blue with check,
 * todo steps are muted.
 */
function WizardStepper({
  steps,
  activeKey,
  className,
  ...props
}: WizardStepperProps) {
  const activeIndex = steps.findIndex(s => s.key === activeKey);
  return (
    <div
      className={cn(
        'rounded-pill flex items-center bg-neutral-100 p-1 text-xs font-semibold tracking-[-0.02em]',
        className
      )}
      {...props}
    >
      {steps.map((s, i) => {
        const resolved = s.state
          ? s.state
          : i < activeIndex
            ? 'done'
            : i === activeIndex
              ? 'active'
              : 'todo';
        return (
          <div
            key={s.key}
            className={cn(
              'rounded-pill flex items-center gap-1 px-4 py-2 transition-colors',
              resolved === 'active' && 'bg-primary text-primary-foreground',
              resolved === 'done' && 'bg-primary/15 text-primary-600',
              resolved === 'todo' && 'text-content-muted'
            )}
          >
            <span className='tabular-nums'>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export { WizardStepper };
