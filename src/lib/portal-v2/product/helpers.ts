import { PRODUCT_READY_CHECKS } from '@/lib/portal-v2/product/constants';
import type {
  Product,
  ProductAsset,
  ProductFilters,
  ProductReadiness,
  ProductReadinessTone,
} from '@/lib/portal-v2/product/types';

/* Derived values — computed, never stored twice (:15574-15600). */

export const productStock = (p: Product): number =>
  p.variants.reduce((n, v) => n + v.qty, 0);

export const productPriceRange = (p: Product): string => {
  /* A BE row has no price column, so what it has is the string on file —
   * currency and all. Prefer it verbatim over a variant table nothing fills. */
  if (p.priceText) return p.priceText;
  const prices = p.variants.map(v => v.price);
  /* An all-zero table means "no price on file", not "$0" — the prototype's
   * `$0` read as a real number for long enough. */
  if (!prices.some(Boolean)) return '—';
  const lo = Math.min(...prices);
  const hi = Math.max(...prices);
  return lo === hi ? `$${lo}` : `$${lo} – $${hi}`;
};

export const productMargin = (p: Product): number => {
  const v = p.variants[0];
  if (!v || !v.price) return 0;
  return Math.round(((v.price - v.cost) / v.price) * 100);
};

/** A product's media is every asset homed to it — never a stored field (:15823). */
export const assetsOfProduct = (
  assets: ProductAsset[],
  productId: string
): ProductAsset[] =>
  assets.filter(a => a.home.scope === 'product' && a.home.ref === productId);

export const productCover = (
  p: Product,
  assets: ProductAsset[]
): ProductAsset | null =>
  p.cover ? (assets.find(a => a.id === p.cover) ?? null) : null;

export const productGradient = (p: Product, assets: ProductAsset[]): string =>
  productCover(p, assets)?.grad ?? p.grad;

/** The cover's real photo when one is on file — the gradient stands in otherwise. */
export const productCoverUrl = (
  p: Product,
  assets: ProductAsset[]
): string | null => productCover(p, assets)?.url ?? null;

/** Inventory summary behind the table's stock cell (:15621-15632). */
export const stockSummary = (
  p: Product
): { total: number; out: number; low: number } => ({
  total: productStock(p),
  out: p.variants.filter(v => v.qty === 0).length,
  low: p.variants.filter(v => v.qty > 0 && v.qty < 25).length,
});

/** visibleProducts() (:15602-15619) — search hits title, handle, tag, or SKU. */
export const visibleProducts = (
  products: Product[],
  filters: ProductFilters
): Product[] => {
  const q = filters.q.trim().toLowerCase();
  return products.filter(
    p =>
      (filters.status === 'all' || p.status === filters.status) &&
      (filters.type === 'all' || p.type === filters.type) &&
      (filters.brand === 'all' || p.brand === filters.brand) &&
      (filters.source === 'all' || p.source === filters.source) &&
      (!q ||
        p.title.toLowerCase().includes(q) ||
        p.handle.includes(q) ||
        p.tags.some(t => t.includes(q)) ||
        p.variants.some(v => v.sku.toLowerCase().includes(q)))
  );
};

/**
 * readiness() (:15690-15696) — how much of what an experience needs is on file.
 *
 * `assetsHydrated = false` loại các check `requiresRealAssets` khỏi mẫu số —
 * dùng khi `assets` chỉ có ảnh bìa tổng hợp của danh sách (xem
 * `PRODUCT_READY_CHECKS`), để điểm không tự nhảy khi modal chi tiết nạp ảnh
 * thật cho MỘT sản phẩm khác trong cùng state `assets` dùng chung.
 */
export const readiness = (
  p: Product,
  assets: ProductAsset[],
  assetsHydrated = true
): ProductReadiness => {
  const checks = assetsHydrated
    ? PRODUCT_READY_CHECKS
    : PRODUCT_READY_CHECKS.filter(r => !r.requiresRealAssets);
  const met = checks.filter(r => r.ok(p, assets));
  return {
    score: Math.round((met.length / checks.length) * 100),
    missing: checks.filter(r => !r.ok(p, assets)).map(r => r.d),
  };
};

/** Thresholds from readyCell (:15698-15704): >=80 mint, >=60 amber, else rose. */
export const readinessTone = (score: number): ProductReadinessTone =>
  score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error';

export const READINESS_COLOR: Record<ProductReadinessTone, string> = {
  success: 'var(--pv2-success)',
  warning: 'var(--pv2-warning)',
  error: 'var(--pv2-error)',
};

export const readinessColor = (score: number): string =>
  READINESS_COLOR[readinessTone(score)];

/** Handles must be unique — de-dupe with -2, -3… (:12775-12790). */
export const uniqueHandle = (handle: string, products: Product[]): string => {
  const taken = new Set(products.map(p => p.handle));
  if (!taken.has(handle)) return handle;
  let n = 2;
  while (taken.has(`${handle}-${n}`)) n += 1;
  return `${handle}-${n}`;
};

export const slugifyHandle = (title: string): string =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** duplicateProduct() (:11788) — a copy is always a draft, off every channel. */
export const duplicateProduct = (p: Product, products: Product[]): Product => {
  const copy = structuredClone(p);
  copy.id = `${p.id}-copy-${products.length + 1}`;
  copy.title = `${p.title} (copy)`;
  copy.handle = uniqueHandle(`${p.handle}-copy`, products);
  copy.status = 'draft';
  copy.channels = [];
  copy.updated = 'just now';
  copy.variants = copy.variants.map(v => ({ ...v, sku: `${v.sku}-C` }));
  return copy;
};

/**
 * readProductForm() (:12701-12760) — a claim's usability is DERIVED from its
 * proof, never a checkbox. Blank lines are dropped everywhere.
 */
export const normalizeProductDraft = (draft: Product): Product => {
  const clean = (lines: string[]) => lines.map(s => s.trim()).filter(Boolean);

  return {
    ...draft,
    title: draft.title.trim(),
    handle: draft.handle.trim() || slugifyHandle(draft.title),
    body: draft.body.trim(),
    tags: clean(draft.tags),
    options: draft.options.map(o => ({
      ...o,
      name: o.name.trim(),
      values: clean(o.values),
    })),
    variants: draft.variants.map(v => ({ ...v, sku: v.sku.trim() })),
    value: {
      features: clean(draft.value.features),
      benefits: clean(draft.value.benefits),
      competitors: draft.value.competitors.filter(c => c.n.trim()),
      claims: draft.value.claims
        .filter(c => c.t.trim())
        .map(c => ({
          t: c.t.trim(),
          proof: c.proof.trim(),
          ok: !!c.proof.trim(),
        })),
      disclaimers: clean(draft.value.disclaimers),
    },
    seo: { title: draft.seo.title.trim(), desc: draft.seo.desc.trim() },
  };
};

/** How full a value proposition is — drives the tab badge and the sidebar. */
export const valueFilledCount = (p: Product): number =>
  p.value.features.length + p.value.benefits.length + p.value.claims.length;
