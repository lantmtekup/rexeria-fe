'use client';

import { useEffect, useState } from 'react';
import Intro from '@/app/components/Intro';
import BrandHeader from '@/app/components/BrandHeader';
import ProductOverview from '@/app/components/ProductOverview';
import ProductDetails from '@/app/components/ProductDetails';
import BrandHeritage from '@/app/components/BrandHeritage';
import RelatedProducts from '@/app/components/RelatedProducts';
import ProductSectionNav from '@/app/components/ProductSectionNav';
import { ScrollTrigger } from '@/app/lib/motion';

const NAV_IDS = ['overview', 'buy', 'brand', 'related'] as const;

type NavId = (typeof NAV_IDS)[number];

/** Section is active once its top has crossed this viewport line. */
const MARKER_RATIO = 0.5;

export default function Page() {
  const [activeNavId, setActiveNavId] = useState<NavId>('overview');

  useEffect(() => {
    let current: NavId = 'overview';

    const resolveActive = (): NavId => {
      const marker = window.innerHeight * MARKER_RATIO;
      let bestId: NavId = 'overview';

      // Last section whose top has crossed the marker (works with GSAP pin spacers)
      for (const id of NAV_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= marker) bestId = id;
      }

      return bestId;
    };

    const syncActive = () => {
      const next = resolveActive();
      if (next === current) return;
      current = next;
      setActiveNavId(next);
    };

    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: syncActive,
      onRefresh: syncActive,
    });

    ScrollTrigger.addEventListener('refresh', syncActive);
    syncActive();

    return () => {
      st.kill();
      ScrollTrigger.removeEventListener('refresh', syncActive);
    };
  }, []);

  return (
    <main className='bg-[#F5F5F5]'>
      <BrandHeader />
      <Intro />
      <div id='overview'>
        <ProductOverview />
      </div>
      <div id='buy'>
        <ProductDetails />
      </div>
      <div id='brand'>
        <BrandHeritage />
      </div>
      <div id='related'>
        <RelatedProducts />
      </div>
      <ProductSectionNav activeId={activeNavId} />
    </main>
  );
}
