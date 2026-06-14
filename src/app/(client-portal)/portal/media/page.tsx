'use client';

import { FolderArchive } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { MediaLibrary } from '@/components/modules/Media/MediaLibrary';

import { PortalShell } from '../_shell';

/**
 * Portal media library — asset của brand đang đăng nhập. Dùng chung component
 * <MediaLibrary> với admin (admin truyền brandId để xem hộ; portal để trống →
 * BE auto scope theo brand của user). Wire API thật (thay mock cũ).
 */
export default function PortalMediaPage() {
  const t = useTranslations('portal');

  return (
    <PortalShell>
      <section>
        <div className='text-2xs text-content-muted flex items-center gap-2 font-semibold tracking-wider uppercase'>
          <FolderArchive className='size-3' /> {t('media.eyebrow')}
        </div>
        <h1 className='mt-1 text-2xl font-bold tracking-tight'>
          {t('media.title')}
        </h1>
        <p className='text-content-muted mt-1 text-sm'>
          {t('media.description')}
        </p>
      </section>

      <div className='mt-6'>
        <MediaLibrary />
      </div>
    </PortalShell>
  );
}
