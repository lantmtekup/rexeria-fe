'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Bell, ChevronUp, KeyRound, LogOut, Settings } from 'lucide-react';

import { Avatar } from '@/components/atoms/avatar';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { logoutThunk } from '@/store/slices/authSlice';
import { cn } from '@/lib/cn';

import { ChangePasswordDialog } from './ChangePasswordDialog';

/**
 * Profile button pinned at the bottom of the sidebar. Click → drop-up menu
 * with Notifications, Settings, Change password, Logout.
 */
export function UserProfileMenu() {
  const t = useTranslations('app.sidebar');
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  const [open, setOpen] = React.useState(false);
  const [changePwOpen, setChangePwOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await dispatch(logoutThunk())
      .unwrap()
      .catch(() => {});
    router.replace('/sign-in');
  };

  const displayName = user?.display_name || user?.email || t('guest');
  const email = user?.email ?? '';

  return (
    <>
      <div ref={ref} className='relative'>
        <button
          type='button'
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          className='hover:bg-muted flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors'
        >
          <Avatar
            name={typeof displayName === 'string' ? displayName : undefined}
            size='sm'
          />
          <div className='flex min-w-0 flex-1 flex-col'>
            <span className='text-foreground truncate text-sm font-semibold tracking-[-0.02em]'>
              {displayName}
            </span>
            {email && (
              <span className='truncate text-xs text-neutral-500'>{email}</span>
            )}
          </div>
          <ChevronUp
            className={cn(
              'size-4 shrink-0 text-neutral-500 transition-transform',
              !open && 'rotate-180'
            )}
          />
        </button>

        {open && (
          <div
            role='menu'
            className='border-border bg-background absolute right-0 bottom-full left-0 z-30 mb-2 overflow-hidden rounded-lg border shadow-lg'
          >
            <MenuLink
              href='/notification'
              icon={<Bell className='size-4' />}
              label={t('navNotification')}
              onClick={() => setOpen(false)}
            />
            <MenuLink
              href='/setting'
              icon={<Settings className='size-4' />}
              label={t('navSetting')}
              onClick={() => setOpen(false)}
            />
            <MenuButton
              icon={<KeyRound className='size-4' />}
              label={t('changePassword')}
              onClick={() => {
                setOpen(false);
                setChangePwOpen(true);
              }}
            />
            <div className='bg-border h-px' />
            <MenuButton
              icon={<LogOut className='size-4' />}
              label={t('logout')}
              onClick={handleLogout}
              destructive
            />
          </div>
        )}
      </div>

      <ChangePasswordDialog
        open={changePwOpen}
        onOpenChange={setChangePwOpen}
      />
    </>
  );
}

function MenuLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className='text-foreground hover:bg-muted flex items-center gap-2 px-4 py-2.5 text-sm transition-colors'
      role='menuitem'
    >
      {icon}
      {label}
    </Link>
  );
}

function MenuButton({
  icon,
  label,
  onClick,
  destructive,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type='button'
      role='menuitem'
      onClick={onClick}
      className={cn(
        'hover:bg-muted flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors',
        destructive ? 'text-destructive' : 'text-foreground'
      )}
    >
      {icon}
      {label}
    </button>
  );
}
