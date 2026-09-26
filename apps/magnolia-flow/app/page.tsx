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
        heading='The Pavilion Lobby'
        listItems={[
          'A double-height arrival hall drawing on the proportions of the Vietnamese pavilion.',
          'A residents-only private arrival that turns the end of the day into a homecoming.',
        ]}
        imageSrc='/assets/amenity-lobby.webp'
        imageAlt='The Pavilion Lobby at The Magnolia'
        paddingTop='pt-62.5'
        paddingBottomMobile='pb-50'
        paddingBottomDesktop='md:pt-62.5 md:pb-50'
      />
      <AmenityHighlight
        heading='The Car Gallery'
        listItems={[
          'A display floor treated as a gallery — every car shown as a piece in its own right.',
          'The Vertical Garden carries planting up the elevation, casting shade along every level.',
          'The Place: architecture and landscape resolved into one composition.',
        ]}
        imageSrc='/assets/amenity-gallery.webp'
        imageAlt='The Car Gallery at The Magnolia'
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
