/**
 * REXER backend endpoints grouped by domain. Each fn returns already-typed
 * data from `src/services/rexer/types.ts`.
 */
import { rx } from './client';
import type {
  AuthMeResponse,
  Client,
  ClientListResponse,
  DashboardSummary,
  LoginRequest,
  LoginResponse,
  MediaAsset,
  MediaListResponse,
  Project,
  ProjectAnalyticsResponse,
  ProjectListResponse,
  ProjectSummary,
  RegisterRequest,
  Template,
  TemplateListResponse,
} from './types';

export const rexerApi = {
  auth: {
    login: (body: LoginRequest) =>
      rx<LoginResponse>('/auth/login', { method: 'POST', body }),
    register: (body: RegisterRequest) =>
      rx<LoginResponse>('/auth/register', { method: 'POST', body }),
    me: () => rx<AuthMeResponse>('/auth/me'),
    logout: () => rx<void>('/auth/logout', { method: 'POST' }),
  },
  dashboard: {
    summary: () => rx<DashboardSummary>('/dashboard/summary'),
  },
  templates: {
    list: () => rx<TemplateListResponse>('/templates'),
    get: (id: string) => rx<Template>(`/templates/${id}`),
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
  },
  clients: {
    list: () => rx<ClientListResponse>('/clients'),
    get: (id: string) => rx<Client>(`/clients/${id}`),
  },
  media: {
    list: () => rx<MediaListResponse>('/media'),
    get: (id: string) => rx<MediaAsset>(`/media/${id}`),
  },
};
