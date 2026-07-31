'use client';

import * as React from 'react';

import { RxApiError } from '@/services/rexer/client';
import { rexerApi } from '@/services/rexer/endpoints';
import { resolveTemplateFromVersionId } from '@/services/rexer/resolveTemplateFromVersion';
import type { Page, PageStatus, Template } from '@/services/rexer/types';

/**
 * Resolve a URL segment into everything `BlockEditor` needs to mount.
 *
 * The segment accepts three shapes, tried in order:
 *   1. Template UUID → editor takes it directly.
 *   2. Page UUID     → page → `template_version_id` → template.
 *   3. Page slug     → page lookup by slug → same as above.
 *
 * Three shapes because list screens prefer a human-readable slug in the URL but
 * fall back to `page.id` when a page has no slug, while the template APIs are
 * template-scoped and need the derived id.
 *
 * This logic is currently duplicated verbatim in
 * `app/(admin)/admin/landing-pages/[id]/page.tsx` and
 * `app/(client-portal)/portal/landing-pages/[id]/page.tsx`. It was extracted
 * here for the portal-v2 editor rather than copied a third time; both of those
 * routes can adopt it unchanged.
 */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const rxMessage = (err: unknown): string => {
  if (err instanceof RxApiError) return err.code || err.message || 'API_ERROR';
  if (err instanceof Error) return err.message;
  return 'Unexpected error';
};

export type ResolvedCanvasTarget = {
  status: 'resolving' | 'ready' | 'error';
  error: string | null;
  templateId: string | null;
  template: Template | null;
  page: Page | null;
  pageSlug: string | undefined;
  pageId: string | undefined;
  pageName: string | undefined;
  pageStatus: PageStatus | undefined;
  pinnedVersionId: string | undefined;
  /** BlockEditor writes back when the user renames the slug. */
  setPageSlug: React.Dispatch<React.SetStateAction<string | undefined>>;
  setPinnedVersionId: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export const useResolvedCanvasTarget = (
  rawId: string
): ResolvedCanvasTarget => {
  const [templateId, setTemplateId] = React.useState<string | null>(null);
  const [template, setTemplate] = React.useState<Template | null>(null);
  const [page, setPage] = React.useState<Page | null>(null);
  const [pageSlug, setPageSlug] = React.useState<string | undefined>();
  const [pageId, setPageId] = React.useState<string | undefined>();
  const [pageName, setPageName] = React.useState<string | undefined>();
  const [pageStatus, setPageStatus] = React.useState<PageStatus | undefined>();
  const [pinnedVersionId, setPinnedVersionId] = React.useState<
    string | undefined
  >();
  const [error, setError] = React.useState<string | null>(null);

  /** Don't re-fan-out `/versions` when StrictMode or HMR remounts the same id. */
  const resolvedForRawIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!rawId) return;
    let cancelled = false;

    if (resolvedForRawIdRef.current === rawId && templateId) return;

    setError(null);
    setTemplateId(null);
    setTemplate(null);
    setPage(null);
    setPageSlug(undefined);
    setPageId(undefined);
    setPageName(undefined);
    setPageStatus(undefined);
    setPinnedVersionId(undefined);

    const applyPage = (found: Page) => {
      setPage(found);
      setPageId(found.id);
      setPageName(found.name);
      setPageStatus(found.status);
      setPinnedVersionId(found.template_version_id);
      if (found.slug) setPageSlug(found.slug);
    };

    void (async () => {
      try {
        let versionId: string | undefined;

        if (UUID_RE.test(rawId)) {
          /* Page before template: every navigation from a list is a page id,
             and trying templates first fills DevTools with 404 noise for the
             common case. */
          try {
            const found = await rexerApi.pages.get(rawId);
            if (cancelled) return;
            versionId = found.template_version_id;
            applyPage(found);
          } catch {
            try {
              const tplRes = await rexerApi.templates.get(rawId);
              if (cancelled) return;
              /* A template id carries no page context — a template can back
                 many pages — so the editor opens on the template alone. */
              resolvedForRawIdRef.current = rawId;
              setTemplateId(tplRes.template.id);
              setTemplate(tplRes.template);
              return;
            } catch (tplErr) {
              throw new Error(
                `UUID "${rawId}" does not match any page or template: ${rxMessage(tplErr)}`
              );
            }
          }
        } else {
          /* Slug. The BE's `?slug=` param does not actually filter, so search
             by text and match the slug exactly on the client. */
          const pages = await rexerApi.pages.listAll({ q: rawId, limit: 25 });
          if (cancelled) return;
          const found = pages.items?.find(p => p.slug === rawId);
          if (!found) throw new Error(`No page found with slug "${rawId}"`);
          versionId = found.template_version_id;
          applyPage(found);
        }

        if (!versionId) throw new Error('Page has no template_version_id');

        const tpl = await resolveTemplateFromVersionId(versionId);
        if (cancelled) return;
        resolvedForRawIdRef.current = rawId;
        setTemplateId(tpl.id);
        setTemplate(tpl);
      } catch (err) {
        if (!cancelled) setError(rxMessage(err));
      }
    })();

    return () => {
      cancelled = true;
    };
    // templateId is read only to skip re-resolving — including it would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawId]);

  return {
    status: error ? 'error' : templateId ? 'ready' : 'resolving',
    error,
    templateId,
    template,
    page,
    pageSlug,
    pageId,
    pageName,
    pageStatus,
    pinnedVersionId,
    setPageSlug,
    setPinnedVersionId,
  };
};
