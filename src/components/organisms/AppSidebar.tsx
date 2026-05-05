'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Home,
  LayoutTemplate,
  LogOut,
  Megaphone,
  MessageCircleQuestion,
  Package,
  PanelLeftClose,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Logo } from '@/components/atoms/logo';
import { ThemeToggle } from '@/components/atoms/theme-toggle';
import { AccountCard } from '@/components/molecules/AccountCard';
import { SidebarItem } from '@/components/molecules/SidebarItem';
import { SidebarSectionLabel } from '@/components/molecules/SidebarSectionLabel';
import { TeamCard } from '@/components/molecules/TeamCard';
import { useAuthRole } from '@/hooks/useAuthRole';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { cn } from '@/lib/cn';
import { logoutThunk } from '@/store/slices/authSlice';

export interface AppSidebarProps extends React.HTMLAttributes<HTMLElement> {
  team?: {
    name: string;
    initial?: string;
    color?: string;
  };
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
 * Layout: Logo → Account & Team → General nav → Other nav → ThemeToggle pinned bottom.
 */
function AppSidebar({
  team = { name: 'Hnd.Studio', initial: 'H' },
  mobileOpen = false,
  onMobileClose,
  desktopCollapsed = false,
  onDesktopToggle,
  className,
}: AppSidebarProps) {
  const t = useTranslations('app.sidebar');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const { isClientUser } = useAuthRole();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  // Click-outside to close the logout menu.
  React.useEffect(() => {
    if (!menuOpen) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // Esc to close mobile drawer.
  React.useEffect(() => {
    if (!mobileOpen || !onMobileClose) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onMobileClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mobileOpen, onMobileClose]);

  async function handleLogout() {
    setMenuOpen(false);
    await dispatch(logoutThunk())
      .unwrap()
      .catch(() => {});
    router.replace('/sign-in');
  }

  const displayName = user?.display_name || user?.email || t('guest');
  const planLabel = user?.email || t('basicPlan');

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
          {/* Account & Team */}
          <SidebarSectionLabel>{t('sectionAccountTeam')}</SidebarSectionLabel>
          <div ref={menuRef} className='relative flex flex-col gap-1 px-2'>
            <AccountCard
              sublabel={planLabel}
              name={displayName}
              onClick={() => setMenuOpen(v => !v)}
              aria-expanded={menuOpen}
            />
            {menuOpen && (
              <div
                role='menu'
                className='border-border bg-background absolute top-[calc(100%+4px)] right-2 left-2 z-20 overflow-hidden rounded-lg border shadow-md'
              >
                <button
                  type='button'
                  role='menuitem'
                  onClick={handleLogout}
                  className='text-foreground hover:bg-muted flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors'
                >
                  <LogOut className='size-4' />
                  {t('logout')}
                </button>
              </div>
            )}
            {!isClientUser && (
              <TeamCard
                sublabel={t('teamLabel')}
                name={team.name}
                initial={team.initial}
                color={team.color}
              />
            )}
          </div>

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

          {/* Other */}
          <SidebarSectionLabel>{t('sectionOther')}</SidebarSectionLabel>
          <nav className='flex flex-col'>
            <SidebarItem
              href='/notification'
              label={t('navNotification')}
              icon={Bell}
            />
            <SidebarItem
              href='/setting'
              label={t('navSetting')}
              icon={Settings}
            />
            <SidebarItem
              href='/support'
              label={t('navSupport')}
              icon={MessageCircleQuestion}
            />
          </nav>

          <div className='flex-1' />
        </div>

        {/* Theme toggle pinned to bottom */}
        <div className='border-sidebar-border border-t px-5 py-4'>
          <ThemeToggle className='w-full [&>button]:flex-1' />
        </div>
      </aside>
    </>
  );
}

export { AppSidebar };
