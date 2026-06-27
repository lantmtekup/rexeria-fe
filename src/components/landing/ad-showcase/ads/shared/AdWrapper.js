'use client';

import { useRef, useEffect, useState } from 'react';

/**
 * Common wrapper for all ad formats.
 * Provides: brand bar, CTA bar, viewport tracking, animations.
 *
 * @param {Object}  props
 * @param {string}  props.brandName     - Brand/project name
 * @param {string}  props.brandLogo     - Logo URL (optional)
 * @param {string}  props.headline      - Ad headline
 * @param {string}  props.subtitle      - Subtitle text
 * @param {Object}  props.cta           - { label, href }
 * @param {boolean} props.showBrandBar  - Show top brand bar (default true)
 * @param {boolean} props.showCta       - Show bottom CTA (default true)
 * @param {string}  props.theme         - 'dark' | 'light' (default 'dark')
 * @param {React.ReactNode} props.children
 */
export default function AdWrapper({
  brandName,
  brandLogo,
  headline,
  subtitle,
  cta,
  showBrandBar = true,
  showCta = true,
  theme = 'dark',
  children,
}) {
  const wrapperRef = useRef(null);
  const [inView, setInView] = useState(false);

  // Track viewport visibility
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

      {/* CTA bar */}
      {showCta && cta && (
        <div className='ad-wrap-cta-bar'>
          <a
            href={cta.href}
            className='ad-wrap-cta'
            target='_blank'
            rel='noopener noreferrer'
          >
            {cta.label}
            <span className='ad-wrap-cta-arrow' />
          </a>
        </div>
      )}
    </div>
  );
}
