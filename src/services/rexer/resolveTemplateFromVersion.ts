/**
 * Resolve `template_version_id` → Template.
 *
 * Fast path: `GET /template-versions/:id` (flat — versionId alone, no
 * templateId) returns `template_id` directly, then one `GET /templates/:id`.
 * Two round trips, always.
 *
 * Fallback (pre-flat-endpoint BE, or the flat call erroring for any reason):
 * the old scan — list the whole catalog, then probe each template's
 * `/versions` in small sequential batches until one matches. Slow (grows
 * with catalog size — this is exactly the "Edit experience" load-time bug
 * the flat endpoint was added to fix), but keeps the editor opening instead
 * of hard-failing during a rolling deploy where FE ships ahead of BE.
 *
 * Module cache (versionId → template) either way — remount/HMR does not
 * re-resolve.
 */

import { rexerApi } from './endpoints';
import type { Template } from './types';

const versionToTemplateCache = new Map<string, Template>();

const PROBE_CONCURRENCY = 4;

export const peekCachedTemplateForVersion = (
  versionId: string
): Template | undefined => versionToTemplateCache.get(versionId);

export const cacheTemplateForVersion = (
  versionId: string,
  template: Template
): void => {
  versionToTemplateCache.set(versionId, template);
};

async function probeHasVersion(
  templateId: string,
  versionId: string
): Promise<boolean> {
  try {
    const vl = await rexerApi.templates.versions(templateId);
    return (vl.items ?? []).some(v => v.id === versionId);
  } catch {
    return false;
  }
}

/** Probe list tuần tự theo batch — abort ngay khi match. */
async function findByProbingVersions(
  candidates: Template[],
  versionId: string
): Promise<Template | null> {
  for (let i = 0; i < candidates.length; i += PROBE_CONCURRENCY) {
    const batch = candidates.slice(i, i + PROBE_CONCURRENCY);
    const hits = await Promise.all(
      batch.map(async t =>
        (await probeHasVersion(t.id, versionId)) ? t : null
      )
    );
    const found = hits.find(Boolean) ?? null;
    if (found) return found;
  }
  return null;
}

async function resolveByScanningCatalog(versionId: string): Promise<Template> {
  const templates = await rexerApi.templates.list({ limit: 500 });
  const items = templates.items ?? [];

  // Fast-path: HEAD match — không cần gọi /versions.
  const headHit = items.find(t => t.current_version_id === versionId);
  if (headHit) return headHit;

  // Chỉ probe các template không match HEAD (page pin version cũ).
  const found = await findByProbingVersions(items, versionId);
  if (!found) {
    throw new Error(
      `template_version_id "${versionId}" không thuộc template nào (đã probe ${items.length} templates)`
    );
  }
  return found;
}

/**
 * Tìm Template sở hữu `versionId`.
 * @throws nếu không thuộc template nào trong list.
 */
export async function resolveTemplateFromVersionId(
  versionId: string
): Promise<Template> {
  const cached = versionToTemplateCache.get(versionId);
  if (cached) return cached;

  let template: Template;
  try {
    const v = await rexerApi.templates.versionByID(versionId);
    template = (await rexerApi.templates.get(v.template_id)).template;
  } catch {
    template = await resolveByScanningCatalog(versionId);
  }

  versionToTemplateCache.set(versionId, template);
  return template;
}
