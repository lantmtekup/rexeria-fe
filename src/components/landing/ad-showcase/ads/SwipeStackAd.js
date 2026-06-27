'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import AdWrapper from './shared/AdWrapper';

const SWIPE_THRESHOLD = 100;
const FLY_OUT_MS = 380;
const APPEAR_MS = 600;
const MAX_VISIBLE = 3;
const POSITION_CLASSES = [
  'swstack-card--front',
  'swstack-card--mid',
  'swstack-card--back',
];

export default function SwipeStackAd({ cards = [], brandName, headline, cta }) {
  const [frontIndex, setFrontIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [leaving, setLeaving] = useState(null);
  const [isAppearing, setIsAppearing] = useState(false);
  const [isHintClicking, setIsHintClicking] = useState(false);
  const startX = useRef(0);
  const flyTimer = useRef(null);
  const appearTimer = useRef(null);
  const clickTimer = useRef(null);

  const visibleCount = Math.min(cards.length, MAX_VISIBLE);
  const cardAt = offset => cards[(frontIndex + offset) % cards.length];

  const advance = useCallback(() => {
    if (leaving || cards.length === 0) return;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    setIsHintClicking(true);
    setLeaving({ idx: frontIndex, direction: -1 });
    clickTimer.current = setTimeout(() => setIsHintClicking(false), 520);
    flyTimer.current = setTimeout(() => {
      setFrontIndex(i => (i + 1) % cards.length);
      setLeaving(null);
    }, FLY_OUT_MS);
  }, [leaving, frontIndex, cards.length]);

  const handleStart = e => {
    if (leaving) return;
    startX.current = e.touches ? e.touches[0].clientX : e.clientX;
    setIsDragging(true);
  };

  const handleMove = useCallback(
    e => {
      if (!isDragging) return;
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      setDragX(cx - startX.current);
    },
    [isDragging]
  );

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const dx = dragX;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      const direction = dx > 0 ? 1 : -1;
      setLeaving({ idx: frontIndex, direction });
      setDragX(0);
      flyTimer.current = setTimeout(() => {
        setFrontIndex(i => (i + 1) % cards.length);
        setLeaving(null);
      }, FLY_OUT_MS);
    } else {
      setDragX(0);
    }
  };

  useEffect(() => {
    if (frontIndex === 0) return;
    setIsAppearing(true);
    if (appearTimer.current) clearTimeout(appearTimer.current);
    appearTimer.current = setTimeout(() => setIsAppearing(false), APPEAR_MS);
    return () => {
      if (appearTimer.current) clearTimeout(appearTimer.current);
    };
  }, [frontIndex]);

  const active = cardAt(0);
  const isPrice = active?.subtitle?.toString().trim().startsWith('$');
  const headingText = headline || 'Swipe to Explore';

  return (
    <AdWrapper brandName={brandName} cta={cta} theme='light'>
      <div
        className='swstack-ad'
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        <div className='swstack-stage'>
          <h2 className='swstack-heading'>{headingText}</h2>

          {Array.from({ length: visibleCount }).map((_, offset) => {
            const card = cardAt(offset);
            const slotIdx = (frontIndex + offset) % cards.length;
            const isFront = offset === 0;
            const isLeavingFront = leaving?.idx === slotIdx && isFront;
            const isAppear = isAppearing && offset === 2;
            let transform;
            if (isLeavingFront) {
              transform = `translateX(${leaving.direction * 160}%) rotate(${leaving.direction * 28}deg)`;
            } else if (isFront) {
              transform = `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`;
            }
            const cls = [
              'swstack-card',
              POSITION_CLASSES[offset],
              isDragging && isFront ? 'swstack-card--dragging' : '',
              isLeavingFront ? 'swstack-card--leaving' : '',
              isAppear ? 'swstack-card--appearing' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <div
                key={`${card.id || slotIdx}-${slotIdx}`}
                className={cls}
                style={{
                  zIndex: 10 - offset,
                  backgroundImage: `url(${card.imageUrl})`,
                  transform,
                }}
                onMouseDown={isFront ? handleStart : undefined}
                onTouchStart={isFront ? handleStart : undefined}
                aria-label={card.title}
                role='img'
              />
            );
          })}

          {active && (
            <div className='swstack-info'>
              <h3
                className='swstack-info-title'
                key={`title-${active.id || frontIndex}`}
              >
                {active.title}
              </h3>
              {active.subtitle && (
                <p
                  className={`swstack-info-sub ${
                    isPrice
                      ? 'swstack-info-sub--price'
                      : 'swstack-info-sub--desc'
                  }`}
                  key={`sub-${active.id || frontIndex}`}
                >
                  {active.subtitle}
                </p>
              )}
            </div>
          )}

          <button
            type='button'
            className={`swstack-hint ${isHintClicking ? 'swstack-hint--clicking' : ''}`}
            onClick={advance}
            aria-label='Next card'
          >
            <div className='swstack-hint-icon'>
              <span className='swstack-hint-circle' />
              <svg
                width='20'
                height='8'
                viewBox='0 0 20 8'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M0.146446 4.03519C-0.0488148 3.83993 -0.0488148 3.52335 0.146446 3.32809L3.32843 0.146107C3.52369 -0.0491555 3.84027 -0.0491555 4.03553 0.146107C4.2308 0.341369 4.2308 0.657951 4.03553 0.853214L1.20711 3.68164L4.03553 6.51007C4.2308 6.70533 4.2308 7.02191 4.03553 7.21717C3.84027 7.41244 3.52369 7.41244 3.32843 7.21717L0.146446 4.03519ZM20 3.68164V4.18164H0.5V3.68164V3.18164H20V3.68164Z'
                  fill='#0E0E0E'
                />
              </svg>
            </div>
            <span className='swstack-hint-text'>SWIPE</span>
          </button>
        </div>
      </div>
    </AdWrapper>
  );
}
