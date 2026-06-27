'use client';

import { useState } from 'react';
import PannableAd from './PannableAd';

export default function PannableShoppableAd({
  imageUrl,
  ctas = [],
  brandName,
  headline,
}) {
  const [activeId, setActiveId] = useState(null);

  return (
    <PannableAd imageUrl={imageUrl} brandName={brandName} headline={headline}>
      {ctas.map(c => (
        <a
          key={c.id}
          href={c.href}
          className='ps-cta-pin'
          style={{ left: `${c.x}%`, top: `${c.y}%` }}
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
