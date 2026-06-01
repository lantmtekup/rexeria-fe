import type { LegacyBlockSchema } from '../types';

/** Framer Aestha Project Detail — project-page layout with big sticky title,
 *  labeled body paragraphs, long image stack, next-project link + nav. */
export const framerAesthaProjectDetailSchema: LegacyBlockSchema = {
  id: 'framer.aestha.project.detail.v1',
  name: 'Framer Aestha Project Detail',
  category: 'Content',
  description:
    'Trang chi tiết dự án: tiêu đề sticky trái + 3 cột (label / body / ảnh stack), link "next project" + nav cuối.',
  fields: [
    {
      name: 'projectTitle',
      type: 'text',
      label: 'Tên dự án (tiêu đề lớn)',
      default: 'VISION',
      required: true,
      maxLength: 60,
    },
    {
      name: 'sectionLabel',
      type: 'text',
      label: 'Nhãn section (VD: Concept)',
      default: 'Concept',
      maxLength: 40,
    },
    {
      name: 'body',
      type: 'richtext',
      label: 'Nội dung body (mỗi đoạn 1 dòng trống)',
      default: '',
    },
    {
      name: 'images',
      type: 'array',
      label: 'Stack ảnh dự án',
      minItems: 1,
      maxItems: 12,
      itemLabel: 'ảnh',
      defaultItem: { image: null, aspect: '5:4' },
      itemSchema: [
        { name: 'image', type: 'image', label: 'Ảnh', required: true },
        {
          name: 'aspect',
          type: 'select',
          label: 'Tỉ lệ',
          default: '5:4',
        },
      ],
    },
    {
      name: 'nextLabel',
      type: 'text',
      label: 'Nhãn "next project"',
      default: 'Dự án tiếp theo',
      maxLength: 40,
    },
    {
      name: 'nextProjectText',
      type: 'text',
      label: 'Tên dự án kế tiếp',
      default: 'Kiến trúc',
      maxLength: 60,
    },
    {
      name: 'nextProjectHref',
      type: 'text',
      label: 'Link dự án kế tiếp',
      default: '/page/aestha-projects',
      maxLength: 300,
    },
    {
      name: 'navLinks',
      type: 'array',
      label: 'Menu dưới trái',
      minItems: 0,
      maxItems: 6,
      itemLabel: 'mục',
      defaultItem: { label: 'Menu', href: '#' },
      itemSchema: [
        {
          name: 'label',
          type: 'text',
          label: 'Nhãn',
          required: true,
          maxLength: 40,
        },
        {
          name: 'href',
          type: 'text',
          label: 'Link',
          default: '#',
          maxLength: 300,
        },
      ],
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      projectTitle: 'TẦM NHÌN',
      sectionLabel: 'Khái niệm',
      body: 'Tọa lạc giữa lòng đô thị, dự án là biểu tượng cho phong cách sống đẳng cấp — nơi mỗi chi tiết đều được tinh chỉnh cho nhịp sống hiện đại, song vẫn tôn vinh di sản kiến trúc.\n\nTòa tháp 36 tầng cao xấp xỉ 152 mét, cung cấp 62 căn hộ cao cấp với diện tích từ studio cho đến penthouse 4 phòng ngủ với tầm nhìn không giới hạn về Central Park và Manhattan.\n\nMặt đứng đá vôi duyên dáng với các khối giật cấp, ban công vòm và vương miện trang trí hoà quyện liền mạch cùng cấu trúc đô thị lân cận — một bản giao hưởng giữa di sản cổ điển và đổi mới đương đại.',
      images: [
        {
          image: {
            url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80',
            alt: 'Toàn cảnh ba tháp',
          },
          aspect: '5:4',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=1200&q=80',
            alt: 'Tháp đôi bên sông núi',
          },
          aspect: '4:5',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=80',
            alt: 'Podium xanh',
          },
          aspect: '4:5',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1481026469463-66327c86e544?w=1400&q=80',
            alt: 'Chi tiết đỉnh tháp',
          },
          aspect: '5:4',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1400&q=80',
            alt: 'Ba tháp giờ vàng',
          },
          aspect: '5:4',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&q=80',
            alt: 'Sky garden',
          },
          aspect: '5:4',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=2000&q=80',
            alt: 'Podium hoa anh đào đêm',
          },
          aspect: '21:9',
        },
      ],
      nextLabel: 'Dự án tiếp theo',
      nextProjectText: 'Kiến trúc',
      nextProjectHref: '/page/aestha-projects',
      navLinks: [
        { label: 'Dự án', href: '/page/aestha-projects' },
        { label: 'Studio', href: '/studio' },
        { label: 'Liên hệ', href: '/contact' },
      ],
    },
    en: {
      projectTitle: 'VISION',
      sectionLabel: 'Concept',
      body: 'Nestled in the heart of the city, the project embodies refined urban living — every detail tuned to the demands of modern luxury while honoring architectural heritage.\n\nThis 36-story tower, rising to approximately 500 feet (152 meters), houses 62 sophisticated condominiums ranging from studios to four-bedroom penthouses with unobstructed views of Central Park and Manhattan.\n\nIts graceful limestone façade — composed of setback terraces, arched loggias, and a decorative crown — weaves seamlessly into the neighboring urban fabric, a symphony of classical heritage and contemporary reinvention.',
      images: [
        {
          image: {
            url: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1400&q=80',
            alt: 'Three towers aerial',
          },
          aspect: '5:4',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1448630360428-65456885c650?w=1200&q=80',
            alt: 'Twin towers river mountain',
          },
          aspect: '4:5',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=80',
            alt: 'Green podium',
          },
          aspect: '4:5',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1481026469463-66327c86e544?w=1400&q=80',
            alt: 'Rooftop crown detail',
          },
          aspect: '5:4',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1400&q=80',
            alt: 'Three towers golden hour',
          },
          aspect: '5:4',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&q=80',
            alt: 'Sky garden',
          },
          aspect: '5:4',
        },
        {
          image: {
            url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=2000&q=80',
            alt: 'Podium cherry blossom night',
          },
          aspect: '21:9',
        },
      ],
      nextLabel: 'Next project',
      nextProjectText: 'Architecture',
      nextProjectHref: '/page/aestha-projects',
      navLinks: [
        { label: 'Projects', href: '/page/aestha-projects' },
        { label: 'Studio', href: '/studio' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  },
};
