/**
 * REXER backend endpoints grouped by domain. Each fn returns already-typed
 * data from `src/services/rexer/types.ts`.
 */
import { rx } from './client';
import {
  isAiTemplateMockEnabled,
  mockGenerateAiTemplate,
  mockGetAiTemplate,
  mockGetSession,
  mockListAiTemplates,
  mockMediaList,
} from './__mocks__/aiTemplates';
import type {
  CreateCollectionDTO,
  CreateRecordDTO,
  UpdateCollectionDTO,
  UpdateRecordDTO,
} from '@/types/dataCollection';
import type {
  AIBlockContentRequest,
  AICanvasApplyProductRequest,
  AICanvasApplyProductResponse,
  PublicCanvasResponse,
  AIBlockContentResponse,
  AICampaignPlanRequest,
  AICampaignPlanResponse,
  AIProductEnrichRequest,
  AIProductEnrichResponse,
  AITemplateGenerateRequest,
  AITemplateGenerateResponse,
  AITemplateListResponse,
  AITemplateResponse,
  AITemplateSessionResponse,
  AITemplateSuggestRequest,
  AITemplateSuggestResponse,
  CreateAITemplateRequest,
  UpdateAITemplateRequest,
  AuthMeResponse,
  BindProductMediaRequest,
  BindProductMediaResponse,
  CanvasDataResponse,
  CanvasTemplate,
  CanvasTemplateListResponse,
  CanvasTemplateResponse,
  CollectionListResponse,
  CollectionResponse,
  CreateCanvasTemplateRequest,
  RecordListResponse,
  RecordResponse,
  UpdateCanvasTemplateRequest,
  Campaign,
  CampaignListResponse,
  CampaignMetrics,
  CampaignResponse,
  ChangePasswordRequest,
  CompleteUploadRequest,
  CompleteUploadResponse,
  CreateCampaignRequest,
  CloneProductRequest,
  CreateProductCategoryRequest,
  CreateProductRequest,
  DashboardSummary,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  InitUploadRequest,
  InitUploadResponse,
  LoginRequest,
  LoginResponse,
  MediaAsset,
  MediaAssetResponse,
  MediaListResponse,
  MediaListQuery,
  UpdateMediaRequest,
  BulkMoveMediaRequest,
  ProductCategory,
  ProductCategoryListResponse,
  ProductCategoryResponse,
  ProductListResponse,
  ProductResponse,
  RegisterRequest,
  RegisterResponse,
  AdminFeedbackQuery,
  AIUsageGlobalResponse,
  AIUsageListQuery,
  AIUsageListResponse,
  AIUsageQuery,
  AIUsageSummaryResponse,
  CreateFeedbackRequest,
  FeedbackListResponse,
  FeedbackResponse,
  FirebaseLoginRequest,
  FirebaseLoginResponse,
  UpdateFeedbackRequest,
  ResetPasswordRequest,
  Template,
  TemplateListResponse,
  TemplatePreviewResponse,
  TemplateResponse,
  TemplateVersion,
  TemplateVersionListResponse,
  TemplateVersionResponse,
  UpdateCampaignRequest,
  UpdateProductCategoryRequest,
  UpdateProductRequest,
  UpdateTemplateRequest,
  CreateTemplateRequest,
  CreateTemplateVersionRequest,
  // Template Analytics (be-template-analytics-spec)
  TemplateAnalyticsSummaryRow,
  BlockBreakdownRow,
  AnalyticsEventInput,
  // Phase 1 — workspaces / folders / comments / notifications / activity / inbox
  Workspace,
  WorkspaceListResponse,
  WorkspaceMembership,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  SwitchWorkspaceRequest,
  MediaFolder,
  MediaFolderListResponse,
  CreateMediaFolderRequest,
  UpdateMediaFolderRequest,
  TemplateComment,
  TemplateCommentListResponse,
  CreateTemplateCommentRequest,
  UpdateTemplateCommentRequest,
  NotificationListResponse,
  UnreadCountResponse,
  MarkReadRequest,
  ActivityFeedResponse,
  StaffInboxItem,
  StaffInboxListResponse,
  // Phase 2 — portal endpoints (be-missing-apis-portal.md)
  PortalDashboardSummary,
  PortalTemplate,
  PortalTemplateListResponse,
  PortalCommentListResponse,
  PortalAdCampaign,
  PortalAdCampaignListResponse,
  PortalAdChannelListResponse,
  CreatePortalAdCampaignRequest,
  UpdatePortalAdCampaignRequest,
  PortalAdMetricsResponse,
  UpsertAdMetricsRequest,
  // Micro-sites (spec §B)
  MicroSite,
  MicroSiteListResponse,
  MicroSiteAnalytics,
  CreateMicroSiteRequest,
  UpdateMicroSiteRequest,
  MicroSitePage,
  CreateMicroSitePageRequest,
  UpdateMicroSitePageRequest,
  UpsertMicroSiteMetricsRequest,
  // Public page (published render source)
  PublicPageResponse,
  // Tracking keys
  TrackingKey,
  TrackingKeyListResponse,
  CreateTrackingKeyRequest,
  UpdateTrackingKeyRequest,
  CreateTrackingKeyResponse,
  // Server-backed saved blocks
  SavedBlockListResponse,
  // Admin block-types catalog
  AdminBlockType,
  CreateAdminBlockTypeRequest,
  UpdateAdminBlockTypeRequest,
  // Admin global users
  AdminUser,
  // P0.2 + P0.3 (be-todo.md)
  CreatePortalTemplateRequest,
  PortalClient,
  UpdatePortalClientRequest,
  PortalMember,
  PortalMemberRole,
  PortalMemberListResponse,
  InvitePortalMemberRequest,
  InvitePortalMemberResponse,
  UpdatePortalMemberRoleRequest,
  UpdatePortalMeRequest,
  // ── Canonical (Rexer Architecture Final 2026-05-23) ───────────────
  Brand,
  BrandDomainListResponse,
  BrandDomainResponse,
  BrandListResponse,
  BrandResponse,
  BrandUser,
  BrandUserListResponse,
  CreateBrandDomainRequest,
  CreateBrandDomainResponse,
  UpdateBrandDomainRequest,
  VerifyBrandDomainResponse,
  CreateBrandRequest,
  UpdateBrandRequest,
  InviteBrandUserRequest,
  InviteBrandUserResponse,
  UpdateBrandUserRequest,
  Page,
  PageListResponse,
  PageResponse,
  PageType,
  CreatePageRequest,
  UpdatePageRequest,
  PageRevisionListResponse,
  SavePageConfigRequest,
  PageRelease,
  PageReleaseListResponse,
  PublishPageRequest,
  PublishPageValidateResponse,
  PublishPageResponse,
  PageAnalyticsSummary,
  PageAnalyticsBlocksResponse,
  PageAnalyticsBreakdownResponse,
  Block,
  BlockListResponse,
  BlockResponse,
  BlockScope,
  CreateBlockRequest,
  UpdateBlockRequest,
  AIJob,
  AIJobResponse,
  AITemplateDraftInput,
  AISlotSuggestInput,
  AIPageOptimizeInput,
  AIImageGenerateInput,
  AISlotSuggestion,
  RespondAISlotSuggestionRequest,
  TrackEventInput,
  TrackBatchRequest,
  // ── AI-Insights (experience strategy blueprint) ───────────────────
  InsightPrefillRequest,
  PrefillResult,
  CreateInsightReportBody,
  InsightReportResponse,
  InsightReportListResponse,
  InsightBrief,
  InsightSuggestResponse,
  ClassifyGoalResponse,
  SuggestJourneyResponse,
  ExperienceGoal,
  UpdateInsightBlueprintBody,
  InsightHandoffResponse,
  GenerateBlockContentBody,
  GenerateBlockContentResponse,
} from './types';

// Tolerate BE responses for /brands/{id} returning either `{brand: Brand}`
// (legacy wrapper) or raw `Brand` (post-2026-05-24 canonical cutover unwrap).
// Keeps FE working across BE shape swap without coupling call sites to either.
function unwrapBrand(r: BrandResponse | Brand): Brand {
  if (
    r &&
    typeof r === 'object' &&
    'brand' in r &&
    (r as BrandResponse).brand
  ) {
    return (r as BrandResponse).brand;
  }
  return r as Brand;
}

// A2 (be-response §A2): map item từ catalog `/block-types`
// (code/name/description/…) sang shape `AdminBlockType` (type/label_vi/…) mà
// admin UI đang dùng. `accent_color`/`is_premium`/`sort_order` BE catalog không
// trả → undefined (UI xử lý optional).
function toAdminBlockType(it: Record<string, any>): AdminBlockType {
  return {
    type: it.code ?? it.type,
    label_vi: it.name ?? it.label_vi ?? it.code,
    label_en: it.name ?? it.label_en,
    description_vi: it.description ?? it.description_vi,
    is_active: it.is_active ?? true,
    is_premium: it.is_premium,
    sort_order: it.sort_order,
    category: it.category,
    supported_surfaces: it.supported_surfaces,
    props_schema: it.props_schema,
    min_dimensions: it.min_dimensions,
    supported_slot_types: it.supported_slot_types,
    engine_version: it.engine_version,
    created_at: it.created_at,
    updated_at: it.updated_at,
  };
}

export const rexerApi = {
  auth: {
    login: (body: LoginRequest) =>
      rx<LoginResponse>('/auth/login', { method: 'POST', body }),
    register: (body: RegisterRequest) =>
      rx<RegisterResponse>('/auth/register', { method: 'POST', body }),
    me: () => rx<AuthMeResponse>('/auth/me'),
    logout: () => rx<void>('/auth/logout', { method: 'POST' }),
    changePassword: (body: ChangePasswordRequest) =>
      rx<{ message?: string }>('/auth/change-password', {
        method: 'POST',
        body,
      }),
    forgotPassword: (body: ForgotPasswordRequest) =>
      rx<ForgotPasswordResponse>('/auth/forgot-password', {
        method: 'POST',
        body,
      }),
    resetPassword: (body: ResetPasswordRequest) =>
      rx<{ message?: string }>('/auth/reset-password', {
        method: 'POST',
        body,
      }),
    /**
     * Exchange a Firebase ID token (from `signInWithPopup`) for a Rexer
     * session. BE verifies the token via Firebase Admin SDK, then upserts
     * the user. See `docs/be-alpha-spec.md` §B.3.
     */
    firebaseLogin: (body: FirebaseLoginRequest) =>
      rx<FirebaseLoginResponse>('/auth/firebase/login', {
        method: 'POST',
        body,
      }),
  },
  dashboard: {
    summary: () => rx<DashboardSummary>('/dashboard/summary'),
  },
  // `clientPortal` namespace removed — the `/client-portal/*` routes only
  // existed to serve project-based read-only landing reports for clients.
  // Brand portal now uses `/portal/*` directly (see `portal` namespace).
  templates: {
    list: (query?: {
      status?: 'draft' | 'active' | 'archived';
      q?: string;
      category?: string;
      include_archived?: boolean;
      sort?: 'created_at' | 'updated_at' | 'name';
      order?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    }) => rx<TemplateListResponse>('/templates', { query }),
    get: (id: string) => rx<TemplateResponse>(`/templates/${id}`),
    versions: (id: string) =>
      rx<TemplateVersionListResponse>(`/templates/${id}/versions`),
    version: async (
      id: string,
      versionId: string
    ): Promise<TemplateVersion> => {
      const r = await rx<TemplateVersionResponse>(
        `/templates/${id}/versions/${versionId}`
      );
      return r.template_version;
    },
    preview: (id: string) =>
      rx<TemplatePreviewResponse>(`/templates/${id}/preview`),
    update: async (
      id: string,
      body: UpdateTemplateRequest
    ): Promise<Template> => {
      const r = await rx<TemplateResponse>(`/templates/${id}`, {
        method: 'PATCH',
        body,
      });
      return r.template;
    },
    create: async (body: CreateTemplateRequest): Promise<Template> => {
      const r = await rx<TemplateResponse>('/templates', {
        method: 'POST',
        body,
      });
      return r.template;
    },
    /**
     * Autosave buffer — mutable. PATCH overwrites the draft each call (no
     * new version). Editor uses this for debounced autosave; commit to an
     * immutable version via `createVersion(...)` (TBD adapter).
     */
    patchDraftBlueprint: async (
      id: string,
      blueprint: Record<string, unknown>
    ): Promise<Template> => {
      const r = await rx<TemplateResponse>(
        `/templates/${id}/draft-canvas-blueprint`,
        { method: 'PATCH', body: { canvas_blueprint: blueprint } }
      );
      return r.template;
    },
    /** Commit draft canvas_blueprint as an immutable version. Clears the
     *  draft buffer on BE side. Required body fields inherit from the
     *  current version when caller omits (caller pattern in BlockEditor). */
    createVersion: async (
      id: string,
      body: CreateTemplateVersionRequest
    ): Promise<TemplateVersion> => {
      const r = await rx<TemplateVersionResponse>(`/templates/${id}/versions`, {
        method: 'POST',
        body,
      });
      return r.template_version;
    },
  },
  // `projects` namespace removed — system standardized on canvas-template
  // based landings (see docs/rexer-system-spec-v1.md). Anything that used
  // to live under /v1/projects either deprecated or migrated to canvas-
  // templates equivalents.
  products: {
    list: async (query?: {
      status?: string;
      category_id?: string;
      brand_id?: string;
      q?: string;
      page?: number;
      limit?: number;
      sort?: string;
      /** V2: filter for templates (default false). */
      is_template?: boolean;
      /** V2: filter templates by category. */
      template_category?: string;
      /** V2: filter library (true) vs my templates (false). */
      is_public_template?: boolean;
    }): Promise<ProductListResponse> => {
      // BE `/v1/products` là list endpoint DUY NHẤT trả pagination lồng trong
      // object `pagination` ({page,limit,total,total_pages}); mọi list khác
      // (templates, brands, feedback, block-types, pages…) trả `total` ở
      // top-level. Normalize tại đây để consumer đọc `res.total` đồng nhất —
      // tránh `NaN sản phẩm` (admin) + card "0" (dashboard). Xem be-qa-2026-06-03.
      const res = await rx<
        ProductListResponse & {
          pagination?: {
            page?: number;
            limit?: number;
            total?: number;
            total_pages?: number;
          };
        }
      >('/products', { query });
      const p = res.pagination;
      const items = res.items ?? [];
      return {
        items,
        page: res.page ?? p?.page ?? 1,
        limit: res.limit ?? p?.limit ?? items.length,
        total: res.total ?? p?.total ?? items.length,
      };
    },
    get: async (id: string): Promise<ProductResponse> =>
      rx<ProductResponse>(`/products/${id}`),
    create: async (body: CreateProductRequest): Promise<ProductResponse> => {
      return rx<ProductResponse>('/products', { method: 'POST', body });
    },
    update: async (
      id: string,
      body: UpdateProductRequest
    ): Promise<ProductResponse> => {
      return rx<ProductResponse>(`/products/${id}`, {
        method: 'PATCH',
        body,
      });
    },
    /**
     * V2: clone a product (or template) — server-side copy of attributes +
     * media bindings in a single transaction. Used for "Use template" and
     * "Save as my template" flows. See spec §4.2.
     */
    clone: async (
      id: string,
      body: CloneProductRequest
    ): Promise<ProductResponse> =>
      rx<ProductResponse>(`/products/${id}/clone`, { method: 'POST', body }),
    remove: (id: string) =>
      rx<{ message?: string }>(`/products/${id}`, { method: 'DELETE' }),
    bindMedia: async (
      id: string,
      body: BindProductMediaRequest
    ): Promise<BindProductMediaResponse> =>
      rx<BindProductMediaResponse>(`/products/${id}/media/bind`, {
        method: 'POST',
        body,
      }),
    unbindMedia: (id: string, bindingId: string) =>
      rx<{ message?: string }>(`/products/${id}/media/bindings/${bindingId}`, {
        method: 'DELETE',
      }),
  },
  productCategories: {
    list: (query?: { q?: string; page?: number; limit?: number }) =>
      rx<ProductCategoryListResponse>('/product-categories', { query }),
    get: async (id: string): Promise<ProductCategory> => {
      const r = await rx<ProductCategoryResponse>(`/product-categories/${id}`);
      return r.category;
    },
    create: async (
      body: CreateProductCategoryRequest
    ): Promise<ProductCategory> => {
      const r = await rx<ProductCategoryResponse>('/product-categories', {
        method: 'POST',
        body,
      });
      return r.category;
    },
    update: async (
      id: string,
      body: UpdateProductCategoryRequest
    ): Promise<ProductCategory> => {
      const r = await rx<ProductCategoryResponse>(`/product-categories/${id}`, {
        method: 'PATCH',
        body,
      });
      return r.category;
    },
    remove: (id: string) =>
      rx<{ message?: string }>(`/product-categories/${id}`, {
        method: 'DELETE',
      }),
  },
  campaigns: {
    list: (query?: {
      product_id?: string;
      status?: string;
      q?: string;
      page?: number;
      limit?: number;
    }) => rx<CampaignListResponse>('/campaigns', { query }),
    get: async (id: string): Promise<Campaign> => {
      const r = await rx<CampaignResponse>(`/campaigns/${id}`);
      return r.campaign;
    },
    create: async (body: CreateCampaignRequest): Promise<Campaign> => {
      const r = await rx<CampaignResponse>('/campaigns', {
        method: 'POST',
        body,
      });
      return r.campaign;
    },
    update: async (
      id: string,
      body: UpdateCampaignRequest
    ): Promise<Campaign> => {
      const r = await rx<CampaignResponse>(`/campaigns/${id}`, {
        method: 'PATCH',
        body,
      });
      return r.campaign;
    },
    remove: (id: string) =>
      rx<{ message?: string }>(`/campaigns/${id}`, { method: 'DELETE' }),
    metrics: (id: string) => rx<CampaignMetrics>(`/campaigns/${id}/metrics`),
  },
  ai: {
    productEnrich: (body: AIProductEnrichRequest) =>
      rx<AIProductEnrichResponse>('/ai/product/enrich', {
        method: 'POST',
        body,
      }),
    templateSuggest: (body: AITemplateSuggestRequest) =>
      rx<AITemplateSuggestResponse>('/ai/template/suggest', {
        method: 'POST',
        body,
      }),
    // landingDraft / landingOptimize / mediaSuggest removed (be-fe-handoff Q4,
    // 2026-06-03): `/ai/landing/*` + `/ai/media/suggest` không tồn tại trên BE.
    campaignPlan: (body: AICampaignPlanRequest) =>
      rx<AICampaignPlanResponse>('/ai/campaign/plan', {
        method: 'POST',
        body,
      }),
    blockContent: (body: AIBlockContentRequest) =>
      rx<AIBlockContentResponse>('/ai/block-content', {
        method: 'POST',
        body,
      }),
    canvasApplyProduct: (
      canvasTemplateId: string,
      body: AICanvasApplyProductRequest
    ) =>
      rx<AICanvasApplyProductResponse>(
        `/ai/canvas-templates/${canvasTemplateId}/apply-product`,
        { method: 'POST', body }
      ),
  },

  // ── AI Templates (Rexer_Cap_nhat_tinh_nang_va_logic.pdf §4) ──────────
  aiTemplates: {
    list: (query?: { q?: string; page?: number; limit?: number }) =>
      isAiTemplateMockEnabled()
        ? Promise.resolve(mockListAiTemplates())
        : rx<AITemplateListResponse>('/ai/templates', { query }),
    get: async (id: string) => {
      if (isAiTemplateMockEnabled()) {
        const t = mockGetAiTemplate(id);
        if (!t) throw new Error(`Mock template ${id} not found`);
        return t;
      }
      const r = await rx<AITemplateResponse>(`/ai/templates/${id}`);
      return r.ai_template;
    },
    generate: (id: string, body: AITemplateGenerateRequest) =>
      isAiTemplateMockEnabled()
        ? mockGenerateAiTemplate(id, body)
        : rx<AITemplateGenerateResponse>(`/ai/templates/${id}/generate`, {
            method: 'POST',
            body,
          }),
    session: async (sessionId: string) => {
      if (isAiTemplateMockEnabled()) {
        return mockGetSession(sessionId);
      }
      const r = await rx<AITemplateSessionResponse>(
        `/ai/templates/sessions/${sessionId}`
      );
      return r.session;
    },
  },

  // `releases` namespace removed — Release lifecycle only existed for
  // project-based landings (project → release snapshot). Canvas-template
  // publish state lives in `canvas_data.publish`.
  // `clients` namespace removed (refactor/canonical-brand-id-rename
  // 2026-06-03): `/v1/clients*` CRUD + users/projects/access-grants đã bị
  // xoá khỏi BE. Brand CRUD nằm ở `brands` namespace; brand landings dùng
  // canvas-templates assign + clone-to-workspace.
  media: {
    /**
     * Per BE Q17 patch: optional `ids` filter (repeated `?ids=` param) so
     * callers can batch-resolve a known set of media in one request.
     * BE caps at 100 ids, dedups, and silently skips unknowns.
     */
    list: (query?: MediaListQuery) => {
      // Mock short-circuit: when AI template mock is on and we're asked
      // for `mock-media-*` ids, serve them locally so the suggestion
      // dialog renders without hitting BE (which doesn't know these ids).
      if (
        query?.ids?.length &&
        isAiTemplateMockEnabled() &&
        query.ids.some(id => id.startsWith('mock-media-'))
      ) {
        return Promise.resolve(mockMediaList(query.ids));
      }
      const usp = new URLSearchParams();
      for (const id of query?.ids ?? []) usp.append('ids', id);
      if (query?.brand_id) usp.append('brand_id', query.brand_id);
      if (query?.folder_id) usp.append('folder_id', query.folder_id);
      if (query?.media_type) usp.append('media_type', query.media_type);
      if (query?.status) usp.append('status', query.status);
      if (query?.tag) usp.append('tag', query.tag);
      if (query?.q) usp.append('q', query.q);
      if (query?.page) usp.append('page', String(query.page));
      if (query?.limit) usp.append('limit', String(query.limit));
      const qs = usp.toString();
      return rx<MediaListResponse>(`/media${qs ? `?${qs}` : ''}`);
    },
    get: async (id: string): Promise<MediaAsset> => {
      const r = await rx<MediaAssetResponse>(`/media/${id}`);
      return r.media_asset;
    },
    initUpload: (body: InitUploadRequest) =>
      rx<InitUploadResponse>('/media/uploads/init', {
        method: 'POST',
        body,
      }),
    /**
     * Pushes raw bytes to BE (or to the presigned storage URL when
     * `presigned_url` is returned). When using BE proxy upload, the upload_id
     * goes into the path and the body is the file contents.
     */
    uploadRaw: async (uploadId: string, file: File) => {
      const url = `/api/rexer/media/uploads/${uploadId}/raw`;
      const res = await fetch(url, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    },
    completeUpload: (body: CompleteUploadRequest) =>
      rx<CompleteUploadResponse>('/media/uploads/complete', {
        method: 'POST',
        body,
      }),
    /** Rename / re-tag / move 1 asset. */
    update: async (
      id: string,
      body: UpdateMediaRequest
    ): Promise<MediaAsset> => {
      const r = await rx<MediaAssetResponse>(`/media/${id}`, {
        method: 'PATCH',
        body,
      });
      return r.media_asset;
    },
    remove: (id: string) =>
      rx<{ message?: string }>(`/media/${id}`, { method: 'DELETE' }),
    bulkDelete: (ids: string[]) =>
      rx<{ message?: string }>('/media/bulk-delete', {
        method: 'POST',
        body: { ids },
      }),
    bulkMove: (body: BulkMoveMediaRequest) =>
      rx<{ message?: string }>('/media/bulk-move', { method: 'POST', body }),
    // `bindToProject` / `unbindFromProject` removed — project-based landings
    // deprecated. Product bindings still live under `products.bindMedia`.
  },

  // ── Canvas Templates (be-canvas-templates-spec.md) ─────────────────────
  canvasTemplates: {
    list: (query?: {
      brand_id?: string;
      collection_id?: string;
      is_template?: boolean;
      is_active?: boolean;
      q?: string;
      page?: number;
      limit?: number;
      sort?: string;
    }) => rx<CanvasTemplateListResponse>('/canvas-templates', { query }),

    get: async (id: string): Promise<CanvasTemplate> => {
      const r = await rx<CanvasTemplateResponse>(`/canvas-templates/${id}`);
      return r.canvas_template;
    },

    /**
     * Lazy-load full canvas data with ETag handshake.
     * Pass `etag` from a prior response to opt into 304 short-circuit.
     */
    /**
     * Public share-link endpoint — no auth, no cookie. Used by `/p/[id]/[token]`
     * route to render published canvas to anonymous visitors.
     */
    getPublicCanvas: async (
      id: string,
      shareToken: string,
      etag?: string
    ): Promise<PublicCanvasResponse | null> => {
      try {
        return await rx<PublicCanvasResponse>(
          `/public/canvas-templates/${id}/canvas`,
          {
            query: { share_token: shareToken },
            headers: etag ? { 'If-None-Match': etag } : undefined,
          }
        );
      } catch (err) {
        if (
          err &&
          typeof err === 'object' &&
          'status' in err &&
          (err as { status: number }).status === 304
        ) {
          return null;
        }
        throw err;
      }
    },
    getCanvas: async (
      id: string,
      etag?: string
    ): Promise<CanvasDataResponse | null> => {
      try {
        return await rx<CanvasDataResponse>(`/canvas-templates/${id}/canvas`, {
          headers: etag ? { 'If-None-Match': etag } : undefined,
        });
      } catch (err) {
        // 304 surfaces as a 304 status — `rx` throws on !ok. Treat as null
        // so callers can keep their cached payload.
        if (
          err &&
          typeof err === 'object' &&
          'status' in err &&
          (err as { status: number }).status === 304
        ) {
          return null;
        }
        throw err;
      }
    },

    create: async (
      body: CreateCanvasTemplateRequest
    ): Promise<CanvasTemplate> => {
      const r = await rx<CanvasTemplateResponse>('/canvas-templates', {
        method: 'POST',
        body,
      });
      return r.canvas_template;
    },

    update: async (
      id: string,
      body: UpdateCanvasTemplateRequest
    ): Promise<CanvasTemplate> => {
      const r = await rx<CanvasTemplateResponse>(`/canvas-templates/${id}`, {
        method: 'PATCH',
        body,
      });
      return r.canvas_template;
    },

    remove: (id: string) =>
      rx<{ message?: string }>(`/canvas-templates/${id}`, {
        method: 'DELETE',
      }),

    setThumbnail: async (
      id: string,
      thumbnailUrl: string
    ): Promise<CanvasTemplate> => {
      const r = await rx<CanvasTemplateResponse>(
        `/canvas-templates/${id}/thumbnail`,
        { method: 'PUT', body: { thumbnail_url: thumbnailUrl } }
      );
      return r.canvas_template;
    },

    /**
     * Admin/staff hand-off: assign an existing canvas template to a brand
     * (brand + workspace). BE updates brand_id/workspace_id and records
     * the action for the brand's activity feed. See be-todo.md P0.6.
     */
    assignToBrand: (
      id: string,
      body: { brand_id: string; workspace_id?: string; notes?: string }
    ) =>
      rx<CanvasTemplate>(`/canvas-templates/${id}/assign`, {
        method: 'POST',
        body,
      }),

    /**
     * Brand-side "Use this template" clone — deep-copies a public template
     * (is_public_template=true) into the brand's workspace as a new
     * editable landing page. See be-todo.md P0.7.
     */
    cloneToWorkspace: (
      id: string,
      body: { workspace_id?: string; name?: string }
    ) =>
      rx<CanvasTemplate>(`/canvas-templates/${id}/clone-to-workspace`, {
        method: 'POST',
        body,
      }),
  },

  // ── Collections + Records (be-collections-spec.md) ─────────────────────
  collections: {
    list: (query?: {
      is_active?: boolean;
      is_template?: boolean;
      q?: string;
      page?: number;
      limit?: number;
      sort?: string;
    }) => rx<CollectionListResponse>('/collections', { query }),

    get: async (id: string) => {
      const r = await rx<CollectionResponse>(`/collections/${id}`);
      return r.collection;
    },

    create: async (body: CreateCollectionDTO) => {
      const r = await rx<CollectionResponse>('/collections', {
        method: 'POST',
        body,
      });
      return r.collection;
    },

    update: async (id: string, body: UpdateCollectionDTO) => {
      const r = await rx<CollectionResponse>(`/collections/${id}`, {
        method: 'PATCH',
        body,
      });
      return r.collection;
    },

    remove: (id: string) =>
      rx<{ message?: string }>(`/collections/${id}`, { method: 'DELETE' }),

    // ── Records ──
    listRecords: (
      collectionId: string,
      query?: {
        q?: string;
        sort_field?: string;
        sort_direction?: 'asc' | 'desc';
        page?: number;
        limit?: number;
      }
    ) =>
      rx<RecordListResponse>(`/collections/${collectionId}/records`, {
        query,
      }),

    getRecord: async (collectionId: string, recordId: string) => {
      const r = await rx<RecordResponse>(
        `/collections/${collectionId}/records/${recordId}`
      );
      return r.record;
    },

    createRecord: async (
      collectionId: string,
      body: Omit<CreateRecordDTO, 'collection_id'>
    ) => {
      const r = await rx<RecordResponse>(
        `/collections/${collectionId}/records`,
        { method: 'POST', body }
      );
      return r.record;
    },

    updateRecord: async (
      collectionId: string,
      recordId: string,
      body: UpdateRecordDTO
    ) => {
      const r = await rx<RecordResponse>(
        `/collections/${collectionId}/records/${recordId}`,
        { method: 'PATCH', body }
      );
      return r.record;
    },

    deleteRecord: (collectionId: string, recordId: string) =>
      rx<{ message?: string }>(
        `/collections/${collectionId}/records/${recordId}`,
        { method: 'DELETE' }
      ),
  },

  // ── Feedback (be-alpha-spec.md §C) ─────────────────────────────────────
  feedback: {
    create: (body: CreateFeedbackRequest) =>
      rx<FeedbackResponse>('/feedback', { method: 'POST', body }),
    myList: (query?: {
      status?: string;
      category?: string;
      page?: number;
      limit?: number;
      sort?: string;
    }) => rx<FeedbackListResponse>('/feedback/me', { query }),
  },

  // ── AI Usage (be-ai-usage-spec.md) ─────────────────────────────────────
  meAiUsage: {
    /**
     * User self-view — BE forces `user_id = ctx.user_id`. See
     * `docs/be-ai-usage-spec.md` §4.5.
     */
    summary: (query?: AIUsageQuery) =>
      rx<AIUsageSummaryResponse>('/me/ai-usage', {
        query: query as Record<string, string | number | undefined>,
      }),
  },

  adminAiUsage: {
    userSummary: (userId: string, query?: AIUsageQuery) =>
      rx<AIUsageSummaryResponse>(`/admin/users/${userId}/ai-usage`, {
        query: query as Record<string, string | number | undefined>,
      }),
    globalSummary: (query?: AIUsageQuery) =>
      rx<AIUsageGlobalResponse>('/admin/ai-usage', {
        query: query as Record<string, string | number | undefined>,
      }),
    list: (query?: AIUsageListQuery) =>
      rx<AIUsageListResponse>('/admin/ai-usage/list', {
        query: query as Record<string, string | number | undefined>,
      }),
    /** Returns CSV blob — caller should trigger a download. */
    exportCsv: async (query?: AIUsageListQuery): Promise<Blob> => {
      const usp = new URLSearchParams();
      if (query) {
        for (const [k, v] of Object.entries(query)) {
          if (v == null || v === '') continue;
          usp.append(k, String(v));
        }
      }
      const qs = usp.toString();
      const res = await fetch(
        `/api/rexer/admin/ai-usage/export.csv${qs ? `?${qs}` : ''}`,
        { credentials: 'include' }
      );
      if (!res.ok) {
        throw new Error(`CSV export failed: ${res.status}`);
      }
      return res.blob();
    },
  },

  // ── Admin AI Templates ───────────────────────────────────────────────
  adminAiTemplates: {
    list: (query?: {
      is_active?: boolean;
      q?: string;
      page?: number;
      limit?: number;
    }) => rx<AITemplateListResponse>('/admin/ai/templates', { query }),
    get: async (id: string) => {
      const r = await rx<AITemplateResponse>(`/admin/ai/templates/${id}`);
      return r.ai_template;
    },
    create: async (body: CreateAITemplateRequest) => {
      const r = await rx<AITemplateResponse>('/admin/ai/templates', {
        method: 'POST',
        body,
      });
      return r.ai_template;
    },
    update: async (id: string, body: UpdateAITemplateRequest) => {
      const r = await rx<AITemplateResponse>(`/admin/ai/templates/${id}`, {
        method: 'PATCH',
        body,
      });
      return r.ai_template;
    },
    remove: (id: string) =>
      rx<{ message?: string }>(`/admin/ai/templates/${id}`, {
        method: 'DELETE',
      }),
    /**
     * Per BE Q22 patch: dry-run /generate for admin even when the template
     * is_active=false. Does NOT charge the admin's AI quota; still persists
     * to the generation log so admin can scroll history.
     */
    testGenerate: (id: string, body: AITemplateGenerateRequest) =>
      rx<AITemplateGenerateResponse>(
        `/admin/ai/templates/${id}/test-generate`,
        { method: 'POST', body }
      ),
  },

  // ── Saved blocks (server-backed, BE shipped per swagger audit) ─────────
  savedBlocks: {
    list: (query?: {
      brand_id?: string;
      workspace_id?: string;
      scope?: 'private' | 'team' | 'public';
      tag?: string;
      q?: string;
      page?: number;
      limit?: number;
      sort?: string;
    }) => rx<SavedBlockListResponse>('/saved-blocks', { query }),
  },

  templateAnalytics: {
    /** Summary across all published templates (admin). */
    summary: (query?: {
      start?: string;
      end?: string;
      limit?: number;
      sort?: 'views' | 'clicks' | 'visitors' | 'clicks_pct';
    }) =>
      rx<TemplateAnalyticsSummaryRow[]>('/admin/analytics/templates/summary', {
        query,
      }),
    /** Per-block + per-action breakdown for 1 template (admin). */
    breakdown: (templateId: string, query?: { start?: string; end?: string }) =>
      rx<BlockBreakdownRow[]>(
        `/admin/analytics/templates/${templateId}/breakdown`,
        { query }
      ),
    /** Public ingest endpoint — fire from /p/[slug] visitor pages. */
    ingestEvent: (body: AnalyticsEventInput) =>
      rx<void>('/analytics/events', { method: 'POST', body }),
  },

  // ── Workspaces (be-workspace-multitenancy-spec) ────────────────────────
  workspaces: {
    /** List workspaces under a specific client (admin / staff view). */
    listForClient: (clientId: string) =>
      rx<WorkspaceListResponse>(`/clients/${clientId}/workspaces`),
    /** Workspaces the current user belongs to — used by workspace switcher. */
    myMemberships: () => rx<WorkspaceMembership[]>('/me/workspaces'),
    switch: (body: SwitchWorkspaceRequest) =>
      rx<{ message?: string }>('/me/workspace/switch', {
        method: 'POST',
        body,
      }),
    create: async (
      clientId: string,
      body: CreateWorkspaceRequest
    ): Promise<Workspace> =>
      rx<Workspace>(`/admin/clients/${clientId}/workspaces`, {
        method: 'POST',
        body,
      }),
    update: async (
      workspaceId: string,
      body: UpdateWorkspaceRequest
    ): Promise<Workspace> =>
      rx<Workspace>(`/admin/workspaces/${workspaceId}`, {
        method: 'PATCH',
        body,
      }),
    remove: (workspaceId: string) =>
      rx<{ message?: string }>(`/admin/workspaces/${workspaceId}`, {
        method: 'DELETE',
      }),
  },

  // ── Media folders (Drive-style hierarchy) ──────────────────────────────
  mediaFolders: {
    /** List child folders of `parent_id` (omit param to fetch root).
     *  `brand_id` cho platform admin scope vào brand cụ thể (BE spec). */
    list: (query?: { parent_id?: string; brand_id?: string }) =>
      rx<MediaFolderListResponse>('/media/folders', { query }),
    get: (id: string) => rx<MediaFolder>(`/media/folders/${id}`),
    create: (body: CreateMediaFolderRequest) =>
      rx<MediaFolder>('/media/folders', { method: 'POST', body }),
    update: (id: string, body: UpdateMediaFolderRequest) =>
      rx<MediaFolder>(`/media/folders/${id}`, { method: 'PATCH', body }),
    remove: (id: string) =>
      rx<{ message?: string }>(`/media/folders/${id}`, { method: 'DELETE' }),
  },

  // ── Template comments (review threads on a landing page) ──────────────
  templateComments: {
    list: (templateId: string) =>
      rx<TemplateCommentListResponse>(
        `/portal/templates/${templateId}/comments`
      ),
    create: (templateId: string, body: CreateTemplateCommentRequest) =>
      rx<TemplateComment>(`/portal/templates/${templateId}/comments`, {
        method: 'POST',
        body,
      }),
    update: (commentId: string, body: UpdateTemplateCommentRequest) =>
      rx<TemplateComment>(`/portal/comments/${commentId}`, {
        method: 'PATCH',
        body,
      }),
    remove: (commentId: string) =>
      rx<{ message?: string }>(`/portal/comments/${commentId}`, {
        method: 'DELETE',
      }),
    resolve: (commentId: string) =>
      rx<TemplateComment>(`/portal/comments/${commentId}/resolve`, {
        method: 'POST',
      }),
  },

  // ── Notifications (portal bell) ────────────────────────────────────────
  notifications: {
    list: (query?: { unread?: boolean; page?: number; limit?: number }) =>
      rx<NotificationListResponse>('/portal/notifications', { query }),
    unreadCount: () =>
      rx<UnreadCountResponse>('/portal/notifications/unread-count'),
    markRead: (body: MarkReadRequest) =>
      rx<Record<string, number>>('/portal/notifications/mark-read', {
        method: 'POST',
        body,
      }),
  },

  // ── Activity feed (per-workspace audit log) ───────────────────────────
  activityFeed: {
    list: (query?: { workspace_id?: string; limit?: number }) =>
      rx<ActivityFeedResponse>('/portal/activity', { query }),
  },

  // ── Portal (Phase 2 — brand-side) ─────────────────────────────────────
  portal: {
    /** Brand dashboard top-cards + 7d trend. */
    dashboardSummary: () =>
      rx<PortalDashboardSummary>('/portal/dashboard/summary'),
    /** Brand-scoped list of canvas templates the user can manage. */
    listTemplates: (query?: {
      status?: string;
      workspace_id?: string;
      page?: number;
      limit?: number;
    }) => rx<PortalTemplateListResponse>('/portal/templates', { query }),
    /** Block breakdown for stats overlay — brand-accessible mirror of admin. */
    templateBreakdown: (
      templateId: string,
      query?: { start?: string; end?: string }
    ) =>
      rx<BlockBreakdownRow[]>(`/portal/templates/${templateId}/breakdown`, {
        query,
      }),
    /** Cross-template comment digest (replaces FAKE_THREADS on /portal/comments). */
    listComments: (query?: {
      status?: 'open' | 'resolved';
      workspace_id?: string;
      page?: number;
      limit?: number;
    }) => rx<PortalCommentListResponse>('/portal/comments', { query }),
    /** Brand-side workspace create (auto-scoped by ctx.brand_id). */
    createWorkspace: (body: CreateWorkspaceRequest) =>
      rx<Workspace>('/portal/workspaces', { method: 'POST', body }),
    /** Activity feed mark-seen — clears the unread badge state. */
    markActivitySeen: () =>
      rx<{ message?: string }>('/portal/activity/mark-seen', {
        method: 'POST',
      }),
    /**
     * Public template library — Rexer-curated canvas templates brand can
     * clone into their workspace. See be-todo.md P0.7.
     */
    listTemplateLibrary: (query?: {
      q?: string;
      category?: string;
      page?: number;
      limit?: number;
      sort?: string;
    }) =>
      rx<CanvasTemplateListResponse>('/portal/templates/library', { query }),

    /**
     * Brand creates a new landing — auto-scoped to ctx.brand_id, defaults to
     * ctx.active_workspace_id when `workspace_id` is omitted. See be-todo.md P0.2.
     */
    createTemplate: (body: CreatePortalTemplateRequest) =>
      rx<PortalTemplate>('/portal/templates', { method: 'POST', body }),

    // ── Profile / brand / members (be-todo.md P0.3) ──────────────────────
    me: {
      /**
       * Brand profile (name, contact, logo). Read by every authenticated brand user.
       * BE bọc response trong `{ client: {...} }` — unwrap để form bind đúng field
       * (nếu BE đổi sang flat sau này thì `?? r` vẫn chạy). Xem be ping-list 2026-06-04.
       */
      client: async () => {
        const r = await rx<PortalClient | { client: PortalClient }>(
          '/portal/me/client'
        );
        return ((r as { client?: PortalClient })?.client ?? r) as PortalClient;
      },
      updateClient: (body: UpdatePortalClientRequest) =>
        rx<PortalClient>('/portal/me/client', { method: 'PATCH', body }),
      /** List of users with access to this brand. Optional role filter. */
      members: (query?: { role?: PortalMemberRole }) =>
        rx<PortalMemberListResponse>('/portal/me/members', { query }),
      inviteMember: (body: InvitePortalMemberRequest) =>
        rx<InvitePortalMemberResponse>('/portal/me/members', {
          method: 'POST',
          body,
        }),
      updateMemberRole: (userId: string, body: UpdatePortalMemberRoleRequest) =>
        rx<PortalMember>(`/portal/me/members/${userId}/role`, {
          method: 'PATCH',
          body,
        }),
      removeMember: (userId: string) =>
        rx<void>(`/portal/me/members/${userId}`, { method: 'DELETE' }),
      /** Update own display name / avatar (any brand role). */
      update: (body: UpdatePortalMeRequest) =>
        rx<{ user_id: string; display_name?: string; avatar_url?: string }>(
          '/portal/me',
          { method: 'PATCH', body }
        ),
      /** Avatar upload — multipart binary. */
      uploadAvatar: async (file: File): Promise<{ avatar_url: string }> => {
        const fd = new FormData();
        fd.append('avatar', file);
        return rx<{ avatar_url: string }>('/portal/me/avatar', {
          method: 'POST',
          body: fd,
        });
      },
    },
  },

  // ── Portal Ads ────────────────────────────────────────────────────────
  portalAds: {
    listChannels: () => rx<PortalAdChannelListResponse>('/portal/ads/channels'),
    listCampaigns: (query?: {
      status?: string;
      channel?: string;
      workspace_id?: string;
      page?: number;
      limit?: number;
    }) => rx<PortalAdCampaignListResponse>('/portal/ads/campaigns', { query }),
    // BE wraps the single campaign in `{ campaign }` (verified live 2026-06).
    getCampaign: (id: string) =>
      rx<{ campaign: PortalAdCampaign }>(`/portal/ads/campaigns/${id}`),
    createCampaign: (body: CreatePortalAdCampaignRequest) =>
      rx<{ campaign: PortalAdCampaign }>('/portal/ads/campaigns', {
        method: 'POST',
        body,
      }),
    updateCampaign: (id: string, body: UpdatePortalAdCampaignRequest) =>
      rx<{ campaign: PortalAdCampaign }>(`/portal/ads/campaigns/${id}`, {
        method: 'PATCH',
        body,
      }),
    deleteCampaign: (id: string) =>
      rx<{ message?: string }>(`/portal/ads/campaigns/${id}`, {
        method: 'DELETE',
      }),
    // Brand-scoped read of manually-entered metrics (summary + daily, incl. reach).
    getMetrics: (id: string, query?: { from?: string; to?: string }) =>
      rx<PortalAdMetricsResponse>(`/portal/ads/campaigns/${id}/metrics`, {
        query,
      }),
    // Staff-only upsert of daily metrics (idempotent per date). Route lives under
    // /admin (staff scope) per spec §A; brand-bound staff limited to own brand.
    upsertMetrics: (id: string, body: UpsertAdMetricsRequest) =>
      rx<PortalAdMetricsResponse>(`/admin/campaigns/${id}/metrics`, {
        method: 'PUT',
        body,
      }),
  },

  // ── Micro-sites (spec §B) ─────────────────────────────────────────────
  // Reads brand-scoped (staff pass ?brand_id); writes staff-only. BE wraps the
  // single site in `{ micro_site }`; list/analytics are flat.
  microSites: {
    list: (query?: {
      brand_id?: string;
      workspace_id?: string;
      status?: string;
      page?: number;
      limit?: number;
    }) => rx<MicroSiteListResponse>('/portal/micro-sites', { query }),
    get: async (id: string): Promise<MicroSite> => {
      const r = await rx<{ micro_site: MicroSite }>(
        `/portal/micro-sites/${id}`
      );
      return r.micro_site;
    },
    analytics: (id: string, query?: { from?: string; to?: string }) =>
      rx<MicroSiteAnalytics>(`/portal/micro-sites/${id}/analytics`, { query }),
    create: async (body: CreateMicroSiteRequest): Promise<MicroSite> => {
      const r = await rx<{ micro_site: MicroSite }>('/admin/micro-sites', {
        method: 'POST',
        body,
      });
      return r.micro_site;
    },
    update: async (
      id: string,
      body: UpdateMicroSiteRequest
    ): Promise<MicroSite> => {
      const r = await rx<{ micro_site: MicroSite }>(
        `/admin/micro-sites/${id}`,
        {
          method: 'PATCH',
          body,
        }
      );
      return r.micro_site;
    },
    remove: (id: string) =>
      rx<{ archived: boolean }>(`/admin/micro-sites/${id}`, {
        method: 'DELETE',
      }),

    // ── Pages (managed list, spec §A) ──────────────────────────────────
    listPages: async (id: string): Promise<MicroSitePage[]> => {
      const r = await rx<{ items: MicroSitePage[] }>(
        `/portal/micro-sites/${id}/pages`
      );
      return r.items ?? [];
    },
    createPage: async (
      id: string,
      body: CreateMicroSitePageRequest
    ): Promise<MicroSitePage> => {
      const r = await rx<{ page: MicroSitePage }>(
        `/admin/micro-sites/${id}/pages`,
        { method: 'POST', body }
      );
      return r.page;
    },
    updatePage: async (
      id: string,
      pageId: string,
      body: UpdateMicroSitePageRequest
    ): Promise<MicroSitePage> => {
      const r = await rx<{ page: MicroSitePage }>(
        `/admin/micro-sites/${id}/pages/${pageId}`,
        { method: 'PATCH', body }
      );
      return r.page;
    },
    removePage: (id: string, pageId: string) =>
      rx<{ archived: boolean }>(`/admin/micro-sites/${id}/pages/${pageId}`, {
        method: 'DELETE',
      }),

    // ── Manual metrics (staff fallback, spec §B) ───────────────────────
    // Returns the refreshed merged analytics (ingest wins, manual fallback).
    upsertMetrics: (id: string, body: UpsertMicroSiteMetricsRequest) =>
      rx<MicroSiteAnalytics>(`/admin/micro-sites/${id}/metrics`, {
        method: 'PUT',
        body,
      }),
  },

  // ── Public pages (published render source) ────────────────────────────
  // Same source the live /p/{slug} page renders from — its canvas_blueprint
  // matches what analytics events were tracked against.
  publicPages: {
    get: (slug: string) =>
      rx<PublicPageResponse>(`/public/pages/${encodeURIComponent(slug)}`),
  },

  // ── Tracking keys (brand analytics ingest credential) ─────────────────
  // Read = priv (brand user của brand đó, hoặc staff kèm ?brand_id).
  // Write = internal (staff/admin only). Plaintext `key` chỉ trả ở create +
  // rotate. Key revoked KHÔNG xuất hiện trong list.
  trackingKeys: {
    list: (query?: { brand_id?: string; page?: number; limit?: number }) =>
      rx<TrackingKeyListResponse>('/portal/tracking-keys', { query }),
    create: (body: CreateTrackingKeyRequest) =>
      rx<CreateTrackingKeyResponse>('/admin/tracking-keys', {
        method: 'POST',
        body,
      }),
    update: async (
      id: string,
      body: UpdateTrackingKeyRequest
    ): Promise<TrackingKey> => {
      const r = await rx<{ tracking_key: TrackingKey }>(
        `/admin/tracking-keys/${id}`,
        { method: 'PATCH', body }
      );
      return r.tracking_key;
    },
    rotate: (id: string) =>
      rx<CreateTrackingKeyResponse>(`/admin/tracking-keys/${id}/rotate`, {
        method: 'POST',
      }),
    revoke: (id: string) =>
      rx<{ revoked: boolean }>(`/admin/tracking-keys/${id}`, {
        method: 'DELETE',
      }),
  },

  // ── Staff inbox (admin/staff task queue) ──────────────────────────────
  // ── Admin block-types catalog (architecture spec §4.2) ────────────────
  adminBlockTypes: {
    // A2 (be-response §A2): GET list/read canonical là `/block-types`
    // (shape khác: code/name/description). `/admin/block-types` CHỈ có
    // POST/PATCH/DELETE. Map catalog → AdminBlockType (type=code,
    // label_vi=name…). Filter `is_active` làm client-side (BE list chưa
    // hỗ trợ ?is_active) — xem AdminBlockTypesPage.
    list: async (query?: {
      surface?: string;
      category?: string;
      q?: string;
    }): Promise<{ items: AdminBlockType[] }> => {
      const r = await rx<{ items: Array<Record<string, any>> }>(
        '/block-types',
        { query }
      );
      return { items: (r.items ?? []).map(toAdminBlockType) };
    },
    get: async (code: string): Promise<AdminBlockType> =>
      toAdminBlockType(await rx<Record<string, any>>(`/block-types/${code}`)),
    create: (body: CreateAdminBlockTypeRequest) =>
      rx<AdminBlockType>('/admin/block-types', { method: 'POST', body }),
    update: (code: string, body: UpdateAdminBlockTypeRequest) =>
      rx<AdminBlockType>(`/admin/block-types/${code}`, {
        method: 'PATCH',
        body,
      }),
    remove: (code: string) =>
      rx<{ message?: string }>(`/admin/block-types/${code}`, {
        method: 'DELETE',
      }),
  },

  // ── Admin Users (global, cross-brand) — per audit BE shipped 2026-05-24
  adminUsers: {
    list: (query?: {
      role?: string;
      status?: string;
      q?: string;
      page?: number;
      limit?: number;
    }) =>
      rx<{ items: AdminUser[]; total?: number; page?: number; limit?: number }>(
        '/admin/users',
        { query }
      ),
  },

  staffInbox: {
    list: (query?: { status?: string; kind?: string; assignee_id?: string }) =>
      rx<StaffInboxListResponse>('/admin/inbox', { query }),
    take: (itemId: string) =>
      rx<StaffInboxItem>(`/admin/inbox/${itemId}/take`, { method: 'POST' }),
    done: (itemId: string) =>
      rx<StaffInboxItem>(`/admin/inbox/${itemId}/done`, { method: 'POST' }),
  },

  adminFeedback: {
    list: (query?: AdminFeedbackQuery) =>
      rx<FeedbackListResponse>('/admin/feedback', {
        query: query as Record<string, string | number | undefined>,
      }),
    update: (id: string, body: UpdateFeedbackRequest) =>
      rx<FeedbackResponse>(`/admin/feedback/${id}`, {
        method: 'PATCH',
        body,
      }),
    /** Returns CSV blob — caller should trigger a download. */
    exportCsv: async (query?: AdminFeedbackQuery): Promise<Blob> => {
      const usp = new URLSearchParams();
      if (query) {
        for (const [k, v] of Object.entries(query)) {
          if (v == null || v === '') continue;
          usp.append(k, String(v));
        }
      }
      const qs = usp.toString();
      const res = await fetch(
        `/api/rexer/admin/feedback/export.csv${qs ? `?${qs}` : ''}`,
        { credentials: 'include' }
      );
      if (!res.ok) {
        throw new Error(`CSV export failed: ${res.status}`);
      }
      return res.blob();
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CANONICAL NAMESPACES (Rexer Architecture Final 2026-05-23)
  // Added 2026-05-24. Wave 1 of fe-canonical-cutover-migration-plan.md.
  // Wave 2 (next) will swap call sites from legacy → canonical, then
  // legacy namespaces above can be deleted.
  // ═══════════════════════════════════════════════════════════════════════

  // ── Brands (canonical, replaces `clients`) ───────────────────────────
  brands: {
    list: (query?: {
      status?: string;
      q?: string;
      page?: number;
      limit?: number;
    }) => rx<BrandListResponse>('/brands', { query }),
    get: async (id: string): Promise<Brand> => {
      const r = await rx<BrandResponse | Brand>(`/brands/${id}`);
      return unwrapBrand(r);
    },
    create: async (body: CreateBrandRequest): Promise<Brand> => {
      const r = await rx<BrandResponse | Brand>('/brands', {
        method: 'POST',
        body,
      });
      return unwrapBrand(r);
    },
    update: async (id: string, body: UpdateBrandRequest): Promise<Brand> => {
      const r = await rx<BrandResponse | Brand>(`/brands/${id}`, {
        method: 'PATCH',
        body,
      });
      return unwrapBrand(r);
    },
    remove: (id: string) =>
      rx<{ message?: string }>(`/brands/${id}`, { method: 'DELETE' }),

    // ── Brand membership (replaces `clients.users` + `inviteUser`) ──
    users: (brandId: string, query?: { role?: string }) =>
      rx<BrandUserListResponse>(`/brands/${brandId}/users`, { query }),
    inviteUser: (brandId: string, body: InviteBrandUserRequest) =>
      rx<InviteBrandUserResponse>(`/brands/${brandId}/users`, {
        method: 'POST',
        body,
      }),
    updateUser: (
      brandId: string,
      userId: string,
      body: UpdateBrandUserRequest
    ) =>
      rx<BrandUser>(`/brands/${brandId}/users/${userId}`, {
        method: 'PATCH',
        body,
      }),
    removeUser: (brandId: string, userId: string) =>
      rx<{ message?: string }>(`/brands/${brandId}/users/${userId}`, {
        method: 'DELETE',
      }),

    // BE 2026-05-26 ship Option A: canonical `/brands/:id/workspaces` LIVE,
    // response field dùng `brand_id`. Create vẫn dùng admin
    // legacy path per swagger (`POST /admin/clients/:id/workspaces`); chưa có
    // canonical create cho workspace.
    workspaces: {
      list: (brandId: string) =>
        rx<WorkspaceListResponse>(`/brands/${brandId}/workspaces`),
      create: (brandId: string, body: CreateWorkspaceRequest) =>
        rx<Workspace>(`/admin/clients/${brandId}/workspaces`, {
          method: 'POST',
          body,
        }),
    },

    // ── Custom domains nested under brand ───────────────────────────────
    // BE shape probed 2026-05-31:
    //   POST requires workspace_id (swagger says optional but server rejects
    //   400 ERR_BAD_REQUEST: workspace_id is required).
    //   Response: {domain: BrandDomain, dns_records: [{type, name, value}]}.
    //   GET returns {items, total}.
    domains: {
      list: (brandId: string) =>
        rx<BrandDomainListResponse>(`/brands/${brandId}/domains`),
      create: (brandId: string, body: CreateBrandDomainRequest) =>
        rx<CreateBrandDomainResponse>(`/brands/${brandId}/domains`, {
          method: 'POST',
          body,
        }),
      verify: (brandId: string, domainId: string) =>
        rx<VerifyBrandDomainResponse>(
          `/brands/${brandId}/domains/${domainId}/verify`,
          { method: 'POST' }
        ),
      /** Bind / rebind the landing page a domain serves. */
      update: (
        brandId: string,
        domainId: string,
        body: UpdateBrandDomainRequest
      ) =>
        rx<BrandDomainResponse>(`/brands/${brandId}/domains/${domainId}`, {
          method: 'PATCH',
          body,
        }),
      remove: (brandId: string, domainId: string) =>
        rx<{ message?: string }>(`/brands/${brandId}/domains/${domainId}`, {
          method: 'DELETE',
        }),
    },

    // ── Per-brand activity audit (replaces brand-scoped activityFeed) ──
    activity: (
      brandId: string,
      query?: { entity_type?: string; from?: string; to?: string }
    ) => rx<ActivityFeedResponse>(`/brands/${brandId}/activity`, { query }),
  },

  // ── Pages (canonical, replaces `projects` + `canvasTemplates` instance) ──
  pages: {
    /**
     * List pages in a workspace. Filter `type` to scope to landing/ad/curate.
     * Replaces `canvasTemplates.list({ brand_id, workspace_id })`.
     */
    list: (
      workspaceId: string,
      query?: {
        type?: PageType;
        status?: string;
        q?: string;
        page?: number;
        limit?: number;
      }
    ) => rx<PageListResponse>(`/workspaces/${workspaceId}/pages`, { query }),
    /**
     * Cross-workspace flat list — admin/staff view of all pages across
     * brands. Shipped 2026-05-30 (not yet in swagger). All params optional;
     * filter by `type`, `brand_id`, `workspace_id`, `status`, free-text `q`.
     */
    listAll: (query?: {
      type?: PageType;
      status?: string;
      brand_id?: string;
      workspace_id?: string;
      q?: string;
      page?: number;
      limit?: number;
      sort?: string;
    }) => rx<PageListResponse>('/pages', { query }),
    /** Brand create — page seeded from a template. */
    create: async (
      workspaceId: string,
      body: CreatePageRequest
    ): Promise<Page> => {
      const r = await rx<PageResponse>(`/workspaces/${workspaceId}/pages`, {
        method: 'POST',
        body,
      });
      return r.page;
    },
    get: async (id: string): Promise<Page> => {
      const r = await rx<PageResponse>(`/pages/${id}`);
      return r.page;
    },
    update: async (id: string, body: UpdatePageRequest): Promise<Page> => {
      const r = await rx<PageResponse>(`/pages/${id}`, {
        method: 'PATCH',
        body,
      });
      return r.page;
    },
    /** Soft archive (status='archived', releases deactivate). */
    archive: (id: string) =>
      rx<{ message?: string }>(`/pages/${id}`, { method: 'DELETE' }),
    restore: (id: string) =>
      rx<PageResponse>(`/pages/${id}/restore`, { method: 'POST' }),

    /** Hard delete — xoá vĩnh viễn page khỏi DB (irreversible).
     *  BE TODO 2026-05-31 (be-audit §19): endpoint chưa exist. Khi BE
     *  ship sẽ là `DELETE /v1/pages/:id?force=true` (preferred) hoặc
     *  `DELETE /v1/pages/:id/purge`. FE đang stub behind feature flag
     *  NEXT_PUBLIC_ENABLE_HARD_DELETE_PAGES. */
    purge: (id: string) =>
      rx<{ message?: string }>(`/pages/${id}?force=true`, { method: 'DELETE' }),

    /** Autosave config — debounced from form editor. */
    saveConfig: (id: string, body: SavePageConfigRequest) =>
      rx<{ revision_no: number; saved_at: string }>(`/pages/${id}/config`, {
        method: 'POST',
        body,
      }),

    revisions: (id: string, query?: { page?: number; limit?: number }) =>
      rx<PageRevisionListResponse>(`/pages/${id}/revisions`, { query }),

    revertRevision: (id: string, revisionNo: number) =>
      rx<{ revision_no: number }>(
        `/pages/${id}/revisions/${revisionNo}/revert`,
        { method: 'POST' }
      ),

    publishValidate: (id: string) =>
      rx<PublishPageValidateResponse>(`/pages/${id}/publish/validate`, {
        method: 'POST',
      }),
    publish: (id: string, body?: PublishPageRequest) =>
      rx<PublishPageResponse>(`/pages/${id}/publish`, {
        method: 'POST',
        body: body ?? {},
      }),
    unpublish: (id: string) =>
      rx<{ message?: string }>(`/pages/${id}/unpublish`, { method: 'POST' }),

    releases: {
      list: (pageId: string) =>
        rx<PageReleaseListResponse>(`/pages/${pageId}/releases`),
      get: (pageId: string, releaseId: string) =>
        rx<PageRelease>(`/pages/${pageId}/releases/${releaseId}`),
      activate: (pageId: string, releaseId: string) =>
        rx<{ message?: string }>(
          `/pages/${pageId}/releases/${releaseId}/activate`,
          { method: 'POST' }
        ),
    },

    /** Ad-type only — download rendered PNG/MP4. */
    export: (id: string, format: 'png' | 'mp4' | 'html5') =>
      rx<{ url: string; expires_at: string }>(`/pages/${id}/export`, {
        query: { format },
      }),
    /** Curate-type only — return embed snippet code. */
    embedSnippet: (id: string) =>
      rx<{ snippet: string; embed_token: string }>(
        `/pages/${id}/embed-snippet`
      ),

    /** Set page thumbnail. Replaces `canvasTemplates.setThumbnail`. */
    setThumbnail: async (id: string, thumbnailUrl: string): Promise<Page> => {
      const r = await rx<PageResponse>(`/pages/${id}/thumbnail`, {
        method: 'PUT',
        body: { thumbnail_url: thumbnailUrl },
      });
      return r.page;
    },

    analytics: {
      summary: (id: string, query?: { range?: string }) =>
        rx<PageAnalyticsSummary>(`/pages/${id}/analytics/summary`, { query }),
      blocks: (id: string, query?: { range?: string }) =>
        rx<PageAnalyticsBlocksResponse>(`/pages/${id}/analytics/blocks`, {
          query,
        }),
      /**
       * GA-style generic breakdown (spec §17). `group_by` is a whitelisted
       * key — `dimensions.section_id`, `dimensions.cta_id`,
       * `dimensions.variant`, `block_key`, `event_type`, … Used for code
       * templates which track sections via `dimensions.section_id` instead
       * of canvas blocks.
       */
      breakdown: (
        id: string,
        query: {
          group_by: string;
          event_type?: string;
          range?: string;
          from?: string;
          to?: string;
        }
      ) =>
        rx<PageAnalyticsBreakdownResponse>(`/pages/${id}/analytics/breakdown`, {
          query,
        }),
    },
  },

  // ── Admin pages — admin/staff assign template to brand workspace ─────
  adminPages: {
    /** Replaces `canvasTemplates.assignToBrand`. */
    fromTemplate: async (body: {
      template_id: string;
      template_version_id?: string;
      brand_id: string;
      workspace_id: string;
      name: string;
      type?: PageType;
      handoff_notes?: string;
    }): Promise<Page> => {
      const r = await rx<PageResponse>('/admin/pages/from-template', {
        method: 'POST',
        body,
      });
      return r.page;
    },
  },

  // ── Blocks (canonical CRUD, replaces `savedBlocks`) ──────────────────
  blocks: {
    list: (query?: {
      scope?: BlockScope;
      type_code?: string;
      brand_id?: string;
      workspace_id?: string;
      surface?: PageType;
      tag?: string;
      q?: string;
      page?: number;
      limit?: number;
      sort?: string;
    }) => rx<BlockListResponse>('/blocks', { query }),
    get: async (id: string): Promise<Block> => {
      const r = await rx<BlockResponse>(`/blocks/${id}`);
      return r.block;
    },
    create: async (body: CreateBlockRequest): Promise<Block> => {
      // BE 2026-05-30: blocks.tags column NOT NULL, Go zero value nil → 500.
      // Always send empty array if caller omits to match canonical default.
      const r = await rx<BlockResponse>('/blocks', {
        method: 'POST',
        body: { ...body, tags: body.tags ?? [] },
      });
      return r.block;
    },
    update: async (id: string, body: UpdateBlockRequest): Promise<Block> => {
      const r = await rx<BlockResponse>(`/blocks/${id}`, {
        method: 'PATCH',
        body,
      });
      return r.block;
    },
    /** Soft archive. */
    archive: (id: string) =>
      rx<{ message?: string }>(`/blocks/${id}`, { method: 'DELETE' }),
    clone: async (id: string, body?: { name?: string }): Promise<Block> => {
      const r = await rx<BlockResponse>(`/blocks/${id}/clone`, {
        method: 'POST',
        body: body ?? {},
      });
      return r.block;
    },
    /** Increment usage_count when a block is added to a template/page. */
    use: (id: string) =>
      rx<{ usage_count: number }>(`/blocks/${id}/use`, { method: 'POST' }),
  },

  // ── BlockTypes public read (admin CRUD already at `adminBlockTypes`) ─
  blockTypes: {
    list: (query?: {
      surface?: PageType;
      category?: string;
      is_active?: boolean;
    }) => rx<{ items: unknown[] }>('/block-types', { query }),
    get: (code: string) => rx<unknown>(`/block-types/${code}`),
  },

  // ── AI Jobs (canonical async, replaces 8 legacy `ai.*` endpoints) ────
  aiJobs: {
    templateDraft: async (body: AITemplateDraftInput): Promise<AIJob> => {
      const r = await rx<AIJobResponse>('/ai/template-draft', {
        method: 'POST',
        body,
      });
      return r.job;
    },
    slotSuggest: async (body: AISlotSuggestInput): Promise<AIJob> => {
      const r = await rx<AIJobResponse>('/ai/slot-suggest', {
        method: 'POST',
        body,
      });
      return r.job;
    },
    pageOptimize: async (body: AIPageOptimizeInput): Promise<AIJob> => {
      const r = await rx<AIJobResponse>('/ai/page-optimize', {
        method: 'POST',
        body,
      });
      return r.job;
    },
    imageGenerate: async (body: AIImageGenerateInput): Promise<AIJob> => {
      const r = await rx<AIJobResponse>('/ai/image-generate', {
        method: 'POST',
        body,
      });
      return r.job;
    },
    /** Poll until completion or fail. Caller passes signal for cancellation. */
    get: async (jobId: string): Promise<AIJob> => {
      const r = await rx<AIJobResponse>(`/ai/jobs/${jobId}`);
      return r.job;
    },
    /** Accept/reject a suggestion. */
    respondSuggestion: (
      suggestionId: string,
      body: RespondAISlotSuggestionRequest
    ) =>
      rx<AISlotSuggestion>(`/ai/slot-suggestions/${suggestionId}`, {
        method: 'PATCH',
        body,
      }),
  },

  // ── AI-Insights (experience strategy blueprint) ───────────────────────
  // Tenant-scoped dưới `/v1/insights/*` (priv group). Prefill chạy đồng bộ;
  // tạo report enqueue job experience_insights (202) → FE poll `get(id, true)`
  // tới status terminal (succeeded|failed). Routes/shapes khớp openapi.yaml.
  insights: {
    /** Resolve context DB + list field chiến lược còn thiếu (đồng bộ, không enqueue job). */
    prefill: (body: InsightPrefillRequest) =>
      rx<PrefillResult>('/insights/prefill', { method: 'POST', body }),
    /** Tạo report + enqueue job (202). BE bọc trong `{ report }`. */
    create: async (body: CreateInsightReportBody) => {
      const r = await rx<InsightReportResponse>('/insights/reports', {
        method: 'POST',
        body,
      });
      return r.report;
    },
    /** Lấy 1 report; `includeSteps` gắn `?include=steps` để kèm engine trace. */
    get: async (id: string, includeSteps = false) => {
      const r = await rx<InsightReportResponse>(`/insights/reports/${id}`, {
        query: includeSteps ? { include: 'steps' } : undefined,
      });
      return r.report;
    },
    /** List report của brand caller (BE pin non-admin về brand của họ). */
    list: (query?: {
      workspace_id?: string;
      product_id?: string;
      campaign_id?: string;
    }) => rx<InsightReportListResponse>('/insights/reports', { query }),
    /** Đổi tên 1 report (KB6). BE bọc `{ report }`. */
    update: async (id: string, body: { title?: string }) => {
      const r = await rx<InsightReportResponse>(`/insights/reports/${id}`, {
        method: 'PATCH',
        body,
      });
      return r.report;
    },
    /** Xoá 1 report, cascade steps (KB6). */
    remove: (id: string) =>
      rx<{ archived?: boolean }>(`/insights/reports/${id}`, {
        method: 'DELETE',
      }),
    /** Lưu blocks/journey user đã chỉnh trong blueprint (merge từng section) — KB3. */
    updateBlueprint: async (id: string, body: UpdateInsightBlueprintBody) => {
      const r = await rx<InsightReportResponse>(
        `/insights/reports/${id}/blueprint`,
        { method: 'PATCH', body }
      );
      return r.report;
    },
    /** Dựng template thật từ blueprint → `template_id` + `edit_url` — KB2. */
    handoff: (
      id: string,
      body?: { template?: { name?: string; block_codes?: string[] } }
    ) =>
      rx<InsightHandoffResponse>(`/insights/reports/${id}/handoff`, {
        method: 'POST',
        body: body ?? {},
      }),
    /** Sinh nội dung mẫu cho 1 block (khớp props_schema của block type) — KB4. */
    generateBlockContent: (body: GenerateBlockContentBody) =>
      rx<GenerateBlockContentResponse>('/insights/blocks/generate-content', {
        method: 'POST',
        body,
      }),

    // ── Wizard v2: thao tác tương tác đồng bộ (xem be-spec-insights-wizard-v2) ──
    // 3 endpoint dưới CÓ THỂ chưa deploy ở BE → mỗi method nuốt lỗi và trả `null`
    // để FE tự rơi về lớp heuristic client. Khi BE live, FE nhận data thật, UI
    // không đổi. KHÔNG throw ra ngoài.

    /** Gợi ý lũy tiến cho 1 bước. `null` nếu BE chưa hỗ trợ. */
    suggest: async (body: {
      step: string;
      brief: InsightBrief;
      workspace_id?: string;
      product_id?: string;
      campaign_id?: string;
    }): Promise<InsightSuggestResponse | null> => {
      try {
        return await rx<InsightSuggestResponse>('/insights/suggest', {
          method: 'POST',
          body,
        });
      } catch {
        return null;
      }
    },

    /** Xếp hạng Experience Goal từ brief. `null` nếu BE chưa hỗ trợ. */
    classifyGoal: async (body: {
      brief: InsightBrief;
      workspace_id?: string;
      product_id?: string;
      campaign_id?: string;
    }): Promise<ClassifyGoalResponse | null> => {
      try {
        return await rx<ClassifyGoalResponse>('/insights/classify-goal', {
          method: 'POST',
          body,
        });
      } catch {
        return null;
      }
    },

    /** Đề xuất journey theo goal đã chốt. `null` nếu BE chưa hỗ trợ. */
    suggestJourney: async (body: {
      primary_goal: ExperienceGoal;
      secondary_goal?: ExperienceGoal | null;
      brief: InsightBrief;
      workspace_id?: string;
      product_id?: string;
      campaign_id?: string;
    }): Promise<SuggestJourneyResponse | null> => {
      try {
        return await rx<SuggestJourneyResponse>('/insights/suggest-journey', {
          method: 'POST',
          body,
        });
      } catch {
        return null;
      }
    },
  },

  // ── Analytics ingest (canonical `/v1/track`, replaces `/analytics/events`) ─
  // BE wired anti-spam 3-layer middleware (rate-limit + UA filter + HMAC visitor token).
  // Shape pending BE confirmation per handoff §9 q3.
  track: {
    /** Fire a single event. Tracker batches via `events` instead for prod. */
    event: (body: TrackEventInput) =>
      rx<void>('/track', { method: 'POST', body }),
    /** Batch up to 50 events per request — prefer this from tracker.ts. */
    batch: (body: TrackBatchRequest) =>
      rx<void>('/track', { method: 'POST', body }),
  },
};
