'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';

import { ROUTER } from '@/settings/constants/router';

/**
 * Common wrapper for all ad formats.
 * Provides: brand bar, CTA bar, viewport tracking, animations.
 *
 * @param {Object}  props
 * @param {string}  props.brandName     - Brand/project name
 * @param {string}  props.brandLogo     - Logo URL (optional)
 * @param {string}  props.headline      - Ad headline
 * @param {string}  props.subtitle      - Subtitle text
 * @param {string | {label?: string, href?: string}} [props.cta]
 * @param {string}  [props.ctaFont]     - CSS font-family cho nút CTA
 * @param {boolean} props.showBrandBar  - Show top brand bar (default true)
 * @param {boolean} props.showCta       - Show bottom CTA bar (default true)
 * @param {string}  props.theme         - 'dark' | 'light' (default 'dark')
 * @param {React.ReactNode} props.children
 */
export default function AdWrapper({
  brandName,
  brandLogo,
  headline,
  subtitle,
  cta = { label: 'Explore Now', href: ROUTER.LANDING.HOME },
  ctaFont,
  showBrandBar = true,
  showCta = true,
  theme = 'dark',
  children,
}) {
  const wrapperRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const ctaLabel =
    typeof cta === 'string' ? cta : (cta?.label ?? 'Explore Now');
  const ctaHref =
    typeof cta === 'object' && cta?.href ? cta.href : ROUTER.LANDING.HOME;

  return (
    <div
      ref={wrapperRef}
      className={`ad-wrap ad-wrap--${theme} ${inView ? 'ad-wrap--visible' : ''}`}
    >
      {/* Brand bar */}
      {showBrandBar && (
        <div className='ad-wrap-brand'>
          {brandLogo && (
            <img src={brandLogo} alt={brandName} className='ad-wrap-logo' />
          )}
          {brandName && <span className='ad-wrap-name'>{brandName}</span>}
        </div>
      )}

      {/* Headline overlay */}
      {headline && (
        <div className='ad-wrap-headline-area'>
          <h2 className='ad-wrap-headline'>{headline}</h2>
          {subtitle && <p className='ad-wrap-subtitle'>{subtitle}</p>}
        </div>
      )}

      {/* Main content */}
      <div className='ad-wrap-content'>{children}</div>

      {showCta && (
        <div className='ad-wrap-cta-bar'>
          <Link
            href={ctaHref}
            className='ad-wrap-cta'
            style={ctaFont ? { fontFamily: ctaFont } : undefined}
          >
            {ctaLabel}
            <span className='ad-wrap-cta-arrow' />
          </Link>
        </div>
      )}
    </div>
  );
}
