import { ExperiencesWorkspace } from '@/components/organisms/portal-v2/experiences/ExperiencesWorkspace';
import { readExperienceTabParam } from '@/lib/portal-v2/experiences/tabParam';
import { readExchangePreviewParam } from '@/lib/portal-v2/exchange/previewParam';
import { fetchExperienceLibrary } from '@/services/portal-v2/experienceLibrary';

type PortalV2ExperiencesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalV2ExperiencesPage({
  searchParams,
}: PortalV2ExperiencesPageProps) {
  const sp = await searchParams;
  const initialPreviewId = readExchangePreviewParam(sp);
  const initialTab = readExperienceTabParam(sp);
  const { items, error, softError } = await fetchExperienceLibrary();

  return (
    <ExperiencesWorkspace
      initialItems={items}
      initialError={error}
      initialSoftError={softError}
      initialTab={initialTab}
      initialPreviewId={initialPreviewId}
    />
  );
}
