'use client';

import { useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for handling touch/mouse drag with momentum.
 *
 * @param {Object} options
 * @param {function} options.onMove     - (deltaX, deltaY) called every frame during drag
 * @param {function} options.onMomentum - (velocityX, velocityY) called per frame after release
 * @param {function} options.onStart    - () called on drag start
 * @param {function} options.onEnd      - () called on drag end
 * @param {boolean}  options.momentum   - enable momentum (default true)
 * @param {number}   options.friction   - momentum decay 0-1 (default 0.95)
 * @param {string}   options.axis       - 'x' | 'y' | 'both' (default 'both')
 *
 * @returns {{ ref: React.RefObject, isDragging: React.RefObject<boolean> }}
 */
export function useSwipe({
  onMove,
  onMomentum,
  onStart,
  onEnd,
  momentum = true,
  friction = 0.95,
  axis = 'both',
} = {}) {
  const ref = useRef(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const rafId = useRef(null);

  const stopMomentum = useCallback(() => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  const runMomentum = useCallback(() => {
    const vx = velocity.current.x;
    const vy = velocity.current.y;

    if (Math.abs(vx) < 0.5 && Math.abs(vy) < 0.5) {
      stopMomentum();
      return;
    }

    velocity.current.x *= friction;
    velocity.current.y *= friction;

    onMomentum?.(velocity.current.x, velocity.current.y);

    rafId.current = requestAnimationFrame(runMomentum);
  }, [friction, onMomentum, stopMomentum]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleStart = (clientX, clientY) => {
      stopMomentum();
      isDragging.current = true;
      startPos.current = { x: clientX, y: clientY };
      lastPos.current = { x: clientX, y: clientY };
      velocity.current = { x: 0, y: 0 };
      onStart?.();
    };

    const handleMove = (clientX, clientY) => {
      if (!isDragging.current) return;
      const dx = clientX - lastPos.current.x;
      const dy = clientY - lastPos.current.y;
      lastPos.current = { x: clientX, y: clientY };

      velocity.current.x = dx;
      velocity.current.y = dy;

      const deltaX = axis === 'y' ? 0 : dx;
      const deltaY = axis === 'x' ? 0 : dy;
      onMove?.(deltaX, deltaY);
    };

    const handleEnd = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      onEnd?.();
      if (momentum) {
        runMomentum();
      }
    };

    // Touch events
    const onTouchStart = e => {
      const t = e.touches[0];
      handleStart(t.clientX, t.clientY);
    };
    const onTouchMove = e => {
      const t = e.touches[0];
      handleMove(t.clientX, t.clientY);
      // Prevent page scroll when dragging horizontally
      if (axis === 'x' || axis === 'both') {
        const dx = Math.abs(t.clientX - startPos.current.x);
        const dy = Math.abs(t.clientY - startPos.current.y);
        if (dx > dy) e.preventDefault();
      }
    };
    const onTouchEnd = () => handleEnd();

    // Mouse events
    const onMouseDown = e => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    };
    const onMouseMove = e => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => handleEnd();

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      stopMomentum();
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [axis, momentum, onMove, onStart, onEnd, runMomentum, stopMomentum]);

  return { ref, isDragging };
}
