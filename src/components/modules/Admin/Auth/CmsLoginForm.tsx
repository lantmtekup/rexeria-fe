'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/atoms/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/atoms/form';
import { Input } from '@/components/atoms/input';
import { LanguageSwitcher } from '@/components/molecules/LanguageSwitcher';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { Locale } from '@/settings/enums';
import { loginThunk } from '@/store/slices/authSlice';

type FormValues = {
  username: string;
  password: string;
};

export default function CmsLoginForm() {
  const t = useTranslations('auth');
  const tVal = useTranslations('validation');
  const tErrors = useTranslations('errors');
  const locale = useLocale();
  const localeEnum = locale === 'en' ? Locale.EN : Locale.VI;
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, error } = useAppSelector(s => s.auth);

  const schema = useMemo(
    () =>
      z.object({
        username: z.string().min(1, tVal('required')),
        password: z.string().min(1, tVal('required')),
      }),
    [tVal]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  });

  useEffect(() => {
    if (status === 'succeeded') {
      const redirect = searchParams.get('redirect') || '/cms';
      router.replace(redirect);
    }
  }, [status, router, searchParams]);

  const handleSubmit = form.handleSubmit(async values => {
    // Legacy CMS form uses `username` input, backend expects `email`.
    await dispatch(
      loginThunk({ email: values.username, password: values.password })
    ).unwrap();
  });

  const errorMessage =
    error != null && error !== ''
      ? // Dynamic API error codes map to `errors.*` keys
        (tErrors as (key: string) => string)(error)
      : null;

  return (
    <div className='mx-auto w-full max-w-sm space-y-6 p-6'>
      <div className='flex justify-end'>
        <LanguageSwitcher locale={localeEnum} variant='default' />
      </div>
      <div>
        <h1 className='text-foreground text-2xl font-semibold tracking-tight'>
          {t('loginTitle')}
        </h1>
        <p className='text-muted-foreground mt-1 text-sm'>
          {t('loginSubtitle')}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('username')}</FormLabel>
                <FormControl>
                  <Input
                    autoComplete='username'
                    placeholder={t('usernamePlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('password')}</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    autoComplete='current-password'
                    placeholder={t('passwordPlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {errorMessage ? (
            <p className='text-destructive text-sm' role='alert'>
              {errorMessage}
            </p>
          ) : null}

          <Button
            type='submit'
            className='w-full'
            disabled={status === 'loading'}
          >
            {status === 'loading' ? t('submitLoading') : t('submit')}
          </Button>
        </form>
      </Form>
    </div>
  );
}
