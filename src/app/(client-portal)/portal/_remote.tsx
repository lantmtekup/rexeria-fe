'use client';

/**
 * Hybrid loaders for portal-demo: try real BE → fallback to fake data.
 * Pattern: every loader returns `{ data, source: 'live' | 'fake', error }`.
 */

import { rexerApi } from '@/services/rexer/endpoints';
import type {
  CreateProductRequest,
  MediaAsset,
  Product as BEProduct,
  Workspace as BEWorkspace,
  Notification as BENotification,
  ActivityItem as BEActivityItem,
  MediaFolder as BEMediaFolder,
} from '@/services/rexer/types';

import {
  FAKE_ACTIVITY,
  FAKE_FOLDERS,
  FAKE_PRODUCTS,
  FAKE_STATS,
  FAKE_TEMPLATES,
  FAKE_WORKSPACES,
  type ActivityItem,
  type DashboardStats,
  type MediaFolder,
  type PortalProduct,
  type PortalTemplate,
  type ProductCategory,
  type Workspace,
} from './_data';

export type LoadResult<T> = {
  data: T;
  source: 'live' | 'fake';
  error?: string;
};

/* ---------- Products ---------- */

const STATIC_COVER_GRADIENTS = [
  'from-red-500 to-rose-700',
  'from-zinc-800 to-black',
  'from-orange-400 to-amber-500',
  'from-pink-400 to-rose-500',
  'from-emerald-400 to-lime-500',
  'from-amber-400 to-orange-500',
  'from-sky-400 to-blue-500',
  'from-blue-500 to-violet-600',
];

function gradientFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return STATIC_COVER_GRADIENTS[Math.abs(h) % STATIC_COVER_GRADIENTS.length];
}

const STATUS_MAP: Record<string, PortalProduct['status']> = {
  active: 'active',
  draft: 'coming_soon',
  archived: 'discontinued',
};

const CATEGORY_KEYWORD_MAP: { keyword: string; cat: ProductCategory }[] = [
  { keyword: 'có ga', cat: 'carbonated' },
  { keyword: 'carbonated', cat: 'carbonated' },
  { keyword: 'soda', cat: 'carbonated' },
  { keyword: 'nước ép', cat: 'juice' },
  { keyword: 'juice', cat: 'juice' },
  { keyword: 'nước khoáng', cat: 'water' },
  { keyword: 'water', cat: 'water' },
  { keyword: 'tăng lực', cat: 'energy' },
  { keyword: 'energy', cat: 'energy' },
];

function inferCategory(name: string, desc?: string): ProductCategory {
  const s = `${name} ${desc ?? ''}`.toLowerCase();
  for (const { keyword, cat } of CATEGORY_KEYWORD_MAP) {
    if (s.includes(keyword)) return cat;
  }
  return 'carbonated';
}

export function beProductToPortal(p: BEProduct): PortalProduct {
  // BE sizes are string[], portal sizes are {label, volume_ml, price_vnd}[]
  const sizes = (p.sizes ?? []).map((s, idx) => {
    const m = s.match(/(\d+)\s*ml/i);
    const ml = m ? parseInt(m[1], 10) : 330;
    const labelMatch = s.match(/\(([^)]+)\)/);
    return {
      label: labelMatch?.[1] ?? `Size ${idx + 1}`,
      volume_ml: ml,
      price_vnd: 10_000 + idx * 5_000,
    };
  });

  return {
    id: p.id,
    name: p.name,
    sku: p.sku ?? `SKU-${p.id.slice(0, 6)}`,
    category: inferCategory(p.name, p.description),
    status: STATUS_MAP[p.status ?? 'active'] ?? 'active',
    cover_gradient: gradientFor(p.id),
    thumbnail_url: p.thumbnail_url || undefined,
    description: p.description ?? '',
    sizes:
      sizes.length > 0
        ? sizes
        : [{ label: 'Default', volume_ml: 330, price_vnd: 10_000 }],
    colors: p.colors?.map(c => ({ name: c.name, hex: c.hex })),
    ingredients: p.ingredients ?? [],
    certifications: (p.certifications ?? []).map(c => c.name),
    features: (p.features ?? []).map(f => ({
      label: f.label ?? '',
      description: f.description ?? '',
    })),
    related_template_ids: [],
    created_at: p.created_at ?? new Date().toISOString(),
  };
}

export async function loadProducts(): Promise<LoadResult<PortalProduct[]>> {
  try {
    const res = await rexerApi.products.list({ is_template: false, limit: 50 });
    const items = (res.items ?? []).map(beProductToPortal);
    return { data: items, source: 'live' };
  } catch (err) {
    return {
      data: FAKE_PRODUCTS,
      source: 'fake',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function createProductRemote(
  body: CreateProductRequest
): Promise<PortalProduct | null> {
  try {
    const res = await rexerApi.products.create(body);
    return beProductToPortal(res.product);
  } catch {
    return null;
  }
}

export async function updateProductRemote(
  id: string,
  body: CreateProductRequest
): Promise<PortalProduct | null> {
  try {
    const res = await rexerApi.products.update(id, body);
    return beProductToPortal(res.product);
  } catch {
    return null;
  }
}

/**
 * Upload an image to the media library (3-step flow) WITHOUT binding to a
 * product — used by the create wizard, which has no product id yet. The
 * returned asset id can be passed to `products.create` via `media_ids`, and
 * its `public_url` used as `thumbnail_url`.
 */
export async function uploadProductImage(file: File): Promise<MediaAsset> {
  const init = await rexerApi.media.initUpload({
    filename: file.name,
    mime_type: file.type || 'application/octet-stream',
    file_size: file.size,
    owner_scope: 'library',
    media_type: file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('video/')
        ? 'video'
        : 'file',
  });

  if (init.presigned_url) {
    const res = await fetch(init.presigned_url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    });
    if (!res.ok) throw new Error(`Storage upload failed: ${res.status}`);
  } else {
    await rexerApi.media.uploadRaw(init.upload_id, file);
  }

  const completed = await rexerApi.media.completeUpload({
    upload_id: init.upload_id,
  });
  return completed.media_asset;
}

/* ---------- Templates ---------- */

const TEMPLATE_GRADIENTS = [
  'from-rose-400 to-red-500',
  'from-zinc-700 to-zinc-900',
  'from-orange-400 to-pink-500',
  'from-emerald-400 to-lime-500',
  'from-blue-500 to-violet-600',
  'from-amber-400 to-orange-500',
];

export async function loadTemplates(): Promise<LoadResult<PortalTemplate[]>> {
  try {
    // Phase 2: BE shipped `/portal/templates` (be-missing-apis-portal.md P0.C)
    // with brand-scoped shape that maps almost 1:1 to PortalTemplate. Only
    // the cosmetic `thumbnail_gradient` + `last_updated_at` need synthesis.
    const res = await rexerApi.portal.listTemplates({ limit: 50 });
    const items: PortalTemplate[] = (res.items ?? []).map((t, i) => ({
      id: t.id,
      workspace_id: t.workspace_id || '',
      name: t.name,
      thumbnail_gradient: TEMPLATE_GRADIENTS[i % TEMPLATE_GRADIENTS.length],
      status:
        t.status === 'published' ||
        t.status === 'draft' ||
        t.status === 'archived'
          ? t.status
          : 'draft',
      views_30d: t.views_30d,
      clicks_30d: t.clicks_30d,
      leads_30d: t.leads_30d,
      open_comments: t.open_comments,
      last_updated_at: t.last_publish_at ?? new Date().toISOString(),
      last_updated_by: {
        name: t.last_updated_by?.name ?? 'Staff Rexer',
        role: t.last_updated_by?.role === 'staff' ? 'staff' : 'brand',
      },
    }));
    // Empty list from a successful BE call is a valid state — render it as
    // live (the page shows its own empty-state UI) instead of falling back
    // to fake data + the misleading "BE unavailable" banner.
    return { data: items, source: 'live' };
  } catch (err) {
    return {
      data: FAKE_TEMPLATES,
      source: 'fake',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/* ---------- Dashboard ---------- */

export type DashboardLoadResult = LoadResult<DashboardStats> & {
  trend_7d?: number[];
};

export async function loadDashboardStats(): Promise<DashboardLoadResult> {
  try {
    // Phase 2: BE shipped `/portal/dashboard/summary` with the exact shape
    // the portal expects — no more best-effort merge with FAKE_STATS.
    const res = await rexerApi.portal.dashboardSummary();
    return {
      data: {
        templates_count: res.templates_count,
        templates_published: res.templates_published,
        total_views_30d: res.total_views_30d,
        total_visitors_30d: res.total_visitors_30d,
        total_clicks_30d: res.total_clicks_30d,
        total_leads_30d: res.total_leads_30d,
        assets_count: res.assets_count,
        open_comments: res.open_comments,
        unread_notifications: res.unread_notifications,
      },
      trend_7d: res.trend_7d,
      source: 'live',
    };
  } catch (err) {
    return {
      data: FAKE_STATS,
      source: 'fake',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/* ---------- helper: convert PortalProduct value → CreateProductRequest ---------- */

export function portalProductToBE(
  v: import('@/components/modules/Product/ProductInformationEditor').ProductInformationValue,
  extra?: { thumbnail_url?: string; media_ids?: string[] }
): CreateProductRequest {
  return {
    name: v.name.trim(),
    description: v.description.trim() || undefined,
    sku: v.sku.trim() || undefined,
    sizes: v.sizes,
    colors: v.colors,
    ingredients: v.ingredients,
    certifications: v.certifications,
    ...(extra?.thumbnail_url ? { thumbnail_url: extra.thumbnail_url } : {}),
    ...(extra?.media_ids?.length ? { media_ids: extra.media_ids } : {}),
  };
}

/* ---------- Workspaces (Phase 1 multitenancy) ---------- */

const WORKSPACE_LOGO_COLORS = [
  'bg-rose-500',
  'bg-orange-500',
  'bg-emerald-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-sky-500',
  'bg-amber-500',
];

function workspaceLogoColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return WORKSPACE_LOGO_COLORS[Math.abs(h) % WORKSPACE_LOGO_COLORS.length];
}

function logoInitial(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function beWorkspaceToPortal(w: BEWorkspace): Workspace {
  return {
    id: w.id,
    // Left key là field nội bộ của portal Workspace (FK demo); right đọc
    // field BE đã rename `client_id → brand_id`.
    client_id: w.brand_id,
    slug: w.slug,
    name: w.name,
    description: w.description ?? '',
    logo_initial: logoInitial(w.name),
    logo_color: workspaceLogoColor(w.id),
    status: 'active',
    // BE doesn't return aggregate counts here — UI shows them only on demo
    member_count: 0,
    template_count: 0,
    storage_used_gb: 0,
  };
}

export async function loadWorkspaces(): Promise<LoadResult<Workspace[]>> {
  try {
    const memberships = await rexerApi.workspaces.myMemberships();
    const items = (memberships ?? []).map(m =>
      beWorkspaceToPortal(m.workspace)
    );
    // Empty membership list is valid (new brand, no workspaces yet) — keep
    // FAKE_WORKSPACES out of the picture so the header chip doesn't lie.
    return { data: items, source: 'live' };
  } catch (err) {
    return {
      data: FAKE_WORKSPACES,
      source: 'fake',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function switchWorkspaceRemote(
  workspaceId: string
): Promise<boolean> {
  try {
    await rexerApi.workspaces.switch({ workspace_id: workspaceId });
    return true;
  } catch {
    return false;
  }
}

/* ---------- Notifications (in-app bell) ----------
 * BE handoff §3.1: /v1/notifications/* dropped, /portal/notifications
 * unmounted. Phase 2 will re-wire via email (Sendgrid/SES) or activity_logs
 * with per-user read_at. Until then these resolve to empty state instead of
 * surfacing FAKE_STATS to avoid showing a misleading unread badge.
 */

export async function loadUnreadNotificationCount(): Promise<
  LoadResult<number>
> {
  try {
    const res = await rexerApi.notifications.unreadCount();
    return { data: res.unread_count, source: 'live' };
  } catch (err) {
    return {
      data: 0,
      source: 'fake',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function loadNotifications(query?: {
  unread?: boolean;
  limit?: number;
}): Promise<LoadResult<BENotification[]>> {
  try {
    const res = await rexerApi.notifications.list(query);
    return { data: res.items, source: 'live' };
  } catch (err) {
    return {
      data: [],
      source: 'fake',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function markNotificationsRead(opts: {
  all?: boolean;
  ids?: string[];
}): Promise<boolean> {
  try {
    await rexerApi.notifications.markRead(opts);
    return true;
  } catch {
    return false;
  }
}

/* ---------- Activity feed (per-workspace audit log) ---------- */

const ACTIVITY_KIND_MAP: Record<string, ActivityItem['kind']> = {
  template_published: 'template_published',
  template_updated: 'template_updated',
  comment_created: 'comment_new',
  comment_new: 'comment_new',
  comment_resolved: 'comment_resolved',
  media_uploaded: 'asset_uploaded',
  asset_uploaded: 'asset_uploaded',
  workspace_invited: 'workspace_invited',
  member_invited: 'workspace_invited',
};

function relativeTime(iso: string): string {
  const now = Date.now();
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const diffMin = Math.round((now - t) / 60_000);
  if (diffMin < 1) return 'vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH} giờ trước`;
  if (diffH < 48) return 'hôm qua';
  const diffD = Math.round(diffH / 24);
  return `${diffD} ngày trước`;
}

function beActivityToPortal(a: BEActivityItem): ActivityItem {
  const meta = a.meta ?? {};
  const actorRole = (meta.actor_role as ActivityItem['actor_role']) ?? 'staff';
  return {
    id: a.id,
    kind: ACTIVITY_KIND_MAP[a.kind] ?? 'template_updated',
    actor: a.actor_name ?? a.actor_id ?? 'Người dùng',
    actor_role: actorRole === 'brand' ? 'brand' : 'staff',
    subject: a.title ?? (meta.subject_name as string) ?? a.subject_id ?? '—',
    excerpt: meta.excerpt as string | undefined,
    at: relativeTime(a.created_at),
  };
}

export async function loadActivity(
  workspaceId?: string,
  limit = 20
): Promise<LoadResult<ActivityItem[]>> {
  // B2 (be-response §B2): chỉ gọi BE khi có workspace_id THẬT (UUID). Seed/fake
  // ws id (vd 'ws_coca_main') từ FAKE_WORKSPACES ở render đầu sẽ bị BE chặn
  // 403 cross-tenant — bỏ qua, đợi workspace thật load rồi effect chạy lại.
  if (workspaceId && !/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(workspaceId)) {
    return { data: [], source: 'live' };
  }
  try {
    const res = await rexerApi.activityFeed.list({
      workspace_id: workspaceId,
      limit,
    });
    const items = (res.items ?? []).map(beActivityToPortal);
    // Empty activity feed is the expected new-workspace state — let it
    // render the "no activity yet" UI instead of fake demo items.
    return { data: items, source: 'live' };
  } catch (err) {
    return {
      data: FAKE_ACTIVITY,
      source: 'fake',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/* ---------- Media folders (Drive-style) ---------- */

function beFolderToPortal(f: BEMediaFolder): MediaFolder {
  return {
    id: f.id,
    parent_id: f.parent_id ?? null,
    name: f.name,
    child_folder_count: f.child_count,
    file_count: f.file_count,
    size_bytes: f.size_bytes,
    updated_at: f.updated_at,
  };
}

export async function loadMediaFolders(
  parentId?: string
): Promise<LoadResult<MediaFolder[]>> {
  try {
    const res = await rexerApi.mediaFolders.list(
      parentId ? { parent_id: parentId } : undefined
    );
    const items = (res.items ?? []).map(beFolderToPortal);
    // Empty folder list is valid — render Drive's "no folders" UI instead
    // of populating fake demo folders that pollute the brand's namespace.
    return { data: items, source: 'live' };
  } catch (err) {
    return {
      data: FAKE_FOLDERS,
      source: 'fake',
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function createMediaFolderRemote(input: {
  name: string;
  parent_id?: string;
  description?: string;
}): Promise<MediaFolder | null> {
  try {
    const r = await rexerApi.mediaFolders.create(input);
    return beFolderToPortal(r);
  } catch {
    return null;
  }
}

/* ---------- API status banner ---------- */

export function ApiStatusLabel({
  source,
  error,
}: {
  source: 'live' | 'fake';
  error?: string;
}) {
  if (source === 'live') {
    return null; // no banner when live
  }
  return (
    <div className='mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-800'>
      <span className='mt-0.5 inline-block size-2 shrink-0 rounded-full bg-amber-500' />
      <div>
        <span className='font-semibold'>Đang dùng fake data</span>
        {error && (
          <span className='text-3xs ml-2 font-mono text-amber-600'>
            {error.slice(0, 80)}
          </span>
        )}
        <span className='ml-2 text-amber-700'>
          — BE chưa khả dụng hoặc bạn chưa login.
        </span>
      </div>
    </div>
  );
}
