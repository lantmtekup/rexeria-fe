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
  fontSize: 174,
  fontWeight: 600,
  lineHeight: '1em',
  letterSpacing: '-0.09em',
  color: '#000000',
  margin: 0,
  padding: 0,
  width: '100%',
  display: 'block',
  whiteSpace: 'nowrap',
};

const bioTextStyle: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 40,
  fontWeight: 500,
  lineHeight: '1.1em',
  letterSpacing: '-0.06em',
  textAlign: 'justify',
  color: '#000000',
  margin: 0,
  width: '100%',
  whiteSpace: 'pre-wrap',
};

const emailStyle: React.CSSProperties = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: 26,
  fontWeight: 500,
  lineHeight: '1.3em',
  letterSpacing: '-0.06em',
  color: '#000000',
  margin: 0,
};

/** Hero - Yuya v2: discrete-breakpoint clone, 174/76 title + 40/28 bio at 810. */
export function FramerYuyaHero({ content }: LegacyBlockComponentProps) {
  const firstName = String(content.firstName || 'YUME');
  const lastName = String(content.lastName || 'YASKUMI');
  const email = String(content.email || 'hello@yume.com');
  const bgColor = String(content.bgColor || '#ffffff');
  const bio = String(
    content.bio ||
      "Hello, I'm a freelancer specializing in minimal design with 10 years of expertise — based in Tokyo, working remote. Let's create!"
  );
  const avatar = (content.avatar as AssetRef | null) ?? null;
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-yuya-hero'
      ref={ref}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'min(100vh, 900px)',
        backgroundColor: bgColor,
        overflow: 'hidden',
        padding: '0 80px',
        display: 'flex',
        justifyContent: 'center',
        fontFamily: '"Inter", system-ui, sans-serif',
      }}
    >
      <style>{`
        #framer-yuya-hero .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-yuya-hero .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-yuya-hero .yuya-profile {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 10px;
          width: 100%;
        }
        #framer-yuya-hero .yuya-bio-section {
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          justify-content: space-between;
          width: 100%;
        }
        #framer-yuya-hero .yuya-bio-wrapper { width: 643px; max-width: 643px; }
        #framer-yuya-hero .yuya-title { font-size: 174px; }
        #framer-yuya-hero .yuya-bio { font-size: 40px; }
        #framer-yuya-hero .yuya-avatar { width: 168px; height: 168px; }
        @media (max-width: 810px) {
          #framer-yuya-hero { padding: 0 20px !important; }
          #framer-yuya-hero .yuya-profile { flex-direction: column-reverse; gap: 30px; }
          #framer-yuya-hero .yuya-bio-section { flex-direction: column; gap: 34px; align-items: flex-start; justify-content: flex-start; }
          #framer-yuya-hero .yuya-bio-wrapper { width: 100%; max-width: 100%; }
          #framer-yuya-hero .yuya-title { font-size: 76px; }
          #framer-yuya-hero .yuya-bio { font-size: 28px; }
          #framer-yuya-hero .yuya-avatar { width: 110px; height: 110px; }
        }
      `}</style>

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 1280,
          padding: '80px 0 80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: 1,
        }}
      >
        <div className='yuya-profile'>
          <div
            style={{
              flex: '1 1 0',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div className={`rx-reveal ${visible ? 'is-visible' : ''}`}>
              <h1 className='yuya-title' style={titleLineStyle}>
                {firstName}
              </h1>
            </div>
            <div
              className={`rx-reveal ${visible ? 'is-visible' : ''}`}
              style={{ transitionDelay: '80ms' }}
            >
              <h1 className='yuya-title' style={titleLineStyle}>
                {lastName}
              </h1>
            </div>
          </div>

          <div
            className={`yuya-avatar rx-reveal ${visible ? 'is-visible' : ''}`}
            style={{
              flex: 'none',
              position: 'relative',
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
          className={`yuya-bio-section rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{ transitionDelay: '240ms' }}
        >
          <span style={emailStyle}>{email}</span>
          <div className='yuya-bio-wrapper'>
            <p className='yuya-bio' style={bioTextStyle}>
              {bio}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
