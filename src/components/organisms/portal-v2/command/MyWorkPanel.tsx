'use client';

import Link from 'next/link';

import { SectionHead } from '@/components/organisms/portal-v2/command/SectionHead';
import { TaskRow } from '@/components/organisms/portal-v2/command/TaskRow';
import { COMMAND_LINKS } from '@/lib/portal-v2/command/constants';
import type { ActivityRow, CommandTask } from '@/lib/portal-v2/command/types';
import { cn } from '@/lib/cn';

type MyWorkPanelProps = {
  tasks: CommandTask[];
  activity: ActivityRow[];
  userName: string;
  t: (key: string, values?: Record<string, string | number>) => string;
  onTaskAction?: (task: CommandTask) => void;
};

const TaskGroup = ({
  title,
  subtitle,
  tasks,
  onTaskAction,
  first,
}: {
  title: string;
  subtitle: string;
  tasks: CommandTask[];
  onTaskAction?: (task: CommandTask) => void;
  first?: boolean;
}) => {
  if (!tasks.length) return null;

  return (
    <section className={first ? undefined : 'mt-6'}>
      <SectionHead title={title} subtitle={subtitle} className='mb-2' />
      <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4'>
        {tasks.map(task => (
          <TaskRow key={task.id} task={task} onAction={onTaskAction} />
        ))}
      </div>
    </section>
  );
};

const ActivityRowItem = ({
  row,
  t,
}: {
  row: ActivityRow;
  t: MyWorkPanelProps['t'];
}) => (
  <Link
    href={COMMAND_LINKS.intel}
    className={cn(
      'flex items-start gap-3 border-b border-[var(--pv2-hair)] py-3 last:border-b-0',
      'transition-colors hover:bg-[var(--pv2-canvas)]',
      'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2 focus-visible:outline-none'
    )}
  >
    <span
      className='mt-1 size-2 shrink-0 rounded-full bg-[var(--pv2-violet)]'
      aria-hidden
    />
    <span className='min-w-0 flex-1'>
      <span className='block text-[13px] font-semibold text-[var(--pv2-ink)]'>
        {row.experienceName}
      </span>
      <span className='text-[12px] text-[var(--pv2-faint)]'>
        {row.campaignName}
        {' · '}
        {row.sessions.toLocaleString()} {t('sessionsLabel')}
        {' · '}
        {row.lift >= 0 ? '+' : '−'}
        {Math.abs(Math.round(row.lift * 100))}% {t('vsControlLabel')}
      </span>
    </span>
  </Link>
);

export const MyWorkPanel = ({
  tasks,
  activity,
  userName,
  t,
  onTaskAction,
}: MyWorkPanelProps) => {
  const mine = tasks.filter(x => x.mine);
  const unowned = tasks.filter(x => x.kind === 'unassigned');
  const others = tasks.filter(x => !x.mine && x.kind !== 'unassigned');

  return (
    <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]'>
      <div>
        {!tasks.length ? (
          <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-6 py-10 text-center'>
            <p className='text-[14px] font-semibold text-[var(--pv2-ink)]'>
              {t('workEmptyTitle')}
            </p>
            <p className='mt-1 text-[13px] text-[var(--pv2-faint)]'>
              {t('workEmptyBody')}
            </p>
          </div>
        ) : null}

        <TaskGroup
          first
          title={t('assignedHeading')}
          subtitle={t('assignedSub', { name: userName, count: mine.length })}
          tasks={mine}
          onTaskAction={onTaskAction}
        />
        <TaskGroup
          title={t('unownedHeading')}
          subtitle={t('unownedSub')}
          tasks={unowned}
          onTaskAction={onTaskAction}
        />
        <TaskGroup
          title={t('elsewhereHeading')}
          subtitle={t('elsewhereSub')}
          tasks={others}
          onTaskAction={onTaskAction}
        />
      </div>

      <aside>
        <SectionHead
          title={t('activityHeading')}
          subtitle={t('activitySub')}
          className='mb-3'
        />
        <div className='rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4'>
          {activity.length ? (
            activity.map(row => (
              <ActivityRowItem
                key={`${row.experienceName}-${row.campaignName}`}
                row={row}
                t={t}
              />
            ))
          ) : (
            <div className='py-6 text-center text-[12.5px] text-[var(--pv2-faint)]'>
              {t('activityEmpty')}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
