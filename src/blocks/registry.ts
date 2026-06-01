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
import framerAesthaEditorial from './framer-aestha-editorial';
import framerAesthaProjectDetail from './framer-aestha-project-detail';
import framerArpeggioHero from './framer-arpeggio-hero';
import framerAvexaBento from './framer-avexa-bento';
import framerAvexaHero from './framer-avexa-hero';
import framerBungeeHero from './framer-bungee-hero';
import framerClarityServices from './framer-clarity-services';
import framerContactFooter from './framer-contact-footer';
import framerDarlingTimeline from './framer-darling-timeline';
import framerExploreCta from './framer-explore-cta';
import framerFaqMinimal from './framer-faq-minimal';
import framerFinneganExpertise from './framer-finnegan-expertise';
import framerFirmaFeatured from './framer-firma-featured';
import framerHero from './framer-hero';
import framerHorizontalScroll from './framer-horizontal-scroll';
import framerImageStagger from './framer-image-stagger';
import framerIntroRedefined from './framer-intro-redefined';
import framerLargeQuote from './framer-large-quote';
import framerMobiusHero from './framer-mobius-hero';
import framerParadigmTitle from './framer-paradigm-title';
import framerPerformAbout from './framer-perform-about';
import framerPerformHero from './framer-perform-hero';
import framerPerformHeroV2 from './framer-perform-hero-v2';
import framerPerformPricing from './framer-perform-pricing';
import framerProjectsGrid from './framer-projects-grid';
import framerSignatureFeature from './framer-signature-feature';
import framerStatsGrid from './framer-stats-grid';
import framerStudioManifesto from './framer-studio-manifesto';
import framerTeamDirectory from './framer-team-directory';
import framerVeloraServices from './framer-velora-services';
import framerVsCollinsProjects from './framer-vs-collins-projects';
import framerYumeHero from './framer-yume-hero';
import framerYuyaHero from './framer-yuya-hero';
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
  framerHero,
  framerYumeHero,
  framerYuyaHero,
  framerPerformHero,
  framerPerformHeroV2,
  framerArpeggioHero,
  framerBungeeHero,
  framerMobiusHero,
  framerAvexaHero,
  framerIntroRedefined,
  framerParadigmTitle,
  // ── Landing sections ────────────────────────────────────
  featureSection,
  photoGallery,
  testimonials,
  partners,
  faq,
  framerFaqMinimal,
  ctaSection,
  framerExploreCta,
  framerPerformAbout,
  framerPerformPricing,
  framerLargeQuote,
  framerStatsGrid,
  framerStudioManifesto,
  framerSignatureFeature,
  framerImageStagger,
  framerHorizontalScroll,
  framerDarlingTimeline,
  framerFinneganExpertise,
  framerVeloraServices,
  framerClarityServices,
  framerAesthaEditorial,
  framerAvexaBento,
  // ── Showcase / Portfolio ───────────────────────────────
  framerProjectsGrid,
  framerVsCollinsProjects,
  framerFirmaFeatured,
  framerTeamDirectory,
  framerAesthaProjectDetail,
  // ── Footer / Contact ───────────────────────────────────
  framerContactFooter,
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
