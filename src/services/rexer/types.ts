/**
 * Hand-picked TS types mirroring the REXER Backend API 1.0 Swagger schema.
 * Only includes the fields currently consumed by the UI; expand as needed.
 */

import type {
  DataCollection,
  DataCollectionRecord,
} from '@/types/dataCollection';

// ── Core auth ────────────────────────────────────────────────────────────
export interface RxUser {
  id: string;
  email: string;
  display_name: string;
  principal_type: string;
  /**
   * FE-facing role per BE Swagger: `'admin' | 'staff' | 'client_user'`.
   * Backfilled from `principal_type` by BE migration 000108.
   */
  role?: string;
  status: string;
  avatar_url?: string;
  ai_quota_hard_limit?: boolean;
  has_migrated_saved_blocks?: boolean;
  /** Active workspace for client_user — used to scope portal data. */
  active_workspace_id?: string;
  created_at: string;
  updated_at: string;
}

export interface RxSession {
  id: string;
  expires_at: string;
  last_seen_at: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  company_name?: string;
}

export interface LoginResponse {
  user: RxUser;
  session: RxSession;
  /**
   * Brand (tenant) user thuộc về — nil cho admin/staff không scope tenant.
   * Cutover 2026-06-03 (migration 000143): key đổi từ `client` → `brand`;
   * `brand.id` == legacy `client.id`. (be-fe-handoff-2026-06-03 §1)
   */
  brand?: Brand;
}

export interface RegisterResponse {
  user: RxUser;
  session: RxSession;
  /** Brand — nil cho admin/staff. Renamed từ `client` (cutover 000143). */
  brand?: Brand;
}

export interface AuthMeResponse {
  user: RxUser;
  session: RxSession;
  /** Brand — nil cho admin/staff. Lets sidebar render brand name. Renamed
   *  từ `client` (cutover 000143). */
  brand?: Brand;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}
/**
 * MVP-only: BE returns the reset_token directly because there is no SMTP
 * provider yet. In production this should be delivered by email and the
 * response shrunk to a `{ message }` envelope.
 */
export interface ForgotPasswordResponse {
  reset_token: string;
  expires_at: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

// ── Firebase Auth login ──────────────────────────────────────────────────
/**
 * FE flow: `signInWithPopup(googleProvider)` → user.getIdToken() → POST here.
 * BE verifies the Firebase ID token via Firebase Admin SDK, upserts the
 * user, and issues a session cookie. See `docs/be-alpha-spec.md` §B.3.
 */
export interface FirebaseLoginRequest {
  id_token: string;
  /** Analytics-only — BE upserts regardless. */
  intent?: 'signin' | 'signup';
  /** Optional — relative same-origin path FE wants to land on after login. */
  redirect_after?: string;
}

export interface FirebaseLoginResponse {
  user: RxUser;
  session: RxSession;
  /** Present when BE auto-creates an empty brand for the new user. Renamed
   *  từ `client` (cutover 000143). */
  brand?: Brand;
  is_new_user: boolean;
  /** True when BE linked Firebase identity to an existing same-email user. */
  linked: boolean;
  redirect_after?: string;
}

// ── Feedback (Alpha) ─────────────────────────────────────────────────────
export type FeedbackCategory =
  | 'bug'
  | 'improvement'
  | 'question'
  | 'praise'
  | 'other';
export type FeedbackSeverity = 'low' | 'medium' | 'high' | 'critical';
export type FeedbackStatus =
  | 'new'
  | 'triaged'
  | 'in_progress'
  | 'resolved'
  | 'wontfix';

export interface Feedback {
  id: string;
  user_id: string;
  client_id?: string;
  category: FeedbackCategory;
  severity?: FeedbackSeverity;
  title?: string;
  message: string;
  rating?: number;
  page_url: string;
  user_agent: string;
  app_version?: string;
  screenshot_id?: string;
  meta?: Record<string, unknown>;
  status: FeedbackStatus;
  /** Admin-only — only present in admin endpoints. */
  internal_note?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFeedbackRequest {
  category: FeedbackCategory;
  severity?: FeedbackSeverity;
  title?: string;
  message: string;
  rating?: number;
  page_url: string;
  user_agent: string;
  app_version?: string;
  screenshot_id?: string;
  meta?: Record<string, unknown>;
}

export interface UpdateFeedbackRequest {
  status?: FeedbackStatus;
  internal_note?: string;
}

export interface FeedbackResponse {
  feedback: Feedback;
}

export interface FeedbackListResponse {
  items: Feedback[];
  page: number;
  limit: number;
  total: number;
}

export interface AdminFeedbackQuery {
  status?: FeedbackStatus;
  category?: FeedbackCategory;
  severity?: FeedbackSeverity;
  q?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

// ── AI Usage (Alpha) ─────────────────────────────────────────────────────
export type AIUsageFeature =
  | 'product_enrich'
  | 'template_suggest'
  | 'landing_draft'
  | 'landing_optimize'
  | 'media_suggest'
  | 'campaign_plan'
  | 'block_content'
  | 'canvas_apply_product';
export type AIUsageProvider = 'anthropic' | 'openai' | 'google' | 'local';
export type AIUsageStatus = 'success' | 'error' | 'timeout';

export interface AIUsage {
  id: string;
  user_id: string;
  client_id?: string;
  request_id: string;
  feature: AIUsageFeature;
  model: string;
  provider: AIUsageProvider;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cached_tokens?: number;
  cost_usd: number;
  latency_ms?: number;
  status: AIUsageStatus;
  error_code?: string;
  meta?: Record<string, unknown>;
  created_at: string;
}

export interface AIUsageSummary {
  total_requests: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cached_tokens: number;
  cost_usd: number;
  first_at?: string;
  last_at?: string;
}

export interface AIUsageBucket {
  bucket: string;
  requests: number;
  prompt_tokens: number;
  completion_tokens: number;
  cost_usd: number;
}

export interface AIUsageFeatureRow {
  feature: AIUsageFeature;
  requests: number;
  total_tokens: number;
  cost_usd: number;
}

export interface AIUsageModelRow {
  model: string;
  requests: number;
  cost_usd: number;
}

export interface AIUsageUserRow {
  user_id: string;
  user_email?: string;
  requests: number;
  total_tokens: number;
  cost_usd: number;
}

export interface AIUsageClientRow {
  client_id: string;
  client_name?: string;
  requests: number;
  total_tokens: number;
  cost_usd: number;
}

export interface AIUsageSummaryResponse {
  summary: AIUsageSummary;
  series: AIUsageBucket[];
  top_features: AIUsageFeatureRow[];
  top_models?: AIUsageModelRow[];
}

export interface AIUsageGlobalResponse extends AIUsageSummaryResponse {
  top_users: AIUsageUserRow[];
  top_clients: AIUsageClientRow[];
}

export interface AIUsageListResponse {
  items: AIUsage[];
  page: number;
  limit: number;
  total: number;
}

export interface AIUsageQuery {
  from?: string;
  to?: string;
  group_by?: 'day' | 'week' | 'feature' | 'model' | 'provider';
  status?: AIUsageStatus;
  user_id?: string;
  client_id?: string;
  feature?: AIUsageFeature;
  model?: string;
  provider?: AIUsageProvider;
}

export interface AIUsageListQuery extends AIUsageQuery {
  page?: number;
  limit?: number;
  sort?: string;
}

// ── Dashboard ────────────────────────────────────────────────────────────
export interface DashboardSummary {
  active_clients: number;
  projects_total: number;
  published_projects: number;
  page_views: number;
  cta_clicks: number;
  conversions: number;
  ctr: number;
}

// ── Template ─────────────────────────────────────────────────────────────
/**
 * BE returns `author` as a User object on `/v1/templates` even though the
 * earlier swagger marked it `string`. Keep the union so older payloads
 * still type-check; FE renders via `formatAuthor()` to pick `display_name`
 * → `email` → `id`.
 */
export interface TemplateAuthor {
  id?: string;
  email?: string;
  display_name?: string;
  role?: string;
  avatar_url?: string;
}

export interface Template {
  id: string;
  code: string;
  name: string;
  description: string;
  status: string; // 'draft' | 'active' | 'archived'
  preview_mode: string; // 'static' | 'rendered' | 'live_stub'
  current_version_id: string;
  thumbnail_url?: string;
  category?: string;
  tags?: string[];
  /** Spec §4.3.1 discriminator (mig 132). 'landing' | 'ad' | 'curate' | 'email'. */
  target_page_type?: string;
  /** Mutable autosave buffer (BE ship 2026-05-30). Editor PATCH this on
   *  every debounced save; doesn't create a new version. Commit to immutable
   *  version via `POST /templates/:id/versions`. */
  draft_canvas_blueprint?: Record<string, unknown>;
  author?: string | TemplateAuthor;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  thumbnail_url?: string;
  preview_mode?: 'static' | 'rendered' | 'live_stub';
  status?: 'draft' | 'active' | 'archived';
}

export interface CreateTemplateVersionRequest {
  version: string; // required, e.g. "1.0.1"
  schema_version: string; // required
  field_schema_json: Record<string, unknown>; // required
  default_config_json: Record<string, unknown>; // required
  canvas_blueprint?: Record<string, unknown>;
  preview_descriptor_json?: Record<string, unknown>;
  renderer_key?: string;
  thumbnail_url?: string;
  change_note?: string;
}

export interface CreateTemplateRequest {
  code: string; // required, maxLength 100
  name: string; // required, maxLength 255
  preview_mode: 'static' | 'rendered' | 'live_stub'; // required
  status?: 'draft' | 'active' | 'archived';
  description?: string;
  category?: string; // maxLength 64
  tags?: string[];
  thumbnail_url?: string; // maxLength 512
}

export interface TemplateListResponse {
  items: Template[];
  page?: number;
  limit?: number;
  total?: number;
  total_pages?: number;
}

export interface TemplateVersion {
  id: string;
  template_id: string;
  version: string;
  /** Monotonic integer assigned by BE on commit — use this for "what's the
   *  HEAD version" sort instead of parsing the semver `version` string. */
  version_no?: number;
  schema_version: string;
  renderer_key?: string;
  change_note?: string;
  field_schema_json?: Record<string, unknown>;
  /** Spec §5.1 — canonical slot schema (mig 132). */
  slot_schema?: Record<string, unknown>;
  /** Spec §5.3 — canonical block tree (mig 132). `{ blocks: [], ... }`. */
  canvas_blueprint?: Record<string, unknown>;
  default_config_json?: Record<string, unknown>;
  preview_descriptor_json?: Record<string, unknown>;
  thumbnail_url?: string;
  created_at: string;
}
export interface TemplateResponse {
  template: Template;
  current_version?: TemplateVersion;
}
export interface TemplateVersionListResponse {
  items: TemplateVersion[];
}
export interface TemplateVersionResponse {
  template_version: TemplateVersion;
}
export interface TemplatePreviewResponse {
  template_id: string;
  version_id: string;
  mode: string;
  preview_url?: string;
  preview_html?: string;
  preview_descriptor_json?: Record<string, unknown>;
}

// ── Project (removed) ────────────────────────────────────────────────────
// `/v1/projects` namespace deprecated — system standardized on canvas-
// template based landings. SummaryMetrics kept because it's still used by
// other analytics responses.

export interface SummaryMetrics {
  page_views: number;
  cta_clicks: number;
  conversions: number;
  ctr: number;
}

// ── Client ───────────────────────────────────────────────────────────────
export interface Client {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
}
export interface ClientListResponse {
  items: Client[];
}
export interface ClientResponse {
  client: Client;
}
export interface CreateClientRequest {
  name: string;
  status?: 'active' | 'inactive';
}
export type UpdateClientRequest = Partial<CreateClientRequest>;

export interface ClientUser {
  id: string;
  client_id: string;
  email: string;
  display_name: string;
  status: string;
  created_at: string;
  updated_at: string;
}
export interface ClientUserListResponse {
  items: ClientUser[];
}
export interface ClientUserResponse {
  user: ClientUser;
}
export interface CreateClientUserRequest {
  email: string;
  display_name: string;
  password?: string;
}
export interface CreateClientUserResponse {
  user: ClientUser;
  generated_password?: string;
}
export interface UpdateClientUserRequest {
  display_name?: string;
  status?: 'active' | 'disabled';
}

// Access grants + client portal project read-only types removed alongside
// `/v1/projects` — both belonged to the project-based flow.

// ── Media ────────────────────────────────────────────────────────────────
export interface MediaAsset {
  id: string;
  project_id: string | null;
  owner_scope: string;
  original_filename: string;
  media_type: 'image' | 'video' | '3d' | string;
  mime_type: string;
  status: string;
  file_size: number;
  width?: number;
  height?: number;
  duration_ms?: number;
  storage_key: string;
  /**
   * Public CDN URL for the asset. Added by BE 2026-05 (resolves GAP-17).
   * Use this for `<img src>`. Falls back undefined for legacy assets.
   */
  public_url?: string;
  tags?: string[];
  checksum?: string;
  created_at: string;
  created_by: string;
}
export interface MediaListResponse {
  items: MediaAsset[];
}

export interface MediaVariant {
  id: string;
  media_asset_id: string;
  variant_type: string;
  storage_key: string;
  metadata_json?: Record<string, unknown> | null;
  created_at: string;
}
export interface MediaAssetResponse {
  media_asset: MediaAsset;
  variants?: MediaVariant[];
}

// ── Release / Publish / Project config (removed) ─────────────────────────
// Project lifecycle types removed alongside `/v1/projects` namespace.
// Landings now publish through canvas_data.publish (see canvas-template
// types + flow).

// ── Media bind / upload ──────────────────────────────────────────────────
export interface InitUploadRequest {
  filename: string;
  mime_type: string;
  file_size: number;
  owner_scope: 'library';
  media_type?: 'image' | 'video' | 'file';
}
export interface InitUploadResponse {
  upload_id: string;
  presigned_url?: string;
  storage_key?: string;
  expires_at?: string;
}
export interface CompleteUploadRequest {
  upload_id: string;
  checksum?: string;
}
export interface CompleteUploadResponse {
  media_asset: MediaAsset;
}

// BindMediaItem/Request/Response + ProjectMediaBinding removed — those
// only existed for `POST /v1/projects/{id}/media/bind`. Product bindings
// use `BindProductMediaItem` + `ProductMediaBinding` instead.

// ── Analytics ────────────────────────────────────────────────────────────
export interface AnalyticsDailyPoint {
  date: string;
  page_views: number;
  cta_clicks: number;
  conversions: number;
  ctr: number;
}

// ── Template Analytics (admin, per spec be-template-analytics) ───────────
export interface TemplateAnalyticsSummaryRow {
  template_id: string;
  template_title: string | null;
  views: number;
  unique_visitors: number;
  blocks_viewed: number;
  total_clicks: number;
}

export interface TargetStat {
  target: string;
  count: number;
}

export interface ActionStat {
  action: string;
  count: number;
  unique_visitors: number;
  targets: TargetStat[];
}

export interface FunnelStep {
  name: string;
  label: string;
  count: number;
  drop_off_pct: number;
}

export interface SlideStat {
  index: number;
  label: string;
  views: number;
  clicks: number;
  avg_dwell_ms: number;
}

export interface ImageStat {
  index: number;
  src: string;
  clicks: number;
  zooms: number;
}

export interface BlockBreakdownRow {
  block_id: string;
  block_type: string | null;
  views: number;
  clicks: number;
  unique_viewers: number;
  avg_dwell_ms: number | null;
  total_dwell_ms: number | null;
  top_action: string | null;
  top_target: string | null;
  actions: ActionStat[];
  funnel?: FunnelStep[] | null;
  slides?: SlideStat[] | null;
  images?: ImageStat[] | null;
  /**
   * Daily view counts within the requested range (oldest → newest). BE
   * field gated by be-todo.md P1.7. When missing, FE renders mock data so
   * the per-block sparkline grid still shows shape but flags fake source.
   */
  views_by_day?: number[];
}

export interface AnalyticsEventInput {
  template_id: string;
  block_id?: string;
  element_id?: string;
  element_role?: string;
  visitor_id: string;
  session_id: string;
  event_type: string;
  action?: string;
  target?: string;
  dwell_ms?: number;
  scroll_depth?: number;
  viewport_w?: number;
  viewport_h?: number;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  meta?: Record<string, unknown>;
}
// ProjectAnalyticsResponse removed — used to back /projects/{id}/analytics.
// Equivalent block-level data lives in BlockBreakdownRow + portal breakdown.

// ── Events / Reports ─────────────────────────────────────────────────────
export interface EventSummaryResponse {
  project_id: string;
  from: string;
  to: string;
  event_counts: Record<string, number>;
}

export interface ReportLink {
  id: string;
  project_id: string;
  type: string;
  title: string;
  url: string;
  generated_at: string;
}
export interface ReportListResponse {
  items: ReportLink[];
}

// ── Product ──────────────────────────────────────────────────────────────
/** BE quirk: timestamps wrapped as `{ "time.Time": "..." }` instead of ISO. */
export interface SimpleDate {
  'time.Time'?: string;
}

export type ProductStatus = 'draft' | 'active' | 'archived';

/**
 * V2 schema fields — see `docs/product-attributes-and-template-spec.md` §3.
 * Backwards compat with V1 (`certifications: string[]`) is handled at FE
 * boundary in `services/rexer/normalizers.ts`.
 */
export interface ProductColor {
  name: string;
  hex: string;
  /** V2: marks the color shown by default on landing pages. Max one per product. */
  is_default?: boolean;
  /** V2: ordering for display (smaller first). Default = array index. */
  sort_order?: number;
}

export interface ProductFeature {
  label: string;
  description: string;
  /**
   * V2: lucide icon name (e.g. "Sparkles", "Shield"). FE renders via the
   * lucide-react map. Mutually exclusive with `media_id` — UI lets the user
   * pick one. When neither set, FE falls back to a default icon.
   */
  icon_name?: string;
  /** V2: alternative — uploaded image as the feature illustration. */
  media_id?: string;
}

export interface ProductCertification {
  name: string;
  /** Logo image (optional). Render falls back to text badge when missing. */
  media_id?: string;
  /** Verify-cert URL (optional). */
  url?: string;
  description?: string;
}

/** Field role for product media bindings. See spec §3.2. */
export type ProductMediaFieldKey =
  | 'hero'
  | 'gallery'
  | 'detail'
  | 'lifestyle'
  | 'feature'
  | 'cert'
  | 'size_chart';

export interface Product {
  id: string;
  name: string;
  slug?: string;
  sku?: string;
  category_id?: string;
  client_id?: string;
  description?: string;
  sizes?: string[];
  colors?: ProductColor[];
  ingredients?: string[];
  /**
   * V2: structured certifications. V1 was `string[]` — FE normalizers wrap
   * legacy values into `{name: <text>}` at load time so the rest of the app
   * sees a uniform shape.
   */
  certifications?: ProductCertification[];
  features?: ProductFeature[];
  status?: ProductStatus;
  /** Public CDN URL for product cover image. Added by BE 2026-05. */
  thumbnail_url?: string;

  // ── Template fields (V2) ────────────────────────────────────────────────
  /** V2: when true, this row is a reusable template (filtered out of normal lists). */
  is_template?: boolean;
  /** V2: free-form category for template browse, e.g. "fmcg" / "fashion" / "f&b". */
  template_category?: string;
  /** V2: free-form tags for template search/filter. */
  template_tags?: string[];
  /** V2: admin-curated library template (visible to all users). Default false. */
  is_public_template?: boolean;
  /** V2: id of the source template if this product was cloned from one. */
  source_template_id?: string;

  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface ProductMediaBinding {
  id: string;
  product_id: string;
  /**
   * Role of this media in the product UI. Loose `string` for forward-compat,
   * but FE narrows to `ProductMediaFieldKey` when reading.
   */
  field_key?: string;
  /** Free-form key (e.g. feature index `feature_0`, cert index `cert_2`). */
  slot_key?: string;
  /** V2: links to `Product.colors[].name` — the color this image represents. */
  color_name?: string;
  /** V2: ordering within the same `(field_key, color_name)` group. Default 0. */
  sort_order?: number;
  media_id: string;
  created_at: string;
}

/**
 * BE wraps each product media binding with its hydrated asset (since 2026-05).
 * No more N+1 `GET /media/{id}` from FE.
 */
export interface ProductMediaWithAsset {
  binding: ProductMediaBinding;
  asset?: MediaAsset;
}

export interface ProductResponse {
  product: Product;
  category?: ProductCategory;
  media?: ProductMediaWithAsset[];
}

export interface ProductListResponse {
  items: Product[];
  page: number;
  limit: number;
  total: number;
}

export interface CreateProductRequest {
  name: string;
  slug?: string;
  sku?: string;
  category_id?: string;
  client_id?: string;
  description?: string;
  sizes?: string[];
  colors?: ProductColor[];
  ingredients?: string[];
  /**
   * V2 wire shape — `ProductCertification[]`. BE may also accept legacy
   * `string[]` during migration window (one sprint per spec §10).
   */
  certifications?: ProductCertification[];
  features?: ProductFeature[];
  status?: ProductStatus;
  thumbnail_url?: string;
  /**
   * V2 shortcut: bind existing media library/project assets in the same
   * round-trip as create. Default `field_key="gallery"`. Use the bind-media
   * endpoint for tagged bindings (color_name, slot_key, etc.).
   */
  media_ids?: string[];
  // ── Template fields (V2) ──
  is_template?: boolean;
  template_category?: string;
  template_tags?: string[];
  /** Admin-gated by BE; non-admin requests setting true return 403. */
  is_public_template?: boolean;
  source_template_id?: string;
}
export type UpdateProductRequest = Partial<CreateProductRequest>;

/** Body for `POST /v1/products/{id}/clone` — creates a copy + media bindings. */
export interface CloneProductRequest {
  /** Override name on the clone. Default: BE appends "(copy)". Max 255 chars. */
  name?: string;
  /**
   * When true, the clone is created with `is_template=true` (use case:
   * "Save current product as my template"). Default false.
   */
  as_template?: boolean;
  /**
   * Promote to library (admin-gated by BE). Returns 403 if non-admin sets
   * this true. Only meaningful when `as_template=true`.
   */
  is_public_template?: boolean;
  /** V2 template metadata applied if `as_template=true`. Max 50 chars. */
  template_category?: string;
  /** Max 10 items. */
  template_tags?: string[];
}

export interface BindProductMediaItem {
  media_id: string;
  field_key?: string;
  slot_key?: string;
  /** V2: link this binding to a `Product.colors[].name`. */
  color_name?: string;
  /** V2: ordering within the same group. */
  sort_order?: number;
}
export interface BindProductMediaRequest {
  items: BindProductMediaItem[];
}
export interface BindProductMediaResponse {
  product_id: string;
  bindings: ProductMediaBinding[];
}

// ── Product Category ─────────────────────────────────────────────────────
export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  features?: ProductFeature[];
  client_id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}
export interface ProductCategoryResponse {
  category: ProductCategory;
}
export interface ProductCategoryListResponse {
  items: ProductCategory[];
  page: number;
  limit: number;
  total: number;
}
export interface CreateProductCategoryRequest {
  name: string;
  description?: string;
  features?: ProductFeature[];
}
export type UpdateProductCategoryRequest =
  Partial<CreateProductCategoryRequest>;

// ── Campaign ─────────────────────────────────────────────────────────────
export type CampaignObjective =
  | 'awareness'
  | 'traffic'
  | 'conversion'
  | 'retention';

export interface CampaignKPI {
  name: string;
  target?: number;
}

export interface Campaign {
  id: string;
  name: string;
  product_id: string;
  client_id?: string;
  // `landing_project_id` removed — project-based landings deprecated. BE
  // may still return this field on legacy rows; ignore on FE.
  objective?: CampaignObjective | string;
  status?: string;
  channels?: string[];
  budget_amount?: number;
  budget_currency?: string;
  start_date?: SimpleDate;
  end_date?: SimpleDate;
  kpis?: CampaignKPI[];
  notes?: string;
  /** Computed at read-time from active release; empty if landing has no live release. */
  tracked_url?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface CampaignResponse {
  campaign: Campaign;
}
export interface CampaignListResponse {
  items: Campaign[];
  page: number;
  limit: number;
  total: number;
}
export interface CreateCampaignRequest {
  name: string;
  product_id: string;
  client_id?: string;
  // `landing_project_id` removed — project-based landings deprecated. BE
  // may still return this field on legacy rows; ignore on FE.
  objective?: CampaignObjective;
  channels?: string[];
  budget_amount?: number;
  budget_currency?: string;
  start_date?: SimpleDate;
  end_date?: SimpleDate;
  kpis?: CampaignKPI[];
  notes?: string;
  /** Lifecycle — defaults to `draft` when omitted. */
  status?: 'draft' | 'active' | 'paused' | 'completed';
}
export type UpdateCampaignRequest = Partial<
  Omit<CreateCampaignRequest, 'product_id'>
>;
export interface CampaignMetrics {
  campaign_id: string;
  utm_campaign?: string;
  tracked_url?: string;
  summary: SummaryMetrics;
}

// ── AI ───────────────────────────────────────────────────────────────────
export interface AIProductEnrichRequest {
  name: string;
  hint?: string;
  category_id?: string;
}
export interface AIProductEnrichResponse {
  description: string;
  features: ProductFeature[];
  suggested_tags: string[];
}

export interface AITemplateSuggestRequest {
  product_id: string;
  goal?: string;
}
export interface AITemplateCandidate {
  template_id: string;
  version_id?: string;
  score: number;
  reason: string;
}
export interface AITemplateSuggestResponse {
  candidates: AITemplateCandidate[];
}

export interface AILandingDraftRequest {
  product_id: string;
  template_version_id: string;
  brief?: string;
}
export interface AICopyBlock {
  section: string;
  heading: string;
  body: string;
  cta?: string;
}
export interface AILandingDraftResponse {
  config_json: Record<string, unknown>;
  copy_blocks: AICopyBlock[];
}

export interface AILandingOptimizeRequest {
  project_id: string;
}
export interface AILandingSuggestion {
  section: string;
  change: string;
  reason: string;
}
export interface AILandingOptimizeResponse {
  suggestions: AILandingSuggestion[];
}

export interface AIMediaSuggestRequest {
  product_id: string;
  section_keys: string[];
}
/** Per-suggestion item — BE 2026-05 shape (was just `string`). */
export interface AIMediaSuggestion {
  media_id: string;
  source?: string;
}
export interface AIMediaSuggestResponse {
  /** Map of `section_key` → list of suggestion items (each carries a media_id). */
  suggestions: Record<string, AIMediaSuggestion[]>;
}

export interface AICampaignPlanRequest {
  product_id: string;
  objective: CampaignObjective;
  budget?: number;
}
export interface AICampaignPlanResponse {
  name: string;
  channels: string[];
  duration_days: number;
  kpis: CampaignKPI[];
}

// ── AI Canvas Apply Product (POST /v1/ai/canvas-templates/{id}/apply-product) ─
// Đặc tả: docs/be-ai-canvas-apply-product-spec.md
export interface AICanvasApplyProductRequest {
  product_id: string;
  lang?: 'vi' | 'en';
  brief?: string;
  preserve_user_overrides?: boolean;
  expected_canvas_etag?: string;
}
export interface AICanvasApplyStats {
  blocks_total: number;
  blocks_rewritten: number;
  blocks_skipped: number;
  fields_rewritten: number;
  image_bindings_replaced: number;
  image_bindings_kept: number;
}
export interface AICanvasApplyProductResponse {
  canvas_data: Record<string, unknown>;
  canvas_etag: string;
  applied: AICanvasApplyStats;
  source: 'ai' | 'stub';
  model: string;
  usage?: AIBlockContentUsage;
  request_id: string;
}

// ── AI Block Content (POST /v1/ai/block-content) ─────────────────────────
// Đặc tả: docs/be-ai-block-content-spec.md
export type AIBlockType =
  | 'hero_split'
  | 'hero_overlay'
  | 'feature_section'
  | 'photo_gallery'
  | 'booking_form'
  | 'cta_section';

export interface AIBlockContentRequest {
  block_type: AIBlockType;
  prompt: string;
  lang?: 'vi' | 'en';
  /**
   * Full current content of the block (in the language being edited).
   * Lets BE prompt: "rewrite this — preserve unrelated fields, focus on
   * `selected_field`". Without it AI generates from scratch.
   */
  current_content?: Record<string, unknown>;
  /**
   * Field key the user is focused on right now (e.g. `title`, `description`,
   * `eyebrow`). When set, AI should prioritise rewriting THIS field while
   * keeping siblings semantically consistent.
   */
  selected_field?: string;
  /** Block display name — extra context for the prompt. */
  block_name?: string;
}

export interface AIBlockContentUsage {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number;
}

export interface AIBlockContentResponse {
  /** Shape varies by block_type — caller casts to the matching content interface. */
  content: Record<string, unknown>;
  source: 'ai' | 'stub';
  model: string;
  usage?: AIBlockContentUsage;
  request_id: string;
}

// ── Canvas Templates (be-canvas-templates-spec.md) ───────────────────────
export interface CanvasTemplate {
  id: string;
  client_id?: string;
  collection_id?: string;
  name: string;
  description?: string;
  width: number;
  height: number;
  thumbnail_url?: string;
  /** Only present on `GET /canvas-templates/{id}/canvas`. Stripped on list/get. */
  canvas_data?: Record<string, unknown>;
  canvas_size_bytes?: number;
  canvas_etag: string;
  engine: string;
  engine_version?: string;
  is_active: boolean;
  is_template: boolean;
  version: number;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}
export interface CanvasTemplateResponse {
  canvas_template: CanvasTemplate;
}
export interface CanvasTemplateListResponse {
  items: CanvasTemplate[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}
export interface CanvasDataResponse {
  canvas_data: Record<string, unknown>;
  canvas_etag: string;
  version: number;
}
/**
 * Public share-link response (`GET /public/canvas-templates/{id}/canvas`).
 * No auth required; BE validates `share_token` query param. Returns 404
 * when canvas is unpublished or token is wrong (avoids enumeration).
 */
export interface PublicCanvasResponse {
  canvas_data: Record<string, unknown>;
  canvas_etag: string;
  name?: string;
  description?: string;
  published_at?: string;
  thumbnail_url?: string;
}
export interface CreateCanvasTemplateRequest {
  name: string;
  description?: string;
  collection_id?: string;
  width: number;
  height: number;
  engine?: string;
  engine_version?: string;
  canvas_data: Record<string, unknown>;
  is_template?: boolean;
}
export interface UpdateCanvasTemplateRequest {
  name?: string;
  description?: string;
  collection_id?: string | null;
  width?: number;
  height?: number;
  engine?: string;
  engine_version?: string;
  canvas_data?: Record<string, unknown>;
  is_template?: boolean;
  is_active?: boolean;
  /** REQUIRED — optimistic lock. */
  version: number;
}

// ── Data Collections (be-collections-spec.md) ────────────────────────────
// Entity + DTO types live in `src/types/dataCollection.ts` (cloned earlier).
// Here we only add BE response envelopes that match the spec exactly.

export interface CollectionResponse {
  collection: DataCollection;
}
export interface CollectionListResponse {
  items: DataCollection[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}
export interface RecordResponse {
  record: DataCollectionRecord;
}
export interface RecordListResponse {
  items: DataCollectionRecord[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// ── AI Templates (Rexer_Cap_nhat_tinh_nang_va_logic.pdf v1.0) ────────────
// User-facing endpoints under /ai/templates/*, admin under /admin/ai/templates/*.
// FE-side draft based on PDF spec §5 + Swagger; some fields may shift once
// BE confirms `docs/be-ai-template-questions.md`.

export type AIBlockRole =
  | 'hero'
  | 'tagline'
  | 'pain'
  | 'solution'
  | 'feature'
  | 'image'
  | 'testimonial'
  | 'price'
  | 'cta'
  | 'faq';

export type AIBlockLayoutType = 'text' | 'image' | 'mixed';

export type AIFieldDataType =
  | 'text'
  | 'number'
  | 'select'
  | 'image'
  | 'textarea';

export type AIBlockTone =
  | 'formal'
  | 'friendly'
  | 'energetic'
  | 'luxury'
  | 'minimal';

/** §5.2 — single field in the template Input Schema. */
export interface AITemplateField {
  field_key: string;
  label: string;
  data_type: AIFieldDataType;
  is_required: boolean;
  ai_can_infer: boolean;
  placeholder?: string;
  /** Block IDs that consume this field. */
  mapped_blocks: string[];
  /**
   * Per BE Q13: option values are a flat `string[]`. FE renders them as
   * `<option value={v}>{v}</option>` (label === value); i18n done at FE.
   */
  options?: string[];
}

/** §5.1 — pure structural block (no prompt). */
export interface AITemplateBlock {
  block_id: string;
  position: number;
  role: AIBlockRole;
  layout_type: AIBlockLayoutType;
}

/**
 * §5.3 — prompt context entity, FK to a block by `block_id`. Per BE Q20
 * the admin payload sends `blocks[]`, `fields[]`, `block_prompts[]` as
 * three separate arrays.
 */
export interface AITemplateBlockPrompt {
  block_id: string;
  prompt_instruction: string;
  required_fields?: string[];
  tone?: AIBlockTone;
  length_constraint?: string;
  examples?: string[];
}

export interface AITemplate {
  id: string;
  name: string;
  description?: string;
  topic?: string;
  is_active: boolean;
  /** Optimistic-lock version — required when PATCHing (Q21). */
  version: number;
  /**
   * Children arrays. BE list response (e.g. `GET /ai/templates`,
   * `/admin/ai/templates`) may omit them for payload-size reasons; detail
   * GET always populates them. Always access via `?? []` to stay safe.
   */
  fields?: AITemplateField[];
  blocks?: AITemplateBlock[];
  /** Only returned to admin GET; user-facing GET strips this (Q5/Q6). */
  block_prompts?: AITemplateBlockPrompt[];
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AITemplateResponse {
  ai_template: AITemplate;
}

export interface AITemplateListResponse {
  items: AITemplate[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// ── Generate ─────────────────────────────────────────────────────────────
/** Per BE Q10/Q11 — regenerate fragment. */
export interface AIRegenerateRequest {
  /** Empty / omitted = regenerate every block reusing prior inferred_context. */
  block_id?: string;
  /** Optional hint for the targeted block, ≤1000 chars. */
  hint?: string;
  /**
   * When true, BE drops the prior `inferred_context` and re-runs Step 3
   * (§8.17 "Suy luận lại"). Note: if `reinfer` is true, BE ignores
   * `block_id` and regenerates the whole template.
   */
  reinfer?: boolean;
}

export interface AITemplateGenerateRequest {
  /**
   * Map `field_key → user input`. Per BE Q11 values can be string |
   * number | boolean; BE coerces to string. Unknown keys → 400.
   */
  user_input: Record<string, string | number | boolean>;
  /** Continue an existing session — required for regenerate. */
  session_id?: string;
  /** Optional. Presence indicates regeneration. */
  regenerate?: AIRegenerateRequest;
  /** Per BE Q11/Q29: `vi` or `en`, default `vi`. */
  lang?: 'vi' | 'en';
}

/**
 * Per BE Q5 — `source` enum is small and block-level.
 * - `ai`      → block content sourced from LLM
 * - `stub`    → fallback deterministic content (LLM failed / parse error)
 * - `skipped` → locked-optional miss; `content === null`, `skipped: true`
 * - `kept`    → in regenerate-one-block mode, the other 9 blocks reuse
 *               the prior version verbatim (remapped from their original
 *               source so the badge stays accurate)
 */
export type AIBlockSource = 'ai' | 'stub' | 'skipped' | 'kept';

/** Per BE Q14 / Q5 — block payload returned by /generate. */
export interface AIGeneratedBlock {
  block_id: string;
  position: number;
  role: AIBlockRole;
  layout_type: AIBlockLayoutType;
  /** Null when `skipped` is true. */
  content: Record<string, unknown> | null;
  /** Media IDs the user picked into this block; resolution by FE via /media. */
  image_media_ids?: string[];
  source: AIBlockSource;
  skipped?: boolean;
}

/** Per BE Q3 — wire shape for the regen-limit 429 details payload. */
export interface AIRegenLimitDetails {
  used: number;
  limit: number;
}

/** Per BE Q2 — wire shape for missing-required details payload. */
export interface AIMissingRequiredDetails {
  missing_fields: string[];
}

export interface AITemplateUsage {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number;
}

export interface AITemplateGenerateResponse {
  session_id: string;
  version: number;
  /** §6.3 — values AI inferred for missing fields, reused across regen. */
  inferred_context: Record<string, unknown>;
  blocks: AIGeneratedBlock[];
  /** Per BE Q17: `{ block_id: media_id[] }` map; FE resolves URLs via media API. */
  image_suggestions: Record<string, string[]>;
  model?: string;
  usage?: AITemplateUsage;
}

// ── Session & versions (§8.19 rollback) ──────────────────────────────────
export type AIGenerationKind = 'initial' | 'regenerate_block' | 'reinfer';

/** Per BE Q14 — full version payload (no inferred_context unless added later). */
export interface AIGenerationVersion {
  version: number;
  kind: AIGenerationKind;
  /** Only set for `kind = "regenerate_block"`. */
  target_block_id?: string;
  blocks: AIGeneratedBlock[];
  image_suggestions: Record<string, string[]>;
  created_at: string;
}

export interface AIGenerationSession {
  session_id: string;
  template_id: string;
  versions: AIGenerationVersion[];
}

export interface AITemplateSessionResponse {
  session: AIGenerationSession;
}

// ── Admin DTOs ───────────────────────────────────────────────────────────
/**
 * Per BE Q20 — admin POST sends fields/blocks/block_prompts as three
 * separate arrays, all required, block_prompts must have len=10.
 */
export interface CreateAITemplateRequest {
  name: string;
  description?: string;
  topic?: string;
  is_active?: boolean;
  fields: AITemplateField[];
  blocks: AITemplateBlock[];
  block_prompts: AITemplateBlockPrompt[];
}

/**
 * Per BE Q21 — top-level fields are partial; children require all 3
 * arrays or none. `version` is required for optimistic lock.
 */
export interface UpdateAITemplateRequest {
  version: number;
  name?: string;
  description?: string;
  topic?: string;
  is_active?: boolean;
  fields?: AITemplateField[];
  blocks?: AITemplateBlock[];
  block_prompts?: AITemplateBlockPrompt[];
}

// ── Error codes (Q4 — full set) ──────────────────────────────────────────
export type AITemplateErrorCode =
  | 'ERR_AI_TEMPLATE_NOT_FOUND'
  | 'ERR_AI_TEMPLATE_INVALID'
  | 'ERR_AI_TEMPLATE_INACTIVE'
  | 'ERR_AI_TEMPLATE_MISSING_REQUIRED'
  | 'ERR_AI_TEMPLATE_SESSION_NOT_FOUND'
  | 'ERR_AI_TEMPLATE_REGEN_LIMIT'
  | 'ERR_CANVAS_VERSION_CONFLICT'
  | 'ERR_FORBIDDEN'
  | 'ERR_AI_PROVIDER_FAILURE'
  | 'ERR_LLM_TIMEOUT'
  | 'ERR_BAD_REQUEST'
  | 'ERR_INTERNAL';

// ── Workspaces (Phase 1 multitenancy — be-workspace-multitenancy-spec) ───
// Cutover 2026-06-03 (migration 000143): object workspace VẪN carry
// `client_id` — đây là field duy nhất cutover cố tình KHÔNG rename sang
// `brand_id` (xác nhận swagger + be-fe-handoff-workspace-pages-2026-06-03 §1).
// Đọc `client_id` như brand id (`client_id` == brand.id). Áp dụng cho cả
// `GET /me/workspaces` lẫn `GET /brands/:id/workspaces`.
export interface Workspace {
  id: string;
  client_id: string;
  name: string;
  slug: string;
  description?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceListResponse {
  items: Workspace[];
}

export interface WorkspaceMembership {
  role: string;
  workspace: Workspace;
}

export interface CreateWorkspaceRequest {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateWorkspaceRequest {
  name?: string;
  description?: string;
}

export interface SwitchWorkspaceRequest {
  workspace_id: string;
}

// ── Media folders (Drive-style hierarchy) ────────────────────────────────
export interface MediaFolder {
  id: string;
  client_id: string;
  workspace_id?: string;
  parent_id?: string;
  name: string;
  description?: string;
  child_count: number;
  file_count: number;
  size_bytes: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface MediaFolderListResponse {
  items: MediaFolder[];
  breadcrumb?: MediaFolder[];
}

export interface CreateMediaFolderRequest {
  name: string;
  description?: string;
  parent_id?: string;
}

export interface UpdateMediaFolderRequest {
  name?: string;
  description?: string;
  parent_id?: string;
}

// ── Template comments (review threads on a landing page) ─────────────────
export interface TemplateComment {
  id: string;
  template_id: string;
  workspace_id: string;
  author_id: string;
  /** Populated by BE for list responses to avoid N+1 fan-out. */
  author_name?: string;
  author_avatar_url?: string;
  author_role?: string;
  parent_id?: string;
  body: string;
  status: string;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateCommentListResponse {
  items: TemplateComment[];
}

export interface CreateTemplateCommentRequest {
  body: string;
  parent_id?: string;
}

export interface UpdateTemplateCommentRequest {
  body?: string;
}

// ── Notifications (in-app bell) ─────────────────────────────────────────
export interface Notification {
  id: string;
  user_id: string;
  workspace_id?: string;
  actor_id?: string;
  kind: string;
  subject_type?: string;
  subject_id?: string;
  meta?: Record<string, unknown>;
  read_at?: string;
  created_at: string;
}

export interface NotificationListResponse {
  items: Notification[];
  page: number;
  limit: number;
  total: number;
  unread_count: number;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export interface MarkReadRequest {
  /** Set true to mark every notification for the caller as read. */
  all?: boolean;
  /** Explicit notification ids to mark — ignored when `all` is true. */
  ids?: string[];
}

// ── Activity feed (per-workspace audit log surfaced to portal) ──────────
export interface ActivityItem {
  id: string;
  workspace_id?: string;
  actor_id: string;
  actor_name?: string;
  kind: string;
  subject_type?: string;
  subject_id?: string;
  title?: string;
  meta?: Record<string, unknown>;
  created_at: string;
}

export interface ActivityFeedResponse {
  items: ActivityItem[];
}

// ── Staff inbox (admin/staff task queue) ────────────────────────────────
export interface StaffInboxItem {
  id: string;
  client_id?: string;
  workspace_id?: string;
  kind: string;
  status: string;
  subject_id?: string;
  assignee_id?: string;
  claimed_at?: string;
  done_at?: string;
  meta?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface StaffInboxListResponse {
  items: StaffInboxItem[];
}

// ── Error envelope ───────────────────────────────────────────────────────
export interface RxErrorBody {
  code: string;
  message: string;
  details?: unknown;
  request_id?: string;
}

// ── Portal (Phase 2 wave — be-missing-apis-portal.md) ─────────────────────

export interface PortalDashboardSummary {
  templates_count: number;
  templates_published: number;
  total_views_30d: number;
  total_visitors_30d: number;
  total_clicks_30d: number;
  total_leads_30d: number;
  assets_count: number;
  open_comments: number;
  unread_notifications: number;
  trend_7d: number[];
}

export interface PortalTemplateAuthor {
  user_id: string;
  name: string;
  role: string;
}

export interface PortalTemplate {
  id: string;
  workspace_id: string;
  name: string;
  thumbnail_url?: string;
  status: string;
  views_30d: number;
  clicks_30d: number;
  leads_30d: number;
  open_comments: number;
  last_publish_at?: string;
  last_updated_by?: PortalTemplateAuthor;
}

export interface PortalTemplateListResponse {
  items: PortalTemplate[];
  page?: number;
  limit?: number;
  total?: number;
}

/**
 * Cross-template aggregated comment thread for the portal "Comments &
 * Requests" page. BE returns `items: null` when no rows — coerce to [] at
 * the consumer layer.
 */
export interface PortalCommentDigestItem extends TemplateComment {
  template_name?: string;
  template_thumbnail_url?: string;
  reply_count?: number;
  last_activity_at?: string;
}

export interface PortalCommentListResponse {
  items: PortalCommentDigestItem[] | null;
  page: number;
  limit: number;
  total: number;
}

// ── Portal me/* (be-todo.md P0.3) ─────────────────────────────────────────

export interface PortalClient {
  id: string;
  name: string;
  legal_name?: string;
  contact_email?: string;
  contact_phone?: string;
  country_code?: string;
  plan?: string;
  status: string;
  member_count?: number;
  storage_used_gb?: number;
  storage_quota_gb?: number;
  logo_url?: string;
  industry?: string;
  slug?: string;
}

export interface UpdatePortalClientRequest {
  name?: string;
  legal_name?: string;
  contact_email?: string;
  contact_phone?: string;
  country_code?: string;
  industry?: string;
  logo_url?: string;
}

export type PortalMemberRole =
  | 'brand_owner'
  | 'brand_member'
  | 'brand_viewer'
  | 'staff';

export interface PortalMember {
  user_id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  role: PortalMemberRole;
  joined_at: string;
  last_seen_at?: string;
}

export interface PortalMemberListResponse {
  items: PortalMember[] | null;
  page?: number;
  limit?: number;
  total?: number;
}

export interface InvitePortalMemberRequest {
  email: string;
  role: PortalMemberRole;
  display_name?: string;
}

export interface UpdatePortalMemberRoleRequest {
  role: PortalMemberRole;
}

export interface UpdatePortalMeRequest {
  display_name?: string;
  avatar_url?: string;
}

// ── Admin Block Types catalog (BE actual shape) ───────────────────
// Note: BE shape diverges from architecture spec §4.2 — no supported_surfaces,
// no props_schema, no category yet. Adapter rebuilds those if BE ships later.

export interface AdminBlockType {
  type: string; // primary key — BE uses 'type' not 'code'
  label_vi: string;
  label_en?: string;
  description_vi?: string;
  description_en?: string;
  accent_color?: string; // hex, replaces icon
  is_active: boolean;
  is_premium?: boolean;
  schema_version?: string; // canvas engine version
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
  // Future fields (architecture spec §4.2) — not shipped by BE yet:
  supported_surfaces?: string[];
  props_schema?: Record<string, unknown>;
  category?: string;
  min_dimensions?: { width: number; height: number };
  engine_version?: string;
  supported_slot_types?: string[];
}

export interface CreateAdminBlockTypeRequest {
  type: string;
  label_vi: string;
  label_en?: string;
  description_vi?: string;
  description_en?: string;
  accent_color?: string;
  is_premium?: boolean;
  schema_version?: string;
  sort_order?: number;
}

export interface UpdateAdminBlockTypeRequest {
  label_vi?: string;
  label_en?: string;
  description_vi?: string;
  description_en?: string;
  accent_color?: string;
  is_active?: boolean;
  is_premium?: boolean;
  schema_version?: string;
  sort_order?: number;
}

// ── Admin Users (global cross-brand list) ────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  role: string; // 'admin' | 'staff' | 'client_user' | 'brand_user'
  status: string; // 'active' | 'pending' | 'disabled'
  /** Brand association — BE trả `brand_id` + `brand_name` (be-tasks 2026-06-04 §4a).
   *  Giữ `client_*` cho back-compat; đọc `brand_*` trước. */
  brand_id?: string;
  brand_name?: string;
  client_id?: string; // populated for brand users (legacy alias)
  client_name?: string;
  last_login_at?: string;
  created_at: string;
}

// ── Saved blocks (BE server-backed, swagger has them) ─────────────────────

export interface SavedBlockServer {
  id: string;
  client_id?: string;
  workspace_id?: string;
  name: string;
  block_json?: Record<string, unknown>;
  tags?: string[];
  scope?: 'private' | 'team' | 'public';
  thumbnail_url?: string;
  usage_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SavedBlockListResponse {
  items: SavedBlockServer[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// ── Portal templates create (be-todo.md P0.2) ─────────────────────────────

export interface CreatePortalTemplateRequest {
  name: string;
  width?: number;
  height?: number;
  workspace_id?: string;
  source_template_id?: string;
}

// ── Portal Ads ────────────────────────────────────────────────────────────

export interface PortalAdChannel {
  id: string;
  name: string;
}

export interface PortalAdChannelListResponse {
  items: PortalAdChannel[];
}

export type PortalAdObjective =
  | 'awareness'
  | 'traffic'
  | 'conversion'
  | 'retention';
export type PortalAdStatus = 'draft' | 'active' | 'paused' | 'completed';

export interface PortalAdCampaign {
  id: string;
  client_id?: string;
  workspace_id?: string;
  name: string;
  objective?: PortalAdObjective | string;
  status: PortalAdStatus | string;
  channels: string[];
  budget_amount?: number;
  budget_currency?: string;
  start_date?: string;
  end_date?: string;
  landing_template_id?: string;
  utm_campaign?: string;
  notes?: string;
  /** Aggregate denormalised numbers — BE may include rolling 30d totals. */
  impressions?: number;
  clicks?: number;
  spent_amount?: number;
  conversions?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PortalAdCampaignListResponse {
  items: PortalAdCampaign[];
  page: number;
  limit: number;
  total: number;
}

export interface CreatePortalAdCampaignRequest {
  name: string;
  objective?: PortalAdObjective;
  channels?: string[];
  budget_amount?: number;
  budget_currency?: string;
  start_date?: string;
  end_date?: string;
  landing_template_id?: string;
  utm_campaign?: string;
  notes?: string;
  status?: PortalAdStatus;
}

export type UpdatePortalAdCampaignRequest =
  Partial<CreatePortalAdCampaignRequest>;

// ─────────────────────────────────────────────────────────────────────────
// CANONICAL TYPES (Rexer Architecture Final 2026-05-23)
// Added 2026-05-24 for FE canonical cutover. Legacy types above remain
// alive until Wave 2 of `docs/fe-canonical-cutover-migration-plan.md`.
// ─────────────────────────────────────────────────────────────────────────

// ── Brand (canonical, replaces Client) ───────────────────────────────────
export type BrandStatus = 'active' | 'pending' | 'suspended';
export type BrandPlan = 'phase1_managed' | 'phase2_self_serve' | string;

export interface Brand {
  id: string;
  slug: string;
  name: string;
  legal_name?: string;
  contact_email: string;
  contact_phone?: string;
  country_code?: string;
  industry?: string;
  logo_asset_id?: string;
  status: BrandStatus;
  plan: BrandPlan;
  storage_quota_gb: number;
  storage_used_gb: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}
export interface BrandListResponse {
  items: Brand[];
  page?: number;
  limit?: number;
  total?: number;
  total_pages?: number;
}
export interface BrandResponse {
  brand: Brand;
}
export interface CreateBrandRequest {
  slug: string;
  name: string;
  contact_email: string;
  legal_name?: string;
  contact_phone?: string;
  country_code?: string;
  industry?: string;
  plan?: BrandPlan;
}
export type UpdateBrandRequest = Partial<Omit<CreateBrandRequest, 'slug'>>;

export type BrandMembershipRole = 'brand_admin' | 'brand_member';

export interface BrandMembership {
  id: string;
  brand_id: string;
  user_id: string;
  role: BrandMembershipRole;
  joined_at: string;
  last_seen_at?: string;
  invited_by?: string;
}

export interface BrandUser {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  status: 'active' | 'pending' | 'disabled';
  membership: BrandMembership;
}
export interface BrandUserListResponse {
  items: BrandUser[];
}
export interface InviteBrandUserRequest {
  email: string;
  display_name: string;
  role: BrandMembershipRole;
  password?: string;
}
export interface InviteBrandUserResponse {
  user: BrandUser;
  generated_password?: string;
}
export interface UpdateBrandUserRequest {
  role?: BrandMembershipRole;
  display_name?: string;
  status?: 'active' | 'disabled';
}

// ── Brand custom domains ─────────────────────────────────────────────────
export type BrandDomainTarget = 'landing' | 'curate_cdn' | 'tracking';
export type BrandDomainStatus =
  | 'pending'
  | 'verifying'
  | 'verified'
  | 'failed'
  | string;

export interface BrandDomain {
  id: string;
  brand_id: string;
  workspace_id: string;
  domain: string;
  page_id: string | null;
  target_type: BrandDomainTarget;
  status: BrandDomainStatus;
  verification_token: string;
  verification_method: 'txt_record' | 'cname' | string;
  verified_at: string | null;
  tls_status: string;
  tls_cert_id: string | null;
  tls_expires_at: string | null;
  last_check_at: string | null;
  failure_reason: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
export interface BrandDomainListResponse {
  items: BrandDomain[];
  total: number;
}
export interface BrandDomainDnsRecord {
  type: 'CNAME' | 'TXT' | string;
  name: string;
  value: string;
}
export interface CreateBrandDomainRequest {
  domain: string;
  workspace_id: string;
  target_type: BrandDomainTarget;
  /** Optional landing page to bind on create (migration 000137). */
  page_id?: string | null;
}

/** Bind / rebind the landing page a domain serves (PATCH page_id). */
export interface UpdateBrandDomainRequest {
  page_id?: string | null;
}

export interface BrandDomainResponse {
  domain: BrandDomain;
}
export interface CreateBrandDomainResponse {
  domain: BrandDomain;
  dns_records: BrandDomainDnsRecord[];
}
export interface VerifyBrandDomainResponse {
  domain: BrandDomain;
  dns_records?: BrandDomainDnsRecord[];
  message?: string;
}

// ── Page (canonical, unified entity with type discriminator) ─────────────
export type PageType = 'landing' | 'ad' | 'curate';
export type PageStatus = 'draft' | 'published' | 'archived';

export interface PageMetadataLanding {
  featured_image?: string;
  og_meta?: Record<string, string>;
  robots?: string;
  sitemap_priority?: number;
}
export interface PageMetadataAd {
  format:
    | 'facebook_feed'
    | 'banner_728x90'
    | 'banner_300x250'
    | 'instagram_square'
    | 'story_1080x1920'
    | 'youtube_thumbnail'
    | string;
  dimensions: { width: number; height: number };
  duration_sec?: number;
}
export interface PageMetadataCurate {
  trigger:
    | 'time_on_page'
    | 'scroll_50'
    | 'exit_intent'
    | 'click_element'
    | string;
  trigger_config: {
    delay_ms?: number;
    scroll_threshold_pct?: number;
    target_selector?: string;
    max_show_per_session?: number;
  };
  embed_token?: string;
}
export type PageTypeMetadata =
  | PageMetadataLanding
  | PageMetadataAd
  | PageMetadataCurate
  | Record<string, unknown>;

export interface Page {
  id: string;
  brand_id: string;
  workspace_id: string;
  slug: string;
  name: string;
  description?: string;
  type: PageType;
  type_metadata: PageTypeMetadata;
  status: PageStatus;
  template_version_id: string;
  active_release_id?: string;
  freeze_products: boolean;
  assigned_by?: string;
  assigned_at?: string;
  handoff_notes?: string;
  thumbnail_asset_id?: string;
  thumbnail_url?: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  archived_at?: string;
}
export interface PageListResponse {
  items: Page[];
  page?: number;
  limit?: number;
  total?: number;
  total_pages?: number;
}
export interface PageResponse {
  page: Page;
}
export interface CreatePageRequest {
  type: PageType;
  template_id: string;
  template_version_id?: string;
  name: string;
  slug?: string;
  description?: string;
  type_metadata?: PageTypeMetadata;
  workspace_id?: string;
}
/** BE `UpdatePageRequest` — accepts `slug` (BE shipped fix 2026-05-31
 *  per be-audit §12, dù swagger chưa regen). Validate FE-side: lowercase
 *  kebab, 2-80 chars trước khi PATCH để tránh BE 422. */
export interface UpdatePageRequest {
  name?: string;
  slug?: string;
  description?: string;
  type_metadata?: PageTypeMetadata;
  freeze_products?: boolean;
  thumbnail_asset_id?: string;
}

// ── Page revisions (rolling autosave) ────────────────────────────────────
export interface PageRevision {
  id: string;
  page_id: string;
  revision_no: number;
  config_json: Record<string, unknown>;
  changed_by: string;
  changed_at: string;
}
export interface PageRevisionListResponse {
  items: PageRevision[];
  page_id: string;
  latest_revision_no: number;
}
export interface SavePageConfigRequest {
  config_json: Record<string, unknown>;
  /** Optimistic concurrency — pass the latest revision_no FE has seen. */
  base_revision_no?: number;
}

// ── Page releases (immutable publish snapshots) ──────────────────────────
export interface PageRelease {
  id: string;
  page_id: string;
  release_no: number;
  version_label?: string;
  config_snapshot: Record<string, unknown>;
  canvas_blueprint_snapshot: Record<string, unknown>;
  product_snapshot?: Record<string, unknown>;
  share_token?: string;
  published_by: string;
  published_at: string;
  is_active: boolean;
}
export interface PageReleaseListResponse {
  items: PageRelease[];
}
export interface PublishPageRequest {
  version_label?: string;
  /** BE shipped Option C 2026-05-31 per be-audit §13: re-point page sang
   *  version chỉ định trước khi snapshot. Validate phải thuộc cùng template
   *  (404 ERR_TEMPLATE_VERSION_NOT_FOUND nếu không). Bỏ qua → giữ
   *  page.template_version_id cũ (back-compat). */
  template_version_id?: string;
}
export interface PublishPageValidateResponse {
  ok: boolean;
  errors?: Array<{ slot_key?: string; code: string; message: string }>;
}
export interface PublishPageResponse {
  release: PageRelease;
  /** Type-specific publish output. */
  output?: {
    landing?: { url: string; share_token: string };
    ad?: { export_url: string; format: string };
    curate?: { embed_snippet: string; embed_token: string };
  };
}

// ── Block (canonical CRUD entity) ────────────────────────────────────────
export type BlockScope =
  | 'system'
  | 'brand_private'
  | 'brand_team'
  | 'brand_public';

export interface Block {
  id: string;
  type_code: string;
  brand_id?: string;
  workspace_id?: string;
  name: string;
  description?: string;
  settings: Record<string, unknown>;
  thumbnail_asset_id?: string;
  thumbnail_url?: string;
  tags: string[];
  scope: BlockScope;
  usage_count: number;
  last_used_at?: string;
  source_block_id?: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  archived_at?: string;
}
export interface BlockListResponse {
  items: Block[];
  page?: number;
  limit?: number;
  total?: number;
  total_pages?: number;
}
export interface BlockResponse {
  block: Block;
}
export interface CreateBlockRequest {
  type_code: string;
  name: string;
  settings: Record<string, unknown>;
  brand_id?: string;
  workspace_id?: string;
  scope?: BlockScope;
  tags?: string[];
  description?: string;
}
export interface UpdateBlockRequest {
  name?: string;
  description?: string;
  settings?: Record<string, unknown>;
  tags?: string[];
  thumbnail_asset_id?: string;
}

// ── BlockType (system catalog, canonical mirror of AdminBlockType) ───────
// AdminBlockType in legacy section already matches BE canonical shape —
// re-export under canonical alias for code-mod clarity.
export type CanonicalBlockType = AdminBlockType;
export interface BlockTypeListResponse {
  items: CanonicalBlockType[];
}

// ── AI Job (canonical async pattern) ─────────────────────────────────────
export type AIJobType =
  | 'template_draft'
  | 'slot_suggest'
  | 'page_optimize'
  | 'image_generate';
export type AIJobStatus = 'queued' | 'running' | 'succeeded' | 'failed';

export interface AIJob {
  id: string;
  requested_by: string;
  brand_id?: string;
  job_type: AIJobType;
  input_payload: Record<string, unknown>;
  output_payload?: Record<string, unknown>;
  status: AIJobStatus;
  cost_credits: number;
  model: string;
  tokens_in?: number;
  tokens_out?: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}
export interface AIJobResponse {
  job: AIJob;
}

export interface AITemplateDraftInput {
  prompt: string;
  target_page_type: PageType;
  /** Optional brand context for tone/voice priming. */
  brand_id?: string;
  language?: string;
}
export interface AISlotSuggestInput {
  page_id: string;
  slot_key: string;
  /** Free-form context provided by the editor (e.g., current value). */
  context?: Record<string, unknown>;
  count?: number;
}
export interface AIPageOptimizeInput {
  page_id: string;
  goals?: string[];
}
export interface AIImageGenerateInput {
  prompt: string;
  brand_id?: string;
  aspect_ratio?: string;
  /** Where the generated asset will be bound — informs storage path. */
  page_id?: string;
  slot_key?: string;
}

export interface AISlotSuggestion {
  id: string;
  page_id: string;
  slot_key: string;
  suggestion_text: string;
  accepted?: boolean;
  ai_job_id: string;
  suggested_at: string;
  responded_at?: string;
}
export interface AISlotSuggestionListResponse {
  items: AISlotSuggestion[];
}
export interface RespondAISlotSuggestionRequest {
  accepted: boolean;
}

// ── Track event (canonical analytics ingest /v1/track) ───────────────────
export type TrackEventType =
  | 'page_view'
  | 'block_view'
  | 'block_dwell'
  | 'click'
  | 'scroll_depth'
  | 'form_submit'
  | 'cta_click'
  | 'product_view'
  | 'product_click';

export interface TrackEventInput {
  page_id: string;
  release_id?: string;
  block_key?: string;
  element_key?: string;
  visitor_id: string;
  session_id: string;
  event_type: TrackEventType;
  action?: string;
  target?: string;
  dwell_ms?: number;
  scroll_depth?: number;
  viewport_w?: number;
  viewport_h?: number;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet';
  meta?: Record<string, unknown>;
  occurred_at?: string;
}
export interface TrackBatchRequest {
  events: TrackEventInput[];
}

// ── Page analytics (canonical, mirror of TemplateAnalytics) ──────────────
export interface PageAnalyticsSummary {
  page_id: string;
  range: { start: string; end: string };
  page_views: number;
  unique_visitors: number;
  clicks: number;
  conversions: number;
  avg_scroll_depth?: number;
  trend: Array<{ date: string; page_views: number; clicks: number }>;
}
export interface PageAnalyticsBlockRow extends BlockBreakdownRow {
  block_key: string;
}
export interface PageAnalyticsBlocksResponse {
  items: PageAnalyticsBlockRow[];
}

/**
 * One row of a GA-style generic breakdown (BE `GET /pages/:id/analytics/
 * breakdown?group_by=…`, spec §17). `key` is the distinct value of the
 * grouped dimension (e.g. a `section_id`); `metrics.count` /
 * `metrics.unique_session` are the totals; `views_by_day` is the daily
 * series sized to the requested range (oldest → newest).
 */
export interface PageAnalyticsBreakdownRow {
  key: string;
  metrics: { count?: number; unique_session?: number } & Record<string, number>;
  views_by_day?: number[];
}
export interface PageAnalyticsBreakdownResponse {
  items: PageAnalyticsBreakdownRow[];
}
