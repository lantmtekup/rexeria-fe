import { BrandScopeBar } from '@/components/molecules/portal-v2/BrandScopeBar';
import { SettingsWorkspace } from '@/components/organisms/portal-v2/settings/SettingsWorkspace';
import { v2ToSettings } from '@/lib/portal-v2/settings/fromV2';
import { fetchSettings } from '@/services/portal-v2/settingsData';
import { resolvePortalScope } from '@/services/portal-v2/scope';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Settings đọc từ ba nguồn, và cả `/org/governance` lẫn `/org/capabilities`
 * đều đòi brand — platform admin chưa chọn thương hiệu thì không có gì để hỏi.
 * `BrandScopeBar` vì thế là bắt buộc ở màn này, trước đây nó không có.
 */
export default async function PortalV2SettingsPage({ searchParams }: Props) {
  const scope = await resolvePortalScope(await searchParams);
  const loaded = await fetchSettings(scope.brandId);

  return (
    <div className='flex min-h-0 flex-col'>
      <BrandScopeBar scope={scope} />
      {/* Đổi brand ⇒ remount; state gieo bằng `useState(() => prop)`. */}
      <SettingsWorkspace
        key={scope.brandId ?? 'none'}
        initialData={loaded.data ?? EMPTY_SETTINGS}
        initialVersion={loaded.version}
        brandId={scope.brandId}
        initialError={loaded.error ?? scope.error}
      />
    </div>
  );
}

/**
 * Khung TRỐNG cho lúc chưa chọn brand — KHÔNG phải `MOCK_SETTINGS`. Vẽ mock ở
 * đây khiến người dùng chỉnh ngưỡng của một tổ chức không tồn tại.
 */
const EMPTY_SETTINGS = v2ToSettings(
  {
    version: 0,
    high_floor: 0,
    directional_floor: 0,
    block_gap_pts: 0,
    score_weights: { order: 0, blocks: 0, signals: 0 },
    fit_weights: { objective: 0, audience: 0, evidence: 0 },
    default_privacy: 'pseudonymous',
    max_privacy: 'identified',
    default_product_status: 'draft',
    org_name: '',
  },
  { account_type: 'brand', capabilities: {}, spaces: [] },
  { name: '', email: '', title: '' }
);
