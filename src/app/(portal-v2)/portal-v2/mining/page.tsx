import { redirect } from 'next/navigation';

/** Mining đã được thay bằng Journey Audit — giữ route cũ như một redirect. */
export default function PortalV2MiningPage() {
  redirect('/portal-v2/journey-audit');
}
