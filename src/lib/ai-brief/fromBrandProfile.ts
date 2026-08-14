import type { RxBrandProfile } from '@/services/rexer-v2/types/brandProfile';
import { fetchMediaByIds } from '@/services/portal-v2/mediaCatalog';
import type { AiBrandBrief } from './types';

/**
 * `RxBrandProfile` → `AiBrandBrief` — mapping thuần, không gọi API. Logo cần
 * resolve riêng qua `resolveBrandLogoUrl` vì `visual.logos[].media_id` chưa
 * phải URL. Field rỗng thì bỏ qua thay vì gửi chuỗi/mảng rỗng lên AI.
 */
export const buildBrandBrief = (profile: RxBrandProfile): AiBrandBrief => {
  const { identity, visual } = profile;
  const { category, against, because } = identity.positioning;
  const positioning = [category, against, because].filter(Boolean).join(' — ');

  const fonts =
    visual.type.display || visual.type.body
      ? {
          ...(visual.type.display ? { display: visual.type.display } : {}),
          ...(visual.type.body ? { body: visual.type.body } : {}),
        }
      : undefined;

  return {
    ...(identity.name ? { name: identity.name } : {}),
    ...(identity.value_prop ? { tagline: identity.value_prop } : {}),
    ...(identity.tones.length ? { tone: identity.tones } : {}),
    ...(positioning ? { positioning } : {}),
    ...(visual.colors.length ? { colors: visual.colors } : {}),
    ...(fonts ? { fonts } : {}),
  };
};

/**
 * Lấy URL thật của logo chính (`visual.logos[0]`) qua `fetchMediaByIds` —
 * cùng hàm mà `VisualPanel` (màn Brand) đã dùng để render preview logo, nên
 * brief không tự viết lại logic resolve media riêng.
 */
export const resolveBrandLogoUrl = async (
  profile: RxBrandProfile
): Promise<string | undefined> => {
  const mediaId = profile.visual.logos[0]?.media_id;
  if (!mediaId) return undefined;
  const resolved = await fetchMediaByIds([mediaId]);
  return resolved[mediaId]?.url;
};
