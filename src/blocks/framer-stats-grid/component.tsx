'use client';

import { useEffect, useRef, useState } from 'react';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}
interface Stat {
  value: string;
  label: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

function parseNumericPart(
  v: string
): { prefix: string; num: number; suffix: string } | null {
  const m = v.match(/^([^\d.-]*)([0-9]+\.?[0-9]*)(.*)$/);
  if (!m) return null;
  const num = parseFloat(m[2]);
  return Number.isNaN(num)
    ? null
    : { prefix: m[1] || '', num, suffix: m[3] || '' };
}

function CountUpValue({ raw, active }: { raw: string; active: boolean }) {
  const [val, setVal] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const parsed = parseNumericPart(raw);
    if (!active || !parsed) {
      if (!active) setVal(0);
      return;
    }
    setVal(0);
    const start = performance.now();
    const duration = 1200;
    const target = parsed.num;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      setVal(target * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, raw]);

  const parsed = parseNumericPart(raw);
  if (!parsed) return <>{raw}</>;
  const isInt = Number.isInteger(parsed.num);
  const shown = isInt ? Math.round(val) : val.toFixed(1);
  return (
    <>
      {parsed.prefix}
      {shown}
      {parsed.suffix}
    </>
  );
}

/** Framer Stats Grid — 4-col stats over bg image, IO reveal + count-up. */
export function FramerStatsGrid({ content }: LegacyBlockComponentProps) {
  const stats = Array.isArray(content.stats) ? (content.stats as Stat[]) : [];
  const bg = (content.backgroundImage as AssetRef | null) ?? null;
  const { ref, visible } = useReveal<HTMLElement>();
  const hasBg = !!bg?.url;
  const sectionBg = hasBg ? 'transparent' : '#0a0a0a';

  return (
    <section
      id='framer-stats-grid'
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'clamp(440px, 55vh, 600px)',
        padding: 'clamp(60px, 10vh, 140px) clamp(24px, 4vw, 80px)',
        overflow: 'hidden',
        fontFamily: "'Funnel Display', 'Inter', system-ui, sans-serif",
        background: sectionBg,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <style>{`
        #framer-stats-grid .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-stats-grid .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
      `}</style>

      {hasBg && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bg!.url}
            alt={bg!.alt ?? ''}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.35) 100%)',
            }}
          />
        </div>
      )}

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1280,
          width: '100%',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
          gap: 'clamp(24px, 3vw, 56px)',
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            className={`rx-reveal ${visible ? 'is-visible' : ''}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              transitionDelay: `${i * 80}ms`,
            }}
          >
            <div
              style={{
                fontFamily: "'Aboreto', sans-serif",
                fontSize: 'clamp(42px, 5.5vw, 80px)',
                fontWeight: 400,
                lineHeight: 1,
                color: '#ffffff',
                letterSpacing: -0.5,
                textShadow: '0 2px 12px rgba(0,0,0,0.35)',
              }}
            >
              <CountUpValue raw={String(s.value || '')} active={visible} />
            </div>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                fontWeight: 500,
                lineHeight: 1.5,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.85)',
                maxWidth: 200,
                textShadow: '0 1px 6px rgba(0,0,0,0.35)',
              }}
            >
              {String(s.label || '')}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
