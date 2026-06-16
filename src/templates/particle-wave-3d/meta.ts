import type { TemplateMeta } from '../types';

/**
 * Code template — particle wave field (R3F + GLSL shader). Trường particle dạng
 * sóng GPU, gradient phát sáng, gợn theo con trỏ + parallax camera. KHÔNG cần
 * GLB asset. BE template entity phải có `code: "particle-wave-3d"`.
 */
export const meta: TemplateMeta = {
  code: 'particle-wave-3d',
  name: 'Particle Wave 3D (code)',
  description:
    'Code-defined — hero trường particle sóng (shader GPU) phát sáng, gợn theo ' +
    'chuột + parallax. Customize: title, subtitle, 2 màu gradient, CTA.',
  contentSchema: {
    fields: [
      {
        key: 'eyebrow',
        label: 'Eyebrow',
        type: 'text',
        default: 'IMMERSIVE · 2026',
      },
      {
        key: 'title',
        label: 'Tiêu đề chính',
        type: 'text',
        required: true,
        default: 'Trải nghiệm khác biệt',
      },
      {
        key: 'subtitle',
        label: 'Mô tả ngắn',
        type: 'longText',
        default:
          'Không gian số sống động — nơi mỗi chuyển động kể một câu chuyện.',
      },
      {
        key: 'colorA',
        label: 'Màu gradient 1',
        type: 'text',
        default: '#3b82f6',
        group: 'Style',
      },
      {
        key: 'colorB',
        label: 'Màu gradient 2',
        type: 'text',
        default: '#c9a96e',
        group: 'Style',
      },
      {
        key: 'ctaText',
        label: 'Nút CTA — text',
        type: 'text',
        default: 'Bắt đầu',
      },
      {
        key: 'ctaUrl',
        label: 'Nút CTA — URL',
        type: 'url',
        required: true,
        default: '#',
      },
    ],
  },
};
