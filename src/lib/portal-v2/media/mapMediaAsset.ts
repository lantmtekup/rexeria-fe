import type { MediaAsset as RexerMediaAsset } from '@/services/rexer/types';

import type {
  FunnelRoleId,
  MediaAsset,
  MediaKindId,
  MediaStatusId,
} from '@/lib/portal-v2/media/types';

/**
 * Backend media asset has no equivalent for these prototype-only UI fields —
 * default to neutral placeholders until BE grows richer metadata.
 */
const DEFAULT_ROLE: FunnelRoleId = 'EDU';
const DEFAULT_STATUS: MediaStatusId = 'approved';
const KNOWN_STATUSES: MediaStatusId[] = [
  'approved',
  'review',
  'expiring',
  'archived',
];

const deriveKind = (be: RexerMediaAsset): MediaKindId => {
  if (be.media_type === 'image') return 'IMG';
  if (be.media_type === 'video') return 'VID';
  if (be.media_type === '3d') return 'D3';
  const mime = be.mime_type ?? '';
  if (mime.startsWith('audio/')) return 'AUD';
  if (mime.startsWith('video/')) return 'VID';
  if (mime === 'application/pdf' || mime.startsWith('text/')) return 'DOC';
  return 'IMG';
};

const deriveStatus = (be: RexerMediaAsset): MediaStatusId =>
  KNOWN_STATUSES.includes(be.status as MediaStatusId)
    ? (be.status as MediaStatusId)
    : DEFAULT_STATUS;

const formatBytes = (bytes: number): string => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** i;
  return `${i === 0 ? value : value.toFixed(1)} ${units[i]}`;
};

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const deriveDims = (be: RexerMediaAsset): string => {
  if (be.width && be.height) return `${be.width} × ${be.height}`;
  if (be.duration_ms) return formatDuration(be.duration_ms);
  return '—';
};

const deriveUpdated = (be: RexerMediaAsset): string => {
  const date = new Date(be.created_at);
  return Number.isNaN(date.getTime())
    ? be.created_at
    : date.toLocaleDateString();
};

export const mapRexerMediaAssetToUi = (be: RexerMediaAsset): MediaAsset => ({
  id: be.id,
  name: be.original_filename,
  kind: deriveKind(be),
  mime: be.mime_type,
  url: be.public_url,
  home: { scope: 'unfiled' },
  size: formatBytes(be.file_size),
  dims: deriveDims(be),
  role: DEFAULT_ROLE,
  status: deriveStatus(be),
  version: 1,
  owner: be.created_by,
  updated: deriveUpdated(be),
  alt: '',
  caption: '',
  tags: be.tags ?? [],
  rights: {
    licence: '',
    source: '',
    holder: '',
    release: '',
    expires: null,
    territories: '',
  },
  uses: [],
  links: [],
  assisted: null,
});
