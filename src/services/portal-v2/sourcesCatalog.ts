import { sourceFromRx } from '@/lib/portal-v2/journey-audit/fromRx';
import {
  MOCK_AUDIT_SOURCES,
  MOCK_WIZARDS,
} from '@/lib/portal-v2/journey-audit/mock';
import type {
  AuditSource,
  WizardConfig,
} from '@/lib/portal-v2/journey-audit/types';

/**
 * Sources của Journey Audit — Phase 1 trả mock qua đúng dạng `{…, error}`.
 * Phase 2: `rexerV2Api.sources.list()` + `rexerV2Api.sources.catalog()`;
 * wizard config vẫn là dữ liệu FE (demo per-provider theo prototype).
 */

export type SourcesCatalogData = {
  sources: AuditSource[];
  wizards: Record<string, WizardConfig>;
  error: string | null;
};

export const fetchSourcesCatalog = async (): Promise<SourcesCatalogData> => ({
  sources: MOCK_AUDIT_SOURCES.map(sourceFromRx),
  wizards: MOCK_WIZARDS,
  error: null,
});
