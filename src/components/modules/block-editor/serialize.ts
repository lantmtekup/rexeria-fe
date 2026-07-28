import type {
  Block,
  BlockBackground,
  BlockContent,
  BlockMotionStored,
  DeviceVariants,
  ElementStylesMap,
} from './types';

/** Schema version emitted to BE. Per `docs/canvas-block-responsive-spec.md` §5. */
export const SCHEMA_VERSION = '2.0' as const;
/** Legacy detector — older payloads used `schema: 'block_editor'` + `version: 1|2`. */
const LEGACY_SCHEMA = 'block_editor' as const;

export interface PublishMeta {
  /** True once user has clicked Publish. */
  published: boolean;
  /** Random token used in the public URL. Stable per template. */
  shareToken: string;
  /** ISO timestamp of the most recent publish click. */
  publishedAt?: string;
}

// ─── Multi-page ─────────────────────────────────────────────────────────────
//
// ⚠️ NAMING: `EditorPage` here is a page *inside one template's canvas* — the
// thing the user switches between with the page tabs. It is NOT the BE `Page`
// entity (`src/services/rexer/types.ts`), which is the published landing that
// owns a slug, revisions and releases. One BE `Page` renders a whole template,
// i.e. ALL of its `EditorPage`s. Never write bare `Page` for this concept.
//
// Layout of the wire blueprint:
//
//   { blocks: [...],           ← derived MIRROR of the home page, never authored
//     pages:  [ {id, name, slug, isHome, blocks, seo?}, ... ],
//     active_page_id, ... }
//
// **When `pages` is a non-empty array it is the source of truth and root
// `blocks` is ignored on read.** Root `blocks` exists only so the readers that
// predate multi-page (public `/p/[id]`, the share-token route, portal previews,
// analytics overlays, admin template preview, AI apply-product) keep rendering
// the home page with zero migration.

/** Stable id for the implicit page synthesized from a pre-multi-page blueprint.
 *  Must stay stable across reloads — sessionStorage keys are scoped by page id. */
export const DEFAULT_PAGE_ID = 'p_home' as const;

export interface PageSeo {
  title?: string;
  description?: string;
  ogImageUrl?: string;
}

/**
 * Wire shape of one entry in blueprint `pages[]`. Inner fields are camelCase
 * (mirrors the `publish` precedent); only top-level meta is snake_case.
 * `is_home` is accepted on read defensively.
 */
export interface CanvasPageWire {
  id: string;
  name: string;
  slug: string;
  isHome?: boolean;
  is_home?: boolean;
  blocks?: unknown[];
  seo?: PageSeo;
}

/** In-memory page. `blocks` is ALWAYS present — `parseCanvas` normalizes. */
export interface EditorPage {
  id: string;
  name: string;
  /** '' for the home page. Otherwise kebab-case and unique among siblings.
   *  May contain '/' so nested sub-paths need no migration later. */
  slug: string;
  isHome: boolean;
  blocks: Block[];
  seo?: PageSeo;
}

/** In-memory canvas shape (camelCase). Wire format is snake_case — see (de)serialize. */
export interface BlockEditorCanvas {
  schemaVersion: typeof SCHEMA_VERSION;
  /** Home page's blocks. Meaning is unchanged for every pre-multi-page reader. */
  blocks: Block[];
  /** Always ≥ 1 entry, exactly one with `isHome === true`. */
  pages: EditorPage[];
  /** Always a valid id present in `pages`. */
  activePageId: string;
  activeBlockId?: string;
  publish?: PublishMeta;
  /** Transition cấp template (preset áp cho cả collection block). Mặc định
   *  'none'. Lưu opaque trong canvas_blueprint JSON — render layer validate. */
  transition?: string;
}

/** Kebab-case a Vietnamese page name into a URL segment. */
export function slugifyPageName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

/**
 * The ONE place page invariants are enforced, so the editor never sees an
 * invalid model:
 *   - at least 1 page
 *   - exactly 1 `isHome` (first claimant wins; none → `pages[0]`)
 *   - home slug is '' ; non-home slug is non-empty and unique
 *   - `blocks` is always an array
 */
export function normalizePages(raw: EditorPage[]): EditorPage[] {
  if (raw.length === 0) {
    return [
      {
        id: DEFAULT_PAGE_ID,
        name: 'Trang chủ',
        slug: '',
        isHome: true,
        blocks: [],
      },
    ];
  }
  const seen = new Set<string>();
  let homeTaken = false;
  const out = raw.map((p, i) => {
    const isHome = !!p.isHome && !homeTaken;
    if (isHome) homeTaken = true;
    let slug = isHome
      ? ''
      : p.slug || slugifyPageName(p.name) || `trang-${i + 1}`;
    while (slug && seen.has(slug)) slug = `${slug}-2`;
    if (slug) seen.add(slug);
    return { ...p, isHome, slug, blocks: p.blocks ?? [] };
  });
  if (!homeTaken) out[0] = { ...out[0], isHome: true, slug: '' };
  return out;
}

/** The home page. Never returns undefined — `normalizePages` guarantees one. */
export function homePageOf(pages: EditorPage[]): EditorPage {
  return pages.find(p => p.isHome) ?? pages[0];
}

// ─── Save (serialize → wire) ────────────────────────────────────────────────

/**
 * Build the wire payload sent to BE.
 *
 * BE validator expects:
 * - Top-level: `schema_version: "2.0"` (snake_case meta)
 * - Inner block fields: camelCase (`blockType`, `contentVi`, `isVisible`, …)
 *   matching the FE TypeScript shape verbatim.
 *
 * So we only rename the top-level meta key; everything else passes through
 * untouched. BE error precedent: missing `blocks[0].contentVi` when we
 * accidentally deep-converted to snake_case (commit prior to this).
 */
export function serializeCanvas(
  blocks: Block[],
  activeBlockId?: string,
  publish?: PublishMeta,
  transition?: string
): Record<string, unknown> {
  const out: Record<string, unknown> = {
    // Keep `schema` + `version` (V1 fields) ALONGSIDE the new `schema_version`
    // (V2) so BE handlers that haven't migrated yet — notably the AI apply-
    // product endpoint, which still validates `schema === "block_editor"` —
    // continue to recognise the canvas. Both fields point at the same shape;
    // newer BE handlers prefer `schema_version`.
    schema: LEGACY_SCHEMA,
    version: 2,
    schema_version: SCHEMA_VERSION,
    blocks,
  };
  if (activeBlockId) out.active_block_id = activeBlockId;
  if (publish) out.publish = publish;
  if (transition && transition !== 'none') out.transition = transition;
  return out;
}

export interface SerializeCanvasPagesInput {
  pages: EditorPage[];
  activePageId?: string;
  activeBlockId?: string;
  publish?: PublishMeta;
  transition?: string;
  /**
   * Emit the root `blocks` mirror of the home page. Default true — required
   * until every reader understands `pages`. Flip to false in ONE place once
   * `/p/[id]`, portal previews and analytics overlays are page-aware.
   */
  homeMirror?: boolean;
}

/**
 * Multi-page wire payload. For a single-page template the output is
 * `serializeCanvas(...)` plus `pages` (1 entry) and `active_page_id`, so the BE
 * `canvas_blueprint_validator` — which only walks root `blocks[]` — is
 * unaffected.
 *
 * ⚠️ BE only validates root `blocks[]`, so an invalid `blockType` on a non-home
 * page will pass autosave and `createVersion` and only fail at render time.
 * Callers committing a version should pre-flight every page's block types.
 */
export function serializeCanvasPages(
  input: SerializeCanvasPagesInput
): Record<string, unknown> {
  const pages = normalizePages(input.pages);
  const home = homePageOf(pages);

  const out = serializeCanvas(
    input.homeMirror === false ? [] : home.blocks,
    input.activeBlockId,
    input.publish,
    input.transition
  );

  out.pages = pages.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    isHome: p.isHome,
    blocks: p.blocks,
    ...(p.seo ? { seo: p.seo } : {}),
  }));
  if (input.activePageId) out.active_page_id = input.activePageId;
  return out;
}

export function newShareToken(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 24);
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Load (wire → parse) ────────────────────────────────────────────────────

/**
 * Coerce a BE `canvas_blueprint` into something `parseCanvas` accepts.
 *
 * BE stores older blueprints with `schema_version: "1.0"` (or none at all),
 * while `parseCanvas` only recognises `"2.0"` / legacy `schema:'block_editor'`.
 * This normalises that one field.
 *
 * **Everything else passes through untouched.** Four copies of this helper used
 * to rebuild the object as `{ schema_version, blocks }`, which silently dropped
 * every other top-level key — `transition`, `publish` and `active_block_id`
 * were destroyed on every editor reload, and any key added later (e.g. `pages`)
 * would be destroyed the same way: read → strip → autosave writes the stripped
 * version back → data gone for good. Keep this a passthrough.
 */
export function adaptCanvasBlueprint(
  raw: Record<string, unknown> | undefined | null
): Record<string, unknown> | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  return {
    ...raw,
    schema_version: SCHEMA_VERSION,
    blocks: Array.isArray((raw as { blocks?: unknown }).blocks)
      ? (raw as { blocks: unknown[] }).blocks
      : [],
  };
}

/**
 * Parse `canvas_data` from REXER into the in-memory `BlockEditorCanvas`.
 * Returns `null` if data is missing or doesn't look like a block-editor canvas.
 *
 * Accepts wire shapes:
 * - **2.0** (current) — `schema_version: "2.0"` top-level + camelCase block
 *   fields (matching BE validator). `active_block_id` snake_case at top.
 * - **`schema_version: "1.0"`** — vỏ BE ghi cho `canvas_blueprint` (template
 *   version, handoff của AI-Insights…). Chỉ khác con số ở vỏ: block bên trong
 *   vẫn camelCase phẳng, và `migrateBlockV1toV2` bọc được content dạng cũ.
 *   Trước đây bị trả `null` ở đây, nên mọi call site phải tự ép vỏ về "2.0" —
 *   chỗ nào quên thì preview ra trắng mà không báo lỗi.
 * - **Legacy 1.x** — `schema: 'block_editor'` + `version: 1|2`, all camelCase,
 *   block content may be flat (we auto-wrap into DeviceVariants).
 */
export function parseCanvas(
  data: Record<string, unknown> | undefined | null
): BlockEditorCanvas | null {
  if (!data || typeof data !== 'object') return null;

  const sv =
    (data as { schema_version?: unknown; schemaVersion?: unknown })
      .schema_version ?? (data as { schemaVersion?: unknown }).schemaVersion;
  const legacySchema = (data as { schema?: unknown }).schema;

  const is20 = sv === '2.0' || sv === 2 || sv === '2';
  const is10 = sv === '1.0' || sv === 1 || sv === '1';
  const isLegacy = legacySchema === LEGACY_SCHEMA;
  if (!is20 && !is10 && !isLegacy) return null;

  const rawBlocks = (data as { blocks?: unknown }).blocks;
  if (!Array.isArray(rawBlocks)) return null;

  // Block fields are camelCase in both formats; legacy may have flat content
  // (no DeviceVariants) — `migrateBlockV1toV2` wraps when needed and is a
  // no-op on already-wrapped 2.0 blocks (via the `isVariants` guard).
  const blocks: Block[] = rawBlocks.map(b =>
    migrateBlockV1toV2(b as Record<string, unknown>)
  );

  const publishRaw = (data as { publish?: PublishMeta }).publish;
  const publish =
    publishRaw &&
    typeof publishRaw === 'object' &&
    typeof publishRaw.shareToken === 'string'
      ? publishRaw
      : undefined;

  // BE 2.0 sends `active_block_id` (snake) at top; legacy used `activeBlockId`.
  const activeBlockId =
    (data as { active_block_id?: string; activeBlockId?: string })
      .active_block_id ?? (data as { activeBlockId?: string }).activeBlockId;

  const transition =
    typeof (data as { transition?: unknown }).transition === 'string'
      ? (data as { transition: string }).transition
      : undefined;

  const rawPages = (data as { pages?: unknown }).pages;
  const activePageIdRaw =
    (data as { active_page_id?: string }).active_page_id ??
    (data as { activePageId?: string }).activePageId;

  let pages: EditorPage[];
  if (Array.isArray(rawPages) && rawPages.length > 0) {
    pages = normalizePages(
      (rawPages as CanvasPageWire[]).map((p, i) => {
        const isHome = p.isHome ?? p.is_home ?? false;
        return {
          id: String(p.id ?? `p_${i}`),
          name: String(p.name ?? `Trang ${i + 1}`),
          slug: String(p.slug ?? ''),
          isHome,
          // A home entry with NO `blocks` key means the blueprint used the
          // "home lives at root" layout instead of the mirror. Read root
          // `blocks` rather than losing content — this is what keeps the
          // mirror decision reversible.
          blocks: Array.isArray(p.blocks)
            ? p.blocks.map(b =>
                migrateBlockV1toV2(b as Record<string, unknown>)
              )
            : isHome
              ? blocks
              : [],
          ...(p.seo ? { seo: p.seo } : {}),
        };
      })
    );
    if (process.env.NODE_ENV !== 'production') {
      const home = homePageOf(pages);
      if (blocks.length && home.blocks.length !== blocks.length) {
        // Divergence tripwire: two writers touch this document (template
        // draft + page revision). `pages` wins, but a mismatch means one of
        // them wrote a stale mirror.
        // eslint-disable-next-line no-console
        console.warn(
          '[parseCanvas] root `blocks` mirror diverges from pages[home] — pages wins.',
          { root: blocks.length, home: home.blocks.length }
        );
      }
    }
  } else {
    // Legacy blueprint → one implicit home page. Zero migration.
    pages = [
      {
        id: DEFAULT_PAGE_ID,
        name: 'Trang chủ',
        slug: '',
        isHome: true,
        blocks,
      },
    ];
  }

  const home = homePageOf(pages);
  const activePageId = pages.some(p => p.id === activePageIdRaw)
    ? (activePageIdRaw as string)
    : home.id;

  return {
    schemaVersion: SCHEMA_VERSION,
    // Legacy readers keep getting a flat blocks array = the home page.
    blocks: home.blocks,
    pages,
    activePageId,
    activeBlockId,
    ...(publish ? { publish } : {}),
    ...(transition ? { transition } : {}),
  };
}

/**
 * Wrap legacy 1.0 block fields into 2.0 DeviceVariants shape. Mobile is left
 * unset so the renderer falls back to desktop until the user customizes.
 * No-op when block already has DeviceVariants (e.g. parsed 2.0 input).
 *
 * Exported: các nơi parse `Block.settings` (BE) → editor Block dùng chung để
 * settings dạng cũ (content phẳng, chưa bọc {desktop}) không crash preview.
 */
export function migrateBlockV1toV2(b: Record<string, unknown>): Block {
  const wrap = <T>(value: T | undefined): DeviceVariants<T> | undefined =>
    value === undefined ? undefined : { desktop: value };

  const contentVi = b.contentVi as
    BlockContent | DeviceVariants<BlockContent> | undefined;
  const contentEn = b.contentEn as
    BlockContent | DeviceVariants<BlockContent> | undefined;
  const elementStyles = b.elementStyles as
    ElementStylesMap | DeviceVariants<ElementStylesMap> | undefined;
  const background = b.background as
    BlockBackground | DeviceVariants<BlockBackground> | undefined;
  const elementOrder = b.elementOrder as
    string[] | DeviceVariants<string[]> | undefined;

  return {
    id: String(b.id ?? ''),
    blockType: b.blockType as Block['blockType'],
    name: String(b.name ?? ''),
    isVisible: b.isVisible !== false,
    thumbnail: b.thumbnail as string | undefined,
    contentVi: isVariants(contentVi)
      ? contentVi
      : { desktop: (contentVi ?? {}) as BlockContent },
    contentEn: isVariants(contentEn)
      ? contentEn
      : { desktop: (contentEn ?? {}) as BlockContent },
    elementStyles: isVariants(elementStyles)
      ? elementStyles
      : wrap(elementStyles),
    background: isVariants(background) ? background : wrap(background),
    elementOrder: isVariants(elementOrder) ? elementOrder : wrap(elementOrder),
    extraElements: Array.isArray(b.extraElements)
      ? (b.extraElements as Block['extraElements'])
      : undefined,
    motion: migrateMotion(b.motion),
  };
}

/**
 * Translate persisted `motion` field to the new track-based shape.
 *
 * - 2.0+ tracks payload (`{ tracks: [...] }`) passes through.
 * - Legacy preset payload (`{ block: { presetId, ... } }` per device) is
 *   dropped — the preset library was removed when motion went track-based,
 *   so we have nothing to translate to. Returning `undefined` leaves the
 *   block animation-free; the editor (Phase 3 timeline UI) will let users
 *   re-author from scratch.
 */
function migrateMotion(raw: unknown): Block['motion'] {
  if (!raw || typeof raw !== 'object') return undefined;
  const variants = raw as Record<string, unknown>;
  const next: { desktop: BlockMotionStored; mobile?: BlockMotionStored } = {
    desktop: { tracks: [], duration: 0, enabled: false },
  };
  let hasAny = false;
  for (const variant of ['desktop', 'mobile'] as const) {
    const v = variants[variant];
    if (!v || typeof v !== 'object') continue;
    if (Array.isArray((v as { tracks?: unknown }).tracks)) {
      next[variant] = v as BlockMotionStored;
      hasAny = true;
    }
    // Legacy `{ block, elements }` preset shape is intentionally skipped.
  }
  return hasAny ? next : undefined;
}

function isVariants<T>(v: unknown): v is DeviceVariants<T> {
  return (
    !!v &&
    typeof v === 'object' &&
    !Array.isArray(v) &&
    'desktop' in (v as Record<string, unknown>)
  );
}

// `seedBlocks()` lives in `./mock` — keeping it here dragged the mock's image
// asset imports into every consumer of this otherwise pure data module.
