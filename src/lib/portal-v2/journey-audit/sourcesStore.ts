'use client';

import { useMemo, useSyncExternalStore } from 'react';

import type { AuditSource, AuditSourceStatus } from './types';

/**
 * Trạng thái connect/disconnect DEMO của Phase 1 — mutate client-side như
 * prototype, không gọi BE.
 *
 * Là module-level store (useSyncExternalStore) chứ không phải context ở
 * layout: ba màn Journey / Sources / Drop-off là ba route RSC riêng, nhưng
 * cùng đọc một bộ nguồn — connect ở Sources phải làm ghost card ở Journey
 * biến mất và Drop-off mở khoá ngay trong cùng phiên điều hướng client
 * (FR-D9), mà layout thì không còn được phép giữ provider mock nào (provider
 * của module Mining cũ đã bị gỡ khỏi layout).
 */

type SourceOverride = {
  status: AuditSourceStatus;
  lastSync: string | null;
  stats: string | null;
};

let overrides: Record<string, SourceOverride> = {};
const EMPTY: Record<string, SourceOverride> = {};
const listeners = new Set<() => void>();

const emit = (): void => {
  listeners.forEach(listener => listener());
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = (): Record<string, SourceOverride> => overrides;
const getServerSnapshot = (): Record<string, SourceOverride> => EMPTY;

export const connectAuditSource = (
  sourceId: string,
  doneStats?: string
): void => {
  overrides = {
    ...overrides,
    [sourceId]: {
      status: 'connected',
      lastSync: 'just now',
      stats: doneStats ?? 'First sync in progress…',
    },
  };
  emit();
};

/** Ngắt kết nối — lịch sử audit giữ lại, touchpoint mất nguồn thành ghost. */
export const disconnectAuditSource = (sourceId: string): void => {
  overrides = {
    ...overrides,
    [sourceId]: { status: 'available', lastSync: null, stats: null },
  };
  emit();
};

/** Bộ nguồn hiện hành = dữ liệu server + overrides demo của phiên client. */
export const useAuditSources = (base: AuditSource[]): AuditSource[] => {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  return useMemo(
    () =>
      base.map(source => {
        const override = current[source.id];
        if (!override) return source;
        return {
          ...source,
          status: override.status,
          lastSync: override.lastSync ?? source.lastSync,
          stats: override.stats ?? source.stats,
          issue: null,
        };
      }),
    [base, current]
  );
};
