'use client';

import {
  ArrowLeft,
  Bell,
  Building2,
  Check,
  ChevronsUpDown,
  FolderOpen,
  LayoutDashboard,
  LayoutTemplate,
  Megaphone,
  MessageSquare,
  MousePointerClick,
  Package,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';

import {
  FAKE_CLIENT,
  FAKE_STATS,
  FAKE_WORKSPACES,
  type Workspace,
} from './_data';
import { useActiveWorkspace, withWorkspace } from './_workspace';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  group?: string;
};

const NAV: NavItem[] = [
  { href: '/overview/portal-demo', label: 'Dashboard', icon: LayoutDashboard },
  {
    href: '/overview/portal-demo/templates',
    label: 'Landing pages',
    icon: LayoutTemplate,
  },
  {
    href: '/overview/portal-demo/ads',
    label: 'Quảng cáo',
    icon: Megaphone,
    group: 'Engage',
  },
  {
    href: '/overview/portal-demo/curate',
    label: 'Curate',
    icon: MousePointerClick,
    group: 'Engage',
  },
  {
    href: '/overview/portal-demo/media',
    label: 'Media',
    icon: FolderOpen,
    group: 'Assets',
  },
  {
    href: '/overview/portal-demo/products',
    label: 'Product Info',
    icon: Package,
    group: 'Assets',
  },
  {
    href: '/overview/portal-demo/comments',
    label: 'Comments',
    icon: MessageSquare,
    badge: FAKE_STATS.open_comments,
  },
  { href: '/overview/portal-demo/profile', label: 'Profile', icon: Settings },
];

export function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={<div className='p-8 text-sm text-zinc-500'>Loading…</div>}
    >
      <PortalShellInner>{children}</PortalShellInner>
    </Suspense>
  );
}

function PortalShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const activeWs = useActiveWorkspace();
  const [wsMenuOpen, setWsMenuOpen] = useState(false);

  const switchWorkspace = (ws: Workspace) => {
    setWsMenuOpen(false);
    const path = pathname ?? '/overview/portal-demo';
    router.push(`${path}?ws=${ws.id}`);
  };

  return (
    <div className='min-h-screen bg-zinc-50 text-zinc-900 antialiased'>
      {/* Top header */}
      <header className='sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-6 py-3 backdrop-blur'>
        <div className='flex items-center gap-3'>
          <Link
            href='/overview'
            className='flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100'
          >
            <ArrowLeft className='size-3.5' /> Overview
          </Link>
          <span className='text-zinc-300'>/</span>

          {/* Client info */}
          <div className='flex items-center gap-2'>
            <div className='flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900 text-white shadow-sm'>
              <Building2 className='size-3.5' />
            </div>
            <div className='leading-tight'>
              <div className='text-[10px] font-semibold tracking-wider text-zinc-400 uppercase'>
                CLIENT
              </div>
              <div className='text-sm font-semibold tracking-tight'>
                {FAKE_CLIENT.name}
              </div>
            </div>
          </div>

          <span className='text-zinc-300'>/</span>

          {/* Workspace switcher */}
          <div className='relative'>
            <button
              onClick={() => setWsMenuOpen(o => !o)}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-1 text-sm transition-all ${
                wsMenuOpen
                  ? 'border-zinc-300 bg-zinc-50'
                  : 'border-zinc-200 bg-white hover:bg-zinc-50'
              }`}
            >
              <div
                className={`flex size-7 items-center justify-center rounded-md ${activeWs.logo_color} font-mono text-[11px] font-bold text-white shadow-sm`}
              >
                {activeWs.logo_initial}
              </div>
              <div className='text-left leading-tight'>
                <div className='text-[10px] font-semibold tracking-wider text-zinc-400 uppercase'>
                  Workspace
                </div>
                <div className='text-sm font-semibold tracking-tight'>
                  {activeWs.name}
                </div>
              </div>
              <ChevronsUpDown className='size-3.5 text-zinc-400' />
            </button>

            {wsMenuOpen && (
              <>
                <div
                  className='fixed inset-0 z-30'
                  onClick={() => setWsMenuOpen(false)}
                />
                <div className='absolute top-full left-0 z-40 mt-1 w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl'>
                  <div className='border-b border-zinc-100 bg-zinc-50/50 px-3 py-2 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase'>
                    {FAKE_WORKSPACES.length} workspace của {FAKE_CLIENT.name}
                  </div>
                  <div className='max-h-80 overflow-y-auto py-1'>
                    {FAKE_WORKSPACES.map(ws => {
                      const isActive = ws.id === activeWs.id;
                      return (
                        <button
                          key={ws.id}
                          onClick={() => switchWorkspace(ws)}
                          className={`flex w-full items-start gap-2.5 px-3 py-2 text-left transition-colors ${
                            isActive ? 'bg-zinc-50' : 'hover:bg-zinc-50'
                          }`}
                        >
                          <div
                            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${ws.logo_color} font-mono text-[12px] font-bold text-white shadow-sm`}
                          >
                            {ws.logo_initial}
                          </div>
                          <div className='min-w-0 flex-1'>
                            <div className='flex items-center gap-1.5'>
                              <span className='text-[13px] font-semibold'>
                                {ws.name}
                              </span>
                              {isActive && (
                                <Check className='size-3.5 text-emerald-500' />
                              )}
                            </div>
                            <div className='truncate text-[10.5px] text-zinc-500'>
                              {ws.description}
                            </div>
                            <div className='mt-0.5 flex items-center gap-2 text-[9.5px] text-zinc-400'>
                              <span>{ws.member_count} member</span>
                              <span>·</span>
                              <span>{ws.template_count} template</span>
                              <span>·</span>
                              <span className='font-mono'>{ws.slug}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className='border-t border-zinc-100 bg-zinc-50/30 px-3 py-2'>
                    <button className='w-full text-left text-[11px] font-medium text-zinc-600 hover:text-zinc-900'>
                      + Tạo workspace mới
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <button className='relative flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100'>
            <Bell className='size-3.5' />
            {FAKE_STATS.unread_notifications > 0 && (
              <span className='absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 font-mono text-[9px] font-bold text-white ring-2 ring-white'>
                {FAKE_STATS.unread_notifications}
              </span>
            )}
          </button>
          <span className='rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-700 uppercase'>
            UI Demo · Fake data
          </span>
        </div>
      </header>

      <div className='flex'>
        {/* Side nav */}
        <aside className='sticky top-[57px] hidden h-[calc(100vh-57px)] w-60 shrink-0 overflow-y-auto border-r border-zinc-200 bg-white px-3 py-4 lg:block'>
          <div className='mb-4 rounded-xl bg-gradient-to-br from-rose-50 to-white p-3'>
            <div className='text-[10px] font-semibold tracking-wider text-zinc-500 uppercase'>
              Plan
            </div>
            <div className='mt-0.5 text-[11px] text-zinc-600'>
              <span className='font-mono font-semibold text-rose-700'>
                Phase 1 Managed
              </span>
            </div>
            <div className='mt-1 text-[10px] text-zinc-500'>
              {FAKE_CLIENT.member_count} thành viên · {FAKE_WORKSPACES.length}{' '}
              workspace
            </div>
          </div>

          <nav className='space-y-0.5'>
            {NAV.map((n, i) => {
              const isActive =
                n.href === '/overview/portal-demo'
                  ? pathname === n.href
                  : pathname?.startsWith(n.href);
              const Icon = n.icon;
              const showGroupLabel =
                n.group && (i === 0 || NAV[i - 1].group !== n.group);
              const linkHref = withWorkspace(n.href, activeWs.id);
              return (
                <div key={n.href}>
                  {showGroupLabel && (
                    <div className='mt-3 mb-1 px-2.5 text-[9px] font-bold tracking-wider text-zinc-400 uppercase'>
                      {n.group}
                    </div>
                  )}
                  <Link
                    href={linkHref}
                    className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all ${
                      n.group ? 'ml-2' : ''
                    } ${
                      isActive
                        ? 'bg-zinc-900 text-white shadow-sm'
                        : 'text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <Icon
                      className={`size-4 ${isActive ? 'text-white' : 'text-zinc-500'}`}
                    />
                    <span className='flex-1'>{n.label}</span>
                    {n.badge !== undefined && n.badge > 0 && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {n.badge}
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Workspace storage */}
          <div className='mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-3'>
            <div className='flex items-center justify-between'>
              <div className='text-[10px] font-semibold tracking-wider text-zinc-500 uppercase'>
                Storage
              </div>
              <div
                className={`flex size-5 items-center justify-center rounded ${activeWs.logo_color} font-mono text-[9px] font-bold text-white`}
              >
                {activeWs.logo_initial}
              </div>
            </div>
            <div className='mt-1 text-[11px] text-zinc-700'>
              <span className='font-mono font-bold'>
                {activeWs.storage_used_gb} GB
              </span>{' '}
              <span className='text-zinc-400'>trong workspace này</span>
            </div>
            <div className='mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200'>
              <div
                className='h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500'
                style={{
                  width: `${(activeWs.storage_used_gb / FAKE_CLIENT.storage_quota_gb) * 100}%`,
                }}
              />
            </div>
            <div className='mt-1 text-[9.5px] text-zinc-400'>
              Quota client: {FAKE_CLIENT.storage_used_gb} /{' '}
              {FAKE_CLIENT.storage_quota_gb} GB
            </div>
          </div>
        </aside>

        <main className='mx-auto w-full max-w-5xl px-5 py-8 lg:px-8'>
          {children}
        </main>
      </div>
    </div>
  );
}
