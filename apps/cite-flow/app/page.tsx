import {
  AmenityHighlight,
  FaqSection,
  Footer,
  Hero,
  IntroSection,
  ProjectStatistics,
  SignatureExperiences,
} from './components';

export default function Home() {
  return (
    <main>
      <Hero />
      <IntroSection />
      <SignatureExperiences />
      <AmenityHighlight
        heading='Onsen & Wellness Pavilion'
        listItems={[
          'Lush greenery, forested corridors, walking paths beside water.',
          'Views, fresh air, natural microclimate.',
        ]}
        videoSrc='/assets/amenity-loop.mp4'
        paddingTop='pt-62.5'
        paddingBottomMobile='pb-50'
        paddingBottomDesktop='md:pt-62.5 md:pb-50'
      />
      <AmenityHighlight
        heading='Nature Immersion'
        listItems={[
          '13 soaking pools designed by health consultants.',
          'Different ambient temperatures, therapies (e.g. for joints, circulation, skin).',
          'Private indoor / semi-private outdoor onsen zones.',
        ]}
        videoSrc='/assets/amenity-loop.mp4'
        paddingTop='pt-25'
        paddingBottomMobile='pb-50'
        paddingBottomDesktop='md:pb-50 lg:pb-100'
      />
      <ProjectStatistics />
      <FaqSection />
      <Footer />
    </main>
  );
}
