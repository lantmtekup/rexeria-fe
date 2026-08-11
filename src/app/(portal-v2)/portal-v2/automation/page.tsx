import { BrandScopeBar } from '@/components/molecules/portal-v2/BrandScopeBar';
import { AutomationWorkspace } from '@/components/organisms/portal-v2/automation/AutomationWorkspace';
import { fetchAutomationHub } from '@/services/portal-v2/automationV2';
import { fetchCampaignOptions } from '@/services/portal-v2/campaignOptions';
import { fetchProductCatalog } from '@/services/portal-v2/productCatalog';
import { resolvePortalScope } from '@/services/portal-v2/scope';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Ba nguồn, ba endpoint, chạy SONG SONG — nối tiếp thì thời gian cộng dồn mà
 * chúng chẳng phụ thuộc gì nhau.
 *
 * Chỉ hub là hỏng-thì-chặn: không có nó thì chẳng còn thiết kế nào để nhân bản.
 * Catalogue và chiến dịch hỏng thì dropdown rỗng nhưng người dùng vẫn đọc được
 * hub — nên chúng suy biến chứ không dựng cả trang.
 */
export default async function PortalV2AutomationPage({ searchParams }: Props) {
  const scope = await resolvePortalScope(await searchParams);

  const [hub, catalog, campaigns] = await Promise.all([
    fetchAutomationHub(scope.brandId),
    fetchProductCatalog({ brandId: scope.brandId }),
    fetchCampaignOptions({ brandId: scope.brandId }),
  ]);

  return (
    <div className='flex min-h-0 flex-col'>
      <BrandScopeBar scope={scope} />
      {/*
        Đổi brand ⇒ REMOUNT. Workspace gieo state bằng `useState(() => prop)`,
        mà initializer chỉ chạy lúc mount — không có key thì server đã nạp
        đúng brand mới nhưng màn hình vẫn giữ dữ liệu brand cũ, và `version`
        cũ đi kèm sẽ ghi đè nhầm khi bấm Save.
      */}
      <AutomationWorkspace
        key={scope.brandId ?? 'none'}
        initialExperiences={hub.data?.proven_templates ?? []}
        initialProducts={catalog.products}
        initialAssets={catalog.assets}
        initialCampaigns={campaigns.items}
        // 403 CAPABILITY_REQUIRED không phải lỗi — nó là "gói chưa có tính
        // năng này", nên nói đúng như vậy thay vì ném một dòng đỏ.
        initialLocked={hub.locked}
        initialError={hub.error ?? scope.error}
      />
    </div>
  );
}
