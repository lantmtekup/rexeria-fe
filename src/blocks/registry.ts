/**
 * Legacy block registry — danh sách block ported từ 360-admin-cms.
 *
 * Add block mới = import file index.ts của block ở `registry` array dưới.
 * `getAllLegacyBlocks()` trả về readonly snapshot cho UI consume.
 *
 * Migration timeline:
 *   - 2026-05-31: POC 3 blocks (faq, rexer-product, delvaux-hero-intro)
 *   - sau: migrate batch lớn từ 360-cms/src/blocks/ (113 blocks total)
 */

import type { Block as ServerBlock } from '@/services/rexer/types';

import ctaSection from './cta-section';
import delvauxHeroIntro from './delvaux-hero-intro';
import faq from './faq';
import featureSection from './feature-section';
import heroOverlay from './hero-overlay';
import heroSplit from './hero-split';
import partners from './partners';
import photoGallery from './photo-gallery';
import rexerProduct from './rexer-product';
import testimonials from './testimonials';
import type { LegacyBlockEntry } from './types';

const registry: readonly LegacyBlockEntry[] = [
  // ── Hero ────────────────────────────────────────────────
  heroSplit,
  heroOverlay,
  delvauxHeroIntro,
  // ── Landing sections ────────────────────────────────────
  featureSection,
  photoGallery,
  testimonials,
  partners,
  faq,
  ctaSection,
  // ── Product ─────────────────────────────────────────────
  rexerProduct,
];

export function getAllLegacyBlocks(): readonly LegacyBlockEntry[] {
  return registry;
}

export function getLegacyBlock(id: string): LegacyBlockEntry | undefined {
  return registry.find(e => e.schema.id === id);
}

/**
 * Map dotted id → type_code dùng được như enum ở UI filter.
 * 'faq.v1' → 'legacy_faq_v1'. Prefix `legacy_` để admin filter ra nhanh.
 */
export function legacyIdToTypeCode(id: string): string {
  return `legacy_${id.replace(/\./g, '_')}`;
}

/**
 * Tạo synthetic `ServerBlock` entries từ registry. Dùng để merge vào
 * `/admin/blocks` list mà KHÔNG cần seed BE — admin browse được ngay.
 * `id` deterministic (`legacy:<schema.id>`) để key React + click handler.
 */
export function buildLegacyServerBlocks(): ServerBlock[] {
  const now = new Date().toISOString();
  return registry.map(({ schema }) => ({
    id: `legacy:${schema.id}`,
    type_code: legacyIdToTypeCode(schema.id),
    name: schema.name,
    description: schema.description,
    settings: {
      __legacy: true,
      schemaId: schema.id,
      category: schema.category,
      defaults: schema.defaults,
    },
    tags: ['legacy', schema.category.toLowerCase()],
    scope: 'system',
    usage_count: 0,
    created_by: 'system',
    updated_by: 'system',
    created_at: now,
    updated_at: now,
  }));
}
