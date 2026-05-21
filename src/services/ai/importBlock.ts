'use client';

import Anthropic from '@anthropic-ai/sdk';

import { createBlock } from '@/components/modules/CanvasTemplate/block-editor/factory';
import type {
  Block,
  BlockContent,
  BlockType,
} from '@/components/modules/CanvasTemplate/block-editor/types';

/**
 * Convert an image (or Figma frame rendered as image) into a block ready
 * to drop on the canvas. The flow:
 *
 *   1. caller hands us a base64 PNG/JPG (no data URL prefix)
 *   2. we call Claude vision with a schema-aware prompt that asks it to
 *      classify the image into one of the 6 block types and return content
 *      matching that block's content schema
 *   3. we parse + validate the JSON, then build a real Block via the same
 *      factory the canvas uses for normal block creation
 *
 * Client-side use only (uses dangerouslyAllowBrowser). API key comes from
 * NEXT_PUBLIC_ANTHROPIC_API_KEY — clearly not production-safe, but matches
 * what the user chose for the MVP. Swap for a Next.js API route proxy when
 * promoting beyond demo.
 */

export class ImportBlockError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'ImportBlockError';
  }
}

export interface ImportBlockResult {
  /** Ready-to-insert block — deep-cloned from createBlock + AI content. */
  block: Block;
  /** Human-readable explanation of why the AI picked this block type. */
  reasoning: string;
  /** Raw AI output for debugging. */
  raw: { blockType: BlockType; content: BlockContent };
}

const MODEL = 'claude-opus-4-5';

const VALID_BLOCK_TYPES: ReadonlySet<BlockType> = new Set([
  'hero_split',
  'hero_overlay',
  'feature_section',
  'photo_gallery',
  'booking_form',
  'cta_section',
]);

/**
 * Schema text passed to the model so it knows EXACTLY what JSON shape each
 * block type wants. Keep it in sync with `block-editor/types.ts`.
 */
const SCHEMA_DESCRIPTION = `Available block types and their content schemas:

1. hero_split — image on one side, headline+description+stats+CTA on the other.
   { "eyebrow": string, "title": string, "description": string,
     "imageUrl": string, "stats": [{"value": string, "label": string}, ...3 items],
     "ctaText": string, "ctaLink": string }

2. hero_overlay — full-bleed background image with title+subtitle+tag+CTA overlaid.
   { "tag": string, "title": string, "subtitle": string,
     "ctaText": string, "ctaLink": string, "backgroundUrl": string }

3. feature_section — eyebrow+title+description above a grid of feature cards.
   { "eyebrow": string, "title": string, "description": string,
     "features": [{"icon": string (Lucide icon name like "TreePine"|"Waves"|"ShieldCheck"|"Sparkles"|"Home"|"Camera"),
                   "label": string, "body": string}, ...3-4 items] }

4. photo_gallery — eyebrow+title+description above a grid of captioned photos.
   { "eyebrow": string, "title": string, "description": string,
     "photos": [{"url": string, "caption": string}, ...3-6 items] }

5. booking_form — pitch text + list of reasons + submit button.
   { "eyebrow": string, "title": string, "description": string,
     "reasons": [{"label": string, "value": string}, ...3 items],
     "submitText": string, "noteText": string }

6. cta_section — full-bleed banner with title+subtitle+two CTA buttons.
   { "eyebrow": string, "title": string, "subtitle": string,
     "primaryText": string, "primaryLink": string,
     "secondaryText": string, "secondaryLink": string,
     "backgroundUrl": string }`;

const SYSTEM_PROMPT = `You analyse a screenshot of a single landing-page section and emit JSON describing the closest CMS block. Respond ONLY with a JSON object — no prose, no markdown fences.

${SCHEMA_DESCRIPTION}

Rules:
- Pick the SINGLE blockType that fits the image best.
- Use Vietnamese text content matching the visible language (default Vietnamese if unclear).
- For imageUrl/backgroundUrl/photos[].url — if you can identify a stock-photo-friendly subject, pick a sensible Unsplash URL like \`https://images.unsplash.com/photo-...\`. Otherwise use an empty string and the user will replace it.
- Keep text under each field reasonable: title ≤ 60 chars, description ≤ 200 chars, eyebrow ≤ 30 chars.
- Output schema: {"blockType": "...", "content": {...}, "reasoning": "1-sentence Vietnamese explanation"}`;

function getClient(): Anthropic {
  const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new ImportBlockError(
      'Thiếu NEXT_PUBLIC_ANTHROPIC_API_KEY trong .env.local. Lấy key tại https://console.anthropic.com → Settings → API Keys.'
    );
  }
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

/**
 * Read a File object as base64 (no `data:` prefix) plus mime type.
 */
export async function fileToBase64(file: File): Promise<{
  base64: string;
  mediaType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif';
}> {
  if (file.size > 5 * 1024 * 1024) {
    throw new ImportBlockError('File quá lớn (>5MB). Hãy resize trước.');
  }
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i += 0x8000) {
    bin += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + 0x8000))
    );
  }
  const base64 = btoa(bin);
  const t = file.type;
  const mediaType =
    t === 'image/png' ||
    t === 'image/jpeg' ||
    t === 'image/webp' ||
    t === 'image/gif'
      ? (t as 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif')
      : 'image/png';
  return { base64, mediaType };
}

/**
 * Parse a Figma design URL into the parts the Figma REST API needs.
 *   figma.com/design/:fileKey/:fileName?node-id=:nodeId
 * Hyphen-joined node IDs get rewritten to colon-joined for the API.
 */
export function parseFigmaUrl(
  url: string
): { fileKey: string; nodeId: string | null } | null {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith('figma.com')) return null;
    const parts = u.pathname.split('/').filter(Boolean);
    // /design/{fileKey}/{name} OR /file/{fileKey}/{name}
    const designIdx = parts.findIndex(p => p === 'design' || p === 'file');
    if (designIdx === -1 || !parts[designIdx + 1]) return null;
    const fileKey = parts[designIdx + 1];
    const rawNode = u.searchParams.get('node-id');
    const nodeId = rawNode ? rawNode.replace(/-/g, ':') : null;
    return { fileKey, nodeId };
  } catch {
    return null;
  }
}

/**
 * Fetch a rendered PNG for a Figma node via the REST `/v1/images` endpoint.
 * Requires the user's Figma personal access token (passed as `figmaToken`).
 * Returns base64 + media type so it can flow through the same vision call.
 */
export async function figmaNodeToImage(
  figmaUrl: string,
  figmaToken: string
): Promise<{ base64: string; mediaType: 'image/png' }> {
  const parsed = parseFigmaUrl(figmaUrl);
  if (!parsed) throw new ImportBlockError('URL Figma không hợp lệ');
  if (!parsed.nodeId) {
    throw new ImportBlockError(
      'URL Figma cần có `?node-id=...` (chọn frame/section cụ thể trong Figma trước khi copy link).'
    );
  }
  const api = `https://api.figma.com/v1/images/${encodeURIComponent(parsed.fileKey)}?ids=${encodeURIComponent(parsed.nodeId)}&format=png&scale=2`;
  const res = await fetch(api, { headers: { 'X-Figma-Token': figmaToken } });
  if (!res.ok) {
    throw new ImportBlockError(
      `Figma API trả ${res.status}. Check lại token + quyền truy cập file.`
    );
  }
  const data = (await res.json()) as { images: Record<string, string | null> };
  const cdnUrl = Object.values(data.images)[0];
  if (!cdnUrl) {
    throw new ImportBlockError(
      'Figma không export được node này (có thể là page root — chọn frame cụ thể).'
    );
  }
  const png = await fetch(cdnUrl);
  if (!png.ok) {
    throw new ImportBlockError(`Tải PNG từ Figma thất bại (${png.status})`);
  }
  const blob = await png.blob();
  const file = new File([blob], 'figma.png', { type: 'image/png' });
  const { base64 } = await fileToBase64(file);
  return { base64, mediaType: 'image/png' };
}

interface ImportArgs {
  base64: string;
  mediaType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif';
}

export async function importBlockFromImage(
  args: ImportArgs
): Promise<ImportBlockResult> {
  const client = getClient();
  const msg = await client.messages
    .create({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: args.mediaType,
                data: args.base64,
              },
            },
            {
              type: 'text',
              text: 'Phân tích screenshot này và trả về JSON khớp schema. Chỉ JSON, không có gì khác.',
            },
          ],
        },
      ],
    })
    .catch(err => {
      throw new ImportBlockError(
        `Claude API thất bại: ${err instanceof Error ? err.message : String(err)}`,
        err
      );
    });

  // Find the first text block in the response.
  const textPart = msg.content.find(c => c.type === 'text');
  if (!textPart || textPart.type !== 'text') {
    throw new ImportBlockError('Claude không trả về text response');
  }
  const text = textPart.text.trim();

  // Strip ```json fences if the model included them despite instructions.
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new ImportBlockError(
      `Không parse được JSON từ AI: ${cleaned.slice(0, 200)}`,
      e
    );
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new ImportBlockError('AI output không phải object');
  }
  const obj = parsed as {
    blockType?: unknown;
    content?: unknown;
    reasoning?: unknown;
  };
  if (
    typeof obj.blockType !== 'string' ||
    !VALID_BLOCK_TYPES.has(obj.blockType as BlockType)
  ) {
    throw new ImportBlockError(
      `AI trả blockType không hợp lệ: ${String(obj.blockType)}`
    );
  }
  if (!obj.content || typeof obj.content !== 'object') {
    throw new ImportBlockError('AI thiếu trường content');
  }
  const blockType = obj.blockType as BlockType;
  const content = obj.content as BlockContent;
  const reasoning = typeof obj.reasoning === 'string' ? obj.reasoning : '';

  // Build a real block via factory (gets a fresh id + default name) and
  // overwrite the desktop content with the AI output. Mobile stays undefined
  // so the renderer falls back to desktop.
  const block = createBlock(blockType);
  block.contentVi = { desktop: content };
  block.contentEn = { desktop: content };

  return { block, reasoning, raw: { blockType, content } };
}
