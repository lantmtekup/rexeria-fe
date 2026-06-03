/**
 * Data Collection types — cloned from 360-admin-cms (`src/types/dataCollection.types.ts`).
 *
 * Resource: a user-defined "collection" (Airtable-like data table) with
 * dynamic schema (fields) + records (rows of jsonb data). The BE for these
 * endpoints is documented in `docs/be-api-collections-spec.md` — until BE
 * ships them, FE uses `src/services/dataCollection.local.ts` (localStorage).
 */

export type CollectionFieldType =
  | 'text'
  | 'paragraph'
  | 'number'
  | 'dropdown'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'time'
  | 'file'
  | 'rating'
  | 'toggle'
  | 'currency'
  | 'email'
  | 'url'
  | 'phone'
  | 'image'
  | 'relation';

export interface CollectionFieldConfig {
  id: string;
  fieldKey: string;
  type: CollectionFieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  order: number;
  options?: string[];
  defaultValue?: unknown;
  validation?: Record<string, unknown>;
  isUnique?: boolean;
  isPrimary?: boolean;
  /** For `relation` type — id of the referenced collection. */
  referenceCollectionId?: string;
}

export interface DataCollection {
  id: string;
  brand_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  fields: CollectionFieldConfig[];
  is_active: boolean;
  is_template: boolean;
  record_count: number;
  /** Optimistic-lock version — must be passed back on every update. */
  version: number;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DataCollectionRecord {
  id: string;
  collection_id: string;
  data: Record<string, unknown>;
  display_name?: string | null;
  is_archived: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

// ── DTOs ────────────────────────────────────────────────────────────────
export interface CreateCollectionDTO {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  fields?: CollectionFieldConfig[];
  is_template?: boolean;
}

export interface UpdateCollectionDTO {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  fields?: CollectionFieldConfig[];
  is_active?: boolean;
  is_template?: boolean;
  /** REQUIRED — server checks `WHERE id = ? AND version = ?`. */
  version: number;
}

export interface CreateRecordDTO {
  collection_id: string;
  data: Record<string, unknown>;
  display_name?: string | null;
}

export interface UpdateRecordDTO {
  data?: Record<string, unknown>;
  display_name?: string | null;
  is_archived?: boolean;
}

export interface RecordFilters {
  search?: string;
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
  page?: number;
  limit?: number;
}

export interface CollectionFilters {
  search?: string;
  is_active?: boolean;
  is_template?: boolean;
  page?: number;
  limit?: number;
}

// ── Service response envelope (mirrors source contract) ──────────────────
export interface ServiceSuccess<T> {
  success: true;
  data: T;
}
export interface ServiceError {
  success: false;
  error: string;
  code?: string;
}
export type ServiceResponse<T> = ServiceSuccess<T> | ServiceError;
