import FeatureShowcase from '@/app/components/FeatureShowcase';
import HeroStage from '@/app/components/HeroStage';
import ElevatedLiving from '@/app/components/ElevatedLiving';
import Footer from '@/app/components/Footer';
import SectionSnap from '@/app/components/SectionSnap';

import { SHOWCASE_SECTIONS } from '@/app/data/showcase';

export default function Page() {
  return (
    <main>
      <HeroStage />
      <ElevatedLiving />
      <FeatureShowcase sections={SHOWCASE_SECTIONS} />
      <Footer />
      <SectionSnap />
    </main>
  );
}
