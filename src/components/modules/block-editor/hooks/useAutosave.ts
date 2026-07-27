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
  flush: (opts?: {
    silent?: boolean;
    /** Ghi đè draft dù dirty=false — bắt buộc trước createVersion vì BE đọc draft, không body. */ force?: boolean;
  }) => Promise<void>;
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
    async (opts: { silent?: boolean; force?: boolean } = {}): Promise<void> => {
      if (!enabledRef.current) {
        // eslint-disable-next-line no-console
        console.log('[rexer-autosave] doSave skipped — enabled: false');
        return;
      }
      if (!opts.force && !dirtyRef.current) {
        // eslint-disable-next-line no-console
        console.log(
          '[rexer-autosave] doSave skipped — dirty:',
          dirtyRef.current,
          'enabled:',
          enabledRef.current
        );
        return;
      }
      if (inflightRef.current) inflightRef.current.cancelled = true;
      const token = { cancelled: false };
      inflightRef.current = token;

      setState({ kind: 'saving' });
      const payload = buildPayloadRef.current();
      // eslint-disable-next-line no-console
      console.log(
        '[rexer-autosave] PATCH draft → template:',
        templateId,
        'blocks:',
        Array.isArray((payload as { blocks?: unknown[] }).blocks)
          ? (payload as { blocks: unknown[] }).blocks.length
          : '?',
        'pages:',
        (payload as { pages?: unknown[] }).pages?.length ?? '—',
        'payload:',
        payload
      );
      try {
        // BE 2026-05-30: PATCH draft-canvas-blueprint = mutable autosave
        // buffer. Không tạo version mới mỗi save → autosave debounce 1.5s OK.
        // Commit thành immutable version qua POST /templates/:id/versions
        // (explicit Save button, không phải auto).
        const beTpl = await rexerApi.templates.patchDraftBlueprint(
          templateId,
          payload
        );
        // eslint-disable-next-line no-console
        console.log(
          '[rexer-autosave] PATCH OK — BE confirmed draft blocks:',
          Array.isArray(
            (beTpl.draft_canvas_blueprint as { blocks?: unknown[] } | undefined)
              ?.blocks
          )
            ? (beTpl.draft_canvas_blueprint as { blocks: unknown[] }).blocks
                .length
            : 0,
          // If this ever reads '—' while the editor shows several pages, BE is
          // dropping the key and multi-page edits are being silently lost.
          'pages:',
          (beTpl.draft_canvas_blueprint as { pages?: unknown[] } | undefined)
            ?.pages?.length ?? '—'
        );
        if (token.cancelled) return; // a newer save superseded us
        dirtyRef.current = false;
        retryAttemptRef.current = 0;
        // Draft saves don't bump a version counter — keep version unchanged.
        // onVersionUpdate signature stays for back-compat with the editor's
        // optimistic-lock display, but we pass through the same value.
        if (versionRef.current !== undefined) {
          onVersionRef.current(versionRef.current);
        }
        setState({ kind: 'saved', at: Date.now() });
        if (!opts.silent) toast.success('Đã lưu draft');
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
        console.log('version (etag):', versionRef.current);
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
    // eslint-disable-next-line no-console
    console.log(
      '[rexer-autosave] markDirty — template:',
      templateId,
      'enabled:',
      enabledRef.current,
      'debounce(ms):',
      AUTOSAVE_DELAY_MS
    );
    setState(prev => (prev.kind === 'saving' ? prev : { kind: 'pending' }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (retryRef.current) clearTimeout(retryRef.current);
    debounceRef.current = setTimeout(() => {
      void doSave({ silent: true });
    }, AUTOSAVE_DELAY_MS);
  }, [doSave, templateId]);

  const flush = React.useCallback(
    async (opts?: { silent?: boolean; force?: boolean }) => {
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

  // beforeunload — best-effort sync save via sendBeacon. Browser doesn't wait
  // for async fetch, so we use sendBeacon which IS designed for this case.
  // Posts the same shape as the PATCH route (BE accepts both PATCH + beacon
  // body) so reload picks up the latest draft.
  React.useEffect(() => {
    const handler = () => {
      if (!dirtyRef.current) return;
      if (typeof navigator === 'undefined' || !navigator.sendBeacon) return;
      try {
        const payload = buildPayloadRef.current();
        const body = JSON.stringify({ canvas_blueprint: payload });
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon(
          `/api/rexer/templates/${templateId}/draft-canvas-blueprint`,
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

  // Expose a debug peek on window so user can paste this in DevTools:
  //   __rexer_autosave.dump()
  //   __rexer_autosave.flush()   // force immediate save
  //   __rexer_autosave.payload() // see what would be sent
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    interface DebugBag {
      dump: () => unknown;
      flush: (silent?: boolean) => Promise<void>;
      payload: () => unknown;
    }
    const bag: DebugBag = {
      dump: () => ({
        state,
        dirty: dirtyRef.current,
        enabled: enabledRef.current,
        templateId,
        version: versionRef.current,
        debounceArmed: !!debounceRef.current,
      }),
      flush: silent => doSave({ silent: silent ?? true }),
      payload: () => buildPayloadRef.current(),
    };
    (window as unknown as Record<string, DebugBag>).__rexer_autosave = bag;
    return () => {
      try {
        delete (window as unknown as Record<string, unknown>).__rexer_autosave;
      } catch {
        /* ignore */
      }
    };
  }, [state, templateId, doSave]);

  return { state, markDirty, flush, reset };
}
