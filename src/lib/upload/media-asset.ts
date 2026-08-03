import { rexerApi } from '@/services/rexer/endpoints';

/**
 * Chỉ PUT thẳng khi presigned_url là storage external thật (S3…).
 * BE local trả presigned_url = endpoint raw `/v1/media/uploads/{id}/raw`
 * (không proxy) → browser 404. Trường hợp đó dùng uploadRaw (/api/rexer).
 */
export function shouldUploadViaPresignedUrl(presignedUrl?: string): boolean {
  return (
    !!presignedUrl &&
    /^https?:\/\//i.test(presignedUrl) &&
    !presignedUrl.includes('/media/uploads/')
  );
}

/**
 * Upload 1 file ảnh → media asset (init → presigned PUT / raw → complete).
 * Trả về media_asset (có `.id` để gán thumbnail_asset_id + `.public_url` preview).
 * Dùng chung cho các form cần thumbnail (landing, block…).
 */
export async function uploadImageAsset(file: File) {
  const mime = file.type || 'image/png';
  const init = await rexerApi.media.initUpload({
    filename: file.name,
    mime_type: mime,
    file_size: file.size,
    owner_scope: 'library',
    media_type: 'image',
  });

  if (shouldUploadViaPresignedUrl(init.presigned_url)) {
    const res = await fetch(init.presigned_url!, {
      method: 'PUT',
      headers: { 'Content-Type': mime },
      body: file,
    });
    if (!res.ok) throw new Error(`Storage upload lỗi ${res.status}`);
  } else {
    await rexerApi.media.uploadRaw(init.upload_id, file);
  }

  const done = await rexerApi.media.completeUpload({
    upload_id: init.upload_id,
  });
  return done.media_asset;
}
