import {
  auditProductFromRx,
  dropoffFromRx,
  flowFromRx,
  journeyFromRx,
  sourceFromRx,
} from '@/lib/portal-v2/journey-audit/fromRx';
import {
  MOCK_AUDIT_FLOWS,
  MOCK_AUDIT_JOURNEYS,
  MOCK_AUDIT_LEAKS,
  MOCK_AUDIT_PATTERNS,
  MOCK_AUDIT_PRODUCTS,
  MOCK_AUDIT_SOURCES,
  MOCK_AUDIT_TOUCHPOINT_DETAILS,
} from '@/lib/portal-v2/journey-audit/mock';
import type {
  AuditDropoff,
  AuditProductRow,
  JourneyAuditBundle,
} from '@/lib/portal-v2/journey-audit/types';
import { stepsFromStages } from '@/lib/portal-v2/analytics/pulseView';
import { fetchProductCatalog } from '@/services/portal-v2/productCatalog';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';

/**
 * Phase 1 của Journey Audit: dữ liệu mock (shape Rx của `/v1/audit/*`) đi qua
 * đúng dạng `{…, error: null}` như mọi wrapper khác, để lúc BE ship chỉ đổi
 * nguồn từ mock sang `rexerV2Api.audit.*`.
 *
 * Hai chỗ đã chạm API thật ngay từ Phase 1:
 * - Panel sản phẩm: có brand thì đọc catalog thật (`fetchProductCatalog`, API
 *   v1) rồi gắn dữ liệu audit mock vào từng dòng; không brand/không data thì
 *   dùng catalog mock của prototype.
 * - Drop-off: có brand thì hỏi `intel.funnel` — đo được thì phễu là số thật
 *   (`measured: true`), lỗi/rỗng thì rơi về traffic model (`estimated`).
 */

const mockJourneyIds = Object.keys(MOCK_AUDIT_JOURNEYS);

const mockProducts = (): AuditProductRow[] =>
  MOCK_AUDIT_PRODUCTS.map(rx => ({
    ...auditProductFromRx(rx),
    auditId: rx.id,
  }));

const mockBundleBase = (): Omit<JourneyAuditBundle, 'products'> => ({
  journeys: Object.fromEntries(
    mockJourneyIds.map(id => [
      id,
      journeyFromRx(id, MOCK_AUDIT_JOURNEYS[id], MOCK_AUDIT_TOUCHPOINT_DETAILS),
    ])
  ),
  flows: Object.fromEntries(
    mockJourneyIds.map(id => [id, flowFromRx(id, MOCK_AUDIT_FLOWS[id])])
  ),
  sources: MOCK_AUDIT_SOURCES.map(sourceFromRx),
  error: null,
});

export const fetchJourneyAuditBundle = async (
  query: {
    brandId?: string | null;
  } = {}
): Promise<JourneyAuditBundle> => {
  const base = mockBundleBase();

  if (!query.brandId) {
    return { ...base, products: mockProducts() };
  }

  // Catalog THẬT của brand; mỗi sản phẩm thật mượn một journey audit mock để
  // demo màn hình — Phase 2 thay bằng `audit.products` + `audit.journey`.
  const catalog = await fetchProductCatalog({ brandId: query.brandId });
  if (catalog.error || catalog.products.length === 0) {
    return { ...base, products: mockProducts(), error: catalog.error };
  }

  const products: AuditProductRow[] = catalog.products.map((product, index) => {
    const auditId = mockJourneyIds[index % mockJourneyIds.length];
    const mockRow = MOCK_AUDIT_PRODUCTS.find(row => row.id === auditId);
    return {
      id: product.id,
      name: product.title,
      sku: product.type || product.category || '—',
      category: product.brand || 'Catalog',
      icon: '📦',
      score: mockRow?.score ?? null,
      touchpointCount: mockRow?.touchpoint_count ?? 0,
      auditId,
    };
  });

  return { ...base, products, error: null };
};

/* ── drop-off ────────────────────────────────────────────────────────────── */

export type DropoffBundle = {
  dropoffs: Record<string, AuditDropoff>;
  patterns: Array<{ title: string; body: string }>;
  error: string | null;
};

export const fetchDropoffBundle = async (
  query: {
    brandId?: string | null;
  } = {}
): Promise<DropoffBundle> => {
  const mockDropoffs = (): Record<string, AuditDropoff> =>
    Object.fromEntries(
      Object.entries(MOCK_AUDIT_LEAKS).map(([id, rx]) => [
        id,
        dropoffFromRx(id, rx, false),
      ])
    );

  if (!query.brandId) {
    return {
      dropoffs: mockDropoffs(),
      patterns: MOCK_AUDIT_PATTERNS,
      error: null,
    };
  }

  try {
    const funnel = await rexerV2Api.intel.funnel({ brand_id: query.brandId });
    const steps = stepsFromStages(funnel.stages);
    const hasData = steps.length > 0 && steps.some(step => step.value > 0);
    if (!hasData) {
      // Đo được là rỗng ⇒ chưa có gì để nói — rơi về mô hình ước tính, KHÔNG
      // vẽ một dãy 0 đọc như kết quả.
      return {
        dropoffs: mockDropoffs(),
        patterns: MOCK_AUDIT_PATTERNS,
        error: null,
      };
    }

    // Phễu đo thật là số cấp brand — áp cho mọi journey đang xem; leak/kênh
    // vẫn là phân tích mock của Phase 1.
    const dropoffs = Object.fromEntries(
      Object.entries(MOCK_AUDIT_LEAKS).map(([id, rx]) => {
        const base = dropoffFromRx(id, rx, true);
        const measuredSteps = steps.map((step, index) => ({
          key: rx.funnel.steps[index]?.key ?? `step_${index}`,
          label: step.label,
          count: step.value,
        }));
        return [
          id,
          {
            ...base,
            steps: measuredSteps,
            benchmarks:
              measuredSteps.length === rx.funnel.steps.length
                ? base.benchmarks
                : [],
          },
        ];
      })
    );
    return { dropoffs, patterns: MOCK_AUDIT_PATTERNS, error: null };
  } catch {
    return {
      dropoffs: mockDropoffs(),
      patterns: MOCK_AUDIT_PATTERNS,
      error: null,
    };
  }
};
