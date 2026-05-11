'use client';

import * as React from 'react';
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MessageSquareIcon } from 'lucide-react';

import { cn } from '@/lib/cn';
import type { RootState } from '@/store';
import { FeedbackDialog } from './FeedbackDialog';

const ALPHA = process.env.NEXT_PUBLIC_ALPHA === '1';

/**
 * Floating button shown to authenticated users in Alpha. Hidden on:
 *   - public canvas viewer (`/p/*`)
 *   - auth pages (`/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`)
 *   - non-Alpha builds (`NEXT_PUBLIC_ALPHA !== '1'`)
 */
export function FeedbackFab() {
  const pathname = usePathname();
  const user = useSelector((s: RootState) => s.auth.user);
  const t = useTranslations('feedback');
  const [open, setOpen] = React.useState(false);

  if (!ALPHA) return null;
  if (!user) return null;
  if (pathname?.startsWith('/p/')) return null;
  if (
    pathname === '/sign-in' ||
    pathname === '/sign-up' ||
    pathname?.startsWith('/sign-in/') ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password'
  ) {
    return null;
  }

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        aria-label={t('openButton')}
        className={cn(
          'bg-primary text-primary-foreground fixed right-5 bottom-5 z-40 flex h-12 items-center gap-2 rounded-full px-4 shadow-lg transition hover:opacity-90'
        )}
      >
        <MessageSquareIcon className='size-4' />
        <span className='text-sm font-semibold'>{t('openButton')}</span>
      </button>
      <FeedbackDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
