'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboardIcon,
  LayoutTemplateIcon,
  MessageSquareIcon,
  PackageIcon,
  SparklesIcon,
  UsersIcon,
} from 'lucide-react';

import { cn } from '@/lib/cn';

interface Tab {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Match exact (no descendant). For /admin index. */
  exact?: boolean;
}

const TABS: Tab[] = [
  {
    href: '/admin',
    labelKey: 'nav.overview',
    icon: LayoutDashboardIcon,
    exact: true,
  },
  { href: '/admin/products', labelKey: 'nav.products', icon: PackageIcon },
  {
    href: '/admin/templates',
    labelKey: 'nav.templates',
    icon: LayoutTemplateIcon,
  },
  {
    href: '/admin/ai-templates',
    labelKey: 'nav.aiTemplates',
    icon: SparklesIcon,
  },
  { href: '/admin/users', labelKey: 'nav.users', icon: UsersIcon },
  { href: '/admin/ai-usage', labelKey: 'nav.aiUsage', icon: SparklesIcon },
  {
    href: '/admin/feedback',
    labelKey: 'nav.feedback',
    icon: MessageSquareIcon,
  },
];

export function AdminNav() {
  const pathname = usePathname();
  const t = useTranslations('admin');

  return (
    <nav className='border-border flex gap-1 overflow-x-auto border-b px-4'>
      {TABS.map(tab => {
        const Icon = tab.icon;
        const active = tab.exact
          ? pathname === tab.href
          : pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              '-mb-px flex items-center gap-2 border-b-2 px-3 py-3 text-sm whitespace-nowrap transition-colors',
              active
                ? 'border-primary text-primary font-medium'
                : 'text-content-muted hover:text-foreground border-transparent'
            )}
          >
            <Icon className='size-4' />
            {t(tab.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
