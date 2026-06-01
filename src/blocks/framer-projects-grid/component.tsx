'use client';

import { useReveal } from '../_shared/use-reveal';
import type { LegacyBlockComponentProps } from '../types';

interface AssetRef {
  url?: string;
  alt?: string;
}
interface Project {
  image: AssetRef | null;
  name: string;
  category: string;
  href: string;
}

const EASE_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** Framer projects grid — 3-col responsive grid, IO stagger reveal, hover image zoom. */
export function FramerProjectsGrid({ content }: LegacyBlockComponentProps) {
  const eyebrow = String(content.eyebrow || 'FEATURED WORK');
  const title = String(content.title || 'Projects');
  const projects = Array.isArray(content.projects)
    ? (content.projects as Project[])
    : [];
  const { ref, visible } = useReveal<HTMLElement>();

  return (
    <section
      id='framer-projects-grid'
      ref={ref}
      style={{
        background: '#F5F3EE',
        padding: 'clamp(80px, 12vh, 160px) clamp(24px, 4vw, 80px)',
        fontFamily: "'Funnel Display', 'Inter', system-ui, sans-serif",
      }}
    >
      <style>{`
        #framer-projects-grid .rx-reveal { opacity: 0; transform: translate3d(0, 24px, 0); transition: opacity 1.1s ${EASE_EXPO}, transform 1.1s ${EASE_EXPO}; }
        #framer-projects-grid .rx-reveal.is-visible { opacity: 1; transform: translate3d(0, 0, 0); }
        #framer-projects-grid .fpg-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(16px, 2vw, 32px); }
        @media (max-width: 900px) { #framer-projects-grid .fpg-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { #framer-projects-grid .fpg-grid { grid-template-columns: 1fr; } }
        #framer-projects-grid .fpg-card:hover .fpg-img { transform: scale(1.04); }
        #framer-projects-grid .fpg-img { transition: transform 0.7s ${EASE_EXPO}; will-change: transform; }
      `}</style>

      <div style={{ maxWidth: 1360, margin: '0 auto' }}>
        <div
          className={`rx-reveal ${visible ? 'is-visible' : ''}`}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 'clamp(40px, 6vh, 80px)',
          }}
        >
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#555',
            }}
          >
            {eyebrow}
          </div>
          <h2
            style={{
              fontFamily: "'Abril Fatface', 'Cormorant Garamond', serif",
              fontSize: 'clamp(40px, 5vw, 80px)',
              fontStyle: 'italic',
              fontWeight: 400,
              lineHeight: 1.0,
              color: '#1A1A1A',
              letterSpacing: '-0.01em',
              margin: 0,
            }}
          >
            {title}
          </h2>
        </div>

        <div className='fpg-grid'>
          {projects.map((p, i) => (
            <ProjectCard key={i} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const href = String(project.href || '');
  const Inner = (
    <>
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          aspectRatio: '4 / 5',
          background: '#E8E5DE',
          marginBottom: 16,
        }}
      >
        {project.image?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.image.url}
            alt={project.image.alt ?? ''}
            loading='lazy'
            className='fpg-img'
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : null}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 12,
        }}
      >
        <div
          style={{
            fontFamily: "'Aboreto', 'Funnel Display', serif",
            fontSize: 'clamp(18px, 1.6vw, 24px)',
            fontWeight: 400,
            color: '#1A1A1A',
            letterSpacing: '0.02em',
          }}
        >
          {String(project.name || '')}
        </div>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#777',
            whiteSpace: 'nowrap',
          }}
        >
          {String(project.category || '')}
        </div>
      </div>
    </>
  );

  return (
    <div
      ref={ref}
      className={`fpg-card rx-reveal ${visible ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${120 + index * 120}ms` }}
    >
      {href ? (
        <a
          href={href}
          style={{
            textDecoration: 'none',
            color: 'inherit',
            display: 'block',
          }}
          aria-label={`View project ${project.name}`}
        >
          {Inner}
        </a>
      ) : (
        Inner
      )}
    </div>
  );
}
