/**
 * BE wire product → Portal V2 catalogue product.
 *
 * The two models do not overlap: the BE row is attribute-shaped
 * (`name/sku/sizes/colors/features/certifications`, see `services/rexer/types.ts`)
 * while this module is Shopify-shaped (`title/handle/variants/value/seo`). Same
 * split the Exchange module solves with `mapPage.ts` / `mapBlock.ts`.
 *
 * NOTHING IS INVENTED HERE. Fields the BE has no counterpart for stay empty or
 * zero — never a plausible-looking placeholder. `/portal` (v1) synthesised
 * `price_vnd: 10_000 + idx * 5_000` and the number has been read as real ever
 * since. An empty value proposition is supposed to score badly in `readiness()`:
 * that low score is the module telling the truth about what is on file.
 */

import { slugifyHandle } from '@/lib/portal-v2/product/helpers';
import type {
  Product,
  ProductAsset,
  ProductClaim,
  ProductValue,
  ProductVariant,
} from '@/lib/portal-v2/product/types';
import type { Product as BEProduct } from '@/services/rexer/types';

/** Prototype thumb gradients (mock.ts) — a product keeps the same one forever. */
const COVER_GRADIENTS = [
  'linear-gradient(135deg,#6C4CF1,#9B7DF8)',
  'linear-gradient(135deg,#E0629B,#F08FBC)',
  'linear-gradient(135deg,#3B82D6,#6FA8E5)',
  'linear-gradient(135deg,#13B57F,#3ED2A0)',
  'linear-gradient(135deg,#E89A3C,#F2BE7C)',
  'linear-gradient(135deg,#5334D6,#6C4CF1)',
  'linear-gradient(135deg,#2A66B0,#3B82D6)',
  'linear-gradient(135deg,#1E1930,#3D3950)',
];

/** Deterministic so a reload never reshuffles the catalogue's colours. */
export const gradientForId = (id: string): string => {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) | 0;
  return COVER_GRADIENTS[Math.abs(h) % COVER_GRADIENTS.length]!;
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * The table renders `updated` as a bare string ("2h ago"), so it is resolved
 * once on the server against a passed-in `now` — computing it in the client
 * would drift from the server render and trip hydration.
 */
export const relativeUpdated = (
  iso: string | undefined,
  now: number
): string => {
  if (!iso) return '—';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';

  const diff = Math.max(0, now - then);
  if (diff < HOUR) return `${Math.max(1, Math.floor(diff / MINUTE))}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < 30 * DAY) return `${Math.floor(diff / DAY)}d ago`;
  return new Date(then).toISOString().slice(0, 10);
};

/**
 * `assetsOfProduct()` is what feeds media — a cover has to exist as an asset.
 *
 * `id` phải khớp CHÍNH XÁC với `p.cover` mà `mapBeProductToPortal` tính ở
 * dưới (`p.cover_media_id ?? coverAssetId(p.id)`). Trước đây hàm này luôn
 * gắn id tổng hợp `coverAssetId(p.id)` bất kể `cover_media_id` có hay
 * không — sản phẩm nào đã có ảnh bìa thật (chọn qua Cover Picker) thì
 * `productCover()` tìm id thật trong `assets` list và không thấy, ảnh biến
 * mất khỏi lưới/bảng ngay sau khi tải trang. Mở modal sản phẩm ra lại thì
 * hiện vì `fetchProductMedia` (gọi khi mở modal) trả về asset đúng id thật,
 * ghi đè state `assets` dùng chung — nhưng reload trang thì mất lại từ đầu.
 */
export const productAssetsFromBe = (products: BEProduct[]): ProductAsset[] =>
  products
    .filter(p => !!p.thumbnail_url)
    .map(p => ({
      id: p.cover_media_id ?? coverAssetId(p.id),
      name: `${p.name} cover`,
      kind: 'IMG' as const,
      grad: gradientForId(p.id),
      /* The real photo. `grad` stays behind it as the fallback for a dead URL —
       * covers point at whatever merchant site the row was sourced from. */
      url: p.thumbnail_url,
      home: { scope: 'product', ref: p.id },
    }));

const coverAssetId = (productId: string) => `a-${productId}-cover`;

/** Xu → đơn vị tiền chính, làm tròn ngược của `toCents` trong `toBeProduct.ts`. */
const fromCents = (v: number | undefined): number => (v ? v / 100 : 0);

/**
 * `p.variants_v2` là nguồn v2 thật — chính là thứ `toBeProduct.ts` vừa ghi lên
 * (`price_cents`/`cost_cents`/`qty`/`option1`...). Trước đây hàm này chỉ đọc
 * `p.sizes`/`p.sku` (nguồn v1 cũ) rồi GHI CỨNG price/cost/qty/barcode về 0, nên
 * ngay sau khi lưu, modal đọc lại chính response vừa PATCH thành công và hiện
 * ra một bảng biến thể trống trơn — trong khi dữ liệu vẫn nằm nguyên trên BE.
 *
 * `p.sizes`/`p.sku` chỉ còn là fallback cho sản phẩm chưa từng đi qua đường
 * ghi v2 (chưa có `variants_v2` nào) — vẫn cần một dòng để hiện SKU của nó.
 */
const variantsFromBe = (p: BEProduct): ProductVariant[] => {
  if (p.variants_v2?.length) {
    return p.variants_v2.map(v => ({
      sku: v.sku ?? '',
      opt1: v.option1 ?? '',
      barcode: v.barcode ?? '',
      price: fromCents(v.price_cents),
      compareAt: fromCents(v.compare_at_cents),
      cost: fromCents(v.cost_cents),
      qty: v.qty ?? 0,
      policy: v.inventory_policy === 'continue' ? 'continue' : 'deny',
      grams: v.grams ?? 0,
    }));
  }

  const blank = {
    barcode: '',
    price: 0,
    compareAt: 0,
    cost: 0,
    qty: 0,
    policy: 'deny' as const,
    grams: 0,
  };
  const sizes = p.sizes ?? [];
  if (!sizes.length) return [{ sku: p.sku ?? '', opt1: '', ...blank }];

  return sizes.map((size, i) => ({
    sku: sizes.length > 1 && p.sku ? `${p.sku}-${i + 1}` : (p.sku ?? ''),
    opt1: size,
    ...blank,
  }));
};

/**
 * A certification is the only thing on the BE row that is already a claim with
 * substantiation attached — `ok` stays derived from the proof, per the contract
 * on `ProductClaim`.
 */
/**
 * Khối value — đọc từ `p.value` của BE v2, chỉ rơi về nguồn cũ khi thiếu.
 *
 * Trước đây bốn trường benefits/competitors/claims/disclaimers bị GHI CỨNG
 * rỗng, nên dù người dùng nhập đủ thì modal vẫn hiện "Nothing on file" — và
 * nhìn vào tưởng dữ liệu thiếu chứ không phải FE không đọc.
 *
 * `features` ưu tiên `p.features` (có label + description) hơn
 * `p.value.features` (chỉ chuỗi): hai nguồn này BE không tự đồng bộ, và bản
 * đầy đủ hơn mới là bản người dùng nhập vào.
 */
const valueFromBe = (p: BEProduct): ProductValue => {
  const v = p.value ?? {};

  /* The price feature stays in this list even though `priceText` also lifts
   * it out: it IS a feature on file, and the Value panel is where the user
   * edits it back. Dropping it here would lose the row. */
  const labelled = (p.features ?? [])
    .map(f =>
      f.description ? `${f.label}: ${f.description}` : (f.label ?? '')
    )
    .filter(Boolean);

  return {
    features: labelled.length ? labelled : (v.features ?? []),
    benefits: v.benefits ?? [],
    competitors: (v.competitors ?? []).map(c => ({
      n: c.name,
      theirs: c.theirs,
      ours: c.ours,
    })),
    // `certifications` là nguồn CŨ; chỉ dùng khi v2 chưa có claim nào, nếu
    // không một chứng nhận lẻ sẽ che mất bộ claim thật.
    claims: v.claims?.length
      ? v.claims.map(c => ({
          t: c.text,
          proof: c.proof ?? '',
          ok: Boolean(c.ok),
        }))
      : claimsFromBe(p),
    disclaimers: v.disclaimers ?? [],
  };
};

const claimsFromBe = (p: BEProduct): ProductClaim[] =>
  (p.certifications ?? [])
    .filter(c => !!c.name)
    .map(c => {
      const proof = (c.url || c.description || '').trim();
      return { t: c.name, proof, ok: !!proof };
    });

/** Labels the catalogue uses for a list price, accent- and case-folded. */
const PRICE_LABELS = new Set([
  'gia',
  'gia niem yet',
  'gia ban',
  'gia le',
  'don gia',
  'price',
  'list price',
  'retail price',
  'msrp',
]);

/** "Giá niêm yết" → "gia niem yet", so one label list covers both locales. */
const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase()
    .trim();

/** A money-shaped value: a currency mark somewhere near a digit. */
const MONEY = /[$€£¥₫]|\b(?:VND|USD|CAD|EUR|GBP|JPY|AUD)\b/i;

/**
 * The BE `Product` row has no price column, so a catalogue price arrives as one
 * more `features[]` entry — `{ label: 'Giá niêm yết', description: '$1,539.95
 * CAD' }`. Label match first so a feature that merely mentions money is not
 * mistaken for the price; the shape test only catches rows whose label this
 * module has not seen.
 *
 * The string is returned exactly as it is on file. Per the module header,
 * nothing here is invented — and a currency symbol is something to invent.
 */
export const priceTextFromBe = (p: BEProduct): string | undefined => {
  const rows = (p.features ?? []).filter(f => f.description?.trim());
  const hit =
    rows.find(f => PRICE_LABELS.has(fold(f.label ?? ''))) ??
    rows.find(f => MONEY.test(f.description) && /\d/.test(f.description));
  return hit?.description.trim();
};

export type MapProductContext = {
  brandName?: string;
  typeName?: string;
  /** Server clock, passed in once so every row shares one reference point. */
  now: number;
};

export const mapBeProductToPortal = (
  p: BEProduct,
  ctx: MapProductContext
): Product => ({
  id: p.id,
  handle: p.slug || slugifyHandle(p.name),
  title: p.name,
  body: p.description ?? '',
  // `p.brand_name`/`p.type`/`p.category` are the product's OWN free-text
  // fields — what the Organization panel edits and `toBeProduct.ts` writes
  // back (`brand_name`, `type`, distinct from the `brand_id`/`category_id`
  // relations). Reading `ctx.brandName`/`ctx.typeName` here instead (a
  // catalog-load-time lookup BY id, only ever populated for the list fetch —
  // every other caller of this mapper passes `{now}` alone) meant a save
  // always came back through this same function and had its own edit
  // overwritten with the empty ctx fallback. `ctx` stays as the fallback for
  // a product whose `brand_id`/`category_id` is linked but has no free-text
  // label typed in yet.
  brand: p.brand_name ?? ctx.brandName ?? '',
  type: p.type ?? ctx.typeName ?? '',
  categoryId: p.category_id ?? null,
  category: p.category ?? '',
  tags: p.template_tags ?? [],
  /* Both unions are `active | draft | archived` — no translation needed. */
  status: p.status ?? 'draft',
  /* `source` là cột thật từ migration 000057 (manual|shopify|csv) — connector
   * sync và CSV import ghi nó; hàng cũ/thiếu quy về manual. */
  source: p.source ?? 'manual',
  updated: relativeUpdated(p.updated_at ?? p.created_at, ctx.now),
  // Id THẬT trước: `cover_media_id` là thứ BE lưu và `core.AutoSlots` chấm.
  // Chỉ khi không có mới lùi về id tổng hợp, để lưới còn thứ gì đó mà vẽ từ
  // `thumbnail_url` — nhưng id đó KHÔNG được gửi ngược lên (xem toBeProduct).
  cover: p.cover_media_id ?? (p.thumbnail_url ? coverAssetId(p.id) : null),
  grad: gradientForId(p.id),
  priceText: priceTextFromBe(p),
  channels: p.channels ?? [],
  // `p.options` là nguồn v2 (`toBeProduct.ts` ghi ngược từ đây); `p.sizes` chỉ
  // còn là fallback cho sản phẩm chưa có `options` v2 nào trên BE.
  options: p.options?.length
    ? p.options.map(o => ({ name: o.name, values: o.values }))
    : p.sizes?.length
      ? [{ name: 'Size', values: p.sizes }]
      : [],
  variants: variantsFromBe(p),
  value: valueFromBe(p),
  seo: {
    title: p.seo?.title ?? '',
    desc: p.seo?.description ?? '',
  },
});

/* `p.ingredients` and `p.colors` are deliberately unmapped: this module has no
 * ingredient list, and its `options` are size-shaped. Both surface once the
 * Product modal grows the fields — mapping them into a lookalike slot now would
 * put them where nobody can edit them back. */
