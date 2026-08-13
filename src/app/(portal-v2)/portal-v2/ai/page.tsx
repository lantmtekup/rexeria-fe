import { IntelligenceWorkspace } from '@/components/organisms/portal-v2/intelligence/IntelligenceWorkspace';
import { readIntelViewState } from '@/lib/portal-v2/intelligence/params';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalV2AiPage({ searchParams }: Props) {
  const params = await searchParams;
  return <IntelligenceWorkspace initialState={readIntelViewState(params)} />;
}
