'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  BookmarkIcon,
  LayoutDashboardIcon,
  LayoutTemplateIcon,
  LogOutIcon,
  MessageSquareIcon,
  PackageIcon,
  SparklesIcon,
  UsersIcon,
} from 'lucide-react';

import { Button } from '@/components/atoms/button';
import { LanguageSwitcher } from '@/components/molecules/LanguageSwitcher';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { logoutThunk } from '@/store/slices/authSlice';
import { cn } from '@/lib/cn';
import { Locale } from '@/settings/enums';

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  group?: string;
}

const NAV: NavItem[] = [
  {
    href: '/admin',
    labelKey: 'nav.overview',
    icon: LayoutDashboardIcon,
    exact: true,
  },
  { href: '/admin/products', labelKey: 'nav.products', icon: PackageIcon },
  {
    href: '/admin/templates',
    labelKey: 'nav.templates',
    icon: LayoutTemplateIcon,
    group: 'Content',
  },
  {
    href: '/admin/ai-templates',
    labelKey: 'nav.aiTemplates',
    icon: SparklesIcon,
    group: 'Content',
  },
  {
    href: '/admin/blocks',
    labelKey: 'nav.savedBlocks',
    icon: BookmarkIcon,
    group: 'Content',
  },
  {
    href: '/admin/users',
    labelKey: 'nav.users',
    icon: UsersIcon,
    group: 'Ops',
  },
  {
    href: '/admin/ai-usage',
    labelKey: 'nav.aiUsage',
    icon: SparklesIcon,
    group: 'Ops',
  },
  {
    href: '/admin/feedback',
    labelKey: 'nav.feedback',
    icon: MessageSquareIcon,
    group: 'Ops',
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations('admin');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const locale = useLocale();
  const localeEnum = locale === 'en' ? Locale.EN : Locale.VI;

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    router.replace('/sign-in');
  };

  return (
    <aside className='flex h-screen w-60 shrink-0 flex-col border-r border-zinc-200 bg-white'>
      {/* Brand header */}
      <div className='flex h-14 items-center gap-2 border-b border-zinc-100 px-4'>
        <div className='flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 font-mono text-[11px] font-bold text-white shadow-sm'>
          RX
        </div>
        <div className='leading-tight'>
          <div className='text-sm font-semibold tracking-tight'>Rexer</div>
          <div className='text-[9.5px] font-semibold tracking-wider text-zinc-400 uppercase'>
            Admin Console
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav
        className='flex-1 space-y-0.5 overflow-y-auto px-2 py-3'
        aria-label='Admin navigation'
      >
        {NAV.map((n, i) => {
          const active = n.exact
            ? pathname === n.href
            : pathname?.startsWith(n.href);
          const Icon = n.icon;
          const showGroup =
            n.group && (i === 0 || NAV[i - 1].group !== n.group);
          return (
            <div key={n.href}>
              {showGroup && (
                <div className='mt-3 mb-1 px-2.5 text-[9.5px] font-bold tracking-wider text-zinc-400 uppercase'>
                  {n.group}
                </div>
              )}
              <Link
                href={n.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors',
                  active
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                )}
              >
                <Icon className='size-4 shrink-0' />
                {(() => {
                  try {
                    return t(n.labelKey);
                  } catch {
                    return n.labelKey;
                  }
                })()}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Footer: user + logout */}
      <div className='border-t border-zinc-100 p-3'>
        {user && (
          <div className='mb-2 flex items-center gap-2 rounded-lg bg-zinc-50 px-2.5 py-2'>
            <div className='flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 font-mono text-[10px] font-bold text-white'>
              {(user.display_name ?? user.email ?? '?')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className='min-w-0 flex-1 leading-tight'>
              <div className='truncate text-[12px] font-semibold text-zinc-800'>
                {user.display_name ?? user.email}
              </div>
              <div className='truncate text-[10px] text-zinc-500'>
                {user.role ?? user.principal_type}
              </div>
            </div>
          </div>
        )}
        <div className='flex items-center justify-between gap-2'>
          <LanguageSwitcher locale={localeEnum} variant='default' />
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleLogout}
            className='gap-1'
          >
            <LogOutIcon className='size-3.5' />
            {t('logout')}
          </Button>
        </div>
      </div>
    </aside>
  );
}
