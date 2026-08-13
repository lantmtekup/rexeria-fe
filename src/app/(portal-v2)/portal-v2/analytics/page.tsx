import { AnalyticsWorkspace } from '@/components/organisms/portal-v2/analytics/AnalyticsWorkspace';
import { readPulseViewState } from '@/lib/portal-v2/analytics/params';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalV2AnalyticsPage({ searchParams }: Props) {
  const params = await searchParams;
  const parsed = readPulseViewState(params);
  const initialState =
    parsed.drill.campaignId && parsed.lens === 'overview'
      ? { ...parsed, lens: 'analytics' as const }
      : parsed;

  return <AnalyticsWorkspace initialState={initialState} />;
}
