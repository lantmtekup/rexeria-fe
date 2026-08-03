import type {
  MediaAsset,
  MediaFilters,
  MediaFolderGroup,
} from '@/lib/portal-v2/media/types';

export const MOCK_STORAGE = { usedPct: 34, cap: '250 GB' };

export const cloneMediaAssets = (assets: MediaAsset[]): MediaAsset[] =>
  structuredClone(assets);

const inFolder = (asset: MediaAsset, folder: string): boolean => {
  if (folder === 'all') return true;
  if (folder === 'products') return asset.home.scope === 'product';
  if (folder === 'campaigns') return asset.home.scope === 'campaign';
  if (folder === 'brand') return asset.home.scope === 'brand';
  if (folder === 'unfiled') return asset.home.scope === 'unfiled';
  const [kind, ref] = folder.split('-');
  if (kind === 'p')
    return asset.home.scope === 'product' && asset.home.ref === ref;
  if (kind === 'c')
    return asset.home.scope === 'campaign' && asset.home.ref === ref;
  return true;
};

export const filterMediaAssets = (
  assets: MediaAsset[],
  filters: MediaFilters
): MediaAsset[] => {
  const q = filters.q.trim().toLowerCase();
  return assets.filter(
    a =>
      (filters.kind === 'all' || a.kind === filters.kind) &&
      (filters.status === 'all' || a.status === filters.status) &&
      inFolder(a, filters.folder) &&
      (filters.use === 'all' || a.uses.includes(filters.use)) &&
      (!q ||
        a.name.toLowerCase().includes(q) ||
        a.alt.toLowerCase().includes(q) ||
        a.caption.toLowerCase().includes(q) ||
        a.tags.some(t => t.includes(q)))
  );
};

export const homeLabel = (asset: MediaAsset): string => {
  if (asset.home.scope === 'product') return `Products / ${asset.home.label}`;
  if (asset.home.scope === 'campaign') return `Campaigns / ${asset.home.label}`;
  if (asset.home.scope === 'brand') return 'Brand kit';
  return 'Unfiled';
};

/** Folders are derived from the assets' own homes — nothing stored separately. */
export const deriveMediaFolders = (
  assets: MediaAsset[]
): MediaFolderGroup[] => {
  const products = new Map<string, { label: string; count: number }>();
  const campaigns = new Map<string, { label: string; count: number }>();
  let brandCount = 0;
  let unfiledCount = 0;

  assets.forEach(a => {
    if (a.home.scope === 'product') {
      const cur = products.get(a.home.ref);
      products.set(a.home.ref, {
        label: a.home.label,
        count: (cur?.count ?? 0) + 1,
      });
    } else if (a.home.scope === 'campaign') {
      const cur = campaigns.get(a.home.ref);
      campaigns.set(a.home.ref, {
        label: a.home.label,
        count: (cur?.count ?? 0) + 1,
      });
    } else if (a.home.scope === 'brand') {
      brandCount += 1;
    } else {
      unfiledCount += 1;
    }
  });

  return [
    {
      labelKey: 'folderGroupProducts',
      options: [
        {
          id: 'products',
          label: 'All products',
          count: products.size
            ? [...products.values()].reduce((n, p) => n + p.count, 0)
            : 0,
        },
        ...[...products.entries()].map(([id, p]) => ({
          id: `p-${id}`,
          label: p.label,
          count: p.count,
        })),
      ],
    },
    {
      labelKey: 'folderGroupCampaigns',
      options: [
        {
          id: 'campaigns',
          label: 'All campaigns',
          count: campaigns.size
            ? [...campaigns.values()].reduce((n, c) => n + c.count, 0)
            : 0,
        },
        ...[...campaigns.entries()].map(([id, c]) => ({
          id: `c-${id}`,
          label: c.label,
          count: c.count,
        })),
      ],
    },
    {
      labelKey: 'folderGroupLibrary',
      options: [
        { id: 'brand', label: 'Brand kit', count: brandCount },
        { id: 'unfiled', label: 'Unfiled', count: unfiledCount },
      ],
    },
  ];
};
