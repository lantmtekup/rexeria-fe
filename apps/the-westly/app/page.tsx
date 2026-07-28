import Hero from './components/Hero';
import ProductShowcase from './components/ProductShowcase';
import SceneParallax from './components/SceneParallax';
import SceneReveal from './components/SceneReveal';
import ProductReveal from './components/ProductReveal';
import FinalResidences from './components/FinalResidences';
import Footer from './components/Footer';
import CustomPointer, { type CursorTarget } from './components/CustomPointer';

const VIEW_TOGGLE: Omit<CursorTarget, 'id'> = {
  action: 'view',
  label: 'VIEW',
  actionPressed: 'hide',
  labelPressed: 'BACK',
};

const CURSOR_TARGETS: CursorTarget[] = [
  { id: 'showcase-stack', ...VIEW_TOGGLE },
  { id: 'reveal-stack', ...VIEW_TOGGLE },
  { id: 'scene-parallax', ...VIEW_TOGGLE },
  { id: 'scene-reveal', ...VIEW_TOGGLE },
];

export default function Page() {
  return (
    <main className='relative bg-[#F3F1EA]'>
      <CustomPointer targets={CURSOR_TARGETS} />

      <div className='relative'>
        <Hero />
        <ProductShowcase />
      </div>

      <div className='relative'>
        <SceneParallax />
        <div aria-hidden data-dwell className='h-[60svh] md:h-svh' />
        <FinalResidences />
      </div>

      <div className='relative'>
        <SceneReveal />
        <div aria-hidden data-dwell className='h-[60svh] md:h-svh' />
        <ProductReveal />
      </div>

      <Footer />
    </main>
  );
}
