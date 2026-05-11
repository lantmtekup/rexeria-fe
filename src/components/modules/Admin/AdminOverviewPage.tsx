'use client';

import * as React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  ArrowRightIcon,
  LayoutTemplateIcon,
  MessageSquareIcon,
  PackageIcon,
  SparklesIcon,
  UsersIcon,
} from 'lucide-react';

import { rexerApi } from '@/services/rexer/endpoints';
import { cn } from '@/lib/cn';

interface Stat {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  fetcher: () => Promise<number>;
  accent: string;
}

const STATS: Stat[] = [
  {
    href: '/admin/products',
    labelKey: 'overview.products',
    icon: PackageIcon,
    accent: 'bg-blue-50 text-blue-700',
    fetcher: async () =>
      (await rexerApi.products.list({ limit: 1 })).total ?? 0,
  },
  {
    href: '/admin/templates',
    labelKey: 'overview.templates',
    icon: LayoutTemplateIcon,
    accent: 'bg-purple-50 text-purple-700',
    fetcher: async () => {
      const r = await rexerApi.templates.list();
      return Array.isArray(r.items) ? r.items.length : 0;
    },
  },
  {
    href: '/admin/users',
    labelKey: 'overview.users',
    icon: UsersIcon,
    accent: 'bg-emerald-50 text-emerald-700',
    fetcher: async () => {
      const r = await rexerApi.clients.list();
      return Array.isArray(r.items) ? r.items.length : 0;
    },
  },
  {
    href: '/admin/ai-usage',
    labelKey: 'overview.aiUsage',
    icon: SparklesIcon,
    accent: 'bg-rose-50 text-rose-700',
    fetcher: async () => {
      const r = await rexerApi.adminAiUsage.globalSummary({ group_by: 'day' });
      return r.summary.total_requests ?? 0;
    },
  },
  {
    href: '/admin/feedback',
    labelKey: 'overview.feedback',
    icon: MessageSquareIcon,
    accent: 'bg-amber-50 text-amber-700',
    fetcher: async () =>
      (await rexerApi.adminFeedback.list({ limit: 1 })).total ?? 0,
  },
];

export function AdminOverviewPage() {
  const t = useTranslations('admin');
  const [counts, setCounts] = React.useState<(number | null)[]>(
    STATS.map(() => null)
  );

  React.useEffect(() => {
    let cancelled = false;
    Promise.all(
      STATS.map(async s => {
        try {
          return await s.fetcher();
        } catch {
          return -1;
        }
      })
    ).then(values => {
      if (!cancelled) setCounts(values);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className='flex flex-col gap-6 p-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>
          {t('overview.title')}
        </h1>
        <p className='text-content-muted text-sm'>{t('overview.subtitle')}</p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {STATS.map((s, i) => {
          const Icon = s.icon;
          const value = counts[i];
          return (
            <Link
              key={s.href}
              href={s.href}
              className='border-border hover:border-primary group flex flex-col gap-3 rounded-lg border bg-white p-4 transition-colors'
            >
              <div className='flex items-center justify-between'>
                <div
                  className={cn(
                    'flex size-9 items-center justify-center rounded-md',
                    s.accent
                  )}
                >
                  <Icon className='size-5' />
                </div>
                <ArrowRightIcon className='text-content-muted size-4 transition-transform group-hover:translate-x-0.5' />
              </div>
              <div className='flex items-baseline gap-2'>
                <span className='text-3xl font-semibold tracking-tight'>
                  {value === null ? '…' : value < 0 ? '—' : value}
                </span>
              </div>
              <span className='text-content-muted text-sm'>
                {t(s.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>

      <div className='border-border rounded-lg border bg-white p-4'>
        <h2 className='text-sm font-semibold'>{t('overview.quickActions')}</h2>
        <div className='mt-3 flex flex-wrap gap-2'>
          <QuickLink
            href='/admin/products'
            label={t('overview.manageProducts')}
          />
          <QuickLink
            href='/admin/templates'
            label={t('overview.manageTemplates')}
          />
          <QuickLink href='/admin/users' label={t('overview.manageUsers')} />
          <QuickLink
            href='/admin/ai-usage'
            label={t('overview.manageAiUsage')}
          />
          <QuickLink
            href='/admin/feedback'
            label={t('overview.manageFeedback')}
          />
        </div>
      </div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className='border-border hover:bg-muted rounded-md border px-3 py-1.5 text-sm transition-colors'
    >
      {label}
    </Link>
  );
}
