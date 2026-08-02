'use client';

import { useTranslations } from 'next-intl';

import { DEPLOY_HEALTH } from '@/lib/portal-v2/deploy/constants';
import type { DeployHealth } from '@/lib/portal-v2/deploy/types';
import { cn } from '@/lib/cn';

type HealthPillProps = {
  health: DeployHealth;
  /** Failing tracking points — named under the pill, never inside it. */
  errors?: number;
  className?: string;
};

/**
 * Whether the thing is working — not whether it is good.
 *
 * The `title` carries the distinction the colour cannot: `stale` and `quiet`
 * are both amber and mean different things.
 */
export const HealthPill = ({
  health,
  errors = 0,
  className,
}: HealthPillProps) => {
  const t = useTranslations('portalV2.deploy');
  const style = DEPLOY_HEALTH[health];

  return (
    <span className={cn('inline-block', className)}>
      <span
        title={t(style.hintKey)}
        className='inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11.5px] font-semibold'
        style={{ background: style.bg, color: style.fg }}
      >
        <span
          className='size-1.5 rounded-full'
          style={{ background: style.dot }}
          aria-hidden
        />
        {t(style.labelKey)}
      </span>
      {errors > 0 ? (
        <span className='mt-1 block text-[10.5px] font-medium text-[var(--pv2-error)]'>
          {t('failingPoints', { count: errors })}
        </span>
      ) : null}
    </span>
  );
};
