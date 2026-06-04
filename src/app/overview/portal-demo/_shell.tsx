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
      fallback={<div className='text-content-muted p-8 text-sm'>Loading…</div>}
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
    <div className='bg-muted text-foreground min-h-screen antialiased'>
      {/* Migration banner — tell users this is the sales showcase */}
      <div className='border-b border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-2 text-xs'>
        <div className='flex items-center justify-between gap-2'>
          <span className='flex items-center gap-1.5 text-cyan-800'>
            <span className='text-3xs rounded bg-cyan-600 px-1.5 py-0.5 font-mono font-bold tracking-wider text-white uppercase'>
              Demo
            </span>
            <span>
              Showcase cho Sales. Production cùng UI nhưng kết nối BE thật.
            </span>
          </span>
          <Link
            href='/portal'
            className='text-2xs rounded-md bg-cyan-600 px-2.5 py-0.5 font-bold text-white shadow-sm hover:bg-cyan-700'
          >
            → Mở /portal production
          </Link>
        </div>
      </div>

      {/* Top header */}
      <header className='border-border sticky top-0 z-30 flex items-center justify-between border-b bg-white/95 px-6 py-3 backdrop-blur'>
        <div className='flex items-center gap-3'>
          <Link
            href='/overview'
            className='border-border text-content-muted hover:bg-muted flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium'
          >
            <ArrowLeft className='size-3.5' /> Overview
          </Link>
          <span className='text-muted-foreground'>/</span>

          {/* Client info */}
          <div className='flex items-center gap-2'>
            <div className='flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900 text-white shadow-sm'>
              <Building2 className='size-3.5' />
            </div>
            <div className='leading-tight'>
              <div className='text-3xs text-muted-foreground font-semibold tracking-wider uppercase'>
                CLIENT
              </div>
              <div className='text-sm font-semibold tracking-tight'>
                {FAKE_CLIENT.name}
              </div>
            </div>
          </div>

          <span className='text-muted-foreground'>/</span>

          {/* Workspace switcher */}
          <div className='relative'>
            <button
              onClick={() => setWsMenuOpen(o => !o)}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-1 text-sm transition-all ${
                wsMenuOpen
                  ? 'border-border bg-muted'
                  : 'border-border hover:bg-muted bg-white'
              }`}
            >
              <div
                className={`flex size-7 items-center justify-center rounded-md ${activeWs.logo_color} text-2xs font-mono font-bold text-white shadow-sm`}
              >
                {activeWs.logo_initial}
              </div>
              <div className='text-left leading-tight'>
                <div className='text-3xs text-muted-foreground font-semibold tracking-wider uppercase'>
                  Workspace
                </div>
                <div className='text-sm font-semibold tracking-tight'>
                  {activeWs.name}
                </div>
              </div>
              <ChevronsUpDown className='text-muted-foreground size-3.5' />
            </button>

            {wsMenuOpen && (
              <>
                <div
                  className='fixed inset-0 z-30'
                  onClick={() => setWsMenuOpen(false)}
                />
                <div className='border-border absolute top-full left-0 z-40 mt-1 w-80 overflow-hidden rounded-xl border bg-white shadow-2xl'>
                  <div className='text-3xs border-border bg-muted/50 text-content-muted border-b px-3 py-2 font-semibold tracking-wider uppercase'>
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
                            isActive ? 'bg-muted' : 'hover:bg-muted'
                          }`}
                        >
                          <div
                            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${ws.logo_color} font-mono text-xs font-bold text-white shadow-sm`}
                          >
                            {ws.logo_initial}
                          </div>
                          <div className='min-w-0 flex-1'>
                            <div className='flex items-center gap-1.5'>
                              <span className='text-sm font-semibold'>
                                {ws.name}
                              </span>
                              {isActive && (
                                <Check className='size-3.5 text-emerald-500' />
                              )}
                            </div>
                            <div className='text-3xs text-content-muted truncate'>
                              {ws.description}
                            </div>
                            <div className='text-3xs text-muted-foreground mt-0.5 flex items-center gap-2'>
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
                  <div className='border-border bg-muted/30 border-t px-3 py-2'>
                    <button className='text-2xs text-content-muted hover:text-foreground w-full text-left font-medium'>
                      + Tạo workspace mới
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <button className='border-border text-content-muted hover:bg-muted relative flex items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1 text-xs font-medium'>
            <Bell className='size-3.5' />
            {FAKE_STATS.unread_notifications > 0 && (
              <span className='text-3xs absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 font-mono font-bold text-white ring-2 ring-white'>
                {FAKE_STATS.unread_notifications}
              </span>
            )}
          </button>
          <span className='text-3xs rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 font-bold tracking-wider text-amber-700 uppercase'>
            UI Demo · Fake data
          </span>
        </div>
      </header>

      <div className='flex'>
        {/* Side nav */}
        <aside className='border-border sticky top-[57px] hidden h-[calc(100vh-57px)] w-60 shrink-0 overflow-y-auto border-r bg-white px-3 py-4 lg:block'>
          <div className='mb-4 rounded-xl bg-gradient-to-br from-rose-50 to-white p-3'>
            <div className='text-3xs text-content-muted font-semibold tracking-wider uppercase'>
              Plan
            </div>
            <div className='text-2xs text-content-muted mt-0.5'>
              <span className='font-mono font-semibold text-rose-700'>
                Phase 1 Managed
              </span>
            </div>
            <div className='text-3xs text-content-muted mt-1'>
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
                    <div className='text-3xs text-muted-foreground mt-3 mb-1 px-2.5 font-bold tracking-wider uppercase'>
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
                        : 'text-content-muted hover:bg-muted'
                    }`}
                  >
                    <Icon
                      className={`size-4 ${isActive ? 'text-white' : 'text-content-muted'}`}
                    />
                    <span className='flex-1'>{n.label}</span>
                    {n.badge !== undefined && n.badge > 0 && (
                      <span
                        className={`text-3xs rounded-full px-1.5 py-0.5 font-mono font-semibold ${
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
          <div className='border-border bg-muted mt-6 rounded-xl border p-3'>
            <div className='flex items-center justify-between'>
              <div className='text-3xs text-content-muted font-semibold tracking-wider uppercase'>
                Storage
              </div>
              <div
                className={`flex size-5 items-center justify-center rounded ${activeWs.logo_color} text-3xs font-mono font-bold text-white`}
              >
                {activeWs.logo_initial}
              </div>
            </div>
            <div className='text-2xs text-content-muted mt-1'>
              <span className='font-mono font-bold'>
                {activeWs.storage_used_gb} GB
              </span>{' '}
              <span className='text-muted-foreground'>trong workspace này</span>
            </div>
            <div className='mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200'>
              <div
                className='h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500'
                style={{
                  width: `${(activeWs.storage_used_gb / FAKE_CLIENT.storage_quota_gb) * 100}%`,
                }}
              />
            </div>
            <div className='text-3xs text-muted-foreground mt-1'>
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
