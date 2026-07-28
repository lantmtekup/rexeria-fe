/**
 * Resolve `template_version_id` → Template.
 *
 * BE không có GET version-by-id flat, Page cũng không trả `template_id`.
 * Trước đây editor fan-out `GET /templates/:id/versions` song song cho mọi
 * template → spam Network (trông như loop vô tận khi HMR/remount).
 *
 * Chiến lược:
 * 1. Module cache (versionId → template) — remount/HMR không probe lại
 * 2. Fast-path: `template.current_version_id === versionId`
 * 3. Probe tuần tự từng batch nhỏ, dừng ngay khi tìm thấy
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

/**
 * Tìm Template sở hữu `versionId`.
 * @throws nếu không thuộc template nào trong list.
 */
export async function resolveTemplateFromVersionId(
  versionId: string
): Promise<Template> {
  const cached = versionToTemplateCache.get(versionId);
  if (cached) return cached;

  const templates = await rexerApi.templates.list({ limit: 500 });
  const items = templates.items ?? [];

  // Fast-path: HEAD match — không cần gọi /versions.
  const headHit = items.find(t => t.current_version_id === versionId);
  if (headHit) {
    versionToTemplateCache.set(versionId, headHit);
    return headHit;
  }

  // Chỉ probe các template không match HEAD (page pin version cũ).
  const found = await findByProbingVersions(items, versionId);
  if (!found) {
    throw new Error(
      `template_version_id "${versionId}" không thuộc template nào (đã probe ${items.length} templates)`
    );
  }

  versionToTemplateCache.set(versionId, found);
  return found;
}
