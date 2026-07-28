'use client';

import * as React from 'react';
import {
  Home,
  LayoutTemplate,
  Megaphone,
  MessageCircleQuestion,
  Package,
  PanelLeftClose,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Logo } from '@/components/atoms/logo';
import { ThemeToggle } from '@/components/atoms/theme-toggle';
import { SidebarItem } from '@/components/molecules/SidebarItem';
import { SidebarSectionLabel } from '@/components/molecules/SidebarSectionLabel';
import { UserProfileMenu } from '@/components/molecules/UserProfileMenu';
import { useAuthRole } from '@/hooks/useAuthRole';
import { cn } from '@/lib/cn';

export interface AppSidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** When true, render as an overlay drawer on mobile (< md). Ignored on ≥ md. */
  mobileOpen?: boolean;
  /** Called when the drawer should close (backdrop click, nav tap, Esc). */
  onMobileClose?: () => void;
  /** When true, hide the sidebar on desktop (≥ md). Ignored on mobile. */
  desktopCollapsed?: boolean;
  /** Called when the user clicks the desktop collapse button. */
  onDesktopToggle?: () => void;
}

/**
 * Main left sidebar for the REXER app shell.
 * Layout: Logo → General nav → Other nav → UserProfileMenu pinned bottom.
 */
function AppSidebar({
  mobileOpen = false,
  onMobileClose,
  desktopCollapsed = false,
  onDesktopToggle,
  className,
}: AppSidebarProps) {
  const t = useTranslations('app.sidebar');
  // `/admin` tự nó chỉ cho role === 'admin' vào (xem middleware.ts — role-gate
  // /admin, chặn cả staff) — dùng isAdmin ở đây thay vì isInternal để sidebar
  // khớp với quyền THẬT, không hiện link chết cho staff (bấm vào bị đá về /home).
  const { isAdmin } = useAuthRole();

  // Esc to close mobile drawer.
  React.useEffect(() => {
    if (!mobileOpen || !onMobileClose) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onMobileClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mobileOpen, onMobileClose]);

  // Tap on a nav link should close the drawer on mobile.
  const handleNavClick = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!mobileOpen || !onMobileClose) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('a')) onMobileClose();
    },
    [mobileOpen, onMobileClose]
  );

  return (
    <>
      {/* Mobile-only backdrop */}
      <div
        aria-hidden
        onClick={onMobileClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity md:hidden',
          mobileOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        )}
      />
      <aside
        aria-label={t('ariaNav')}
        className={cn(
          // Desktop: normal flex column inside the shell — unless collapsed.
          'border-sidebar-border bg-sidebar text-sidebar-foreground md:static md:h-screen md:w-60 md:shrink-0 md:translate-x-0 md:flex-col md:border-r',
          desktopCollapsed ? 'md:hidden' : 'md:flex',
          // Mobile: fixed drawer that slides in from left. z-[60] sits
          // above the mobile top bar (z-50) so the drawer overlays it.
          'fixed inset-y-0 left-0 z-[60] flex w-72 max-w-[85vw] flex-col border-r transition-transform duration-200 ease-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          className
        )}
      >
        {/* Logo + close/collapse buttons. Close button lives inside the drawer
            because on narrow phones the drawer covers the main top bar's
            hamburger; collapse button is desktop-only. */}
        <div className='flex items-center justify-between px-5 py-5'>
          <Logo size={18} />
          <div className='flex items-center gap-1'>
            {onDesktopToggle && (
              <button
                type='button'
                aria-label='Ẩn menu'
                onClick={onDesktopToggle}
                className='hover:bg-muted hidden size-8 cursor-pointer items-center justify-center rounded-md md:flex'
              >
                <PanelLeftClose className='size-4' />
              </button>
            )}
            {onMobileClose && (
              <button
                type='button'
                aria-label='Đóng menu'
                onClick={onMobileClose}
                className='hover:bg-muted flex size-8 cursor-pointer items-center justify-center rounded-md md:hidden'
              >
                <X className='size-4' />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div
          className='flex flex-1 flex-col overflow-y-auto'
          onClick={handleNavClick}
        >
          {/* General */}
          <SidebarSectionLabel>{t('sectionGeneral')}</SidebarSectionLabel>
          <nav className='flex flex-col'>
            <SidebarItem href='/home' label={t('navHome')} icon={Home} />
            <SidebarItem
              href='/template'
              label={t('navTemplate')}
              icon={LayoutTemplate}
            />
            <SidebarItem
              href='/product'
              label={t('navProduct')}
              icon={Package}
            />
            <SidebarItem
              href='/marketing'
              label={t('navMarketing')}
              icon={Megaphone}
            />
            <SidebarItem
              href='/ai-agents'
              label={t('navAiAgents')}
              icon={Sparkles}
            />
          </nav>

          {/* Admin (platform admin only — matches middleware role-gate) */}
          {isAdmin && (
            <>
              <SidebarSectionLabel>{t('sectionAdmin')}</SidebarSectionLabel>
              <nav className='flex flex-col'>
                <SidebarItem
                  href='/admin'
                  label={t('navAdmin')}
                  icon={ShieldCheck}
                />
              </nav>
            </>
          )}

          {/* Other */}
          <SidebarSectionLabel>{t('sectionOther')}</SidebarSectionLabel>
          <nav className='flex flex-col'>
            <SidebarItem
              href='/support'
              label={t('navSupport')}
              icon={MessageCircleQuestion}
            />
          </nav>

          <div className='flex-1' />
        </div>

        {/* Profile + theme toggle pinned to bottom */}
        <div className='border-sidebar-border flex flex-col gap-2 border-t px-3 py-3'>
          <UserProfileMenu />
          <ThemeToggle className='w-full [&>button]:flex-1' />
        </div>
      </aside>
    </>
  );
}

export { AppSidebar };
