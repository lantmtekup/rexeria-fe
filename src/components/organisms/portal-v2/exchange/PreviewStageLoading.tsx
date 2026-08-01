'use client';

import { useEffect, useRef, useState } from 'react';

import { Logo } from '@/components/atoms/logo';
import { cn } from '@/lib/cn';

type PreviewStageLoadingProps = {
  className?: string;
  /** Accessible label. Defaults to "Loading". */
  label?: string;
  /** When true, fill runs to 100% then `onFinished` fires. */
  complete?: boolean;
  onFinished?: () => void;
};

/**
 * Shopper-preview boot UI: wordmark + determinate progress (0 → 100%).
 */
export const PreviewStageLoading = ({
  className,
  label = 'Loading',
  complete = false,
  onFinished,
}: PreviewStageLoadingProps) => {
  const [progress, setProgress] = useState(0);
  const finishedRef = useRef(false);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  useEffect(() => {
    finishedRef.current = false;
    setProgress(0);

    const id = window.setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        const next = prev + Math.max(0.6, (90 - prev) * 0.07);
        return Math.min(90, next);
      });
    }, 80);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!complete) return;

    setProgress(100);

    if (finishedRef.current) return;
    finishedRef.current = true;
    const timer = window.setTimeout(() => {
      onFinishedRef.current?.();
    }, 180);
    return () => window.clearTimeout(timer);
  }, [complete]);

  return (
    <div
      className={cn(
        'z-10 flex flex-col items-center justify-center gap-5 bg-white',
        className
      )}
      role='status'
      aria-live='polite'
      aria-busy='true'
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    >
      <Logo size={22} className='motion-safe:animate-loading-logo' />

      <div className='h-[3px] w-[120px] overflow-hidden rounded-full bg-[#e2e7f0]'>
        <span
          className='block h-full rounded-full bg-[#3862ff] transition-[width] duration-150 ease-out'
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
