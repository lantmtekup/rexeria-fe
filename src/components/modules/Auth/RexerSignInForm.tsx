'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { Button } from '@/components/atoms/button';
import { SocialLoginButtons } from '@/components/modules/Auth/SocialLoginButtons';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { cn } from '@/lib/cn';
import { loginThunk } from '@/store/slices/authSlice';

type FormValues = {
  email: string;
  password: string;
};

export default function RexerSignInForm() {
  const t = useTranslations('auth');
  const tVal = useTranslations('validation');
  const tErrors = useTranslations('errors');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, error } = useAppSelector(s => s.auth);

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().min(1, tVal('required')),
        password: z.string().min(1, tVal('required')),
      }),
    [tVal]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'admin@rexer.ai', password: 'Admin1234' },
  });

  useEffect(() => {
    if (status === 'succeeded') {
      const redirect = searchParams.get('redirect') || '/home';
      router.replace(redirect);
    }
  }, [status, router, searchParams]);

  const handleSubmit = form.handleSubmit(async values => {
    await dispatch(
      loginThunk({ email: values.email, password: values.password })
    ).unwrap();
  });

  const errorMessage =
    error != null && error !== ''
      ? (tErrors as (key: string) => string)(error)
      : null;

  return (
    <div className='flex flex-col gap-8'>
      {/* Form card */}
      <div className='flex flex-col items-center gap-6'>
        <h1 className='text-foreground w-full text-2xl font-semibold tracking-[-0.02em]'>
          {t('loginTitle')}
        </h1>

        <form onSubmit={handleSubmit} className='w-full'>
          {/* Joined input stack — borders share edges like the Figma design */}
          <div className='border-border bg-background overflow-hidden rounded-2xl border'>
            <input
              type='email'
              autoComplete='email'
              placeholder={t('emailPlaceholder')}
              className={cn(
                'text-foreground placeholder:text-content-muted block w-full px-4 py-4 text-sm outline-none focus:bg-neutral-50',
                form.formState.errors.email && 'bg-danger-bg'
              )}
              aria-invalid={Boolean(form.formState.errors.email)}
              {...form.register('email')}
            />
            <div className='bg-border h-px' />
            <input
              type='password'
              autoComplete='current-password'
              placeholder={t('passwordPlaceholder')}
              className={cn(
                'text-foreground placeholder:text-content-muted block w-full px-4 py-4 text-sm outline-none focus:bg-neutral-50',
                form.formState.errors.password && 'bg-danger-bg'
              )}
              aria-invalid={Boolean(form.formState.errors.password)}
              {...form.register('password')}
            />
          </div>

          {(form.formState.errors.email ||
            form.formState.errors.password ||
            errorMessage) && (
            <p className='text-destructive mt-2 text-xs' role='alert'>
              {form.formState.errors.email?.message ||
                form.formState.errors.password?.message ||
                errorMessage}
            </p>
          )}

          <div className='mt-2 flex justify-end'>
            <Link
              href='/forgot-password'
              className='text-content-muted hover:text-foreground text-xs'
            >
              {t.has('forgotPassword')
                ? t('forgotPassword')
                : 'Forgot password?'}
            </Link>
          </div>

          <Button
            type='submit'
            variant='primary'
            size='lg'
            className='mt-4 w-full'
            disabled={status === 'loading'}
          >
            {status === 'loading' ? t('submitLoading') : t('signIn')}
          </Button>
        </form>

        <p className='text-foreground text-center text-sm font-bold tracking-[-0.02em]'>
          {t('createAccountPrompt')}{' '}
          <Link href='/sign-up' className='text-primary hover:underline'>
            {t('register')}
          </Link>
        </p>
      </div>

      {/* Or divider */}
      <div className='flex items-center gap-2'>
        <div className='bg-border h-px flex-1' />
        <span className='text-foreground text-base font-bold tracking-[-0.02em]'>
          {t('or')}
        </span>
        <div className='bg-border h-px flex-1' />
      </div>

      <SocialLoginButtons />
    </div>
  );
}
