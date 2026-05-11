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
  status: string;
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
}

export interface RegisterResponse {
  user: RxUser;
  session: RxSession;
  client?: Client;
}

export interface AuthMeResponse {
  user: RxUser;
  session: RxSession;
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
  /** Present when BE auto-creates an empty Client for the new user. */
  client?: Client;
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
export interface Template {
  id: string;
  code: string;
  name: string;
  description: string;
  status: string;
  preview_mode: string;
  current_version_id: string;
  thumbnail_url?: string;
  category?: string;
  tags?: string[];
  author?: string;
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

export interface TemplateListResponse {
  items: Template[];
}

export interface TemplateVersion {
  id: string;
  template_id: string;
  version: string;
  schema_version: string;
  renderer_key?: string;
  change_note?: string;
  field_schema_json?: Record<string, unknown>;
  default_config_json?: Record<string, unknown>;
  preview_descriptor_json?: Record<string, unknown>;
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

// ── Project ──────────────────────────────────────────────────────────────
export interface Project {
  id: string;
  client_id: string;
  product_id?: string | null;
  name: string;
  slug: string;
  status: string;
  template_id: string;
  template_version_id: string;
  active_release_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  /** Joined when BE list returns nested template (eager load). */
  template?: Pick<
    Template,
    | 'id'
    | 'code'
    | 'name'
    | 'description'
    | 'thumbnail_url'
    | 'category'
    | 'status'
  >;
  /** Joined when BE list returns nested client. */
  client?: Pick<Client, 'id' | 'name' | 'status'>;
}

export interface ProjectListResponse {
  items: Project[];
}

export interface SummaryMetrics {
  page_views: number;
  cta_clicks: number;
  conversions: number;
  ctr: number;
}

export interface ProjectSummary {
  project_id: string;
  name: string;
  status: string;
  template_name: string;
  active_release_id: string | null;
  active_release_url: string | null;
  last_publish_at: string | null;
  analytics_summary: SummaryMetrics | null;
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

export interface ClientAccessGrant {
  id: string;
  client_id: string;
  project_id: string;
  access_scope: 'summary_only' | 'summary_and_reports';
  created_at: string;
}
export interface ClientAccessGrantResponse {
  access_grant: ClientAccessGrant;
}
export interface CreateClientAccessGrantRequest {
  project_id: string;
  access_scope: 'summary_only' | 'summary_and_reports';
}
export interface ClientProjectListResponse {
  client_id: string;
  items: ProjectSummary[];
}

// ── Client portal (read-only for end clients) ────────────────────────────
export interface ClientPortalProject {
  project_id: string;
  name: string;
  status: string;
  template_name: string;
  page_url?: string;
  last_publish_at?: string;
  access_scope?: string;
  analytics_summary?: SummaryMetrics;
}
export interface ClientPortalProjectListResponse {
  items: ClientPortalProject[];
}
export interface ClientPortalProjectResponse {
  project: ClientPortalProject;
}
export interface ClientPortalAnalyticsResponse {
  project_id: string;
  from: string;
  to: string;
  summary: SummaryMetrics;
  daily: AnalyticsDailyPoint[];
}
export interface ClientPortalReportsResponse {
  project_id: string;
  items: ReportLink[];
}

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

// ── Release ──────────────────────────────────────────────────────────────
export interface Release {
  id: string;
  project_id: string;
  release_no: number;
  state: string;
  page_url?: string;
  template_version_id?: string;
  project_config_revision_id?: string;
  published_at?: string;
  created_at: string;
  created_by?: string;
}
export interface ReleaseResponse {
  release: Release;
}
export interface ReleaseListResponse {
  items: Release[];
}

export interface ValidationError {
  field?: string;
  message: string;
}
export interface PublishValidationRequest {
  config_revision_no?: number;
}
export interface PublishValidationResponse {
  ready: boolean;
  errors: ValidationError[];
}

export interface PublishProjectRequest {
  config_revision_no: number;
  notes?: string;
}
export interface PublishProjectResponse {
  release: Release;
}

export interface RollbackReleaseRequest {
  reason?: string;
}
export interface RollbackReleaseResponse {
  release: Release;
  message?: string;
}

// ── Project config ───────────────────────────────────────────────────────
export interface ProjectConfigRevision {
  id: string;
  project_id: string;
  revision_no: number;
  config_json: Record<string, unknown>;
  validation_result?: unknown;
  created_at: string;
  created_by?: string;
}
export interface ProjectConfigResponse {
  project_id: string;
  current_revision: ProjectConfigRevision | null;
}

// ── Media bind / upload ──────────────────────────────────────────────────
export interface InitUploadRequest {
  filename: string;
  mime_type: string;
  file_size: number;
  owner_scope: 'project' | 'library';
  media_type?: 'image' | 'video' | 'file';
  project_id?: string;
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

export interface BindMediaItem {
  field_key: string;
  media_id: string;
  slot_key?: string;
}
export interface BindMediaRequest {
  items: BindMediaItem[];
}
export interface ProjectMediaBinding {
  id: string;
  project_id: string;
  field_key: string;
  slot_key?: string;
  media_id: string;
  created_at: string;
}
export interface BindMediaResponse {
  project_id: string;
  bindings: ProjectMediaBinding[];
}

// ── Analytics ────────────────────────────────────────────────────────────
export interface AnalyticsDailyPoint {
  date: string;
  page_views: number;
  cta_clicks: number;
  conversions: number;
  ctr: number;
}
export interface ProjectAnalyticsResponse {
  project_id: string;
  release_id?: string;
  from: string;
  to: string;
  summary: SummaryMetrics;
  daily: AnalyticsDailyPoint[];
}

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
  landing_project_id?: string;
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
  landing_project_id?: string;
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

// ── Error envelope ───────────────────────────────────────────────────────
export interface RxErrorBody {
  code: string;
  message: string;
  details?: unknown;
  request_id?: string;
}
