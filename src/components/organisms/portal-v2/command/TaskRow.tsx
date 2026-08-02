'use client';

import {
  Activity,
  Ban,
  Clock,
  Eye,
  Hammer,
  Rocket,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/molecules/portal-v2/Button';
import { OwnerAvatar } from '@/components/organisms/portal-v2/command/OwnerAvatar';
import type { CommandTask, TaskKind } from '@/lib/portal-v2/command/types';

type TaskRowProps = {
  task: CommandTask;
  t: (key: string, values?: Record<string, string | number>) => string;
  onAction?: (task: CommandTask) => void;
};

const SEV_COLOR: Record<CommandTask['severity'], string> = {
  high: 'var(--pv2-error)',
  medium: 'var(--pv2-warning)',
  low: 'var(--pv2-mut)',
};

/** Each kind is a different job, so each carries its own glyph. */
const KIND_ICON: Record<TaskKind, LucideIcon> = {
  unassigned: UserPlus,
  late: Clock,
  blocked: Ban,
  review: Eye,
  deploy: Rocket,
  inflight: Hammer,
  health: Activity,
};

const KIND_LABEL_KEY: Record<TaskKind, string> = {
  unassigned: 'taskKindUnassigned',
  late: 'taskKindLate',
  blocked: 'taskKindBlocked',
  review: 'taskKindReview',
  deploy: 'taskKindDeploy',
  inflight: 'taskKindInflight',
  health: 'taskKindHealth',
};

export const TaskRow = ({ task, t, onAction }: TaskRowProps) => {
  const Icon = KIND_ICON[task.kind];
  const color = SEV_COLOR[task.severity];
  const tint = `color-mix(in srgb, ${color} 12%, transparent)`;

  const handleAction = () => {
    onAction?.(task);
  };

  return (
    <div className='flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[var(--pv2-hair)] py-3.5 last:border-b-0'>
      <span
        className='flex size-8 shrink-0 items-center justify-center rounded-[var(--pv2-r-sm)]'
        style={{ background: tint, color }}
        aria-hidden
      >
        <Icon className='size-3.5' strokeWidth={2.2} />
      </span>

      <div className='min-w-0 flex-1 basis-[220px]'>
        <p className='flex flex-wrap items-center gap-2 text-[13.5px] font-semibold text-[var(--pv2-ink)]'>
          {task.what}
          <span
            className='rounded-md px-1.5 py-px text-[10.5px] font-semibold'
            style={{ background: tint, color }}
          >
            {t(KIND_LABEL_KEY[task.kind])}
          </span>
        </p>
        <p className='mt-0.5 text-[12.5px] leading-relaxed text-[var(--pv2-faint)]'>
          {task.why}
        </p>
      </div>

      <OwnerAvatar
        initials={task.ownerInitials}
        label={task.ownerInitials ?? t('noOwnerLabel')}
      />

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
