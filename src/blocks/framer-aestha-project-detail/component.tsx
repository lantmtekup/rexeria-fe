'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}

interface ImageItem {
  image: AssetRef | null;
  aspect?: string;
}

interface NavLink {
  label: string;
  href: string;
}

/** Framer Aestha Project Detail — sticky title, body paragraphs, image stack. */
export function FramerAesthaProjectDetail({
  content,
}: LegacyBlockComponentProps) {
  const projectTitle = String(content.projectTitle ?? 'TẦM NHÌN');
  const sectionLabel = String(content.sectionLabel ?? 'Khái niệm');
  const body = String(content.body ?? '');
  const nextLabel = String(content.nextLabel ?? 'Dự án tiếp theo');
  const nextProjectText = String(content.nextProjectText ?? 'Kiến trúc');
  const nextProjectHref = String(
    content.nextProjectHref ?? '/page/aestha-projects'
  );
  const images: ImageItem[] = Array.isArray(content.images)
    ? (content.images as ImageItem[])
    : [];
  const navLinks: NavLink[] = Array.isArray(content.navLinks)
    ? (content.navLinks as NavLink[])
    : [];

  const { ref, visible } = useReveal<HTMLElement>();

  const paragraphs = body
    .split(/\n{2,}/)
    .map(p => p.trim())
    .filter(Boolean);

  return (
    <section
      id='framer-aestha-project-detail'
      ref={ref}
      style={{
        background: '#FFFFFF',
        color: '#1A1A1A',
        fontFamily:
          "'Switzer Variable', 'Funnel Display', 'Inter', -apple-system, sans-serif",
        position: 'relative',
        padding: 'clamp(24px, 3.5cqi, 48px)',
      }}
    >
      <style>{`
        #framer-aestha-project-detail .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s cubic-bezier(0.16,1,0.3,1), transform 1.1s cubic-bezier(0.16,1,0.3,1); }
        #framer-aestha-project-detail .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-aestha-project-detail .fapd-wrap {
          display: grid;
          grid-template-columns: minmax(200px, 260px) minmax(320px, 460px) 1fr;
          gap: clamp(24px, 3cqi, 64px);
          max-width: 1440px;
          margin: 0 auto;
          align-items: start;
        }
        #framer-aestha-project-detail .fapd-left {
          position: sticky;
          top: clamp(24px, 3vh, 48px);
          align-self: start;
          display: flex;
          flex-direction: column;
          gap: clamp(120px, 18vh, 240px);
        }
        #framer-aestha-project-detail .fapd-title {
          font-family: 'Funnel Display', 'Switzer', 'Inter', sans-serif;
          font-size: clamp(36px, 4.5cqi, 60px);
          font-weight: 500;
          letter-spacing: -0.02em;
          line-height: 1;
          margin: 0;
        }
        #framer-aestha-project-detail .fapd-side-label {
          font-size: 14px;
          letter-spacing: 0.02em;
          color: #1A1A1A;
          margin: 0;
        }
        #framer-aestha-project-detail .fapd-body {
          display: flex;
          flex-direction: column;
          gap: clamp(18px, 2.2vh, 32px);
        }
        #framer-aestha-project-detail .fapd-paragraph {
          font-size: 16px;
          line-height: 1.55;
          color: #1A1A1A;
          margin: 0;
          max-width: 460px;
        }
        #framer-aestha-project-detail .fapd-right {
          display: flex;
          flex-direction: column;
          gap: clamp(16px, 2cqi, 32px);
        }
        #framer-aestha-project-detail .fapd-img-wrap {
          position: relative;
          overflow: hidden;
          background: #EEE;
          width: 100%;
        }
        #framer-aestha-project-detail .fapd-next-row {
          grid-column: 1 / span 2;
          display: grid;
          grid-template-columns: minmax(200px, 260px) minmax(320px, 460px);
          gap: clamp(24px, 3cqi, 64px);
          margin-top: clamp(40px, 6vh, 80px);
          padding-top: clamp(32px, 4vh, 48px);
          border-top: 1px solid rgba(26,26,26,0.1);
        }
        #framer-aestha-project-detail .fapd-next-link {
          font-family: 'Funnel Display', 'Switzer', 'Inter', sans-serif;
          font-size: 16px;
          color: #1A1A1A;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: opacity 0.2s ease;
        }
        #framer-aestha-project-detail .fapd-next-link:hover { opacity: 0.55; }
        #framer-aestha-project-detail .fapd-nav {
          grid-column: 1 / -1;
          display: flex;
          gap: clamp(16px, 2.4cqi, 32px);
          align-items: center;
          margin-top: clamp(32px, 5vh, 64px);
        }
        #framer-aestha-project-detail .fapd-nav-link {
          font-family: 'DM Mono', ui-monospace, monospace;
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #1A1A1A;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }
        #framer-aestha-project-detail .fapd-nav-link:hover { opacity: 0.55; }
        @media (max-width: 960px) {
          #framer-aestha-project-detail .fapd-wrap { grid-template-columns: 1fr; gap: 24px; }
          #framer-aestha-project-detail .fapd-left {
            position: static;
            gap: 20px;
          }
          #framer-aestha-project-detail .fapd-next-row {
            grid-column: 1;
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className='fapd-wrap'>
        {/* Left column — sticky title + labels */}
        <div className='fapd-left'>
          <h1 className={`fapd-title rx-reveal ${visible ? 'is-visible' : ''}`}>
            {projectTitle}
          </h1>
          {sectionLabel ? (
            <p
              className={`fapd-side-label rx-reveal ${visible ? 'is-visible' : ''}`}
            >
              {sectionLabel}
            </p>
          ) : null}
        </div>

        {/* Middle column — body paragraphs */}
        <div className='fapd-body'>
          {paragraphs.length === 0 ? (
            <p
              className={`fapd-paragraph rx-reveal ${visible ? 'is-visible' : ''}`}
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {body}
            </p>
          ) : (
            paragraphs.map((p, idx) => (
              <p
                key={idx}
                className={`fapd-paragraph rx-reveal ${visible ? 'is-visible' : ''}`}
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {p}
              </p>
            ))
          )}
        </div>

        {/* Right column — image stack */}
        <div className='fapd-right'>
          {images.map((item, i) => {
            const asset = item.image as AssetRef | null;
            const aspect = String(item.aspect || '5:4').replace(':', ' / ');
            return (
              <div
                key={i}
                className={`fapd-img-wrap rx-reveal ${visible ? 'is-visible' : ''}`}
                style={{ aspectRatio: aspect }}
              >
                {asset?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.url}
                    alt={asset.alt ?? ''}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Next project (spans left + middle) */}
        {(nextProjectText || nextProjectHref) && (
          <div className='fapd-next-row'>
            <p
              className={`fapd-side-label rx-reveal ${visible ? 'is-visible' : ''}`}
            >
              {nextLabel}
            </p>
            <a
              href={nextProjectHref || '#'}
              className={`fapd-next-link rx-reveal ${visible ? 'is-visible' : ''}`}
              aria-label={nextProjectText}
            >
              <span>{nextProjectText}</span>
              <span aria-hidden>→</span>
            </a>
          </div>
        )}

        {/* Nav links — bottom full-width */}
        <nav className='fapd-nav' aria-label='Site navigation'>
          {navLinks.map((n, i) => (
            <a
              key={i}
              href={n.href || '#'}
              className={`fapd-nav-link rx-reveal ${visible ? 'is-visible' : ''}`}
              aria-label={n.label || `Menu ${i + 1}`}
            >
              <span>{String(n.label || '')}</span>
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
