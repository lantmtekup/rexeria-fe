'use client';

import * as React from 'react';

import { PREVIEW_PAGE_PREFIX } from './linkToken';
import type { LinkResolveMode } from './resolveLinks';

/**
 * Click delegation for rendered blocks.
 *
 * ## Why capture phase
 *
 * A handful of blocks own their anchors' click behaviour — `PnjStickyMenu`
 * treats any non-`http(s)` value as an in-page section id and calls
 * `preventDefault()` on it, so a resolved `/p/root/sub` href would be
 * swallowed and nothing would happen. React attaches its delegated listeners
 * at the root container and only dispatches bubble-phase handlers once the
 * native event travels back up, so a **native capture listener on a descendant
 * runs first**. That lets us stop those handlers before they misread the href —
 * without editing ~200 block components.
 *
 * ## Why the listener is on `document`, not on the wrapper
 *
 * 16 blocks portal their sticky bars / drawers out of the render tree (see
 * `resolveDrawerPortalHost`), and on the public site the portal host is
 * `document.body` — i.e. OUTSIDE this wrapper. A listener on the wrapper would
 * never see those anchors, which is most of the navigation UI. Listening at
 * `document` covers portaled content; ownership is then decided per mode
 * rather than by DOM containment.
 *
 * `useBlockTracking` also listens in capture at `document`. `stopPropagation`
 * does not affect other listeners on the same node (that would need
 * `stopImmediatePropagation`), so clicks are still tracked.
 *
 * ## Why public mode mostly does nothing
 *
 * Cross-page navigation is deliberately a **full document navigation**:
 * `LandingMotionRoot` lives inside the page subtree, so a soft nav would tear
 * down and rebuild Lenis + every `gsap.context()` mid-flight (stale pinned
 * spacers, wrong scroll position, ScrollTrigger refresh races) — and
 * `@view-transition { navigation: auto }` in `public-transitions.css` only
 * applies to cross-document navigation, so a soft nav would also lose the
 * cross-fade. So we let the browser handle the anchor and only step in for
 * in-page `#blk-` scrolling and for the blocks that would otherwise hijack it.
 */

interface LinkNavProps {
  mode: LinkResolveMode;
  /** Public slug of the landing — used to recognise our own internal links. */
  rootSlug?: string;
  /** Preview only: switch the previewed page. */
  onNavigatePage?: (pageId: string) => void;
  children: React.ReactNode;
  className?: string;
}

function getLenis(): { scrollTo: (t: Element, o?: unknown) => void } | null {
  const w = window as unknown as {
    __lenis?: { scrollTo: (t: Element, o?: unknown) => void };
  };
  return w.__lenis ?? null;
}

function scrollToAnchor(root: HTMLElement | null, hash: string): boolean {
  const id = hash.replace(/^#/, '');
  if (!id) return false;
  // Prefer a match inside this render root: the editor canvas and the preview
  // overlay can both mount blocks with the same ids at once.
  let target: Element | null = null;
  try {
    target =
      root?.querySelector(`#${CSS.escape(id)}`) ??
      document.querySelector(`#${CSS.escape(id)}`);
  } catch {
    target = null;
  }
  if (!target) return false;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(target, { offset: 0 });
  else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return true;
}

export function LinkNav({
  mode,
  rootSlug,
  onNavigatePage,
  children,
  className,
}: LinkNavProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    /**
     * Is this anchor part of OUR rendered blocks?
     *
     * Containment alone is not enough (portaled overlays live under
     * `document.body`), so also accept anything carrying a block-content
     * marker or sitting inside a preview/device-frame host. Admin chrome has
     * none of these, so canvas-mode blocking never hits the app's own nav.
     */
    const owns = (anchor: HTMLElement): boolean => {
      const root = rootRef.current;
      if (root?.contains(anchor)) return true;
      return !!anchor.closest(
        '[data-element-key], [data-block-id], [data-device-frame], [data-landing-preview]'
      );
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      // Preserve open-in-new-tab / middle-click / modified clicks.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const anchor = (e.target as HTMLElement | null)?.closest?.(
        'a[href]'
      ) as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const raw = anchor.getAttribute('href') ?? '';
      const root = rootRef.current;

      // Editing: a stray CTA click must not navigate the admin app away.
      if (mode === 'canvas') {
        if (!owns(anchor)) return;
        e.preventDefault();
        return;
      }

      if (mode === 'preview') {
        // Our own markers are unambiguous — no containment check needed.
        if (raw.startsWith(PREVIEW_PAGE_PREFIX)) {
          e.preventDefault();
          e.stopPropagation();
          onNavigatePage?.(raw.slice(PREVIEW_PAGE_PREFIX.length));
          return;
        }
        if (!owns(anchor)) return;
        if (raw.startsWith('#')) {
          e.preventDefault();
          scrollToAnchor(root, raw);
          return;
        }
        // External links inside the preview overlay: don't leave the editor.
        e.preventDefault();
        return;
      }

      // ── public ────────────────────────────────────────────────────────
      if (raw.startsWith('#')) {
        // Only own anchors we generated; leave the blocks' own `#discover`
        // style section links to their existing handlers.
        if (!raw.startsWith('#blk-')) return;
        e.preventDefault();
        e.stopPropagation();
        scrollToAnchor(root, raw);
        return;
      }

      if (!rootSlug) return;
      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      const base = `/p/${rootSlug}`;
      if (url.pathname !== base && !url.pathname.startsWith(`${base}/`)) return;

      // The link points at another page of THIS template. Stop the blocks that
      // hijack anchor clicks, then navigate for real (cross-document, so the
      // view transition and a clean GSAP/Lenis world both survive).
      e.preventDefault();
      e.stopPropagation();
      window.location.assign(url.href);
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [mode, rootSlug, onNavigatePage]);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
