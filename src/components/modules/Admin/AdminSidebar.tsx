'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  BookmarkIcon,
  ImagesIcon,
  InboxIcon,
  LayersIcon,
  LayoutDashboardIcon,
  LayoutTemplateIcon,
  LightbulbIcon,
  LogOutIcon,
  MegaphoneIcon,
  MenuIcon,
  MessageSquareIcon,
  PackageIcon,
  SparklesIcon,
  User2Icon,
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
  { href: '/admin/ads', labelKey: 'nav.ads', icon: MegaphoneIcon },
  {
    href: '/admin/ad-creatives',
    labelKey: 'nav.adCreatives',
    icon: LayersIcon,
  },
  {
    href: '/admin/landing-pages',
    labelKey: 'nav.canvasTemplates',
    icon: LayoutTemplateIcon,
    group: 'Content',
  },
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
    href: '/admin/insights',
    labelKey: 'nav.aiInsights',
    icon: LightbulbIcon,
    group: 'Content',
  },
  {
    href: '/admin/blocks',
    labelKey: 'nav.savedBlocks',
    icon: BookmarkIcon,
    group: 'Content',
  },
  {
    href: '/admin/assets',
    labelKey: 'nav.assets',
    icon: ImagesIcon,
    group: 'Content',
  },
  {
    href: '/admin/users',
    labelKey: 'nav.users',
    icon: UsersIcon,
    group: 'Ops',
  },
  {
    href: '/admin/users-global',
    labelKey: 'nav.usersGlobal',
    icon: User2Icon,
    group: 'Ops',
  },
  {
    href: '/admin/inbox',
    labelKey: 'nav.inbox',
    icon: InboxIcon,
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
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const locale = useLocale();
  const localeEnum = locale === 'en' ? Locale.EN : Locale.VI;
  const [collapsed, setCollapsed] = React.useState(false);

  const isBlockEditorRoute = React.useMemo(
    () =>
      /^\/admin\/blocks\/[^/]+\/edit\/?$/.test(pathname ?? '') ||
      /^\/admin\/templates\/[^/]+\/edit\/?$/.test(pathname ?? '') ||
      /^\/admin\/landing-pages\/[^/]+\/?$/.test(pathname ?? ''),
    [pathname]
  );

  // Khôi phục trạng thái thu gọn từ localStorage (chỉ chạy client).
  React.useEffect(() => {
    setCollapsed(localStorage.getItem('admin-sidebar-collapsed') === '1');
  }, []);

  // Block editor full-screen — thu gọn sidebar để tối đa không gian canvas.
  React.useEffect(() => {
    if (!isBlockEditorRoute) return;
    setCollapsed(true);
    localStorage.setItem('admin-sidebar-collapsed', '1');
  }, [isBlockEditorRoute]);

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('admin-sidebar-collapsed', next ? '1' : '0');
      return next;
    });
  };

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    // Hard nav — tránh kẹt trang do Router Cache sau logout (xem _shell.tsx).
    window.location.replace('/sign-in');
  };

  return (
    <aside
      className={cn(
        'border-border bg-background flex h-screen shrink-0 flex-col border-r transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Brand header */}
      <div
        className={cn(
          'border-border flex h-14 items-center border-b',
          collapsed ? 'justify-center px-2' : 'gap-2 px-4'
        )}
      >
        <button
          type='button'
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          aria-expanded={!collapsed}
          className='text-content-muted hover:bg-muted hover:text-foreground flex size-8 shrink-0 items-center justify-center rounded-md transition-colors'
        >
          <MenuIcon className='size-5' />
        </button>
        {!collapsed && (
          <>
            <div className='text-2xs flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 font-mono font-bold text-white shadow-sm'>
              RX
            </div>
            <div className='leading-tight'>
              <div className='text-sm font-semibold tracking-tight'>Rexer</div>
              <div className='text-3xs text-muted-foreground font-semibold tracking-wider uppercase'>
                Admin Console
              </div>
            </div>
          </>
        )}
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
          const label = (() => {
            try {
              return t(n.labelKey);
            } catch {
              return n.labelKey;
            }
          })();
          return (
            <div key={n.href}>
              {showGroup && !collapsed && (
                <div className='text-3xs text-muted-foreground mt-3 mb-1 px-2.5 font-bold tracking-wider uppercase'>
                  {n.group}
                </div>
              )}
              <Link
                href={n.href}
                title={collapsed ? label : undefined}
                className={cn(
                  'flex items-center gap-2.5 rounded-md py-2 text-sm font-medium transition-colors',
                  collapsed ? 'justify-center px-0' : 'px-2.5',
                  active
                    ? 'bg-foreground text-background'
                    : 'text-content-muted hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className='size-4 shrink-0' />
                {!collapsed && label}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Footer: user + logout */}
      <div className='border-border border-t p-3'>
        {user && (
          <div
            className={cn(
              'bg-muted mb-2 flex items-center rounded-lg',
              collapsed ? 'justify-center p-1.5' : 'gap-2 px-2.5 py-2'
            )}
          >
            <div
              className='text-3xs flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 font-mono font-bold text-white'
              title={
                collapsed
                  ? (user.display_name ?? user.email ?? undefined)
                  : undefined
              }
            >
              {(user.display_name ?? user.email ?? '?')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            {!collapsed && (
              <div className='min-w-0 flex-1 leading-tight'>
                <div className='text-foreground truncate text-xs font-semibold'>
                  {user.display_name ?? user.email}
                </div>
                <div className='text-3xs text-content-muted truncate'>
                  {user.role ?? user.principal_type}
                </div>
              </div>
            )}
          </div>
        )}
        {collapsed ? (
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleLogout}
            aria-label={t('logout')}
            title={t('logout')}
            className='w-full justify-center px-0'
          >
            <LogOutIcon className='size-3.5' />
          </Button>
        ) : (
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
        )}
      </div>
    </aside>
  );
}
