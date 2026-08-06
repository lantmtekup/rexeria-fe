/**
 * Experience wire shapes (spec §4.2) — the v2 unified library object: one shape
 * over templates (`kind: 'template'`), page copies (`'copy'`) and blocks
 * (`'block'`). Mirrors `be-ReXeR.ai/internal/domain/models/experience.go`.
 *
 * Lives here (not in `exchange.ts`) because it is its own domain — `/v1/experiences/*`
 * is a separate v2 surface. Exchange only borrows it as the return type of
 * `POST /v1/exchange/items/{itemId}/add`.
 *
 * Convention: snake_case wire shapes, `*T` → `T | null`, `omitempty` → optional.
 */

export type RxExperienceKind = 'template' | 'copy' | 'block';

export interface RxExperienceSubject {
  kind: 'product' | 'topic';
  product_id?: string;
  name: string;
}

export interface RxExperience {
  id: string;
  kind: RxExperienceKind;
  name: string;
  /** `collection` | `blocks`. */
  category: string;
  vehicle: string | null;
  objective: string | null;
  role: string | null;
  interactions: string[];
  is_template: boolean;
  origin_id: string | null;
  campaign_id: string | null;
  item_id: string | null;
  subject: RxExperienceSubject | null;
  proven: boolean;
  from_automation: boolean;
  auto_gaps: unknown[];
  tagline: string | null;
  summary: string | null;
  thumbnail_url: string | null;
  /**
   * Omitted (not 0) for `kind: 'block'` — a block owns no canvas, so coverage
   * was never measurable. Absence is a claim about measurability, not a zero.
   */
  signal_coverage?: number | null;
  funnel_coverage?: string[];
  status: string;
  updated_at: string;
  /** `high|directional|early|unmeasured`; omitted on create/detail surfaces. */
  ev?: string;
  /** Only populated by `POST /v1/experiences`. */
  edit_url?: string;
}

/** `{ items, total }` list envelope (spec §2/§4.2). */
export interface RxExperienceListResponse {
  items: RxExperience[];
  total: number;
}

/** `POST /v1/experiences/{id}/promote` — `name` bắt buộc (BE validate min=1). */
export type RxPromoteExperienceRequest = {
  name: string;
  template_code?: string;
};
