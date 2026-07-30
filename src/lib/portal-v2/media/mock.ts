import type {
  MediaAsset,
  MediaFilters,
  MediaFolderGroup,
} from '@/lib/portal-v2/media/types';

/** Prototype mock — Ilia Beauty asset library from rexer-platform-v2.html (DATA.assets) */
export const MOCK_ASSETS: MediaAsset[] = [
  {
    id: 'a1',
    name: 'serum-hero-01.jpg',
    kind: 'IMG',
    mime: 'image/jpeg',
    home: {
      scope: 'product',
      ref: 'p1',
      label: 'Super Serum Skin Tint SPF 40',
    },
    size: '2.4 MB',
    dims: '4096 × 4096',
    role: 'ATT',
    status: 'approved',
    version: 3,
    owner: 'Maya Okonjo',
    updated: '2 days ago',
    alt: 'Super Serum Skin Tint bottle on a neutral backdrop, dropper visible',
    caption: 'Hero pack shot — studio, autumn ’25 shoot',
    tags: ['hero', 'packshot', 'studio'],
    rights: {
      licence: 'Owned',
      source: 'Studio shoot',
      holder: 'Ilia Beauty',
      release: 'n/a',
      expires: null,
      territories: 'Worldwide',
    },
    uses: ['product'],
    links: [
      {
        type: 'product',
        label: 'Super Serum Skin Tint SPF 40',
        meta: 'Product · Skincare',
      },
    ],
    assisted: { sessions: 18420, uses: 3, lift: 0.19 },
  },
  {
    id: 'a2',
    name: 'serum-360.glb',
    kind: 'D3',
    mime: 'model/gltf-binary',
    home: {
      scope: 'product',
      ref: 'p1',
      label: 'Super Serum Skin Tint SPF 40',
    },
    size: '8.1 MB',
    dims: '184k tris · PBR',
    role: 'EXP',
    status: 'approved',
    version: 2,
    owner: 'Toan Nguyen',
    updated: '1 week ago',
    alt: 'Interactive 3D model of the Super Serum bottle',
    caption: 'Scanned from the production unit, decimated for web',
    tags: ['3d', 'hero', 'ar-ready'],
    rights: {
      licence: 'Owned',
      source: '3D scan',
      holder: 'Ilia Beauty',
      release: 'n/a',
      expires: null,
      territories: 'Worldwide',
    },
    uses: ['product'],
    links: [
      {
        type: 'product',
        label: 'Super Serum Skin Tint SPF 40',
        meta: 'Product · Skincare',
      },
    ],
    assisted: null,
  },
  {
    id: 'a3',
    name: 'texture-swatch.mp4',
    kind: 'VID',
    mime: 'video/mp4',
    home: {
      scope: 'product',
      ref: 'p1',
      label: 'Super Serum Skin Tint SPF 40',
    },
    size: '14 MB',
    dims: '1080 × 1920 · 0:12',
    role: 'EDU',
    status: 'approved',
    version: 1,
    owner: 'Maya Okonjo',
    updated: '2 weeks ago',
    alt: 'Close-up of the tint being blended into skin',
    caption: 'Texture demo, vertical cut for Reels',
    tags: ['texture', 'vertical', 'demo'],
    rights: {
      licence: 'Owned',
      source: 'Studio shoot',
      holder: 'Ilia Beauty',
      release: 'n/a',
      expires: null,
      territories: 'Worldwide',
    },
    uses: ['product'],
    links: [
      {
        type: 'product',
        label: 'Super Serum Skin Tint SPF 40',
        meta: 'Product · Skincare',
      },
    ],
    assisted: null,
  },
  {
    id: 'a4',
    name: 'ugc-reel-jenna.mp4',
    kind: 'VID',
    mime: 'video/mp4',
    home: { scope: 'campaign', ref: 'm2', label: 'Spring Sale' },
    size: '22 MB',
    dims: '1080 × 1920 · 0:28',
    role: 'TRU',
    status: 'expiring',
    version: 1,
    owner: 'Maya Okonjo',
    updated: '3 days ago',
    alt: 'Creator applying the skin tint and giving a to-camera review',
    caption: 'Paid creator content — Jenna R.',
    tags: ['ugc', 'creator', 'review', 'paid'],
    rights: {
      licence: 'Licensed',
      source: 'Creator (paid)',
      holder: 'Jenna R.',
      release: 'Signed — talent release on file',
      expires: '2026-09-30',
      territories: 'US + CA, paid social only',
    },
    uses: ['campaign'],
    links: [
      { type: 'campaign', label: 'Spring Sale', meta: 'Campaign · Sale' },
    ],
    assisted: null,
  },
  {
    id: 'a5',
    name: 'shade-chart.png',
    kind: 'IMG',
    mime: 'image/png',
    home: {
      scope: 'product',
      ref: 'p1',
      label: 'Super Serum Skin Tint SPF 40',
    },
    size: '1.1 MB',
    dims: '2400 × 1600',
    role: 'EXP',
    status: 'approved',
    version: 4,
    owner: 'Toan Nguyen',
    updated: 'yesterday',
    alt: 'All 30 shades swatched on four skin tones',
    caption: 'Shade grid — updated for the 2026 range',
    tags: ['swatch', 'shade', 'reference'],
    rights: {
      licence: 'Owned',
      source: 'Design',
      holder: 'Ilia Beauty',
      release: 'n/a',
      expires: null,
      territories: 'Worldwide',
    },
    uses: ['product'],
    links: [
      {
        type: 'product',
        label: 'Super Serum Skin Tint SPF 40',
        meta: 'Product · Skincare',
      },
    ],
    assisted: { sessions: 6240, uses: 1, lift: 0.08 },
  },
  {
    id: 'a6',
    name: 'launch-key-art.psd',
    kind: 'IMG',
    mime: 'image/vnd.adobe.photoshop',
    home: { scope: 'campaign', ref: 'm1', label: 'Super Serum Launch' },
    size: '48 MB',
    dims: '6000 × 4000',
    role: 'ATT',
    status: 'review',
    version: 2,
    owner: 'Maya Okonjo',
    updated: '4 hours ago',
    alt: 'Layered key art for the Super Serum launch',
    caption: 'Master file — not for web delivery',
    tags: ['key-art', 'master', 'layered'],
    rights: {
      licence: 'Owned',
      source: 'Agency',
      holder: 'Ilia Beauty',
      release: 'n/a',
      expires: null,
      territories: 'Worldwide',
    },
    uses: ['campaign'],
    links: [
      {
        type: 'campaign',
        label: 'Super Serum Launch',
        meta: 'Campaign · Launch',
      },
    ],
    assisted: null,
  },
  {
    id: 'a7',
    name: 'logo-lockup.svg',
    kind: 'IMG',
    mime: 'image/svg+xml',
    home: { scope: 'brand' },
    size: '12 KB',
    dims: 'vector',
    role: 'TRU',
    status: 'approved',
    version: 1,
    owner: 'Toan Nguyen',
    updated: '6 months ago',
    alt: 'Ilia Beauty primary logo lockup',
    caption: 'Primary mark. Do not recolour.',
    tags: ['logo', 'brand', 'vector', 'locked'],
    rights: {
      licence: 'Owned',
      source: 'Brand',
      holder: 'Ilia Beauty',
      release: 'n/a',
      expires: null,
      territories: 'Worldwide',
    },
    uses: ['brand'],
    links: [],
    assisted: null,
  },
  {
    id: 'a8',
    name: 'clinical-claims.pdf',
    kind: 'DOC',
    mime: 'application/pdf',
    home: { scope: 'brand' },
    size: '640 KB',
    dims: '8 pages',
    role: 'TRU',
    status: 'approved',
    version: 2,
    owner: 'Toan Nguyen',
    updated: '1 month ago',
    alt: 'Third-party clinical testing results for SPF 40 and niacinamide claims',
    caption: 'Legal-approved claims. Cite verbatim only.',
    tags: ['claims', 'legal', 'clinical', 'approved-copy'],
    rights: {
      licence: 'Owned',
      source: 'Lab report',
      holder: 'Ilia Beauty',
      release: 'n/a',
      expires: null,
      territories: 'Worldwide',
    },
    uses: ['brand'],
    links: [],
    assisted: null,
  },
  {
    id: 'a9',
    name: 'compact-ar.usdz',
    kind: 'D3',
    mime: 'model/vnd.usdz+zip',
    home: { scope: 'product', ref: 'p2', label: 'Liquid Powder Blush' },
    size: '6.7 MB',
    dims: '96k tris · PBR',
    role: 'EXP',
    status: 'approved',
    version: 1,
    owner: 'Toan Nguyen',
    updated: '3 weeks ago',
    alt: 'AR-ready model of the compact for iOS Quick Look',
    caption: 'iOS AR variant of the compact',
    tags: ['3d', 'ar', 'ios'],
    rights: {
      licence: 'Owned',
      source: '3D scan',
      holder: 'Ilia Beauty',
      release: 'n/a',
      expires: null,
      territories: 'Worldwide',
    },
    uses: ['product'],
    links: [
      {
        type: 'product',
        label: 'Liquid Powder Blush',
        meta: 'Product · Colour',
      },
    ],
    assisted: null,
  },
  {
    id: 'a10',
    name: 'holiday-set-spin.360',
    kind: 'P360',
    mime: 'image/jpeg-sequence',
    home: { scope: 'campaign', ref: 'm3', label: 'Christmas 2026' },
    size: '18 MB',
    dims: '36 frames · 2048px',
    role: 'EXP',
    status: 'review',
    version: 1,
    owner: 'Maya Okonjo',
    updated: 'just now',
    alt: '360° turntable of the holiday gift set',
    caption: 'Turntable — 36 frames, 10° steps',
    tags: ['360', 'holiday', 'turntable'],
    rights: {
      licence: 'Owned',
      source: 'Studio shoot',
      holder: 'Ilia Beauty',
      release: 'n/a',
      expires: null,
      territories: 'Worldwide',
    },
    uses: ['campaign'],
    links: [
      {
        type: 'campaign',
        label: 'Christmas 2026',
        meta: 'Campaign · Seasonal',
      },
    ],
    assisted: null,
  },
  {
    id: 'a11',
    name: 'ugc-grid-q3.jpg',
    kind: 'IMG',
    mime: 'image/jpeg',
    home: { scope: 'campaign', ref: 'm4', label: 'Clean Beauty ’26' },
    size: '3.2 MB',
    dims: '3000 × 3000',
    role: 'TRU',
    status: 'archived',
    version: 1,
    owner: 'Maya Okonjo',
    updated: '5 months ago',
    alt: 'Grid of nine customer photos from the Q3 campaign',
    caption: 'Q3 UGC grid — campaign ended',
    tags: ['ugc', 'grid', 'q3', 'retired'],
    rights: {
      licence: 'Licensed',
      source: 'Customer UGC',
      holder: 'Various',
      release: 'Consent captured at submission',
      expires: '2026-03-31',
      territories: 'US only',
    },
    uses: ['campaign'],
    links: [
      {
        type: 'campaign',
        label: 'Clean Beauty ’26',
        meta: 'Campaign · Always-on',
      },
    ],
    assisted: null,
  },
  {
    id: 'a12',
    name: 'brand-voice-guide.pdf',
    kind: 'DOC',
    mime: 'application/pdf',
    home: { scope: 'brand' },
    size: '4.1 MB',
    dims: '24 pages',
    role: 'EDU',
    status: 'approved',
    version: 5,
    owner: 'Toan Nguyen',
    updated: '2 months ago',
    alt: 'Brand voice and tone guidelines',
    caption: 'The source the AI writes from',
    tags: ['brand', 'voice', 'guideline', 'ai-source'],
    rights: {
      licence: 'Owned',
      source: 'Brand',
      holder: 'Ilia Beauty',
      release: 'n/a',
      expires: null,
      territories: 'Worldwide',
    },
    uses: ['brand'],
    links: [],
    assisted: null,
  },
];

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
