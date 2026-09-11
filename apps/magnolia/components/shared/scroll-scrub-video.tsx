'use client';
import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { useMotionValueEvent, type MotionValue } from 'framer-motion';

/**
 * Scroll-scrubbed <video>: never played, only `currentTime` is written from a scroll progress MotionValue.
 * State machine: dormant → loading → priming → ready, with 3 recovery attempts then fallback (poster only).
 */
const RECOVERY = {
  maxAttempts: 3,
  metadataTimeoutMs: 8000,
  initialFrameTimeoutMs: 5000,
  seekTimeoutMs: 3000,
  retryDelaysMs: [250, 1000],
};
const FRAME = 1 / 24;
const HALF_FRAME = 1 / 48;

type Phase =
  | 'dormant'
  | 'loading'
  | 'priming'
  | 'ready'
  | 'retry-wait'
  | 'fallback';
type State = { phase: Phase; attempt: number; reason: string | null };
type Action =
  | { type: 'activate' }
  | { type: 'metadata-valid' }
  | { type: 'frame-ready' }
  | { type: 'recover'; reason: string }
  | { type: 'retry' };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'activate':
      return s.phase === 'dormant'
        ? { phase: 'loading', attempt: 1, reason: null }
        : s;
    case 'metadata-valid':
      return s.phase === 'loading' ? { ...s, phase: 'priming' } : s;
    case 'frame-ready':
      return s.phase === 'loading' || s.phase === 'priming'
        ? { ...s, phase: 'ready' }
        : s;
    case 'recover':
      if (s.phase === 'fallback' || s.phase === 'retry-wait') return s;
      return {
        ...s,
        phase: s.attempt >= RECOVERY.maxAttempts ? 'fallback' : 'retry-wait',
        reason: a.reason,
      };
    case 'retry':
      return s.phase === 'retry-wait'
        ? { phase: 'loading', attempt: s.attempt + 1, reason: s.reason }
        : s;
  }
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export type ScrollScrubVideoProps = {
  src: string;
  poster?: string;
  className?: string;
  targetRef: RefObject<HTMLElement>;
  scrollYProgress: MotionValue<number>;
  getTime: (progress01: number, duration: number) => number;
  enabled?: boolean;
  diagnosticLabel: string;
  activateImmediately?: boolean;
  rootMargin?: string;
};

export function ScrollScrubVideo({
  src,
  poster,
  className = '',
  targetRef,
  scrollYProgress,
  getTime,
  enabled = true,
  diagnosticLabel,
  activateImmediately = false,
  rootMargin = '0px',
}: ScrollScrubVideoProps) {
  const [state, dispatch] = useReducer(reducer, {
    phase: 'dormant',
    attempt: 0,
    reason: null,
  });
  const [active, setActive] = useState(activateImmediately);
  const videoRef = useRef<HTMLVideoElement>(null);
  const durationRef = useRef(0);
  const progressRef = useRef(0);
  const rafRef = useRef(0);
  const pendingRef = useRef<{ target: number; force: boolean } | null>(null);
  const seekTimerRef = useRef(0);
  const phaseRef = useRef(state.phase);
  phaseRef.current = state.phase;

  const diag = useCallback(
    (event: string, extra: Record<string, unknown> = {}) => {
      if (typeof window === 'undefined') return;
      window.dispatchEvent(
        new CustomEvent('scroll-scrub-video-diagnostic', {
          detail: {
            event,
            label: diagnosticLabel,
            phase: phaseRef.current,
            attempt: state.attempt,
            visibility: document.visibilityState,
            ...extra,
          },
        })
      );
    },
    [diagnosticLabel, state.attempt]
  );

  const desiredTime = useCallback(() => {
    const d = durationRef.current;
    if (!d) return 0;
    const t = getTime(clamp01(progressRef.current), d);
    return Math.min(Math.max(0, t), Math.max(0, d - FRAME));
  }, [getTime]);

  const seek = useCallback((t: number, force = false) => {
    const v = videoRef.current;
    const ph = phaseRef.current;
    if (!v || !(ph === 'loading' || ph === 'priming' || ph === 'ready')) return;
    if (pendingRef.current) {
      pendingRef.current.force ||= force;
      return;
    }
    if (!force && Math.abs(t - v.currentTime) < HALF_FRAME) return;
    pendingRef.current = { target: t, force };
    window.clearTimeout(seekTimerRef.current);
    seekTimerRef.current = window.setTimeout(() => {
      const vv = videoRef.current;
      if (
        vv &&
        vv.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        Math.abs(vv.currentTime - t) < HALF_FRAME
      ) {
        pendingRef.current = null;
        dispatch({ type: 'frame-ready' });
      } else {
        pendingRef.current = null;
        dispatch({ type: 'recover', reason: 'seek-timeout' });
      }
    }, RECOVERY.seekTimeoutMs);
    try {
      v.currentTime = t;
    } catch {
      pendingRef.current = null;
      dispatch({ type: 'recover', reason: 'seek-assignment-failed' });
    }
  }, []);

  const scheduleSeek = useCallback(
    (force = false) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => seek(desiredTime(), force));
    },
    [seek, desiredTime]
  );

  useMotionValueEvent(scrollYProgress, 'change', v => {
    progressRef.current = v;
    if (phaseRef.current === 'ready') scheduleSeek();
  });

  // Activation: immediately, or when target intersects.
  useEffect(() => {
    if (!enabled) return;
    if (activateImmediately) {
      setActive(true);
      dispatch({ type: 'activate' });
      return;
    }
    const el = targetRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      entries => {
        const on = entries.some(e => e.isIntersecting);
        if (on) {
          setActive(true);
          dispatch({ type: 'activate' });
          if (phaseRef.current === 'ready') scheduleSeek(true);
        } else {
          cancelAnimationFrame(rafRef.current);
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, activateImmediately, targetRef, rootMargin, scheduleSeek]);

  // Phase timeouts.
  useEffect(() => {
    if (state.phase === 'loading') {
      const id = window.setTimeout(
        () => dispatch({ type: 'recover', reason: 'metadata-timeout' }),
        RECOVERY.metadataTimeoutMs
      );
      return () => window.clearTimeout(id);
    }
    if (state.phase === 'priming') {
      const id = window.setTimeout(
        () => dispatch({ type: 'recover', reason: 'initial-frame-timeout' }),
        RECOVERY.initialFrameTimeoutMs
      );
      return () => window.clearTimeout(id);
    }
    if (state.phase === 'retry-wait') {
      const delay = RECOVERY.retryDelaysMs[state.attempt - 1] ?? 0;
      const id = window.setTimeout(() => dispatch({ type: 'retry' }), delay);
      return () => window.clearTimeout(id);
    }
    if (state.phase === 'ready') scheduleSeek(true);
  }, [state.phase, state.attempt, scheduleSeek]);

  useEffect(() => {
    diag(`phase-${state.phase}`, { reason: state.reason });
  }, [state.phase, state.reason, diag]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'hidden')
        cancelAnimationFrame(rafRef.current);
      else if (phaseRef.current === 'ready') scheduleSeek(true);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      cancelAnimationFrame(rafRef.current);
      window.clearTimeout(seekTimerRef.current);
    };
  }, [scheduleSeek]);

  const dataAttrs = {
    'data-scroll-scrub-label': diagnosticLabel,
    'data-scroll-scrub-state': enabled ? state.phase : 'disabled',
    'data-scroll-scrub-attempt': state.attempt,
    'data-scroll-scrub-reason': state.reason ?? undefined,
  };
  const mounted =
    enabled &&
    active &&
    (state.phase === 'loading' ||
      state.phase === 'priming' ||
      state.phase === 'ready');

  return (
    <>
      <span aria-hidden className='hidden' {...dataAttrs} />
      {mounted && (
        <video
          key={state.attempt}
          ref={videoRef}
          aria-hidden
          muted
          playsInline
          preload='auto'
          poster={poster}
          {...dataAttrs}
          className={`${className} ${state.phase === 'ready' ? 'opacity-100' : 'opacity-0'}`}
          onLoadedMetadata={e => {
            const v = e.currentTarget;
            if (!Number.isFinite(v.duration) || v.duration <= 0) {
              dispatch({ type: 'recover', reason: 'invalid-duration' });
              return;
            }
            durationRef.current = v.duration;
            v.pause();
            dispatch({ type: 'metadata-valid' });
            const d = desiredTime();
            seek(
              d > HALF_FRAME
                ? d
                : Math.min(0.1, Math.max(0, v.duration - FRAME)),
              true
            );
            if (v.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA)
              dispatch({ type: 'frame-ready' });
          }}
          onLoadedData={e => {
            if (
              e.currentTarget.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
            )
              dispatch({ type: 'frame-ready' });
          }}
          onCanPlay={e => {
            if (
              e.currentTarget.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
            )
              dispatch({ type: 'frame-ready' });
          }}
          onSeeked={e => {
            window.clearTimeout(seekTimerRef.current);
            pendingRef.current = null;
            dispatch({ type: 'frame-ready' });
            if (
              Math.abs(desiredTime() - e.currentTarget.currentTime) >=
              HALF_FRAME
            )
              scheduleSeek(true);
          }}
          onError={() => dispatch({ type: 'recover', reason: 'media-error' })}
          onWaiting={() => diag('waiting')}
          onStalled={() => diag('stalled')}
        >
          <source src={src} type='video/mp4' />
        </video>
      )}
    </>
  );
}
