/**
 * Merge AI-proposed blocks into the user's original blocks based on a per-
 * (block, group) accept map. Used by ReviewChangesDialog → "Apply N/M".
 *
 * Pairing rule: per-(blockId, group) — accepting a group copies ALL of that
 * group's fields from the AI block. Rejecting keeps the original. We picked
 * group-level granularity (L2) over per-field to match the dialog UI.
 */
import type { DiffGroup } from './diffCanvas';
import type {
  Block,
  BlockContent,
} from '@/components/modules/block-editor/types';

export type AcceptMap = Map<string /* blockId */, Set<DiffGroup>>;

const KEY_TO_GROUP: Record<string, DiffGroup> = {
  eyebrow: 'text',
  title: 'text',
  tag: 'text',
  description: 'text',
  subtitle: 'text',
  imageUrl: 'image',
  imageTransform: 'image',
  backgroundUrl: 'image',
  backgroundTransform: 'image',
  stats: 'list',
  features: 'list',
  photos: 'list',
  reasons: 'list',
  ctaText: 'cta',
  ctaLink: 'cta',
  primaryText: 'cta',
  primaryLink: 'cta',
  secondaryText: 'cta',
  secondaryLink: 'cta',
  submitText: 'cta',
  noteText: 'cta',
};

function groupOf(key: string): DiffGroup {
  return KEY_TO_GROUP[key] ?? 'text';
}

/**
 * Merge a single content slice (one lang × one variant) per the accept map.
 * - Keys whose group is in `acceptedGroups` come from `aiContent`.
 * - All other keys come from `originalContent` (unchanged for the user).
 */
function mergeContent(
  originalContent: BlockContent | undefined,
  aiContent: BlockContent | undefined,
  acceptedGroups: Set<DiffGroup>
): BlockContent {
  const orig = (originalContent ?? {}) as Record<string, unknown>;
  const ai = (aiContent ?? {}) as Record<string, unknown>;
  const out: Record<string, unknown> = { ...orig };

  // For accepted groups: pull every key in that group from AI (including
  // ones the original didn't have). For non-accepted groups: preserve orig.
  for (const key of Object.keys(ai)) {
    if (acceptedGroups.has(groupOf(key))) {
      out[key] = ai[key];
    }
  }
  // Drop keys that AI explicitly removed in an accepted group.
  for (const key of Object.keys(orig)) {
    if (acceptedGroups.has(groupOf(key)) && !(key in ai)) {
      delete out[key];
    }
  }
  return out as BlockContent;
}

/**
 * Build the merged block list. Walk both sides matched by id; for each
 * matched pair, merge content (vi + en, desktop variant — that's what the
 * diff covers). Blocks not in `aiBlocks` keep original verbatim. Blocks
 * only in `aiBlocks` are appended in their relative order (entire block
 * accepted iff its id appears in `accept` with any group).
 */
export function mergeAcceptedChanges(
  originalBlocks: Block[],
  aiBlocks: Block[],
  accept: AcceptMap
): Block[] {
  const aiById = new Map(aiBlocks.map(b => [b.id, b]));
  const originalIds = new Set(originalBlocks.map(b => b.id));

  // 1. Walk originals — merge each with its AI counterpart per accept map.
  const merged: Block[] = originalBlocks.map(orig => {
    const ai = aiById.get(orig.id);
    if (!ai) return orig; // AI dropped this block — user keeps it.
    const groups = accept.get(orig.id);
    if (!groups || groups.size === 0) return orig; // user rejected everything

    return {
      ...orig,
      contentVi: {
        ...orig.contentVi,
        desktop: mergeContent(
          orig.contentVi.desktop,
          ai.contentVi.desktop,
          groups
        ),
        ...(orig.contentVi.mobile !== undefined ||
        ai.contentVi.mobile !== undefined
          ? {
              mobile: mergeContent(
                orig.contentVi.mobile,
                ai.contentVi.mobile,
                groups
              ),
            }
          : {}),
      },
      contentEn: {
        ...orig.contentEn,
        desktop: mergeContent(
          orig.contentEn.desktop,
          ai.contentEn.desktop,
          groups
        ),
        ...(orig.contentEn.mobile !== undefined ||
        ai.contentEn.mobile !== undefined
          ? {
              mobile: mergeContent(
                orig.contentEn.mobile,
                ai.contentEn.mobile,
                groups
              ),
            }
          : {}),
      },
    };
  });

  // 2. Append AI-only blocks the user accepted.
  for (const aiBlock of aiBlocks) {
    if (originalIds.has(aiBlock.id)) continue;
    const groups = accept.get(aiBlock.id);
    if (groups && groups.size > 0) {
      merged.push(aiBlock);
    }
  }

  return merged;
}
