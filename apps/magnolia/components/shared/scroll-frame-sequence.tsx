'use client';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { useMotionValueEvent, type MotionValue } from 'framer-motion';

/**
 * Canvas frame sequence, the technique the rexerai block "Hero - Scroll Video"
 * (`block-editor/blocks/DelvauxHero.tsx`) reaches for first — it only falls back to scrubbing
 * a `<video>` when no frames are supplied.
 *
 * The reason is decoding. Scrubbing a video means seeking, and a seek has to decode every
 * frame from the previous keyframe forward; the source film ran 85 frames between keyframes at
 * 4K, so a single scroll step cost dozens of 4K decodes and the picture always arrived late.
 * A frame sequence removes seeking altogether: each scroll position maps to one already-decoded
 * image and the work per frame is a single `drawImage`.
 *
 * Mirrors the block's shape: preload every frame as an `Image`, snap progress to the nearest
 * index, and draw on change. The first frame paints as soon as it lands so the canvas is never
 * blank.
 */
export type ScrollFrameSequenceProps = {
  /** Directory of zero-padded frames, e.g. `/frames/hero`. */
  dir: string;
  count: number;
  width: number;
  height: number;
  scrollYProgress: MotionValue<number>;
  /** Maps scroll progress to a 0–1 position within the sequence. */
  getProgress: (p: number) => number;
  className?: string;
  /** Shown until enough frames are decoded to scrub without gaps. */
  onReady?: () => void;
  targetRef?: RefObject<HTMLElement>;
};

const frameUrl = (dir: string, i: number) =>
  `${dir}/${String(i).padStart(4, '0')}.webp`;

export function ScrollFrameSequence({
  dir,
  count,
  width,
  height,
  scrollYProgress,
  getProgress,
  className,
  onReady,
}: ScrollFrameSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentRef = useRef(-1);
  const rafRef = useRef(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    canvas.width = width;
    canvas.height = height;

    const images: HTMLImageElement[] = new Array(count);
    imagesRef.current = images;

    const draw = (index: number) => {
      const img = images[index];
      if (!ctx || !img || !img.complete || !img.naturalWidth) return;
      ctx.drawImage(img, 0, 0, width, height);
      currentRef.current = index;
    };

    let decoded = 0;
    // Front-load the opening frames so the first paint is immediate, then let the rest stream
    // in; the sequence is usable long before the tail has arrived.
    for (let i = 0; i < count; i++) {
      const img = new Image();
      img.decoding = 'async';
      img.src = frameUrl(dir, i);
      img.onload = () => {
        decoded += 1;
        if (i === 0) draw(0);
        // A quarter of the sequence is enough to start without visible gaps.
        if (!ready && decoded >= Math.min(count, Math.ceil(count * 0.25))) {
          setReady(true);
          onReady?.();
        }
      };
      images[i] = img;
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      images.forEach(img => {
        img.onload = null;
      });
      imagesRef.current = [];
    };
    // `ready`/`onReady` deliberately excluded: re-running would restart the whole preload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dir, count, width, height]);

  const paintFor = (p: number) => {
    const t = Math.min(1, Math.max(0, getProgress(p)));
    const index = Math.min(count - 1, Math.max(0, Math.round(t * (count - 1))));
    if (index === currentRef.current) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      const img = imagesRef.current[index];
      if (!canvas || !img || !img.complete || !img.naturalWidth) return;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, width, height);
      currentRef.current = index;
    });
  };

  useMotionValueEvent(scrollYProgress, 'change', paintFor);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.3s ease' }}
    />
  );
}
