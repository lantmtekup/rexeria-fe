'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { Button } from '@/components/atoms/button';
import { LanguageSwitcher } from '@/components/molecules/LanguageSwitcher';
import { useAppDispatch } from '@/hooks/useRedux';
import { logoutThunk } from '@/store/slices/authSlice';
import { cn } from '@/lib/cn';
import { Locale } from '@/settings/enums';

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('cms');
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const locale = useLocale();
  const localeEnum = locale === 'en' ? Locale.EN : Locale.VI;

  const nav = useMemo(
    () => [
      { href: '/cms', label: t('navOverview') },
      { href: '/cms/settings', label: t('navSettings') },
    ],
    [t]
  );

  const basePath = pathname?.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    // Hard nav — tránh kẹt trang do Router Cache sau logout (xem _shell.tsx).
    window.location.replace('/sign-in');
  };

  return (
    <div className='bg-background flex min-h-screen flex-col md:flex-row'>
      <aside className='border-border bg-card text-card-foreground flex w-full flex-shrink-0 flex-col border-b md:w-56 md:border-r md:border-b-0'>
        <div className='border-border flex h-14 items-center border-b px-4'>
          <span className='text-sm font-semibold'>{t('sidebarTitle')}</span>
        </div>
        <nav
          className='flex flex-1 flex-col gap-0.5 p-2'
          aria-label={t('ariaNav')}
        >
          {nav.map(item => {
            const active =
              item.href === '/cms'
                ? basePath === '/cms' || basePath === '/cms/'
                : basePath === item.href ||
                  basePath.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'hover:bg-muted rounded-md px-3 py-2 text-sm transition-colors',
                  active && 'bg-muted font-medium'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className='flex min-h-0 min-w-0 flex-1 flex-col'>
        <header className='border-border bg-background flex h-14 flex-shrink-0 items-center justify-between gap-4 border-b px-4'>
          <LanguageSwitcher locale={localeEnum} variant='default' />
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleLogout}
          >
            {t('logout')}
          </Button>
        </header>
        <div className='min-h-0 flex-1 overflow-auto'>{children}</div>
      </div>
    </div>
  );
}
