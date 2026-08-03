import { errorMessage } from '@/services/portal-v2/_error';
import { rexerApi } from '@/services/rexer/endpoints';

export type MediaDeleteResult = {
  ok: boolean;
  /** Message thật của BE khi `ok === false`, để hiện ở description của toast. */
  error: string | null;
};

const OK: MediaDeleteResult = { ok: true, error: null };

/** DELETE /media/{id} — xoá 1 asset. */
export const deleteMediaAsset = async (
  id: string
): Promise<MediaDeleteResult> => {
  try {
    await rexerApi.media.remove(id);
    return OK;
  } catch (err) {
    return { ok: false, error: errorMessage(err, 'Delete failed') };
  }
};

/** POST /media/bulk-delete — xoá nhiều asset trong 1 request. */
export const deleteMediaAssets = async (
  ids: string[]
): Promise<MediaDeleteResult> => {
  if (!ids.length) return OK;
  try {
    await rexerApi.media.bulkDelete(ids);
    return OK;
  } catch (err) {
    return { ok: false, error: errorMessage(err, 'Delete failed') };
  }
};
