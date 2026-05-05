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
  },
  en: {
    hero_split: 'split-layout hero block',
    hero_overlay: 'full-bleed hero overlay block',
    feature_section: 'feature highlights section',
    photo_gallery: 'photo gallery',
    booking_form: 'booking / lead form',
    cta_section: 'closing call-to-action section',
  },
};

const FIELD_LABEL: Record<Lang, Record<string, string>> = {
  vi: {
    eyebrow: 'eyebrow (chữ in hoa nhỏ phía trên tiêu đề)',
    tag: 'tag / label',
    title: 'tiêu đề chính',
    description: 'đoạn mô tả',
    subtitle: 'subtitle / câu mô tả phụ',
    ctaText: 'nút CTA',
    submitText: 'nút submit',
    noteText: 'ghi chú dưới form',
    primaryText: 'CTA chính',
    secondaryText: 'CTA phụ',
    imageUrl: 'ảnh chính',
    backgroundUrl: 'ảnh nền',
    stats: 'danh sách chỉ số (3 phần tử)',
    features: 'danh sách tiện ích (4 phần tử)',
    photos: 'bộ ảnh (4–5 phần tử)',
    reasons: 'danh sách lý do (4 phần tử)',
    __background__: 'màu / ảnh nền của block',
  },
  en: {
    eyebrow: 'eyebrow (small uppercase line above the title)',
    tag: 'tag / label',
    title: 'main title',
    description: 'description paragraph',
    subtitle: 'subtitle / sub-description',
    ctaText: 'CTA button',
    submitText: 'submit button',
    noteText: 'form footnote',
    primaryText: 'primary CTA',
    secondaryText: 'secondary CTA',
    imageUrl: 'main image',
    backgroundUrl: 'background image',
    stats: 'stats list (exactly 3 items)',
    features: 'feature cards (exactly 4 items)',
    photos: 'photo set (4–5 items)',
    reasons: 'reasons list (exactly 4 items)',
    __background__: 'block background color / image',
  },
};

const FIELD_CONSTRAINT: Record<Lang, Record<string, string>> = {
  vi: {
    eyebrow: 'IN HOA TOÀN BỘ, 5–40 ký tự, 1–3 từ.',
    tag: '1–3 từ, ≤ 30 ký tự.',
    title: '5–10 từ, 5–80 ký tự, không sáo rỗng, ưu tiên có số liệu cụ thể.',
    description: '1–2 câu, ≤ 200 ký tự, giọng văn rõ ràng.',
    subtitle: '1 câu, ≤ 160 ký tự.',
    ctaText: '1–3 từ, là động từ hành động (Đăng ký xem mẫu / Mua ngay…).',
    submitText: '1–3 từ, hành động cụ thể.',
    noteText: '1 câu ngắn (privacy / commitment).',
    primaryText: '1–3 từ, action mạnh.',
    secondaryText: '1–3 từ, action phụ (có thể rỗng).',
    stats:
      'đúng 3 phần tử. value 3–12 ký tự (số + đơn vị). label chữ thường 1–3 từ.',
    features:
      'đúng 4 phần tử. icon chọn 1 trong [Home, Building2, Compass, Leaf, TreePine, Waves, ShieldCheck, Sparkles] phù hợp ngữ nghĩa. label 2–4 từ. body 1 câu ngắn.',
    photos: '4–5 phần tử. caption 1–3 từ, có thể rỗng.',
    reasons: 'đúng 4 phần tử. value 3–12 ký tự. label chữ thường 1–3 từ.',
  },
  en: {
    eyebrow: 'ALL UPPERCASE, 5–40 chars, 1–3 words.',
    tag: '1–3 words, ≤ 30 chars.',
    title: '5–10 words, 5–80 chars, concrete numbers preferred.',
    description: '1–2 sentences, ≤ 200 chars.',
    subtitle: '1 sentence, ≤ 160 chars.',
    ctaText: '1–3 words, action verb.',
    submitText: '1–3 words, concrete action.',
    noteText: '1 short sentence (privacy / commitment).',
    primaryText: '1–3 words, strong action.',
    secondaryText: '1–3 words, secondary action (may be empty).',
    stats:
      'exactly 3 items. value 3–12 chars (number + unit). label lowercase 1–3 words.',
    features:
      'exactly 4 items. icon from [Home, Building2, Compass, Leaf, TreePine, Waves, ShieldCheck, Sparkles] matching semantics. label 2–4 words. body 1 short sentence.',
    photos: '4–5 items. caption 1–3 words, may be empty.',
    reasons: 'exactly 4 items. value 3–12 chars. label lowercase 1–3 words.',
  },
};

const TONE_HINT: Record<Lang, string> = {
  vi: 'Giọng văn ngắn gọn, sang trọng, dễ hiểu. Tránh sáo rỗng. Ưu tiên số liệu cụ thể (m², số phòng, năm bàn giao, giá khởi điểm).',
  en: 'Concise, premium, easy to read. Avoid clichés. Prefer concrete numbers (sqm, rooms, year, starting price).',
};

const HEADER_TEMPLATE: Record<Lang, (a: BuildAiPromptArgs) => string> = {
  vi: a => {
    const block = BLOCK_LABEL.vi[a.blockType];
    const field = FIELD_LABEL.vi[a.selectedField] ?? a.selectedField;
    return `Viết lại ${field} của ${block} ("${a.blockName}").`;
  },
  en: a => {
    const block = BLOCK_LABEL.en[a.blockType];
    const field = FIELD_LABEL.en[a.selectedField] ?? a.selectedField;
    return `Rewrite the ${field} of the ${block} ("${a.blockName}").`;
  },
};

/**
 * Compose a single rich prompt that bundles the user's intent + format
 * constraints + current content as JSON. BE may use the structured fields
 * (`current_content`, `selected_field`) instead, but having the full context
 * inline guarantees a useful response even if BE just forwards the prompt
 * to the LLM as-is.
 *
 * Output shape (vi example):
 *
 *   Viết lại tiêu đề chính của block hero (chia đôi) ("Hero — Bloom").
 *
 *   Yêu cầu: viết ngắn gọn hơn
 *
 *   Ràng buộc: 5–10 từ, 5–80 ký tự, ưu tiên số liệu cụ thể.
 *   Tone: ngắn gọn, sang trọng, dễ hiểu.
 *
 *   Nội dung hiện tại (current_content):
 *   {
 *     "title": "...",
 *     ...
 *   }
 *
 *   Trả về JSON đúng schema của block_type, giữ các trường khác đồng bộ
 *   với current_content nếu không liên quan.
 */
export function buildAiPrompt(args: BuildAiPromptArgs): string {
  const { userPrompt, currentContent, selectedField, lang } = args;
  const header = HEADER_TEMPLATE[lang](args);
  const fieldConstraint = FIELD_CONSTRAINT[lang][selectedField];
  const tone = TONE_HINT[lang];

  const parts: string[] = [header, ''];

  if (lang === 'vi') {
    parts.push(`Yêu cầu của user: ${userPrompt.trim()}`, '');
    if (fieldConstraint) {
      parts.push(`Ràng buộc trường này: ${fieldConstraint}`);
    }
    parts.push(`Tone: ${tone}`, '');
    parts.push('Nội dung hiện tại (current_content):');
    parts.push(JSON.stringify(currentContent, null, 2));
    parts.push('');
    parts.push(
      'Trả về JSON đúng schema của block_type này. Giữ các trường khác đồng bộ với current_content nếu không liên quan đến yêu cầu.'
    );
  } else {
    parts.push(`User request: ${userPrompt.trim()}`, '');
    if (fieldConstraint) {
      parts.push(`Field constraint: ${fieldConstraint}`);
    }
    parts.push(`Tone: ${tone}`, '');
    parts.push('Current content (current_content):');
    parts.push(JSON.stringify(currentContent, null, 2));
    parts.push('');
    parts.push(
      'Return JSON matching the block_type schema. Keep unrelated fields aligned with current_content.'
    );
  }

  return parts.join('\n');
}
