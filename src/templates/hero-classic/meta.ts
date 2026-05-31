import type { TemplateMeta } from '../types';

/**
 * Demo code template — hero hero-classic.
 *
 * Để FE wire vào, BE template entity phải có `code: "hero-classic"`. Tạo
 * qua CreateTemplateDialog với code field trùng.
 */
export const meta: TemplateMeta = {
  code: 'hero-classic',
  name: 'Hero Classic (code)',
  description:
    'Code-defined template — hero split-screen với GSAP scroll animation. ' +
    'Brand customize qua form: title, subtitle, hero image, CTA URL.',
  contentSchema: {
    fields: [
      {
        key: 'eyebrow',
        label: 'Eyebrow text',
        type: 'text',
        default: 'COLLECTION · 2026',
        hint: 'Dòng text nhỏ trên title',
      },
      {
        key: 'title',
        label: 'Tiêu đề chính',
        type: 'text',
        required: true,
        default: 'Tiêu đề landing page',
      },
      {
        key: 'subtitle',
        label: 'Mô tả ngắn',
        type: 'longText',
        default: 'Mô tả dưới tiêu đề, 1-2 dòng.',
      },
      {
        key: 'heroImage',
        label: 'Ảnh hero',
        type: 'image',
        default:
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
        hint: 'URL ảnh full-bleed bên phải hero',
      },
      {
        key: 'ctaText',
        label: 'Nút CTA — text',
        type: 'text',
        default: 'Khám phá ngay',
      },
      {
        key: 'ctaUrl',
        label: 'Nút CTA — URL đích',
        type: 'url',
        required: true,
        default: '#',
      },
      {
        key: 'darkMode',
        label: 'Dark theme',
        type: 'boolean',
        default: true,
        group: 'Style',
      },
    ],
  },
};
