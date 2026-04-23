'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/cn';

export interface SidebarItemProps {
  href: string;
  label: React.ReactNode;
  icon: LucideIcon;
  /** when true, uses exact match; otherwise matches /href or /href/* */
  exact?: boolean;
  className?: string;
}

/**
 * Sidebar nav link. Active state derived from pathname — active items render
 * icon + label in foreground colour with bold weight; idle items are muted.
 */
function SidebarItem({
  href,
  label,
  icon: Icon,
  exact = false,
  className,
}: SidebarItemProps) {
  const rawPath = usePathname() ?? '/';
  // strip locale prefix if any, matching how CMSLayout does it
  const pathname = rawPath.replace(/^\/[a-z]{2}(?=\/|$)/, '') || '/';

  const active = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-2 border-y px-5 py-4 text-sm font-bold tracking-[-0.02em] transition-colors',
        active
          ? 'border-border text-foreground'
          : 'text-content-muted hover:text-foreground border-transparent',
        className
      )}
    >
      <Icon className='size-5 shrink-0' strokeWidth={active ? 2.2 : 1.8} />
      <span className='flex-1 leading-4'>{label}</span>
    </Link>
  );
}

export { SidebarItem };
