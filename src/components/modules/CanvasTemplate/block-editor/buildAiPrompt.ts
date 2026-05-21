import type { BlockContent, BlockType, Lang } from './types';

interface BuildAiPromptArgs {
  userPrompt: string;
  blockType: BlockType;
  blockName: string;
  selectedField: string;
  currentContent: BlockContent;
  lang: Lang;
}

const BLOCK_LABEL: Record<Lang, Record<BlockType, string>> = {
  vi: {
    hero_split: 'block hero (chia đôi)',
    hero_overlay: 'block hero (toàn cảnh có overlay)',
    feature_section: 'section tiện ích / điểm nổi bật',
    photo_gallery: 'thư viện ảnh',
    booking_form: 'form đăng ký / đặt chỗ',
    cta_section: 'section call-to-action cuối trang',
    image_carousel: 'slide ảnh chuyển động',
    stories: 'panel Stories (Insta-style)',
    split_screen: 'so sánh 2 lựa chọn (split screen)',
    quiz: 'trắc nghiệm gợi ý sản phẩm',
    poll: 'bình chọn 1 câu hỏi nhiều lựa chọn',
    carousel_3d: 'slide ảnh 3D coverflow',
    flipbook: 'sách catalog lật trang',
    panorama: 'ảnh 360° xoay được',
  },
  en: {
    hero_split: 'split-layout hero block',
    hero_overlay: 'full-bleed hero overlay block',
    feature_section: 'feature highlights section',
    photo_gallery: 'photo gallery',
    booking_form: 'booking / lead form',
    cta_section: 'closing call-to-action section',
    image_carousel: 'image carousel / slider',
    stories: 'stories panels (Instagram-style)',
    split_screen: 'split-screen comparison',
    quiz: 'quiz / product recommender',
    poll: 'single-question poll',
    carousel_3d: '3D coverflow image carousel',
    flipbook: 'page-turn flipbook catalog',
    panorama: '360° equirectangular panorama',
  },
};

const FIELD_LABEL: Record<Lang, Record<string, string>> = {
  vi: {
    eyebrow: 'eyebrow',
    tag: 'tag',
    title: 'tiêu đề',
    description: 'đoạn mô tả',
    subtitle: 'subtitle',
    ctaText: 'nút CTA',
    submitText: 'nút submit',
    noteText: 'ghi chú dưới form',
    primaryText: 'CTA chính',
    secondaryText: 'CTA phụ',
    imageUrl: 'ảnh chính',
    backgroundUrl: 'ảnh nền',
    stats: 'danh sách chỉ số',
    features: 'danh sách tiện ích',
    photos: 'bộ ảnh',
    reasons: 'danh sách lý do',
    __background__: 'nền của block',
  },
  en: {
    eyebrow: 'eyebrow',
    tag: 'tag',
    title: 'title',
    description: 'description',
    subtitle: 'subtitle',
    ctaText: 'CTA button',
    submitText: 'submit button',
    noteText: 'form footnote',
    primaryText: 'primary CTA',
    secondaryText: 'secondary CTA',
    imageUrl: 'main image',
    backgroundUrl: 'background image',
    stats: 'stats list',
    features: 'feature cards',
    photos: 'photo set',
    reasons: 'reasons list',
    __background__: 'block background',
  },
};

/**
 * Compose a minimal user prompt that names the target field + carries the
 * user's intent. Style rules, field-length constraints, tone, and JSON
 * schema all live in the BE system prompt — duplicating them here causes
 * drift (rules in 3 places: FE label dict, BE prompt, BE schema).
 *
 * The current_content payload is shipped via the API request body
 * (`current_content`) — we do NOT inline it into the user message anymore.
 *
 * Output shape (vi):
 *   Viết lại tiêu đề của block hero (chia đôi) ("Hero — Bloom").
 *   Yêu cầu: viết ngắn gọn hơn
 */
export function buildAiPrompt(args: BuildAiPromptArgs): string {
  const { userPrompt, blockType, blockName, selectedField, lang } = args;
  const block = BLOCK_LABEL[lang][blockType];
  const field = FIELD_LABEL[lang][selectedField] ?? selectedField;
  const trimmed = userPrompt.trim();

  if (lang === 'vi') {
    const header = `Viết lại ${field} của ${block} ("${blockName}").`;
    return trimmed ? `${header}\nYêu cầu: ${trimmed}` : header;
  }
  const header = `Rewrite the ${field} of the ${block} ("${blockName}").`;
  return trimmed ? `${header}\nUser request: ${trimmed}` : header;
}
