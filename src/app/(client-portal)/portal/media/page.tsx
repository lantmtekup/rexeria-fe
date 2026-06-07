'use client';

import { FolderArchive } from 'lucide-react';

import { MediaLibrary } from '@/components/modules/Media/MediaLibrary';

import { PortalShell } from '../_shell';

/**
 * Portal media library — asset của brand đang đăng nhập. Dùng chung component
 * <MediaLibrary> với admin (admin truyền brandId để xem hộ; portal để trống →
 * BE auto scope theo brand của user). Wire API thật (thay mock cũ).
 */
export default function PortalMediaPage() {
  return (
    <PortalShell>
      <section>
        <div className='text-2xs text-content-muted flex items-center gap-2 font-semibold tracking-wider uppercase'>
          <FolderArchive className='size-3' /> Thư viện
        </div>
        <h1 className='mt-1 text-2xl font-bold tracking-tight'>Media</h1>
        <p className='text-content-muted mt-1 text-sm'>
          Upload & quản lý hình ảnh, video, tài liệu của thương hiệu. Tổ chức
          theo thư mục, gắn tag để tái sử dụng trong landing.
        </p>
      </section>

      <div className='mt-6'>
        <MediaLibrary />
      </div>
    </PortalShell>
  );
}
