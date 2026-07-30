export type MediaKindId = 'IMG' | 'VID' | 'D3' | 'P360' | 'DOC' | 'AUD';

export type MediaStatusId = 'approved' | 'review' | 'expiring' | 'archived';

export type MediaUseId =
  | 'product'
  | 'campaign'
  | 'experience'
  | 'brand'
  | 'unlinked';

export type FunnelRoleId = 'ATT' | 'EDU' | 'EXP' | 'TRU' | 'CON';

export type MediaAssetHome =
  | { scope: 'product'; ref: string; label: string }
  | { scope: 'campaign'; ref: string; label: string }
  | { scope: 'brand' }
  | { scope: 'unfiled' };

export type MediaAssetRights = {
  licence: string;
  source: string;
  holder: string;
  release: string;
  expires: string | null;
  territories: string;
};

export type MediaAssetLink = {
  type: 'product' | 'campaign' | 'experience';
  label: string;
  meta: string;
};

export type MediaAssetAssisted = {
  sessions: number;
  uses: number;
  lift: number;
};

export type MediaAsset = {
  id: string;
  name: string;
  kind: MediaKindId;
  mime: string;
  /** Public CDN URL for the underlying file, if available (real assets only). */
  url?: string;
  home: MediaAssetHome;
  size: string;
  dims: string;
  role: FunnelRoleId;
  status: MediaStatusId;
  version: number;
  owner: string;
  updated: string;
  alt: string;
  caption: string;
  tags: string[];
  rights: MediaAssetRights;
  uses: MediaUseId[];
  links: MediaAssetLink[];
  assisted: MediaAssetAssisted | null;
};

export type MediaViewMode = 'grid' | 'table';

export type MediaFolderId = string;

export type MediaFilters = {
  q: string;
  use: 'all' | MediaUseId;
  kind: 'all' | MediaKindId;
  status: 'all' | MediaStatusId;
  folder: MediaFolderId;
  view: MediaViewMode;
  refine: boolean;
};

export type MediaFolderOption = {
  id: MediaFolderId;
  label: string;
  count: number;
};

export type MediaFolderGroup = {
  labelKey: string;
  options: MediaFolderOption[];
};
