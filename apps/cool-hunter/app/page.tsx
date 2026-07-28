import FooterSection from './components/FooterSection';
import GallerySection from './components/GallerySection';
import Hero from './components/Hero';
import ProductSection from './components/ProductSection';
import QuoteSection from './components/QuoteSection';
import SectionProgress from './components/SectionProgress';
import StorySection from './components/StorySection';

export default function Page() {
  return (
    <main>
      <SectionProgress />
      <Hero />
      <StorySection />
      <GallerySection />
      <ProductSection />
      <QuoteSection />
      <FooterSection />
    </main>
  );
}
