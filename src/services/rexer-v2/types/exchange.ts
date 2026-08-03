/**
 * Exchange marketplace wire shapes (spec §15) — `/v1/exchange/*` on the v2 BE.
 * Mirrors `be-ReXeR.ai/internal/domain/models/exchange.go`.
 *
 * Convention (same as `src/services/rexer/types.ts`): snake_case, exactly what
 * the BE serializes. Nullability follows the Go pointers literally — `*T` →
 * `T | null`. A `null` here is meaningful under the BE's "evidence or silence"
 * rule (§1.3): it means "not measurable / below the k-anonymity floor", NOT
 * zero. Never coerce it to 0.
 *
 * Source of truth is `be-ReXeR.ai/docs/openapi.yaml` — per that repo's
 * CLAUDE.md it wins over the swaggo-generated `/swagger/doc.json`.
 */

/** `experience` covers templates + page copies; `block` is a single block. */
export type RxExchangeKind = 'experience' | 'block';

export type RxExchangeListingStatus = 'draft' | 'listed' | 'delisted';

/**
 * Aggregate-only evidence derived from ReXeR Graph (§18). The whole object is
 * `null` below the k-anonymity floor or when the source has no
 * `graph_design_stats` row yet — and blocks always get `null` (no graph design
 * id). `lift` is independently nullable.
 */
export interface RxExchangeEvidence {
  lift: number | null;
  confidence_tier: string;
  coverage_brands: number;
}

/** Card preview, read from the source's taxonomy fields — never config. */
export interface RxExchangePreview {
  tagline: string;
  summary: string;
  thumbnail_url: string;
}

/** One row of `GET /v1/exchange/items`. */
export interface RxExchangeItem {
  id: string;
  kind: RxExchangeKind;
  title: string;
  author: string;
  /** Cents. `0` = free (only free items can be added without purchase). */
  price_cents: number;
  featured: boolean;
  badge: string | null;
  /** Free-form on the wire — do not assume the FE's closed objective union. */
  objective: string | null;
  roles: string[];
  evidence: RxExchangeEvidence | null;
  preview: RxExchangePreview;
}

export interface RxExchangeListResponse {
  items: RxExchangeItem[];
  total: number;
}

/** Layer descriptor only — the detail endpoint never returns full config. */
export interface RxExchangeLayerDescriptor {
  key: string;
  type_code: string;
  role: string;
}

/**
 * `GET /v1/exchange/items/{itemId}`.
 *
 * Note: deliberately carries NO source ids and no page slug — the Exchange
 * contract exposes descriptors only. Anything needing to render the real
 * template/block (iframe preview, block preview) cannot be driven from here.
 */
export interface RxExchangeItemDetail extends RxExchangeItem {
  layers: RxExchangeLayerDescriptor[];
  /** BE `JSONList` = `[]any`. Narrow at the call site. */
  features: unknown[];
  benefits: unknown[];
}

/** Raw listing row, returned by `POST /v1/exchange/items`. */
export interface RxExchangeListing {
  id: string;
  source_template_id: string | null;
  source_block_id: string | null;
  author_brand_id: string;
  title: string;
  price_cents: number;
  featured: boolean;
  badge: string | null;
  status: RxExchangeListingStatus;
  created_at: string;
  updated_at: string;
}

/**
 * `POST /v1/exchange/items`. Exactly one of `source_template_id` /
 * `source_block_id` is required — enforced by both a DB CHECK and an
 * app-layer 400 (`EXCHANGE_INVALID_SOURCE`).
 */
export interface RxCreateExchangeListingRequest {
  source_template_id?: string;
  source_block_id?: string;
  title: string;
  /** Cents, min 0. */
  price_cents: number;
}

/**
 * Facets for `GET /v1/exchange/items`. All optional.
 *
 * Declared as a `type`, not an `interface`, so it keeps TS's implicit index
 * signature and stays assignable to `RxFetchOptions['query']`
 * (`Record<string, string | number | boolean | null | undefined>`).
 */
export type RxExchangeListQuery = {
  kind?: 'all' | 'experiences' | 'blocks';
  objective?: string;
  price?: 'free' | 'premium';
  /** `true` = featured only. */
  featured?: boolean;
  q?: string;
  /** Default 1. */
  page?: number;
  /** Default 20. */
  page_size?: number;
};
