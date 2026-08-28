import {
  auditProductFromRx,
  dropoffFromRx,
  flowFromRx,
  journeyFromRx,
} from '@/lib/portal-v2/journey-audit/fromRx';
import {
  MOCK_AUDIT_FLOWS,
  MOCK_AUDIT_JOURNEYS,
  MOCK_AUDIT_LEAKS,
  MOCK_AUDIT_PATTERNS,
  MOCK_AUDIT_PRODUCTS,
  MOCK_AUDIT_SOURCES,
  MOCK_AUDIT_TOUCHPOINT_DETAILS,
  MOCK_FLOW_ENTRY,
  MOCK_SNAPSHOTS,
} from '@/lib/portal-v2/journey-audit/mock';
import { mergeAuditSources } from '@/lib/portal-v2/journey-audit/sourcesView';
import type {
  AuditDropoff,
  AuditFlow,
  AuditJourney,
  AuditProductRow,
  AuditSource,
  JourneyAuditBundle,
} from '@/lib/portal-v2/journey-audit/types';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';
import type {
  RxAuditFlow,
  RxAuditJourney,
  RxAuditTouchpointDetail,
} from '@/services/rexer-v2/types/audit';

/**
 * Journey Audit — ĐƯỜNG THẬT `/v1/audit/*` khi có brand; demo mock của
 * prototype khi không brand / API lỗi / brand chưa có dữ liệu audit (đừng để
 * trắng màn — bundle mang `live:false` để UI nói rõ là demo).
 *
 * Đã nghiệm thu bằng curl 2026-08-27 trên seed `audit.demo@rexer.test`
 * (product "That JLO Glow Brightening Serum", score 67, 16 touchpoints,
 * 4 leaks). Bẫy đã né:
 * - admin không brand: `/audit/products` trả rỗng → rơi về demo, KHÔNG coi là
 *   "brand không có sản phẩm" khi thiếu `?brand=`.
 * - `/v1/sources` không nhận brand override → admin bị từ chối; journey vẫn
 *   vẽ được nhờ `tp.state` server (tpState fallback), sources để rỗng.
 */

const message = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

const mockJourneyIds = Object.keys(MOCK_AUDIT_JOURNEYS);

const mockProducts = (): AuditProductRow[] =>
  MOCK_AUDIT_PRODUCTS.map(auditProductFromRx);

const demoBundle = (error: string | null = null): JourneyAuditBundle => ({
  products: mockProducts(),
  journeys: Object.fromEntries(
    mockJourneyIds.map(id => [
      id,
      journeyFromRx(
        id,
        MOCK_AUDIT_JOURNEYS[id],
        MOCK_AUDIT_TOUCHPOINT_DETAILS,
        MOCK_SNAPSHOTS
      ),
    ])
  ),
  flows: Object.fromEntries(
    mockJourneyIds.map(id => [
      id,
      flowFromRx(id, MOCK_AUDIT_FLOWS[id], MOCK_FLOW_ENTRY[id] ?? {}, true),
    ])
  ),
  sources: MOCK_AUDIT_SOURCES,
  live: false,
  error,
});

/** Suy entry (khách đến thẳng) từ traffic.arrive − tổng cạnh vào của flow. */
const entryFromTraffic = (
  journey: AuditJourney,
  flow: RxAuditFlow
): Record<string, number> => {
  const entry: Record<string, number> = {};
  journey.stages.forEach(stage =>
    stage.touchpoints.forEach(tp => {
      if (!tp.traffic) return;
      const inbound = flow.edges
        .filter(e => e.to === tp.id && e.type !== 'influence')
        .reduce((total, e) => total + e.volume, 0);
      entry[tp.id] = Math.max(0, tp.traffic.arrive - inbound);
    })
  );
  return entry;
};

const fetchProductAudit = async (
  productId: string
): Promise<{ journey: AuditJourney; flow: AuditFlow }> => {
  const [journeyRx, flowRx]: [RxAuditJourney, RxAuditFlow] = await Promise.all([
    rexerV2Api.audit.journey(productId),
    rexerV2Api.audit.flow(productId),
  ]);

  // Findings/recommendation nằm ở endpoint chi tiết — kéo song song cho mọi
  // touchpoint để KPI (critical/warnings/strengths) đếm số thật.
  const tpIds = journeyRx.stages.flatMap(stage =>
    stage.touchpoints.map(tp => tp.id)
  );
  const detailResults = await Promise.allSettled(
    tpIds.map(id => rexerV2Api.audit.touchpoint(id))
  );
  const details: Record<string, RxAuditTouchpointDetail> = {};
  detailResults.forEach(result => {
    if (result.status === 'fulfilled') details[result.value.id] = result.value;
  });

  const journey = journeyFromRx(productId, journeyRx, details);
  const estimated = journey.stages.some(stage =>
    stage.touchpoints.some(tp => tp.traffic?.estimated)
  );
  const flow = flowFromRx(
    productId,
    flowRx,
    entryFromTraffic(journey, flowRx),
    estimated
  );
  return { journey, flow };
};

/** Chặn bùng nổ request khi brand có nhiều sản phẩm: mỗi journey kéo ~16
 *  detail — chỉ nạp sẵn các sản phẩm đầu. */
const PRODUCT_CAP = 4;

export const fetchJourneyAuditBundle = async (
  query: {
    brandId?: string | null;
  } = {}
): Promise<JourneyAuditBundle> => {
  // LUÔN thử API thật: BE tự scope theo principal (user thường không cần
  // brand param — user seed thậm chí không có workspace membership nên
  // resolvePortalScope trả brandId null); `brand_id` chỉ là override của
  // platform admin.
  let productsRx;
  try {
    productsRx = await rexerV2Api.audit.products(query.brandId ?? undefined);
  } catch (err) {
    return demoBundle(message(err, 'Failed to load audit products'));
  }
  const items = productsRx.items ?? [];
  if (!items.length) {
    // Brand chưa có dữ liệu audit — demo mock, KHÔNG phải lỗi.
    return demoBundle();
  }

  const softErrors: string[] = [];

  // Sources không nhận brand override — admin sẽ bị BE từ chối; journey vẫn
  // sống nhờ tp.state server, nên lỗi này là soft.
  let sources: AuditSource[] = [];
  try {
    const [list, catalog] = await Promise.all([
      rexerV2Api.sources.list(),
      rexerV2Api.sources.catalog(),
    ]);
    sources = mergeAuditSources(
      list.items ?? [],
      catalog.items ?? [],
      Date.now()
    );
  } catch (err) {
    softErrors.push(message(err, 'Failed to load sources'));
  }

  const products = items.map(auditProductFromRx);
  const journeys: Record<string, AuditJourney> = {};
  const flows: Record<string, AuditFlow> = {};
  const capped = products.slice(0, PRODUCT_CAP);
  const audits = await Promise.allSettled(
    capped.map(product => fetchProductAudit(product.id))
  );
  audits.forEach((result, index) => {
    const productId = capped[index].id;
    if (result.status === 'fulfilled') {
      journeys[productId] = result.value.journey;
      flows[productId] = result.value.flow;
    } else {
      softErrors.push(
        message(result.reason, `Failed to load journey for ${productId}`)
      );
    }
  });

  if (!Object.keys(journeys).length) {
    return demoBundle(softErrors.join(' · ') || 'Failed to load journeys');
  }

  return {
    products: products.filter(product => journeys[product.id]),
    journeys,
    flows,
    sources,
    live: true,
    error: softErrors.length ? softErrors.join(' · ') : null,
  };
};

/* ── drop-off ────────────────────────────────────────────────────────────── */

export type DropoffBundle = {
  dropoffs: Record<string, AuditDropoff>;
  patterns: Array<{ title: string; body: string }>;
  live: boolean;
  error: string | null;
};

const demoDropoffs = (error: string | null = null): DropoffBundle => ({
  dropoffs: Object.fromEntries(
    Object.entries(MOCK_AUDIT_LEAKS).map(([id, rx]) => [
      id,
      dropoffFromRx(id, rx, false),
    ])
  ),
  patterns: MOCK_AUDIT_PATTERNS,
  live: false,
  error,
});

export const fetchDropoffBundle = async (
  query: {
    brandId?: string | null;
  } = {}
): Promise<DropoffBundle> => {
  try {
    const productsRx = await rexerV2Api.audit.products(
      query.brandId ?? undefined
    );
    const items = (productsRx.items ?? []).slice(0, PRODUCT_CAP);
    if (!items.length) return demoDropoffs();

    const results = await Promise.allSettled(
      items.map(item => rexerV2Api.audit.leaks(item.id))
    );
    const dropoffs: Record<string, AuditDropoff> = {};
    const softErrors: string[] = [];
    results.forEach((result, index) => {
      const productId = items[index].id;
      if (result.status === 'fulfilled') {
        // measured chỉ khi BE nói có bước KHÔNG còn là ước tính.
        const measured = result.value.funnel.steps.some(
          step => !step.estimated
        );
        dropoffs[productId] = dropoffFromRx(productId, result.value, measured);
      } else {
        softErrors.push(
          message(result.reason, `Failed to load leaks for ${productId}`)
        );
      }
    });

    if (!Object.keys(dropoffs).length) {
      return demoDropoffs(softErrors.join(' · ') || 'Failed to load leaks');
    }
    return {
      dropoffs,
      // Patterns là khối narrative demo của prototype — không có nguồn thật.
      patterns: [],
      live: true,
      error: softErrors.length ? softErrors.join(' · ') : null,
    };
  } catch (err) {
    return demoDropoffs(message(err, 'Failed to load drop-off data'));
  }
};
