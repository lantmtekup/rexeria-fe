'use client';

import { useState, useRef, useCallback } from 'react';
import AdWrapper from './shared/AdWrapper';
import { useSwipe } from './shared/SwipeHandler';

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
  const dragAccRef = useRef(0);
  const didDragRef = useRef(false);
  const total = slides.length;

  // Visual active index — updates immediately on click
  const activeDot = next ?? current;
  const activeDotRef = useRef(activeDot);
  activeDotRef.current = activeDot;

  const goTo = useCallback(
    idx => {
      const from = activeDotRef.current;
      if (idx === from || total < 1) return;

      // Cancel ongoing transition and snap base layer to current visual position
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setCurrent(from);
      setNext(idx);

      timeoutRef.current = setTimeout(() => {
        setCurrent(idx);
        setNext(null);
        timeoutRef.current = null;
      }, 1200);
    },
    [total]
  );

  const goToNext = useCallback(() => {
    goTo((activeDotRef.current + 1) % total);
  }, [goTo, total]);

  const goToPrev = useCallback(() => {
    goTo((activeDotRef.current - 1 + total) % total);
  }, [goTo, total]);

  const onMove = useCallback(dx => {
    dragAccRef.current += dx;
    if (Math.abs(dragAccRef.current) > 8) didDragRef.current = true;
  }, []);

  const onEnd = useCallback(() => {
    const d = dragAccRef.current;
    dragAccRef.current = 0;
    if (Math.abs(d) < 48) {
      // Small movement — allow click-to-advance
      queueMicrotask(() => {
        didDragRef.current = false;
      });
      return;
    }
    if (d < 0) goToNext();
    else goToPrev();
    queueMicrotask(() => {
      didDragRef.current = false;
    });
  }, [goToNext, goToPrev]);

  const { ref } = useSwipe({
    onMove,
    onEnd,
    axis: 'x',
    momentum: false,
  });

  const handleClick = () => {
    if (didDragRef.current) return;
    goToNext();
  };

  return (
    <AdWrapper brandName={brandName} cta={cta} ctaFont={ctaFont}>
      <div
        className='dg-ad'
        ref={ref}
        onClick={handleClick}
        tabIndex={0}
        aria-label='Displacement gallery. Drag or click to change slides.'
        onKeyDown={e => {
          if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            goToNext();
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goToPrev();
          }
        }}
      >
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
                  type='button'
                  className={dotClass}
                  aria-label={`Go to slide ${i + 1}`}
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
