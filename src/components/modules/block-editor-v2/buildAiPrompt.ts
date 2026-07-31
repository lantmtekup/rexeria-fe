import { BLOCK_TYPE_META } from '@/components/modules/block-editor/types';
import type {
  BlockContent,
  BlockType,
  Lang,
} from '@/components/modules/block-editor/types';

interface BuildAiPromptArgs {
  userPrompt: string;
  blockType: BlockType;
  blockName: string;
  selectedField: string;
  currentContent: BlockContent;
  lang: Lang;
}

// Nhãn block cho prompt AI — derive từ registry BLOCK_TYPE_META (aiLabelVi/En).
function blockAiLabel(type: BlockType, lang: Lang): string {
  const m = BLOCK_TYPE_META[type];
  return lang === 'vi' ? m.aiLabelVi : m.aiLabelEn;
}

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
  const block = blockAiLabel(blockType, lang);
  const field = FIELD_LABEL[lang][selectedField] ?? selectedField;
  const trimmed = userPrompt.trim();

  if (lang === 'vi') {
    const header = `Viết lại ${field} của ${block} ("${blockName}").`;
    return trimmed ? `${header}\nYêu cầu: ${trimmed}` : header;
  }
  const header = `Rewrite the ${field} of the ${block} ("${blockName}").`;
  return trimmed ? `${header}\nUser request: ${trimmed}` : header;
}
