/**
 * Data Collection — BE adapter (`/v1/collections/*`).
 *
 * Drop-in replacement for `dataCollection.local.ts`. Same async surface so
 * a single import swap migrates the UI from localStorage to BE.
 *
 * BE spec: `docs/be-collections-spec.md`
 */

import { rexerApi } from '@/services/rexer/endpoints';
import { RxApiError } from '@/services/rexer/client';
import type {
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

// Pure validation helper kept in sync with BE (port of FE local adapter).
export { validateRecordData } from '@/services/dataCollection.local';

function ok<T>(data: T): ServiceResponse<T> {
  return { success: true, data };
}
function fail(error: string, code?: string): ServiceResponse<never> {
  return { success: false, error, code };
}

function rxFail(err: unknown): ServiceResponse<never> {
  if (err instanceof RxApiError) {
    return fail(err.message || err.code, err.code);
  }
  if (err instanceof Error) return fail(err.message);
  return fail('Unexpected error');
}

export const dataCollectionRemote = {
  // ── Collections ──
  async getCollections(
    filters?: CollectionFilters
  ): Promise<
    ServiceResponse<{ collections: DataCollection[]; total: number }>
  > {
    try {
      const r = await rexerApi.collections.list({
        is_active: filters?.is_active ?? true,
        is_template: filters?.is_template,
        q: filters?.search,
        page: filters?.page,
        limit: filters?.limit,
      });
      return ok({ collections: r.items, total: r.total });
    } catch (err) {
      return rxFail(err);
    }
  },

  async getCollectionById(
    id: string
  ): Promise<ServiceResponse<DataCollection>> {
    try {
      return ok(await rexerApi.collections.get(id));
    } catch (err) {
      return rxFail(err);
    }
  },

  async createCollection(
    dto: CreateCollectionDTO
  ): Promise<ServiceResponse<DataCollection>> {
    try {
      return ok(await rexerApi.collections.create(dto));
    } catch (err) {
      return rxFail(err);
    }
  },

  async updateCollection(
    id: string,
    dto: UpdateCollectionDTO
  ): Promise<ServiceResponse<DataCollection>> {
    try {
      return ok(await rexerApi.collections.update(id, dto));
    } catch (err) {
      return rxFail(err);
    }
  },

  async deleteCollection(id: string): Promise<ServiceResponse<{ id: string }>> {
    try {
      await rexerApi.collections.remove(id);
      return ok({ id });
    } catch (err) {
      return rxFail(err);
    }
  },

  // ── Records ──
  async getRecords(
    collectionId: string,
    filters?: RecordFilters
  ): Promise<
    ServiceResponse<{ records: DataCollectionRecord[]; total: number }>
  > {
    try {
      const r = await rexerApi.collections.listRecords(collectionId, {
        q: filters?.search,
        sort_field: filters?.sort_field,
        sort_direction: filters?.sort_direction,
        page: filters?.page,
        limit: filters?.limit,
      });
      return ok({ records: r.items, total: r.total });
    } catch (err) {
      return rxFail(err);
    }
  },

  async getRecordById(
    id: string
  ): Promise<ServiceResponse<DataCollectionRecord>> {
    // BE supports both `/v1/records/{id}` and `/v1/collections/{cid}/records/{rid}`.
    // We don't always know `collection_id` upfront when callers pass just the
    // record id, so use the flat `/records/{id}` path.
    try {
      const url = `/records/${id}`;
      const { rx } = await import('@/services/rexer/client');
      const r = await rx<{ record: DataCollectionRecord }>(url);
      return ok(r.record);
    } catch (err) {
      return rxFail(err);
    }
  },

  async createRecord(
    dto: CreateRecordDTO
  ): Promise<ServiceResponse<DataCollectionRecord>> {
    try {
      const r = await rexerApi.collections.createRecord(dto.collection_id, {
        data: dto.data,
        display_name: dto.display_name ?? undefined,
      });
      return ok(r);
    } catch (err) {
      return rxFail(err);
    }
  },

  async updateRecord(
    id: string,
    dto: UpdateRecordDTO
  ): Promise<ServiceResponse<DataCollectionRecord>> {
    // BE PATCH `/v1/records/{id}` (flat) or `/v1/collections/{cid}/records/{rid}`.
    // Use flat for parity with `getRecordById`.
    try {
      const { rx } = await import('@/services/rexer/client');
      const r = await rx<{ record: DataCollectionRecord }>(`/records/${id}`, {
        method: 'PATCH',
        body: dto,
      });
      return ok(r.record);
    } catch (err) {
      return rxFail(err);
    }
  },

  async deleteRecord(id: string): Promise<ServiceResponse<{ id: string }>> {
    try {
      const { rx } = await import('@/services/rexer/client');
      await rx<{ message?: string }>(`/records/${id}`, { method: 'DELETE' });
      return ok({ id });
    } catch (err) {
      return rxFail(err);
    }
  },

  /** No-op for remote — kept for interface parity with local adapter. */
  async _reset(): Promise<void> {
    // BE doesn't expose a reset endpoint; tests should clean up explicitly.
  },
};

export type DataCollectionService = typeof dataCollectionRemote;
