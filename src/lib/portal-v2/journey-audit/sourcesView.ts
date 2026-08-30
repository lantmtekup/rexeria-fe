import type {
  RxSourceCatalogEntry,
  RxSourceConnection,
} from '@/services/rexer-v2/types/sources';

import type { AuditSource } from './types';

/**
 * Ghép hai bề mặt THẬT của BE thành bộ nguồn mà UI vẽ:
 * - `/v1/sources` (connections: status/stats/last_sync_at/freshness)
 * - `/v1/sources/catalog` (9 provider + coverage theo key stage)
 * cộng lớp copy trình bày FE (icon, câu value/unlocks/observes) — BE không
 * chở copy marketing, và không được bịa nó thành dữ liệu đo.
 */

export const STAGE_NAME_BY_KEY: Record<string, string> = {
  awareness: 'Awareness',
  consideration: 'Consideration',
  decision: 'Decision',
  purchase: 'Purchase',
  post_purchase: 'Post-Purchase',
};

type ProviderMeta = {
  icon: string;
  category: string;
  auth: string;
  value: string;
  unlocks: string;
  observes: string;
};

/** Copy trình bày theo provider key THẬT của BE (sourceCatalog usecase). */
export const PROVIDER_META: Record<string, ProviderMeta> = {
  shopify: {
    icon: '🛍️',
    category: 'Commerce',
    auth: 'OAuth',
    value:
      'Read live pricing, promotions and checkout behaviour to confirm which discount actually applies at each step.',
    unlocks: 'Audits pricing and checkout against live store data',
    observes: 'Products, prices, orders, abandoned checkouts and price rules',
  },
  woocommerce: {
    icon: '🛒',
    category: 'Commerce',
    auth: 'API key',
    value:
      'Read products, pricing, coupons and order flow from a WordPress store to audit every step of its checkout.',
    unlocks: 'Extends pricing and checkout auditing to WooCommerce storefronts',
    observes: 'Products, coupons and orders over the WooCommerce REST API',
  },
  ga4: {
    icon: '📊',
    category: 'Analytics & Behavior',
    auth: 'OAuth',
    value:
      "Replace the estimated traffic model with the brand's real funnel, channel mix and page performance.",
    unlocks: 'Turns every estimated figure in this audit into measured data',
    observes: 'Sessions, funnel events, channel mix and landing pages',
  },
  tiktokshop: {
    icon: '🛍',
    category: 'Marketplaces',
    auth: 'OAuth',
    value:
      'Audit shop listings, livestream offers and product performance — where pricing and naming drift fastest.',
    unlocks: 'Unlocks the TikTok Shop sales channel as an audited touchpoint',
    observes: 'Shop listings, orders and product analytics',
  },
  amazon: {
    icon: '📦',
    category: 'Marketplaces',
    auth: 'OAuth',
    value:
      'Track the marketplace listing — title, bullets, usage instructions and imagery — against the DTC page.',
    unlocks: 'Extends listing-drift auditing to the Amazon channel',
    observes: 'Marketplace listing content and order volumes',
  },
  meta: {
    icon: '🎯',
    category: 'Paid Media',
    auth: 'OAuth',
    value:
      'Audit live Instagram and Facebook creative for naming and claim consistency against the product page.',
    unlocks: 'Unlocks the Instagram/Facebook touchpoints',
    observes: 'Active ad creative and page content',
  },
  tiktokads: {
    icon: '🎵',
    category: 'Paid Media',
    auth: 'OAuth',
    value:
      'Audit creator content and link destinations — the highest-risk channel for product-name drift.',
    unlocks: 'Unlocks the TikTok touchpoint',
    observes: 'Advertiser account, creatives and landing URLs',
  },
  klaviyo: {
    icon: '✉️',
    category: 'Email & SMS',
    auth: 'OAuth',
    value:
      'Audit onboarding and replenishment email for usage guidance and cadence.',
    unlocks: 'Unlocks the post-purchase email touchpoints',
    observes: 'Campaigns, flows, templates and send metrics',
  },
  retail_feed: {
    icon: '🏬',
    category: 'Retail partners',
    auth: 'Feed',
    value:
      'Compare retail partner listings against DTC content — the same drift found on marketplaces usually repeats at retail.',
    unlocks: 'Extends listing-drift auditing to retail partners',
    observes: 'Partner catalog feed rows mapped onto products',
  },
};

/** "2h ago" | "3d ago" | "just now" từ ISO timestamp (tính trên server). */
export const relativeSync = (
  iso: string | null,
  now: number
): string | null => {
  if (!iso) return null;
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return null;
  const mins = Math.max(0, Math.round((now - then) / 60000));
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

/** Dòng tóm tắt account + stats của một connection — dùng cả ở wizard. */
const isPrimitive = (value: unknown): value is string | number | boolean =>
  ['string', 'number', 'boolean'].includes(typeof value);

export const statsLine = (
  stats: Record<string, unknown>,
  account: Record<string, unknown>
): string | null => {
  // Chỉ lấy giá trị primitive — connector thật nhét object lồng nhau vào
  // external_account/stats và String(object) thành "[object Object]".
  const parts = [
    ...Object.values(account ?? {})
      .filter(isPrimitive)
      .map(String),
    ...Object.entries(stats ?? {})
      .filter(([, value]) => isPrimitive(value))
      .map(([key, value]) => `${key.replaceAll('_', ' ')}: ${String(value)}`),
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
};

/** Connections + catalog → AuditSource[]. Connection `off` = lịch sử đã ngắt
 *  — không vẽ card riêng, provider của nó quay về nhóm available. */
export const mergeAuditSources = (
  connections: RxSourceConnection[],
  catalog: RxSourceCatalogEntry[],
  now: number
): AuditSource[] => {
  const byProvider = new Map(catalog.map(entry => [entry.provider, entry]));
  const merged: AuditSource[] = [];

  connections
    .filter(conn => conn.status !== 'off')
    .forEach(conn => {
      const entry = byProvider.get(conn.provider);
      const meta = PROVIDER_META[conn.provider];
      merged.push({
        id: conn.id,
        provider: conn.provider,
        name: entry?.label ?? conn.provider,
        icon: meta?.icon ?? '🔌',
        category: meta?.category ?? entry?.category ?? '',
        auth: meta?.auth ?? 'OAuth',
        // Nhánh này đã lọc `off`, còn lại đúng union view.
        status: conn.status === 'attention' ? 'attention' : 'connected',
        firstParty: false,
        stages: (entry?.coverage ?? []).map(
          key => STAGE_NAME_BY_KEY[key] ?? key
        ),
        observes: meta?.observes ?? null,
        stats: statsLine(conn.stats, conn.external_account),
        lastSync: relativeSync(conn.last_sync_at, now),
        freshness: conn.freshness,
        issue: null,
        value: meta?.value ?? null,
        unlocks: meta?.unlocks ?? null,
      });
    });

  const connectedProviders = new Set(
    connections.filter(conn => conn.status !== 'off').map(conn => conn.provider)
  );
  catalog
    .filter(entry => !connectedProviders.has(entry.provider))
    .forEach(entry => {
      const meta = PROVIDER_META[entry.provider];
      merged.push({
        id: entry.provider,
        provider: entry.provider,
        name: entry.label,
        icon: meta?.icon ?? '🔌',
        category: meta?.category ?? entry.category,
        auth: meta?.auth ?? 'OAuth',
        status: 'available',
        firstParty: false,
        stages: entry.coverage.map(key => STAGE_NAME_BY_KEY[key] ?? key),
        observes: meta?.observes ?? null,
        stats: null,
        lastSync: null,
        freshness: null,
        issue: null,
        value: meta?.value ?? null,
        unlocks: meta?.unlocks ?? null,
      });
    });

  return merged;
};
