'use client';

import type { ReactNode } from 'react';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}
interface ProjectItem {
  image: AssetRef | null;
  year: string;
  name: string;
  href: string;
  spacerBefore: number;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';
const YEAR_FONT_PX = 15;
const FONT_FAMILY = '"Work Sans", system-ui, sans-serif';

/**
 * Projects - VS Collins: 12-col scattered grid (desktop) / 4-col (mobile).
 *
 * Original used framer-motion whileInView per item. Rexer port replaces with
 * per-card IO useReveal, preserving scattered Spacer pattern + hover overlay.
 */
export function FramerVsCollinsProjects({
  content,
}: LegacyBlockComponentProps) {
  const items: ProjectItem[] = Array.isArray(content.items)
    ? (content.items as ProjectItem[])
    : [];
  const sectionBg = (content.bgColor as string) || '#ffffff';

  return (
    <section
      id='framer-vs-collins-projects'
      style={{
        position: 'relative',
        width: '100%',
        background: sectionBg,
        padding: '16px 32px 72px',
        fontFamily: FONT_FAMILY,
        overflow: 'hidden',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@500&display=swap');
        #framer-vs-collins-projects .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-vs-collins-projects .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-vs-collins-projects .vsc-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 36px;
          grid-auto-rows: minmax(0, auto);
        }
        @media (max-width: 809px) {
          #framer-vs-collins-projects { padding: 16px 20px 72px; }
          #framer-vs-collins-projects .vsc-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
        }
        #framer-vs-collins-projects .vsc-mask,
        #framer-vs-collins-projects .vsc-overlay-text { opacity: 0; transition: opacity 240ms ease; }
        #framer-vs-collins-projects .vsc-project:hover .vsc-mask,
        #framer-vs-collins-projects .vsc-project:focus-visible .vsc-mask,
        #framer-vs-collins-projects .vsc-project:hover .vsc-overlay-text,
        #framer-vs-collins-projects .vsc-project:focus-visible .vsc-overlay-text { opacity: 1; }
      `}</style>

      <div className='vsc-grid'>
        {items.flatMap((item, idx) => {
          const nodes: ReactNode[] = [];
          const spacer = Math.max(0, Math.min(item.spacerBefore ?? 0, 12));
          if (spacer > 0) {
            nodes.push(
              <div
                key={`spacer-${idx}`}
                aria-hidden='true'
                style={{ gridColumn: `span ${spacer}` }}
              />
            );
          }
          if (!item.image?.url) return nodes;
          nodes.push(
            <ProjectCell key={`project-${idx}`} item={item} index={idx} />
          );
          return nodes;
        })}
      </div>
    </section>
  );
}

function ProjectCell({ item, index }: { item: ProjectItem; index: number }) {
  const { ref, visible } = useReveal<HTMLAnchorElement>();
  return (
    <a
      ref={ref}
      href={item.href || undefined}
      className={`vsc-project rx-reveal ${visible ? 'is-visible' : ''}`}
      style={{
        gridColumn: 'span 2',
        position: 'relative',
        display: 'block',
        color: 'inherit',
        textDecoration: 'none',
        cursor: 'pointer',
        transitionDelay: `${index * 80}ms`,
      }}
      aria-label={`${item.name} (${item.year})`}
    >
      <figure
        style={{
          margin: 0,
          position: 'relative',
          width: '100%',
          aspectRatio: '3 / 4',
          overflow: 'hidden',
          borderRadius: 2,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image!.url}
          alt={item.image!.alt ?? item.name ?? ''}
          loading='lazy'
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
          className='vsc-mask'
          aria-hidden='true'
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            pointerEvents: 'none',
          }}
        />
        <div
          className='vsc-overlay-text'
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            pointerEvents: 'none',
            textAlign: 'center',
            padding: 16,
          }}
        >
          <span
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: YEAR_FONT_PX,
              fontWeight: 500,
              lineHeight: '24px',
              color: '#ffffff',
              letterSpacing: 0,
            }}
          >
            {item.name}
          </span>
          <span
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: YEAR_FONT_PX,
              fontWeight: 500,
              lineHeight: '24px',
              color: 'rgba(255, 255, 255, 0.7)',
              letterSpacing: 0,
            }}
          >
            {item.year}
          </span>
        </div>
      </figure>
    </a>
  );
}
