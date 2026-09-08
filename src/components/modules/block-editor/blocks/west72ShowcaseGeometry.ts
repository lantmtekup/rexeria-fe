/**
 * Hình học showcase 212 West — port từ apps/212-west data/showcase.ts.
 * Chỉ tính toán thuần, không React (dùng chung block + sub-component hotspot).
 */
import type { West72ShowcaseContent, West72ShowcaseHotspot } from '../types';

/** Tỉ lệ khung desktop khi không full màn. */
export const SHOWCASE_FRAME_RATIO = 12 / 7;

/** Bề rộng cột thẻ nội dung trên desktop (%). */
export const SHOWCASE_CARD_WIDTH = 32.5;

/** Số rèm dọc (không kể cột thẻ). */
const BAND_COUNT = 3;

/**
 * Dot lưu theo hệ toạ độ khung 12/7 (ảnh `object-cover`). Trên khung hẹp ảnh
 * hiện `object-contain` theo tỉ lệ gốc → quy đổi lại phần ảnh bị crop.
 */
export function naturalHotspotPosition(
  hotspot: West72ShowcaseHotspot,
  imageWidth: number,
  imageHeight: number
) {
  const source = imageWidth / imageHeight;
  if (source < SHOWCASE_FRAME_RATIO) {
    const shown = (100 * SHOWCASE_FRAME_RATIO) / source;
    return {
      x: hotspot.dotX,
      y: ((hotspot.dotY + (shown - 100) / 2) / shown) * 100,
    };
  }
  const shown = (100 * source) / SHOWCASE_FRAME_RATIO;
  return {
    x: ((hotspot.dotX + (shown - 100) / 2) / shown) * 100,
    y: hotspot.dotY,
  };
}

const MARKER_SPACING = 0.085;
const MARKER_INSET = 4;

/** Đẩy các marker chồng nhau ra xa (relax 16 vòng) cho bản khung hẹp. */
export function narrowMarkerPositions(
  hotspots: West72ShowcaseHotspot[],
  imageWidth: number,
  imageHeight: number
) {
  const aspect = imageWidth / imageHeight;
  const points = hotspots.map((hotspot, index) => {
    const at = naturalHotspotPosition(hotspot, imageWidth, imageHeight);
    return { x: at.x / 100, y: at.y / (100 * aspect), index };
  });

  for (let pass = 0; pass < 16; pass += 1) {
    let moved = false;
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const dx = points[j].x - points[i].x;
        const dy = points[j].y - points[i].y;
        const distance = Math.hypot(dx, dy);
        if (distance >= MARKER_SPACING) continue;
        const push = (MARKER_SPACING - distance) / 2;
        const ux = distance > 1e-6 ? dx / distance : i % 2 === 0 ? 1 : -1;
        const uy = distance > 1e-6 ? dy / distance : 1;
        points[i].x -= ux * push;
        points[i].y -= uy * push;
        points[j].x += ux * push;
        points[j].y += uy * push;
        moved = true;
      }
    }
    if (!moved) break;
  }

  const clamp = (value: number) =>
    Math.min(100 - MARKER_INSET, Math.max(MARKER_INSET, value));

  return points.map(point => ({
    x: clamp(point.x * 100),
    y: clamp(point.y * 100 * aspect),
  }));
}

export type ShowcasePanelSpec = {
  index: number;
  exit: 'up' | 'down';
  isCardColumn: boolean;
  narrowLeft: number;
  narrowWidth: number;
  wideLeft: number;
  wideWidth: number;
};

/**
 * Rèm reveal: 4 cột, cột thẻ đứng cùng phía thẻ nội dung. App hard-code từng
 * section — ở đây suy ra từ `cardAnchor` nên CMS chỉ cần 1 field vị trí thẻ.
 *
 * - 3 dải ảnh: xen kẽ xuống/lên theo index (như app).
 * - Cột thẻ: PHẢI thoát RA XA thẻ, không theo chẵn/lẻ. Trên khung rộng nó là
 *   mask `flex-1` nằm phần còn lại của cột: thẻ neo trên → mask ở dưới → thoát
 *   xuống; thẻ neo dưới (`flex-col-reverse`) → mask ở trên → thoát lên. Suy
 *   theo index thì trùng app ở Kitchens (idx 0, thẻ trên) và Landmark (idx 3,
 *   thẻ dưới) nhưng SAI với thẻ neo trên-phải (idx 3, thẻ trên) — mask trượt
 *   lên đè mất tiêu đề.
 */
export function resolveShowcasePanels(
  cardAnchor: West72ShowcaseContent['cardAnchor']
): ShowcasePanelSpec[] {
  const total = BAND_COUNT + 1;
  const cardOnRight = cardAnchor !== 'top-left';
  const cardAtBottom = cardAnchor === 'bottom-right';
  const cardColumnIndex = cardOnRight ? total - 1 : 0;
  const bandWidth = (100 - SHOWCASE_CARD_WIDTH) / BAND_COUNT;
  const narrowWidth = 100 / total;

  let cursor = 0;
  return Array.from({ length: total }, (_, index) => {
    const isCardColumn = index === cardColumnIndex;
    const wideWidth = isCardColumn ? SHOWCASE_CARD_WIDTH : bandWidth;
    const wideLeft = cursor;
    cursor += wideWidth;
    const exit: 'up' | 'down' = isCardColumn
      ? cardAtBottom
        ? 'up'
        : 'down'
      : index % 2 === 0
        ? 'down'
        : 'up';
    return {
      index,
      exit,
      isCardColumn,
      narrowLeft: index * narrowWidth,
      narrowWidth,
      wideLeft,
      wideWidth,
    };
  });
}

/** Dịch chuyển chữ khi reveal (px ở bề rộng thiết kế 1440). */
export const SHOWCASE_TEXT_SHIFT = {
  split: { heading: 88, copy: 40, copyScaleFrom: 1.357 },
  combined: { group: -16, copyScaleFrom: 1.25 },
} as const;
