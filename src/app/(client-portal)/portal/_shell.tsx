'use client';

import {
  Bell,
  Bookmark,
  Building2,
  Check,
  ChevronsUpDown,
  FolderOpen,
  Globe,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Megaphone,
  MessageSquare,
  MousePointerClick,
  Package,
  Settings,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { logoutThunk } from '@/store/slices/authSlice';

import { CreateWorkspaceDialog } from './_CreateWorkspaceDialog';
import { usePortalData } from '../_PortalDataProvider';

import {
  DEFAULT_WORKSPACE_ID,
  FAKE_CLIENT,
  FAKE_STATS,
  FAKE_WORKSPACES,
  type Workspace,
} from './_data';
import { loadUnreadNotificationCount, switchWorkspaceRemote } from './_remote';
import { withWorkspace } from './_workspace';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  group?: string;
};

const NAV: NavItem[] = [
  { href: '/portal', label: 'Dashboard', icon: LayoutDashboard },
  {
    href: '/portal/templates',
    label: 'Template library',
    icon: Sparkles,
  },
  // Rexer Product — group hợp nhất 3 mục tăng trưởng có sẵn + Micro site mới.
  {
    href: '/portal/ads',
    label: 'Quảng cáo',
    icon: Megaphone,
    group: 'Rexer Product',
  },
  {
    href: '/portal/curate',
    label: 'Curate',
    icon: MousePointerClick,
    group: 'Rexer Product',
  },
  {
    href: '/portal/landing-pages',
    label: 'Landing pages',
    icon: LayoutTemplate,
    group: 'Rexer Product',
  },
  {
    href: '/portal/micro-sites',
    label: 'Micro site',
    icon: Globe,
    group: 'Rexer Product',
  },
  { href: '/portal/media', label: 'Media', icon: FolderOpen, group: 'Assets' },
  {
    href: '/portal/products',
    label: 'Product Info',
    icon: Package,
    group: 'Assets',
  },
  {
    href: '/portal/blocks',
    label: 'Blocks',
    icon: Bookmark,
    group: 'Assets',
  },
  {
    href: '/portal/comments',
    label: 'Comments',
    icon: MessageSquare,
    badge: FAKE_STATS.open_comments,
  },
  { href: '/portal/profile', label: 'Profile', icon: Settings },
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
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user);
  // Workspaces live in the route-group layout (PortalDataProvider). We
  // consume + refresh from there so every portal page sees the same
  // single source of truth — fixes the chip getting stuck on the FAKE
  // first workspace when the shell owned its own state.
  const { workspaces, refreshWorkspaces } = usePortalData();
  const [wsMenuOpen, setWsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [createWsOpen, setCreateWsOpen] = useState(false);

  const wsId =
    searchParams?.get('ws') || workspaces[0]?.id || DEFAULT_WORKSPACE_ID;
  const activeWs =
    workspaces.find(w => w.id === wsId) ?? workspaces[0] ?? FAKE_WORKSPACES[0];
  const [unreadCount, setUnreadCount] = useState<number>(
    FAKE_STATS.unread_notifications
  );
  // `user` (Redux auth) rỗng lúc SSR nhưng có sẵn ở first client render →
  // brand name render khác nhau → hydration mismatch (React #418). Gate qua
  // `hydrated` để SSR + first client paint khớp, chỉ hiện brand thật sau mount.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    let mounted = true;
    loadUnreadNotificationCount().then(r => {
      if (mounted && r.source === 'live') setUnreadCount(r.data);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Pre-hydration trả '' (server cũng có user=null → khớp); sau mount mới hiện
  // brand thật. Tránh nháy nhầm tên placeholder, hết #418.
  const clientName = hydrated ? (user?.brand_name ?? FAKE_CLIENT.name) : '';

  // Template library is a staff/admin surface (curate templates for brands).
  // Brand accounts don't manage it → hide for them. Theo mô hình role 4 tầng
  // của BE (be-response §C1): `users.role` KHÔNG phân biệt platform-staff vs
  // brand user (lantm có users.role='staff' nhưng là brand user). Phân biệt
  // bằng SỰ HIỆN DIỆN của brand: user gắn brand ⇒ brand user, ẩn library.
  const role = user?.role ?? user?.principal_type ?? '';
  const isStaffOrAdmin =
    !user?.brand_id && (role === 'staff' || role === 'admin');
  // Pre-hydration luôn filter (giống server: user=null → không staff) để SSR
  // và first client paint khớp; sau mount mới mở full NAV cho staff. Tránh
  // lệch số nav item → #418.
  const navItems =
    hydrated && isStaffOrAdmin
      ? NAV
      : NAV.filter(n => n.href !== '/portal/templates');

  const switchWorkspace = (ws: Workspace) => {
    setWsMenuOpen(false);
    // Fire-and-forget: BE call updates the server-side active workspace,
    // FE keeps URL `?ws=<id>` as the source of truth for routing.
    void switchWorkspaceRemote(ws.id);
    const path = pathname ?? '/portal';
    router.push(`${path}?ws=${ws.id}`);
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    try {
      await dispatch(logoutThunk()).unwrap();
      toast.success('Đã đăng xuất');
      router.push('/sign-in');
    } catch {
      toast.error('Đăng xuất thất bại');
    }
  };

  return (
    <div className='min-h-screen bg-zinc-50 text-zinc-900 antialiased'>
      <header className='sticky top-0 z-30 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-6 py-3 backdrop-blur'>
        <div className='flex items-center gap-3'>
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
                {clientName}
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
                    {workspaces.length} workspace của {clientName}
                  </div>
                  <div className='max-h-80 overflow-y-auto py-1'>
                    {workspaces.map(ws => {
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
                              <span>{ws.template_count} landing</span>
                              <span>·</span>
                              <span className='font-mono'>{ws.slug}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className='border-t border-zinc-100 bg-zinc-50/30 px-3 py-2'>
                    <button
                      type='button'
                      onClick={() => {
                        setWsMenuOpen(false);
                        setCreateWsOpen(true);
                      }}
                      className='w-full text-left text-[11px] font-medium text-zinc-600 hover:text-zinc-900'
                    >
                      + Tạo workspace mới
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {/* Notifications */}
          <button className='relative flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100'>
            <Bell className='size-3.5' />
            {unreadCount > 0 && (
              <span className='absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 font-mono text-[9px] font-bold text-white ring-2 ring-white'>
                {unreadCount}
              </span>
            )}
          </button>

          {/* User menu — skeleton trước hydration (server có user=null → render
              Sign-in; client có user → render menu): structural mismatch #418.
              Gate qua `hydrated` cho server + first paint khớp nhau. */}
          {!hydrated ? (
            <div className='h-8 w-20 animate-pulse rounded-lg bg-zinc-100' />
          ) : user ? (
            <div className='relative'>
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                className='flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100'
              >
                <div className='flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 font-mono text-[10px] font-bold text-white'>
                  {(user.display_name ?? user.email ?? '?')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <span className='hidden max-w-[120px] truncate sm:inline'>
                  {user.display_name ?? user.email}
                </span>
                <ChevronsUpDown className='size-3 text-zinc-400' />
              </button>
              {userMenuOpen && (
                <>
                  <div
                    className='fixed inset-0 z-30'
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className='absolute top-full right-0 z-40 mt-1 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl'>
                    <div className='border-b border-zinc-100 px-3 py-2'>
                      <div className='truncate text-[13px] font-semibold'>
                        {user.display_name ?? '—'}
                      </div>
                      <div className='truncate font-mono text-[10.5px] text-zinc-500'>
                        {user.email}
                      </div>
                      <div className='mt-1 inline-block rounded bg-orange-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-orange-700'>
                        {user.principal_type ?? 'user'}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className='flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-zinc-700 hover:bg-rose-50 hover:text-rose-700'
                    >
                      <LogOut className='size-3.5' />
                      Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href='/sign-in'
              className='rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700'
            >
              Đăng nhập
            </Link>
          )}
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
              {FAKE_CLIENT.member_count} thành viên · {workspaces.length}{' '}
              workspace
            </div>
          </div>

          <nav className='space-y-0.5'>
            {navItems.map((n, i) => {
              const isActive =
                n.href === '/portal'
                  ? pathname === n.href
                  : pathname?.startsWith(n.href);
              const Icon = n.icon;
              const showGroupLabel =
                n.group && (i === 0 || navItems[i - 1].group !== n.group);
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

          {/* Storage — ẩn cho tới khi BE có quota thật (hiện toàn FAKE_CLIENT/
              activeWs mock). Khôi phục bằng cách bỏ comment khối dưới. */}
          {/* <div className='mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-3'>
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
          </div> */}
        </aside>

        <main className='mx-auto w-full max-w-5xl px-5 py-8 lg:px-8'>
          {children}
        </main>
      </div>

      <CreateWorkspaceDialog
        open={createWsOpen}
        clientId={user?.brand_id ?? null}
        onClose={() => setCreateWsOpen(false)}
        onCreated={async ws => {
          // Pull the freshest list from BE + immediately switch to the new
          // workspace so the user sees their selection take effect.
          await refreshWorkspaces();
          const path = pathname ?? '/portal';
          router.push(`${path}?ws=${ws.id}`);
        }}
      />
    </div>
  );
}
