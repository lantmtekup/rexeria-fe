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
  Lightbulb,
  LogOut,
  Megaphone,
  MousePointerClick,
  Package,
  Settings,
  Sparkles,
  Target,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useLocale, useTranslations } from 'next-intl';

import { LanguageSwitcher } from '@/components/molecules/LanguageSwitcher';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { logoutThunk } from '@/store/slices/authSlice';
import { Locale } from '@/settings/enums';

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
  labelKey: string;
  icon: LucideIcon;
  badge?: number;
  group?: string;
};

// `labelKey` resolves via t('shell.<labelKey>') at render — NAV is module-level
// so it can't call the hook here.
const NAV: NavItem[] = [
  { href: '/portal', labelKey: 'navDashboard', icon: LayoutDashboard },
  {
    href: '/portal/templates',
    labelKey: 'navTemplateLibrary',
    icon: Sparkles,
  },
  // Rexer Product — group hợp nhất 3 mục tăng trưởng có sẵn + Micro site mới.
  {
    href: '/portal/ads',
    labelKey: 'navAds',
    icon: Megaphone,
    group: 'Rexer Product',
  },
  {
    href: '/portal/curate',
    labelKey: 'navCurate',
    icon: MousePointerClick,
    group: 'Rexer Product',
  },
  {
    href: '/portal/landing-pages',
    labelKey: 'navLandingPages',
    icon: LayoutTemplate,
    group: 'Rexer Product',
  },
  {
    href: '/portal/micro-sites',
    labelKey: 'navMicroSite',
    icon: Globe,
    group: 'Rexer Product',
  },
  {
    href: '/portal/insights',
    labelKey: 'navInsights',
    icon: Lightbulb,
    group: 'Rexer Product',
  },
  {
    href: '/portal/marketing',
    labelKey: 'navMarketing',
    icon: Target,
    group: 'Rexer Product',
  },
  {
    href: '/portal/media',
    labelKey: 'navMedia',
    icon: FolderOpen,
    group: 'Assets',
  },
  {
    href: '/portal/products',
    labelKey: 'navProductInfo',
    icon: Package,
    group: 'Assets',
  },
  {
    href: '/portal/blocks',
    labelKey: 'navBlocks',
    icon: Bookmark,
    group: 'Assets',
  },
  { href: '/portal/profile', labelKey: 'navProfile', icon: Settings },
];

export function PortalShell({
  children,
  fullBleed = false,
}: {
  children: React.ReactNode;
  /** Bỏ padding + max-width của main, content fill trắng sát mép (editor). */
  fullBleed?: boolean;
}) {
  return (
    <Suspense
      fallback={<div className='text-content-muted p-8 text-sm'>Loading…</div>}
    >
      <PortalShellInner fullBleed={fullBleed}>{children}</PortalShellInner>
    </Suspense>
  );
}

function PortalShellInner({
  children,
  fullBleed,
}: {
  children: React.ReactNode;
  fullBleed?: boolean;
}) {
  const t = useTranslations('portal');
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
  const locale = useLocale() as Locale;

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
  //
  // PROD: brand/khách chỉ thấy 3 mục đã sẵn sàng cho Phase 1 managed —
  // Landing pages, Media (Assets), Marketing. Các mục còn lại ẩn cho tới khi
  // mở self-serve. Dev (NODE_ENV !== production) vẫn full để code/test. Staff
  // sau hydrate vẫn thấy full ngay cả trên prod.
  // Bật trên prod build, hoặc local set NEXT_PUBLIC_PORTAL_MINIMAL=1 để xem
  // trước chế độ menu rút gọn ngay trên localhost.
  const isProd =
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_PORTAL_MINIMAL === '1';
  const PROD_ALLOWED = new Set([
    '/portal/landing-pages',
    '/portal/media',
    '/portal/marketing',
  ]);
  // PROD: ẩn cho TẤT CẢ (kể cả staff) — portal khách chỉ còn 3 mục Phase 1.
  // Dev vẫn full (staff) / chỉ ẩn template (brand) để còn code/test.
  const navItems = isProd
    ? NAV.filter(n => PROD_ALLOWED.has(n.href))
    : hydrated && isStaffOrAdmin
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
      toast.success(t('shell.logoutSuccess'));
    } catch {
      toast.error(t('shell.logoutError'));
    }
    // Hard nav (KHÔNG router.push): sau khi logout clear cookie
    // `_access_token`, soft navigation của App Router có thể phục vụ /sign-in
    // từ Router Cache đã tính dưới cookie cũ (middleware redirect /sign-in →
    // /portal khi còn auth) → kẹt lại /portal. window.location buộc request
    // mới qua middleware với cookie đã xoá + reset sạch state in-memory.
    window.location.replace('/sign-in');
  };

  return (
    <div className='bg-background text-foreground min-h-screen antialiased'>
      <header className='border-border sticky top-0 z-30 flex items-center justify-between border-b bg-white/95 px-6 py-3 backdrop-blur'>
        <div className='flex items-center gap-3'>
          {/* Client info */}
          <div className='flex items-center gap-2'>
            <div className='flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900 text-white shadow-sm'>
              <Building2 className='size-3.5' />
            </div>
            <div className='leading-tight'>
              <div className='text-3xs text-muted-foreground font-semibold tracking-wider uppercase'>
                {t('shell.clientLabel')}
              </div>
              <div className='text-sm font-semibold tracking-tight'>
                {clientName}
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
                  {t('shell.workspaceLabel')}
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
                    {t('shell.workspacesOf', {
                      count: workspaces.length,
                      client: clientName,
                    })}
                  </div>
                  <div className='max-h-80 overflow-y-auto py-1'>
                    {workspaces.map(ws => {
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
                              <span>
                                {t('shell.memberCount', {
                                  count: ws.member_count,
                                })}
                              </span>
                              <span>·</span>
                              <span>
                                {t('shell.landingCount', {
                                  count: ws.template_count,
                                })}
                              </span>
                              <span>·</span>
                              <span className='font-mono'>{ws.slug}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className='border-border bg-muted/30 border-t px-3 py-2'>
                    <button
                      type='button'
                      onClick={() => {
                        setWsMenuOpen(false);
                        setCreateWsOpen(true);
                      }}
                      className='text-2xs text-content-muted hover:text-foreground w-full text-left font-medium'
                    >
                      {t('shell.createWorkspace')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <LanguageSwitcher
            locale={locale}
            className='border-border rounded-lg border bg-white px-2.5 py-1'
          />
          {/* Notifications */}
          <button className='border-border text-content-muted hover:bg-muted relative flex items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1 text-xs font-medium'>
            <Bell className='size-3.5' />
            {unreadCount > 0 && (
              <span className='text-3xs absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-rose-500 font-mono font-bold text-white ring-2 ring-white'>
                {unreadCount}
              </span>
            )}
          </button>

          {/* User menu — skeleton trước hydration (server có user=null → render
              Sign-in; client có user → render menu): structural mismatch #418.
              Gate qua `hydrated` cho server + first paint khớp nhau. */}
          {!hydrated ? (
            <div className='bg-muted h-8 w-20 animate-pulse rounded-lg' />
          ) : user ? (
            <div className='relative'>
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                className='border-border text-content-muted hover:bg-muted flex items-center gap-2 rounded-lg border bg-white px-2 py-1 text-xs font-medium'
              >
                <div className='text-3xs flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 font-mono font-bold text-white'>
                  {(user.display_name ?? user.email ?? '?')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <span className='hidden max-w-[120px] truncate sm:inline'>
                  {user.display_name ?? user.email}
                </span>
                <ChevronsUpDown className='text-muted-foreground size-3' />
              </button>
              {userMenuOpen && (
                <>
                  <div
                    className='fixed inset-0 z-30'
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className='border-border absolute top-full right-0 z-40 mt-1 w-56 overflow-hidden rounded-xl border bg-white shadow-2xl'>
                    <div className='border-border border-b px-3 py-2'>
                      <div className='truncate text-sm font-semibold'>
                        {user.display_name ?? '—'}
                      </div>
                      <div className='text-3xs text-content-muted truncate font-mono'>
                        {user.email}
                      </div>
                      <div className='text-3xs mt-1 inline-block rounded bg-orange-100 px-1.5 py-0.5 font-mono font-bold text-orange-700'>
                        {user.principal_type ?? 'user'}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className='text-content-muted flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-rose-50 hover:text-rose-700'
                    >
                      <LogOut className='size-3.5' />
                      {t('shell.logout')}
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
              {t('shell.signIn')}
            </Link>
          )}
        </div>
      </header>

      <div className='flex'>
        {/* Side nav */}
        <aside className='border-border sticky top-[57px] hidden h-[calc(100vh-57px)] w-60 shrink-0 overflow-y-auto border-r bg-white px-3 py-4 lg:block'>
          <div className='mb-4 rounded-xl bg-gradient-to-br from-rose-50 to-white p-3'>
            <div className='text-3xs text-content-muted font-semibold tracking-wider uppercase'>
              {t('shell.plan')}
            </div>
            <div className='text-2xs text-content-muted mt-0.5'>
              <span className='font-mono font-semibold text-rose-700'>
                Phase 1 Managed
              </span>
            </div>
            <div className='text-3xs text-content-muted mt-1'>
              {t('shell.membersWorkspaces', {
                members: FAKE_CLIENT.member_count,
                workspaces: workspaces.length,
              })}
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
                    <span className='flex-1'>{t(`shell.${n.labelKey}`)}</span>
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

          {/* Storage — ẩn cho tới khi BE có quota thật (hiện toàn FAKE_CLIENT/
              activeWs mock). Khôi phục bằng cách bỏ comment khối dưới. */}
          {/* <div className='mt-6 rounded-xl border border-border bg-muted p-3'>
            <div className='flex items-center justify-between'>
              <div className='text-3xs font-semibold tracking-wider text-content-muted uppercase'>
                Storage
              </div>
              <div
                className={`flex size-5 items-center justify-center rounded ${activeWs.logo_color} font-mono text-3xs font-bold text-white`}
              >
                {activeWs.logo_initial}
              </div>
            </div>
            <div className='mt-1 text-2xs text-content-muted'>
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
            <div className='mt-1 text-3xs text-muted-foreground'>
              Quota client: {FAKE_CLIENT.storage_used_gb} /{' '}
              {FAKE_CLIENT.storage_quota_gb} GB
            </div>
          </div> */}
        </aside>

        <main
          className={
            fullBleed
              ? 'bg-background w-full'
              : 'mx-auto w-full max-w-5xl px-5 py-8 lg:px-8'
          }
        >
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
