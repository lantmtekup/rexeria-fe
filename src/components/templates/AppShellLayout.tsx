import * as React from 'react';

import { AuthHydrator } from '@/components/modules/Auth/AuthHydrator';
import { AppSidebar } from '@/components/organisms/AppSidebar';
import { cn } from '@/lib/cn';

export interface AppShellLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Outer shell for all authenticated REXER pages.
 *   ┌─────────┬────────────────────────────────────────┐
 *   │ Sidebar │ children (scrollable main area)        │
 *   └─────────┴────────────────────────────────────────┘
 */
function AppShellLayout({ children, className }: AppShellLayoutProps) {
  return (
    <div
      className={cn(
        'bg-background text-foreground flex h-screen w-full overflow-hidden',
        className
      )}
    >
      <AuthHydrator />
      <AppSidebar />
      <main className='flex h-full min-w-0 flex-1 flex-col overflow-y-auto'>
        {children}
      </main>
    </div>
  );
}

export { AppShellLayout };
