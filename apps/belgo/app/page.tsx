import AboutProduct from '@/app/components/AboutProduct';
import BrewingProcess from '@/app/components/BrewingProcess';
import Footer from '@/app/components/Footer';
import Header from '@/app/components/Header';
import Hero from '@/app/components/Hero';
import MoreFlavors from '@/app/components/MoreFlavors';
import OurProducts from '@/app/components/OurProducts';
import ScrollFrameSequence from '@/app/components/ScrollFrameSequence';

export default function Page() {
  return (
    <main>
      <Header />
      <Hero />
      <AboutProduct />
      <BrewingProcess />
      <ScrollFrameSequence
        startSelector='#hero'
        endSelector='#about-product'
        frameCount={89}
        frameSrc='/assets/frame/frame-{i}.png'
      />
      <OurProducts />
      <MoreFlavors />
      <Footer />
    </main>
  );
}
