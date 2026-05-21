'use client';

/**
 * Hybrid loaders for portal-demo: try real BE → fallback to fake data.
 * Pattern: every loader returns `{ data, source: 'live' | 'fake', error }`.
 */

import { rexerApi } from '@/services/rexer/endpoints';
import type {
  CreateProductRequest,
  Product as BEProduct,
} from '@/services/rexer/types';

import {
  FAKE_PRODUCTS,
  FAKE_STATS,
  FAKE_TEMPLATES,
  type DashboardStats,
  type PortalProduct,
  type PortalTemplate,
  type ProductCategory,
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
    const res = await rexerApi.clientPortal.myProjects();
    const items: PortalTemplate[] = (res.items ?? []).map((p, i) => ({
      id: p.project_id,
      workspace_id: '', // BE chưa trả workspace_id; FE filter all khi rỗng
      name: p.name || p.template_name || p.project_id,
      thumbnail_gradient: TEMPLATE_GRADIENTS[i % TEMPLATE_GRADIENTS.length],
      status:
        p.status === 'published' ||
        p.status === 'draft' ||
        p.status === 'archived'
          ? p.status
          : 'draft',
      views_30d: p.analytics_summary?.page_views ?? 0,
      clicks_30d: p.analytics_summary?.cta_clicks ?? 0,
      leads_30d: p.analytics_summary?.conversions ?? 0,
      open_comments: 0,
      last_updated_at: p.last_publish_at ?? new Date().toISOString(),
      last_updated_by: {
        name: 'Staff Rexer',
        role: 'staff',
      },
    }));
    if (items.length === 0) {
      return { data: FAKE_TEMPLATES, source: 'fake', error: 'empty list' };
    }
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

export async function loadDashboardStats(): Promise<
  LoadResult<DashboardStats>
> {
  try {
    const res = await rexerApi.dashboard.summary();
    // Map BE shape to portal stats; BE DashboardSummary may have different fields
    // Use a best-effort merge with sensible defaults from FAKE_STATS
    const r = res as unknown as Record<string, number | undefined>;
    return {
      data: {
        templates_count:
          r.templates_count ?? r.projects_count ?? FAKE_STATS.templates_count,
        templates_published:
          r.templates_published ??
          r.published_count ??
          FAKE_STATS.templates_published,
        total_views_30d:
          r.total_views_30d ?? r.views ?? FAKE_STATS.total_views_30d,
        total_visitors_30d:
          r.total_visitors_30d ??
          r.unique_visitors ??
          FAKE_STATS.total_visitors_30d,
        total_clicks_30d:
          r.total_clicks_30d ?? r.clicks ?? FAKE_STATS.total_clicks_30d,
        total_leads_30d:
          r.total_leads_30d ?? r.leads ?? FAKE_STATS.total_leads_30d,
        assets_count: r.assets_count ?? FAKE_STATS.assets_count,
        open_comments: FAKE_STATS.open_comments,
        unread_notifications: FAKE_STATS.unread_notifications,
      },
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
  v: import('@/components/modules/Product/ProductInformationEditor').ProductInformationValue
): CreateProductRequest {
  return {
    name: v.name.trim(),
    description: v.description.trim() || undefined,
    sku: v.sku.trim() || undefined,
    sizes: v.sizes,
    colors: v.colors,
    ingredients: v.ingredients,
    certifications: v.certifications,
  };
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
    <div className='mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 text-[12px] text-amber-800'>
      <span className='mt-0.5 inline-block size-2 shrink-0 rounded-full bg-amber-500' />
      <div>
        <span className='font-semibold'>Đang dùng fake data</span>
        {error && (
          <span className='ml-2 font-mono text-[10px] text-amber-600'>
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
