'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface LinkItem {
  label: string;
  href: string;
}

/** Framer footer — dark bg, "Say Hello!" italic big + huge email + simple link rows. */
export function FramerContactFooter({ content }: LegacyBlockComponentProps) {
  const greeting = String(content.greeting || 'Say Hello!');
  const email = String(content.email || '');
  const copyright = String(content.copyright || '');
  const navLinks: LinkItem[] = Array.isArray(content.navLinks)
    ? (content.navLinks as LinkItem[])
    : [];
  const socialLinks: LinkItem[] = Array.isArray(content.socialLinks)
    ? (content.socialLinks as LinkItem[])
    : [];

  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-contact-footer'
      ref={ref}
      style={{
        background: '#0a0a0a',
        color: '#ffffff',
        padding:
          'clamp(80px, 12vh, 180px) clamp(24px, 4cqi, 80px) clamp(32px, 5vh, 60px)',
        fontFamily: "'Funnel Display', 'Inter', -apple-system, sans-serif",
      }}
    >
      <style>{`
        #framer-contact-footer .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s cubic-bezier(0.16,1,0.3,1), transform 1.1s cubic-bezier(0.16,1,0.3,1); }
        #framer-contact-footer .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
      `}</style>

      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <h2
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            fontFamily: "'Aboreto', sans-serif",
            fontSize: 'clamp(56px, 10cqi, 180px)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1,
            color: '#ffffff',
            letterSpacing: -2,
            margin: '0 0 clamp(24px, 4vh, 48px)',
          }}
        >
          {greeting}
        </h2>

        <a
          href={`mailto:${email}`}
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            fontFamily: "'Aboreto', sans-serif",
            fontSize: 'clamp(32px, 5cqi, 72px)',
            fontWeight: 400,
            lineHeight: 1.1,
            color: '#00940c',
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: 'clamp(60px, 10vh, 120px)',
            wordBreak: 'break-all',
          }}
        >
          <span style={{ color: '#00940c' }}>{email}</span>
        </a>

        {/* Link grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'clamp(32px, 4cqi, 64px)',
            paddingTop: 'clamp(32px, 5vh, 60px)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: '#777',
                marginBottom: 16,
              }}
            >
              Menu
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {navLinks.map((l, i) => (
                <a
                  key={i}
                  href={l.href || '#'}
                  style={{
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: 15,
                  }}
                >
                  <span style={{ color: '#fff' }}>{String(l.label || '')}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: '#777',
                marginBottom: 16,
              }}
            >
              Social
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {socialLinks.map((l, i) => (
                <a
                  key={i}
                  href={l.href || '#'}
                  target='_blank'
                  rel='noreferrer'
                  style={{
                    color: '#fff',
                    textDecoration: 'none',
                    fontSize: 15,
                  }}
                >
                  <span style={{ color: '#fff' }}>{String(l.label || '')}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 'clamp(40px, 6vh, 80px)',
            paddingTop: 24,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            fontSize: 12,
            color: '#666',
          }}
        >
          <span>{copyright}</span>
        </div>
      </div>
    </section>
  );
}
