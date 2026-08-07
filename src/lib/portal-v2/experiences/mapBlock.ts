import { resolveTypeMeta } from '@/lib/block-type-catalog';
import { canLivePreview } from '@/lib/portal-v2/exchange/parseEditorBlock';
import { formatUpdated } from '@/lib/portal-v2/experiences/helpers';
import {
  computeCoverage,
  ihash,
  irnd,
  roleOf,
  seedBlockLayer,
  seedEvidence,
  seedInteractions,
  seedObjective,
  seedStats,
  seedVehicle,
} from '@/lib/portal-v2/experiences/seed';
import type { ExperienceView } from '@/lib/portal-v2/experiences/types';
import type { Block } from '@/services/rexer/types';

/**
 * `Block` → `ExperienceView`.
 *
 * The twin of `mapPageToExperience`, and deliberately built from the same seed
 * helpers: a block has to render through the same card, the same detail modal
 * and the same evidence pills as a page, so it needs the same fields filled the
 * same way. Everything the block record actually knows — type code, tags,
 * scope, surfaces, usage — is copied across and shown as REAL; the analytics
 * half is seeded from `block.id` exactly as a page's is from `page.id`.
 *
 * Two honest differences from a page, both load-bearing:
 * - `state` is `null`. Template-vs-copy is a page lineage; a block has `scope`.
 * - `layers` has exactly ONE entry. A block IS a section, not a stack of them,
 *   so the funnel stack draws one bar and coverage is that bar's coverage.
 */

const TAGLINES = [
  'One section, reusable across every page.',
  'A block that has already earned its place.',
  'Drop it in; it brings its own layout.',
  'The same section, everywhere it belongs.',
  'Built once, inserted wherever it fits.',
  'A piece of a page, ready on its own.',
] as const;

const FEATURES = [
  'Inserts into any canvas from the block picker',
  'Responsive across the three device frames',
  'Reads brand tokens for type and colour',
  'Editable element by element on the canvas',
  'Reports dwell and scroll wherever it lands',
] as const;

const BENEFITS = [
  'One edit propagates to every page that adopts it',
  'No rebuild — the section already exists',
  'Consistent with the pages it already ships on',
  'Signals land on the shopper profile',
] as const;

/** Deterministic subset — at least one entry, stable per block. */
const pickSome = <T>(id: string, list: readonly T[], salt: string): T[] => {
  const picked = list.filter((_, i) => irnd(`${id}${salt}${i}`, 0, 1) > 0.45);
  return picked.length ? picked : [list[0]!];
};

export const mapBlockToExperience = (block: Block): ExperienceView => {
  const id = block.id;

  const objective = seedObjective(id);
  const name = block.name?.trim() || 'Untitled';
  const layers = [seedBlockLayer(id, objective, name)];
  const stats = seedStats(id, objective);

  const description = block.description?.trim() || '';
  const tagline = TAGLINES[ihash(id + 'tag') % TAGLINES.length]!;
  const typeCode = block.type_code;
  const typeMeta = typeCode ? resolveTypeMeta(typeCode) : null;
  const tags = block.tags ?? [];

  return {
    // ── real ──────────────────────────────────────────────────────────────
    id,
    kind: 'block',
    name,
    // A block has no public URL of its own — it previews through
    // `/embed/block/{id}`, which needs the id, not a slug.
    slug: null,
    templateVersionId: null,
    thumbnailUrl: block.thumbnail_url || null,
    externalUrl: null,
    // The library only ever asks for `status=published`; a legacy row with an
    // empty status is published by the same rule `effectiveBlockStatus` uses.
    status: 'published',
    summary: description || tagline,
    updatedLabel: formatUpdated(block.updated_at),

    // ── real · block-only ─────────────────────────────────────────────────
    typeCode,
    typeLabel: typeMeta?.adminLabel ?? typeCode,
    blockCategory: typeMeta?.category ?? undefined,
    tags,
    scope: block.scope,
    supportedSurfaces: block.supported_surfaces ?? [],
    usageCount: block.usage_count ?? 0,
    // Most blocks have no uploaded thumbnail, so the cover renders the block
    // itself — the same live-preview path Exchange's `ListingCover` uses.
    canLivePreview: canLivePreview(block.settings),

    // ── seeded ────────────────────────────────────────────────────────────
    state: null,
    vehicle: seedVehicle(id),
    objective,
    role: roleOf(objective),
    interactions: seedInteractions(id),
    proven: false,
    tagline,
    layers,
    features: pickSome(id, FEATURES, 'feat'),
    benefits: pickSome(id, BENEFITS, 'ben'),
    coverage: computeCoverage(layers),
    stats,
    evidence: seedEvidence(stats),

    // Type code and tags are how a user actually hunts for a block, so both
    // join the haystack the chip filter and the search box read.
    searchText: [
      block.name,
      typeCode,
      typeMeta?.adminLabel,
      description,
      ...tags,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
  };
};
