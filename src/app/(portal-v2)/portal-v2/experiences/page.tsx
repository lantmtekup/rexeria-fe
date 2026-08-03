import { ExperiencesWorkspace } from '@/components/organisms/portal-v2/experiences/ExperiencesWorkspace';
import { fetchExperienceLibrary } from '@/services/portal-v2/experienceLibrary';

export default async function PortalV2ExperiencesPage() {
  const { items, error } = await fetchExperienceLibrary();
  return <ExperiencesWorkspace initialItems={items} initialError={error} />;
}
