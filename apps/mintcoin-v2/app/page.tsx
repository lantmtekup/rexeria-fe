import WorksSection from './components/sections/WorksSection';
import ManifestoSection from './components/sections/ManifestoSection';
import ServicesSection from './components/sections/ServicesSection';
import ProcessSection from './components/sections/ProcessSection';
import EmblemSection from './components/sections/EmblemSection';
import CtaSection from './components/sections/CtaSection';

// Kunai-cloned scaffold for Jack Pine 1 kilo gold coin advertising.
// Sections: Emblem (top) · Manifesto · Works · Services · Process · CTA.
// The original Hero banner is hidden (Emblem now leads the page).
export default function Home() {
  return (
    <main>
      {/* Hero banner hidden — Emblem block leads the page instead. */}
      {/* <HeroSection /> */}
      {/* Hero pins (sticky) while the Manifesto rises up over it (parallax
          overlap). Wrapper bounds the sticky so Emblem releases after. */}
      <div className='relative'>
        <EmblemSection />
        <ManifestoSection />
      </div>
      <WorksSection />
      <ServicesSection />
      <ProcessSection />
      <CtaSection />
    </main>
  );
}
