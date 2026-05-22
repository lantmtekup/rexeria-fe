import { redirect } from 'next/navigation';

/**
 * Old route — superseded by `/admin/blocks` (richer block management UI).
 * Kept as a permanent redirect so bookmarks / sidebar links still work.
 */
export default function Page() {
  redirect('/admin/blocks');
}
