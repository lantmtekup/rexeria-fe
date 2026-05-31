import type { LegacyBlockSchema } from '../types';

export const testimonialsSchema: LegacyBlockSchema = {
  id: 'testimonials.v1',
  name: 'Testimonials',
  category: 'Landing',
  description:
    'Carousel nhận xét khách hàng với quote + tên tác giả + dots navigation.',
  fields: [
    { name: 'eyebrow', type: 'text', label: 'Eyebrow', maxLength: 60 },
    {
      name: 'title',
      type: 'text',
      label: 'Tiêu đề',
      required: true,
      maxLength: 120,
    },
    {
      name: 'items',
      type: 'array',
      label: 'Nhận xét',
      minItems: 1,
      maxItems: 10,
      itemLabel: 'nhận xét',
      itemSchema: [
        { name: 'quote', type: 'richtext', label: 'Nội dung', required: true },
        { name: 'author', type: 'text', label: 'Tên', required: true },
        { name: 'role', type: 'text', label: 'Chức vụ / Vai trò' },
      ],
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      eyebrow: 'Nhận Xét',
      title: 'Khách Hàng Nói Gì',
      items: [
        {
          quote:
            'Một dự án thực sự đẳng cấp. Chất lượng xây dựng và dịch vụ vượt mong đợi.',
          author: 'Nguyễn Văn A',
          role: 'Cư dân, 2026',
        },
        {
          quote:
            'Vị trí tuyệt vời, tiện ích đầy đủ. Gia đình tôi rất hài lòng với lựa chọn này.',
          author: 'Trần Thị B',
          role: 'Cư dân, 2025',
        },
        {
          quote:
            'Đội ngũ sales tận tâm. Quy trình mua bán minh bạch, nhanh chóng.',
          author: 'Lê Văn C',
          role: 'Nhà đầu tư',
        },
      ],
    },
    en: {
      eyebrow: 'Reviews',
      title: 'What Clients Say',
      items: [
        {
          quote:
            'A truly premium project. Construction quality and service exceeded expectations.',
          author: 'A. Nguyen',
          role: 'Resident, 2026',
        },
        {
          quote:
            'Great location, comprehensive amenities. My family is delighted with this choice.',
          author: 'B. Tran',
          role: 'Resident, 2025',
        },
        {
          quote:
            'Dedicated sales team. Transparent and fast transaction process.',
          author: 'C. Le',
          role: 'Investor',
        },
      ],
    },
  },
};
