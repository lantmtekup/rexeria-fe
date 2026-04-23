'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Home,
  LayoutTemplate,
  LogOut,
  MessageCircleQuestion,
  Package,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Logo } from '@/components/atoms/logo';
import { ThemeToggle } from '@/components/atoms/theme-toggle';
import { AccountCard } from '@/components/molecules/AccountCard';
import { SidebarItem } from '@/components/molecules/SidebarItem';
import { SidebarSectionLabel } from '@/components/molecules/SidebarSectionLabel';
import { TeamCard } from '@/components/molecules/TeamCard';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { cn } from '@/lib/cn';
import { logoutThunk } from '@/store/slices/authSlice';

export interface AppSidebarProps extends React.HTMLAttributes<HTMLElement> {
  team?: {
    name: string;
    initial?: string;
    color?: string;
  };
}

/**
 * Main left sidebar for the REXER app shell.
 * Layout: Logo → Account & Team → General nav → Other nav → ThemeToggle pinned bottom.
 */
function AppSidebar({
  team = { name: 'Hnd.Studio', initial: 'H' },
  className,
  ...props
}: AppSidebarProps) {
  const t = useTranslations('app.sidebar');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
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

  async function handleLogout() {
    setMenuOpen(false);
    await dispatch(logoutThunk())
      .unwrap()
      .catch(() => {});
    router.replace('/sign-in');
  }

  const displayName = user?.display_name || user?.email || t('guest');
  const planLabel = user?.email || t('basicPlan');

  return (
    <aside
      aria-label={t('ariaNav')}
      className={cn(
        'border-sidebar-border bg-sidebar text-sidebar-foreground flex h-screen w-60 shrink-0 flex-col border-r',
        className
      )}
      {...props}
    >
      {/* Logo */}
      <div className='flex items-center px-5 py-5'>
        <Logo size={18} />
      </div>

      {/* Scrollable content */}
      <div className='flex flex-1 flex-col overflow-y-auto'>
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
          <TeamCard
            sublabel={t('teamLabel')}
            name={team.name}
            initial={team.initial}
            color={team.color}
          />
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
          <SidebarItem href='/product' label={t('navProduct')} icon={Package} />
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
  );
}

export { AppSidebar };
