import type {
  BrandColor,
  BrandData,
  BrandLogo,
  BrandPersona,
} from '@/lib/portal-v2/brand/types';
import type {
  RxBrandProfile,
  RxProfileColor,
  RxProfileLogo,
  RxProfilePersona,
} from '@/services/rexer-v2/types/brandProfile';

/**
 * `BrandProfile` (BE) ↔ `BrandData` (Portal V2).
 *
 * Hai shape khớp gần như một-một, khác ở cách đặt tên và BỐN chỗ lệch kiểu —
 * đúng những chỗ dễ mất dữ liệu trong im lặng:
 *
 *   FE                     BE                  vì sao đáng ghi ra
 *   ─────────────────────────────────────────────────────────────────────
 *   persona.n              name                đổi tên
 *   logo.asset            media_id            đổi tên
 *   imagery.refs          ref_media_ids       đổi tên
 *   type.weights: string  weights: number[]   ĐỔI KIỂU — "400, 600" ↔ [400,600]
 *
 * `id` của persona/logo/color là khoá React phía client, BE không có. Sinh lại
 * khi đọc xuống, và bỏ đi khi gửi lên.
 */

const idOf = (prefix: string, i: number) => `${prefix}-${i}`;

/** "400, 600, 700" → [400,600,700]. Bỏ mọi thứ không phải số. */
const parseWeights = (raw: string): number[] =>
  raw
    .split(/[,\s/]+/)
    .map(x => Number.parseInt(x, 10))
    .filter(n => Number.isFinite(n));

/**
 * Hồ sơ TRỐNG — dùng khi chưa nạp được, thay cho `MOCK_BRAND`.
 *
 * Vẽ mock ở đó là màn hình nói dối: người dùng đọc "Ilia Beauty" rồi tưởng đó
 * là brand của mình. Mapper vốn đã chịu được mọi trường thiếu, nên một object
 * rỗng là đủ để ra đúng khung trống.
 */
export const emptyBrandData = (): BrandData =>
  profileToBrandData({ version: 0 } as RxBrandProfile);

export const profileToBrandData = (p: RxBrandProfile): BrandData => ({
  identity: {
    name: p.identity?.name ?? '',
    description: p.identity?.description ?? '',
    mission: p.identity?.mission ?? '',
    valueProp: p.identity?.value_prop ?? '',
    positioning: {
      category: p.identity?.positioning?.category ?? '',
      against: p.identity?.positioning?.against ?? '',
      because: p.identity?.positioning?.because ?? '',
    },
    categories: p.identity?.categories ?? [],
    industry: p.identity?.industry ?? '',
    differentiation: p.identity?.differentiation ?? [],
    tones: p.identity?.tones ?? [],
  },
  essence: {
    functional: p.essence?.functional ?? [],
    emotional: p.essence?.emotional ?? [],
    social: p.essence?.social ?? [],
    personality: p.essence?.personality ?? [],
    perception: p.essence?.perception ?? '',
  },
  audience: (p.audience ?? []).map((a: RxProfilePersona, i): BrandPersona => ({
    id: a.id || idOf('persona', i),
    n: a.name ?? '',
    tier: a.tier ?? '',
    behaves: a.behaves ?? '',
    stage: a.stage ?? '',
    awareness: a.awareness ?? '',
    motivations: a.motivations ?? [],
    objections: a.objections ?? [],
    action: a.action ?? '',
    desired: a.desired ?? '',
  })),
  visual: {
    logos: (p.visual?.logos ?? []).map((l: RxProfileLogo, i): BrandLogo => ({
      id: idOf('logo', i),
      n: l.name ?? '',
      use: l.use ?? '',
      asset: l.media_id || null,
    })),
    colors: (p.visual?.colors ?? []).map(
      (c: RxProfileColor, i): BrandColor => ({
        id: idOf('color', i),
        n: c.name ?? '',
        hex: c.hex ?? '',
        role: c.role ?? '',
      })
    ),
    type: {
      display: p.visual?.type?.display ?? '',
      body: p.visual?.type?.body ?? '',
      weights: (p.visual?.type?.weights ?? []).join(', '),
      scale: p.visual?.type?.scale ?? '',
      files: p.visual?.type?.files ?? [],
    },
    layout: p.visual?.layout ?? [],
    imagery: {
      direction: p.visual?.imagery?.direction ?? '',
      refs: p.visual?.imagery?.ref_media_ids ?? [],
    },
  },
});

export const brandDataToPut = (d: BrandData, version: number) => ({
  // `version` là khoá chống ghi đè: BE từ chối nếu bản trên máy chủ đã đổi.
  // Gửi bừa số 1 là mở đường cho hai tab ghi đè lẫn nhau.
  version,
  identity: {
    name: d.identity.name,
    description: d.identity.description,
    mission: d.identity.mission,
    value_prop: d.identity.valueProp,
    positioning: d.identity.positioning,
    categories: d.identity.categories,
    industry: d.identity.industry,
    differentiation: d.identity.differentiation,
    tones: d.identity.tones,
  },
  essence: d.essence,
  audience: d.audience.map(a => ({
    id: a.id,
    name: a.n,
    tier: a.tier,
    // BE bắt buộc trường này. Rỗng thì lùi về mô tả hành vi suy từ chặng mua,
    // hơn là để cả lượt lưu chết vì một ô người dùng không nhìn thấy.
    behaves: a.behaves?.trim() || `Ở chặng ${a.stage || 'khám phá'}`,
    stage: a.stage,
    awareness: a.awareness,
    motivations: a.motivations,
    objections: a.objections,
    action: a.action,
    desired: a.desired,
  })),
  visual: {
    // `media_id` bắt buộc bên BE, nên logo chưa gắn ảnh bị loại thay vì gửi
    // chuỗi rỗng và ăn 400 cho cả lượt lưu.
    logos: d.visual.logos
      .filter(l => l.asset)
      .map(l => ({ name: l.n, use: l.use, media_id: l.asset as string })),
    colors: d.visual.colors.map(c => ({
      name: c.n,
      hex: c.hex,
      role: c.role,
    })),
    type: {
      display: d.visual.type.display,
      body: d.visual.type.body,
      weights: parseWeights(d.visual.type.weights),
      scale: d.visual.type.scale,
      files: d.visual.type.files,
    },
    layout: d.visual.layout,
    imagery: {
      direction: d.visual.imagery.direction,
      ref_media_ids: d.visual.imagery.refs,
    },
  },
});
