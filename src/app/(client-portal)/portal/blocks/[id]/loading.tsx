import { DetailSkeleton } from '@/components/molecules/skeletons/page-skeletons';
import { PortalShell } from '../../_shell';

export default function Loading() {
  return (
    <PortalShell>
      <DetailSkeleton />
    </PortalShell>
  );
}
