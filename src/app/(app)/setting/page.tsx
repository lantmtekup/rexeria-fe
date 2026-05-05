'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Building2,
  ChevronRight,
  Palette,
  Plug,
  ShieldCheck,
  UserCircle,
} from 'lucide-react';

import { SectionHeader } from '@/components/molecules/SectionHeader';
import { useAuthRole } from '@/hooks/useAuthRole';

interface SettingTile {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  available?: boolean;
  /** When true, only admin/staff see this tile. */
  internalOnly?: boolean;
}

const TILES: SettingTile[] = [
  {
    href: '/setting/clients',
    title: 'Clients & workspaces',
    description:
      'Manage client workspaces, invite team members, share landing reports.',
    icon: Building2,
    available: true,
    internalOnly: true,
  },
  {
    href: '/setting/profile',
    title: 'Profile',
    description: 'Display name, email, password.',
    icon: UserCircle,
    available: true,
  },
  {
    href: '/setting/theme',
    title: 'Theme',
    description: 'Light / dark mode and brand colors.',
    icon: Palette,
    available: true,
  },
  {
    href: '/setting/integrations',
    title: 'Integrations',
    description: 'Connect external services — Google Analytics, webhooks.',
    icon: Plug,
    available: true,
    internalOnly: true,
  },
  {
    href: '/setting/security',
    title: 'Security',
    description: 'Sessions, two-factor, API keys.',
    icon: ShieldCheck,
    available: true,
  },
];

export default function SettingHubPage() {
  const { isClientUser } = useAuthRole();

  const visible = TILES.filter(t => !(isClientUser && t.internalOnly));

  return (
    <div className='mx-auto w-full max-w-[1100px] px-8 py-6'>
      <SectionHeader title='Settings' />
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {visible.map(t => {
          const Icon = t.icon;
          const tile = (
            <div
              className={`border-border bg-background flex items-start gap-4 rounded-xl border p-5 transition-colors ${
                t.available
                  ? 'hover:border-primary cursor-pointer'
                  : 'cursor-not-allowed opacity-60'
              }`}
            >
              <span className='bg-primary/10 text-primary inline-flex size-10 shrink-0 items-center justify-center rounded-lg'>
                <Icon className='size-5' />
              </span>
              <div className='min-w-0 flex-1'>
                <h3 className='text-foreground text-base font-semibold'>
                  {t.title}
                </h3>
                <p className='text-muted-foreground mt-1 text-xs'>
                  {t.description}
                </p>
              </div>
              <ChevronRight className='text-muted-foreground size-4' />
            </div>
          );
          return t.available ? (
            <Link key={t.href} href={t.href}>
              {tile}
            </Link>
          ) : (
            <div key={t.href}>{tile}</div>
          );
        })}
      </div>
    </div>
  );
}
