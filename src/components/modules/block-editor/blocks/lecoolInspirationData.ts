/**
 * Default + toán bố cục cỗ bài cho block `lecool_inspiration`.
 *
 * apps chốt cứng `N = 5`; ở đây số lá là content nên mọi công thức nhận `count`.
 */
import type { LecoolInspirationCard, LecoolInspirationContent } from '../types';

export const DEFAULT_INSPIRATION_CARDS: LecoolInspirationCard[] = [
  {
    title: '01 Studio Light',
    imageUrl: '/lecool/inspiration/image-1.jpg',
    alt: 'Inspiration — studio light',
  },
  {
    title: '02 In Motion',
    imageUrl: '/lecool/inspiration/image-2.jpg',
    alt: 'Inspiration — in motion',
  },
  {
    title: '03 The Atelier',
    imageUrl: '/lecool/inspiration/image-3.jpg',
    alt: 'Inspiration — the atelier',
  },
  {
    title: '04 Colour Study',
    imageUrl: '/lecool/inspiration/image-4.png',
    alt: 'Inspiration — colour study',
  },
  {
    title: '05 Off Duty',
    imageUrl: '/lecool/inspiration/image-5.png',
    alt: 'Inspiration — off duty',
  },
];

export function resolveInspirationCards(
  content: LecoolInspirationContent
): LecoolInspirationCard[] {
  const raw = content.cards;
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_INSPIRATION_CARDS;
  return raw.map(card =>
    card && typeof card === 'object' ? card : ({} as LecoolInspirationCard)
  );
}

/* ── Toán cỗ bài (giữ nguyên số của apps) ────────────────────────────────── */

export const CARD_W = 420;
export const CARD_H = (CARD_W * 4) / 5;
export const STAGE_PERSPECTIVE = 2400;
export const FACE_PERSPECTIVE = 1800;

/** Trạng thái xếp chồng: mỗi lá lùi lên trên và nhỏ đi một nấc. */
export const STACK_STEP_Y = -38;
export const STACK_STEP_S = 0.08;

/** Trạng thái bung quạt. */
export const FAN_SCALE = 1;
export const FAN_ROTY = -50;
export const DECK_GAP = 200;
export const FAN_EDGE_GUTTER = 48;

export const FAN_DUR = 0.7;
export const FAN_EASE = 'power3.out';
export const LIFT_DUR = 0.3;
export const LIFT_Y = -64;
export const TITLE_DUR = 0.35;
export const TITLE_SLIDE = 8;

const FAN_SIN = Math.sin((FAN_ROTY * Math.PI) / 180);
const FAN_COS = Math.cos((FAN_ROTY * Math.PI) / 180);

/** Hệ số thu nhỏ do phối cảnh ở độ sâu z. */
const depthAt = (z: number) => STAGE_PERSPECTIVE / (STAGE_PERSPECTIVE - z);

/**
 * Vị trí từng lá khi bung quạt: rải đều dọc trục sâu rồi xoay theo `FAN_ROTY`,
 * kèm mép trái/phải SAU phối cảnh để đo bề ngang thật của cả bộ.
 */
export function deckLayout(count: number, gap: number, scale: number) {
  const mid = (count - 1) / 2;
  return Array.from({ length: count }, (_, i) => {
    const zLocal = -(i - mid) * gap;
    const x = zLocal * FAN_SIN;
    const z = zLocal * FAN_COS;
    const d = depthAt(z);
    const halfW = ((CARD_W * scale * Math.abs(FAN_COS)) / 2) * d;
    return { x, z, left: x * d - halfW, right: x * d + halfW };
  });
}

/**
 * Hệ số co để cả bộ bài lọt trong bề ngang `room`. Hai vòng là đủ: vòng đầu
 * ước lượng, vòng sau chỉnh lại vì thu nhỏ cũng đổi luôn phối cảnh.
 */
export function fitDeck(count: number, room: number) {
  let fit = 1;
  for (let pass = 0; pass < 2; pass += 1) {
    const probe = deckLayout(count, DECK_GAP * fit, FAN_SCALE * fit);
    const span = probe[count - 1].right - probe[0].left;
    if (span <= room) break;
    fit *= room / span;
  }
  return fit;
}

/** Pill tên bám mép trên lá; lá thu nhỏ thì mép trên tụt xuống bấy nhiêu. */
export const pillOffset = (faceScale: number) =>
  Math.min(0, -((CARD_H * faceScale - CARD_H) / 2));
