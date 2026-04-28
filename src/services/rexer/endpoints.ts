/**
 * REXER backend endpoints grouped by domain. Each fn returns already-typed
 * data from `src/services/rexer/types.ts`.
 */
import { rx } from './client';
import type {
  CreateCollectionDTO,
  CreateRecordDTO,
  UpdateCollectionDTO,
  UpdateRecordDTO,
} from '@/types/dataCollection';
import type {
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
  AITemplateSuggestRequest,
  AITemplateSuggestResponse,
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
    list: () => rx<MediaListResponse>('/media'),
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
};
