import { CanvasEditor } from '@/components/templates/portal-v2/CanvasEditor';
import { PORTAL_V2_BASE } from '@/lib/portal-v2/nav';

type PageProps = {
  /** Page slug (preferred) or page/template UUID. */
  params: Promise<{ id: string }>;
};

/**
 * `/portal-v2/:id/canvas` — the canvas editor, full viewport, no rail.
 *
 * Lives in its own route group so it can drop `Shell`; `(portal-v2)` still owns
 * every other `/portal-v2/*` URL. Route groups may share a URL prefix — Next
 * only forbids two groups resolving the same full path.
 *
 * Experiences is the only module that opens this today, so it is the Back
 * fallback for a deep link. When Campaigns or Journeys start linking here, this
 * should read the origin off a query param rather than assume.
 */
export default async function PortalV2CanvasPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <CanvasEditor rawId={id} fallbackHref={`${PORTAL_V2_BASE}/experiences`} />
  );
}
