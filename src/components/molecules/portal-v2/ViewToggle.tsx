'use client';

import { LayoutGrid, List } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';
import { cn } from '@/lib/cn';

export type PortalViewMode = 'grid' | 'table';

export type ViewToggleProps = {
  value: PortalViewMode;
  onChange: (view: PortalViewMode) => void;
  className?: string;
};

const itemClass = (active: boolean) =>
  cn(
    'size-7 rounded-[8px] border-0 p-0 hover:border-0',
    active
      ? 'bg-[var(--pv2-canvas)] text-[var(--pv2-ink)]'
      : 'bg-transparent text-[var(--pv2-faint)] hover:text-[var(--pv2-ink)]'
  );

/**
 * Segmented grid/list switch cho các surface Portal V2 có 2 chế độ xem.
 */
export const ViewToggle = ({ value, onChange, className }: ViewToggleProps) => {
  const t = useTranslations('portalV2.viewToggle');
  const listLabel = t('list');
  const gridLabel = t('grid');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-[10px] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] p-0.5',
        className
      )}
    >
      <Button
        variant='toggle'
        aria-pressed={value === 'table'}
        aria-label={listLabel}
        title={listLabel}
        onClick={() => onChange('table')}
        className={itemClass(value === 'table')}
      >
        <List strokeWidth={2} aria-hidden />
      </Button>
      <Button
        variant='toggle'
        aria-pressed={value === 'grid'}
        aria-label={gridLabel}
        title={gridLabel}
        onClick={() => onChange('grid')}
        className={itemClass(value === 'grid')}
      >
        <LayoutGrid strokeWidth={2} aria-hidden />
      </Button>
    </span>
  );
};
