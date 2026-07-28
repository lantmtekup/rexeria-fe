import {
  BLOCK_TYPE_META,
  type BlockCategory,
  type BlockType,
} from '@/components/modules/block-editor/types';

/** Thứ tự hiển thị category trong filter popover. */
export const BLOCK_CATEGORY_ORDER: BlockCategory[] = [
  'hero',
  'intro',
  'navigation',
  'header',
  'feature',
  'gallery',
  'location',
  'floorplan',
  'amenity',
  'pricing',
  'progress',
  'trust',
  'form',
  'cta',
  'listing',
  'portfolio',
  'services',
  'interactive',
  'blog',
  'marquee',
  'faq',
  'footer',
  'urgency',
];

export const BLOCK_CATEGORY_LABEL: Record<BlockCategory, string> = {
  hero: 'Hero',
  intro: 'Intro',
  location: 'Location',
  floorplan: 'Floorplan',
  amenity: 'Amenity',
  gallery: 'Gallery',
  pricing: 'Pricing',
  progress: 'Progress',
  trust: 'Trust',
  form: 'Form',
  urgency: 'Urgency',
  faq: 'FAQ',
  header: 'Header',
  footer: 'Footer',
  navigation: 'Navigation',
  cta: 'CTA',
  feature: 'Feature',
  listing: 'Listing',
  portfolio: 'Portfolio',
  services: 'Services',
  interactive: 'Interactive',
  blog: 'Blog',
  marquee: 'Marquee',
};

export interface ResolvedTypeMeta {
  category: BlockCategory | null;
  categoryLabel: string | null;
  adminLabel: string;
  gradient: string;
}

export function resolveTypeMeta(typeCode: string): ResolvedTypeMeta | null {
  const meta = BLOCK_TYPE_META[typeCode as BlockType];
  if (!meta) return null;
  const category = meta.category ?? null;
  return {
    category,
    categoryLabel: category ? BLOCK_CATEGORY_LABEL[category] : null,
    adminLabel: meta.adminLabel,
    gradient: meta.gradient,
  };
}

export interface LibraryTypeEntry {
  code: string;
  label: string;
  count: number;
  category: BlockCategory | null;
  categoryLabel: string | null;
}

export interface LibraryTypeIndex {
  counts: Record<string, number>;
  duplicateCodes: Set<string>;
  /** Tổng số row thuộc mapping code có ≥2 block (đếm record, không đếm code). */
  duplicateRecordCount: number;
  byCategory: Map<BlockCategory, LibraryTypeEntry[]>;
  orphanEntries: LibraryTypeEntry[];
  /** Số block theo category (để filter Loại). */
  categoryCounts: Partial<Record<BlockCategory, number>>;
  orphanCount: number;
}

/** Index type_code trong thư viện saved blocks (chỉ code đang có data). */
export function buildLibraryTypeIndex(
  items: Array<{ type_code: string }>
): LibraryTypeIndex {
  const counts: Record<string, number> = {};
  for (const it of items) {
    counts[it.type_code] = (counts[it.type_code] ?? 0) + 1;
  }

  const duplicateCodes = new Set(
    Object.entries(counts)
      .filter(([, n]) => n > 1)
      .map(([code]) => code)
  );

  let duplicateRecordCount = 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [code, count] of Object.entries(counts)) {
    if (count > 1) duplicateRecordCount += count;
  }

  const byCategory = new Map<BlockCategory, LibraryTypeEntry[]>();
  const orphanEntries: LibraryTypeEntry[] = [];
  const categoryCounts: Partial<Record<BlockCategory, number>> = {};
  let orphanCount = 0;

  for (const [code, count] of Object.entries(counts)) {
    const meta = resolveTypeMeta(code);
    const entry: LibraryTypeEntry = {
      code,
      label: meta?.adminLabel ?? code,
      count,
      category: meta?.category ?? null,
      categoryLabel: meta?.categoryLabel ?? null,
    };

    if (!meta?.category) {
      orphanEntries.push(entry);
      orphanCount += count;
      continue;
    }

    categoryCounts[meta.category] =
      (categoryCounts[meta.category] ?? 0) + count;

    const list = byCategory.get(meta.category) ?? [];
    list.push(entry);
    byCategory.set(meta.category, list);
  }

  for (const [, list] of byCategory) {
    list.sort((a, b) => a.code.localeCompare(b.code));
  }
  orphanEntries.sort((a, b) => a.code.localeCompare(b.code));

  return {
    counts,
    duplicateCodes,
    duplicateRecordCount,
    byCategory,
    orphanEntries,
    categoryCounts,
    orphanCount,
  };
}

export type LibraryCategoryFilter = BlockCategory | 'orphan' | 'all';

export function parseLibraryCategoryFilter(
  raw: string | null | undefined
): LibraryCategoryFilter {
  if (!raw || raw === 'all') return 'all';
  if (raw === 'orphan') return 'orphan';
  if ((BLOCK_CATEGORY_ORDER as string[]).includes(raw)) {
    return raw as BlockCategory;
  }
  return 'all';
}

export function blockMatchesCategoryFilter(
  typeCode: string,
  filter: LibraryCategoryFilter
): boolean {
  if (filter === 'all') return true;
  const meta = resolveTypeMeta(typeCode);
  if (filter === 'orphan') return !meta?.category;
  return meta?.category === filter;
}

export interface MappingCodeGroup<T extends { type_code: string }> {
  typeCode: string;
  items: T[];
}

/** Sắp xếp block cùng mapping code liền kề (code → tên). */
export function sortBlocksByMappingCode<
  T extends { type_code: string; name?: string },
>(blocks: T[]): T[] {
  return [...blocks].sort((a, b) => {
    const byCode = a.type_code.localeCompare(b.type_code);
    if (byCode !== 0) return byCode;
    return (a.name ?? '').localeCompare(b.name ?? '');
  });
}

/** Gom các block liền kề có cùng type_code (input nên đã sort trước). */
export function groupAdjacentByMappingCode<T extends { type_code: string }>(
  blocks: T[]
): MappingCodeGroup<T>[] {
  const groups: MappingCodeGroup<T>[] = [];
  for (const block of blocks) {
    const last = groups[groups.length - 1];
    if (last?.typeCode === block.type_code) {
      last.items.push(block);
    } else {
      groups.push({ typeCode: block.type_code, items: [block] });
    }
  }
  return groups;
}
