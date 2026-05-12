import { MOCK_BLOCKS } from './mock';
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

/** In-memory canvas shape (camelCase). Wire format is snake_case — see (de)serialize. */
export interface BlockEditorCanvas {
  schemaVersion: typeof SCHEMA_VERSION;
  blocks: Block[];
  activeBlockId?: string;
  publish?: PublishMeta;
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
  publish?: PublishMeta
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
 * Parse `canvas_data` from REXER into the in-memory `BlockEditorCanvas`.
 * Returns `null` if data is missing or doesn't look like a block-editor canvas.
 *
 * Accepts wire shapes:
 * - **2.0** (current) — `schema_version: "2.0"` top-level + camelCase block
 *   fields (matching BE validator). `active_block_id` snake_case at top.
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
  const isLegacy = legacySchema === LEGACY_SCHEMA;
  if (!is20 && !isLegacy) return null;

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

  return {
    schemaVersion: SCHEMA_VERSION,
    blocks,
    activeBlockId,
    ...(publish ? { publish } : {}),
  };
}

/**
 * Wrap legacy 1.0 block fields into 2.0 DeviceVariants shape. Mobile is left
 * unset so the renderer falls back to desktop until the user customizes.
 * No-op when block already has DeviceVariants (e.g. parsed 2.0 input).
 */
function migrateBlockV1toV2(b: Record<string, unknown>): Block {
  const wrap = <T>(value: T | undefined): DeviceVariants<T> | undefined =>
    value === undefined ? undefined : { desktop: value };

  const contentVi = b.contentVi as
    | BlockContent
    | DeviceVariants<BlockContent>
    | undefined;
  const contentEn = b.contentEn as
    | BlockContent
    | DeviceVariants<BlockContent>
    | undefined;
  const elementStyles = b.elementStyles as
    | ElementStylesMap
    | DeviceVariants<ElementStylesMap>
    | undefined;
  const background = b.background as
    | BlockBackground
    | DeviceVariants<BlockBackground>
    | undefined;
  const elementOrder = b.elementOrder as
    | string[]
    | DeviceVariants<string[]>
    | undefined;

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

export function seedBlocks(): Block[] {
  // Deep clone so edits don't mutate the shared mock.
  return JSON.parse(JSON.stringify(MOCK_BLOCKS)) as Block[];
}
