import { FormSkeleton } from '@/components/molecules/skeletons/page-skeletons';
import { PortalShell } from '../_shell';

export default function Loading() {
  return (
    <PortalShell>
      <FormSkeleton />
    </PortalShell>
  );
}
