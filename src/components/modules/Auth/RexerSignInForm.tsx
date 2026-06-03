'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { Button } from '@/components/atoms/button';
import { SocialLoginButtons } from '@/components/modules/Auth/SocialLoginButtons';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { cn } from '@/lib/cn';
import { roleHomePath } from '@/lib/auth/roleTarget';
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
  const { status, error, user } = useAppSelector(s => s.auth);
  const [showPassword, setShowPassword] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().min(1, tVal('required')),
        password: z.string().min(1, tVal('required')),
      }),
    [tVal]
  );

  // Prefill admin credentials in local dev only — `process.env.NODE_ENV` is
  // statically replaced by Next.js at build time, so this branch gets
  // dead-code-eliminated in the production bundle (QC bug C-1).
  const devDefaults =
    process.env.NODE_ENV !== 'production'
      ? { email: 'admin@rexer.ai', password: 'Admin1234' }
      : { email: '', password: '' };

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: devDefaults,
  });

  useEffect(() => {
    if (status === 'succeeded') {
      // Explicit redirect URL takes priority (used khi middleware redirect về /sign-in)
      const explicit = searchParams.get('redirect');
      if (explicit) {
        router.replace(explicit);
        return;
      }
      // Smart route (§C1): admin → /admin, có brand → /portal, còn lại → /home.
      const role = user?.role ?? user?.principal_type ?? '';
      const scope = user?.brand_id ? 'brand' : 'platform';
      router.replace(roleHomePath(role, scope));
    }
  }, [status, user, router, searchParams]);

  const handleSubmit = form.handleSubmit(async values => {
    await dispatch(
      loginThunk({ email: values.email, password: values.password })
    ).unwrap();
  });

  const errorMessage = useMemo(() => {
    if (!error) return null;
    const lookup = tErrors as (key: string) => string;
    // next-intl returns the namespaced key (e.g. "errors.ERR_FOO") when a key
    // isn't found. Detect that and fall back to a friendly default rather
    // than leaking the raw key to the user.
    const direct = lookup(error);
    if (direct && !direct.startsWith('errors.')) return direct;
    // Try without ERR_ prefix (BE may send code like ERR_UNAUTHORIZED while
    // i18n catalog uses UNAUTHORIZED).
    const stripped = error.replace(/^ERR_/, '');
    if (stripped !== error) {
      const alt = lookup(stripped);
      if (alt && !alt.startsWith('errors.')) return alt;
    }
    return lookup('LOGIN_FAILED');
  }, [error, tErrors]);

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
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete='current-password'
                placeholder={t('passwordPlaceholder')}
                className={cn(
                  'text-foreground placeholder:text-content-muted block w-full px-4 py-4 pr-12 text-sm outline-none focus:bg-neutral-50',
                  form.formState.errors.password && 'bg-danger-bg'
                )}
                aria-invalid={Boolean(form.formState.errors.password)}
                {...form.register('password')}
              />
              <button
                type='button'
                onClick={() => setShowPassword(prev => !prev)}
                className='text-content-muted hover:text-foreground absolute top-1/2 right-4 -translate-y-1/2 transition-colors'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className='size-5' />
                ) : (
                  <Eye className='size-5' />
                )}
              </button>
            </div>
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
