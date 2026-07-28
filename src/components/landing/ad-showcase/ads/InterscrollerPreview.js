'use client';

import { useState, useEffect, useRef } from 'react';
import { X, MoreHorizontal } from 'lucide-react';

/**
 * InterscrollerPreview — Copy exact approach from main page (/).
 *
 * Key technique: clip-path: inset(0) on ad container + position: fixed on ad.
 * This makes fixed position work BUT clips it to only show within the container.
 * Article sections have higher z-index + solid bg so they slide over the ad.
 */
export default function InterscrollerPreview({ children }) {
  const [showHint, setShowHint] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      // Hiện lại hint khi scroll về đầu bài; ẩn khi đã cuộn xuống.
      setShowHint(el.scrollTop <= 30);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Constrain the fixed ad to phone bounds + forward scroll events
  useEffect(() => {
    const scroll = scrollRef.current;
    const isp = scroll?.closest('.isp');
    const ad = document.querySelector('.isp-ad-fixed');
    if (!scroll || !isp || !ad) return;

    // Size the fixed ad to match phone container, not browser viewport
    const resizeAd = () => {
      const rect = isp.getBoundingClientRect();
      ad.style.top = rect.top + 'px';
      ad.style.left = rect.left + 'px';
      ad.style.width = rect.width + 'px';
      ad.style.height = rect.height + 'px';

      const phone = isp.parentElement;
      const r =
        parseFloat(getComputedStyle(isp).borderTopLeftRadius) ||
        (phone ? parseFloat(getComputedStyle(phone).borderTopLeftRadius) : 0);
      if (r) ad.style.borderRadius = r + 'px';
    };

    resizeAd();
    window.addEventListener('resize', resizeAd);

    // Also update on scroll (phone position may shift)
    const onPageScroll = () => resizeAd();
    window.addEventListener('scroll', onPageScroll, { passive: true });

    // Forward wheel/touch from ad to scroll container
    const forwardWheel = e => {
      scroll.scrollTop += e.deltaY;
    };
    let touchStartY = 0;
    const onTouchStart = e => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchMove = e => {
      const dy = touchStartY - e.touches[0].clientY;
      touchStartY = e.touches[0].clientY;
      scroll.scrollTop += dy;
    };

    ad.addEventListener('wheel', forwardWheel, { passive: true });
    ad.addEventListener('touchstart', onTouchStart, { passive: true });
    ad.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      window.removeEventListener('resize', resizeAd);
      window.removeEventListener('scroll', onPageScroll);
      ad.removeEventListener('wheel', forwardWheel);
      ad.removeEventListener('touchstart', onTouchStart);
      ad.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  const Row = () => (
    <div className='isp-row'>
      <div className='isp-thumb' />
      <div className='isp-lines'>
        <div className='isp-ln' style={{ width: '90%' }} />
        <div className='isp-ln' style={{ width: '70%' }} />
        <div className='isp-ln' style={{ width: '45%' }} />
      </div>
    </div>
  );

  return (
    <div className='isp'>
      {/* Browser bar */}
      <div className='isp-bar'>
        <X size={18} strokeWidth={2.4} className='isp-bar-x' />
        <div className='isp-bar-center'>
          <span className='isp-bar-title'>ReXeR Studio</span>
          <span className='isp-bar-url'>rexerstudio.com</span>
        </div>
        <MoreHorizontal size={18} strokeWidth={2} className='isp-bar-menu' />
      </div>

      <div className='isp-scroll' ref={scrollRef}>
        {/* ── TOP ARTICLE: z-index 10, solid bg, slides over ad ── */}
        <div className='isp-section-top'>
          <div className='isp-hero' />
          <div className='isp-lines-block'>
            <div className='isp-ln' style={{ width: '85%' }} />
            <div className='isp-ln' style={{ width: '65%' }} />
            <div className='isp-ln' style={{ width: '92%' }} />
          </div>
          <Row />
          <Row />
          <Row />
          <Row />
          <div className='isp-lines-block'>
            <div className='isp-ln' style={{ width: '100%' }} />
            <div className='isp-ln' style={{ width: '78%' }} />
          </div>
          <Row />
          <Row />
          {/* Ad label at bottom edge of top section */}
          <div className='isp-ad-label'>ADVERTISEMENT</div>
        </div>

        {/* ── AD CONTAINER: clip-path clips the fixed child ── */}
        <div className='isp-ad-container'>
          <div className='isp-ad-fixed'>
            <div className='isp-ad-content'>{children}</div>
          </div>
        </div>

        {/* ── BOTTOM ARTICLE: z-index 10, solid bg, slides over ad ── */}
        <div className='isp-section-bottom'>
          <div className='isp-scroll-continue'>
            SCROLL TO CONTINUE WITH CONTENT
          </div>
          <Row />
          <Row />
          <Row />
          <Row />
          <Row />
          <Row />
          <div className='isp-lines-block'>
            <div className='isp-ln' style={{ width: '100%' }} />
            <div className='isp-ln' style={{ width: '72%' }} />
            <div className='isp-ln' style={{ width: '88%' }} />
            <div className='isp-ln' style={{ width: '55%' }} />
          </div>
          <Row />
          <Row />
          <Row />
        </div>
      </div>

      {showHint && (
        <div className='isp-hint'>Scroll down to reveal creative.</div>
      )}
    </div>
  );
}
