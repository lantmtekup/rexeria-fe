'use client';

import * as React from 'react';
import { toast } from 'sonner';

import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';

const AUTOSAVE_DELAY_MS = 1500;
const RETRY_MIN_MS = 2_000;
const RETRY_MAX_MS = 30_000;

export type AutosaveError =
  | { type: 'conflict' } // 409 — version mismatch
  | { type: 'validation'; field?: string; details: unknown } // BE 4xx with details
  | { type: 'network' } // fetch failed, offline, timeout
  | { type: 'unknown'; message: string };

export type AutosaveState =
  | { kind: 'idle' }
  | { kind: 'pending' }
  | { kind: 'saving' }
  | { kind: 'saved'; at: number }
  | { kind: 'error'; reason: AutosaveError; retryable: boolean };

interface UseAutosaveArgs {
  templateId: string;
  /** Returns the latest blocks payload (snake-cased wire shape). */
  buildPayload: () => Record<string, unknown>;
  /** Latest known canvas version (etag). */
  version: number | undefined;
  /** When false, calls to markDirty are still recorded but nothing flushes. */
  enabled: boolean;
  /** Notify parent of a fresh version after a successful save. */
  onVersionUpdate: (next: number) => void;
  /** Called on 409 — parent should prompt the user to reload. */
  onConflict: () => void;
}

export interface UseAutosaveApi {
  state: AutosaveState;
  /** Mark the canvas dirty; debounced save kicks off after AUTOSAVE_DELAY_MS. */
  markDirty: () => void;
  /** Force an immediate save (cancels any pending debounce). */
  flush: (opts?: { silent?: boolean }) => Promise<void>;
  /** Resets state to idle (e.g. after the parent reloads the canvas). */
  reset: () => void;
}

function classifyError(err: unknown): AutosaveError {
  if (err instanceof RxApiError) {
    if (err.status === 409) return { type: 'conflict' };
    if (err.status >= 400 && err.status < 500) {
      const ve =
        err.details && typeof err.details === 'object'
          ? (err.details as { validation_errors?: Record<string, unknown> })
              .validation_errors
          : undefined;
      const field = ve ? Object.keys(ve)[0] : undefined;
      return { type: 'validation', field, details: err.details };
    }
    if (err.status >= 500 || err.status === 0) return { type: 'network' };
  }
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { type: 'network' };
  }
  return {
    type: 'unknown',
    message: err instanceof Error ? err.message : String(err),
  };
}

export function useAutosave({
  templateId,
  buildPayload,
  version,
  enabled,
  onVersionUpdate,
  onConflict,
}: UseAutosaveArgs): UseAutosaveApi {
  const [state, setState] = React.useState<AutosaveState>({ kind: 'idle' });

  const dirtyRef = React.useRef(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryAttemptRef = React.useRef(0);
  const inflightRef = React.useRef<{ cancelled: boolean } | null>(null);

  // Keep latest refs so the doSave callback (stable identity) reads fresh
  // values when invoked from listeners attached on mount.
  const buildPayloadRef = React.useRef(buildPayload);
  const versionRef = React.useRef(version);
  const enabledRef = React.useRef(enabled);
  const onVersionRef = React.useRef(onVersionUpdate);
  const onConflictRef = React.useRef(onConflict);
  React.useEffect(() => {
    buildPayloadRef.current = buildPayload;
    versionRef.current = version;
    enabledRef.current = enabled;
    onVersionRef.current = onVersionUpdate;
    onConflictRef.current = onConflict;
  });

  const clearTimers = React.useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (retryRef.current) {
      clearTimeout(retryRef.current);
      retryRef.current = null;
    }
  }, []);

  const doSave = React.useCallback(
    async (opts: { silent?: boolean } = {}): Promise<void> => {
      if (!dirtyRef.current || !enabledRef.current) return;
      if (inflightRef.current) inflightRef.current.cancelled = true;
      const token = { cancelled: false };
      inflightRef.current = token;

      setState({ kind: 'saving' });
      const payload = buildPayloadRef.current();
      const ver = versionRef.current;
      try {
        const updated = await rexerApi.canvasTemplates.update(templateId, {
          canvas_data: payload as never,
          version: ver as number,
        });
        if (token.cancelled) return; // a newer save superseded us
        dirtyRef.current = false;
        retryAttemptRef.current = 0;
        onVersionRef.current(updated.version);
        setState({ kind: 'saved', at: Date.now() });
        if (!opts.silent) toast.success(`Đã lưu · v${updated.version}`);
      } catch (err) {
        if (token.cancelled) return;
        const reason = classifyError(err);
        const retryable = reason.type === 'network';
        setState({ kind: 'error', reason, retryable });
        if (reason.type === 'conflict') {
          onConflictRef.current();
          toast.error(
            'Canvas đã bị thay đổi từ chỗ khác — tải lại trang để đồng bộ.'
          );
        } else if (reason.type === 'validation') {
          const fieldHint = reason.field ? ` · field: ${reason.field}` : '';
          toast.error(
            `Lưu thất bại: ${err instanceof Error ? err.message : ''}${fieldHint}`
          );
        } else if (reason.type === 'network') {
          // Schedule exponential-backoff retry. Capped to RETRY_MAX_MS.
          retryAttemptRef.current += 1;
          const delay = Math.min(
            RETRY_MIN_MS * 2 ** (retryAttemptRef.current - 1),
            RETRY_MAX_MS
          );
          retryRef.current = setTimeout(() => {
            void doSave({ silent: true });
          }, delay);
        } else {
          toast.error(`Lưu thất bại: ${reason.message}`);
        }
        // Stash full debug payload so user can paste into a BE ticket.
        // eslint-disable-next-line no-console
        console.groupCollapsed(
          `%c[autosave FAILED] ${reason.type}`,
          'color:#dc2626;font-weight:600'
        );
        // eslint-disable-next-line no-console
        console.log('template_id:', templateId);
        // eslint-disable-next-line no-console
        console.log('version (etag):', ver);
        // eslint-disable-next-line no-console
        console.log('payload:', payload);
        // eslint-disable-next-line no-console
        console.log('error:', err);
        // eslint-disable-next-line no-console
        console.groupEnd();
      } finally {
        if (inflightRef.current === token) inflightRef.current = null;
      }
    },
    [templateId]
  );

  const markDirty = React.useCallback(() => {
    dirtyRef.current = true;
    setState(prev => (prev.kind === 'saving' ? prev : { kind: 'pending' }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (retryRef.current) clearTimeout(retryRef.current);
    debounceRef.current = setTimeout(() => {
      void doSave({ silent: true });
    }, AUTOSAVE_DELAY_MS);
  }, [doSave]);

  const flush = React.useCallback(
    async (opts?: { silent?: boolean }) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      await doSave(opts);
    },
    [doSave]
  );

  const reset = React.useCallback(() => {
    clearTimers();
    dirtyRef.current = false;
    retryAttemptRef.current = 0;
    setState({ kind: 'idle' });
  }, [clearTimers]);

  // beforeunload — best-effort sync save via sendBeacon. The browser will not
  // wait for an async fetch, so we serialise the payload and post it through
  // sendBeacon which IS designed for this case.
  React.useEffect(() => {
    const handler = () => {
      if (!dirtyRef.current) return;
      if (typeof navigator === 'undefined' || !navigator.sendBeacon) return;
      try {
        const payload = buildPayloadRef.current();
        const body = JSON.stringify({
          canvas_data: payload,
          version: versionRef.current,
        });
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon(
          `/api/rexer/canvas-templates/${templateId}/beacon-save`,
          blob
        );
      } catch {
        // best-effort
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [templateId]);

  // Auto-retry the moment connectivity returns.
  React.useEffect(() => {
    const onOnline = () => {
      if (state.kind === 'error' && state.retryable) {
        retryAttemptRef.current = 0;
        if (retryRef.current) clearTimeout(retryRef.current);
        void doSave({ silent: true });
      }
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [state, doSave]);

  // Cleanup any timers on unmount.
  React.useEffect(() => clearTimers, [clearTimers]);

  return { state, markDirty, flush, reset };
}
