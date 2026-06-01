import type { LegacyBlockSchema } from '../types';

/** Timeline - Darling — clone of darling.framer.website "The Day" section.
 *  Centered header + vertical spine; items alternate left/right with
 *  time + title + description + image. */
export const framerDarlingTimelineSchema: LegacyBlockSchema = {
  id: 'framer.darling.timeline.v1',
  name: 'Timeline - Darling',
  category: 'Editorial',
  description:
    'Timeline 2 cột zig-zag: tiêu đề + intro ở giữa, đường dọc trung tâm với chấm tròn mỗi mốc. Item lẻ bên phải, item chẵn bên trái — mỗi item có giờ, tên, mô tả, ảnh. Clone từ darling.framer.website.',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Tiêu đề section',
      default: 'The Day',
      maxLength: 80,
    },
    {
      name: 'intro',
      type: 'text',
      label: 'Mô tả dưới tiêu đề',
      default:
        'Here’s what to expect on June 15. Everything takes place at Ulvhälls Herrgård, and we’ll guide you throughout the day.',
      maxLength: 320,
    },
    {
      name: 'items',
      type: 'array',
      label: 'Mốc thời gian (mỗi item là 1 chấm trên timeline)',
      minItems: 1,
      maxItems: 12,
      itemLabel: 'mốc',
      defaultItem: {
        time: '14:00',
        title: 'Ceremony',
        description: 'Mô tả ngắn về hoạt động.',
        image: null,
      },
      itemSchema: [
        {
          name: 'time',
          type: 'text',
          label: 'Giờ (vd 14:00)',
          default: '14:00',
          maxLength: 16,
        },
        {
          name: 'title',
          type: 'text',
          label: 'Tên mốc',
          default: 'Ceremony',
          maxLength: 80,
        },
        {
          name: 'description',
          type: 'text',
          label: 'Mô tả',
          default:
            'We gather in the garden for the ceremony. Please arrive a few minutes early.',
          maxLength: 240,
        },
        {
          name: 'image',
          type: 'image',
          label: 'Ảnh minh hoạ',
          aspectRatio: '4:3',
        },
      ],
    },
  ],
  styleTokens: [],
  defaults: {
    vi: {
      heading: 'The Day',
      intro:
        'Here’s what to expect on June 15. Everything takes place at Ulvhälls Herrgård, and we’ll guide you throughout the day.',
      items: [
        {
          time: '14:00',
          title: 'Ceremony',
          description:
            'We gather in the garden for the ceremony. Please arrive a few minutes early.',
          image: {
            url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
            alt: 'Ceremony in the garden',
          },
        },
        {
          time: '15:00',
          title: 'Drinks & mingle',
          description:
            "After the ceremony, we'll celebrate with something bubbly and light bites outdoors (weather permitting).",
          image: {
            url: 'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=1200&q=80',
            alt: 'Drinks and mingle',
          },
        },
        {
          time: '17:00',
          title: 'Dinner',
          description:
            'Three-course dinner in the manor hall. Speeches between courses.',
          image: {
            url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
            alt: 'Dinner in the manor hall',
          },
        },
      ],
    },
    en: {
      heading: 'The Day',
      intro:
        'Here’s what to expect on June 15. Everything takes place at Ulvhälls Herrgård, and we’ll guide you throughout the day.',
      items: [
        {
          time: '14:00',
          title: 'Ceremony',
          description:
            'We gather in the garden for the ceremony. Please arrive a few minutes early.',
          image: {
            url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
            alt: 'Ceremony in the garden',
          },
        },
        {
          time: '15:00',
          title: 'Drinks & mingle',
          description:
            "After the ceremony, we'll celebrate with something bubbly and light bites outdoors (weather permitting).",
          image: {
            url: 'https://images.unsplash.com/photo-1530023367847-a683933f4172?w=1200&q=80',
            alt: 'Drinks and mingle',
          },
        },
        {
          time: '17:00',
          title: 'Dinner',
          description:
            'Three-course dinner in the manor hall. Speeches between courses.',
          image: {
            url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
            alt: 'Dinner in the manor hall',
          },
        },
      ],
    },
  },
};
