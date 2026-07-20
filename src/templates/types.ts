/**
 * Code-defined template contract (Option C — be-audit §15 alternative).
 *
 * Một template = thư mục `src/templates/{code}/` chứa:
 *  - `index.tsx` — export default React component nhận `TemplateProps`
 *  - `meta.ts`   — export `meta: TemplateMeta` describes name, content schema
 *
 * Khác với block-based templates (canvas_blueprint JSON, BE-rendered):
 *  - Code template lưu source ở repo, deploy mới đổi → KHÔNG runtime-edit
 *  - Public `/p/{slug}` Next.js render React tree (A2a)
 *  - Per-page customization qua `page.type_metadata` (A1a), brand fill form
 *    generated từ `meta.contentSchema`
 *
 * Đăng ký template ở `src/templates/registry.ts`. Discriminator: lookup
 * `template.code` (BE field) trong registry — match là code template.
 */

import type { Page } from '@/services/rexer/types';

/** Field types user (admin / brand) có thể fill khi customize content. */
export type TemplateFieldType =
  'text' | 'longText' | 'image' | 'url' | 'number' | 'boolean' | 'select';

export interface TemplateContentField {
  /** JSON key trong `page.type_metadata`. */
  key: string;
  /** UI label cho form input. */
  label: string;
  type: TemplateFieldType;
  required?: boolean;
  /** Default value khi user chưa fill. Optional. */
  default?: unknown;
  /** Options cho `type: 'select'`. */
  options?: Array<{ value: string; label: string }>;
  /** Helper text dưới input. */
  hint?: string;
  /** Group fields trên form theo section name. */
  group?: string;
}

export interface TemplateContentSchema {
  fields: TemplateContentField[];
}

/**
 * Logical section declaration cho per-section analytics. Tracking hook
 * (useSectionTracking) cần biết section nào tồn tại để fire view event
 * khi user scroll vào. Card analytics render theo thứ tự declared.
 *
 * Section id phải khớp `data-rexer-section` attr ở TSX. Kebab-case,
 * stable across deploys (rename = break aggregate history).
 */
export interface TemplateSection {
  /** Match `data-rexer-section` attr. kebab-case. */
  id: string;
  /** Display name ở analytics card. */
  label: string;
  /** Thumbnail (96x72 ~) cho card preview. Optional — fallback gradient. */
  thumbnail?: string;
}

/**
 * Tracking config declared trong meta.ts. Section list cho analytics
 * + grouping. CTAs liệt kê các nút quan trọng (mỗi nút có
 * `data-rexer-cta` attr) để label đẹp ở click report.
 */
export interface TemplateTrackingConfig {
  sections: TemplateSection[];
  /** Optional — CTAs labeling cho click events. Hook tự fire click cho
   *  mọi [data-rexer-cta] regardless of liệt kê ở đây.
   *
   *  `section` (optional) = section.id mà CTA này nằm trong. Analytics UI
   *  dùng để group CTAs theo section card (icon list breakdown trong từng
   *  section card). Bỏ trống = global UI (header, sticky nav, ...). */
  ctas?: Array<{ id: string; label: string; section?: string }>;
}

export interface TemplateMeta {
  /** Phải khớp `template.code` ở BE. */
  code: string;
  /** Display name. */
  name: string;
  /** Short description hiển thị ở admin catalog. */
  description?: string;
  /** Thumbnail URL preview. */
  thumbnailUrl?: string;
  /** Schema để generate form cho brand customize per-page content. */
  contentSchema?: TemplateContentSchema;
  /** Per-section tracking config. KHÔNG khai báo → page-level only
   *  (no breakdown ở analytics). */
  tracking?: TemplateTrackingConfig;
}

/**
 * Props mà template component nhận. `content` = page.type_metadata (brand
 * customize), `page` cho page-level info (name, slug, status...).
 *
 * Code template SHOULD provide defaults cho mọi field (vì `content` có
 * thể empty nếu brand chưa fill). Pattern: dùng nullish coalescing
 * `content.title ?? 'Default Title'`.
 */
export interface TemplateProps {
  /** Page entity từ BE — slug, name, status, brand_id, workspace_id... */
  page: Page;
  /** Brand-fillable content theo schema. Key tự do (per template). */
  content: Record<string, unknown>;
  /** Mode hint: 'preview' (admin), 'public' (live /p/{slug}). Cho phép
   *  template tắt analytics/tracking khi preview. */
  mode: 'preview' | 'public';
}
