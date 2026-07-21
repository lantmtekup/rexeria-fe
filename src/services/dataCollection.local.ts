/**
 * Data Collection — localStorage adapter.
 *
 * Stand-in for the BE endpoints documented in
 * `docs/be-api-collections-spec.md`. Mirrors the same async API contract
 * as the upstream Supabase service (cloned from 360-admin-cms) so that
 * once BE ships `/v1/collections/*`, swapping is a single import change:
 *
 *   - import { dataCollectionLocal as svc } from '@/services/dataCollection.local';
 *   + import { dataCollectionRemote as svc } from '@/services/dataCollection.remote';
 *
 * Persistence: two keys in `window.localStorage`:
 *   - `rexer.collections`        → DataCollection[]
 *   - `rexer.collection_records` → DataCollectionRecord[]
 *
 * No network. No auth. Suitable for FE prototyping until BE catches up.
 */

import type {
  CollectionFieldConfig,
  CollectionFilters,
  CreateCollectionDTO,
  CreateRecordDTO,
  DataCollection,
  DataCollectionRecord,
  RecordFilters,
  ServiceResponse,
  UpdateCollectionDTO,
  UpdateRecordDTO,
} from '@/types/dataCollection';

const KEY_COLLECTIONS = 'rexer.collections';
const KEY_RECORDS = 'rexer.collection_records';

// ── Storage helpers ─────────────────────────────────────────────────────
function readArray<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

function writeArray<T>(key: string, items: T[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(items));
}

function readCollections(): DataCollection[] {
  return readArray<DataCollection>(KEY_COLLECTIONS);
}
function writeCollections(items: DataCollection[]): void {
  writeArray(KEY_COLLECTIONS, items);
}
function readRecords(): DataCollectionRecord[] {
  return readArray<DataCollectionRecord>(KEY_RECORDS);
}
function writeRecords(items: DataCollectionRecord[]): void {
  writeArray(KEY_RECORDS, items);
}

// ── Pure helpers (preserved from upstream) ──────────────────────────────
function generateSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'collection';
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback (shouldn't be hit in modern browsers).
  return `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function ok<T>(data: T): ServiceResponse<T> {
  return { success: true, data };
}
function fail(error: string, code?: string): ServiceResponse<never> {
  return { success: false, error, code };
}

// Cheap async — keep call sites awaitable so swapping to fetch later is a no-op.
function delay<T>(value: T, ms = 30): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

// ── Validation (cloned verbatim — pure function) ────────────────────────
export function validateRecordData(
  fields: CollectionFieldConfig[],
  data: Record<string, unknown>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const value = data[field.fieldKey];
    const v = field.validation || {};

    if (
      field.required &&
      (value === undefined || value === null || value === '')
    ) {
      errors[field.fieldKey] = `${field.label} is required`;
      continue;
    }

    if (value === undefined || value === null || value === '') continue;

    switch (field.type) {
      case 'text':
      case 'paragraph':
      case 'email':
      case 'url':
      case 'phone': {
        const str = String(value);
        if (v.minLength && str.length < Number(v.minLength)) {
          errors[field.fieldKey] = `Minimum ${v.minLength} characters`;
        }
        if (v.maxLength && str.length > Number(v.maxLength)) {
          errors[field.fieldKey] = `Maximum ${v.maxLength} characters`;
        }
        if (v.pattern) {
          try {
            const re = new RegExp(String(v.pattern));
            if (!re.test(str)) errors[field.fieldKey] = 'Invalid format';
          } catch {
            /* invalid regex, skip */
          }
        }
        break;
      }
      case 'number':
      case 'currency': {
        const num = Number(value);
        if (Number.isNaN(num)) {
          errors[field.fieldKey] = 'Must be a number';
        } else {
          if (v.min !== undefined && num < Number(v.min)) {
            errors[field.fieldKey] = `Minimum value is ${v.min}`;
          }
          if (v.max !== undefined && num > Number(v.max)) {
            errors[field.fieldKey] = `Maximum value is ${v.max}`;
          }
        }
        break;
      }
      case 'rating': {
        const num = Number(value);
        const maxRating = Number(v.maxRating) || 5;
        if (Number.isNaN(num) || num < 0 || num > maxRating) {
          errors[field.fieldKey] = `Rating must be between 0 and ${maxRating}`;
        }
        break;
      }
      case 'dropdown':
      case 'radio': {
        const allowed = field.options || [];
        if (allowed.length > 0 && !allowed.includes(String(value))) {
          errors[field.fieldKey] =
            `Value must be one of: ${allowed.join(', ')}`;
        }
        break;
      }
      case 'checkbox': {
        const allowed = field.options || [];
        if (allowed.length > 0 && Array.isArray(value)) {
          const invalid = (value as string[]).filter(x => !allowed.includes(x));
          if (invalid.length > 0) {
            errors[field.fieldKey] = `Invalid options: ${invalid.join(', ')}`;
          }
        }
        break;
      }
      default:
        break;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

// ── Service surface ─────────────────────────────────────────────────────
export const dataCollectionLocal = {
  // ── Collections ──
  async getCollections(
    filters?: CollectionFilters
  ): Promise<
    ServiceResponse<{ collections: DataCollection[]; total: number }>
  > {
    let items = readCollections();
    if (filters?.is_active !== undefined) {
      items = items.filter(c => c.is_active === filters.is_active);
    }
    if (filters?.is_template !== undefined) {
      items = items.filter(c => c.is_template === filters.is_template);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          (c.description ?? '').toLowerCase().includes(q)
      );
    }
    items.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 50;
    const slice = items.slice((page - 1) * limit, page * limit);
    return delay(ok({ collections: slice, total: items.length }));
  },

  async getCollectionById(
    id: string
  ): Promise<ServiceResponse<DataCollection>> {
    const found = readCollections().find(c => c.id === id);
    if (!found) return delay(fail('Collection not found', 'NOT_FOUND'));
    return delay(ok(found));
  },

  async createCollection(
    dto: CreateCollectionDTO,
    userId?: string
  ): Promise<ServiceResponse<DataCollection>> {
    if (!dto.name || !dto.name.trim()) {
      return delay(fail('Collection name is required', 'VALIDATION_ERROR'));
    }
    const all = readCollections();
    const baseSlug = generateSlug(dto.name.trim());
    let slug = baseSlug;
    let attempt = 0;
    while (all.some(c => c.slug === slug)) {
      attempt++;
      slug = `${baseSlug}-${attempt + 1}`;
      if (attempt > 50) {
        return delay(fail('Could not generate unique slug', 'SLUG_EXHAUSTION'));
      }
    }

    const now = new Date().toISOString();
    const created: DataCollection = {
      id: uuid(),
      name: dto.name.trim(),
      slug,
      description: dto.description ?? null,
      icon: dto.icon ?? 'Table',
      color: dto.color ?? '#4f46e5',
      fields: dto.fields ?? [],
      is_active: true,
      is_template: dto.is_template ?? false,
      record_count: 0,
      version: 1,
      created_by: userId ?? null,
      updated_by: userId ?? null,
      created_at: now,
      updated_at: now,
    };
    writeCollections([created, ...all]);
    return delay(ok(created));
  },

  async updateCollection(
    id: string,
    dto: UpdateCollectionDTO,
    userId?: string
  ): Promise<ServiceResponse<DataCollection>> {
    const all = readCollections();
    const idx = all.findIndex(c => c.id === id);
    if (idx === -1) return delay(fail('Collection not found', 'NOT_FOUND'));
    const current = all[idx];
    if (current.version !== dto.version) {
      return delay(
        fail(
          'Collection was modified by another user. Please refresh and try again.',
          'VERSION_CONFLICT'
        )
      );
    }

    const next: DataCollection = {
      ...current,
      name: dto.name ?? current.name,
      description: dto.description ?? current.description,
      icon: dto.icon ?? current.icon,
      color: dto.color ?? current.color,
      fields: dto.fields ?? current.fields,
      is_active: dto.is_active ?? current.is_active,
      is_template: dto.is_template ?? current.is_template,
      version: current.version + 1,
      updated_by: userId ?? current.updated_by,
      updated_at: new Date().toISOString(),
    };
    all[idx] = next;
    writeCollections(all);
    return delay(ok(next));
  },

  async deleteCollection(
    id: string,
    userId?: string
  ): Promise<ServiceResponse<{ id: string }>> {
    const all = readCollections();
    const idx = all.findIndex(c => c.id === id);
    if (idx === -1) return delay(fail('Collection not found', 'NOT_FOUND'));
    all[idx] = {
      ...all[idx],
      is_active: false,
      updated_by: userId ?? all[idx].updated_by,
      updated_at: new Date().toISOString(),
    };
    writeCollections(all);
    return delay(ok({ id }));
  },

  // ── Records ──
  async getRecords(
    collectionId: string,
    filters?: RecordFilters
  ): Promise<
    ServiceResponse<{ records: DataCollectionRecord[]; total: number }>
  > {
    let items = readRecords().filter(
      r => r.collection_id === collectionId && !r.is_archived
    );

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(r => {
        if ((r.display_name ?? '').toLowerCase().includes(q)) return true;
        try {
          return JSON.stringify(r.data).toLowerCase().includes(q);
        } catch {
          return false;
        }
      });
    }

    if (filters?.sort_field) {
      const dir = filters.sort_direction === 'desc' ? -1 : 1;
      const f = filters.sort_field;
      items.sort((a, b) => {
        const av = (a.data?.[f] ?? a[f as keyof DataCollectionRecord]) as
          | string
          | number
          | undefined;
        const bv = (b.data?.[f] ?? b[f as keyof DataCollectionRecord]) as
          | string
          | number
          | undefined;
        if (av === bv) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        return av < bv ? -dir : dir;
      });
    } else {
      items.sort((a, b) => b.created_at.localeCompare(a.created_at));
    }

    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const slice = items.slice((page - 1) * limit, page * limit);
    return delay(ok({ records: slice, total: items.length }));
  },

  async getRecordById(
    id: string
  ): Promise<ServiceResponse<DataCollectionRecord>> {
    const found = readRecords().find(r => r.id === id);
    if (!found) return delay(fail('Record not found', 'NOT_FOUND'));
    return delay(ok(found));
  },

  async createRecord(
    dto: CreateRecordDTO,
    userId?: string
  ): Promise<ServiceResponse<DataCollectionRecord>> {
    const all = readCollections();
    const collection = all.find(c => c.id === dto.collection_id);
    if (!collection || !collection.is_active) {
      return delay(fail('Collection not found', 'NOT_FOUND'));
    }

    // Unique field check.
    const records = readRecords().filter(
      r => r.collection_id === dto.collection_id && !r.is_archived
    );
    const uniqueFields = collection.fields.filter(f => f.isUnique);
    for (const uf of uniqueFields) {
      const v = dto.data[uf.fieldKey];
      if (v === undefined || v === null || v === '') continue;
      if (records.some(r => r.data?.[uf.fieldKey] === v)) {
        return delay(
          fail(
            `Duplicate value for unique field "${uf.label}"`,
            'UNIQUE_VIOLATION'
          )
        );
      }
    }

    const now = new Date().toISOString();
    const created: DataCollectionRecord = {
      id: uuid(),
      collection_id: dto.collection_id,
      data: dto.data,
      display_name: dto.display_name ?? null,
      is_archived: false,
      created_by: userId ?? null,
      updated_by: userId ?? null,
      created_at: now,
      updated_at: now,
    };
    writeRecords([created, ...readRecords()]);

    // Bump record_count on collection.
    const idx = all.findIndex(c => c.id === dto.collection_id);
    if (idx >= 0) {
      all[idx] = {
        ...all[idx],
        record_count: all[idx].record_count + 1,
        updated_at: now,
      };
      writeCollections(all);
    }

    return delay(ok(created));
  },

  async updateRecord(
    id: string,
    dto: UpdateRecordDTO,
    userId?: string
  ): Promise<ServiceResponse<DataCollectionRecord>> {
    const all = readRecords();
    const idx = all.findIndex(r => r.id === id);
    if (idx === -1) return delay(fail('Record not found', 'NOT_FOUND'));
    const next: DataCollectionRecord = {
      ...all[idx],
      data: dto.data ?? all[idx].data,
      display_name:
        dto.display_name === undefined
          ? all[idx].display_name
          : dto.display_name,
      is_archived: dto.is_archived ?? all[idx].is_archived,
      updated_by: userId ?? all[idx].updated_by,
      updated_at: new Date().toISOString(),
    };
    all[idx] = next;
    writeRecords(all);
    return delay(ok(next));
  },

  async deleteRecord(id: string): Promise<ServiceResponse<{ id: string }>> {
    const all = readRecords();
    const found = all.find(r => r.id === id);
    if (!found) return delay(fail('Record not found', 'NOT_FOUND'));
    const next = all.filter(r => r.id !== id);
    writeRecords(next);

    const cols = readCollections();
    const idx = cols.findIndex(c => c.id === found.collection_id);
    if (idx >= 0 && cols[idx].record_count > 0) {
      cols[idx] = {
        ...cols[idx],
        record_count: cols[idx].record_count - 1,
        updated_at: new Date().toISOString(),
      };
      writeCollections(cols);
    }
    return delay(ok({ id }));
  },

  /** Reset everything — useful for tests. */
  async _reset(): Promise<void> {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(KEY_COLLECTIONS);
    window.localStorage.removeItem(KEY_RECORDS);
  },
};

export type DataCollectionService = typeof dataCollectionLocal;
