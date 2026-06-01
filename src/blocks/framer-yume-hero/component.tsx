'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

const titleLineStyle: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(44px, 13cqi, 174px)',
  fontWeight: 600,
  lineHeight: '1em',
  letterSpacing: '-0.09em',
  color: '#000000',
  margin: 0,
  padding: 0,
  width: '100%',
  display: 'block',
  wordBreak: 'normal',
  overflowWrap: 'normal',
  whiteSpace: 'nowrap',
};

const bioTextStyle: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 'clamp(16px, 2.5cqi, 40px)',
  fontWeight: 500,
  lineHeight: '1.25em',
  letterSpacing: '-0.04em',
  color: '#000000',
  margin: 0,
  width: '100%',
  whiteSpace: 'pre-wrap',
};

const emailStyle: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 16,
  fontWeight: 500,
  letterSpacing: '-0.02em',
  color: '#000000',
  margin: 0,
};

/** Hero - Yume: two-line giant name + circular avatar + email/bio row. */
export function FramerYumeHero({ content }: LegacyBlockComponentProps) {
  const firstName = String(content.firstName || 'YUME');
  const lastName = String(content.lastName || 'YASKUMI');
  const email = String(content.email || 'hello@yume.com');
  const bio = String(
    content.bio ||
      "Hello, I'm a freelancer specializing in minimal design with 10 years of expertise — based in Tokyo, working remote. Let's create!"
  );
  const avatar = (content.avatar as AssetRef | null) ?? null;
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-yume-hero'
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'min(100vh, 800px)',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        padding:
          'clamp(70px, 10cqi, 140px) clamp(20px, 5cqi, 80px) clamp(40px, 6cqi, 80px)',
        display: 'flex',
        justifyContent: 'center',
        fontFamily: '"Inter", system-ui, sans-serif',
      }}
    >
      <style>{`
        #framer-yume-hero .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-yume-hero .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-yume-hero .yume-top-row {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 10px;
          width: 100%;
        }
        #framer-yume-hero .yume-bottom-row {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          width: 100%;
        }
        @media (max-width: 810px) {
          #framer-yume-hero .yume-top-row { flex-direction: column-reverse; gap: 30px; align-items: flex-start; }
          #framer-yume-hero .yume-bottom-row { flex-direction: column; gap: 24px; }
        }
      `}</style>

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 1600,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 'clamp(34px, 6cqi, 80px)',
          flex: 1,
        }}
      >
        <div className='yume-top-row'>
          <div
            style={{
              flex: '1 1 0',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div
              className={`rx-reveal ${visible ? 'is-visible' : ''}`}
              style={{ overflow: 'hidden' }}
            >
              <h1 style={titleLineStyle}>{firstName}</h1>
            </div>
            <div
              className={`rx-reveal ${visible ? 'is-visible' : ''}`}
              style={{ overflow: 'hidden', transitionDelay: '80ms' }}
            >
              <h1 style={titleLineStyle}>{lastName}</h1>
            </div>
          </div>

          <div
            className={`rx-reveal ${visible ? 'is-visible' : ''}`}
            style={{
              flex: 'none',
              position: 'relative',
              width: 'clamp(80px, 11cqi, 168px)',
              height: 'clamp(80px, 11cqi, 168px)',
              borderRadius: '50%',
              overflow: 'hidden',
              alignSelf: 'flex-start',
              transitionDelay: '160ms',
            }}
          >
            {avatar?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar.url}
                alt={avatar.alt ?? 'Avatar'}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : null}
          </div>
        </div>

        <div
          className={`yume-bottom-row rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{ transitionDelay: '240ms' }}
        >
          <span style={emailStyle}>{email}</span>
          <p style={bioTextStyle}>{bio}</p>
        </div>
      </div>
    </section>
  );
}
