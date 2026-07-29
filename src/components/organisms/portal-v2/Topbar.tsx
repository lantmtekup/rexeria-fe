'use client';

import {
  Bell,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Store,
} from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

import { Logo } from '@/components/atoms/logo';
import { LocaleSwitch } from '@/components/molecules/portal-v2/LocaleSwitch';
import { initialsFrom } from '@/helpers/portal-v2/initials';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { cn } from '@/lib/cn';
import { PORTAL_V2_BASE } from '@/lib/portal-v2/nav';
import { Locale } from '@/settings/enums';
import { logoutThunk } from '@/store/slices/authSlice';

type TopbarProps = {
  railCollapsed: boolean;
  onToggleRail: () => void;
};

export const Topbar = ({ railCollapsed, onToggleRail }: TopbarProps) => {
  const t = useTranslations('portalV2.shell');
  const locale = useLocale() as Locale;
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = user?.display_name || user?.email || 'User';
  const initials = initialsFrom(user?.display_name, user?.email);

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await dispatch(logoutThunk()).unwrap();
      toast.success(t('logoutSuccess'));
    } catch {
      toast.error(t('logoutError'));
    }
    window.location.replace('/sign-in');
  };

  const handleCreate = () => {
    toast.message(t('createSoon'));
  };

  const handleNotifications = () => {
    toast.message(t('notificationsEmpty'));
  };

  return (
    <header
      className={cn(
        'z-[var(--pv2-z-top)] col-span-2 grid h-[var(--pv2-top)] items-center',
        'border-b border-[var(--pv2-hair)] bg-[var(--pv2-paper)]',
        'transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'motion-reduce:transition-none',
        railCollapsed
          ? 'grid-cols-[var(--pv2-rail)_minmax(0,1fr)]'
          : 'grid-cols-[var(--pv2-rail-full)_minmax(0,1fr)]'
      )}
    >
      <div className='flex h-full items-center overflow-hidden border-r border-[var(--pv2-hair)] px-3'>
        {!railCollapsed ? (
          <Link
            href={PORTAL_V2_BASE}
            aria-label={t('brandName')}
            className='shrink-0'
          >
            <Logo size={20} />
          </Link>
        ) : null}
      </div>

      <div className='flex h-full min-w-0 items-center gap-2 pr-5 pl-3'>
        <button
          type='button'
          aria-label={railCollapsed ? t('expandSidebar') : t('collapseSidebar')}
          aria-expanded={!railCollapsed}
          aria-controls='portal-v2-rail'
          tabIndex={0}
          onClick={onToggleRail}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggleRail();
            }
          }}
          className={cn(
            'grid size-9 shrink-0 place-items-center rounded-[var(--pv2-r)]',
            'text-[var(--pv2-mut)] transition-colors',
            'hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)]',
            'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2',
            'active:scale-[0.98]'
          )}
        >
          {railCollapsed ? (
            <PanelLeftOpen className='size-5' strokeWidth={1.75} aria-hidden />
          ) : (
            <PanelLeftClose className='size-5' strokeWidth={1.75} aria-hidden />
          )}
        </button>

        <div
          className={cn(
            'flex h-9 w-[200px] shrink-0 items-center gap-2 rounded-[var(--pv2-r)]',
            'border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-3',
            'text-[var(--pv2-faint)]'
          )}
        >
          <Search
            className='size-3.5 shrink-0'
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            type='search'
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchAria')}
            disabled
            className='min-w-0 flex-1 border-0 bg-transparent text-[13px] text-[var(--pv2-ink)] outline-none placeholder:text-[var(--pv2-faint)] disabled:cursor-not-allowed'
          />
        </div>

        <div className='ml-auto flex shrink-0 items-center gap-2'>
          <Link
            href={`${PORTAL_V2_BASE}/exchange`}
            aria-label={t('exchangeAria')}
            className={cn(
              'inline-flex h-[34px] items-center gap-1.5 rounded-full border border-[var(--pv2-hair)]',
              'bg-transparent px-3 text-[13px] font-semibold text-[var(--pv2-ink)] no-underline',
              'transition-colors hover:border-[var(--pv2-slate-300)] hover:bg-[var(--pv2-paper)]',
              'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2',
              'active:scale-[0.98]'
            )}
          >
            <Store className='size-4' strokeWidth={2} aria-hidden />
            {t('exchange')}
          </Link>

          <button
            type='button'
            aria-label={t('createAria')}
            title={t('createAria')}
            tabIndex={0}
            onClick={handleCreate}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCreate();
              }
            }}
            className={cn(
              'inline-flex h-[34px] items-center gap-1.5 rounded-full px-3.5',
              'bg-[var(--pv2-electric)] text-[13px] font-semibold text-[var(--pv2-paper)]',
              'shadow-[0_6px_16px_rgba(56,98,255,0.28)] transition-colors',
              'hover:bg-[var(--pv2-electric-hover)]',
              'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2',
              'active:scale-[0.98]'
            )}
          >
            <Plus className='size-[15px]' strokeWidth={2.4} aria-hidden />
            {t('create')}
          </button>

          <button
            type='button'
            aria-label={t('notifications')}
            tabIndex={0}
            onClick={handleNotifications}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNotifications();
              }
            }}
            className={cn(
              'grid size-9 place-items-center rounded-full',
              'text-[var(--pv2-mut)] transition-colors',
              'hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)]',
              'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2',
              'active:scale-[0.98]'
            )}
          >
            <Bell className='size-[18px]' strokeWidth={2} aria-hidden />
          </button>

          <LocaleSwitch locale={locale} />

          <div className='relative'>
            <button
              type='button'
              aria-label={t('accountAria', { name: displayName })}
              aria-expanded={menuOpen}
              aria-haspopup='menu'
              tabIndex={0}
              onClick={() => setMenuOpen(o => !o)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setMenuOpen(o => !o);
                }
                if (e.key === 'Escape') setMenuOpen(false);
              }}
              className={cn(
                'grid size-10 place-items-center rounded-full text-sm font-bold text-[var(--pv2-paper)]',
                'bg-[var(--pv2-electric)] transition-colors outline-none',
                'hover:bg-[var(--pv2-electric-hover)]',
                'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2',
                'active:scale-[0.98]'
              )}
            >
              {initials}
            </button>

            {menuOpen ? (
              <>
                <button
                  type='button'
                  aria-label={t('closeMenu')}
                  className='fixed inset-0 z-[calc(var(--pv2-z-top)+1)] cursor-default'
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  role='menu'
                  className={cn(
                    'absolute top-[calc(100%+10px)] right-0 z-[calc(var(--pv2-z-top)+2)] min-w-[200px]',
                    'rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] py-1.5',
                    'shadow-[var(--pv2-sh-soft)]'
                  )}
                >
                  <div className='border-b border-[var(--pv2-hair)] px-4 py-3'>
                    <p className='truncate text-[15px] font-semibold text-[var(--pv2-ink)]'>
                      {displayName}
                    </p>
                    {user?.email ? (
                      <p className='mt-0.5 truncate text-sm text-[var(--pv2-mut)]'>
                        {user.email}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type='button'
                    role='menuitem'
                    tabIndex={0}
                    onClick={handleLogout}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleLogout();
                    }}
                    className={cn(
                      'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[15px]',
                      'text-[var(--pv2-ink)] hover:bg-[var(--pv2-canvas)]'
                    )}
                  >
                    <LogOut
                      className='size-[18px]'
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    {t('logout')}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
