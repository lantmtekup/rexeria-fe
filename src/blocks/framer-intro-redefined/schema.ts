import type { LegacyBlockSchema } from '../types';

/** Framer "Life Style Redefined" intro — eyebrow + huge serif title + body paragraph on white bg. */
export const framerIntroRedefinedSchema: LegacyBlockSchema = {
  id: 'framer.intro.redefined.v1',
  name: 'Framer Intro — Redefined',
  category: 'Content',
  description:
    'Intro: eyebrow nhỏ + tiêu đề serif lớn + body paragraph, nền trắng (Framer style).',
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Eyebrow',
      default: 'Epictower Onsen',
      maxLength: 80,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề lớn',
      default: 'Life Style Redefined.',
      required: true,
      maxLength: 200,
    },
    {
      name: 'body',
      type: 'richtext',
      label: 'Nội dung',
      default:
        "It's a first of its kind concept in Vietnam set within Ecopark's larger vision of green, sustainable urban living",
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      eyebrow: 'Epictower Onsen',
      title: 'Phong Cách Sống Được Định Nghĩa Lại.',
      body: 'Là khái niệm đầu tiên tại Việt Nam, nằm trong tầm nhìn phát triển xanh và đô thị bền vững của Epictower.',
    },
    en: {
      eyebrow: 'Epictower Onsen',
      title: 'Life Style Redefined.',
      body: "It's a first of its kind concept in Vietnam, set within Epictower's larger vision of green, sustainable urban living.",
    },
  },
};
