'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Hotspot,
  HotspotDrawer,
  HotspotInfoCard,
  HotspotTab,
  isLightBackground,
  useDrawerScrollLock,
  useIsMobile,
} from '../ProductHotspotUI';

interface Props {
  id?: string;
  variant: '1' | '2';
  mainImage: string;
  mainAlt: string;
  tabs: HotspotTab[];
  /** Sticky wrapper background — varies per section. */
  backgroundColor?: string;
  /** Inline scroll info-card background — passed per section. */
  panelBackgroundColor?: string;
}

const PNJ_NAVY = '#001932';
const PNJ_NAVY_CARD = 'rgba(0, 39, 78, 0.88)';

// Reusable product detail block (Delvaux reference pattern):
//   - Big product image fills the section
//   - SMALL hotspot dots positioned ON specific points of the product
//   - Clicking a dot opens a full side panel (drawer) with the feature
//
// SCROLL-SEQUENCE: tall section + CSS sticky inner wrapper. As the user
// scrolls, scrollStep advances 0→N-1; the matching hotspot lights up and an
// inline info card reveals that feature. Click → full drawer still works.
export default function ProductDetailSection({
  id,
  variant,
  mainImage,
  mainAlt,
  tabs,
  backgroundColor = PNJ_NAVY,
  panelBackgroundColor = PNJ_NAVY_CARD,
}: Props) {
  const lightBg = isLightBackground(backgroundColor);
  const lightPanel = isLightBackground(panelBackgroundColor);
  const sectionRef = useRef<HTMLElement>(null);
  const imgScrollRef = useRef<HTMLDivElement>(null);
  const behindRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [scrollStep, setScrollStep] = useState(0);
  const [inPin, setInPin] = useState(false);
  const lastStepRef = useRef(0);
  const isMobile = useIsMobile();

  useDrawerScrollLock(activeTab);

  // Center the default scroll position of the pannable image on mobile.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = imgScrollRef.current;
    if (!el) return;
    const center = () => {
      if (window.innerWidth >= 768) return;
      const offset = (el.scrollWidth - el.clientWidth) / 2;
      if (offset > 0) el.scrollLeft = offset;
    };
    const t = setTimeout(center, 50);
    window.addEventListener('resize', center);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', center);
    };
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = sectionRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const img = root.querySelector<HTMLElement>('.zoomin-img');

      if (img) {
        gsap.fromTo(
          img,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 1.0,
            ease: 'sine.out',
            scrollTrigger: { trigger: root, start: 'top 85%', once: true },
          }
        );

        if (
          variant === '2' &&
          !window.matchMedia('(max-width: 767px)').matches
        ) {
          gsap.fromTo(
            img,
            { scale: 0.78 },
            {
              scale: 1.05,
              ease: 'none',
              scrollTrigger: {
                trigger: root,
                start: 'top bottom',
                end: 'top top',
                scrub: 1,
                invalidateOnRefresh: true,
              },
            }
          );
        }
      }

      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        invalidateOnRefresh: true,
        onToggle: self => setInPin(self.isActive),
        onUpdate: self => {
          const step = Math.min(
            Math.floor(self.progress * tabs.length),
            tabs.length - 1
          );
          if (step !== lastStepRef.current) {
            lastStepRef.current = step;
            setScrollStep(step);
          }
        },
      });
    }, root);

    return () => ctx.revert();
  }, [tabs.length, variant]);

  const tabOpen = activeTab !== null;
  const tabData = activeTab
    ? (tabs.find(t => t.key === activeTab) ?? null)
    : null;
  const stepTab = tabs[scrollStep];
  const cardVisible = inPin && !tabOpen;

  return (
    <section
      id={id}
      ref={sectionRef}
      data-variant={variant}
      className='product-detail relative w-full'
      style={{ height: `${Math.max(tabs.length, 2) * 120}vh` }}
    >
      <div
        className={`sticky top-0 h-[70vh] w-full overflow-hidden md:h-screen ${
          lightBg ? 'text-[#003468]' : 'text-white'
        }`}
        style={{ touchAction: 'pan-y', backgroundColor }}
      >
        <div
          className='content relative h-full w-full'
          style={!isMobile ? { contain: 'paint' } : undefined}
        >
          <div ref={behindRef} className='wrapper-image absolute inset-0'>
            <div
              ref={imgScrollRef}
              className='img product-detail-pan relative h-full w-full overflow-hidden'
            >
              <div className='relative h-full w-full p-6 md:p-16'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mainImage}
                  alt={mainAlt}
                  loading='eager'
                  decoding='async'
                  fetchPriority='high'
                  className='zoomin-img h-full w-full object-contain select-none'
                  draggable={false}
                />

                <div
                  style={{
                    opacity: tabOpen ? 0 : 1,
                    pointerEvents: tabOpen ? 'none' : 'auto',
                    transition: 'opacity 300ms ease',
                  }}
                >
                  {tabs.map((t, i) => (
                    <Hotspot
                      key={t.key}
                      xPct={t.dotX}
                      yPct={t.dotY}
                      label={t.label}
                      active={inPin && scrollStep === i}
                      ringOffsetColor={backgroundColor}
                      onClick={() =>
                        setActiveTab(activeTab === t.key ? null : t.key)
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {stepTab && (
            <HotspotInfoCard
              tab={stepTab}
              visible={cardVisible}
              panelBackgroundColor={panelBackgroundColor}
              lightPanel={lightPanel}
            />
          )}
        </div>
      </div>

      <HotspotDrawer
        tab={tabData}
        open={tabOpen}
        isMobile={isMobile}
        behindRef={behindRef}
        onClose={() => setActiveTab(null)}
      />
    </section>
  );
}
