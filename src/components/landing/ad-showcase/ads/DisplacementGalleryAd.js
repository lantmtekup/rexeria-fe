'use client';

import { useState, useRef } from 'react';
import AdWrapper from './shared/AdWrapper';

export default function DisplacementGalleryAd({
  slides = [],
  brandName,
  headline,
  cta,
  ctaFont = "'Cormorant Garamond', serif",
}) {
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState(null);
  const timeoutRef = useRef(null);
  const total = slides.length;

  // Visual active index — updates immediately on click
  const activeDot = next ?? current;

  const goTo = idx => {
    const from = next ?? current;
    if (idx === from) return;

    // Cancel ongoing transition and snap base layer to current visual position
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCurrent(from);
    setNext(idx);

    timeoutRef.current = setTimeout(() => {
      setCurrent(idx);
      setNext(null);
      timeoutRef.current = null;
    }, 1200);
  };

  const goToNext = () => goTo((activeDot + 1) % total);

  return (
    <AdWrapper brandName={brandName} cta={cta} ctaFont={ctaFont}>
      <div className='dg-ad' onClick={goToNext} style={{ cursor: 'pointer' }}>
        {/* Base layer — stays static, no transition (avoids opacity snap-back flash) */}
        <div
          className='dg-slide'
          style={{ backgroundImage: `url(${slides[current]?.imageUrl})` }}
        />

        {/* Incoming slide fades in on top; when done, base swaps image seamlessly */}
        {next !== null && (
          <div
            key={`entering-${next}`}
            className='dg-slide dg-slide--entering'
            style={{ backgroundImage: `url(${slides[next]?.imageUrl})` }}
          />
        )}

        {/* Headline overlay — on top of image, top-center */}
        {headline && (
          <div className='dg-headline'>
            <h2>{headline}</h2>
          </div>
        )}

        {/* Caption — synced to activeDot so it updates as new slide fades in */}
        {slides[activeDot]?.title && (
          <div className='dg-caption' key={`caption-${activeDot}`}>
            <span>{slides[activeDot].title}</span>
            {slides[activeDot].subtitle && <p>{slides[activeDot].subtitle}</p>}
          </div>
        )}

        {/* Dots */}
        {total > 1 && (
          <div className='gallery-ad-dots'>
            {slides.map((_, i) => {
              const dist = Math.abs(i - activeDot);
              const dotClass = [
                'gallery-ad-dot',
                i === activeDot ? 'gallery-ad-dot--active' : '',
                dist === 1 ? 'gallery-ad-dot--near' : '',
              ]
                .filter(Boolean)
                .join(' ');
              return (
                <button
                  key={i}
                  className={dotClass}
                  onClick={e => {
                    e.stopPropagation();
                    goTo(i);
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </AdWrapper>
  );
}
