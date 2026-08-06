import { formatUpdated } from '@/lib/portal-v2/experiences/helpers';
import {
  computeCoverage,
  ihash,
  irnd,
  roleOf,
  seedEvidence,
  seedInteractions,
  seedLayers,
  seedObjective,
  seedState,
  seedStats,
  seedVehicle,
} from '@/lib/portal-v2/experiences/seed';
import { readProven } from '@/services/portal-v2/experienceProven';
import type { ExperienceView } from '@/lib/portal-v2/experiences/types';
import type { Page } from '@/services/rexer/types';

/**
 * `Page` → `ExperienceView`.
 *
 * Everything a published landing page actually knows about itself is copied
 * straight across. Everything the analytics surfaces need — funnel roles,
 * instrumentation coverage, sessions, lift — has no backend yet and is seeded
 * from `page.id`, so it is stable per page and identical across SSR and
 * hydration.
 *
 * Same shape as Exchange's `mapLandingPageToListing`, which attaches
 * `pageMetaPreset(page.id)` to a real page for the same reason.
 */

const TAGLINES = [
  'The post-click surface for this campaign.',
  'Built for the click that arrives curious.',
  'One page, one job, one next step.',
  'Where the ad stops and the decision starts.',
  'Everything the shopper needs, nothing they do not.',
  'The objection, answered on the page it appears.',
] as const;

const FEATURES = [
  'Rendered from the shared block canvas',
  'Responsive across the three device frames',
  'Publishes to a public slug',
  'Reads brand tokens for type and colour',
  'Every block reports dwell and scroll',
] as const;

const BENEFITS = [
  'One destination that works for every channel',
  'Editable without a deploy',
  'Signals land on the shopper profile',
  'Reuses blocks already proven elsewhere',
] as const;

/** Deterministic subset — at least one entry, stable per page. */
const pickSome = <T>(id: string, list: readonly T[], salt: string): T[] => {
  const picked = list.filter((_, i) => irnd(`${id}${salt}${i}`, 0, 1) > 0.45);
  return picked.length ? picked : [list[0]!];
};

export const mapPageToExperience = (page: Page): ExperienceView => {
  const id = page.id;

  const objective = seedObjective(id);
  const layers = seedLayers(id, objective);
  const stats = seedStats(id, objective);

  const description = page.description?.trim() || '';
  const tagline = TAGLINES[ihash(id + 'tag') % TAGLINES.length]!;

  return {
    // ── real ──────────────────────────────────────────────────────────────
    id,
    name: page.name?.trim() || 'Untitled',
    slug: page.slug?.trim() || null,
    templateVersionId: page.template_version_id || null,
    thumbnailUrl: pageThumbnailUrl(page),
    externalUrl: page.external_url?.trim() || null,
    status: page.status,
    summary: description || tagline,
    updatedLabel: formatUpdated(page.updated_at),
    // Dấu do người dùng bấm, đọc từ `type_metadata.proven` — KHÔNG seed. Đây là
    // đầu vào của module Automation: hub chỉ hiện thiết kế đã được đánh dấu.
    proven: readProven(page),

    // ── seeded ────────────────────────────────────────────────────────────
    state: seedState(id),
    category: 'collection',
    vehicle: seedVehicle(id),
    objective,
    role: roleOf(objective),
    interactions: seedInteractions(id),
    tagline,
    layers,
    features: pickSome(id, FEATURES, 'feat'),
    benefits: pickSome(id, BENEFITS, 'ben'),
    coverage: computeCoverage(layers),
    stats,
    evidence: seedEvidence(stats),

    searchText: [page.name, page.slug, description]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
  };
};

/**
 * `thumbnail_url` is empty on most rows in practice, so fall back to the
 * landing metadata's featured image before giving up and letting the card draw
 * its generated cover. Mirrors the admin list's `pageThumbnailUrl`.
 */
const pageThumbnailUrl = (page: Page): string | null => {
  if (page.thumbnail_url) return page.thumbnail_url;
  const meta = page.type_metadata as { featured_image?: string } | undefined;
  return meta?.featured_image || null;
};
