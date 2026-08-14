'use client';

import { useTranslations } from 'next-intl';

import { DEPLOY_HEALTH } from '@/lib/portal-v2/deploy/constants';
import type { DeployHealth } from '@/lib/portal-v2/deploy/types';
import { cn } from '@/lib/cn';

type HealthPillProps = {
  health: DeployHealth;
  /** The BE's own `health_reason` for THIS instance, shown as the `title`
   *  when given — falls back to the generic per-state hint otherwise. Only
   *  meaningful on a single channel's health; a row-level summary (the worst
   *  across several channels) has no one reason to show. */
  reason?: string;
  className?: string;
};

/**
 * Whether the thing is working — not whether it is good.
 *
 * The `title` carries the distinction the colour cannot: `stale` and `quiet`
 * are both amber and mean different things.
 */
export const HealthPill = ({ health, reason, className }: HealthPillProps) => {
  const t = useTranslations('portalV2.deploy');
  const style = DEPLOY_HEALTH[health];

  return (
    <span
      title={reason ?? t(style.hintKey)}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-semibold',
        className
      )}
      style={{ background: style.bg, color: style.fg }}
    >
      <span
        className='size-1.5 rounded-full'
        style={{ background: style.dot }}
        aria-hidden
      />
      {t(style.labelKey)}
    </span>
  );
};
