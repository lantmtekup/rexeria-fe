import type { Layer } from './layers';

/**
 * Hệ toạ độ chung = panel intro 1920×1080 (tile intro-x0-y800). Tile intro
 * trên/dưới lệch -800 so với panel. Stage vẽ cả khung intro nên panel nằm ở
 * y = 800 trong stage.
 */
export const PANEL = { w: 1920, h: 1080, offsetY: 800 } as const;

/**
 * Panel Life (6480×1080) nằm SAU intro, nhìn qua lỗ giữa tấm Dioscuri.
 * Mọi vị trí tính theo toạ độ panel Life (đúng toạ độ trong tên file).
 *
 * start — scale 1 (1 life-px = 1 đơn vị panel intro, cùng tỉ lệ với tấm
 *   Dioscuri), gốc (-134, -136): tâm nhà (life ~1166, 650) rơi vào giữa
 *   lỗ, hơi cao để lộ rõ nhà.
 * zoom  — scroll tới thì phóng thêm một chút rồi dừng (không phải thu nhỏ
 *   lúc đầu rồi phóng to). Màn cao mà 1.35× chưa phủ đủ panel thì phóng thêm
 *   và dời tâm cho khỏi lộ mép — xem computeLifeFrame.
 */
export const LIFE = {
  start: { x: -134, y: -136, scale: 1 },
  zoom: 1.35,
  alpha: 0.7,
} as const;

export const LIFE_START_CENTER = {
  cx: (PANEL.w / 2 - LIFE.start.x) / LIFE.start.scale,
  cy: (PANEL.h / 2 - LIFE.start.y) / LIFE.start.scale,
};

// Phía trên mây là trời trống (trùng màu nền) nên cho phép khung cuối vượt
// mép trên panel tới mức này; mép dưới (đất) thì không được lộ.
export const LIFE_SKY_SLACK = 400; // life-px
// Biên px quanh màn để mouse parallax không kéo lộ mép.
export const LIFE_EDGE_MARGIN = 24;
// Mép trên tile mây có nét bị cắt ngang → mask tan dần trong chừng này life-px.
export const LIFE_TOP_FADE = 220;

// Hạ cả cảnh hero xuống một chút (theo chiều cao màn) để chữ DIOSCURI không
// sát logo header. Áp cho cả hai stage nên Life vẫn khớp lỗ cổng.
export const SCENE_DROP = 0.05;

/**
 * Nhóm lớp Life, thứ tự = thứ tự chồng (xa → gần).
 *   depth — biên độ mouse parallax (nhân PUSH trong pointer.ts)
 * memories-fg (khung ảnh gần) tách khỏi memories để trôi nhanh hơn.
 */
export const LIFE_GROUPS = [
  { key: 'clouds', depth: 0.08 },
  { key: 'farm', depth: 0.22 },
  { key: 'midground', depth: 0.55 },
  { key: 'memories', depth: 0.5 },
  { key: 'memoriesFg', depth: 0.6 },
  { key: 'foreground', depth: 0.45 },
] as const;

export type LifeGroupKey = (typeof LIFE_GROUPS)[number]['key'];

const groupKeyOf = (l: Layer): string =>
  l.group === 'memories' && /-fg-/.test(l.src) ? 'memoriesFg' : l.group;

export type LifeGroup = (typeof LIFE_GROUPS)[number] & { layers: Layer[] };

export const groupLife = (
  life: Layer[],
  filter: (l: Layer) => boolean = () => true
): LifeGroup[] =>
  LIFE_GROUPS.map(g => ({
    ...g,
    layers: life.filter(l => groupKeyOf(l) === g.key && filter(l)),
  })).filter(g => g.layers.length > 0);

/** Bao của nền Life (mây + đồng) — khung nhìn không được vượt mép. */
export const lifeBoundsOf = (life: Layer[]) => {
  const backdrop = life.filter(l => l.group === 'clouds' || l.group === 'farm');
  return {
    left: Math.min(...backdrop.map(l => l.x)),
    right: Math.max(...backdrop.map(l => l.x + l.w)),
    contentTop: Math.min(...backdrop.map(l => l.y)),
    top: Math.min(...backdrop.map(l => l.y)) - LIFE_SKY_SLACK,
    bottom: Math.max(...backdrop.map(l => l.y + l.h)),
  };
};
export type LifeBounds = ReturnType<typeof lifeBoundsOf>;

/** Khung stage intro = bao của các tile intro; panel là tâm màn. */
export const introFrameOf = (intro: Layer[]) => {
  const w = Math.max(...intro.map(l => l.x + l.w));
  const h = Math.max(...intro.map(l => l.y + l.h));
  return { w, h, focusY: (PANEL.offsetY + PANEL.h / 2) / h };
};
export type IntroFrame = ReturnType<typeof introFrameOf>;

const clamp = (min: number, max: number, v: number) =>
  Math.min(max, Math.max(min, v));

/**
 * Khung dừng của Life ở cuối zoom hero, tính theo kích thước màn thật.
 *   W, H     — innerWidth/innerHeight (như camera hero đang dùng)
 *   stageW   — bề ngang stage thật (= max(100cqw, 80cqh))
 *   stickyW/H — kích thước khung sticky (tâm camera; H là cqh của stage)
 *
 *   k  = px màn / life-px lúc đầu
 *   P  = px màn / life-px ở cuối = max(k × LIFE.zoom, đủ phủ panel)
 *   c1 = tâm lúc đầu, kẹp trong bao panel theo nửa khung nhìn ở P.
 * Trả về cả tham số camera cho Hero (S1, x1, y1) lẫn vị trí màn của gốc
 * panel Life (originX/Y) để section khác dựng lại đúng khung này.
 */
export const computeLifeFrame = ({
  W,
  H,
  stageW,
  stickyW,
  stickyH,
  bounds,
  frame,
}: {
  W: number;
  H: number;
  stageW: number;
  stickyW: number;
  stickyH: number;
  bounds: LifeBounds;
  frame: IntroFrame;
}) => {
  const m = LIFE_EDGE_MARGIN;
  const k = (stageW / frame.w) * LIFE.start.scale;
  const P = Math.max(
    k * LIFE.zoom,
    (H + 2 * m) / (bounds.bottom - bounds.top),
    (W + 2 * m) / (bounds.right - bounds.left)
  );
  // Tâm màn lúc đầu: tâm panel, lệch lên vì SCENE_DROP đã hạ stage.
  const c0x = LIFE_START_CENTER.cx;
  const c0y = LIFE_START_CENTER.cy - (SCENE_DROP * H) / k;
  const halfW = (W / 2 + m) / P;
  const halfH = (H / 2 + m) / P;
  const c1x = clamp(bounds.left + halfW, bounds.right - halfW, c0x);
  const c1y = clamp(bounds.top + halfH, bounds.bottom - halfH, c0y);

  const S1 = P / k;
  const x1 = -(c1x - c0x) * P;
  const y1 = -(c1y - c0y) * P;

  // Gốc panel Life (0,0) trên màn lúc đầu: stage căn giữa ngang, tâm panel
  // ở giữa khung sticky rồi hạ SCENE_DROP (cqh); sau đó camera Life phóng
  // S1 quanh tâm khung sticky và dịch (x1, y1).
  const unit = stageW / frame.w; // px / đơn vị stage
  const stageLeft = stickyW / 2 - stageW / 2;
  const stageTop =
    stickyH / 2 -
    frame.focusY * stageW * (frame.h / frame.w) +
    SCENE_DROP * stickyH;
  const pre0x = stageLeft + LIFE.start.x * unit;
  const pre0y = stageTop + (PANEL.offsetY + LIFE.start.y) * unit;

  return {
    k,
    P,
    S1,
    x1,
    y1,
    originX: stickyW / 2 + (pre0x - stickyW / 2) * S1 + x1,
    originY: stickyH / 2 + (pre0y - stickyH / 2) * S1 + y1,
  };
};

/** Mask tan mép trên panel Life, theo % của một hộp cao `boxH` đơn vị. */
export const lifeTopMask = (
  topInBox: number,
  fadeInBox: number,
  boxH: number
) =>
  `linear-gradient(to bottom, transparent ${(topInBox / boxH) * 100}%, #000 ${((topInBox + fadeInBox) / boxH) * 100}%)`;
