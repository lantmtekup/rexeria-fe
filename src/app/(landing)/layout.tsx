import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { SEO_CONSTANTS } from '@/lib/metadata';

/**
 * JSON-LD (schema.org) cho AEO — Google AI Overviews / ChatGPT / Perplexity
 * đọc structured data này để "hiểu" brand. Organization + WebSite render trên
 * mọi trang landing.
 * TODO(sameAs): điền link Facebook/LinkedIn THẬT khi có (đừng để placeholder).
 */
const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SEO_CONSTANTS.ORGANIZATION.name,
  url: SEO_CONSTANTS.SITE_URL,
  logo: `${SEO_CONSTANTS.SITE_URL}${SEO_CONSTANTS.ORGANIZATION.logo}`,
  description: SEO_CONSTANTS.ORGANIZATION.description,
  email: 'info@rexerstudio.com',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    email: 'info@rexerstudio.com',
    telephone: '+84-939-084-212',
    availableLanguage: ['en', 'vi'],
  },
};

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SEO_CONSTANTS.SITE_NAME,
  url: SEO_CONSTANTS.SITE_URL,
  inLanguage: 'en',
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex min-h-screen flex-col bg-white text-neutral-900'>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }}
      />
      <LandingNavbar />
      <main className='flex-1'>{children}</main>
      <LandingFooter />
    </div>
  );
}
