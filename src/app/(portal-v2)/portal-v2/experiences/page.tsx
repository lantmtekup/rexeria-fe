import { ExperiencesWorkspace } from '@/components/organisms/portal-v2/experiences/ExperiencesWorkspace';
import { readExchangePreviewParam } from '@/lib/portal-v2/exchange/previewParam';
import { fetchExperienceLibrary } from '@/services/portal-v2/experienceLibrary';

type PortalV2ExperiencesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalV2ExperiencesPage({
  searchParams,
}: PortalV2ExperiencesPageProps) {
  const initialPreviewId = readExchangePreviewParam(await searchParams);
  const { items, error } = await fetchExperienceLibrary();

  return (
    <ExperiencesWorkspace
      initialItems={items}
      initialError={error}
      initialPreviewId={initialPreviewId}
    />
  );
}
