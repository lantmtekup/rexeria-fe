import { ROLE_STYLE } from '@/lib/portal-v2/experiences/roleStyles';
import type { ExperienceLayer } from '@/lib/portal-v2/experiences/types';
import { cn } from '@/lib/cn';

type FunnelStackProps = {
  layers: ExperienceLayer[];
  /** Card cover density — thinner bars, tighter gaps. */
  compact?: boolean;
  className?: string;
};

/**
 * The stack of blocks a shopper moves down, one bar per layer, tinted by its
 * funnel role.
 *
 * This is the module's artwork: a block renders one wide bar, a collection
 * renders three to five. The Category axis becomes legible at a glance without
 * an asset pipeline.
 */
export const FunnelStack = ({
  layers,
  compact = false,
  className,
}: FunnelStackProps) => (
  <div
    className={cn(
      'flex w-full flex-col',
      compact ? 'gap-1' : 'gap-1.5',
      className
    )}
    aria-hidden
  >
    {layers.map((layer, i) => (
      <span
        key={`${layer.role}-${i}`}
        className={cn('block w-full rounded-full', compact ? 'h-2' : 'h-2.5')}
        style={{
          background: ROLE_STYLE[layer.role].bar,
          opacity: 0.22 + Math.min(i, 4) * 0.04,
        }}
      />
    ))}
  </div>
);
