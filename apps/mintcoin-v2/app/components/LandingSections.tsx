import EmblemSection from './sections/EmblemSection';
import ManifestoSection from './sections/ManifestoSection';
import WorksSection from './sections/WorksSection';
import ServicesSection from './sections/ServicesSection';
import ProcessSection from './sections/ProcessSection';
import CtaSection from './sections/CtaSection';

// Shared landing body — used by the public page (`/`) and the analytics overlay
// page (`/analytics`) so the section list lives in one place.
// Sections: Emblem (top) · Manifesto · Works · Services · Process · CTA.
export default function LandingSections() {
  return (
    <main>
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
