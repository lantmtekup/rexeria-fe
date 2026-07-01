'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSwipe } from './shared/SwipeHandler';

const DEFAULT_IMAGE =
  'https://d10zufojjcedud.cloudfront.net/ad-showcase/images/interscroller-scroll/background.webp';

const DEFAULT_HOTSPOTS = [
  {
    id: 'pool',
    label: 'POOL & FITNESS',
    x: 47,
    y: 51,
    title: 'Pool & Fitness',
    desc: "A relaxing indoor swimming pool and state-of-the-art fitness overlook Resort's magnificent grounds.",
    image:
      'https://d10zufojjcedud.cloudfront.net/ad-showcase/images/interscroller-scroll/image-detail.webp',
  },
  {
    id: 'villas',
    label: 'GRAND VILLAS',
    x: 42,
    y: 62,
    title: 'Grand Villas',
    desc: 'Spacious private villas framed by lush tropical gardens, offering refined resort living.',
    image:
      'https://d10zufojjcedud.cloudfront.net/ad-showcase/images/interscroller-scroll/image-detail.webp',
  },
  {
    id: 'garden',
    label: 'GARDEN PLACE',
    x: 50,
    y: 74,
    title: 'Garden Place',
    desc: 'Landscaped gardens and serene walkways weaving through the heart of the resort.',
    image:
      'https://d10zufojjcedud.cloudfront.net/ad-showcase/images/interscroller-scroll/image-detail.webp',
  },
];

const DEFAULT_HINT = 'EXPLORE BY HOLDING AND DRAGGING THE CURSOR';

function CursorIcon() {
  return (
    <svg
      width='15'
      height='17'
      viewBox='0 0 15 17'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M9.04853 16.9965L7.85048 17C6.20823 16.8461 4.61828 16.2329 3.38909 15.0934L0.769713 12.4744C0.292608 11.9969 0.0552313 11.2844 0.00411297 10.6265L0 8.41924C0.0364292 7.67623 0.361941 6.99312 0.840221 6.44629L1.96541 5.30035L1.9895 2.80524C2.03357 2.09512 2.50539 1.50423 3.06299 1.2176C3.74163 0.868707 4.48549 0.935078 5.09479 1.33037C5.36038 0.614966 5.98731 0.097501 6.73469 0.0140956C7.71711 -0.095741 8.5491 0.445219 8.88695 1.32626C9.45102 0.967383 10.0909 0.883978 10.7325 1.13478C11.2261 1.32744 11.6726 1.75327 11.8947 2.32654C12.4741 1.94417 13.2085 1.88778 13.8384 2.17735C14.4683 2.46692 14.9036 3.06074 14.9935 3.75618L15 10.9866C14.8643 12.425 14.3143 13.7654 13.3554 14.8315C12.252 16.0825 10.6861 16.8608 9.04853 16.9971V16.9965ZM7.83873 15.9739L8.38517 15.9939C8.47448 15.9974 8.53324 15.9985 8.62431 15.9939L9.04618 15.9727C11.6479 15.7037 13.6797 13.6697 13.9676 11.0494L13.9747 3.82842C13.8701 3.3368 13.47 3.01258 12.9911 3.02021C12.5293 3.01081 12.1109 3.34796 12.0228 3.83136L12.0034 4.57907C11.9646 4.83457 11.7372 5.019 11.4952 5.01842C11.2666 5.01842 10.9981 4.83575 10.9934 4.57731L10.9622 2.83578C10.9164 2.41288 10.5474 2.08748 10.1602 2.02992C9.52094 1.93594 9.00447 2.38469 8.99683 3.00846L8.97626 4.62077C8.97333 4.86276 8.69364 5.01842 8.47213 5.0143C8.28293 5.01019 8.00678 4.84514 8.00443 4.60961L7.97857 1.97295C7.97329 1.43434 7.54612 1.03434 7.02672 1.01378C6.55255 0.995577 6.02433 1.34447 6.01728 1.88425L5.98143 4.58436C5.97732 4.88274 5.6095 5.08009 5.36273 4.99962C5.11595 4.91915 4.97846 4.74999 4.97611 4.50154L4.95965 2.8023C4.84097 2.31362 4.43202 1.99585 3.95021 2.02287C3.4831 2.02287 3.08473 2.37235 3.00482 2.86456L2.99542 7.53291C2.99542 7.81132 2.72337 8.01337 2.4907 8.01396C2.24627 8.01513 1.98715 7.83188 1.98186 7.56933L1.96541 6.73938L1.64813 7.06185C1.32966 7.44657 1.02237 7.91822 1.02295 8.44508L1.0253 10.5655C1.0253 11.043 1.25387 11.5381 1.59524 11.8811L3.89263 14.1907L4.21814 14.4732C5.2505 15.326 6.49262 15.8347 7.83932 15.9739H7.83873Z'
        fill='white'
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width='14'
      height='14'
      viewBox='0 0 14 14'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M1 1L13 13M13 1L1 13'
        stroke='#ffffff'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
    </svg>
  );
}

function CtaArrow() {
  return (
    <svg
      width='16'
      height='12'
      viewBox='0 0 16 12'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M1 6H15M10 1L15 6L10 11'
        stroke='#ffffff'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

export default function PannableAerialAd({
  imageUrl = DEFAULT_IMAGE,
  initialX = 50,
  hotspots = DEFAULT_HOTSPOTS,
  hint = DEFAULT_HINT,
  alt = 'Aerial view',
  cta,
  ctaFont = "'Outfit', system-ui, sans-serif",
}) {
  const offsetRef = useRef(0);
  const detailRef = useRef(null);
  const maxOffsetRef = useRef(0);
  const imgRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [detail, setDetail] = useState(null);

  const clampOffset = useCallback(val => {
    const max = maxOffsetRef.current;
    return Math.max(-max, Math.min(0, val));
  }, []);

  const onMove = useCallback(
    dx => {
      if (detailRef.current) return;
      const next = clampOffset(offsetRef.current + dx);
      offsetRef.current = next;
      setOffset(next);
    },
    [clampOffset]
  );

  const onMomentum = useCallback(
    vx => {
      if (detailRef.current) return;
      const next = clampOffset(offsetRef.current + vx);
      offsetRef.current = next;
      setOffset(next);
    },
    [clampOffset]
  );

  const { ref } = useSwipe({
    onMove,
    onMomentum,
    momentum: true,
    friction: 0.94,
    axis: 'x',
  });

  const handleImageLoad = useCallback(
    e => {
      const img = e.target;
      const container = img.parentElement?.parentElement;
      const containerWidth = container ? container.clientWidth : 0;
      const displayedWidth = img.offsetWidth;
      const maxPan = Math.max(0, displayedWidth - containerWidth);
      maxOffsetRef.current = maxPan;

      const init = -(maxPan * (initialX / 100));
      offsetRef.current = init;
      setOffset(init);
      setLoaded(true);
    },
    [initialX]
  );

  // Catch cache-hit: khi ảnh đã có sẵn trong browser cache, onLoad có thể fire
  // synchronous trước khi React attach listener → state loaded bị kẹt ở false.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      handleImageLoad({ target: img });
    }
  }, [imageUrl, handleImageLoad]);

  // FIX (port từ PannableAd.js): khi bọc trong InterscrollerPreview, khung
  // `.isp-ad-fixed` (position:fixed) được JS set width/height SAU mount bằng
  // resizeAd(). Lúc onLoad container.clientWidth có thể = 0 → maxPan=0 →
  // clampOffset luôn trả 0 → kéo ngang bị khoá cứng. ResizeObserver theo dõi
  // container, recompute maxPan + re-clamp offset khi size đổi (giữ vị trí
  // tương đối, không reset về initialX).
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

  const openDetail = h => {
    detailRef.current = h;
    setDetail(h);
  };
  const closeDetail = () => {
    detailRef.current = null;
    setDetail(null);
  };

  return (
    <div className='aerial-ad' ref={ref}>
      {!loaded && <div className='aerial-loader' aria-hidden='true' />}

      <div
        className='aerial-track'
        style={{ transform: `translateX(${offset}px)` }}
      >
        <img
          ref={imgRef}
          src={imageUrl}
          alt={alt}
          className='aerial-img'
          onLoad={handleImageLoad}
          draggable={false}
        />

        <div className='aerial-overlay'>
          {hotspots.map(h => (
            <button
              key={h.id}
              type='button'
              className='aerial-pin'
              style={{ left: `${h.x}%`, top: `${h.y}%` }}
              onClick={() => openDetail(h)}
              aria-label={h.label}
            >
              <span className='aerial-pin-marker'>
                <span className='aerial-pin-core' />
              </span>
              <span className='aerial-pin-badge'>{h.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className='aerial-hint'>
        <span className='aerial-hint-cursor'>
          <CursorIcon />
        </span>
        <span className='aerial-hint-text'>{hint}</span>
      </div>

      {detail && (
        <div className='aerial-detail' role='dialog' aria-label={detail.label}>
          <div className='aerial-detail-bar'>
            <span className='aerial-detail-label'>{detail.label}</span>
            <button
              type='button'
              className='aerial-detail-close'
              onClick={closeDetail}
              aria-label='Close'
            >
              <CloseIcon />
            </button>
          </div>

          <div className='aerial-detail-body'>
            {detail.image && (
              <img
                src={detail.image}
                alt={detail.title}
                className='aerial-detail-img'
              />
            )}
            <h3 className='aerial-detail-title'>{detail.title}</h3>
            <p className='aerial-detail-desc'>{detail.desc}</p>
          </div>

          <div className='aerial-detail-cta-wrap'>
            <button type='button' className='aerial-detail-cta'>
              <span>EXPLORE</span>
              <CtaArrow />
            </button>
          </div>
        </div>
      )}
      {!detail && (
        <div
          className='ad-wrap-cta-bar'
          style={ctaFont ? { fontFamily: ctaFont } : undefined}
        >
          <a
            href={(typeof cta === 'object' && cta?.href) || '#'}
            target='_blank'
            rel='noopener noreferrer'
            className='ad-wrap-cta'
          >
            {(typeof cta === 'string' ? cta : cta?.label) || 'Explore Now'}
            <span className='ad-wrap-cta-arrow' />
          </a>
        </div>
      )}
    </div>
  );
}
