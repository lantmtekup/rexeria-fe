import {
  mapBeProductToPortal,
  productAssetsFromBe,
} from '@/lib/portal-v2/product/mapProduct';
import type { Product, ProductAsset } from '@/lib/portal-v2/product/types';
import { rexerApi } from '@/services/rexer/endpoints';

export type ProductCatalogQuery = {
  /** Free-text search — forwarded to the products API as `q`. */
  q?: string;
};

export type ProductCatalogResult = {
  products: Product[];
  /** Synthesised cover assets — a product's media is every asset homed to it. */
  assets: ProductAsset[];
  /** Filter options built from what the catalogue actually contains. */
  brands: string[];
  types: string[];
  /** Server-side total, so the UI can say when the page is truncated. */
  total: number;
  /** Hard failure — the product list itself did not load. */
  error: string | null;
  /** The list loaded but a lookup did not: rows show with a blank brand/type. */
  softError: string | null;
};

const PAGE_LIMIT = 50;
const LOOKUP_LIMIT = 100;

const reasonMessage = (reason: unknown, fallback: string): string =>
  reason instanceof Error ? reason.message : fallback;

/**
 * One page of the catalogue plus the two lookups that turn ids into labels:
 * - Products   ← GET /products?is_template=false&limit=50&q=
 * - Brands     ← GET /brands?limit=100
 * - Categories ← GET /product-categories?limit=100
 *
 * `is_template: false` matters — template rows live in the same table and would
 * otherwise show up as products.
 *
 * The lookups are soft: a failed brand list must not cost the user their
 * catalogue, so it degrades to an empty label rather than an error page. Same
 * `Promise.allSettled` split as `exchangeCatalog.ts`.
 */
export const fetchProductCatalog = async (
  query: ProductCatalogQuery = {}
): Promise<ProductCatalogResult> => {
  const q = query.q?.trim() || undefined;

  const [productsResult, brandsResult, categoriesResult] =
    await Promise.allSettled([
      rexerApi.products.list({
        is_template: false,
        page: 1,
        limit: PAGE_LIMIT,
        sort: '-created_at',
        ...(q ? { q } : {}),
      }),
      rexerApi.brands.list({ limit: LOOKUP_LIMIT }),
      rexerApi.productCategories.list({ limit: LOOKUP_LIMIT }),
    ]);

  const empty: ProductCatalogResult = {
    products: [],
    assets: [],
    brands: [],
    types: [],
    total: 0,
    error: null,
    softError: null,
  };

  if (productsResult.status === 'rejected') {
    return {
      ...empty,
      error: reasonMessage(productsResult.reason, 'Failed to load products'),
    };
  }

  const softErrors: string[] = [];

  const brandName = new Map<string, string>();
  if (brandsResult.status === 'fulfilled') {
    for (const b of brandsResult.value.items ?? []) {
      if (b.id && b.name) brandName.set(b.id, b.name);
    }
  } else {
    softErrors.push(
      reasonMessage(brandsResult.reason, 'Failed to load brands')
    );
  }

  const categoryName = new Map<string, string>();
  if (categoriesResult.status === 'fulfilled') {
    for (const c of categoriesResult.value.items ?? []) {
      if (c.id && c.name) categoryName.set(c.id, c.name);
    }
  } else {
    softErrors.push(
      reasonMessage(
        categoriesResult.reason,
        'Failed to load product categories'
      )
    );
  }

  const items = productsResult.value.items ?? [];
  /* One clock for the whole page so two rows saved a second apart don't read as
   * different ages, and so nothing is recomputed during hydration. */
  const now = Date.now();

  const products = items.map(p =>
    mapBeProductToPortal(p, {
      brandName: p.brand_id ? brandName.get(p.brand_id) : undefined,
      typeName: p.category_id ? categoryName.get(p.category_id) : undefined,
      now,
    })
  );

  /* Filter options come from the loaded rows, not the full taxonomy — an option
   * that matches nothing is a dead end in the toolbar. */
  const unique = (values: string[]) =>
    [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

  return {
    products,
    assets: productAssetsFromBe(items),
    brands: unique(products.map(p => p.brand)),
    types: unique(products.map(p => p.type)),
    total: productsResult.value.total ?? products.length,
    error: null,
    softError: softErrors.length ? softErrors.join(' · ') : null,
  };
};
