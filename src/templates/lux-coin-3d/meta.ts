import type { TemplateMeta } from '../types';

/**
 * Code template — landing 3D coin (R3F + drei). Coin vàng procedural (không cần
 * GLB asset), tự xoay + reflection HDRI + scroll-link. Theme luxury/real-estate.
 *
 * BE template entity phải có `code: "lux-coin-3d"` (tạo qua CreateTemplateDialog).
 */
export const meta: TemplateMeta = {
  code: 'lux-coin-3d',
  name: 'Luxury 3D Coin (code)',
  description:
    'Code-defined template — hero 3D coin vàng (React Three Fiber) xoay + ' +
    'reflection, scroll-link. Brand customize: eyebrow, title, subtitle, chữ ' +
    'mặt coin, thông số, CTA, màu nhấn.',
  contentSchema: {
    fields: [
      {
        key: 'eyebrow',
        label: 'Eyebrow',
        type: 'text',
        default: 'ROYAL CANADIAN MINT · 2026',
      },
      {
        key: 'title',
        label: 'Tiêu đề chính',
        type: 'text',
        required: true,
        default: 'The Jack Pine',
      },
      {
        key: 'subtitle',
        label: 'Mô tả ngắn',
        type: 'longText',
        default:
          '1 kilo vàng nguyên chất 99.99% — kiệt tác tôn vinh di sản Tom Thomson.',
      },
      {
        key: 'coinTopText',
        label: 'Chữ trên mặt coin',
        type: 'text',
        default: 'CANADA',
      },
      {
        key: 'coinBottomText',
        label: 'Chữ dưới mặt coin',
        type: 'text',
        default: '2500 DOLLARS',
      },
      {
        key: 'specs',
        label: 'Thông số (mỗi dòng 1 mục)',
        type: 'longText',
        default: '1006.1 g\n99.99% vàng\nMintage 75\n2026',
      },
      {
        key: 'ctaText',
        label: 'Nút CTA — text',
        type: 'text',
        default: 'Đăng ký sở hữu',
      },
      {
        key: 'ctaUrl',
        label: 'Nút CTA — URL',
        type: 'url',
        required: true,
        default: '#',
      },
      {
        key: 'accent',
        label: 'Màu nhấn (vàng)',
        type: 'text',
        default: '#c9a96e',
        group: 'Style',
      },
    ],
  },
};
