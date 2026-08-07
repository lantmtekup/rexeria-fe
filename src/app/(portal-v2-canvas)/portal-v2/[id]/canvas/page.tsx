import { CanvasEditor } from '@/components/templates/portal-v2/CanvasEditor';
import {
  CANVAS_KIND_PARAM,
  EXPERIENCE_TAB_PARAM,
} from '@/lib/portal-v2/experiences/tabParam';
import { PORTAL_V2_BASE } from '@/lib/portal-v2/nav';

type PageProps = {
  /** Page slug (preferred), or page/template/block UUID when `?kind=block`. */
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * `/portal-v2/:id/canvas` — the canvas editor, full viewport, no rail.
 *
 * Lives in its own route group so it can drop `Shell`; `(portal-v2)` still owns
 * every other `/portal-v2/*` URL. Route groups may share a URL prefix — Next
 * only forbids two groups resolving the same full path.
 *
 * Serves BOTH halves of the Experiences library. `?kind=block` switches
 * `CanvasEditor` into block-direct mode; without it the id is a landing page.
 * One route rather than two because it is one editor either way — only the
 * record it loads and saves differs.
 *
 * Experiences is the only module that opens this today, so it is the Back
 * fallback for a deep link — pointed at the tab the user came from. When
 * Campaigns or Journeys start linking here, this should read the origin off a
 * query param rather than assume.
 */
export default async function PortalV2CanvasPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const isBlock = sp[CANVAS_KIND_PARAM] === 'block';

  return (
    <CanvasEditor
      rawId={id}
      fallbackHref={`${PORTAL_V2_BASE}/experiences${
        isBlock ? `?${EXPERIENCE_TAB_PARAM}=block` : ''
      }`}
    />
  );
}
