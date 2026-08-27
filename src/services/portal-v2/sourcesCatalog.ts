import {
  MOCK_AUDIT_SOURCES,
  MOCK_WIZARDS,
} from '@/lib/portal-v2/journey-audit/mock';
import { mergeAuditSources } from '@/lib/portal-v2/journey-audit/sourcesView';
import type {
  AuditSource,
  WizardConfig,
} from '@/lib/portal-v2/journey-audit/types';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';

/**
 * Sources — ĐƯỜNG THẬT: `GET /v1/sources` (connections, freshness/stats từ
 * BE) + `GET /v1/sources/catalog` (9 provider). Wizard config vẫn là dữ liệu
 * FE (stepper demo per-provider theo prototype).
 *
 * Bẫy brand scope (curl 2026-08-27): các route sources KHÔNG nhận `?brand_id`
 * — platform admin không brand nhận ERR_VALIDATION_FAILED "sources requires a
 * brand scope". Khi đó rơi về catalog demo + banner lỗi, không để trắng màn.
 */

export type SourcesCatalogData = {
  sources: AuditSource[];
  wizards: Record<string, WizardConfig>;
  /** true = connections/catalog thật từ BE; false = demo mock. */
  live: boolean;
  error: string | null;
};

export const fetchSourcesCatalog = async (): Promise<SourcesCatalogData> => {
  try {
    const [list, catalog] = await Promise.all([
      rexerV2Api.sources.list(),
      rexerV2Api.sources.catalog(),
    ]);
    return {
      sources: mergeAuditSources(
        list.items ?? [],
        catalog.items ?? [],
        Date.now()
      ),
      wizards: MOCK_WIZARDS,
      live: true,
      error: null,
    };
  } catch (err) {
    return {
      sources: MOCK_AUDIT_SOURCES,
      wizards: MOCK_WIZARDS,
      live: false,
      error: err instanceof Error ? err.message : 'Failed to load sources',
    };
  }
};
