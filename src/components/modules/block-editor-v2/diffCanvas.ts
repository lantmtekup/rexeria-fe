/**
 * Compute a per-block, per-group diff between two block lists so the
 * ReviewChangesDialog can show the user what AI proposed and let them
 * accept/reject changes selectively (L2 granularity — see plan).
 *
 * Groups (per block):
 *   - text   — single-string fields (title, description, eyebrow, …)
 *   - image  — *imageUrl, backgroundUrl + their transforms
 *   - list   — stats, features, photos, reasons
 *   - cta    — ctaText/ctaLink, primaryText/primaryLink, secondaryText/Link,
 *              submitText, noteText
 *
 * Output is keyed by `block_id` so the merge step can quickly look up
 * which groups the user accepted.
 */
import {
  readVariant,
  type Block,
  type BlockContent,
  type Lang,
} from '@/components/modules/block-editor/types';

export type DiffGroup = 'text' | 'image' | 'list' | 'cta';

export interface FieldDiff {
  /** The content key (e.g. "title", "imageUrl", "stats", "ctaText"). */
  key: string;
  /** Old value (from snapshot — what the user had). */
  oldValue: unknown;
  /** New value (what AI proposed). */
  newValue: unknown;
  /** Status — added means missing in old; removed means missing in new. */
  status: 'changed' | 'added' | 'removed';
}

export interface BlockGroupDiff {
  group: DiffGroup;
  fields: FieldDiff[];
}

export interface BlockDiff {
  blockId: string;
  blockType: Block['blockType'];
  blockName: string;
  groups: BlockGroupDiff[];
  /** True if block exists in `next` but not in `prev` — entire block is new. */
  isNew: boolean;
  /** True if block exists in `prev` but not in `next` — entire block was dropped. */
  isRemoved: boolean;
}

export interface CanvasDiff {
  blocks: BlockDiff[];
  /** Total number of changed fields across all blocks (for "Accept N/M" UI). */
  totalChanges: number;
}

// ─── Field → group map ────────────────────────────────────────────────────

/**
 * Classify each known content key into a group. Keys not in the map fall
 * into `text` by default (most likely a string field we haven't seen yet).
 */
const KEY_TO_GROUP: Record<string, DiffGroup> = {
  // text
  eyebrow: 'text',
  title: 'text',
  tag: 'text',
  description: 'text',
  subtitle: 'text',
  // image
  imageUrl: 'image',
  imageTransform: 'image',
  backgroundUrl: 'image',
  backgroundTransform: 'image',
  // list
  stats: 'list',
  features: 'list',
  photos: 'list',
  reasons: 'list',
  // cta
  ctaText: 'cta',
  ctaLink: 'cta',
  primaryText: 'cta',
  primaryLink: 'cta',
  secondaryText: 'cta',
  secondaryLink: 'cta',
  submitText: 'cta',
  noteText: 'cta',
};

const GROUP_ORDER: DiffGroup[] = ['text', 'image', 'list', 'cta'];

function groupOf(key: string): DiffGroup {
  return KEY_TO_GROUP[key] ?? 'text';
}

// ─── Equality check ───────────────────────────────────────────────────────

/**
 * Stable structural equality — JSON.stringify is fine for our content (no
 * circular refs, deterministic key order in V8). This avoids pulling lodash
 * just for one helper.
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

// ─── Resolve content for diff ─────────────────────────────────────────────

/**
 * Pull the desktop variant for the given lang. Diff operates on a single
 * lang × variant slice — running it twice (vi/en) and twice (mobile/desktop)
 * is overkill for the review dialog. The default is whatever the user is
 * currently editing, passed in by the caller.
 */
function readContent(block: Block, lang: Lang): BlockContent | undefined {
  const variants = lang === 'vi' ? block.contentVi : block.contentEn;
  return readVariant(variants, 'desktop');
}

// ─── Main diff ────────────────────────────────────────────────────────────

/**
 * Compute the diff. `lang` controls which language slice is compared. The
 * result is grouped per-block and per-DiffGroup; empty groups are dropped.
 */
export function diffCanvas(
  prev: Block[],
  next: Block[],
  lang: Lang
): CanvasDiff {
  const prevById = new Map(prev.map(b => [b.id, b]));
  const nextById = new Map(next.map(b => [b.id, b]));
  const allIds = new Set([...prevById.keys(), ...nextById.keys()]);

  const out: BlockDiff[] = [];
  let totalChanges = 0;

  for (const id of allIds) {
    const prevBlock = prevById.get(id);
    const nextBlock = nextById.get(id);

    if (!nextBlock) {
      // Block dropped by AI — uncommon but track so user can rollback.
      out.push({
        blockId: id,
        blockType: prevBlock!.blockType,
        blockName: prevBlock!.name,
        groups: [],
        isNew: false,
        isRemoved: true,
      });
      continue;
    }
    if (!prevBlock) {
      // Block added by AI — show every field as "added".
      const c = readContent(nextBlock, lang) ?? {};
      const fieldsByGroup = new Map<DiffGroup, FieldDiff[]>();
      for (const [key, v] of Object.entries(c)) {
        if (v === undefined || v === null || v === '') continue;
        const g = groupOf(key);
        if (!fieldsByGroup.has(g)) fieldsByGroup.set(g, []);
        fieldsByGroup
          .get(g)!
          .push({ key, oldValue: undefined, newValue: v, status: 'added' });
        totalChanges++;
      }
      out.push({
        blockId: id,
        blockType: nextBlock.blockType,
        blockName: nextBlock.name,
        groups: GROUP_ORDER.flatMap(g =>
          fieldsByGroup.has(g)
            ? [{ group: g, fields: fieldsByGroup.get(g)! }]
            : []
        ),
        isNew: true,
        isRemoved: false,
      });
      continue;
    }

    // Both sides have the block — diff field-by-field.
    const prevContent = (readContent(prevBlock, lang) ?? {}) as Record<
      string,
      unknown
    >;
    const nextContent = (readContent(nextBlock, lang) ?? {}) as Record<
      string,
      unknown
    >;
    const allKeys = new Set([
      ...Object.keys(prevContent),
      ...Object.keys(nextContent),
    ]);
    const fieldsByGroup = new Map<DiffGroup, FieldDiff[]>();

    for (const key of allKeys) {
      const oldValue = prevContent[key];
      const newValue = nextContent[key];
      if (deepEqual(oldValue, newValue)) continue;
      // Skip "added" when both sides are effectively empty.
      const oldEmpty = oldValue === undefined || oldValue === '';
      const newEmpty = newValue === undefined || newValue === '';
      if (oldEmpty && newEmpty) continue;

      const status: FieldDiff['status'] = oldEmpty
        ? 'added'
        : newEmpty
          ? 'removed'
          : 'changed';
      const g = groupOf(key);
      if (!fieldsByGroup.has(g)) fieldsByGroup.set(g, []);
      fieldsByGroup.get(g)!.push({ key, oldValue, newValue, status });
      totalChanges++;
    }

    if (fieldsByGroup.size === 0) continue; // unchanged block — skip
    out.push({
      blockId: id,
      blockType: nextBlock.blockType,
      blockName: nextBlock.name,
      groups: GROUP_ORDER.flatMap(g =>
        fieldsByGroup.has(g)
          ? [{ group: g, fields: fieldsByGroup.get(g)! }]
          : []
      ),
      isNew: false,
      isRemoved: false,
    });
  }

  return { blocks: out, totalChanges };
}

// ─── Field labels (for UI) ────────────────────────────────────────────────

/**
 * Pretty Vietnamese label for each known content key. Falls back to the raw
 * key when not found so the dialog always shows something even for keys we
 * haven't curated.
 */
export const FIELD_LABEL: Record<string, string> = {
  eyebrow: 'Eyebrow',
  title: 'Tiêu đề',
  tag: 'Tag',
  description: 'Mô tả',
  subtitle: 'Subtitle',
  imageUrl: 'Ảnh',
  imageTransform: 'Crop ảnh',
  backgroundUrl: 'Ảnh nền',
  backgroundTransform: 'Crop ảnh nền',
  stats: 'Thống kê',
  features: 'Danh sách tính năng',
  photos: 'Bộ ảnh',
  reasons: 'Lý do',
  ctaText: 'Nút CTA',
  ctaLink: 'Link CTA',
  primaryText: 'CTA chính',
  primaryLink: 'Link CTA chính',
  secondaryText: 'CTA phụ',
  secondaryLink: 'Link CTA phụ',
  submitText: 'Nút gửi',
  noteText: 'Ghi chú',
};

export const GROUP_LABEL: Record<DiffGroup, string> = {
  text: 'Text',
  image: 'Ảnh',
  list: 'Danh sách',
  cta: 'CTA / nút',
};
