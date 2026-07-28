// Nội dung site protection.gr bóc từ recon (home-content.json + route-crawl).
// Mirror 1:1: text/link giữ nguyên gốc để làm placeholder.

export const NAV = [
  { label: 'fabrics', href: '/fabrics' },
  { label: 'applications', href: '/applications' },
  { label: 'technology', href: '/technology' },
  { label: 'about', href: '/about-us' },
  { label: 'contact', href: '/contact' },
];

export const TOP_LINKS = [
  { label: 'DOWNLOADS', href: '/downloads' },
  { label: 'EL | EN', href: '/' },
  { label: 'CONTACT US', href: '/contact' },
];

// Section titles cho hero scrollytelling — mỗi section có submenu ("more").
export const HERO_SECTIONS: {
  key: string;
  title: string;
  href: string;
  more: { label: string; href: string }[];
}[] = [
  {
    key: 'fabrics',
    title: 'fabrics',
    href: '/fabrics',
    more: [
      { label: 'PRINTS', href: '/product-category/fabrics/prints' },
      { label: 'S-LINE', href: '/product-category/fabrics/prints/s-line' },
      { label: 'CLASSIC', href: '/product-category/fabrics/prints/classic' },
      { label: 'S-BLOCK', href: '/product-category/fabrics/prints/s-block' },
      { label: 'SOLIDS', href: '/product-category/fabrics/solids' },
    ],
  },
  {
    key: 'applications',
    title: 'applications',
    href: '/applications',
    more: [
      { label: 'AWNINGS', href: '/applications' },
      { label: 'PERGOLAS', href: '/applications' },
      { label: 'BLINDS', href: '/applications' },
      { label: 'INTERIORS', href: '/applications' },
    ],
  },
  {
    key: 'technology',
    title: 'technology',
    href: '/technology',
    more: [
      { label: 'BIOTECTION', href: '/technology' },
      { label: 'PROBLOCK', href: '/product-category/fabrics/solids/problock' },
      { label: 'COATINGS', href: '/technology' },
    ],
  },
  {
    key: 'about',
    title: 'about',
    href: '/about-us',
    more: [
      { label: 'COMPANY', href: '/about-us' },
      { label: 'NETWORK', href: '/network' },
      { label: 'SUSTAINABILITY', href: '/about-us' },
    ],
  },
  {
    key: 'contact',
    title: 'contact',
    href: '/contact',
    more: [
      { label: 'GET IN TOUCH', href: '/contact' },
      { label: 'FIND A DEALER', href: '/network' },
    ],
  },
];

export const HERO_TAGLINE = {
  line1: 'engineered to shade.',
  line2: 'designed to inspire.',
  sub: 'Technical shade fabrics engineered for design, performance and presence.',
};

export const DOWNLOADS = [
  'Catalogue 2025',
  'Prints Brochure',
  'Blockout Brochure',
  'Solids Brochure',
  'Acrylics Brochure',
  'Plastics Brochure',
  'Gtot Measurements',
  'Biotection Brochure',
  'Maintenance Instructions',
  'Warranty',
];

export const FABRIC_CATEGORIES = [
  { label: 'PRINTS', href: '/product-category/fabrics/prints' },
  { label: 'S-LINE', href: '/product-category/fabrics/prints/s-line' },
  { label: 'CLASSIC', href: '/product-category/fabrics/prints/classic' },
  { label: 'S-LINE ONE', href: '/product-category/fabrics/prints/s-line-one' },
  {
    label: 'S-LINE STRIPES',
    href: '/product-category/fabrics/prints/s-line-stripes',
  },
  { label: 'S-BLOCK', href: '/product-category/fabrics/prints/s-block' },
  { label: 'SOLIDS', href: '/product-category/fabrics/solids' },
  { label: 'PROBLOCK 400', href: '/product-category/fabrics/solids/problock' },
  {
    label: 'PROBLOCK 500',
    href: '/product-category/fabrics/solids/problock-500',
  },
  { label: 'POLYESTER', href: '/product-category/fabrics/solids/polyester' },
];

export const FOOTER = {
  copyright: 'PROTECTION. 2025',
  legal: ['PRIVACY POLICY', 'COOKIES & PREFERENCES', 'TERMS & CONDITIONS'],
  social: ['IN', 'FB', 'IG', 'YT'],
  newsletter: {
    title: 'Subscribe to Our Updates',
    note: 'You can unsubscribe from these communications at any time. To learn more about how to unsubscribe, our privacy practices, and how we are committed to protecting your privacy, please review our Privacy Policy.',
  },
};

export const FRAME_COUNT = 240;
