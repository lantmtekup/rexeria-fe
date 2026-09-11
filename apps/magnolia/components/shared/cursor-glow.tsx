'use client';
import { useEffect, useState } from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion';

export function CursorGlow({ size = 520 }: { size?: number }) {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const mx = useMotionValue(-9999);
  const my = useMotionValue(-9999);
  const sx = useSpring(mx, { stiffness: 90, damping: 22, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 90, damping: 22, mass: 0.6 });

  useEffect(() => {
    if (
      reduced ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    )
      return;
    setEnabled(true);
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced, mx, my]);

  if (!enabled) return null;
  return (
    <motion.div
      aria-hidden
      className='pointer-events-none fixed z-[1] rounded-full mix-blend-soft-light blur-3xl'
      style={{
        x: sx,
        y: sy,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        background:
          'radial-gradient(circle, rgba(224,160,64,0.5) 0%, rgba(200,129,31,0.22) 40%, transparent 70%)',
      }}
    />
  );
}
