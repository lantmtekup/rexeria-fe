import { BrandScopeBar } from '@/components/molecules/portal-v2/BrandScopeBar';
import { AutomationWorkspace } from '@/components/organisms/portal-v2/automation/AutomationWorkspace';
import { fetchCampaignBoard } from '@/services/portal-v2/campaignBoard';
import { fetchExperienceLibrary } from '@/services/portal-v2/experienceLibrary';
import { fetchProductCatalog } from '@/services/portal-v2/productCatalog';
import { resolvePortalScope } from '@/services/portal-v2/scope';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Ba nguồn, ba endpoint, chạy SONG SONG — nối tiếp thì thời gian cộng dồn mà
 * chúng chẳng phụ thuộc gì nhau.
 *
 * Chỉ thư viện trải nghiệm là hỏng-thì-chặn: không có nó thì hub trống và
 * chẳng còn gì để làm. Catalogue và chiến dịch hỏng thì dropdown rỗng nhưng
 * người dùng vẫn đọc được hub — nên chúng suy biến chứ không dựng cả trang.
 */
export default async function PortalV2AutomationPage({ searchParams }: Props) {
  const scope = await resolvePortalScope(await searchParams);

  const [experiences, catalog, campaigns] = await Promise.all([
    fetchExperienceLibrary({ brandId: scope.brandId }),
    fetchProductCatalog({ brandId: scope.brandId }),
    fetchCampaignBoard({ brandId: scope.brandId }),
  ]);

  return (
    <div className='flex min-h-0 flex-col'>
      <BrandScopeBar scope={scope} />
      <AutomationWorkspace
        initialExperiences={experiences.items}
        initialProducts={catalog.products}
        initialAssets={catalog.assets}
        initialCampaigns={campaigns.items}
        initialError={experiences.error ?? scope.error}
      />
    </div>
  );
}
