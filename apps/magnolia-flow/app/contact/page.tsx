import {
  ContactForm,
  FaqSection,
  Footer,
  Header,
  ImageGallery,
} from '../components';

export default function ContactPage() {
  return (
    <main>
      <div className='relative'>
        <div className='absolute inset-x-0 top-0 z-10 bg-[#f5f5f5]'>
          <Header variant='light' />
        </div>
        <ContactForm />
      </div>
      <ImageGallery />
      <FaqSection />
      <Footer />
    </main>
  );
}
