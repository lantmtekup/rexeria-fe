/**
 * Mock fixtures for AI Templates — enabled when
 * `NEXT_PUBLIC_AI_TEMPLATE_MOCK=1`. Shape mirrors the BE actual contract
 * (see `docs/be-ai-template-questions.md` answers). Drop once BE is
 * stable in the integration environment.
 */

import type {
  AIGenerationSession,
  AIGenerationVersion,
  AITemplate,
  AITemplateGenerateRequest,
  AITemplateGenerateResponse,
  AITemplateListResponse,
  MediaAsset,
  MediaListResponse,
} from '../types';

export const MOCK_AI_TEMPLATE_FLAG = 'NEXT_PUBLIC_AI_TEMPLATE_MOCK';

export function isAiTemplateMockEnabled(): boolean {
  if (typeof process === 'undefined') return false;
  // Bracket-form so callers can override per-build. Next.js still inlines
  // it because the literal key is a const string.
  return process.env[MOCK_AI_TEMPLATE_FLAG] === '1';
}

// Mirrors BE seed (`f2f2f2f2-…0001`) so the same fixture works once we
// flip the flag off against the QC backend.
const PRODUCT_LAUNCH_TEMPLATE: AITemplate = {
  id: 'f2f2f2f2-0000-0000-0000-000000000001',
  name: 'Giới thiệu sản phẩm mới',
  description:
    'Template 10 block giới thiệu sản phẩm — AI tự suy luận pain point, USP, tone từ thông tin tối thiểu.',
  topic: 'product_launch',
  is_active: true,
  version: 1,
  thumbnail_url: undefined,
  fields: [
    {
      field_key: 'product_name',
      label: 'Tên sản phẩm',
      data_type: 'text',
      is_required: true,
      ai_can_infer: false,
      placeholder: 'GreenBoost',
      mapped_blocks: ['blk_hero', 'blk_tagline', 'blk_cta'],
    },
    {
      field_key: 'category',
      label: 'Danh mục',
      data_type: 'text',
      is_required: true,
      ai_can_infer: false,
      placeholder: 'Đồ uống healthy',
      mapped_blocks: ['blk_hero', 'blk_feature', 'blk_image'],
    },
    {
      field_key: 'target_audience',
      label: 'Đối tượng mục tiêu',
      data_type: 'text',
      is_required: true,
      ai_can_infer: false,
      placeholder: 'Dân văn phòng 25–35 tuổi',
      mapped_blocks: ['blk_pain', 'blk_solution', 'blk_testimonial'],
    },
    {
      field_key: 'key_features',
      label: 'Tính năng chính',
      data_type: 'textarea',
      is_required: true,
      ai_can_infer: false,
      placeholder: 'Tự nhiên 100%, ít calo, tiện lợi',
      mapped_blocks: ['blk_feature', 'blk_solution'],
    },
    {
      field_key: 'price_range',
      label: 'Mức giá',
      data_type: 'text',
      is_required: true,
      ai_can_infer: false, // §8.16 — giá không cho AI bịa
      placeholder: '35.000 – 45.000 VND/chai',
      mapped_blocks: ['blk_price'],
    },
    {
      field_key: 'customer_pain_point',
      label: 'Vấn đề khách hàng gặp phải',
      data_type: 'textarea',
      is_required: false,
      ai_can_infer: true,
      placeholder: 'Mệt mỏi buổi chiều, thiếu năng lượng…',
      mapped_blocks: ['blk_pain'],
    },
    {
      field_key: 'unique_selling_point',
      label: 'Điểm khác biệt',
      data_type: 'textarea',
      is_required: false,
      ai_can_infer: true,
      placeholder: 'Thành phần thực vật 100%…',
      mapped_blocks: ['blk_solution', 'blk_feature'],
    },
    {
      field_key: 'brand_tone',
      label: 'Phong cách thương hiệu',
      data_type: 'select',
      is_required: false,
      ai_can_infer: true,
      mapped_blocks: ['blk_hero', 'blk_tagline', 'blk_cta'],
      // BE Q13: options are a flat string[].
      options: ['formal', 'friendly', 'energetic', 'luxury', 'minimal'],
    },
    {
      field_key: 'testimonial_sample',
      label: 'Mẫu testimonial (nếu có)',
      data_type: 'textarea',
      is_required: false,
      ai_can_infer: true,
      mapped_blocks: ['blk_testimonial'],
    },
    {
      field_key: 'image_style_preference',
      label: 'Phong cách hình ảnh',
      data_type: 'text',
      is_required: false,
      ai_can_infer: true,
      placeholder: 'Tươi sáng, tự nhiên…',
      mapped_blocks: ['blk_image'],
    },
  ],
  blocks: [
    { block_id: 'blk_hero', position: 1, role: 'hero', layout_type: 'mixed' },
    {
      block_id: 'blk_tagline',
      position: 2,
      role: 'tagline',
      layout_type: 'text',
    },
    { block_id: 'blk_pain', position: 3, role: 'pain', layout_type: 'text' },
    {
      block_id: 'blk_solution',
      position: 4,
      role: 'solution',
      layout_type: 'text',
    },
    {
      block_id: 'blk_feature',
      position: 5,
      role: 'feature',
      layout_type: 'text',
    },
    { block_id: 'blk_image', position: 6, role: 'image', layout_type: 'image' },
    {
      block_id: 'blk_testimonial',
      position: 7,
      role: 'testimonial',
      layout_type: 'text',
    },
    { block_id: 'blk_price', position: 8, role: 'price', layout_type: 'text' },
    { block_id: 'blk_cta', position: 9, role: 'cta', layout_type: 'text' },
    { block_id: 'blk_faq', position: 10, role: 'faq', layout_type: 'text' },
  ],
  created_at: new Date('2026-05-10T00:00:00Z').toISOString(),
  updated_at: new Date('2026-05-13T00:00:00Z').toISOString(),
};

const MOCK_TEMPLATES: AITemplate[] = [PRODUCT_LAUNCH_TEMPLATE];

// In-memory store of generated sessions so the Review page + history
// drawer behave consistently across page reloads within a single dev session.
const SESSIONS = new Map<string, AIGenerationSession>();

export function mockListAiTemplates(): AITemplateListResponse {
  return {
    items: MOCK_TEMPLATES,
    page: 1,
    limit: 50,
    total: MOCK_TEMPLATES.length,
    total_pages: 1,
  };
}

export function mockGetAiTemplate(id: string): AITemplate | undefined {
  return MOCK_TEMPLATES.find(t => t.id === id);
}

function buildBlocks(
  template: AITemplate,
  input: Record<string, unknown>,
  inferred: Record<string, unknown>,
  regenBlockId?: string
): AIGenerationVersion['blocks'] {
  const productName = String(input.product_name ?? 'Sản phẩm mới');
  const category = String(input.category ?? 'sản phẩm');
  const audience = String(input.target_audience ?? 'khách hàng tiềm năng');

  return (template.blocks ?? []).map(b => {
    const isRegen = regenBlockId === b.block_id;
    const source = isRegen ? 'ai' : 'ai'; // BE returns "ai" for fresh + regen
    switch (b.role) {
      case 'hero':
        return {
          block_id: b.block_id,
          position: b.position,
          role: b.role,
          layout_type: b.layout_type,
          content: {
            title: `${productName} — ${category} cho ${audience}`,
            body: 'Tận hưởng năng lượng tự nhiên mỗi ngày.',
            alt: `Hình ảnh ${productName}`,
            caption: 'Tiện lợi, ít calo',
          },
          image_media_ids: [],
          source,
          skipped: false,
        };
      case 'tagline':
        return {
          block_id: b.block_id,
          position: b.position,
          role: b.role,
          layout_type: b.layout_type,
          content: { text: `${productName}: tươi mới mỗi giờ.` },
          image_media_ids: [],
          source,
          skipped: false,
        };
      case 'pain':
        return {
          block_id: b.block_id,
          position: b.position,
          role: b.role,
          layout_type: b.layout_type,
          content: { text: inferred.customer_pain_point },
          image_media_ids: [],
          source,
          skipped: false,
        };
      case 'solution':
        return {
          block_id: b.block_id,
          position: b.position,
          role: b.role,
          layout_type: b.layout_type,
          content: {
            text: `${productName} giúp bạn tỉnh táo bằng cách bổ sung năng lượng tự nhiên từ thực vật.`,
          },
          image_media_ids: [],
          source,
          skipped: false,
        };
      case 'feature':
        return {
          block_id: b.block_id,
          position: b.position,
          role: b.role,
          layout_type: b.layout_type,
          content: {
            items: String(input.key_features ?? '')
              .split(/[,;]/)
              .map(s => s.trim())
              .filter(Boolean),
          },
          image_media_ids: [],
          source,
          skipped: false,
        };
      case 'image':
        return {
          block_id: b.block_id,
          position: b.position,
          role: b.role,
          layout_type: b.layout_type,
          content: { title: 'Lifestyle', body: 'Ảnh minh hoạ sản phẩm' },
          image_media_ids: [],
          source,
          skipped: false,
        };
      case 'testimonial':
        return {
          block_id: b.block_id,
          position: b.position,
          role: b.role,
          layout_type: b.layout_type,
          content: {
            quote:
              'Tôi đã thử nhiều loại nước nhưng đây là loại duy nhất giúp tôi tỉnh táo cả buổi chiều.',
            author: 'An, 28 — Marketing Lead',
          },
          image_media_ids: [],
          source,
          skipped: false,
        };
      case 'price':
        return {
          block_id: b.block_id,
          position: b.position,
          role: b.role,
          layout_type: b.layout_type,
          content: { text: String(input.price_range ?? '') },
          image_media_ids: [],
          source,
          skipped: false,
        };
      case 'cta':
        return {
          block_id: b.block_id,
          position: b.position,
          role: b.role,
          layout_type: b.layout_type,
          content: {
            label: 'Đặt ngay hôm nay',
            description: 'Giao tận nơi trong 2 giờ tại TP.HCM & Hà Nội.',
          },
          image_media_ids: [],
          source,
          skipped: false,
        };
      case 'faq':
        return {
          block_id: b.block_id,
          position: b.position,
          role: b.role,
          layout_type: b.layout_type,
          content: {
            items: [
              {
                q: `${productName} có chứa caffeine không?`,
                a: 'Không. Chúng tôi dùng năng lượng thực vật tự nhiên.',
              },
            ],
          },
          image_media_ids: [],
          source,
          skipped: false,
        };
      default:
        return {
          block_id: b.block_id,
          position: b.position,
          role: b.role,
          layout_type: b.layout_type,
          content: {},
          image_media_ids: [],
          source,
          skipped: false,
        };
    }
  });
}

export async function mockGenerateAiTemplate(
  templateId: string,
  body: AITemplateGenerateRequest
): Promise<AITemplateGenerateResponse> {
  await new Promise(r => setTimeout(r, 1000));
  const template = mockGetAiTemplate(templateId);
  if (!template) throw new Error(`Mock template ${templateId} not found`);

  const sessionId = body.session_id ?? `mock-sess-${Date.now()}`;
  const existing = SESSIONS.get(sessionId);
  const isRegen = !!body.regenerate;
  const isReinfer = !!body.regenerate?.reinfer;

  const inferred: Record<string, unknown> = {
    customer_pain_point:
      body.user_input.customer_pain_point ??
      'Mệt mỏi buổi chiều, thiếu năng lượng tự nhiên khi làm việc.',
    unique_selling_point:
      body.user_input.unique_selling_point ??
      'Thành phần thực vật 100%, không đường tinh luyện.',
    brand_tone: body.user_input.brand_tone ?? 'energetic',
    image_style_preference:
      body.user_input.image_style_preference ??
      'Tươi sáng, tự nhiên, tông xanh – trắng.',
    category: body.user_input.category ?? '',
  };

  const blocks = buildBlocks(
    template,
    body.user_input,
    inferred,
    isReinfer ? undefined : body.regenerate?.block_id
  );

  const imgSuggestions: Record<string, string[]> = {
    blk_hero: ['mock-media-1', 'mock-media-2', 'mock-media-3'],
    blk_image: [
      'mock-media-4',
      'mock-media-5',
      'mock-media-6',
      'mock-media-7',
      'mock-media-8',
    ],
  };

  const nextVersion = existing ? existing.versions.length + 1 : 1;
  const kind: AIGenerationVersion['kind'] = !isRegen
    ? 'initial'
    : isReinfer
      ? 'reinfer'
      : 'regenerate_block';

  const version: AIGenerationVersion = {
    version: nextVersion,
    kind,
    target_block_id: body.regenerate?.block_id || undefined,
    blocks,
    image_suggestions: imgSuggestions,
    created_at: new Date().toISOString(),
  };

  const session: AIGenerationSession = existing
    ? { ...existing, versions: [...existing.versions, version] }
    : {
        session_id: sessionId,
        template_id: templateId,
        versions: [version],
      };
  SESSIONS.set(sessionId, session);

  return {
    session_id: sessionId,
    version: nextVersion,
    inferred_context: inferred,
    blocks,
    image_suggestions: imgSuggestions,
    model: 'mock-gpt',
    usage: { input_tokens: 1200, output_tokens: 800 },
  };
}

// Fake media pool for the AI image-suggestion mock. Returns plausible
// MediaAsset objects with public Unsplash URLs so ImageSuggestionDialog
// has something to render — used only when the dialog is opened with
// `mock-media-*` ids generated by `mockGenerateAiTemplate`.
const MOCK_MEDIA_URLS: Record<string, string> = {
  'mock-media-1':
    'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600',
  'mock-media-2':
    'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600',
  'mock-media-3':
    'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600',
  'mock-media-4':
    'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=600',
  'mock-media-5':
    'https://images.unsplash.com/photo-1525909002-1b05e0c869d8?w=600',
  'mock-media-6':
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
  'mock-media-7':
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600',
  'mock-media-8':
    'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=600',
};

function buildMockMedia(id: string): MediaAsset {
  return {
    id,
    page_id: null,
    owner_scope: 'library',
    original_filename: `${id}.jpg`,
    media_type: 'image',
    mime_type: 'image/jpeg',
    status: 'ready',
    file_size: 1024,
    storage_key: id,
    public_url: MOCK_MEDIA_URLS[id],
    tags: [],
    created_at: new Date().toISOString(),
    created_by: 'mock',
  };
}

export function mockMediaList(ids: string[]): MediaListResponse {
  return {
    items: ids
      .filter(id => id.startsWith('mock-media-') && MOCK_MEDIA_URLS[id])
      .map(buildMockMedia),
  };
}

export function mockGetSession(sessionId: string): AIGenerationSession {
  return (
    SESSIONS.get(sessionId) ?? {
      session_id: sessionId,
      template_id: PRODUCT_LAUNCH_TEMPLATE.id,
      versions: [],
    }
  );
}
