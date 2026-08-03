/**
 * v2 BE endpoints, grouped by domain — the Portal V2 counterpart of
 * `src/services/rexer/endpoints.ts`.
 *
 * Everything here goes through `rxV2()`, which targets the v2 deployment
 * (`NEXT_PUBLIC_REXER_API_V2`). Paths are still `/v1/...` upstream: the BE has
 * no `/v2` route prefix, the two services differ by host only.
 *
 * Opt-in — importing `rexerApi` (v1) elsewhere is unaffected. Only add a
 * namespace here when the endpoint exists ONLY on v2, or when a Portal V2
 * surface deliberately wants the v2 deployment.
 *
 * Types live one file per domain under `./types/` (mirroring `src/types/`), so
 * this stays readable instead of growing into another 3k-line `types.ts`. Add a
 * new domain = a new `./types/<domain>.ts` + a new namespace below.
 */
import { rxV2 } from '@/services/rexer/client';

import type {
  RxCreateExchangeListingRequest,
  RxExchangeItemDetail,
  RxExchangeListQuery,
  RxExchangeListResponse,
  RxExchangeListing,
} from './types/exchange';
import type { RxExperience } from './types/experience';

export const rexerV2Api = {
  // ── Exchange (spec §15) — v2-only, absent from the v1 deployment ────────
  exchange: {
    /**
     * `GET /v1/exchange/items` — only `status: 'listed'` rows, cross-tenant.
     * Facets are applied server-side; response is `{ items, total }`.
     */
    list: (query: RxExchangeListQuery = {}) =>
      rxV2<RxExchangeListResponse>('/exchange/items', { query }),

    /**
     * `GET /v1/exchange/items/{itemId}` — adds `layers` descriptors plus
     * `features`/`benefits`. Carries no source ids and no slug by design.
     * 404 `ERR_EXCHANGE_LISTING_NOT_FOUND` when missing/delisted.
     */
    get: (itemId: string) =>
      rxV2<RxExchangeItemDetail>(`/exchange/items/${itemId}`),

    /**
     * `POST /v1/exchange/items` — publish a template/block you own. Exactly one
     * of `source_template_id` / `source_block_id`, else 400
     * `EXCHANGE_INVALID_SOURCE`. 201 → the raw listing row.
     */
    create: (body: RxCreateExchangeListingRequest) =>
      rxV2<RxExchangeListing>('/exchange/items', { method: 'POST', body }),

    /**
     * `POST /v1/exchange/items/{itemId}/add` — free items only
     * (`price_cents === 0`); forks the source into the caller's own brand and
     * returns the new Experience. Cross-tenant by design: the fork never lands
     * in the author's brand. 400 if the item is premium.
     */
    add: (itemId: string) =>
      rxV2<RxExperience>(`/exchange/items/${itemId}/add`, { method: 'POST' }),

    /**
     * `POST /v1/exchange/items/{itemId}/purchase`.
     *
     * NEVER succeeds today, on purpose — the capability gate runs first
     * (403 `CAPABILITY_REQUIRED` without `exchange_buy`, e.g. the `freelance`
     * archetype), and once it passes the BE returns **501** because the payment
     * flow is a later phase. Callers must handle 403 and 501 distinctly:
     * 403 = "not allowed", 501 = "not shipped yet".
     */
    purchase: (itemId: string) =>
      rxV2<void>(`/exchange/items/${itemId}/purchase`, { method: 'POST' }),

    /**
     * `DELETE /v1/exchange/items/{itemId}` — author or platform admin only
     * (403 otherwise). 204 no body → resolves to `null`.
     */
    delist: (itemId: string) =>
      rxV2<null>(`/exchange/items/${itemId}`, { method: 'DELETE' }),
  },
};
