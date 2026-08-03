'use client';

import Link from 'next/link';

import { Button } from '@/components/molecules/portal-v2/Button';
import type { CommandTask } from '@/lib/portal-v2/command/types';
import { cn } from '@/lib/cn';

type TaskRowProps = {
  task: CommandTask;
  onAction?: (task: CommandTask) => void;
};

const SEV_COLOR: Record<CommandTask['severity'], string> = {
  high: 'var(--pv2-error)',
  medium: 'var(--pv2-warning)',
  low: 'var(--pv2-hair)',
};

export const TaskRow = ({ task, onAction }: TaskRowProps) => {
  const handleAction = () => {
    onAction?.(task);
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 border-b border-[var(--pv2-hair)] py-3.5 last:border-b-0',
        'first:pt-0'
      )}
    >
      <span
        className='mt-1.5 size-1 shrink-0 rounded-full'
        style={{ background: SEV_COLOR[task.severity] }}
        aria-hidden
      />
      <div className='min-w-0 flex-1'>
        <p className='text-[13.5px] font-semibold text-[var(--pv2-ink)]'>
          {task.what}
        </p>
        <p className='mt-0.5 text-[12.5px] leading-relaxed text-[var(--pv2-faint)]'>
          {task.why}
        </p>
      </div>
      {task.href ? (
        <Button variant='ghost' size='sm' asChild>
          <Link href={task.href} onClick={handleAction}>
            {task.cta}
          </Link>
        </Button>
      ) : (
        <Button variant='ghost' size='sm' onClick={handleAction}>
          {task.cta}
        </Button>
      )}
    </div>
  );
};
