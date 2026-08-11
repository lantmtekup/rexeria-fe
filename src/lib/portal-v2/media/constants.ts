import {
  AudioLines,
  FileText,
  Image,
  Orbit,
  Video,
  Box as Cube,
  type LucideIcon,
} from 'lucide-react';

import type {
  FunnelRoleId,
  MediaFilters,
  MediaKindId,
  MediaStatusId,
  MediaUseId,
} from '@/lib/portal-v2/media/types';

export type MediaToneId =
  'violet' | 'blue' | 'success' | 'warning' | 'error' | 'mut';

const MEDIA_TONE_VAR: Record<MediaToneId, string> = {
  violet: '--pv2-violet',
  blue: '--pv2-blue-500',
  success: '--pv2-success',
  warning: '--pv2-warning',
  error: '--pv2-error',
  mut: '--pv2-mut',
};

export const mediaToneStyle = (tone: MediaToneId) => {
  const v = MEDIA_TONE_VAR[tone];
  return {
    color: `var(${v})`,
    background: `color-mix(in srgb, var(${v}) 14%, transparent)`,
  } as const;
};

export const mediaToneColor = (tone: MediaToneId) =>
  `var(${MEDIA_TONE_VAR[tone]})`;

export const MEDIA_THUMBNAIL_GRADIENT =
  'linear-gradient(135deg,#2A66B0,#3B82D6)';

export const MEDIA_KINDS: Record<
  MediaKindId,
  { labelKey: string; icon: LucideIcon; tone: MediaToneId }
> = {
  IMG: { labelKey: 'kindImage', icon: Image, tone: 'violet' },
  VID: { labelKey: 'kindVideo', icon: Video, tone: 'error' },
  D3: { labelKey: 'kind3d', icon: Cube, tone: 'blue' },
  P360: { labelKey: 'kind360', icon: Orbit, tone: 'success' },
  DOC: { labelKey: 'kindDoc', icon: FileText, tone: 'warning' },
  AUD: { labelKey: 'kindAudio', icon: AudioLines, tone: 'mut' },
};

export const MEDIA_STATUS: Record<
  MediaStatusId,
  { labelKey: string; tone: MediaToneId }
> = {
  approved: { labelKey: 'statusApproved', tone: 'success' },
  review: { labelKey: 'statusReview', tone: 'warning' },
  expiring: { labelKey: 'statusExpiring', tone: 'error' },
  archived: { labelKey: 'statusArchived', tone: 'mut' },
};

export const MEDIA_USE_TABS: { id: MediaUseId; labelKey: string }[] = [
  { id: 'product', labelKey: 'useProduct' },
  { id: 'campaign', labelKey: 'useCampaign' },
  { id: 'experience', labelKey: 'useExperience' },
  { id: 'brand', labelKey: 'useBrand' },
  { id: 'unlinked', labelKey: 'useUnlinked' },
];

export const FUNNEL_ROLES: Record<
  FunnelRoleId,
  { labelKey: string; tone: MediaToneId }
> = {
  ATT: { labelKey: 'roleAtt', tone: 'warning' },
  EDU: { labelKey: 'roleEdu', tone: 'violet' },
  EXP: { labelKey: 'roleExp', tone: 'blue' },
  TRU: { labelKey: 'roleTru', tone: 'error' },
  CON: { labelKey: 'roleCon', tone: 'success' },
};

export const MEDIA_SEARCH_DEBOUNCE_MS = 350;

/** Shared bởi nút Upload ở MediaHeader và empty-state ở MediaResults (`htmlFor`). */
export const MEDIA_UPLOAD_INPUT_ID = 'pv2-media-upload';

export const MEDIA_DEFAULT_FILTERS: MediaFilters = {
  q: '',
  use: 'all',
  kind: 'all',
  status: 'all',
  folder: 'all',
  view: 'grid',
  refine: false,
};
