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
  /** `false` = khách chưa đăng nhập; xem `Shell` để biết vì sao. */
  signedIn?: boolean;
};

export const Topbar = ({
  railCollapsed,
  onToggleRail,
  signedIn = true,
}: TopbarProps) => {
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

  /*
   * Thanh trên cho KHÁCH — một nhánh riêng, không phải thanh cũ bị tắt bớt nút.
   *
   * Dựng chung rồi ẩn từng thứ sẽ để lại nút gạt sidebar (không còn sidebar để
   * gạt), ô tìm kiếm chết, và một avatar rỗng — ba dấu vết của một màn hình
   * dành cho người khác. Ở đây chỉ còn đúng ba thứ khách cần: đây là đâu, đổi
   * ngôn ngữ, và đường vào.
   */
  if (!signedIn) {
    return (
      <header
        className={cn(
          'z-[var(--pv2-z-top)] col-span-full flex h-[var(--pv2-top)] items-center gap-3',
          'border-b border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-5 shadow-[var(--pv2-sh-sm)]'
        )}
      >
        <Link
          href='/'
          aria-label={t('backToSite')}
          className='shrink-0 transition-transform duration-200 active:scale-[0.96]'
        >
          <Logo size={22} />
        </Link>

        <span
          className={cn(
            'hidden items-center gap-1.5 rounded-full border border-[var(--pv2-hair)]',
            'bg-[var(--pv2-canvas)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--pv2-mut)] sm:inline-flex'
          )}
        >
          <Store className='size-3.5' strokeWidth={1.75} aria-hidden />
          {t('guestBadge')}
        </span>

        <div className='ml-auto flex shrink-0 items-center gap-2.5'>
          <LocaleSwitch locale={locale} />

          <Link
            href='/sign-in'
            className={cn(
              'inline-flex h-[34px] items-center rounded-full border border-[var(--pv2-hair)]',
              'bg-transparent px-3.5 text-[13px] font-semibold text-[var(--pv2-ink)] no-underline',
              'transition-all duration-200 hover:border-[var(--pv2-slate-300)] hover:bg-[var(--pv2-canvas)]',
              'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2',
              'active:scale-[0.96]'
            )}
          >
            {t('signIn')}
          </Link>

          <Link
            href='/sign-up'
            className={cn(
              'inline-flex h-[34px] items-center rounded-full px-3.5 no-underline',
              'bg-[var(--pv2-electric)] text-[13px] font-semibold text-[var(--pv2-paper)]',
              'shadow-[0_4px_12px_rgba(56,98,255,0.25)] transition-all duration-200',
              'hover:-translate-y-[0.5px] hover:bg-[var(--pv2-electric-hover)] hover:shadow-[0_6px_16px_rgba(56,98,255,0.35)]',
              'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2',
              'active:translate-y-0 active:scale-[0.96] active:shadow-none'
            )}
          >
            {t('signUp')}
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        'z-[var(--pv2-z-top)] col-span-2 grid h-[var(--pv2-top)] items-center',
        'border-b border-[var(--pv2-hair)] bg-[var(--pv2-paper)] shadow-[var(--pv2-sh-sm)]',
        'transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'motion-reduce:transition-none',
        railCollapsed
          ? 'grid-cols-[var(--pv2-rail)_minmax(0,1fr)]'
          : 'grid-cols-[var(--pv2-rail-full)_minmax(0,1fr)]'
      )}
    >
      <div className='flex h-full items-center overflow-hidden border-r border-[var(--pv2-hair)] px-5'>
        {!railCollapsed ? (
          <Link
            href={PORTAL_V2_BASE}
            aria-label={t('brandName')}
            className='shrink-0 transition-transform duration-200 active:scale-[0.96]'
          >
            <Logo size={22} />
          </Link>
        ) : null}
      </div>

      <div className='flex h-full min-w-0 items-center gap-3 pr-5 pl-4'>
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
            'text-[var(--pv2-mut)] transition-all duration-200',
            'hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)]',
            'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2',
            'active:scale-[0.96]'
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
            'flex h-9 w-[240px] shrink-0 items-center gap-2 rounded-[var(--pv2-r)]',
            'border border-[var(--pv2-hair)] bg-[var(--pv2-canvas)] px-3',
            'text-[var(--pv2-faint)] transition-all duration-200',
            'hover:border-[var(--pv2-slate-300)] hover:bg-[var(--pv2-paper)]',
            'focus-within:border-[var(--pv2-electric)] focus-within:bg-[var(--pv2-paper)] focus-within:ring-2 focus-within:ring-[var(--pv2-electric-soft)]'
          )}
        >
          <Search
            className='size-[15px] shrink-0'
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            type='search'
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchAria')}
            disabled
            className='min-w-0 flex-1 border-0 bg-transparent text-[13px] font-medium text-[var(--pv2-ink)] outline-none placeholder:text-[var(--pv2-faint)] disabled:cursor-not-allowed'
          />
        </div>

        <div className='ml-auto flex shrink-0 items-center gap-2.5'>
          <Link
            href={`${PORTAL_V2_BASE}/exchange`}
            aria-label={t('exchangeAria')}
            className={cn(
              'inline-flex h-[34px] items-center gap-1.5 rounded-full border border-[var(--pv2-hair)]',
              'bg-transparent px-3 text-[13px] font-semibold text-[var(--pv2-ink)] no-underline',
              'transition-all duration-200 hover:border-[var(--pv2-slate-300)] hover:bg-[var(--pv2-canvas)]',
              'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2',
              'active:scale-[0.96]'
            )}
          >
            <Store
              className='size-4 text-[var(--pv2-mut)]'
              strokeWidth={1.75}
              aria-hidden
            />
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
              'shadow-[0_4px_12px_rgba(56,98,255,0.25)] transition-all duration-200',
              'hover:-translate-y-[0.5px] hover:bg-[var(--pv2-electric-hover)] hover:shadow-[0_6px_16px_rgba(56,98,255,0.35)]',
              'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2',
              'active:translate-y-0 active:scale-[0.96] active:shadow-none'
            )}
          >
            <Plus className='size-[16px]' strokeWidth={2.5} aria-hidden />
            {t('create')}
          </button>

          <div className='mx-1 h-4 w-[1px] bg-[var(--pv2-hair)]' aria-hidden />

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
              'text-[var(--pv2-mut)] transition-all duration-200',
              'hover:bg-[var(--pv2-canvas)] hover:text-[var(--pv2-ink)]',
              'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2',
              'active:scale-[0.96]'
            )}
          >
            <Bell className='size-[18px]' strokeWidth={1.75} aria-hidden />
          </button>

          <LocaleSwitch locale={locale} />

          <div className='relative ml-1'>
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
                'grid size-9 place-items-center rounded-full text-[13px] font-bold text-[var(--pv2-electric)]',
                'bg-[var(--pv2-electric-soft)] outline-none',
                'transition-all duration-200 ease-out',
                'hover:bg-[var(--pv2-electric)] hover:text-[var(--pv2-paper)] hover:shadow-[0_4px_12px_rgba(56,98,255,0.25)]',
                'focus-visible:ring-2 focus-visible:ring-[var(--pv2-electric)] focus-visible:ring-offset-2',
                'active:scale-[0.94]'
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
