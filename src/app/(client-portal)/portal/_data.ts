/* ---------- Client (top-level pháp nhân) ---------- */

export type Client = {
  id: string;
  name: string;
  legal_name: string;
  contact_email: string;
  contact_phone?: string;
  country_code: string;
  plan: 'phase1_managed';
  status: 'active';
  member_count: number;
  storage_used_gb: number;
  storage_quota_gb: number;
};

/**
 * NOTE: brand demo neutral để pitch sales an toàn (không vi phạm trademark).
 * Khi cần demo realistic với client thật, đổi lại tên + slug.
 */
export const FAKE_CLIENT: Client = {
  id: 'cli_acme_group',
  name: 'ACME Beverage Group',
  legal_name: 'ACME Beverage Group Co., Ltd.',
  contact_email: 'ops@acmebev.demo',
  contact_phone: '+84 28 0000 0000',
  country_code: 'VN',
  plan: 'phase1_managed',
  status: 'active',
  member_count: 8,
  storage_used_gb: 2.84,
  storage_quota_gb: 10,
};

/* ---------- Workspace (sub-brand / sub-org của client) ---------- */

export type Workspace = {
  id: string;
  client_id: string; // FK → Client.id
  slug: string;
  name: string;
  description: string;
  logo_initial: string;
  logo_color: string;
  industry?: string;
  status: 'active' | 'paused' | 'archived';
  member_count: number;
  template_count: number;
  storage_used_gb: number;
};

export const FAKE_WORKSPACES: Workspace[] = [
  {
    id: 'ws_coca_main',
    client_id: 'cli_acme_group',
    slug: 'flagship-cola',
    name: 'Flagship Cola',
    description: 'Brand chính — original + classic line',
    logo_initial: 'FC',
    logo_color: 'bg-rose-500',
    industry: 'Beverage',
    status: 'active',
    member_count: 4,
    template_count: 5,
    storage_used_gb: 1.2,
  },
  {
    id: 'ws_fanta',
    client_id: 'cli_acme_group',
    slug: 'citrus-soda',
    name: 'Citrus Soda',
    description: 'Sub-brand nước cam có ga',
    logo_initial: 'CS',
    logo_color: 'bg-orange-500',
    industry: 'Beverage',
    status: 'active',
    member_count: 3,
    template_count: 2,
    storage_used_gb: 0.84,
  },
  {
    id: 'ws_sprite',
    client_id: 'cli_acme_group',
    slug: 'lemon-fizz',
    name: 'Lemon Fizz',
    description: 'Sub-brand chanh có ga',
    logo_initial: 'LF',
    logo_color: 'bg-emerald-500',
    industry: 'Beverage',
    status: 'active',
    member_count: 2,
    template_count: 1,
    storage_used_gb: 0.42,
  },
  {
    id: 'ws_olympic',
    client_id: 'cli_acme_group',
    slug: 'sport-2026',
    name: 'Sport 2026 Campaign',
    description: 'Cross-brand campaign cho sự kiện thể thao 2026',
    logo_initial: 'S26',
    logo_color: 'bg-indigo-500',
    industry: 'Sports / Sponsorship',
    status: 'active',
    member_count: 5,
    template_count: 1,
    storage_used_gb: 0.38,
  },
];

// Default active workspace (đầu tiên trong list)
export const DEFAULT_WORKSPACE_ID = FAKE_WORKSPACES[0].id;

// Backwards-compat: legacy code reference FAKE_BRAND
export type Brand = Workspace;
export const FAKE_BRAND = FAKE_WORKSPACES[0];

export type DashboardStats = {
  templates_count: number;
  templates_published: number;
  total_views_30d: number;
  total_visitors_30d: number;
  total_clicks_30d: number;
  total_leads_30d: number;
  assets_count: number;
  open_comments: number;
  unread_notifications: number;
};

export const FAKE_STATS: DashboardStats = {
  templates_count: 12,
  templates_published: 8,
  total_views_30d: 124_820,
  total_visitors_30d: 81_240,
  total_clicks_30d: 5_620,
  total_leads_30d: 287,
  assets_count: 142,
  open_comments: 3,
  unread_notifications: 5,
};

export const FAKE_TREND_7D = [820, 1240, 980, 1450, 1320, 1820, 1690];

/* ---------- templates ---------- */

export type PortalTemplate = {
  id: string;
  workspace_id: string; // FK Workspace
  name: string;
  thumbnail_gradient: string; // tailwind gradient class
  status: 'draft' | 'published' | 'archived';
  views_30d: number;
  clicks_30d: number;
  leads_30d: number;
  open_comments: number;
  last_updated_at: string; // ISO
  last_updated_by: { name: string; role: 'staff' | 'brand' };
  /**
   * External landing (loại "extension") — URL ngoài (vd mintcoin.vercel.app).
   * `/portal/templates` không trả field này nên loadTemplates enrich thêm
   * từ `pages.list(workspaceId)`. Có giá trị ⇒ card mở thẳng link ngoài.
   */
  external_url?: string | null;
  /** Ảnh thumbnail thật (BE trả từ thumbnail_asset_id). Có → card hiện ảnh
   * thay gradient placeholder. */
  thumbnail_url?: string | null;
};

export const FAKE_TEMPLATES: PortalTemplate[] = [
  {
    id: 'tpl_01',
    workspace_id: 'ws_coca_main',
    name: 'Coca-Cola Tết 2026 — Sum vầy ngày Tết',
    thumbnail_gradient: 'from-rose-400 to-red-500',
    status: 'published',
    views_30d: 12482,
    clicks_30d: 672,
    leads_30d: 87,
    open_comments: 2,
    last_updated_at: '2026-05-19T14:32:00Z',
    last_updated_by: { name: 'Minh (Rexer)', role: 'staff' },
  },
  {
    id: 'tpl_02',
    workspace_id: 'ws_coca_main',
    name: 'Coca-Cola Zero Sugar — Sport campaign',
    thumbnail_gradient: 'from-zinc-700 to-zinc-900',
    status: 'published',
    views_30d: 9842,
    clicks_30d: 543,
    leads_30d: 62,
    open_comments: 0,
    last_updated_at: '2026-05-18T09:15:00Z',
    last_updated_by: { name: 'Lan (Rexer)', role: 'staff' },
  },
  {
    id: 'tpl_03',
    workspace_id: 'ws_fanta',
    name: 'Fanta Watermelon — Hè 2026',
    thumbnail_gradient: 'from-orange-400 to-pink-500',
    status: 'published',
    views_30d: 6540,
    clicks_30d: 387,
    leads_30d: 41,
    open_comments: 1,
    last_updated_at: '2026-05-17T16:20:00Z',
    last_updated_by: { name: 'Minh (Rexer)', role: 'staff' },
  },
  {
    id: 'tpl_04',
    workspace_id: 'ws_sprite',
    name: 'Sprite Lemon — Refresh moment',
    thumbnail_gradient: 'from-emerald-400 to-lime-500',
    status: 'published',
    views_30d: 4321,
    clicks_30d: 248,
    leads_30d: 28,
    open_comments: 0,
    last_updated_at: '2026-05-15T11:42:00Z',
    last_updated_by: { name: 'Lan (Rexer)', role: 'staff' },
  },
  {
    id: 'tpl_05',
    workspace_id: 'ws_olympic',
    name: 'Coca-Cola — Olympic 2026 cheering',
    thumbnail_gradient: 'from-blue-500 to-violet-600',
    status: 'draft',
    views_30d: 0,
    clicks_30d: 0,
    leads_30d: 0,
    open_comments: 0,
    last_updated_at: '2026-05-20T08:00:00Z',
    last_updated_by: { name: 'Minh (Rexer)', role: 'staff' },
  },
  {
    id: 'tpl_06',
    workspace_id: 'ws_coca_main',
    name: 'Minute Maid — Health line',
    thumbnail_gradient: 'from-amber-400 to-orange-500',
    status: 'published',
    views_30d: 3120,
    clicks_30d: 198,
    leads_30d: 22,
    open_comments: 0,
    last_updated_at: '2026-05-12T13:10:00Z',
    last_updated_by: { name: 'Lan (Rexer)', role: 'staff' },
  },
];

/* ---------- assets ---------- */

export type AssetKind = 'image' | 'video' | 'document' | 'audio' | 'archive';

export type PortalAsset = {
  id: string;
  name: string;
  kind: AssetKind;
  mime_type: string;
  size_bytes: number;
  thumbnail_gradient: string;
  uploaded_at: string;
  uploaded_by: { name: string; role: 'brand' | 'staff' };
  tags: string[];
  campaign?: string;
  scan_status: 'clean' | 'pending';
};

export const FAKE_ASSETS: PortalAsset[] = [
  {
    id: 'a1',
    name: 'brand-guideline-2026.pdf',
    kind: 'document',
    mime_type: 'application/pdf',
    size_bytes: 4_521_000,
    thumbnail_gradient: 'from-rose-300 to-rose-100',
    uploaded_at: '2026-05-20T14:32:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['guideline', 'brand'],
    campaign: undefined,
    scan_status: 'clean',
  },
  {
    id: 'a2',
    name: 'hero-coca-tet.jpg',
    kind: 'image',
    mime_type: 'image/jpeg',
    size_bytes: 1_840_000,
    thumbnail_gradient: 'from-red-400 to-rose-500',
    uploaded_at: '2026-05-20T11:15:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['hero', 'tet'],
    campaign: 'tet-2026',
    scan_status: 'clean',
  },
  {
    id: 'a3',
    name: 'logo-cocacola-2026-vector.svg',
    kind: 'image',
    mime_type: 'image/svg+xml',
    size_bytes: 84_200,
    thumbnail_gradient: 'from-rose-500 to-red-700',
    uploaded_at: '2026-05-19T16:42:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['logo', 'svg'],
    scan_status: 'clean',
  },
  {
    id: 'a4',
    name: 'tvc-30s-tet.mp4',
    kind: 'video',
    mime_type: 'video/mp4',
    size_bytes: 24_800_000,
    thumbnail_gradient: 'from-zinc-700 to-zinc-900',
    uploaded_at: '2026-05-19T10:20:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['tvc', 'video'],
    campaign: 'tet-2026',
    scan_status: 'clean',
  },
  {
    id: 'a5',
    name: 'product-shots-zero-sugar.zip',
    kind: 'archive',
    mime_type: 'application/zip',
    size_bytes: 142_000_000,
    thumbnail_gradient: 'from-zinc-400 to-zinc-600',
    uploaded_at: '2026-05-18T13:30:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['product', 'photo'],
    campaign: 'zero-sugar',
    scan_status: 'clean',
  },
  {
    id: 'a6',
    name: 'campaign-brief-q2-2026.docx',
    kind: 'document',
    mime_type:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size_bytes: 320_000,
    thumbnail_gradient: 'from-blue-300 to-blue-500',
    uploaded_at: '2026-05-17T09:00:00Z',
    uploaded_by: { name: 'Linh (Brand)', role: 'brand' },
    tags: ['brief'],
    scan_status: 'clean',
  },
  {
    id: 'a7',
    name: 'jingle-coca-tet.mp3',
    kind: 'audio',
    mime_type: 'audio/mpeg',
    size_bytes: 4_200_000,
    thumbnail_gradient: 'from-fuchsia-400 to-purple-500',
    uploaded_at: '2026-05-16T15:12:00Z',
    uploaded_by: { name: 'Linh (Brand)', role: 'brand' },
    tags: ['audio', 'jingle'],
    campaign: 'tet-2026',
    scan_status: 'clean',
  },
  {
    id: 'a8',
    name: 'fanta-summer-photo-1.png',
    kind: 'image',
    mime_type: 'image/png',
    size_bytes: 2_100_000,
    thumbnail_gradient: 'from-orange-300 to-pink-400',
    uploaded_at: '2026-05-15T11:20:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['fanta', 'summer'],
    campaign: 'fanta-summer',
    scan_status: 'clean',
  },
  {
    id: 'a9',
    name: 'fanta-summer-photo-2.png',
    kind: 'image',
    mime_type: 'image/png',
    size_bytes: 2_350_000,
    thumbnail_gradient: 'from-amber-300 to-orange-400',
    uploaded_at: '2026-05-15T11:22:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['fanta', 'summer'],
    campaign: 'fanta-summer',
    scan_status: 'clean',
  },
  {
    id: 'a10',
    name: 'sprite-lemon-master.psd',
    kind: 'image',
    mime_type: 'image/vnd.adobe.photoshop',
    size_bytes: 38_000_000,
    thumbnail_gradient: 'from-emerald-300 to-lime-500',
    uploaded_at: '2026-05-14T16:00:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['sprite', 'master'],
    scan_status: 'pending',
  },
  {
    id: 'a11',
    name: 'olympic-2026-sponsorship.pdf',
    kind: 'document',
    mime_type: 'application/pdf',
    size_bytes: 1_800_000,
    thumbnail_gradient: 'from-rose-300 to-rose-100',
    uploaded_at: '2026-05-13T09:42:00Z',
    uploaded_by: { name: 'Linh (Brand)', role: 'brand' },
    tags: ['olympic', 'sponsorship'],
    campaign: 'olympic-2026',
    scan_status: 'clean',
  },
  {
    id: 'a12',
    name: 'olympic-hero-bg.jpg',
    kind: 'image',
    mime_type: 'image/jpeg',
    size_bytes: 3_200_000,
    thumbnail_gradient: 'from-blue-400 to-violet-500',
    uploaded_at: '2026-05-13T09:45:00Z',
    uploaded_by: { name: 'Linh (Brand)', role: 'brand' },
    tags: ['olympic', 'hero'],
    campaign: 'olympic-2026',
    scan_status: 'clean',
  },
];

/* ---------- folders (Google Drive style) ---------- */

export type MediaFolder = {
  id: string;
  parent_id: string | null;
  name: string;
  child_folder_count: number;
  file_count: number;
  size_bytes: number;
  updated_at: string;
};

export const FAKE_FOLDERS: MediaFolder[] = [
  {
    id: 'f_root',
    parent_id: null,
    name: 'My Drive',
    child_folder_count: 4,
    file_count: 2,
    size_bytes: 0,
    updated_at: '2026-05-20T14:00:00Z',
  },

  {
    id: 'f_brand',
    parent_id: 'f_root',
    name: 'Brand Guidelines',
    child_folder_count: 3,
    file_count: 0,
    size_bytes: 6_485_000,
    updated_at: '2026-05-19T16:42:00Z',
  },
  {
    id: 'f_brand_logos',
    parent_id: 'f_brand',
    name: 'Logo Files',
    child_folder_count: 0,
    file_count: 3,
    size_bytes: 224_000,
    updated_at: '2026-05-19T16:42:00Z',
  },
  {
    id: 'f_brand_colors',
    parent_id: 'f_brand',
    name: 'Color Palette',
    child_folder_count: 0,
    file_count: 2,
    size_bytes: 1_240_000,
    updated_at: '2026-05-18T10:20:00Z',
  },
  {
    id: 'f_brand_type',
    parent_id: 'f_brand',
    name: 'Typography',
    child_folder_count: 0,
    file_count: 4,
    size_bytes: 5_021_000,
    updated_at: '2026-05-17T11:15:00Z',
  },

  {
    id: 'f_tet',
    parent_id: 'f_root',
    name: 'Tết 2026 Campaign',
    child_folder_count: 3,
    file_count: 1,
    size_bytes: 31_140_000,
    updated_at: '2026-05-20T11:15:00Z',
  },
  {
    id: 'f_tet_hero',
    parent_id: 'f_tet',
    name: 'Hero Images',
    child_folder_count: 0,
    file_count: 5,
    size_bytes: 12_300_000,
    updated_at: '2026-05-20T11:15:00Z',
  },
  {
    id: 'f_tet_tvc',
    parent_id: 'f_tet',
    name: 'TVC Videos',
    child_folder_count: 0,
    file_count: 2,
    size_bytes: 38_400_000,
    updated_at: '2026-05-19T10:20:00Z',
  },
  {
    id: 'f_tet_print',
    parent_id: 'f_tet',
    name: 'Print Assets',
    child_folder_count: 0,
    file_count: 8,
    size_bytes: 18_500_000,
    updated_at: '2026-05-18T14:00:00Z',
  },

  {
    id: 'f_zero',
    parent_id: 'f_root',
    name: 'Zero Sugar Campaign',
    child_folder_count: 2,
    file_count: 2,
    size_bytes: 142_000_000,
    updated_at: '2026-05-18T13:30:00Z',
  },
  {
    id: 'f_zero_photo',
    parent_id: 'f_zero',
    name: 'Product Shots',
    child_folder_count: 0,
    file_count: 12,
    size_bytes: 142_000_000,
    updated_at: '2026-05-18T13:30:00Z',
  },
  {
    id: 'f_zero_video',
    parent_id: 'f_zero',
    name: 'Athlete Clips',
    child_folder_count: 0,
    file_count: 4,
    size_bytes: 89_000_000,
    updated_at: '2026-05-17T15:42:00Z',
  },

  {
    id: 'f_olympic',
    parent_id: 'f_root',
    name: 'Olympic 2026',
    child_folder_count: 0,
    file_count: 6,
    size_bytes: 14_200_000,
    updated_at: '2026-05-13T09:45:00Z',
  },
];

export type MediaFile = PortalAsset & {
  folder_id: string;
};

export const FAKE_MEDIA_FILES: MediaFile[] = [
  // Root level
  {
    id: 'm1',
    folder_id: 'f_root',
    name: 'README-brand.txt',
    kind: 'document',
    mime_type: 'text/plain',
    size_bytes: 12_400,
    thumbnail_gradient: 'from-zinc-300 to-zinc-100',
    uploaded_at: '2026-05-15T09:00:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['readme'],
    scan_status: 'clean',
  },
  {
    id: 'm2',
    folder_id: 'f_root',
    name: 'agreement-2026.pdf',
    kind: 'document',
    mime_type: 'application/pdf',
    size_bytes: 2_840_000,
    thumbnail_gradient: 'from-rose-300 to-rose-100',
    uploaded_at: '2026-01-10T15:30:00Z',
    uploaded_by: { name: 'Linh (Brand)', role: 'brand' },
    tags: ['contract'],
    scan_status: 'clean',
  },

  // Brand Guidelines/Logo Files
  {
    id: 'm3',
    folder_id: 'f_brand_logos',
    name: 'logo-cocacola-2026-vector.svg',
    kind: 'image',
    mime_type: 'image/svg+xml',
    size_bytes: 84_200,
    thumbnail_gradient: 'from-rose-500 to-red-700',
    uploaded_at: '2026-05-19T16:42:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['logo', 'svg'],
    scan_status: 'clean',
  },
  {
    id: 'm4',
    folder_id: 'f_brand_logos',
    name: 'logo-cocacola-white.png',
    kind: 'image',
    mime_type: 'image/png',
    size_bytes: 120_000,
    thumbnail_gradient: 'from-zinc-100 to-white',
    uploaded_at: '2026-05-19T16:42:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['logo', 'white'],
    scan_status: 'clean',
  },
  {
    id: 'm5',
    folder_id: 'f_brand_logos',
    name: 'logo-cocacola-monochrome.png',
    kind: 'image',
    mime_type: 'image/png',
    size_bytes: 18_400,
    thumbnail_gradient: 'from-zinc-700 to-zinc-900',
    uploaded_at: '2026-05-19T16:42:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['logo', 'mono'],
    scan_status: 'clean',
  },

  // Brand Guidelines/Color Palette
  {
    id: 'm6',
    folder_id: 'f_brand_colors',
    name: 'colors-pms-2026.pdf',
    kind: 'document',
    mime_type: 'application/pdf',
    size_bytes: 820_000,
    thumbnail_gradient: 'from-amber-300 to-rose-400',
    uploaded_at: '2026-05-18T10:20:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['color', 'pms'],
    scan_status: 'clean',
  },
  {
    id: 'm7',
    folder_id: 'f_brand_colors',
    name: 'colors-hex-tokens.json',
    kind: 'document',
    mime_type: 'application/json',
    size_bytes: 4_200,
    thumbnail_gradient: 'from-violet-300 to-fuchsia-400',
    uploaded_at: '2026-05-18T10:20:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['color', 'tokens'],
    scan_status: 'clean',
  },

  // Brand Guidelines/Typography
  {
    id: 'm8',
    folder_id: 'f_brand_type',
    name: 'CocaCola-Bold.otf',
    kind: 'document',
    mime_type: 'font/otf',
    size_bytes: 240_000,
    thumbnail_gradient: 'from-emerald-300 to-emerald-500',
    uploaded_at: '2026-05-17T11:15:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['font'],
    scan_status: 'clean',
  },
  {
    id: 'm9',
    folder_id: 'f_brand_type',
    name: 'CocaCola-Regular.otf',
    kind: 'document',
    mime_type: 'font/otf',
    size_bytes: 220_000,
    thumbnail_gradient: 'from-emerald-300 to-emerald-500',
    uploaded_at: '2026-05-17T11:15:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['font'],
    scan_status: 'clean',
  },
  {
    id: 'm10',
    folder_id: 'f_brand_type',
    name: 'typography-guide.pdf',
    kind: 'document',
    mime_type: 'application/pdf',
    size_bytes: 4_521_000,
    thumbnail_gradient: 'from-rose-300 to-rose-100',
    uploaded_at: '2026-05-17T11:15:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['guide'],
    scan_status: 'clean',
  },

  // Tết Campaign root
  {
    id: 'm11',
    folder_id: 'f_tet',
    name: 'campaign-brief-tet-2026.docx',
    kind: 'document',
    mime_type:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size_bytes: 320_000,
    thumbnail_gradient: 'from-blue-300 to-blue-500',
    uploaded_at: '2026-05-15T09:00:00Z',
    uploaded_by: { name: 'Linh (Brand)', role: 'brand' },
    tags: ['brief'],
    campaign: 'tet-2026',
    scan_status: 'clean',
  },

  // Tết/Hero Images
  {
    id: 'm12',
    folder_id: 'f_tet_hero',
    name: 'hero-tet-family-1.jpg',
    kind: 'image',
    mime_type: 'image/jpeg',
    size_bytes: 2_840_000,
    thumbnail_gradient: 'from-rose-400 to-red-500',
    uploaded_at: '2026-05-20T11:15:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['hero', 'family'],
    campaign: 'tet-2026',
    scan_status: 'clean',
  },
  {
    id: 'm13',
    folder_id: 'f_tet_hero',
    name: 'hero-tet-family-2.jpg',
    kind: 'image',
    mime_type: 'image/jpeg',
    size_bytes: 3_120_000,
    thumbnail_gradient: 'from-orange-400 to-pink-500',
    uploaded_at: '2026-05-20T11:15:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['hero', 'family'],
    campaign: 'tet-2026',
    scan_status: 'clean',
  },
  {
    id: 'm14',
    folder_id: 'f_tet_hero',
    name: 'hero-tet-fireworks.jpg',
    kind: 'image',
    mime_type: 'image/jpeg',
    size_bytes: 2_400_000,
    thumbnail_gradient: 'from-violet-500 to-fuchsia-600',
    uploaded_at: '2026-05-20T11:15:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['hero', 'fireworks'],
    campaign: 'tet-2026',
    scan_status: 'clean',
  },

  // Tết/TVC
  {
    id: 'm15',
    folder_id: 'f_tet_tvc',
    name: 'tvc-30s-tet.mp4',
    kind: 'video',
    mime_type: 'video/mp4',
    size_bytes: 24_800_000,
    thumbnail_gradient: 'from-zinc-700 to-zinc-900',
    uploaded_at: '2026-05-19T10:20:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['tvc'],
    campaign: 'tet-2026',
    scan_status: 'clean',
  },
  {
    id: 'm16',
    folder_id: 'f_tet_tvc',
    name: 'tvc-15s-tet-cutdown.mp4',
    kind: 'video',
    mime_type: 'video/mp4',
    size_bytes: 13_600_000,
    thumbnail_gradient: 'from-zinc-700 to-zinc-900',
    uploaded_at: '2026-05-19T10:20:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['tvc', '15s'],
    campaign: 'tet-2026',
    scan_status: 'clean',
  },

  // Tết/Print
  {
    id: 'm17',
    folder_id: 'f_tet_print',
    name: 'poster-tet-a3.pdf',
    kind: 'document',
    mime_type: 'application/pdf',
    size_bytes: 8_240_000,
    thumbnail_gradient: 'from-rose-300 to-rose-100',
    uploaded_at: '2026-05-18T14:00:00Z',
    uploaded_by: { name: 'Linh (Brand)', role: 'brand' },
    tags: ['poster', 'print'],
    campaign: 'tet-2026',
    scan_status: 'clean',
  },
  {
    id: 'm18',
    folder_id: 'f_tet_print',
    name: 'standee-design.psd',
    kind: 'image',
    mime_type: 'image/vnd.adobe.photoshop',
    size_bytes: 32_000_000,
    thumbnail_gradient: 'from-amber-300 to-orange-400',
    uploaded_at: '2026-05-18T14:00:00Z',
    uploaded_by: { name: 'Linh (Brand)', role: 'brand' },
    tags: ['standee', 'psd'],
    campaign: 'tet-2026',
    scan_status: 'clean',
  },

  // Zero Sugar/Product Shots
  {
    id: 'm19',
    folder_id: 'f_zero_photo',
    name: 'zero-sugar-330ml-front.png',
    kind: 'image',
    mime_type: 'image/png',
    size_bytes: 4_200_000,
    thumbnail_gradient: 'from-zinc-600 to-zinc-900',
    uploaded_at: '2026-05-18T13:30:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['product', '330ml'],
    campaign: 'zero-sugar',
    scan_status: 'clean',
  },
  {
    id: 'm20',
    folder_id: 'f_zero_photo',
    name: 'zero-sugar-500ml-front.png',
    kind: 'image',
    mime_type: 'image/png',
    size_bytes: 4_800_000,
    thumbnail_gradient: 'from-zinc-700 to-black',
    uploaded_at: '2026-05-18T13:30:00Z',
    uploaded_by: { name: 'An (Brand)', role: 'brand' },
    tags: ['product', '500ml'],
    campaign: 'zero-sugar',
    scan_status: 'clean',
  },

  // Zero Sugar root
  {
    id: 'm21',
    folder_id: 'f_zero',
    name: 'zero-sugar-brief.docx',
    kind: 'document',
    mime_type:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size_bytes: 280_000,
    thumbnail_gradient: 'from-blue-300 to-blue-500',
    uploaded_at: '2026-05-15T11:00:00Z',
    uploaded_by: { name: 'Linh (Brand)', role: 'brand' },
    tags: ['brief'],
    campaign: 'zero-sugar',
    scan_status: 'clean',
  },
  {
    id: 'm22',
    folder_id: 'f_zero',
    name: 'sport-athlete-list.xlsx',
    kind: 'document',
    mime_type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size_bytes: 142_000,
    thumbnail_gradient: 'from-emerald-300 to-emerald-500',
    uploaded_at: '2026-05-15T11:00:00Z',
    uploaded_by: { name: 'Linh (Brand)', role: 'brand' },
    tags: ['data'],
    campaign: 'zero-sugar',
    scan_status: 'clean',
  },

  // Olympic
  {
    id: 'm23',
    folder_id: 'f_olympic',
    name: 'olympic-2026-sponsorship.pdf',
    kind: 'document',
    mime_type: 'application/pdf',
    size_bytes: 1_800_000,
    thumbnail_gradient: 'from-rose-300 to-rose-100',
    uploaded_at: '2026-05-13T09:42:00Z',
    uploaded_by: { name: 'Linh (Brand)', role: 'brand' },
    tags: ['olympic'],
    campaign: 'olympic-2026',
    scan_status: 'clean',
  },
  {
    id: 'm24',
    folder_id: 'f_olympic',
    name: 'olympic-hero-bg.jpg',
    kind: 'image',
    mime_type: 'image/jpeg',
    size_bytes: 3_200_000,
    thumbnail_gradient: 'from-blue-400 to-violet-500',
    uploaded_at: '2026-05-13T09:45:00Z',
    uploaded_by: { name: 'Linh (Brand)', role: 'brand' },
    tags: ['olympic', 'hero'],
    campaign: 'olympic-2026',
    scan_status: 'clean',
  },
];

/* ---------- products ---------- */

export type ProductCategory = 'carbonated' | 'juice' | 'water' | 'energy';

export const CATEGORY_LABEL: Record<
  ProductCategory,
  { label: string; color: string }
> = {
  carbonated: { label: 'Có ga', color: 'bg-rose-500' },
  juice: { label: 'Nước ép', color: 'bg-orange-500' },
  water: { label: 'Nước khoáng', color: 'bg-blue-500' },
  energy: { label: 'Tăng lực', color: 'bg-amber-500' },
};

export type PortalProduct = {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  status: 'active' | 'coming_soon' | 'discontinued';
  cover_gradient: string;
  /** Public CDN URL of the cover image. When set, the card shows it instead
   *  of the gradient placeholder. */
  thumbnail_url?: string;
  description: string;
  sizes: { label: string; volume_ml: number; price_vnd: number }[];
  colors?: { name: string; hex: string }[];
  ingredients: string[];
  certifications: string[];
  features: { label: string; description: string }[];
  related_template_ids: string[];
  created_at: string;
};

export const FAKE_PRODUCTS: PortalProduct[] = [
  {
    id: 'p_coca_classic',
    name: 'Coca-Cola Original',
    sku: 'CC-CLASSIC',
    category: 'carbonated',
    status: 'active',
    cover_gradient: 'from-red-500 to-rose-700',
    description:
      'Hương vị nguyên bản huyền thoại của Coca-Cola, sảng khoái mỗi ngụm.',
    sizes: [
      { label: 'Lon', volume_ml: 330, price_vnd: 12_000 },
      { label: 'Chai', volume_ml: 500, price_vnd: 18_000 },
      { label: 'Chai lớn', volume_ml: 1_500, price_vnd: 32_000 },
      { label: 'Lon mini', volume_ml: 235, price_vnd: 10_000 },
    ],
    ingredients: [
      'Nước có ga',
      'Đường',
      'Caramel màu',
      'Acid phosphoric',
      'Hương Cola tự nhiên',
      'Caffeine',
    ],
    certifications: ['ISO 22000', 'HACCP', 'FDA approved'],
    features: [
      { label: 'Hương vị nguyên bản', description: 'Công thức 1886 không đổi' },
      { label: 'Sản xuất tại VN', description: 'Nhà máy Thủ Đức + Đà Nẵng' },
    ],
    related_template_ids: ['tpl_01'],
    created_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 'p_coca_zero',
    name: 'Coca-Cola Zero Sugar',
    sku: 'CC-ZERO',
    category: 'carbonated',
    status: 'active',
    cover_gradient: 'from-zinc-800 to-black',
    description:
      'Vị Coca-Cola sảng khoái không calo, không đường — dành cho lối sống năng động.',
    sizes: [
      { label: 'Lon', volume_ml: 330, price_vnd: 12_000 },
      { label: 'Chai', volume_ml: 500, price_vnd: 18_000 },
    ],
    ingredients: [
      'Nước có ga',
      'Caramel màu',
      'Aspartame',
      'Acid phosphoric',
      'Caffeine',
    ],
    certifications: ['ISO 22000', 'Halal', 'No-sugar verified'],
    features: [
      { label: '0 calo', description: 'Không calo, không đường' },
      { label: 'Vị nguyên bản', description: 'Giống Original 99%' },
    ],
    related_template_ids: ['tpl_02'],
    created_at: '2026-01-12T00:00:00Z',
  },
  {
    id: 'p_coca_light',
    name: 'Coca-Cola Light',
    sku: 'CC-LIGHT',
    category: 'carbonated',
    status: 'active',
    cover_gradient: 'from-zinc-300 to-zinc-500',
    description:
      'Phiên bản nhẹ nhàng, ít calo cho người tiêu dùng quan tâm sức khỏe.',
    sizes: [{ label: 'Lon', volume_ml: 330, price_vnd: 12_000 }],
    ingredients: [
      'Nước có ga',
      'Caramel màu',
      'Acesulfame-K',
      'Aspartame',
      'Caffeine',
    ],
    certifications: ['ISO 22000', 'Low-calorie verified'],
    features: [{ label: 'Ít calo', description: 'Chỉ 3 calo / lon' }],
    related_template_ids: [],
    created_at: '2026-01-15T00:00:00Z',
  },
  {
    id: 'p_fanta_orange',
    name: 'Fanta Orange',
    sku: 'FT-ORANGE',
    category: 'carbonated',
    status: 'active',
    cover_gradient: 'from-orange-400 to-amber-500',
    description: 'Nước cam có ga vị sảng khoái — niềm vui hè không giới hạn.',
    sizes: [
      { label: 'Lon', volume_ml: 330, price_vnd: 11_000 },
      { label: 'Chai', volume_ml: 500, price_vnd: 17_000 },
      { label: 'Chai 1.5L', volume_ml: 1_500, price_vnd: 30_000 },
    ],
    colors: [{ name: 'Cam', hex: '#FF7F2A' }],
    ingredients: [
      'Nước có ga',
      'Đường',
      'Hương cam tự nhiên',
      'Acid citric',
      'Beta-carotene',
    ],
    certifications: ['ISO 22000', 'Natural color verified'],
    features: [
      { label: 'Hương cam thật', description: 'Chiết xuất từ vỏ cam Florida' },
    ],
    related_template_ids: [],
    created_at: '2026-02-01T00:00:00Z',
  },
  {
    id: 'p_fanta_watermelon',
    name: 'Fanta Watermelon',
    sku: 'FT-WATERMELON',
    category: 'carbonated',
    status: 'active',
    cover_gradient: 'from-pink-400 to-rose-500',
    description: 'Vị dưa hấu mọng nước, ngọt thanh — đặc biệt cho mùa hè 2026.',
    sizes: [
      { label: 'Lon', volume_ml: 330, price_vnd: 12_000 },
      { label: 'Chai', volume_ml: 500, price_vnd: 18_000 },
    ],
    ingredients: ['Nước có ga', 'Đường', 'Hương dưa hấu', 'Acid citric'],
    certifications: ['ISO 22000'],
    features: [{ label: 'Limited Edition', description: 'Chỉ bán mùa hè' }],
    related_template_ids: ['tpl_03'],
    created_at: '2026-04-01T00:00:00Z',
  },
  {
    id: 'p_sprite_lemon',
    name: 'Sprite Lemon',
    sku: 'SP-LEMON',
    category: 'carbonated',
    status: 'active',
    cover_gradient: 'from-emerald-400 to-lime-500',
    description: 'Vị chanh sảng khoái, không caffeine — tỉnh táo tức thì.',
    sizes: [
      { label: 'Lon', volume_ml: 330, price_vnd: 11_000 },
      { label: 'Chai', volume_ml: 500, price_vnd: 17_000 },
    ],
    ingredients: ['Nước có ga', 'Đường', 'Hương chanh tự nhiên', 'Acid citric'],
    certifications: ['ISO 22000', 'Caffeine-free verified'],
    features: [
      { label: 'Không caffeine', description: 'Phù hợp mọi lứa tuổi' },
      { label: 'Vị chanh thật', description: 'Chiết xuất từ chanh tươi' },
    ],
    related_template_ids: ['tpl_04'],
    created_at: '2026-02-15T00:00:00Z',
  },
  {
    id: 'p_minutemaid',
    name: 'Minute Maid Pulpy',
    sku: 'MM-PULPY',
    category: 'juice',
    status: 'active',
    cover_gradient: 'from-amber-400 to-orange-500',
    description: 'Nước cam có tép — bổ sung vitamin C hàng ngày.',
    sizes: [
      { label: 'Chai', volume_ml: 350, price_vnd: 15_000 },
      { label: 'Chai gia đình', volume_ml: 1_000, price_vnd: 35_000 },
    ],
    ingredients: ['Nước cam ép', 'Đường', 'Tép cam', 'Vitamin C'],
    certifications: ['ISO 22000', 'Natural juice verified'],
    features: [
      { label: '70% nước cam ép', description: 'Thành phần thật từ cam' },
      { label: 'Bổ sung Vitamin C', description: '40% nhu cầu ngày' },
    ],
    related_template_ids: ['tpl_06'],
    created_at: '2026-02-20T00:00:00Z',
  },
  {
    id: 'p_dasani',
    name: 'Dasani Water',
    sku: 'DA-WATER',
    category: 'water',
    status: 'active',
    cover_gradient: 'from-sky-400 to-blue-500',
    description: 'Nước tinh khiết tinh lọc 4 lớp, bổ sung khoáng chất.',
    sizes: [
      { label: 'Chai nhỏ', volume_ml: 350, price_vnd: 7_000 },
      { label: 'Chai trung', volume_ml: 500, price_vnd: 9_000 },
      { label: 'Chai lớn', volume_ml: 1_500, price_vnd: 18_000 },
      { label: 'Bình', volume_ml: 5_000, price_vnd: 45_000 },
    ],
    ingredients: ['Nước tinh khiết', 'Khoáng chất tự nhiên'],
    certifications: ['ISO 22000', 'WHO water quality'],
    features: [
      { label: 'Lọc 4 lớp', description: 'RO + UV + Ozone + Carbon' },
      { label: 'Bổ sung khoáng', description: 'Mg, Ca, K' },
    ],
    related_template_ids: [],
    created_at: '2026-01-20T00:00:00Z',
  },
  {
    id: 'p_olympic_special',
    name: 'Coca-Cola Olympic 2026 Edition',
    sku: 'CC-OLYMPIC-2026',
    category: 'carbonated',
    status: 'coming_soon',
    cover_gradient: 'from-blue-500 to-violet-600',
    description:
      'Phiên bản đặc biệt kỷ niệm tài trợ Olympic 2026 — bao bì sưu tầm.',
    sizes: [{ label: 'Lon sưu tầm', volume_ml: 330, price_vnd: 15_000 }],
    ingredients: ['Như Coca-Cola Original'],
    certifications: ['ISO 22000', 'Olympic 2026 official partner'],
    features: [
      { label: 'Limited 100K lon', description: 'In số seri sưu tầm' },
      { label: 'Vị Original', description: 'Công thức không đổi' },
    ],
    related_template_ids: ['tpl_05'],
    created_at: '2026-05-01T00:00:00Z',
  },
];

/* ---------- activity feed ---------- */

export type ActivityItem = {
  id: string;
  kind:
    | 'template_published'
    | 'template_updated'
    | 'comment_new'
    | 'comment_resolved'
    | 'asset_uploaded'
    | 'workspace_invited';
  actor: string;
  actor_role: 'staff' | 'brand';
  subject: string;
  excerpt?: string;
  at: string;
};

export const FAKE_ACTIVITY: ActivityItem[] = [
  {
    id: 'ev1',
    kind: 'template_published',
    actor: 'Minh (Rexer)',
    actor_role: 'staff',
    subject: 'Coca-Cola Tết 2026',
    at: '2 giờ trước',
  },
  {
    id: 'ev2',
    kind: 'asset_uploaded',
    actor: 'An (Brand)',
    actor_role: 'brand',
    subject: 'brand-guideline-2026.pdf',
    at: '3 giờ trước',
  },
  {
    id: 'ev3',
    kind: 'comment_new',
    actor: 'An (Brand)',
    actor_role: 'brand',
    subject: 'Coca-Cola Tết 2026',
    excerpt: 'Cần đổi màu CTA sang đỏ đậm hơn — tone luxury hơn cho Tết.',
    at: '5 giờ trước',
  },
  {
    id: 'ev4',
    kind: 'template_updated',
    actor: 'Lan (Rexer)',
    actor_role: 'staff',
    subject: 'Fanta Watermelon',
    excerpt: 'Cập nhật hero image + thêm block Quiz.',
    at: '6 giờ trước',
  },
  {
    id: 'ev5',
    kind: 'comment_resolved',
    actor: 'Minh (Rexer)',
    actor_role: 'staff',
    subject: 'Coca-Cola Zero Sugar',
    at: 'hôm qua',
  },
  {
    id: 'ev6',
    kind: 'asset_uploaded',
    actor: 'An (Brand)',
    actor_role: 'brand',
    subject: 'tvc-30s-tet.mp4',
    at: 'hôm qua',
  },
  {
    id: 'ev7',
    kind: 'template_published',
    actor: 'Lan (Rexer)',
    actor_role: 'staff',
    subject: 'Sprite Lemon',
    at: '2 ngày trước',
  },
  {
    id: 'ev8',
    kind: 'workspace_invited',
    actor: 'Minh (Rexer)',
    actor_role: 'staff',
    subject: 'thu@cocacola.vn',
    at: '3 ngày trước',
  },
];

/* ---------- formatters ---------- */

export const fmtBytes = (n: number) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
};

export const fmtNum = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`
      : String(n);

export const fmtFull = (n: number) => n.toLocaleString('vi-VN');
