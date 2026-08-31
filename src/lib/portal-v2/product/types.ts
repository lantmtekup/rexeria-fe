/**
 * Product catalogue types — ported from the prototype's Shopify-shaped product
 * schema (rexer-platform-v2.html :7116-7775) so a Shopify sync or a product CSV
 * maps 1:1 with no translation layer.
 *
 * `readiness` is NOT a field here: it is derived (see helpers.ts), exactly as in
 * the prototype. Same for a product's media, which is every asset homed to it.
 */
import type {
  CampaignItemStatus,
  CampaignStage,
} from '@/lib/portal-v2/campaigns/types';

export type ProductStatus = 'active' | 'draft' | 'archived';

export type ProductSource = 'shopify' | 'csv' | 'manual';

export type ProductInventoryPolicy = 'deny' | 'continue';

export type ProductVariant = {
  sku: string;
  opt1: string;
  barcode: string;
  price: number;
  compareAt: number;
  cost: number;
  qty: number;
  policy: ProductInventoryPolicy;
  grams: number;
};

export type ProductOption = {
  name: string;
  values: string[];
};

/** A claim is only usable when something substantiates it — `ok` is derived from `proof`. */
export type ProductClaim = {
  t: string;
  proof: string;
  ok: boolean;
};

export type ProductCompetitor = {
  n: string;
  theirs: string;
  ours: string;
};

/** Everything an experience needs in order to argue for this product without inventing anything. */
export type ProductValue = {
  features: string[];
  benefits: string[];
  competitors: ProductCompetitor[];
  claims: ProductClaim[];
  disclaimers: string[];
};

export type ProductSeo = {
  title: string;
  desc: string;
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  body: string;
  brand: string;
  type: string;
  /** FK `product_categories` — nguồn thật của "Loại sản phẩm" (dropdown);
   *  `type` free-text chỉ còn là label kế thừa từ Shopify import. */
  categoryId: string | null;
  category: string;
  tags: string[];
  status: ProductStatus;
  source: ProductSource;
  updated: string;
  /** Asset id of the primary image — how this product is recognised. */
  cover: string | null;
  grad: string;
  /**
   * List price exactly as it is on file, currency and all ("$1,539.95 CAD").
   * The BE row has no price column — a catalogue price arrives as a feature, see
   * `priceTextFromBe`. Deliberately not a number: reformatting a scraped
   * "1.250.000 ₫" through the module's `$`-prefixed template would misstate both
   * the amount and the currency. Absent on prototype rows, which price properly
   * through `variants[].price`.
   */
  priceText?: string;
  channels: string[];
  options: ProductOption[];
  variants: ProductVariant[];
  value: ProductValue;
  seo: ProductSeo;
};

export type ProductAssetKind = 'IMG' | 'VID' | 'D3' | 'P360' | 'DOC';

export type ProductAsset = {
  id: string;
  name: string;
  kind: ProductAssetKind;
  grad: string;
  /**
   * Public CDN URL when the asset is a real file. Prototype assets are
   * gradient-only, so `grad` stays the fallback — also what renders when the
   * URL is dead.
   */
  url?: string;
  home: { scope: string; ref?: string };
};

/**
 * The campaign vocabulary belongs to the Campaigns module now that it exists —
 * re-exported here rather than redeclared so the two can never drift.
 */
export type CampaignStatus = CampaignStage;
export type { CampaignItemStatus };

/** Pre-derived row for the modal's Campaigns tab — the Campaigns module owns the real model. */
export type ProductCampaignLink = {
  productId: string;
  campaignId: string;
  campaignName: string;
  campaignStatus: CampaignStatus;
  itemStatus: CampaignItemStatus;
  expCount: number;
};

/** Pre-derived row for the modal's Experiences tab. */
export type ProductExperienceLink = {
  productId: string;
  id: string;
  name: string;
  grad: string;
  catName: string;
  home: string;
  proven: boolean;
  sessions: number | null;
  lift: number | null;
};

export type ProductViewMode = 'table' | 'grid';

export type ProductFilters = {
  q: string;
  status: ProductStatus | 'all';
  type: string;
  brand: string;
  view: ProductViewMode;
};

export type ProductModalTab = 'details' | 'value' | 'experiences' | 'campaigns';

export type ProductModalMode = 'view' | 'edit' | 'new';

export type ProductReadiness = {
  score: number;
  missing: string[];
};

export type ProductReadinessTone = 'success' | 'warning' | 'error';
