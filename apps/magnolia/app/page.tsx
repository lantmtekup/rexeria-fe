import { MainShell } from '@/components/shared/main-shell';
import { HeroSection } from '@/components/sections/hero';
import { HeritageSection } from '@/components/sections/heritage';
import { HorizontalSlideSection } from '@/components/sections/horizontal-slide';
import { InteractiveTourSection } from '@/components/sections/interactive-tour';
import { UnitsSection } from '@/components/sections/units';
import { GraceSection } from '@/components/sections/grace';
import { GallerySection } from '@/components/sections/gallery';
import { ConsultationSection } from '@/components/sections/consultation';
import { BlockInspector } from '@/components/dev/block-inspector';

export default function Page() {
  return (
    <MainShell>
      <HeroSection />
      <HeritageSection />
      <HorizontalSlideSection />
      <InteractiveTourSection />
      <UnitsSection />
      <GraceSection />
      <GallerySection />
      <ConsultationSection />
      <BlockInspector />
    </MainShell>
  );
}
