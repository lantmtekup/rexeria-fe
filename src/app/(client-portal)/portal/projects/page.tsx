import { redirect } from 'next/navigation';

export default function PortalProjectsIndex() {
  // List view lives on /portal — keep navigation simple by redirecting.
  redirect('/portal');
}
