import { ExperimentsWorkspace } from '@/components/organisms/portal-v2/experiments/ExperimentsWorkspace';
import { readExperimentIdParam } from '@/lib/portal-v2/experiments/idParam';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalV2ExperimentsPage({ searchParams }: Props) {
  const experimentId = readExperimentIdParam(await searchParams);
  return <ExperimentsWorkspace initialExperimentId={experimentId} />;
}
