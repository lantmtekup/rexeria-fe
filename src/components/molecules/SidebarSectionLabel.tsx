import * as React from 'react';

import { cn } from '@/lib/cn';

export interface SidebarSectionLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Section heading inside AppSidebar — "Account & Team", "General", "Other".
 * Bold grey, small, with consistent vertical padding.
 */
function SidebarSectionLabel({
  className,
  children,
  ...props
}: SidebarSectionLabelProps) {
  return (
    <div
      className={cn(
        'text-content-muted px-5 pt-8 pb-4 text-sm font-bold tracking-[-0.02em]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { SidebarSectionLabel };
