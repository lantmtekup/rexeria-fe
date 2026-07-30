/**
 * Resolve the DOM host for overlay portals (header, sticky menu, drawers).
 *
 * Priority:
 * 1. `[data-device-frame]` — PreviewMode /dev/blocks fixed-width device shell
 * 2. `[data-landing-preview]` — full preview overlay (legacy fallback)
 * 3. `document.body` — public `/p` page
 */
export function resolveDrawerPortalHost(
  anchor: HTMLElement | null
): HTMLElement {
  if (!anchor) return document.body;
  return (
    anchor.closest<HTMLElement>('[data-device-frame]') ??
    anchor.closest<HTMLElement>('[data-landing-preview]') ??
    document.body
  );
}

/** True when portal host is the simulated device frame (not body). */
export function isDeviceFrameHost(host: HTMLElement | null): boolean {
  return !!host && host.hasAttribute('data-device-frame');
}
