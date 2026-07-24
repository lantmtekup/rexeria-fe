import Hero from './components/Hero';
import ProductShowcase from './components/ProductShowcase';
import SceneParallax from './components/SceneParallax';
import SceneReveal from './components/SceneReveal';
import ProductReveal from './components/ProductReveal';
import FinalResidences from './components/FinalResidences';
import Footer from './components/Footer';

export default function Page() {
  return (
    <main>
      <Hero />
      <ProductShowcase />
      <SceneParallax />
      <FinalResidences />
      <SceneReveal />
      <ProductReveal />
      <Footer />
    </main>
  );
}
