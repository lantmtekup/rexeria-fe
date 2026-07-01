'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import AdWrapper from './shared/AdWrapper';

/**
 * Stories Ad — Instagram-style stories with auto-progress and tap navigation.
 * Ref: Framer Stories Viewer
 */
export default function StoriesAd({
  stories = [],
  duration = 5000,
  brandName,
  cta,
  ctaFont = "'Cormorant Garamond', Georgia, serif",
}) {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const total = stories.length;

  const goTo = useCallback(
    idx => {
      const clamped = Math.max(0, Math.min(total - 1, idx));
      setCurrent(clamped);
      setProgress(0);
      startTimeRef.current = Date.now();
    },
    [total]
  );

  // Auto-advance
  useEffect(() => {
    startTimeRef.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (pct >= 100) {
        if (current < total - 1) goTo(current + 1);
        return;
      }
      timerRef.current = requestAnimationFrame(tick);
    };
    timerRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(timerRef.current);
  }, [current, duration, total, goTo]);

  // Tap left/right
  const handleTap = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX || e.changedTouches?.[0]?.clientX || 0;
    const isLeft = x - rect.left < rect.width / 3;

    if (isLeft) {
      goTo(current === 0 ? total - 1 : current - 1);
    } else {
      goTo(current === total - 1 ? 0 : current + 1);
    }
  };

  const story = stories[current];

  return (
    <AdWrapper
      brandName={brandName}
      showBrandBar={false}
      cta={cta}
      ctaFont={ctaFont}
    >
      <div className='stories-ad' onClick={handleTap}>
        <div
          className='stories-content'
          style={{ backgroundImage: `url(${story?.imageUrl})` }}
          key={current}
        >
          {story?.title && (
            <div className='stories-text'>
              <div>
                <h3>{story.title}</h3>
                {story.subtitle && <p>{story.subtitle}</p>}
              </div>

              <div className='stories-bars'>
                {stories.map((_, i) => (
                  <div key={i} className='stories-bar'>
                    <div
                      className='stories-bar-fill'
                      style={{
                        width:
                          i < current
                            ? '100%'
                            : i === current
                              ? `${progress}%`
                              : '0%',
                        transition: i === current ? 'none' : 'width 0.2s',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA at bottom */}
          {(story?.cta || cta) && (
            <a
              href={story?.cta?.href || cta?.href || '#'}
              className='stories-cta'
              onClick={e => e.stopPropagation()}
              target='_blank'
              rel='noopener noreferrer'
            >
              {story?.cta?.label || cta?.label || 'Learn More'}
            </a>
          )}
        </div>
      </div>
    </AdWrapper>
  );
}
