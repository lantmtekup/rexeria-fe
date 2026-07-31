import { mapRexerMediaAssetToUi } from '@/lib/portal-v2/media/mapMediaAsset';
import type { MediaAsset } from '@/lib/portal-v2/media/types';
import { errorMessage } from '@/services/portal-v2/_error';
import { rexerApi } from '@/services/rexer/endpoints';
import type { InitUploadRequest } from '@/services/rexer/types';

export type MediaUploadFailure = {
  filename: string;
  message: string;
};

export type MediaUploadResult = {
  assets: MediaAsset[];
  failures: MediaUploadFailure[];
};

export type MediaUploadProgress = (done: number, total: number) => void;

const FALLBACK_MIME = 'application/octet-stream';

/**
 * BE `media_type` chỉ nhận image | video | file — không có '3d', nên GLB/USDZ
 * đi vào nhánh 'file' và mapper sẽ suy ra kind từ mime khi list lại.
 */
const mediaKindOf = (
  mime: string
): NonNullable<InitUploadRequest['media_type']> => {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  return 'file';
};

/**
 * Upload 1 file: POST /media/uploads/init → PUT raw bytes → POST
 * /media/uploads/complete. Throw khi bất kỳ bước nào hỏng — dùng
 * `uploadMediaFiles` nếu cần bản không throw.
 */
export const uploadMediaFile = async (file: File): Promise<MediaAsset> => {
  const mime = file.type || FALLBACK_MIME;

  const init = await rexerApi.media.initUpload({
    filename: file.name,
    mime_type: mime,
    file_size: file.size,
    owner_scope: 'library',
    media_type: mediaKindOf(mime),
  });

  // Chỉ PUT thẳng khi presigned_url là URL storage EXTERNAL thật (S3…). BE local
  // trả presigned_url = chính endpoint raw `/v1/media/uploads/{id}/raw` (không
  // proxy) → browser 404. Trường hợp đó đi qua uploadRaw (/api/rexer rewrite).
  const presigned = init.presigned_url;
  const useDirect =
    !!presigned &&
    /^https?:\/\//i.test(presigned) &&
    !presigned.includes('/media/uploads/');

  if (useDirect) {
    const res = await fetch(presigned, {
      method: 'PUT',
      headers: { 'Content-Type': mime },
      body: file,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  } else {
    await rexerApi.media.uploadRaw(init.upload_id, file);
  }

  const done = await rexerApi.media.completeUpload({
    upload_id: init.upload_id,
  });
  return mapRexerMediaAssetToUi(done.media_asset);
};

/**
 * Upload tuần tự nhiều file. Không throw: file hỏng rơi vào `failures` kèm
 * message thật của RxApiError, file còn lại vẫn chạy tiếp.
 */
export const uploadMediaFiles = async (
  files: File[],
  onProgress?: MediaUploadProgress
): Promise<MediaUploadResult> => {
  const assets: MediaAsset[] = [];
  const failures: MediaUploadFailure[] = [];
  let done = 0;

  for (const file of files) {
    try {
      assets.push(await uploadMediaFile(file));
    } catch (err) {
      failures.push({
        filename: file.name,
        message: errorMessage(err, 'Upload failed'),
      });
    } finally {
      done += 1;
      onProgress?.(done, files.length);
    }
  }

  return { assets, failures };
};
