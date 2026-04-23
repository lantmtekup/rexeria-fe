'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { ImageUploadHandle } from '@/components/molecules/ImageUpload';
import ImageUpload from '@/components/molecules/ImageUpload';
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
import { Textarea } from '@/components/atoms/textarea';
import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  SiteSettingsPublicData,
} from '@/types/api';

type FormValues = {
  appName: string;
  description: string;
};

export default function SettingsPage() {
  const t = useTranslations('settings');
  const tVal = useTranslations('validation');
  const tErrors = useTranslations('errors');
  const locale = useLocale();
  const contentLocale = locale === 'en' ? 'en' : 'vi';

  const imageRef = useRef<ImageUploadHandle>(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        appName: z.string().min(1, tVal('required')),
        description: z.string().min(1, tVal('required')),
      }),
    [tVal]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { appName: '', description: '' },
  });

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/site-settings?locale=${contentLocale}`, {
        credentials: 'include',
      });
      const json = (await res.json()) as
        | ApiSuccessResponse<SiteSettingsPublicData>
        | ApiErrorResponse;

      if (!res.ok || json.success !== true) {
        throw new Error(json.success === false ? json.code : 'LOAD_FAILED');
      }

      form.reset({
        appName: json.data.title ?? '',
        description: json.data.description ?? '',
      });
      setLogoUrl(json.data.logoUrl ?? '');
    } catch (e) {
      const code = e instanceof Error ? e.message : 'LOAD_FAILED';
      setLoadError((tErrors as (key: string) => string)(code));
    } finally {
      setLoading(false);
    }
  }, [contentLocale, form, tErrors]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = form.handleSubmit(async values => {
    setSaving(true);
    setSaveError(null);
    try {
      let finalLogo = logoUrl;
      if (imageRef.current) {
        finalLogo = await imageRef.current.upload();
      }

      const res = await fetch('/api/cms/site-settings', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName: values.appName,
          description: values.description,
          logoUrl: finalLogo,
        }),
      });

      const json = (await res.json()) as
        | ApiSuccessResponse<null>
        | ApiErrorResponse;

      if (!res.ok || json.success !== true) {
        throw new Error(json.success === false ? json.code : 'SAVE_FAILED');
      }

      await load();
    } catch (e) {
      const code = e instanceof Error ? e.message : 'SAVE_FAILED';
      setSaveError((tErrors as (key: string) => string)(code));
    } finally {
      setSaving(false);
    }
  });

  if (loading) {
    return (
      <div className='text-muted-foreground p-6 text-sm'>{t('loading')}</div>
    );
  }

  return (
    <div className='mx-auto max-w-lg space-y-6 p-6'>
      <div>
        <h1 className='text-foreground text-xl font-semibold'>
          {t('pageTitle')}
        </h1>
        <p className='text-muted-foreground mt-1 text-sm'>
          {t('pageSubtitle')}
        </p>
      </div>

      {loadError ? (
        <p className='text-destructive text-sm' role='alert'>
          {loadError}
        </p>
      ) : null}

      <Form {...form}>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <FormField
            control={form.control}
            name='appName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('appName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('appNamePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('description')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('descriptionPlaceholder')}
                    rows={4}
                    className='resize-y'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='space-y-2'>
            <span className='text-sm leading-none font-medium'>
              {t('logo')}
            </span>
            <ImageUpload
              ref={imageRef}
              value={logoUrl}
              onChange={setLogoUrl}
              disabled={saving}
              className='h-40'
              imageWidth={160}
              imageHeight={160}
            />
          </div>

          {saveError ? (
            <p className='text-destructive text-sm' role='alert'>
              {saveError}
            </p>
          ) : null}

          <Button type='submit' disabled={saving}>
            {saving ? t('saving') : t('save')}
          </Button>
        </form>
      </Form>
    </div>
  );
}
