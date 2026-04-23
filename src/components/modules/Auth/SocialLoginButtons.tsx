'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/cn';

function SocialButton({
  label,
  icon,
  onClick,
  className,
  isLast,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  isLast?: boolean;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'text-foreground flex w-full cursor-pointer items-center justify-center gap-3 bg-neutral-50 p-5 text-sm font-bold tracking-[-0.02em] transition-colors hover:bg-neutral-100',
        !isLast && 'border-border border-b',
        className
      )}
    >
      <span className='flex-1 text-left'>{label}</span>
      <span className='flex size-6 items-center justify-center'>{icon}</span>
    </button>
  );
}

/** Stacked Facebook / Google / Apple buttons shown under the email form. */
export function SocialLoginButtons() {
  const t = useTranslations('auth');
  return (
    <div className='border-border bg-background overflow-hidden rounded-2xl border'>
      <SocialButton
        label={t('continueFacebook')}
        icon={
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src='/brand/social-facebook.svg'
            alt=''
            className='size-6'
            draggable={false}
          />
        }
      />
      <SocialButton
        label={t('continueGoogle')}
        icon={
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src='/brand/social-google.svg'
            alt=''
            className='size-6'
            draggable={false}
          />
        }
      />
      <SocialButton
        label={t('continueApple')}
        icon={
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src='/brand/social-apple.png'
            alt=''
            className='h-6 w-5 object-contain'
            draggable={false}
          />
        }
        isLast
      />
    </div>
  );
}
