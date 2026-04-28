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
  name: string;
  slug: string;
  status: string;
  template_id: string;
  template_version_id: string;
  active_release_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
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

export interface ProductColor {
  name: string;
  hex: string;
}
export interface ProductFeature {
  label: string;
  description: string;
}

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
  certifications?: string[];
  features?: ProductFeature[];
  status?: ProductStatus;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface ProductMediaBinding {
  id: string;
  product_id: string;
  field_key?: string;
  slot_key?: string;
  media_id: string;
  created_at: string;
}

export interface ProductResponse {
  product: Product;
  category?: ProductCategory;
  media?: ProductMediaBinding[];
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
  certifications?: string[];
  features?: ProductFeature[];
  status?: ProductStatus;
}
export type UpdateProductRequest = Partial<CreateProductRequest>;

export interface BindProductMediaItem {
  media_id: string;
  field_key?: string;
  slot_key?: string;
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
export interface AIMediaSuggestResponse {
  /** Map of `section_key` → list of suggested asset hints (URLs or descriptions). */
  suggestions: Record<string, string[]>;
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
