'use client';

import * as React from 'react';

import { PillChip } from '@/components/atoms/pill-chip';
import { cn } from '@/lib/cn';

export interface TemplateCategory {
  key: string;
  label: string;
  count?: number | string;
}

export interface TemplateCategoryTabsProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  categories: TemplateCategory[];
  activeKey: string;
  onChange: (key: string) => void;
}

function TemplateCategoryTabs({
  categories,
  activeKey,
  onChange,
  className,
  ...props
}: TemplateCategoryTabsProps) {
  return (
    <div
      className={cn('flex flex-wrap items-center gap-2', className)}
      {...props}
    >
      {categories.map(c => (
        <PillChip
          key={c.key}
          label={c.label}
          count={c.count}
          selected={activeKey === c.key}
          onClick={() => onChange(c.key)}
        />
      ))}
    </div>
  );
}

export { TemplateCategoryTabs };
