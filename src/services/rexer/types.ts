/**
 * Hand-picked TS types mirroring the REXER Backend API 1.0 Swagger schema.
 * Only includes the fields currently consumed by the UI; expand as needed.
 */

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
  display_name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  user: RxUser;
  session: RxSession;
}

export interface AuthMeResponse {
  user: RxUser;
  session: RxSession;
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
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface TemplateListResponse {
  items: Template[];
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

// ── Error envelope ───────────────────────────────────────────────────────
export interface RxErrorBody {
  code: string;
  message: string;
  details?: unknown;
  request_id?: string;
}
