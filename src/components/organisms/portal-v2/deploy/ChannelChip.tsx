'use client';

import type { DeployChannel } from '@/lib/portal-v2/deploy/types';
import { cn } from '@/lib/cn';

type ChannelBadgeProps = {
  channel: DeployChannel;
  size?: 'sm' | 'md';
  className?: string;
};

/** The channel's square mark. Same badge on a chip, a card and a modal head. */
export const ChannelBadge = ({
  channel,
  size = 'sm',
  className,
}: ChannelBadgeProps) => (
  <span
    aria-hidden
    className={cn(
      'grid shrink-0 place-items-center rounded-[6px] font-bold text-white',
      size === 'sm' ? 'size-[18px] text-[9px]' : 'size-8 text-[12px]',
      className
    )}
    style={{ background: channel.tint }}
  >
    {channel.abbr}
  </span>
);

type ChannelChipProps = {
  channel: DeployChannel;
  className?: string;
};

/** Read-only: where a live row is being served. */
export const ChannelChip = ({ channel, className }: ChannelChipProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full border border-[var(--pv2-hair)]',
      'bg-[var(--pv2-paper)] py-0.5 pr-2 pl-1 text-[11.5px] font-medium text-[var(--pv2-slate-500)]',
      className
    )}
  >
    <ChannelBadge channel={channel} />
    {channel.name}
  </span>
);

type ChannelToggleProps = {
  channel: DeployChannel;
  selected: boolean;
  onToggle: (id: string) => void;
  /** Reason the pipe cannot be picked — shown as the disabled `title`. */
  disabledHint: string;
};

/**
 * Pick a surface for a queued row. A channel that is not connected cannot be
 * picked at all — the button says why rather than failing at publish time.
 */
export const ChannelToggle = ({
  channel,
  selected,
  onToggle,
  disabledHint,
}: ChannelToggleProps) => (
  <button
    type='button'
    role='switch'
    aria-checked={selected}
    disabled={!channel.connected}
    title={channel.connected ? undefined : disabledHint}
    onClick={() => onToggle(channel.id)}
    className={cn(
      'inline-flex cursor-pointer items-center gap-2 rounded-full border py-1 pr-3 pl-1.5',
      'text-[12px] font-semibold transition-colors',
      'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2 focus-visible:outline-none',
      'disabled:cursor-not-allowed disabled:opacity-45',
      selected
        ? 'border-[var(--pv2-electric)] bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)]'
        : 'border-[var(--pv2-hair)] bg-[var(--pv2-paper)] text-[var(--pv2-mut)] hover:border-[var(--pv2-slate-300)]'
    )}
  >
    <ChannelBadge channel={channel} />
    {channel.name}
  </button>
);
