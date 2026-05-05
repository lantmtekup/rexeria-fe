'use client';

import * as React from 'react';
import { Menu, PanelLeftOpen, X } from 'lucide-react';

import { Logo } from '@/components/atoms/logo';
import { AuthHydrator } from '@/components/modules/Auth/AuthHydrator';
import { AppSidebar } from '@/components/organisms/AppSidebar';
import { cn } from '@/lib/cn';

export interface AppShellLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const SIDEBAR_COLLAPSED_KEY = 'rexer:sidebar:collapsed';

/**
 * Outer shell for all authenticated REXER pages.
 *  Desktop (≥ md):  ┌────────┬───────────────┐
 *                   │ aside  │ <main>        │
 *                   └────────┴───────────────┘
 *  Mobile (< md):   ┌──────────────────────┐
 *                   │ ☰  REXER             │  top bar
 *                   ├──────────────────────┤
 *                   │ <main>               │
 *                   └──────────────────────┘
 *                   ↑ tap ☰ → drawer slides in from left
 */
function AppShellLayout({ children, className }: AppShellLayoutProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = React.useState(false);

  // Hydrate desktop-collapsed preference from localStorage after mount —
  // avoids SSR/CSR mismatch since we default to expanded.
  React.useEffect(() => {
    try {
      if (localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1') {
        setDesktopCollapsed(true);
      }
    } catch {
      // ignore (private mode, etc.)
    }
  }, []);

  const toggleDesktop = React.useCallback(() => {
    setDesktopCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Close drawer when viewport crosses to desktop — avoids stale `open` state.
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Lock body scroll while drawer is open.
  React.useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div
      className={cn(
        'bg-background text-foreground flex h-screen w-full overflow-hidden',
        className
      )}
    >
      <AuthHydrator />
      <AppSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        desktopCollapsed={desktopCollapsed}
        onDesktopToggle={toggleDesktop}
      />
      <main className='flex h-full min-w-0 flex-1 flex-col overflow-y-auto'>
        {/* Mobile-only top bar. z-50 keeps the toggle clickable above the
            backdrop (z-40); drawer sits at z-60 so it slides above this bar. */}
        <div className='border-border bg-background sticky top-0 z-50 flex h-12 shrink-0 items-center gap-3 border-b px-3 md:hidden'>
          <button
            type='button'
            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(prev => !prev)}
            className='hover:bg-muted flex size-9 cursor-pointer items-center justify-center rounded-md'
          >
            {mobileOpen ? (
              <X className='size-5' />
            ) : (
              <Menu className='size-5' />
            )}
          </button>
          <Logo size={16} />
        </div>
        {/* Desktop-only floating "expand sidebar" pill — appears only when the
            sidebar is collapsed so the user has a way back. */}
        {desktopCollapsed && (
          <button
            type='button'
            aria-label='Mở menu'
            onClick={toggleDesktop}
            className='border-border bg-background hover:bg-muted fixed top-3 left-3 z-40 hidden size-9 cursor-pointer items-center justify-center rounded-md border shadow-sm md:flex'
          >
            <PanelLeftOpen className='size-4' />
          </button>
        )}
        {children}
      </main>
    </div>
  );
}

export { AppShellLayout };
