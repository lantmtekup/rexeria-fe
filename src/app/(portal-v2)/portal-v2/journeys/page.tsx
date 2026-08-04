import { JourneysWorkspace } from '@/components/organisms/portal-v2/journeys/JourneysWorkspace';
import { readJourneyEditParam } from '@/lib/portal-v2/journeys/editParam';

type PortalV2JourneysPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalV2JourneysPage({
  searchParams,
}: PortalV2JourneysPageProps) {
  const initialEditId = readJourneyEditParam(await searchParams);

  return <JourneysWorkspace initialEditId={initialEditId} />;
}
