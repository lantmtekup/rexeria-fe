import { MiningWorkspace } from '@/components/organisms/portal-v2/mining/MiningWorkspace';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalV2MiningPage({ searchParams }: Props) {
  const raw = (await searchParams).opp;
  const opportunityId = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? null;
  return <MiningWorkspace initialOpportunityId={opportunityId} />;
}
