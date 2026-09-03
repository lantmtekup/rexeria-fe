import CollectionSection from './components/CollectionSection';
import Footer from './components/Footer';
import Header from './components/Header';
import Hero from './components/Hero';
import InspirationSection from './components/InspirationSection';
import ProductStorySection from './components/ProductStorySection';
import ShowcaseSection from './components/ShowcaseSection';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProductStorySection />
        <ShowcaseSection />
        <CollectionSection />
        <InspirationSection />
      </main>
      <Footer />
    </>
  );
}
