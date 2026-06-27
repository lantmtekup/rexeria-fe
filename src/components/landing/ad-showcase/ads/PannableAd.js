'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSwipe } from './shared/SwipeHandler';
import AdWrapper from './shared/AdWrapper';

function DragIcon() {
  return (
    <svg
      width='30'
      height='35'
      viewBox='0 0 30 35'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <mask
        id='pan-drag-mask'
        style={{ maskType: 'luminance' }}
        maskUnits='userSpaceOnUse'
        x='7'
        y='1'
        width='17'
        height='34'
      >
        <path d='M23.731 1H7V34.074H23.731V1Z' fill='white' />
      </mask>
      <g mask='url(#pan-drag-mask)'>
        <path
          d='M20.4334 11.3465C20.2198 11.133 20.2198 10.7879 20.4327 10.5751L21.4304 9.57734H15.5784V15.4294L16.5761 14.4316C16.7889 14.2188 17.134 14.2188 17.3476 14.4323C17.5604 14.6452 17.5604 14.9902 17.3476 15.2031L15.8047 16.746C15.3783 17.1724 14.6881 17.1724 14.2617 16.746L12.7188 15.2031C12.506 14.9902 12.506 14.6452 12.7188 14.4323C12.9324 14.2188 13.2775 14.2188 13.4903 14.4316L14.488 15.4294V9.57734H8.63601L9.63374 10.5751C9.84657 10.7879 9.84658 11.133 9.63303 11.3465C9.42019 11.5594 9.07512 11.5594 8.86228 11.3465L7.31938 9.80361C6.89299 9.37722 6.89299 8.68709 7.31938 8.2607L8.86228 6.7178C9.07512 6.50496 9.42019 6.50496 9.63303 6.7178C9.84657 6.93134 9.84657 7.27641 9.63374 7.48925L8.63601 8.48698H14.488V2.63496L13.4903 3.63269C13.2775 3.84553 12.9324 3.84553 12.7188 3.63198C12.506 3.41914 12.506 3.07407 12.7188 2.86124L14.2617 1.31833C14.6881 0.891938 15.3783 0.891938 15.8047 1.31833L17.3476 2.86124C17.5604 3.07407 17.5604 3.41914 17.3476 3.63198C17.134 3.84553 16.7889 3.84553 16.5761 3.63269L15.5784 2.63496V8.48698H21.4304L20.4327 7.48925C20.2198 7.27641 20.2198 6.93134 20.4334 6.7178C20.6462 6.50496 20.9913 6.50496 21.2041 6.7178L22.747 8.2607C23.1734 8.68709 23.1734 9.37722 22.747 9.80361L21.2041 11.3465C20.9913 11.5594 20.6462 11.5594 20.4334 11.3465Z'
          fill='white'
        />
        <path
          opacity='0.5'
          d='M12.0987 24.5842L13.3301 20.7942L9.27767 19.4775L7.73351 24.2299C6.80151 27.0983 7.73471 30.2615 10.0988 32.2441C12.4622 34.2254 15.7899 34.6368 18.5315 33.2859L20.4701 32.3291L19.6936 25.5283L23.7311 23.5354L21.775 19.8117L12.0987 24.5842Z'
          fill='white'
        />
      </g>
    </svg>
  );
}

function MouseIcon() {
  return (
    <svg
      width='30'
      height='35'
      viewBox='0 0 30 35'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <mask
        id='pan-mouse-mask'
        style={{ maskType: 'luminance' }}
        maskUnits='userSpaceOnUse'
        x='5'
        y='2'
        width='21'
        height='31'
      >
        <path d='M25.25 2H5V32.043H25.25V2Z' fill='white' />
      </mask>
      <g mask='url(#pan-mouse-mask)'>
        <path
          opacity='0.5'
          d='M5 14.5V23.272C5 28.131 9.46 32.043 15 32.043C20.54 32.043 25 28.131 25 23.272V14.5H5Z'
          fill='white'
        />
        <path
          opacity='0.5'
          d='M16.5 2V11.951H25.25V10.698C25.25 6.21 21.445 2.536 16.5 2Z'
          fill='white'
        />
        <path
          d='M13.75 2C8.805 2.536 5 6.21 5 10.698V11.951H13.75V2Z'
          fill='white'
        />
      </g>
    </svg>
  );
}

/**
 * Pannable Ad — Panorama image wider than viewport, drag to explore.
 * Ref: Hermès https://mobkoi-uk.celtra.com/preview/9d308fb5
 *
 * @param {Object}  props
 * @param {string}  props.imageUrl      - Panorama image URL
 * @param {number}  props.imageWidth    - Natural image width (px)
 * @param {number}  props.imageHeight   - Natural image height (px)
 * @param {number}  props.initialX      - Initial X offset % (default 50 = center)
 * @param {boolean} props.indicators    - Show drag indicators (default true)
 * @param {string}  props.brandName
 * @param {string}  props.headline
 * @param {Object}  props.cta
 * @param {React.ReactNode} props.children - Optional overlay content (hotspots, CTAs)
 */
export default function PannableAd({
  imageUrl,
  imageWidth = 3000,
  imageHeight = 1000,
  initialX = 20,
  indicators = true,
  brandName,
  headline,
  subtitle,
  hotspots = [],
  children,
}) {
  const offsetRef = useRef(0);
  const [offset, setOffset] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const maxOffsetRef = useRef(0);

  const imgRef = useRef(null);

  const clampOffset = useCallback(val => {
    const max = maxOffsetRef.current;
    return Math.max(-max, Math.min(0, val));
  }, []);

  const onMove = useCallback(
    dx => {
      const newOffset = clampOffset(offsetRef.current + dx);
      offsetRef.current = newOffset;
      setOffset(newOffset);
    },
    [clampOffset]
  );

  const onMomentum = useCallback(
    vx => {
      const newOffset = clampOffset(offsetRef.current + vx);
      offsetRef.current = newOffset;
      setOffset(newOffset);
    },
    [clampOffset]
  );

  const onStart = useCallback(() => {
    setHasInteracted(true);
  }, []);

  const { ref } = useSwipe({
    onMove,
    onMomentum,
    onStart,
    momentum: true,
    friction: 0.95,
    axis: 'x',
  });

  // Calculate initial offset and max pan range on image load
  const handleImageLoad = useCallback(
    e => {
      const img = e.target;
      const containerWidth = img.parentElement.parentElement.clientWidth;
      const displayedWidth = img.offsetWidth;
      const maxPan = Math.max(0, displayedWidth - containerWidth);
      maxOffsetRef.current = maxPan;

      // Set initial position
      const initOffset = -(maxPan * (initialX / 100));
      offsetRef.current = initOffset;
      setOffset(initOffset);
    },
    [initialX]
  );

  // FIX (port): maxOffset chỉ tính lúc onLoad. Khi bọc trong InterscrollerPreview,
  // khung `.isp-ad-fixed` (position:fixed) được JS set width SAU mount → container
  // đo lúc onLoad sai → maxPan=0 → kéo bị clamp về 0. Quan sát container resize để
  // tính lại maxPan + re-clamp offset hiện tại (giữ vị trí, không reset về initial).
  useEffect(() => {
    const img = imgRef.current;
    const container = img?.parentElement?.parentElement;
    if (!img || !container || typeof ResizeObserver === 'undefined') return;
    const recompute = () => {
      const maxPan = Math.max(0, img.offsetWidth - container.clientWidth);
      maxOffsetRef.current = maxPan;
      const clamped = Math.max(-maxPan, Math.min(0, offsetRef.current));
      if (clamped !== offsetRef.current) {
        offsetRef.current = clamped;
        setOffset(clamped);
      }
    };
    const ro = new ResizeObserver(recompute);
    ro.observe(container);
    recompute();
    return () => ro.disconnect();
  }, []);

  // Calculate how far through the pan we are (0-100%)
  const max = maxOffsetRef.current;
  const panProgress = max > 0 ? Math.abs(offset / max) * 100 : 0;

  return (
    <AdWrapper brandName={brandName}>
      <div className='pannable-ad' ref={ref}>
        {headline && <div className='pannable-ad-title'>{headline}</div>}
        <div
          className='pannable-ad-track'
          style={{ transform: `translateX(${offset}px)` }}
        >
          {}
          <img
            ref={imgRef}
            src={imageUrl}
            alt='Panorama'
            className='pannable-ad-img'
            style={{
              height: '100%',
              width: 'auto',
              maxWidth: 'none',
            }}
            onLoad={handleImageLoad}
            draggable={false}
          />

          {/* Children overlay (hotspots, CTAs) — moves with image */}
          {children && <div className='pannable-ad-overlay'>{children}</div>}

          {/* Hotspot items rendered from hotspots prop */}
          {hotspots && hotspots.length > 0 && (
            <div className='pannable-ad-overlay'>
              {hotspots.map(h => {
                const isOpen = activeHotspot === h.id;
                return (
                  <div
                    key={h.id}
                    className='pan-item'
                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                    onClick={e => {
                      e.stopPropagation();
                      setActiveHotspot(isOpen ? null : h.id);
                    }}
                  >
                    <span className='pan-item-dot' />
                    <div
                      className={`pan-item-card ${isOpen ? 'pan-item-card--open' : ''}`}
                    >
                      <div className='pan-item-title'>{h.label}</div>
                      {h.description && (
                        <div className='pan-item-desc'>{h.description}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drag indicators */}
        {indicators && !hasInteracted && (
          <div className='pannable-ad-indicators'>
            <div className='pannable-ad-arrow pannable-ad-arrow--left'>‹</div>
            <span>Drag to explore</span>
            <div className='pannable-ad-arrow pannable-ad-arrow--right'>›</div>
          </div>
        )}

        {/* Bottom instruction bar */}
        <div className='pannable-ad-hintbar'>
          <div className='pannable-ad-hintbar-icons'>
            <DragIcon />
            <MouseIcon />
          </div>
          <div className='pannable-ad-hintbar-text'>
            Hold and drag the mouse to experience it
          </div>
        </div>

        {/* Progress bar */}
        <div className='pannable-ad-progress'>
          <div
            className='pannable-ad-progress-fill'
            style={{ width: `${panProgress}%` }}
          />
        </div>
      </div>
    </AdWrapper>
  );
}
