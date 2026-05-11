'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { Button } from '@/components/atoms/button';
import { SocialLoginButtons } from '@/components/modules/Auth/SocialLoginButtons';
import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import { cn } from '@/lib/cn';

type FormValues = {
  display_name: string;
  email: string;
  password: string;
  confirm_password: string;
  company_name?: string;
};

export default function RexerSignUpForm() {
  const t = useTranslations('auth');
  const tVal = useTranslations('validation');
  const tErrors = useTranslations('errors');
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      z
        .object({
          display_name: z.string().min(1, tVal('required')),
          email: z.string().min(1, tVal('required')).email(tVal('email')),
          password: z.string().min(8, tVal('minLength')),
          confirm_password: z.string().min(1, tVal('required')),
          company_name: z.string().max(200).optional().or(z.literal('')),
        })
        .refine(v => v.password === v.confirm_password, {
          path: ['confirm_password'],
          message: t('passwordMismatch'),
        }),
    [t, tVal]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: '',
      email: '',
      password: '',
      confirm_password: '',
      company_name: '',
    },
  });

  const handleSubmit = form.handleSubmit(async values => {
    setSubmitting(true);
    setApiError(null);
    try {
      await rexerApi.auth.register({
        full_name: values.display_name,
        email: values.email,
        password: values.password,
        ...(values.company_name?.trim()
          ? { company_name: values.company_name.trim() }
          : {}),
      });
      router.replace(
        `/sign-in?registered=1&email=${encodeURIComponent(values.email)}`
      );
    } catch (err) {
      if (err instanceof RxApiError) {
        setApiError(err.code || err.message || 'REGISTER_FAILED');
      } else {
        setApiError('REGISTER_FAILED');
      }
    } finally {
      setSubmitting(false);
    }
  });

  const fieldError =
    form.formState.errors.display_name?.message ||
    form.formState.errors.email?.message ||
    form.formState.errors.password?.message ||
    form.formState.errors.confirm_password?.message ||
    form.formState.errors.company_name?.message;

  const apiMessage = apiError
    ? (() => {
        try {
          return (tErrors as (key: string) => string)(apiError);
        } catch {
          return apiError;
        }
      })()
    : null;

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col items-center gap-6'>
        <h1 className='text-foreground w-full text-2xl font-semibold tracking-[-0.02em]'>
          {t('registerTitle')}
        </h1>

        <form onSubmit={handleSubmit} className='w-full'>
          <div className='border-border bg-background overflow-hidden rounded-2xl border'>
            <input
              type='text'
              autoComplete='name'
              placeholder={t('displayNamePlaceholder')}
              className={cn(
                'text-foreground placeholder:text-content-muted block w-full px-4 py-4 text-sm outline-none focus:bg-neutral-50',
                form.formState.errors.display_name && 'bg-danger-bg'
              )}
              aria-invalid={Boolean(form.formState.errors.display_name)}
              {...form.register('display_name')}
            />
            <div className='bg-border h-px' />
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
              autoComplete='new-password'
              placeholder={t('passwordPlaceholder')}
              className={cn(
                'text-foreground placeholder:text-content-muted block w-full px-4 py-4 text-sm outline-none focus:bg-neutral-50',
                form.formState.errors.password && 'bg-danger-bg'
              )}
              aria-invalid={Boolean(form.formState.errors.password)}
              {...form.register('password')}
            />
            <div className='bg-border h-px' />
            <input
              type='password'
              autoComplete='new-password'
              placeholder={t('confirmPasswordPlaceholder')}
              className={cn(
                'text-foreground placeholder:text-content-muted block w-full px-4 py-4 text-sm outline-none focus:bg-neutral-50',
                form.formState.errors.confirm_password && 'bg-danger-bg'
              )}
              aria-invalid={Boolean(form.formState.errors.confirm_password)}
              {...form.register('confirm_password')}
            />
            <div className='bg-border h-px' />
            <input
              type='text'
              autoComplete='organization'
              placeholder={t('companyNamePlaceholder')}
              className={cn(
                'text-foreground placeholder:text-content-muted block w-full px-4 py-4 text-sm outline-none focus:bg-neutral-50',
                form.formState.errors.company_name && 'bg-danger-bg'
              )}
              aria-invalid={Boolean(form.formState.errors.company_name)}
              {...form.register('company_name')}
            />
          </div>

          {(fieldError || apiMessage) && (
            <p className='text-destructive mt-2 text-xs' role='alert'>
              {fieldError || apiMessage}
            </p>
          )}

          <Button
            type='submit'
            variant='primary'
            size='lg'
            className='mt-6 w-full'
            disabled={submitting}
          >
            {submitting ? t('registerLoading') : t('signUp')}
          </Button>
        </form>

        <p className='text-foreground text-center text-sm font-bold tracking-[-0.02em]'>
          {t('alreadyHaveAccount')}{' '}
          <Link href='/sign-in' className='text-primary hover:underline'>
            {t('login')}
          </Link>
        </p>
      </div>

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
