'use client';

import { useTranslations } from 'next-intl';

import {
  FUNNEL_ROLES,
  MEDIA_KINDS,
  MEDIA_STATUS,
  mediaToneColor,
  mediaToneStyle,
} from '@/lib/portal-v2/media/constants';
import type {
  FunnelRoleId,
  MediaKindId,
  MediaStatusId,
} from '@/lib/portal-v2/media/types';
import { cn } from '@/lib/cn';

export const KindPill = ({ kind }: { kind: MediaKindId }) => {
  const t = useTranslations('portalV2.media');
  const meta = MEDIA_KINDS[kind];
  const Icon = meta.icon;
  return (
    <span
      className='inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold'
      style={mediaToneStyle(meta.tone)}
    >
      <Icon className='size-3' strokeWidth={2.2} aria-hidden />
      {t(meta.labelKey)}
    </span>
  );
};

export const StatusPill = ({ status }: { status: MediaStatusId }) => {
  const t = useTranslations('portalV2.media');
  const meta = MEDIA_STATUS[status];
  return (
    <span
      className='inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold'
      style={mediaToneStyle(meta.tone)}
    >
      <span
        className='size-1.5 rounded-full'
        style={{ background: mediaToneColor(meta.tone) }}
        aria-hidden
      />
      {t(meta.labelKey)}
    </span>
  );
};

export const RoleTag = ({
  role,
  className,
}: {
  role: FunnelRoleId;
  className?: string;
}) => {
  const t = useTranslations('portalV2.media');
  const meta = FUNNEL_ROLES[role];
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold',
        className
      )}
      style={mediaToneStyle(meta.tone)}
    >
      {t(meta.labelKey)}
    </span>
  );
};
