'use client';

import * as React from 'react';

interface InViewBlockProps {
  children: React.ReactNode;
  className?: string;
  /** Fraction of element visible to trigger reveal. Defaults to 0.15. */
  threshold?: number;
  /** Negative bottom margin to start animation slightly before fully in view. */
  rootMargin?: string;
}

/**
 * Lazy reveal wrapper: renders children invisibly (preserving layout) until
 * the wrapper scrolls into view, then mounts a fresh copy so each block's
 * `animate-in` keyframes fire when the user can actually see them.
 *
 * Without this, every block in a vertical stack (e.g. PreviewMode, public
 * share view) animates simultaneously on initial mount — by the time the
 * user scrolls down to block N, its animation has already completed.
 *
 * Pattern: keep an invisible copy in the DOM for layout reservation; swap
 * to a `key`-bumped copy on first intersection so React remounts the subtree
 * and animation classes restart.
 */
export function InViewBlock({
  children,
  className,
  threshold = 0.15,
  rootMargin = '0px 0px -10% 0px',
}: InViewBlockProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [revealKey, setRevealKey] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    if (revealKey !== null) return;

    // Skip if browser doesn't support IntersectionObserver — render immediately.
    if (typeof IntersectionObserver === 'undefined') {
      setRevealKey(Date.now());
      return;
    }

    const obs = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealKey(Date.now());
            obs.disconnect();
            return;
          }
        }
      },
      { threshold, rootMargin }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [revealKey, threshold, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {revealKey === null ? (
        // Reserve layout — invisible copy holds height. No flash since
        // animate-in's fill-mode-forwards leaves the final state visible
        // anyway; we just hide it until reveal.
        <div className='invisible' aria-hidden>
          {children}
        </div>
      ) : (
        <div key={revealKey}>{children}</div>
      )}
    </div>
  );
}
