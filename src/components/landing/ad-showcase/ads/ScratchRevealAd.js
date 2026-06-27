'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import AdWrapper from './shared/AdWrapper';

export default function ScratchRevealAd({
  revealImage,
  rewardText = 'You won\n−20% gift card',
  couponCode = 'amz005',
  brushSize = 44,
  revealThreshold = 40,
}) {
  const canvasRef = useRef(null);
  const adRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, visible: false });
  const scratchingRef = useRef(false);
  const prevPtRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    document.fonts.ready.then(() => drawCover(canvas));
  }, []);

  const scratch = useCallback(
    (clientX, clientY) => {
      const canvas = canvasRef.current;
      if (!canvas || revealed) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;
      const ctx = canvas.getContext('2d');

      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = brushSize * 2 * scaleX;

      if (prevPtRef.current) {
        ctx.beginPath();
        ctx.moveTo(prevPtRef.current.x, prevPtRef.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(x, y, brushSize * scaleX, 0, Math.PI * 2);
      ctx.fill();
      prevPtRef.current = { x, y };

      if (!scratch._lastCheck || Date.now() - scratch._lastCheck > 500) {
        scratch._lastCheck = Date.now();
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let transparent = 0,
          total = 0;
        for (let i = 3; i < imageData.data.length; i += 64) {
          if (imageData.data[i] === 0) transparent++;
          total++;
        }
        if (Math.round((transparent / total) * 100) >= revealThreshold)
          setRevealed(true);
      }
    },
    [brushSize, revealThreshold, revealed]
  );

  const handleMouseMove = useCallback(
    e => {
      if (!revealed && adRef.current) {
        const rect = adRef.current.getBoundingClientRect();
        setCursorPos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          visible: true,
        });
      }
      if (scratchingRef.current) scratch(e.clientX, e.clientY);
    },
    [revealed, scratch]
  );

  const handleMouseEnter = () => {
    if (!revealed) setCursorPos(p => ({ ...p, visible: true }));
  };
  const handleMouseLeave = () => {
    scratchingRef.current = false;
    prevPtRef.current = null;
    setCursorPos(p => ({ ...p, visible: false }));
  };
  const handleMouseDown = () => {
    scratchingRef.current = true;
  };
  const handleMouseUp = () => {
    scratchingRef.current = false;
    prevPtRef.current = null;
  };

  const handleTouchMove = useCallback(
    e => {
      e.preventDefault();
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    },
    [scratch]
  );
  const handleTouchStart = () => {
    scratchingRef.current = true;
  };
  const handleTouchEnd = () => {
    scratchingRef.current = false;
    prevPtRef.current = null;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  return (
    <AdWrapper showBrandBar={false} showCta={false} theme='dark'>
      <div className='scratch-ad' ref={adRef}>
        {/* Photo background — visible through canvas scratch holes */}
        <div
          className='scratch-reveal'
          style={
            revealImage ? { backgroundImage: `url(${revealImage})` } : undefined
          }
        />

        {/* Canvas — dark cover, stays visible after reveal */}
        <canvas
          ref={canvasRef}
          className={`scratch-canvas ${revealed ? 'scratch-canvas--done' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
        />

        {/* Brand — z-index 2, hiện sau reveal (canvas brand có thể đã bị cào mất) */}
        {revealed && (
          <div className='scratch-brand-reveal' aria-hidden='true'>
            ReXeR Studio.
          </div>
        )}

        {/* Reward content — z-index 2, above canvas */}
        {revealed && (
          <div className='scratch-reveal-content'>
            <p className='scratch-reward-text'>{rewardText}</p>
            {couponCode && (
              <div className='scratch-coupon'>
                <span className='scratch-coupon-code'>{couponCode}</span>
                <button
                  className='scratch-copy-btn'
                  onClick={handleCopy}
                  aria-label='Copy code'
                >
                  {copied ? (
                    <svg width='18' height='18' viewBox='0 0 18 18' fill='none'>
                      <path
                        d='M3 9l4 4 8-8'
                        stroke='#fff'
                        strokeWidth='1.8'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                  ) : (
                    <svg width='18' height='18' viewBox='0 0 18 18' fill='none'>
                      <rect
                        x='1.5'
                        y='1.5'
                        width='10'
                        height='10'
                        stroke='#fff'
                        strokeWidth='1.3'
                      />
                      <rect
                        x='6.5'
                        y='6.5'
                        width='10'
                        height='10'
                        stroke='#fff'
                        strokeWidth='1.3'
                      />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Custom round cursor */}
        <div
          className='scratch-cursor'
          style={{
            left: cursorPos.x,
            top: cursorPos.y,
            opacity: cursorPos.visible ? 1 : 0,
          }}
        />
      </div>
    </AdWrapper>
  );
}

function drawCover(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width,
    H = canvas.height;
  const sx = W / 440,
    sy = H / 956;

  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#ffffff';
  ctx.font = `400 ${Math.round(40 * sy)}px 'Cormorant Garamond', Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('ReXeR Studio.', W / 2, 272 * sy);

  const cx = 220 * sx,
    cy = 429 * sy,
    r = 68 * Math.min(sx, sy);
  const grad = ctx.createLinearGradient(
    cx - 0.56 * r,
    cy + 0.83 * r,
    cx + 0.56 * r,
    cy - 0.83 * r
  );
  grad.addColorStop(0.1044, 'rgba(153,153,153,0.3)');
  grad.addColorStop(0.8542, 'rgba(255,255,255,0.3)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.filter = 'blur(8.6px)';
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = '#fcfdff';
  ctx.fillRect(180 * sx, 402 * sy, 80 * sx, 16 * sy);
  ctx.fillRect(184 * sx, 418 * sy, 72 * sx, 48 * sy);
  ctx.fillStyle = '#b19563';
  ctx.fillRect(215.5 * sx, 402 * sy, 9 * sx, 16 * sy);
  ctx.fillRect(215 * sx, 418 * sy, 9 * sx, 48 * sy);
  const bx = 219.5 * sx,
    by = 402 * sy;
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.bezierCurveTo(
    bx - 8 * sx,
    by - 7 * sy,
    bx - 21 * sx,
    by - 18 * sy,
    bx - 14 * sx,
    by - 18 * sy
  );
  ctx.bezierCurveTo(
    bx - 7 * sx,
    by - 18 * sy,
    bx - 2 * sx,
    by - 9 * sy,
    bx,
    by
  );
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.bezierCurveTo(
    bx + 8 * sx,
    by - 7 * sy,
    bx + 21 * sx,
    by - 18 * sy,
    bx + 14 * sx,
    by - 18 * sy
  );
  ctx.bezierCurveTo(
    bx + 7 * sx,
    by - 18 * sy,
    bx + 2 * sx,
    by - 9 * sy,
    bx,
    by
  );
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(bx, by - 5 * sy, 4.5 * sx, 3.5 * sy, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${Math.round(18 * sy)}px 'SF Pro Display', -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Scratch to Discover', W / 2, 531 * sy);
}
