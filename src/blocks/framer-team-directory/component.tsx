'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}
interface Member {
  avatar: AssetRef | null;
  name: string;
  role: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Framer Team Directory — row list with divider + stagger reveal + optional avatar. */
export function FramerTeamDirectory({ content }: LegacyBlockComponentProps) {
  const eyebrow = String(content.eyebrow || 'OUR TEAM');
  const title = String(content.title || 'Studio');
  const members = Array.isArray(content.members)
    ? (content.members as Member[])
    : [];
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-team-directory'
      ref={ref}
      style={{
        background: '#F5F3EE',
        padding: 'clamp(80px, 12vh, 160px) clamp(24px, 4vw, 80px)',
        fontFamily: "'Funnel Display', 'Inter', system-ui, sans-serif",
      }}
    >
      <style>{`
        #framer-team-directory .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-team-directory .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-team-directory .ftd-row { display: grid; grid-template-columns: 56px 1fr auto; gap: clamp(16px, 2vw, 40px); align-items: center; padding: clamp(18px, 2.4vh, 28px) 0; border-top: 1px solid rgba(26,26,26,0.14); }
        #framer-team-directory .ftd-row:last-child { border-bottom: 1px solid rgba(26,26,26,0.14); }
        #framer-team-directory .ftd-avatar-empty { width: 56px; height: 56px; border-radius: 999px; background: rgba(26,26,26,0.06); }
        @media (max-width: 640px) {
          #framer-team-directory .ftd-row { grid-template-columns: 44px 1fr; }
          #framer-team-directory .ftd-role { grid-column: 2; text-align: left; margin-top: 2px; }
        }
      `}</style>

      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{ marginBottom: 'clamp(40px, 6vh, 80px)' }}
        >
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#555',
              marginBottom: 16,
            }}
          >
            {eyebrow}
          </div>
          <h2
            style={{
              fontFamily: "'Abril Fatface', 'Cormorant Garamond', serif",
              fontSize: 'clamp(44px, 6vw, 96px)',
              fontStyle: 'italic',
              fontWeight: 400,
              lineHeight: 1.05,
              color: '#1A1A1A',
              letterSpacing: '-0.01em',
              margin: 0,
            }}
          >
            {title}
          </h2>
        </div>

        <div>
          {members.map((m, i) => (
            <MemberRow key={i} member={m} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MemberRow({ member, index }: { member: Member; index: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`ftd-row rx-reveal ${visible ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${80 + index * 80}ms` }}
    >
      <div>
        {member.avatar?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.avatar.url}
            alt={member.avatar.alt ?? member.name ?? ''}
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <div className='ftd-avatar-empty' aria-hidden />
        )}
      </div>
      <div
        style={{
          fontFamily: "'Aboreto', 'Funnel Display', serif",
          fontSize: 'clamp(22px, 2.4vw, 36px)',
          fontWeight: 400,
          color: '#1A1A1A',
          letterSpacing: '0.01em',
          lineHeight: 1.1,
        }}
      >
        {String(member.name || '')}
      </div>
      <div
        className='ftd-role'
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#666',
          textAlign: 'right',
        }}
      >
        {String(member.role || '')}
      </div>
    </div>
  );
}
