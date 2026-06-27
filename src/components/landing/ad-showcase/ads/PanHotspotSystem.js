'use client';

import { useState, useRef, useEffect } from 'react';

/**
 * Reusable Hotspot overlay system (original style).
 *
 * @param {Object} props
 * @param {Array}  props.hotspots - Array of hotspot objects
 * @param {Object} props.offset   - { x, y } pixel offset from parent scroll
 */
export default function PanHotspotSystem({
  hotspots = [],
  offset = { x: 0, y: 0 },
}) {
  const [expanded, setExpanded] = useState(null);
  const cardRefs = useRef({});

  // Close on click outside
  useEffect(() => {
    if (!expanded) return;
    const handler = e => {
      const card = cardRefs.current[expanded];
      if (card && !card.contains(e.target)) {
        setExpanded(null);
      }
    };
    setTimeout(() => document.addEventListener('click', handler), 0);
    return () => document.removeEventListener('click', handler);
  }, [expanded]);

  return (
    <div className='pan-hs-overlay'>
      {hotspots.map(h => {
        const isOpen = expanded === h.id;
        return (
          <div
            key={h.id}
            className='pan-hs-point'
            style={{
              left: `${h.x}%`,
              top: `${h.y}%`,
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
            }}
            ref={el => {
              cardRefs.current[h.id] = el;
            }}
          >
            {/* Pulse dot */}
            <button
              className='pan-hs-dot'
              onClick={e => {
                e.stopPropagation();
                setExpanded(isOpen ? null : h.id);
              }}
              aria-label={h.label}
            >
              <span className='pan-hs-ping' />
              <span className='pan-hs-core' />
            </button>

            {/* Label */}
            <div className='pan-hs-label'>{h.label}</div>

            {/* Expanded card */}
            <div className={`pan-hs-card ${isOpen ? 'pan-hs-card--open' : ''}`}>
              {h.thumbnail && (
                <img
                  src={h.thumbnail}
                  alt={h.label}
                  className='pan-hs-card-img'
                />
              )}
              <div className='pan-hs-card-body'>
                <h4 className='pan-hs-card-title'>{h.label}</h4>
                <p className='pan-hs-card-desc'>{h.description}</p>
                {h.specs && (
                  <ul className='pan-hs-card-specs'>
                    {h.specs.map((s, i) => (
                      <li key={i}>
                        <span className='pan-hs-spec-key'>{s.key}</span>
                        <span className='pan-hs-spec-val'>{s.value}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {h.cta && (
                  <a
                    href={h.cta.href}
                    className='pan-hs-card-cta'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {h.cta.label}
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
