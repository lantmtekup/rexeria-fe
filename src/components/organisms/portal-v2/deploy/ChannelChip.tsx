'use client';

import { useTranslations } from 'next-intl';

import {
  DEPLOY_CHANNEL_KIND,
  DEPLOY_HEALTH,
} from '@/lib/portal-v2/deploy/constants';
import type { DeployChannel, DeployHealth } from '@/lib/portal-v2/deploy/types';
import { cn } from '@/lib/cn';

type ChannelBadgeProps = {
  channel: Pick<DeployChannel, 'kind'>;
  size?: 'sm' | 'md';
  className?: string;
};

/** The channel's square mark. Same badge on a chip, a card and a modal head.
 *  Abbr/tint are local chrome keyed by `kind` — the BE gives no visual
 *  metadata for a channel, only its name/status. */
export const ChannelBadge = ({
  channel,
  size = 'sm',
  className,
}: ChannelBadgeProps) => {
  const style = DEPLOY_CHANNEL_KIND[channel.kind];
  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center rounded-[6px] font-bold text-white',
        size === 'sm' ? 'size-[18px] text-[9px]' : 'size-8 text-[12px]',
        className
      )}
      style={{ background: style.tint }}
    >
      {style.abbr}
    </span>
  );
};

type ChannelChipProps = {
  channel: Pick<DeployChannel, 'id' | 'kind' | 'name'>;
  /** When given, a coloured dot shows THIS channel's own health on the row —
   *  health is per channel, not per row (see `types.ts`). */
  health?: DeployHealth;
  healthReason?: string;
  className?: string;
};

/** Read-only: where a live row is being served, and (optionally) how that
 *  one channel is doing. */
export const ChannelChip = ({
  channel,
  health,
  healthReason,
  className,
}: ChannelChipProps) => {
  const t = useTranslations('portalV2.deploy');
  const healthStyle = health ? DEPLOY_HEALTH[health] : null;

  return (
    <span
      title={healthReason ?? (healthStyle ? t(healthStyle.hintKey) : undefined)}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-[var(--pv2-hair)]',
        'bg-[var(--pv2-paper)] py-0.5 pr-2 pl-1 text-[11.5px] font-medium text-[var(--pv2-slate-500)]',
        className
      )}
    >
      <ChannelBadge channel={channel} />
      {channel.name}
      {healthStyle ? (
        <span
          className='size-1.5 shrink-0 rounded-full'
          style={{ background: healthStyle.dot }}
          aria-hidden
        />
      ) : null}
    </span>
  );
};

type ChannelToggleProps = {
  channel: DeployChannel;
  selected: boolean;
  onToggle: (id: string) => void;
  /** Reason the pipe isn't connected yet — shown as the `title` on an
   *  unconnected chip. Informational only; picking it is still allowed, the
   *  BE is the one that rejects a deploy on an unconnected channel. */
  disabledHint: string;
};

/**
 * Pick a surface for a queued row. Client picks freely, including a channel
 * that isn't connected yet — the BE is the single source of truth on what a
 * deploy actually accepts, and returns the real reason as a 409 otherwise.
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
