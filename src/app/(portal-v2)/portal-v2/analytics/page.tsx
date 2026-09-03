import { BrandScopeBar } from '@/components/molecules/portal-v2/BrandScopeBar';
import { AnalyticsWorkspace } from '@/components/organisms/portal-v2/analytics/AnalyticsWorkspace';
import { readPulseViewState } from '@/lib/portal-v2/analytics/params';
import { blockRowOf } from '@/lib/portal-v2/analytics/pulseView';
import { fetchPulseOverview } from '@/services/portal-v2/analyticsPulse';
import { fetchLivePages } from '@/services/portal-v2/livePages';
import { resolvePortalScope } from '@/services/portal-v2/scope';
import { rexerV2Api } from '@/services/rexer-v2/endpoints';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalV2AnalyticsPage({ searchParams }: Props) {
  const params = await searchParams;
  const scope = await resolvePortalScope(params);
  const parsed = readPulseViewState(params);
  const initialState =
    parsed.drill.campaignId && parsed.lens === 'overview'
      ? { ...parsed, lens: 'analytics' as const }
      : parsed;

  // Hai nguồn độc lập ⇒ song song. Bảng block hỏng thì thẻ đó rỗng, không kéo
  // sập tổng quan — nên nó đi qua `catch` riêng chứ không nằm trong `all`.
  //
  // `blocksRank('', ...)` chứ không phải `blocks(...)`: nhãn ở widget nói "tốt
  // nhất theo đóng góp", nhưng `blocks()` trả bảng KHÔNG sắp xếp (thứ tự gộp
  // dữ liệu ở BE, gần như ngẫu nhiên) — 2 dòng hiện ra trước đây không phải
  // "tốt nhất", chỉ là 2 cái đầu tiên gặp phải. `blocksRank` role rỗng = không
  // lọc theo vai (`roleFilter != ""` ở BE `intel.go`), vẫn sort theo
  // `ContributionScore` rồi cắt top 3 — đúng thứ cần cho widget tổng quan này.
  const [overview, blocks, livePages] = await Promise.all([
    fetchPulseOverview({ brandId: scope.brandId }),
    rexerV2Api.intel
      .blocksRank('', scope.brandId ? { brand_id: scope.brandId } : {})
      .then(res => res.items.map(blockRowOf))
      .catch(() => []),
    // Tab "Trang" — trang đã live + tổng view (v1) + phiên/cvr (v2 theo
    // brand). Tự bọc lỗi (rows/error), không kéo sập cả màn analytics.
    fetchLivePages(scope.brandId),
  ]);

  return (
    <div className='flex min-h-0 flex-col'>
      <BrandScopeBar scope={scope} />
      {/* Đổi brand ⇒ REMOUNT: workspace gieo state bằng initializer, mà nó chỉ
          chạy lúc mount. */}
      <AnalyticsWorkspace
        key={scope.brandId ?? 'none'}
        initialState={initialState}
        overview={scope.error ? { ...overview, error: scope.error } : overview}
        blocks={blocks}
        livePages={livePages}
        brandId={scope.brandId}
      />
    </div>
  );
}
