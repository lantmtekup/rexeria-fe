import { CommandWorkspace } from '@/components/organisms/portal-v2/command/CommandWorkspace';

/**
 * The Command Center reads as "what is true right now", so the page resolves
 * the clock per request rather than baking a build-time date into the bundle.
 */
export const dynamic = 'force-dynamic';

export default function PortalV2HomePage() {
  return <CommandWorkspace nowIso={new Date().toISOString()} />;
}
