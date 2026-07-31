'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/molecules/portal-v2/Button';

type MediaBulkBarProps = {
  count: number;
  deleting: boolean;
  onAutoTag: () => void;
  onLink: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onClear: () => void;
};

export const MediaBulkBar = ({
  count,
  deleting,
  onAutoTag,
  onLink,
  onArchive,
  onDelete,
  onClear,
}: MediaBulkBarProps) => {
  const t = useTranslations('portalV2.media');

  return (
    <div className='mb-3.5 flex flex-wrap items-center gap-2 rounded-[var(--pv2-r)] border border-[var(--pv2-hair)] bg-[var(--pv2-paper)] px-4 py-2.5'>
      <span className='text-[12.5px] font-semibold text-[var(--pv2-ink)]'>
        {t('selectedCount', { count })}
      </span>
      <Button variant='ghost' size='sm' onClick={onAutoTag}>
        {t('autoTag')}
      </Button>
      <Button variant='ghost' size='sm' onClick={onLink}>
        {t('linkToProduct')}
      </Button>
      <Button variant='ghost' size='sm' onClick={onArchive}>
        {t('archive')}
      </Button>
      <Button variant='danger' size='sm' disabled={deleting} onClick={onDelete}>
        {t('delete')}
      </Button>
      <div className='grow' />
      <Button variant='ghost' size='sm' onClick={onClear}>
        {t('clear')}
      </Button>
    </div>
  );
};
