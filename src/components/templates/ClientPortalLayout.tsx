'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  ExternalLink,
  FolderKanban,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';

import { AuthHydrator } from '@/components/modules/Auth/AuthHydrator';
import { Logo } from '@/components/atoms/logo';
import { ThemeToggle } from '@/components/atoms/theme-toggle';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { logoutThunk } from '@/store/slices/authSlice';
import { cn } from '@/lib/cn';

export interface ClientPortalLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV: NavItem[] = [
  {
    href: '/portal',
    label: 'Overview',
    icon: LayoutDashboard,
  },
  {
    href: '/portal/projects',
    label: 'My projects',
    icon: FolderKanban,
  },
];

function ClientPortalLayout({ children }: ClientPortalLayoutProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
    } catch {
      // ignore
    }
    toast.success('Signed out');
    router.replace('/sign-in');
  };

  const displayName = user?.display_name || user?.email || 'Guest';

  return (
    <div className='bg-background text-foreground flex h-screen w-full overflow-hidden'>
      <AuthHydrator />
      <aside
        aria-label='Client portal navigation'
        className={cn(
          'border-sidebar-border bg-sidebar text-sidebar-foreground flex h-screen w-56 shrink-0 flex-col border-r'
        )}
      >
        <div className='flex items-center gap-2 px-5 py-5'>
          <Logo size={18} />
          <span className='text-foreground text-xs font-semibold tracking-wide uppercase'>
            Portal
          </span>
        </div>

        <div className='border-sidebar-border mx-3 mb-3 flex items-center gap-2 rounded-lg border px-3 py-2'>
          <span className='bg-primary/10 text-primary inline-flex size-7 items-center justify-center rounded-md'>
            <Building2 className='size-3.5' />
          </span>
          <div className='min-w-0 flex-1'>
            <p className='text-foreground truncate text-xs font-semibold'>
              {displayName}
            </p>
            <p className='text-muted-foreground truncate text-[10px]'>
              {user?.email ?? 'signed in'}
            </p>
          </div>
        </div>

        <nav className='flex flex-col px-2'>
          {NAV.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className='text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors'
              >
                <Icon className='size-4' />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className='flex-1' />

        <div className='border-sidebar-border space-y-2 border-t px-4 py-3'>
          <button
            type='button'
            onClick={handleLogout}
            className='text-foreground hover:bg-muted inline-flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors'
          >
            <LogOut className='size-4' /> Sign out
          </button>
          <Link
            href='/home'
            className='text-muted-foreground hover:text-foreground inline-flex w-full items-center gap-1.5 px-2 text-xs'
          >
            <ExternalLink className='size-3' /> Switch to studio
          </Link>
          <ThemeToggle className='w-full [&>button]:flex-1' />
        </div>
      </aside>
      <main className='flex h-full min-w-0 flex-1 flex-col overflow-y-auto'>
        {children}
      </main>
    </div>
  );
}

export { ClientPortalLayout };
