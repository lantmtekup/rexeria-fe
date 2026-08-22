import { BrandScopeBar } from '@/components/molecules/portal-v2/BrandScopeBar';
import { DeployWorkspace } from '@/components/organisms/portal-v2/deploy/DeployWorkspace';
import { DEPLOY_TABS } from '@/lib/portal-v2/deploy/constants';
import { mapBrandDomain } from '@/lib/portal-v2/deploy/helpers';
import {
  MOCK_BRAND_DOMAINS,
  cloneBrandDomains,
} from '@/lib/portal-v2/deploy/mock';
import type { DeployTabId } from '@/lib/portal-v2/deploy/types';
import { fetchCampaignTeam } from '@/services/portal-v2/campaignBoardV2';
import {
  fetchDeployChannels,
  fetchDeployKpis,
  fetchDeployLive,
  fetchDeployReady,
} from '@/services/portal-v2/deployBoard';
import { resolvePortalScope } from '@/services/portal-v2/scope';
import { rexerApi } from '@/services/rexer/endpoints';

type PortalV2DeployPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * `brandId` now comes from `resolvePortalScope` — the same source Campaigns/
 * Brand already read — instead of a client-side `auth.me()` round trip.
 *
 * The domain list is the one deliberate mock-fallback exception (see
 * `mock.ts`): unresolved `brandId` or an unreachable
 * `rexerApi.brands.domains.list` falls back to `MOCK_BRAND_DOMAINS`, the same
 * shape `/portal/profile/domains` falls back to. Channels/live/ready/kpis do
 * NOT fall back — a failed read shows an empty state with the real error.
 */
const loadDomains = async (brandId: string | null) => {
  if (!brandId) {
    return {
      items: cloneBrandDomains(MOCK_BRAND_DOMAINS),
      source: 'fake' as const,
    };
  }
  try {
    const res = await rexerApi.brands.domains.list(brandId);
    return {
      items: (res.items ?? []).map(mapBrandDomain),
      source: 'live' as const,
    };
  } catch {
    return {
      items: cloneBrandDomains(MOCK_BRAND_DOMAINS),
      source: 'fake' as const,
    };
  }
};

export default async function PortalV2DeployPage({
  searchParams,
}: PortalV2DeployPageProps) {
  const params = await searchParams;
  const scope = await resolvePortalScope(params);
  const tabParam = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const initialTab = DEPLOY_TABS.some(t => t.id === tabParam)
    ? (tabParam as DeployTabId)
    : undefined;

  // Bốn nguồn độc lập ⇒ chạy song song.
  const [channels, live, ready, kpis, team, domains] = await Promise.all([
    fetchDeployChannels(),
    fetchDeployLive(),
    fetchDeployReady(),
    fetchDeployKpis(),
    fetchCampaignTeam(scope.brandId),
    loadDomains(scope.brandId),
  ]);

  return (
    <div className='flex min-h-0 flex-col'>
      <BrandScopeBar scope={scope} />
      {/*
        Đổi brand ⇒ REMOUNT. Workspace gieo state bằng `useState(() => prop)`,
        mà initializer chỉ chạy lúc mount.
      */}
      <DeployWorkspace
        key={scope.brandId ?? 'none'}
        brandId={scope.brandId}
        workspaceId={scope.workspaceId}
        team={team}
        initialChannels={channels.items}
        initialLive={live.items}
        initialReady={ready.items}
        initialKpis={kpis.kpis}
        initialDomains={domains.items}
        initialDomainSource={domains.source}
        initialError={
          channels.error ?? live.error ?? ready.error ?? scope.error
        }
        initialTab={initialTab}
      />
    </div>
  );
}
