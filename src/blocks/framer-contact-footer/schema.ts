import type { LegacyBlockSchema } from '../types';

/** Framer footer: "Say Hello!" huge text + email big heading + nav + social links */
export const framerContactFooterSchema: LegacyBlockSchema = {
  id: 'framer.contact.footer.v1',
  name: 'Framer Contact Footer',
  category: 'Landing',
  description:
    'Footer Framer: "Say Hello!" + email to lớn + nav links + social, nền đen tối giản.',
  fields: [
    {
      name: 'greeting',
      type: 'text',
      label: 'Greeting',
      default: 'Say Hello!',
      required: true,
      maxLength: 60,
    },
    {
      name: 'email',
      type: 'text',
      label: 'Email',
      default: 'info@ecoparkonsen.com',
      required: true,
      maxLength: 120,
    },
    {
      name: 'copyright',
      type: 'text',
      label: 'Copyright',
      default: '© 2026 Ecopark Onsen. All rights reserved.',
      maxLength: 200,
    },
    {
      name: 'navLinks',
      type: 'array',
      label: 'Nav links',
      maxItems: 6,
      defaultItem: { label: 'Link', href: '#' },
      itemLabel: 'link',
      itemSchema: [
        { name: 'label', type: 'text', label: 'Nhãn', required: true },
        { name: 'href', type: 'text', label: 'URL' },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social links',
      maxItems: 8,
      defaultItem: { label: 'Social', href: '#' },
      itemLabel: 'social',
      itemSchema: [
        { name: 'label', type: 'text', label: 'Nhãn', required: true },
        { name: 'href', type: 'text', label: 'URL' },
      ],
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      greeting: 'Say Hello!',
      email: 'info@ecoparkonsen.com',
      copyright: '© 2026 Epictower Onsen. Tất cả quyền được bảo lưu.',
      navLinks: [
        { label: 'Home', href: '#' },
        { label: 'Contact', href: '#contact' },
      ],
      socialLinks: [
        { label: 'LinkedIn', href: '#' },
        { label: 'Behance', href: '#' },
        { label: 'YouTube', href: '#' },
      ],
    },
    en: {
      greeting: 'Say Hello!',
      email: 'info@ecoparkonsen.com',
      copyright: '© 2026 Epictower Onsen. All rights reserved.',
      navLinks: [
        { label: 'Home', href: '#' },
        { label: 'Contact', href: '#contact' },
      ],
      socialLinks: [
        { label: 'LinkedIn', href: '#' },
        { label: 'Behance', href: '#' },
        { label: 'YouTube', href: '#' },
      ],
    },
  },
};
