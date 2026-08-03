import { UserPlus } from 'lucide-react';

import { cn } from '@/lib/cn';

type OwnerAvatarProps = {
  /** `null` when nobody holds the work, which is a state worth showing. */
  initials: string | null;
  label: string;
  className?: string;
};

/**
 * Who holds a piece of work, at list density. An unowned slot stays visible as
 * a dashed placeholder instead of collapsing, because unowned work is the kind
 * that disappears.
 */
export const OwnerAvatar = ({
  initials,
  label,
  className,
}: OwnerAvatarProps) => (
  <span
    title={label}
    aria-label={label}
    className={cn(
      'flex size-6 shrink-0 items-center justify-center rounded-full',
      'text-[10px] font-bold tracking-tight tabular-nums',
      initials
        ? 'bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)]'
        : 'border border-dashed border-[var(--pv2-slate-300)] text-[var(--pv2-faint)]',
      className
    )}
  >
    {initials ?? <UserPlus className='size-3' strokeWidth={2.2} aria-hidden />}
  </span>
);
