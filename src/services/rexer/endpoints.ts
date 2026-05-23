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
  AILandingDraftRequest,
  AILandingDraftResponse,
  AILandingOptimizeRequest,
  AILandingOptimizeResponse,
  AIMediaSuggestRequest,
  AIMediaSuggestResponse,
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
  BindMediaRequest,
  BindMediaResponse,
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
  Client,
  ClientAccessGrant,
  ClientAccessGrantResponse,
  ClientListResponse,
  ClientPortalAnalyticsResponse,
  ClientPortalProject,
  ClientPortalProjectListResponse,
  ClientPortalProjectResponse,
  ClientPortalReportsResponse,
  ClientProjectListResponse,
  ClientResponse,
  ClientUser,
  ClientUserListResponse,
  ClientUserResponse,
  CompleteUploadRequest,
  CompleteUploadResponse,
  CreateCampaignRequest,
  CreateClientAccessGrantRequest,
  CloneProductRequest,
  CreateClientRequest,
  CreateClientUserRequest,
  CreateClientUserResponse,
  CreateProductCategoryRequest,
  CreateProductRequest,
  DashboardSummary,
  EventSummaryResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  InitUploadRequest,
  InitUploadResponse,
  LoginRequest,
  LoginResponse,
  MediaAsset,
  MediaAssetResponse,
  MediaListResponse,
  ProductCategory,
  ProductCategoryListResponse,
  ProductCategoryResponse,
  ProductListResponse,
  ProductResponse,
  Project,
  ProjectAnalyticsResponse,
  ProjectConfigResponse,
  ProjectListResponse,
  ProjectSummary,
  PublishProjectRequest,
  PublishProjectResponse,
  PublishValidationRequest,
  PublishValidationResponse,
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
  Release,
  ReportListResponse,
  ReleaseListResponse,
  ReleaseResponse,
  ResetPasswordRequest,
  RollbackReleaseRequest,
  RollbackReleaseResponse,
  Template,
  TemplateListResponse,
  TemplatePreviewResponse,
  TemplateResponse,
  TemplateVersion,
  TemplateVersionListResponse,
  TemplateVersionResponse,
  UpdateCampaignRequest,
  UpdateClientRequest,
  UpdateClientUserRequest,
  UpdateProductCategoryRequest,
  UpdateProductRequest,
  UpdateTemplateRequest,
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
  PortalTemplateListResponse,
  PortalCommentListResponse,
  PortalAdCampaign,
  PortalAdCampaignListResponse,
  PortalAdChannelListResponse,
  CreatePortalAdCampaignRequest,
  UpdatePortalAdCampaignRequest,
} from './types';

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
  clientPortal: {
    myProjects: () =>
      rx<ClientPortalProjectListResponse>('/client-portal/me/projects'),
    project: async (id: string): Promise<ClientPortalProject> => {
      const r = await rx<ClientPortalProjectResponse>(
        `/client-portal/projects/${id}`
      );
      return r.project;
    },
    analytics: (id: string, params?: { from?: string; to?: string }) =>
      rx<ClientPortalAnalyticsResponse>(
        `/client-portal/projects/${id}/analytics`,
        { query: params }
      ),
    reports: (id: string) =>
      rx<ClientPortalReportsResponse>(`/client-portal/projects/${id}/reports`),
  },
  templates: {
    list: () => rx<TemplateListResponse>('/templates'),
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
  },
  projects: {
    list: () => rx<ProjectListResponse>('/projects'),
    get: (id: string) => rx<Project>(`/projects/${id}`),
    summary: (id: string) => rx<ProjectSummary>(`/projects/${id}/summary`),
    analytics: (id: string, params?: { from?: string; to?: string }) =>
      rx<ProjectAnalyticsResponse>(`/projects/${id}/analytics`, {
        query: params,
      }),
    media: (id: string) => rx<MediaListResponse>(`/projects/${id}/media`),
    config: (id: string) => rx<ProjectConfigResponse>(`/projects/${id}/config`),
    eventsSummary: (id: string, params?: { from?: string; to?: string }) =>
      rx<EventSummaryResponse>(`/projects/${id}/events/summary`, {
        query: params,
      }),
    reports: (id: string) => rx<ReportListResponse>(`/projects/${id}/reports`),
    activeRelease: async (id: string): Promise<Release | null> => {
      try {
        const r = await rx<ReleaseResponse>(`/projects/${id}/active-release`);
        return r.release ?? null;
      } catch (err) {
        // 404 means no active release yet — surface as null
        if (
          err &&
          typeof err === 'object' &&
          'status' in err &&
          (err as { status: number }).status === 404
        ) {
          return null;
        }
        throw err;
      }
    },
    releases: (id: string) =>
      rx<ReleaseListResponse>(`/projects/${id}/releases`),
    publishValidate: (id: string, body?: PublishValidationRequest) =>
      rx<PublishValidationResponse>(`/projects/${id}/publish/validate`, {
        method: 'POST',
        body: body ?? {},
      }),
    publish: async (
      id: string,
      body: PublishProjectRequest
    ): Promise<Release> => {
      const r = await rx<PublishProjectResponse>(`/projects/${id}/publish`, {
        method: 'POST',
        body,
      });
      return r.release;
    },
  },
  products: {
    list: (query?: {
      status?: string;
      category_id?: string;
      client_id?: string;
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
    }) => rx<ProductListResponse>('/products', { query }),
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
    landingDraft: (body: AILandingDraftRequest) =>
      rx<AILandingDraftResponse>('/ai/landing/draft', {
        method: 'POST',
        body,
      }),
    landingOptimize: (body: AILandingOptimizeRequest) =>
      rx<AILandingOptimizeResponse>('/ai/landing/optimize', {
        method: 'POST',
        body,
      }),
    mediaSuggest: (body: AIMediaSuggestRequest) =>
      rx<AIMediaSuggestResponse>('/ai/media/suggest', {
        method: 'POST',
        body,
      }),
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

  releases: {
    get: async (id: string): Promise<Release> => {
      const r = await rx<ReleaseResponse>(`/releases/${id}`);
      return r.release;
    },
    rollback: async (
      id: string,
      body?: RollbackReleaseRequest
    ): Promise<Release> => {
      const r = await rx<RollbackReleaseResponse>(`/releases/${id}/rollback`, {
        method: 'POST',
        body: body ?? {},
      });
      return r.release;
    },
  },
  clients: {
    list: () => rx<ClientListResponse>('/clients'),
    get: async (id: string): Promise<Client> => {
      const r = await rx<ClientResponse>(`/clients/${id}`);
      return r.client;
    },
    create: async (body: CreateClientRequest): Promise<Client> => {
      const r = await rx<ClientResponse>('/clients', {
        method: 'POST',
        body,
      });
      return r.client;
    },
    update: async (id: string, body: UpdateClientRequest): Promise<Client> => {
      const r = await rx<ClientResponse>(`/clients/${id}`, {
        method: 'PATCH',
        body,
      });
      return r.client;
    },
    users: (id: string) => rx<ClientUserListResponse>(`/clients/${id}/users`),
    inviteUser: (id: string, body: CreateClientUserRequest) =>
      rx<CreateClientUserResponse>(`/clients/${id}/users`, {
        method: 'POST',
        body,
      }),
    updateUser: async (
      clientId: string,
      userId: string,
      body: UpdateClientUserRequest
    ): Promise<ClientUser> => {
      const r = await rx<ClientUserResponse>(
        `/clients/${clientId}/users/${userId}`,
        { method: 'PATCH', body }
      );
      return r.user;
    },
    projects: (id: string) =>
      rx<ClientProjectListResponse>(`/clients/${id}/projects`),
    createAccessGrant: async (
      id: string,
      body: CreateClientAccessGrantRequest
    ): Promise<ClientAccessGrant> => {
      const r = await rx<ClientAccessGrantResponse>(
        `/clients/${id}/access-grants`,
        { method: 'POST', body }
      );
      return r.access_grant;
    },
    deleteAccessGrant: (id: string, grantId: string) =>
      rx<{ message?: string }>(`/clients/${id}/access-grants/${grantId}`, {
        method: 'DELETE',
      }),
  },
  media: {
    /**
     * Per BE Q17 patch: optional `ids` filter (repeated `?ids=` param) so
     * callers can batch-resolve a known set of media in one request.
     * BE caps at 100 ids, dedups, and silently skips unknowns.
     */
    list: (query?: { ids?: string[] }) => {
      if (!query?.ids || query.ids.length === 0) {
        return rx<MediaListResponse>('/media');
      }
      // Mock short-circuit: when AI template mock is on and we're asked
      // for `mock-media-*` ids, serve them locally so the suggestion
      // dialog renders without hitting BE (which doesn't know these ids).
      if (
        isAiTemplateMockEnabled() &&
        query.ids.some(id => id.startsWith('mock-media-'))
      ) {
        return Promise.resolve(mockMediaList(query.ids));
      }
      const usp = new URLSearchParams();
      for (const id of query.ids) usp.append('ids', id);
      return rx<MediaListResponse>(`/media?${usp.toString()}`);
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
    bindToProject: (projectId: string, body: BindMediaRequest) =>
      rx<BindMediaResponse>(`/projects/${projectId}/media/bind`, {
        method: 'POST',
        body,
      }),
    unbindFromProject: (projectId: string, bindingId: string) =>
      rx<{ message?: string }>(
        `/projects/${projectId}/media/bindings/${bindingId}`,
        { method: 'DELETE' }
      ),
  },

  // ── Canvas Templates (be-canvas-templates-spec.md) ─────────────────────
  canvasTemplates: {
    list: (query?: {
      client_id?: string;
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
     * (client + workspace). BE updates client_id/workspace_id and records
     * the action for the brand's activity feed. See be-todo.md P0.6.
     */
    assignToBrand: (
      id: string,
      body: { client_id: string; workspace_id?: string; notes?: string }
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
    /** List child folders of `parent_id` (omit param to fetch root). */
    list: (query?: { parent_id?: string }) =>
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
    /** Brand-side workspace create (auto-scoped by ctx.client_id). */
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
    getCampaign: (id: string) =>
      rx<PortalAdCampaign>(`/portal/ads/campaigns/${id}`),
    createCampaign: (body: CreatePortalAdCampaignRequest) =>
      rx<PortalAdCampaign>('/portal/ads/campaigns', { method: 'POST', body }),
    updateCampaign: (id: string, body: UpdatePortalAdCampaignRequest) =>
      rx<PortalAdCampaign>(`/portal/ads/campaigns/${id}`, {
        method: 'PATCH',
        body,
      }),
    deleteCampaign: (id: string) =>
      rx<{ message?: string }>(`/portal/ads/campaigns/${id}`, {
        method: 'DELETE',
      }),
  },

  // ── Staff inbox (admin/staff task queue) ──────────────────────────────
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
};
