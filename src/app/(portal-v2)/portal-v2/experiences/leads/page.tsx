import { BrandScopeBar } from '@/components/molecules/portal-v2/BrandScopeBar';
import { LeadsWorkspace } from '@/components/organisms/portal-v2/leads/LeadsWorkspace';
import { readLeadsFilters } from '@/lib/portal-v2/leads/params';
import { fetchExperienceLibrary } from '@/services/portal-v2/experienceLibrary';
import { fetchLeads } from '@/services/portal-v2/leads';
import { resolvePortalScope } from '@/services/portal-v2/scope';

/**
 * "Khách để lại thông tin" — mặt đọc của lead, nằm dưới Trải nghiệm.
 *
 * Ở đây chứ không phải một mục riêng ngoài cùng, vì một lead LUÔN thuộc về một
 * trang: BE bắt buộc `page_id` ở `GET /v1/leads` để con số `leads` trong phễu
 * và `total` của danh sách không bao giờ lệch nhau. Câu hỏi người dùng mang
 * tới màn này cũng là "trang nào đang ra khách", nên nó thuộc về thư viện trang
 * chứ không phải một hộp thư chung.
 *
 * Nạp phía server để lần vẽ đầu đã có dữ liệu — người trực bán hàng mở màn này
 * để gọi ngay, không phải nhìn khung xám chờ fetch.
 */
type PortalV2LeadsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalV2LeadsPage({
  searchParams,
}: PortalV2LeadsPageProps) {
  const sp = await searchParams;
  const scope = await resolvePortalScope(sp);
  const filters = readLeadsFilters(sp);

  // Danh sách trang để chọn = chính thư viện Trải nghiệm (`ExperienceView.id`
  // LÀ page id). Không dựng nguồn thứ hai để hai màn khỏi lệch nhau.
  const { items: experiences, error: libraryError } =
    await fetchExperienceLibrary({ brandId: scope.brandId });

  // Chưa chọn trang thì KHÔNG tự lấy trang đầu danh sách: cùng lý do với
  // `needsPick` của brand — hiện dữ liệu của một trang ngẫu nhiên là cách sinh
  // ra "gọi nhầm khách của chiến dịch khác".
  const leads = filters.pageId
    ? await fetchLeads({
        pageId: filters.pageId,
        status: filters.status,
        tier: filters.tier,
        range: filters.range,
      })
    : { items: [], total: 0, error: null };

  return (
    <div className='flex min-h-0 flex-col'>
      <BrandScopeBar scope={scope} />
      <LeadsWorkspace
        key={`${scope.brandId ?? 'none'}:${filters.pageId ?? 'none'}`}
        experiences={experiences}
        filters={filters}
        initialLeads={leads.items}
        total={leads.total}
        error={leads.error ?? libraryError ?? scope.error}
        needsBrand={scope.needsPick}
      />
    </div>
  );
}
