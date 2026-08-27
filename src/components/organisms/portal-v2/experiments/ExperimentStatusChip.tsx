import { cn } from '@/lib/cn';
import type { ExperimentStatus } from '@/lib/portal-v2/experiments/types';

const STATUS_CLASSES: Record<ExperimentStatus, string> = {
  running: 'bg-[var(--pv2-electric-soft)] text-[var(--pv2-electric)]',
  draft: 'bg-[var(--pv2-canvas)] text-[var(--pv2-mut)]',
  stopped:
    'bg-[color-mix(in_srgb,var(--pv2-warning)_9%,var(--pv2-paper))] text-[var(--pv2-warning)]',
  won: 'bg-[color-mix(in_srgb,var(--pv2-success)_10%,var(--pv2-paper))] text-[var(--pv2-success)]',
  lost: 'bg-[color-mix(in_srgb,var(--pv2-error)_9%,var(--pv2-paper))] text-[var(--pv2-error)]',
};

type ExperimentStatusChipProps = {
  status: ExperimentStatus;
  label: string;
};

export const ExperimentStatusChip = ({
  status,
  label,
}: ExperimentStatusChipProps) => (
  <span
    className={cn(
      'inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.06em] uppercase',
      STATUS_CLASSES[status]
    )}
  >
    {label}
  </span>
);
