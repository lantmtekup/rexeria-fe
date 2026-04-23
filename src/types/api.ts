import type { ErrorCode } from '@/settings/enums';

export interface QueryParams {
  limit?: number;
  page?: number;
  populate?: string;
  sort?: string;
  filter?: any;
  [key: string]: any;
}

/** Shared with `src/server/response.ts` — safe to import from client code. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  pagination?: PaginationMeta;
}

/**
 * BFF errors: `code` is the i18n key (UPPER_SNAKE_CASE). Optional `details` for fields / context.
 */
export interface ApiErrorResponse {
  success: false;
  code: ErrorCode;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface UploadApiData {
  file: string[];
  url: string[];
  confirmed: boolean;
}

export interface HealthApiData {
  status: string;
  timestamp: string;
  database?: 'ok' | 'error';
}

export interface SiteSettingsPublicData {
  title: string | null;
  description: string | null;
  logoUrl: string | null;
}
