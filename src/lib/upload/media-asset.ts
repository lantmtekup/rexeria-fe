import { rexerApi } from '@/services/rexer/endpoints';

/**
 * Upload 1 file ảnh → media asset (init → presigned PUT / raw → complete).
 * Trả về media_asset (có `.id` để gán thumbnail_asset_id + `.public_url` preview).
 * Dùng chung cho các form cần thumbnail (landing, block…).
 */
export async function uploadImageAsset(file: File) {
  const init = await rexerApi.media.initUpload({
    filename: file.name,
    mime_type: file.type || 'image/png',
    file_size: file.size,
    owner_scope: 'library',
    media_type: 'image',
  });
  if (init.presigned_url) {
    const res = await fetch(init.presigned_url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'image/png' },
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
