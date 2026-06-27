'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import AdWrapper from './shared/AdWrapper';

export default function SliderCompareAd({
  beforeImage,
  afterImage,
  beforeLabel = 'DAY VIEW',
  afterLabel = 'NIGHT VIEW',
  adTitle,
  initialPosition = 50,
  brandName,
  headline,
  subtitle,
}) {
  const containerRef = useRef(null);
  const [position, setPosition] = useState(initialPosition);
  const isDragging = useRef(false);

  const updatePosition = useCallback(clientX => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, pct)));
  }, []);

  useEffect(() => {
    const onMouseMove = e => {
      if (!isDragging.current) return;
      updatePosition(e.clientX);
    };
    const onMouseUp = () => {
      isDragging.current = false;
    };
    const onTouchMove = e => {
      if (!isDragging.current) return;
      updatePosition(e.touches[0].clientX);
    };
    const onTouchEnd = () => {
      isDragging.current = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [updatePosition]);

  const handleStart = useCallback(
    e => {
      isDragging.current = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      updatePosition(clientX);
    },
    [updatePosition]
  );

  return (
    <AdWrapper brandName={brandName} subtitle={subtitle}>
      <div
        className='slider-ad'
        ref={containerRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        {/* After image (full background) */}
        <div
          className='slider-ad-layer slider-ad-after'
          style={{ backgroundImage: `url(${afterImage})` }}
        />

        {/* Before image (clipped) */}
        <div
          className='slider-ad-layer slider-ad-before'
          style={{
            backgroundImage: `url(${beforeImage})`,
            clipPath: `inset(0 ${100 - position}% 0 0)`,
          }}
        />

        {/* Title overlay */}
        {headline && <div className='slider-ad-title'>{headline}</div>}

        {/* Left label — DAY VIEW */}
        <div
          className='slider-ad-label slider-ad-label--left'
          style={{ opacity: position > 15 ? 1 : 0 }}
        >
          <span>{beforeLabel}</span>
        </div>

        {/* Right label — NIGHT VIEW */}
        <div
          className='slider-ad-label slider-ad-label--right'
          style={{ opacity: position < 85 ? 1 : 0 }}
        >
          <span>{afterLabel}</span>
        </div>

        {/* Slider handle */}
        <div className='slider-ad-handle' style={{ left: `${position}%` }}>
          <div className='slider-ad-line' />
          <div className='slider-ad-knob'>
            <svg
              width='35'
              height='8'
              viewBox='0 0 35 8'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M0.146447 3.32858C-0.0488155 3.52384 -0.0488155 3.84042 0.146447 4.03568L3.32843 7.21766C3.52369 7.41293 3.84027 7.41293 4.03553 7.21766C4.2308 7.0224 4.2308 6.70582 4.03553 6.51056L1.20711 3.68213L4.03553 0.853702C4.2308 0.65844 4.2308 0.341857 4.03553 0.146595C3.84027 -0.0486672 3.52369 -0.0486672 3.32843 0.146595L0.146447 3.32858ZM34.8536 4.03568C35.0488 3.84042 35.0488 3.52384 34.8536 3.32858L31.6716 0.146595C31.4763 -0.0486672 31.1597 -0.0486672 30.9645 0.146595C30.7692 0.341857 30.7692 0.65844 30.9645 0.853702L33.7929 3.68213L30.9645 6.51056C30.7692 6.70582 30.7692 7.0224 30.9645 7.21766C31.1597 7.41293 31.4763 7.41293 31.6716 7.21766L34.8536 4.03568ZM0.5 3.68213V4.18213H34.5V3.68213V3.18213H0.5V3.68213Z'
                fill='#C69229'
              />
            </svg>
          </div>
        </div>
      </div>
    </AdWrapper>
  );
}
