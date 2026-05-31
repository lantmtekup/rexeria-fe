/**
 * Legacy block registry — ported từ 360-admin-cms `src/blocks/` (113 blocks
 * legacy). Migration POC 2026-05-31 ship 3 blocks (faq, rexer-product,
 * delvaux-hero-intro) để verify pattern, sau đó scale tiếp.
 *
 * Khác với editor `Block` shape (canvas-template blocks editable per page):
 *  - Legacy blocks là DESIGN cố định (schema + component pair), brand
 *    chỉ swap content qua `defaults.{lang}` fields.
 *  - Render-only catalog: hiện ở /admin/blocks dưới label "Legacy" cho
 *    admin browse, copy ID, hoặc drop vào landing page sau (Wave 4).
 *
 * Khác với code templates (mint-coint): code template = full page (route
 * /p/<slug> own); legacy block = 1 section của page, embed được nhiều cái.
 */

import type { ComponentType } from 'react';

/** Field declaration cho schema editor (legacy 360-cms shape). FE rexer
 *  hiện chưa render form từ field list — chỉ dùng cho preview metadata. */
export interface LegacyFieldSpec {
  name: string;
  type: 'text' | 'richtext' | 'image' | 'array' | 'select' | 'color' | 'number';
  label: string;
  default?: unknown;
  required?: boolean;
  maxLength?: number;
  aspectRatio?: string;
  minItems?: number;
  maxItems?: number;
  defaultItem?: Record<string, unknown>;
  itemLabel?: string;
  itemSchema?: LegacyFieldSpec[];
}

export interface LegacyBlockSchema {
  /** Dotted id từ 360-cms (vd 'faq.v1', 'rexer.product.v1'). Stable across
   *  deploys — đừng rename vì sẽ break aggregate analytics. */
  id: string;
  /** Display name. */
  name: string;
  /** Category cho filter ở /admin/blocks (Landing, Product, Hero...). */
  category: string;
  /** Short description hiển thị ở card + drawer. */
  description: string;
  /** Field schema (cho admin form sau). Hiện chỉ dùng để count fields. */
  fields: LegacyFieldSpec[];
  /** Style tokens declared by block (color, font, etc.). Empty cho POC. */
  styleTokens: Array<{ name: string; label: string; default: string }>;
  /** Default content per lang. Render preview lấy vi trước. */
  defaults: Record<string, Record<string, unknown>>;
}

/** Props mà legacy block component nhận khi render preview. */
export interface LegacyBlockComponentProps {
  content: Record<string, unknown>;
  /** Static catalog preview — luôn false. Để giữ shape compat với 360-cms
   *  EditableContainer khi/nếu port editor sau. */
  editable?: boolean;
}

/** Registration entry. */
export interface LegacyBlockEntry {
  schema: LegacyBlockSchema;
  Component: ComponentType<LegacyBlockComponentProps>;
}
