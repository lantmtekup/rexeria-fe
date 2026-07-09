'use client';

import { useState } from 'react';
import PannableAd from './PannableAd';
import { useDeviceView } from './shared/useDeviceView';

export default function PannableShoppableAd({
  imageUrl,
  ctas = [],
  brandName,
  headline,
  cta,
  ctaFont = "'Outfit', system-ui, sans-serif",
}) {
  const [activeId, setActiveId] = useState(null);

  const { device } = useDeviceView();
  const isDesktop = device === 'desktop';

  return (
    <PannableAd
      imageUrl={imageUrl}
      brandName={brandName}
      headline={headline}
      cta={cta}
      ctaFont={ctaFont}
    >
      {ctas.map(c => (
        <a
          key={c.id}
          href={c.href}
          className='ps-cta-pin'
          style={{
            left: `${isDesktop && c.xDesktop !== undefined ? c.xDesktop : c.x}%`,
            top: `${isDesktop && c.yDesktop !== undefined ? c.yDesktop : c.y}%`,
          }}
          target='_blank'
          rel='noopener noreferrer'
          onMouseDown={e => e.stopPropagation()}
          onClick={e => {
            e.preventDefault();
            setActiveId(activeId === c.id ? null : c.id);
          }}
        >
          <span className='ps-cta-stack'>
            <span className='ps-cta-dot' aria-hidden='true' />
            <span className='ps-cta-line' aria-hidden='true' />
            <span
              className={`ps-cta-card${activeId === c.id ? 'ps-cta-card--active' : ''}`}
            >
              {c.imageUrl && (
                <span
                  className='ps-cta-thumb'
                  style={{ backgroundImage: `url(${c.imageUrl})` }}
                  aria-hidden='true'
                />
              )}
              <span className='ps-cta-text'>
                <span className='ps-cta-name'>{c.label}</span>
                {c.price && <span className='ps-cta-price'>{c.price}</span>}
              </span>
            </span>
          </span>
        </a>
      ))}
    </PannableAd>
  );
}
