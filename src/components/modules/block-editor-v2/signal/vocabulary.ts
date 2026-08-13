/**
 * Signal capture — semantic vocabulary (port từ prototype
 * `plan-v2/rexer-demo-v3_new.html` ~L3777–3805, 7203–7276).
 *
 * Hai tầng đo lường:
 *   BLOCK signals    — block có làm tròn vai không? (dwell, scroll, tap, …)
 *   TRACKING POINTS  — component nào đã làm nên chuyện? Mỗi tracking point
 *                      khai báo Ý NGHĨA ("Khách hàng đã so sánh sản phẩm"),
 *                      không phải cái click ("button_click_id_47").
 *
 * Mọi key (`type`, `event`, `object`, `privacy`) là string mở — vocabulary này
 * là nguồn label/option cho editor, không phải union đóng của wire format.
 */
import type {
  Block,
  ComponentSignalConfig,
} from '@/components/modules/block-editor/types';

import { BACKGROUND_LAYER_KEY, elementsForType } from '../LayersPanel';
import type { LayerElement } from '../LayersPanel';
import { resolveElementMeta } from '../resolveElementKind';

/** Bucket thô của component — quyết định type/event nào áp dụng được. */
export type SignalComponentKind = 'text' | 'media' | 'button' | 'product';

export interface SignalTypeDef {
  /** Tên hiển thị (giữ tiếng Anh — đây là taxonomy, không phải copy). */
  n: string;
  /** Funnel role mà type này nuôi. `null` = Friction, không thuộc stage nào. */
  r: string | null;
  /** Mô tả ngắn cho option. */
  d: string;
  /** Động từ trong câu nghĩa: "Khách hàng {say} …". */
  say: string;
}

export const SIGNAL_TYPES: Record<string, SignalTypeDef> = {
  EXPOSURE: {
    n: 'Exposure',
    r: 'ATT',
    d: 'Họ đã nhìn thấy nó',
    say: 'đã nhìn thấy',
  },
  ENGAGEMENT: {
    n: 'Engagement',
    r: 'EDU',
    d: 'Họ dành sự chú ý cho nó',
    say: 'đã chú ý tới',
  },
  EXPLORATION: {
    n: 'Exploration',
    r: 'EXP',
    d: 'Họ chủ động tìm hiểu nó',
    say: 'đã khám phá',
  },
  PREFERENCE: {
    n: 'Preference',
    r: 'EXP',
    d: 'Họ chọn giữa các lựa chọn',
    say: 'đã thể hiện ưu tiên với',
  },
  COMPARISON: {
    n: 'Comparison',
    r: 'EXP',
    d: 'Họ cân nhắc các phương án',
    say: 'đã so sánh',
  },
  TRUST: {
    n: 'Trust',
    r: 'TRU',
    d: 'Họ tìm bằng chứng để tin',
    say: 'đã tìm bằng chứng về',
  },
  FRICTION: {
    n: 'Friction',
    r: null,
    d: 'Họ do dự hoặc gặp khó',
    say: 'đã do dự tại',
  },
  ACTION: {
    n: 'Action',
    r: 'CON',
    d: 'Họ cam kết một bước',
    say: 'đã hành động với',
  },
  CONVERSION: {
    n: 'Conversion',
    r: 'CON',
    d: 'Họ hoàn thành mục tiêu',
    say: 'đã chuyển đổi trên',
  },
};

/** Nhãn stage cho readout "Nuôi stage … của funnel". */
export const FUNNEL_STAGE_LABEL: Record<string, string> = {
  ATT: 'ATTENTION',
  EDU: 'EDUCATE',
  EXP: 'EXPLORE',
  TRU: 'TRUST',
  CON: 'CONVERT',
};

/** Type nào áp dụng được cho kind nào. */
export const TYPES_FOR: Record<SignalComponentKind, string[]> = {
  text: ['EXPOSURE', 'ENGAGEMENT', 'TRUST'],
  media: ['EXPOSURE', 'ENGAGEMENT', 'EXPLORATION', 'PREFERENCE', 'TRUST'],
  product: ['EXPOSURE', 'EXPLORATION', 'PREFERENCE', 'COMPARISON', 'ACTION'],
  button: ['ACTION', 'CONVERSION', 'FRICTION'],
};

/** Trigger events theo kind (mechanics — cái máy đo, không phải ý nghĩa). */
export const COMP_EVENTS: Record<SignalComponentKind, string[]> = {
  text: ['View', 'Dwell', 'Highlight'],
  button: ['Tap', 'Hover'],
  media: ['View', 'Play', 'Spin', 'Zoom', 'Dwell'],
  product: ['View', 'Tap', 'Add to cart'],
};

export const DEFAULT_EVENT: Record<SignalComponentKind, string> = {
  text: 'Dwell',
  button: 'Tap',
  media: 'View',
  product: 'Tap',
};

export const SIGNAL_OBJECTS: Record<string, string> = {
  product: 'Sản phẩm',
  variant: 'Biến thể',
  feature: 'Tính năng / claim',
  price: 'Giá / ưu đãi',
  content: 'Nội dung',
  none: 'Chính thành phần này',
};

export const STRENGTHS: Record<number, string> = {
  1: 'Yếu',
  2: 'Vừa',
  3: 'Mạnh',
};

export const CRM_ACTIONS: string[] = [
  'Chỉ đo lường, không làm gì',
  'Cộng +10 điểm intent',
  'Gắn tag hồ sơ',
  'Thêm vào audience re-engagement',
  'Báo cho sales',
  'Kích hoạt email',
];

export const PRIVACY: Record<string, { n: string; d: string }> = {
  anonymous: { n: 'Ẩn danh', d: 'Không lưu định danh nào' },
  pseudonymous: {
    n: 'Giả danh',
    d: 'Gắn với ID băm, không bao giờ gắn với một người',
  },
  identified: { n: 'Định danh', d: 'Cần consent · PII' },
};

export const DEFAULT_PRIVACY = 'pseudonymous';

export const BLOCK_SIGNALS: Record<string, { n: string; d: string }> = {
  dwell: { n: 'Thời gian dừng', d: 'Họ ở lại block này bao lâu' },
  scroll: { n: 'Độ sâu cuộn', d: 'Họ đi được bao xa trong block' },
  tap: { n: 'Chạm', d: 'Mọi tương tác bên trong block' },
  complete: { n: 'Hoàn thành', d: 'Họ đi tới cuối block' },
  exit: { n: 'Thoát', d: 'Họ rời trải nghiệm tại đây' },
};

/** Seed khi bật master toggle lần đầu — block "born untracked" cho tới lúc đó. */
export const DEFAULT_BLOCK_SIGNALS: Record<string, boolean> = {
  dwell: true,
  scroll: true,
  tap: true,
  complete: false,
  exit: false,
};

export const THRESHOLD_MIN = 1;
export const THRESHOLD_MAX = 30;

/**
 * Element nào của block đủ tư cách làm tracking point: mọi element registry
 * trừ layer nền và các surface trang trí (fill) — chúng không mang nội dung
 * để khai nghĩa.
 */
export function signalElementsOf(block: Block): LayerElement[] {
  const content =
    block.contentVi?.desktop ?? block.contentEn?.desktop ?? undefined;
  return elementsForType(
    block.blockType,
    content as Record<string, unknown> | undefined
  ).filter(el => {
    if (el.key === BACKGROUND_LAYER_KEY) return false;
    const kind = resolveElementMeta(block.blockType, el.key).kind;
    return kind !== 'background' && kind !== 'fill';
  });
}

/**
 * Map ElementKind (hàng chục kind cụ thể của canvas) → 4 bucket thô của
 * vocabulary. Free-form theo thiết kế: kind mới rơi về 'text'.
 */
export function coarseKindOf(
  block: Block,
  elementKey: string
): SignalComponentKind {
  const kind = resolveElementMeta(block.blockType, elementKey).kind;
  if (kind === 'image') return 'media';
  if (kind === 'link') return 'button';
  if (kind === 'text') return 'text';
  if (/product|coins|variant/i.test(kind)) return 'product';
  if (/image|gallery|slides|frames|media|scrim/i.test(kind)) return 'media';
  return 'text';
}

/**
 * Hoàn thiện config một tracking point với default của vocabulary — tương
 * đương `compSignal()` prototype nhưng PURE: trả object mới, không ghi vào
 * block. Caller (panel) quyết định khi nào persist.
 */
export function ensureComponentSignal(
  existing: ComponentSignalConfig | undefined,
  kind: SignalComponentKind
): ComponentSignalConfig {
  return {
    track: existing?.track ?? false,
    type: existing?.type ?? TYPES_FOR[kind][0],
    event: existing?.event ?? DEFAULT_EVENT[kind],
    object:
      existing?.object ??
      (kind === 'product' ? 'product' : kind === 'button' ? 'none' : 'content'),
    threshold: existing?.threshold ?? (kind === 'text' ? 3 : 1),
    strength: existing?.strength ?? 2,
    crm: existing?.crm ?? CRM_ACTIONS[0],
    privacy: existing?.privacy ?? DEFAULT_PRIVACY,
  };
}

/**
 * Câu nghĩa mà tracking point sẽ ghi vào intent graph. Nếu nó không đọc như
 * một việc con người đã làm thì nó chưa phải semantic.
 */
export function meaningFrom(
  cfg: ComponentSignalConfig,
  kind: SignalComponentKind,
  elementLabel: string
): string {
  const t = SIGNAL_TYPES[cfg.type ?? ''] ?? SIGNAL_TYPES.EXPOSURE;
  const obj =
    cfg.object === 'none' || !cfg.object
      ? elementLabel.toLowerCase()
      : (SIGNAL_OBJECTS[cfg.object] ?? 'nó').toLowerCase();
  const threshold = cfg.threshold ?? 1;
  const th =
    threshold > 1
      ? kind === 'text'
        ? ` từ ${threshold}s trở lên`
        : ` ${threshold}+ lần`
      : '';
  return `Khách hàng ${t.say} ${obj}${th}`;
}

export interface SignalCoverageSummary {
  blocks: number;
  trackedBlocks: number;
  comps: number;
  trackedComps: number;
  /** % COMPONENT được track — block coverage không mang thông tin. */
  pct: number;
}

export function blockSignalCoverage(blocks: Block[]): SignalCoverageSummary {
  let comps = 0;
  let trackedComps = 0;
  let trackedBlocks = 0;
  for (const b of blocks) {
    if (b.signal?.track === true) trackedBlocks += 1;
    for (const el of signalElementsOf(b)) {
      comps += 1;
      if (b.signal?.components?.[el.key]?.track) trackedComps += 1;
    }
  }
  return {
    blocks: blocks.length,
    trackedBlocks,
    comps,
    trackedComps,
    pct: comps ? Math.round((trackedComps / comps) * 100) : 0,
  };
}
