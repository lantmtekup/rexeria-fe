import type {
  CampaignItemStatus,
  CampaignStatus,
  Product,
  ProductAsset,
  ProductFilters,
  ProductModalTab,
  ProductStatus,
} from '@/lib/portal-v2/product/types';

/** Taxonomies — verbatim from the prototype (rexer-platform-v2.html :7126-7153). */
export const PRODUCT_BRANDS = ['Ilia Beauty'] as const;

export const PRODUCT_TYPES = [
  'Complexion',
  'Cheek & Lip',
  'Eye',
  'Skincare',
] as const;

export const PRODUCT_CHANNELS = [
  'Online Store',
  'ReXeR Experiences',
  'Meta',
  'Google',
  'Shop',
] as const;

/** Colour triples of the prototype mapped onto `--pv2-*` tokens. */
export const PRODUCT_STATUS: Record<
  ProductStatus,
  { name: string; dot: string; bg: string; fg: string }
> = {
  active: {
    name: 'Active',
    dot: 'var(--pv2-success)',
    bg: 'color-mix(in srgb, var(--pv2-success) 12%, transparent)',
    fg: 'color-mix(in srgb, var(--pv2-success) 78%, var(--pv2-ink))',
  },
  draft: {
    name: 'Draft',
    dot: 'var(--pv2-faint)',
    bg: 'var(--pv2-canvas)',
    fg: 'var(--pv2-mut)',
  },
  archived: {
    name: 'Archived',
    dot: 'var(--pv2-warning)',
    bg: 'color-mix(in srgb, var(--pv2-warning) 14%, transparent)',
    fg: 'color-mix(in srgb, var(--pv2-warning) 76%, var(--pv2-ink))',
  },
};

export const PRODUCT_SOURCE: Record<
  Product['source'],
  { name: string; dot: string }
> = {
  shopify: { name: 'Shopify', dot: 'var(--pv2-success)' },
  csv: { name: 'CSV import', dot: 'var(--pv2-blue-500)' },
  manual: { name: 'Manual entry', dot: 'var(--pv2-violet)' },
};

export const PRODUCT_INVENTORY_POLICY = [
  { id: 'deny' as const, name: 'Stop selling' },
  { id: 'continue' as const, name: 'Keep selling' },
];

/** CAMP_STATUS / ITEM_STATUS (:9429-9478) — only what the Campaigns tab renders. */
export const CAMPAIGN_STATUS: Record<
  CampaignStatus,
  { name: string; dot: string; bg: string }
> = {
  planning: {
    name: 'Planning',
    dot: 'var(--pv2-faint)',
    bg: 'var(--pv2-canvas)',
  },
  building: {
    name: 'In build',
    dot: 'var(--pv2-warning)',
    bg: 'color-mix(in srgb, var(--pv2-warning) 14%, transparent)',
  },
  live: {
    name: 'Live',
    dot: 'var(--pv2-success)',
    bg: 'color-mix(in srgb, var(--pv2-success) 12%, transparent)',
  },
  paused: {
    name: 'Paused',
    dot: 'var(--pv2-error)',
    bg: 'color-mix(in srgb, var(--pv2-error) 10%, transparent)',
  },
  done: {
    name: 'Complete',
    dot: 'var(--pv2-violet)',
    bg: 'color-mix(in srgb, var(--pv2-violet) 12%, transparent)',
  },
};

export const CAMPAIGN_ITEM_STATUS: Record<
  CampaignItemStatus,
  { name: string; fg: string }
> = {
  todo: { name: 'Not started', fg: 'var(--pv2-faint)' },
  building: {
    name: 'In build',
    fg: 'color-mix(in srgb, var(--pv2-warning) 76%, var(--pv2-ink))',
  },
  review: { name: 'In review', fg: 'var(--pv2-blue-500)' },
  ready: { name: 'Ready', fg: 'var(--pv2-violet)' },
  live: {
    name: 'Live',
    fg: 'color-mix(in srgb, var(--pv2-success) 78%, var(--pv2-ink))',
  },
};

/**
 * THE READINESS REGISTRY (:15656-15688) — the Product module's field registry.
 * `missing` cannot go stale, because it is not stored: add the media, and the
 * line about missing media disappears.
 */
export const PRODUCT_READY_CHECKS: {
  k: string;
  d: string;
  ok: (product: Product, assets: ProductAsset[]) => boolean;
}[] = [
  {
    k: 'a cover image',
    d: 'No cover image — an experience has no hero without one',
    ok: p => !!p.cover,
  },
  {
    k: 'more than one image',
    d: 'Only one image — Explore has nothing to explore',
    ok: (p, assets) =>
      assets.filter(
        a =>
          a.kind === 'IMG' && a.home.scope === 'product' && a.home.ref === p.id
      ).length > 1,
  },
  {
    k: 'a description',
    d: 'No description — Educate has nothing to say',
    ok: p => !!p.body.trim(),
  },
  {
    k: 'features',
    d: 'No features on file — a claim has no raw material',
    ok: p => p.value.features.length > 0,
  },
  {
    k: 'benefits',
    d: 'No benefits on file — a hook has nothing to promise',
    ok: p => p.value.benefits.length > 0,
  },
  {
    k: 'proof',
    d: 'No claims on file — Trust has nothing to substantiate',
    ok: p => p.value.claims.length > 0,
  },
];

export const PRODUCT_MODAL_TABS: {
  id: ProductModalTab;
  labelKey: string;
  /** Hidden while creating or editing (:19789). */
  editHidden?: boolean;
}[] = [
  { id: 'details', labelKey: 'tabDetails' },
  { id: 'value', labelKey: 'tabValue' },
  { id: 'experiences', labelKey: 'tabExperiences', editHidden: true },
  { id: 'campaigns', labelKey: 'tabCampaigns', editHidden: true },
];

export const PRODUCT_DEFAULT_FILTERS: ProductFilters = {
  q: '',
  status: 'all',
  type: 'all',
  brand: 'all',
  view: 'table',
};

/** What ReXeR does with a value proposition (:20476-20489). */
export const VALUE_USED_FOR: { k: string; v: string }[] = [
  { k: 'HOOK', v: 'The strongest benefit, in the customer’s words' },
  { k: 'EDUCATE', v: 'The feature that makes the benefit believable' },
  { k: 'EXPLORE', v: 'The competitor difference, answered on the page' },
  { k: 'TRUST', v: 'The substantiated claims — and only those' },
  { k: 'CONVERT', v: 'The disclaimer, carried automatically' },
];

/** Standard Shopify product CSV headers (:20604-20620). */
export const CSV_COLUMN_MAP: {
  column: string;
  field: string;
  required: boolean;
}[] = [
  { column: 'Handle', field: 'URL handle', required: true },
  { column: 'Title', field: 'Product title', required: true },
  { column: 'Body (HTML)', field: 'Description', required: false },
  { column: 'Brand', field: 'Brand', required: false },
  { column: 'Type', field: 'Product type', required: false },
  { column: 'Tags', field: 'Tags', required: false },
  { column: 'Status', field: 'Status', required: true },
  { column: 'Option1 Name / Value', field: 'Variant option', required: false },
  { column: 'Variant SKU', field: 'SKU', required: false },
  { column: 'Variant Price', field: 'Price', required: true },
  {
    column: 'Variant Compare-at Price',
    field: 'Compare-at',
    required: false,
  },
  { column: 'Cost per item', field: 'Cost', required: false },
  { column: 'Variant Inventory Qty', field: 'Stock on hand', required: false },
  { column: 'Variant Barcode', field: 'Barcode (GTIN)', required: false },
  { column: 'Image Src', field: 'Media', required: false },
];
